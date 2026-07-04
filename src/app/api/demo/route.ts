import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendAnnouncement } from '@/app/lib/notify';
import { sanitizeInput, validateEmail } from '@/app/lib/sanitize';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 demo requests per 5 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`demo:${clientIP}`, { maxRequests: 3, windowMs: 5 * 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
        },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Honeypot spam check - if this field has a value, it's a bot
    if (body.website) {
      return NextResponse.json({ success: true, message: 'Demo request received' });
    }

    // Extract and sanitize form data
    const name = sanitizeInput(body.name, 100);
    const email = sanitizeInput(body.email, 100);
    const product = sanitizeInput(body.product, 200);
    const company = sanitizeInput(body.company || '', 200);
    const message = sanitizeInput(body.message || '', 2000);

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!email || !validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!product || product.length === 0) {
      errors.product = 'Product is required';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Persist the lead (fail-open) + alert the founder (via notify-svc).
    await createLead({
      source: 'DEMO',
      name,
      email,
      company: company || undefined,
      message: message || undefined,
      payload: { name, email, product, company, message },
      ip: clientIP,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // Client auto-reply via notify-svc (fire-and-forget; never throws).
    void sendAnnouncement(
      email,
      `Your Demo Request — ${product} | CraftsAI`,
      `Hi ${name},\n\nThank you for requesting a demo of ${product}! We've received your request and will be in touch shortly to schedule a personalized walkthrough.\n\n— The CraftsAI Team`,
    );

    return NextResponse.json({ success: true, message: 'Demo request received' });
  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting your demo request. Please try again.' },
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
