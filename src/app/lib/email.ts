/**
 * Shared email/SMTP helper for the contact, demo, and quote API routes.
 * Centralizes SMTP config and the nodemailer send path so a change to
 * transport or credentials only happens in one place.
 */

export const SITE_URL = 'https://www.craftsai.org';

// Notifications are sent to CONTACT_EMAIL; defaults to the public .org inbox.
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@craftsai.org';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);

/** True only when SMTP credentials are present, so routes can skip sending gracefully. */
export const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASSWORD);

export type SendEmailResult =
  | { success: true; messageId?: string }
  | { success: false; error: string };

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
): Promise<SendEmailResult> {
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

    const result = await transporter.sendMail({
      from: `"CraftsAI" <${SMTP_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
