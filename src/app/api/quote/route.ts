import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendAnnouncement } from '@/app/lib/notify';
import { QuoteSchema, quoteFieldErrors } from '@/app/lib/formSchemas';
import {
  QUOTE_SUCCESS,
  QUOTE_SUBMIT_FAILED,
  QUOTE_SERVER_ERROR,
  RATE_LIMITED_MINUTES,
} from '@/app/lib/formErrors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 quote requests per 5 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`quote:${clientIP}`, { maxRequests: 3, windowMs: 5 * 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          code: RATE_LIMITED_MINUTES,
          retryMinutes: Math.ceil(rateLimit.resetIn / 60),
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Honeypot spam check
    if (body.website || body.fax || body.company_url) {
      return NextResponse.json({
        success: true,
        code: QUOTE_SUCCESS,
      });
    }

    // One shared contract with the wizard: normalizes (no HTML-escaping) and
    // validates in one pass. The nested objects are defaulted so a malformed
    // body still produces per-field errors the wizard can route to a step.
    const parsed = QuoteSchema.safeParse({
      projectDetails: body.projectDetails ?? {},
      companyInfo: body.companyInfo ?? {},
      specialRequirements: body.specialRequirements,
      agreedToTerms: body.agreedToTerms,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: quoteFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { projectDetails, companyInfo, specialRequirements } = parsed.data;
    const {
      projectType, complexity, timeline, budget, description, requirements,
    } = projectDetails;
    const {
      companyName, industry, companySize, contactName, email, phone, preferredContact,
    } = companyInfo;

    // Map service IDs (from the quote form) to display names.
    const serviceMap: Record<string, string> = {
      'web-development': 'Web Development',
      'android-development': 'Android Development',
      'ios-development': 'iOS Development',
      'product-inquiry': 'Product Inquiry',
    };
    const serviceNames: string[] = projectDetails.services.map(
      (serviceId) => serviceMap[serviceId] || serviceId,
    );

    // Persist the lead (retries transient errors) + alert the founder.
    const lead = await createLead({
      source: 'QUOTE',
      name: contactName,
      email,
      company: companyName || undefined,
      message: description || undefined,
      payload: {
        contactName, email, companyName, industry, companySize, phone, preferredContact,
        services: serviceNames, projectType, complexity, timeline, budget, description,
        requirements, specialRequirements,
      },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // Do not claim success if the lead was not persisted (founder is paged).
    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code: QUOTE_SUBMIT_FAILED,
        },
        { status: 503 },
      );
    }

    // Client auto-reply via notify-svc (fire-and-forget; never throws).
    void sendAnnouncement(
      email,
      'Your Quote Request — CraftsAI',
      `Hi ${contactName},\n\nThank you for requesting a quote for ${companyName}! We've received your project details${
        serviceNames.length ? ` (${serviceNames.join(', ')})` : ''
      } and will review your requirements and send a detailed proposal within 24 hours.\n\n— The CraftsAI Team`,
    );

    return NextResponse.json({
      success: true,
      code: QUOTE_SUCCESS,
      submissionId: lead.id,
    });
  } catch (error) {
    console.error('Quote form error:', error);
    return NextResponse.json(
      { success: false, code: QUOTE_SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
