import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendEmail, isSmtpConfigured, CONTACT_EMAIL, SITE_URL } from '@/app/lib/email';
import { sanitizeInput, validateEmail } from '@/app/lib/sanitize';

// Auto-reply email for demo requests
function getDemoAutoReply(name: string, product: string): { html: string; text: string } {
  const text = `
Hi ${name},

Thank you for requesting a demo of ${product} from CraftsAI!

We have received your request and will be in touch shortly to schedule a personalized demo.

What happens next:
- Our team will review your request within 24 hours
- We will reach out to schedule a convenient time
- You will receive a personalized walkthrough of ${product}

If you have any urgent questions, feel free to reply to this email.

Best regards,
The CraftsAI Team
${SITE_URL}
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Demo Request Received</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .highlight { background: #f0f9ff; border-left: 4px solid #00E5FF; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .steps { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
        .step-number { background: #00E5FF; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { display: inline-block; background: linear-gradient(135deg, #00E5FF, #8B5CF6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Demo Request Received!</h1>
            <p>We are excited to show you what we can do</p>
        </div>
        <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for requesting a demo of <strong>${product}</strong>. We have received your request and will be in touch shortly.</p>

            <div class="highlight">
                <strong>Product:</strong> ${product}
            </div>

            <div class="steps">
                <h3 style="margin-top: 0;">What Happens Next:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div>Our team reviews your request within 24 hours</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div>We reach out to schedule a convenient time</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div>You receive a personalized walkthrough</div>
                </div>
            </div>

            <div class="cta">
                <a href="${SITE_URL}">Explore Our Services</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} CraftsAI. All rights reserved.</p>
            <p>AI-Powered Development Solutions</p>
        </div>
    </div>
</body>
</html>
  `;

  return { html, text };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 demo requests per 5 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`demo:${clientIP}`, { maxRequests: 3, windowMs: 5 * 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot spam check - if this field has a value, it's a bot
    if (body.website) {
      return NextResponse.json({
        success: true,
        message: 'Demo request received'
      });
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

    // Create admin notification email
    const subject = `New Demo Request: ${product} from ${name}`;
    const textContent = `
NEW DEMO REQUEST

Name: ${name}
Email: ${email}
Product: ${product}
Company: ${company || 'Not provided'}
Message: ${message || 'No message'}

Submitted at: ${new Date().toLocaleString()}
IP Address: ${clientIP}
User Agent: ${request.headers.get('user-agent') || 'Unknown'}
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Demo Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00E5FF, #8B5CF6); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { background: #f8f9fa; padding: 10px; border-left: 4px solid #00E5FF; margin-top: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Demo Request</h1>
            <p>Someone wants to see ${product} in action!</p>
        </div>

        <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
        </div>

        <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
        </div>

        <div class="field">
            <div class="label">Product:</div>
            <div class="value">${product}</div>
        </div>

        <div class="field">
            <div class="label">Company:</div>
            <div class="value">${company || 'Not provided'}</div>
        </div>

        <div class="field">
            <div class="label">Message:</div>
            <div class="value">${(message || 'No message').replace(/\n/g, '<br>')}</div>
        </div>

        <div class="footer">
            <p><strong>Submission Details:</strong></p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <p>IP: ${clientIP}</p>
            <p>User Agent: ${request.headers.get('user-agent') || 'Unknown'}</p>
        </div>
    </div>
</body>
</html>
    `;

    // Send emails if SMTP is configured
    if (isSmtpConfigured) {
      // Send admin notification
      const adminEmailResult = await sendEmail(CONTACT_EMAIL, subject, htmlContent, textContent);

      if (!adminEmailResult.success) {
        console.error('Admin email sending failed:', adminEmailResult.error);
      }

      // Send auto-reply to requester
      const autoReply = getDemoAutoReply(name, product);
      const clientEmailResult = await sendEmail(
        email,
        `Your Demo Request - ${product} | CraftsAI`,
        autoReply.html,
        autoReply.text
      );

      if (!clientEmailResult.success) {
        console.error('Client auto-reply failed:', clientEmailResult.error);
      }
    } else {
      // Do not log submission contents (PII).
      console.warn('Demo request: SMTP not configured — notification email skipped.');
    }

    // Persist the lead (fail-open) + alert the founder
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

    return NextResponse.json({
      success: true,
      message: 'Demo request received'
    });

  } catch (error) {
    console.error('Demo request error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting your demo request. Please try again.' },
      { status: 500 }
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
