import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendAnnouncement } from '@/app/lib/notify';
import { SITE_URL } from '@/app/lib/email';
import { sanitizeInput, validateEmail } from '@/app/lib/sanitize';
import {
  CONTACT_FIELD_CODES,
  CONTACT_SUCCESS,
  CONTACT_SUBMIT_FAILED,
  CONTACT_SERVER_ERROR,
  RATE_LIMITED_SECONDS,
  type ContactField,
  type ContactFieldCode,
} from '@/app/lib/formErrors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(`contact:${clientIP}`, { maxRequests: 5, windowMs: 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          code: RATE_LIMITED_SECONDS,
          retrySeconds: rateLimit.resetIn,
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Honeypot spam check - if this field has a value, it's a bot
    if (body.website || body.url || body.company_website) {
      // Silently reject but return success to fool the bot
      return NextResponse.json({
        success: true,
        code: CONTACT_SUCCESS,
      });
    }

    // Extract and sanitize form data
    const name = sanitizeInput(body.name, 100);
    const email = sanitizeInput(body.email, 100);
    const message = sanitizeInput(body.message, 2000);

    // Validate required fields
    const errors: Partial<Record<ContactField, ContactFieldCode>> = {};

    if (!name || name.length < 2) {
      errors.name = CONTACT_FIELD_CODES.name;
    }
    if (!email || !validateEmail(email)) {
      errors.email = CONTACT_FIELD_CODES.email;
    }
    if (!message || message.length < 10) {
      errors.message = CONTACT_FIELD_CODES.message;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Persist the lead (retries transient errors) + alert the founder.
    const lead = await createLead({
      source: 'CONTACT',
      name,
      email,
      message,
      payload: { name, email, message },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // Do not claim success if the lead was not persisted — the founder has been
    // paged (see createLead) and the visitor is told to retry.
    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code: CONTACT_SUBMIT_FAILED,
        },
        { status: 503 },
      );
    }

    // Client auto-reply via notify-svc (fire-and-forget; never throws).
    void sendAnnouncement(
      email,
      'Thank you for contacting CraftsAI!',
      `Hi ${name},\n\nThank you for contacting CraftsAI! We've received your message and will get back to you within 24 hours.\n\nIn the meantime, feel free to explore our work at ${SITE_URL}.\n\n— The CraftsAI Team`,
    );

    return NextResponse.json({
      success: true,
      code: CONTACT_SUCCESS,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, code: CONTACT_SERVER_ERROR },
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
