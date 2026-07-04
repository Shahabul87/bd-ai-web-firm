import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/utils/rateLimit';
import { createLead } from '@/app/lib/leads';
import { sendEmail, isSmtpConfigured, CONTACT_EMAIL, SITE_URL } from '@/app/lib/email';
import { sanitizeInput, validateEmail } from '@/app/lib/sanitize';

// Auto-reply email for quote requests
function getQuoteAutoReply(contactName: string, companyName: string, services: string[]): { html: string; text: string } {
  const text = `
Hi ${contactName},

Thank you for requesting a quote from CraftsAI!

We have received your project details for ${companyName} and are excited about the opportunity to work with you.

Services requested: ${services.join(', ')}

What happens next:
- Our team will review your requirements within 24 hours
- We will prepare a detailed proposal tailored to your needs
- You will receive a comprehensive quote with timeline and pricing

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
    <title>Quote Request Received</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .highlight { background: #f0f9ff; border-left: 4px solid #00E5FF; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .services { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }
        .service-tag { background: linear-gradient(135deg, #00E5FF, #8B5CF6); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; }
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
            <h1>Quote Request Received!</h1>
            <p>We are excited to work with you</p>
        </div>
        <div class="content">
            <p>Hi <strong>${contactName}</strong>,</p>
            <p>Thank you for requesting a quote for <strong>${companyName}</strong>. We have received your project details and are reviewing them now.</p>

            <div class="highlight">
                <strong>Services Requested:</strong>
                <div class="services">
                    ${services.map(s => `<span class="service-tag">${s}</span>`).join('')}
                </div>
            </div>

            <div class="steps">
                <h3 style="margin-top: 0;">What Happens Next:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div>Our team reviews your requirements within 24 hours</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div>We prepare a detailed proposal tailored to your needs</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div>You receive a comprehensive quote with timeline and pricing</div>
                </div>
            </div>

            <div class="cta">
                <a href="${SITE_URL}/portfolio">View Our Portfolio</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} CraftsAI. All rights reserved.</p>
            <p>AI Agent Development Studio</p>
        </div>
    </div>
</body>
</html>
  `;

  return { html, text };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 quote requests per 5 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`quote:${clientIP}`, { maxRequests: 3, windowMs: 5 * 60 * 1000 });

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

    // Honeypot spam check
    if (body.website || body.fax || body.company_url) {
      return NextResponse.json({
        success: true,
        message: 'Your quote request has been submitted successfully!'
      });
    }

    const projectDetails = body.projectDetails ?? {};
    const companyInfo = body.companyInfo ?? {};

    // Validate required fields (against raw values)
    const errors: Record<string, string> = {};

    if (!Array.isArray(projectDetails.services) || projectDetails.services.length === 0) {
      errors.services = 'Please select at least one service';
    }

    if (!projectDetails.projectType) {
      errors.projectType = 'Please specify your project type';
    }

    if (!projectDetails.description || String(projectDetails.description).length < 20) {
      errors.description = 'Please provide a detailed project description';
    }

    if (!companyInfo.companyName) {
      errors.companyName = 'Company name is required';
    }

    if (!companyInfo.contactName) {
      errors.contactName = 'Contact name is required';
    }

    if (!companyInfo.email || !validateEmail(String(companyInfo.email))) {
      errors.email = 'Valid email address is required';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // Sanitize every field before embedding it into email HTML/text or Sheets.
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
      serviceMap[String(serviceId)] || sanitizeInput(serviceId, 100)
    );

    // Create admin notification email
    const subject = `New Quote Request from ${companyName}`;

    const textContent = `
NEW QUOTE REQUEST

COMPANY INFORMATION:
Company: ${companyName}
Industry: ${industry || 'Not specified'}
Size: ${companySize || 'Not specified'}

CONTACT INFORMATION:
Name: ${contactName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Preferred Contact: ${preferredContact || 'Email'}

PROJECT DETAILS:
Services: ${serviceNames.join(', ')}
Project Type: ${projectType}
Complexity: ${complexity}
Timeline: ${timeline}
Investment Level: ${budget}

Project Description:
${description}

Technical Requirements:
${requirements || 'Not specified'}

Special Requirements:
${specialRequirements || 'None specified'}

SUBMISSION DETAILS:
Date: ${new Date().toLocaleString()}
IP: ${clientIP}
User Agent: ${request.headers.get('user-agent') || 'Unknown'}
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Quote Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00E5FF, #8B5CF6, #FF6D00); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center; }
        .section { background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #00E5FF; }
        .section-title { font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px; }
        .field { margin-bottom: 12px; display: flex; }
        .field-label { font-weight: bold; color: #4a5568; min-width: 140px; }
        .field-value { color: #2d3748; flex: 1; }
        .services { display: flex; flex-wrap: wrap; gap: 8px; }
        .service-tag { background: #00E5FF; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .long-text { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 8px; white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #718096; }
        .priority { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NEW QUOTE REQUEST</h1>
            <p>High-priority lead from CraftsAI website!</p>
        </div>

        <div class="priority">
            POTENTIAL CLIENT: ${companyName} (${industry || 'Industry not specified'})
        </div>

        <div class="section">
            <div class="section-title">Company Information</div>
            <div class="field">
                <div class="field-label">Company:</div>
                <div class="field-value">${companyName}</div>
            </div>
            <div class="field">
                <div class="field-label">Industry:</div>
                <div class="field-value">${industry || 'Not specified'}</div>
            </div>
            <div class="field">
                <div class="field-label">Company Size:</div>
                <div class="field-value">${companySize || 'Not specified'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${contactName}</div>
            </div>
            <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
                <div class="field-label">Phone:</div>
                <div class="field-value">${phone || 'Not provided'}</div>
            </div>
            <div class="field">
                <div class="field-label">Preferred Contact:</div>
                <div class="field-value">${preferredContact || 'Email'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Project Details</div>
            <div class="field">
                <div class="field-label">Services Needed:</div>
                <div class="field-value">
                    <div class="services">
                        ${serviceNames.map((service) => `<span class="service-tag">${service}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="field">
                <div class="field-label">Project Type:</div>
                <div class="field-value">${projectType}</div>
            </div>
            <div class="field">
                <div class="field-label">Complexity:</div>
                <div class="field-value">${complexity || 'Not specified'}</div>
            </div>
            <div class="field">
                <div class="field-label">Timeline:</div>
                <div class="field-value">${timeline || 'Not specified'}</div>
            </div>
            <div class="field">
                <div class="field-label">Investment Level:</div>
                <div class="field-value">${budget || 'Not specified'}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Project Description</div>
            <div class="long-text">${description}</div>
        </div>

        <div class="section">
            <div class="section-title">Technical Requirements</div>
            <div class="long-text">${requirements || 'Not specified'}</div>
        </div>

        ${specialRequirements ? `
        <div class="section">
            <div class="section-title">Special Requirements</div>
            <div class="long-text">${specialRequirements}</div>
        </div>
        ` : ''}

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

      // Send auto-reply to client
      const autoReply = getQuoteAutoReply(contactName, companyName, serviceNames);
      const clientEmailResult = await sendEmail(
        email,
        'Your Quote Request - CraftsAI',
        autoReply.html,
        autoReply.text
      );

      if (!clientEmailResult.success) {
        console.error('Client auto-reply failed:', clientEmailResult.error);
      }
    } else {
      // Do not log submission contents (PII).
      console.warn('Quote request: SMTP not configured — notification email skipped.');
    }

    // Persist the lead (fail-open) + alert the founder
    await createLead({
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

    return NextResponse.json({
      success: true,
      message: 'Your quote request has been submitted successfully! We\'ll review your requirements and contact you within 24 hours with a detailed proposal.'
    });

  } catch (error) {
    console.error('Quote form error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting your quote request. Please try again.' },
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
