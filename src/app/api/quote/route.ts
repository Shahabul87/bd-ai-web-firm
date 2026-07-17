import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendAnnouncement } from '@/app/lib/notify';
import { sanitizeInput, validateEmail } from '@/app/lib/sanitize';
import {
  QUOTE_FIELD_CODES,
  QUOTE_SUCCESS,
  QUOTE_SUBMIT_FAILED,
  QUOTE_SERVER_ERROR,
  RATE_LIMITED_MINUTES,
  type QuoteField,
  type QuoteFieldCode,
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

    const projectDetails = body.projectDetails ?? {};
    const companyInfo = body.companyInfo ?? {};

    // Validate required fields (against raw values)
    const errors: Partial<Record<QuoteField, QuoteFieldCode>> = {};

    if (!Array.isArray(projectDetails.services) || projectDetails.services.length === 0) {
      errors.services = QUOTE_FIELD_CODES.services;
    }
    if (!projectDetails.projectType) {
      errors.projectType = QUOTE_FIELD_CODES.projectType;
    }
    if (!projectDetails.description || String(projectDetails.description).length < 20) {
      errors.description = QUOTE_FIELD_CODES.description;
    }
    if (!companyInfo.companyName) {
      errors.companyName = QUOTE_FIELD_CODES.companyName;
    }
    if (!companyInfo.contactName) {
      errors.contactName = QUOTE_FIELD_CODES.contactName;
    }
    if (!companyInfo.email || !validateEmail(String(companyInfo.email))) {
      errors.email = QUOTE_FIELD_CODES.email;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Sanitize every field before persisting/embedding.
    // (email passed validateEmail above, so it is safe to use verbatim.)
    const companyName = sanitizeInput(companyInfo.companyName, 200);
    const industry = sanitizeInput(companyInfo.industry, 100);
    const companySize = sanitizeInput(companyInfo.companySize, 100);
    const contactName = sanitizeInput(companyInfo.contactName, 100);
    const email = String(companyInfo.email);
    const phone = sanitizeInput(companyInfo.phone, 50);
    const preferredContact = sanitizeInput(companyInfo.preferredContact, 50);
    const projectType = sanitizeInput(projectDetails.projectType, 200);
    const complexity = sanitizeInput(projectDetails.complexity, 100);
    const timeline = sanitizeInput(projectDetails.timeline, 100);
    const budget = sanitizeInput(projectDetails.budget, 100);
    const description = sanitizeInput(projectDetails.description, 5000);
    const requirements = sanitizeInput(projectDetails.requirements, 5000);
    const specialRequirements = sanitizeInput(body.specialRequirements, 2000);

    // Map service IDs (from the quote form) to display names; sanitize any fallback.
    const serviceMap: Record<string, string> = {
      'web-development': 'Web Development',
      'android-development': 'Android Development',
      'ios-development': 'iOS Development',
      'product-inquiry': 'Product Inquiry',
    };
    const serviceNames: string[] = (projectDetails.services as unknown[]).map((serviceId) =>
      serviceMap[String(serviceId)] || sanitizeInput(serviceId, 100),
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
