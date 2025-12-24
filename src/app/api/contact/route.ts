import { NextRequest, NextResponse } from 'next/server';
import validator from 'validator';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';

// Email configuration
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@cognivat.com';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');

// Send email using nodemailer
async function sendEmail(to: string, subject: string, htmlContent: string, textContent: string) {
  try {
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Cognivat" <${SMTP_USER}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Sanitize and validate input
function sanitizeInput(input: string, maxLength: number = 1000): string {
  return validator.escape(input.trim()).slice(0, maxLength);
}

function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

// Auto-reply email template for clients
function getAutoReplyEmail(name: string): { html: string; text: string } {
  const text = `
Hi ${name},

Thank you for contacting Cognivat!

We have received your message and will get back to you within 24 hours.

In the meantime, feel free to explore our services at https://cognivat.com

Best regards,
The Cognivat Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank You for Contacting Us</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .message { background: #f0f9ff; border-left: 4px solid #00E5FF; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { display: inline-block; background: linear-gradient(135deg, #00E5FF, #8B5CF6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Reaching Out!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <div class="message">
                <p>We have received your message and appreciate you taking the time to contact us.</p>
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Our team will review your inquiry</li>
                    <li>We will respond within 24 hours</li>
                    <li>For urgent matters, call us directly</li>
                </ul>
            </div>
            <div class="cta">
                <a href="https://cognivat.com">Explore Our Services</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Cognivat. All rights reserved.</p>
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
    // Rate limiting: 5 requests per minute per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`contact:${clientIP}`, { maxRequests: 5, windowMs: 60 * 1000 });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${rateLimit.resetIn} seconds.`
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot spam check - if this field has a value, it's a bot
    if (body.website || body.url || body.company_website) {
      // Silently reject but return success to fool the bot
      console.log('🤖 Bot detected via honeypot:', clientIP);
      return NextResponse.json({
        success: true,
        message: 'Your message has been sent successfully!'
      });
    }

    // Extract and sanitize form data
    const name = sanitizeInput(body.name, 100);
    const email = sanitizeInput(body.email, 100);
    const message = sanitizeInput(body.message, 2000);

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email || !validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!message || message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Create admin notification email
    const subject = `New Contact Form Submission from ${name}`;
    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Message: ${message}

Submitted at: ${new Date().toLocaleString()}
IP Address: ${clientIP}
User Agent: ${request.headers.get('user-agent') || 'Unknown'}
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
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
            <h1>New Contact Form Submission</h1>
            <p>Someone is interested in your AI services!</p>
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
            <div class="label">Message:</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
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
    if (SMTP_USER && SMTP_PASSWORD) {
      // Send admin notification
      const adminEmailResult = await sendEmail(CONTACT_EMAIL, subject, htmlContent, textContent);

      if (!adminEmailResult.success) {
        console.error('Admin email sending failed:', adminEmailResult.error);
      }

      // Send auto-reply to client
      const autoReply = getAutoReplyEmail(name);
      const clientEmailResult = await sendEmail(
        email,
        'Thank you for contacting Cognivat!',
        autoReply.html,
        autoReply.text
      );

      if (!clientEmailResult.success) {
        console.error('Client auto-reply failed:', clientEmailResult.error);
      }
    } else {
      console.log('NEW CONTACT FORM SUBMISSION:');
      console.log(textContent);
      console.log('Email not sent - SMTP not configured.');
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while sending your message. Please try again.' },
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
