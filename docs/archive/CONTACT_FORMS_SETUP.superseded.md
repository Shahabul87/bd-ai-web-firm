> # ⚠️ SUPERSEDED — DO NOT FOLLOW
>
> **Archived 2026-07-17.** This guide describes an SMTP/Gmail email path
> (`SMTP_HOST`, `SMTP_USER`, app passwords) that **no longer exists in the code**.
> All transactional email now flows through notify-svc (`src/app/lib/notify.ts`);
> there is no SMTP transport, and setting these variables does nothing.
>
> Following this document would cost you an afternoon configuring settings the
> application never reads.
>
> **Current instructions:** `README.md` (setup), `.env.example` (real variables),
> `docs/runbooks/local-ci.md` (running the gate).
>
> Kept only as a record of how contact forms were originally wired.

---

# 📧 Contact Forms Setup Guide

Your contact forms are now fully functional! Here's how to complete the setup so people can actually contact you.

## ✅ What's Already Working

- **Contact Form** (`/components/ContactSection.tsx`) - Simple contact form
- **Quote Form** (`/quote` page) - Multi-step enterprise quote request form
- **API Endpoints** - Backend handlers for both forms
- **Validation & Security** - Input sanitization and validation
- **Error Handling** - Proper error messages and user feedback

## 🚀 Quick Setup (5 minutes)

### Step 1: Copy Environment File
```bash
cp .env.example .env.local
```

### Step 2: Configure Email Settings
Edit `.env.local` and add your email configuration:

```env
# Your email where messages will be sent
CONTACT_EMAIL=your-email@gmail.com

# Gmail SMTP settings (recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 3: Set Up Gmail App Password
1. Enable 2-factor authentication on your Gmail account
2. Go to [Google Account Settings > Security > App passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that password in `SMTP_PASSWORD` (not your regular Gmail password)

### Step 4: Restart Development Server
```bash
npm run dev
```

## 📧 How It Works

### Contact Form Submissions
- User fills out contact form
- Data gets validated and sanitized
- Email sent to your `CONTACT_EMAIL`
- Beautiful HTML email with all contact details

### Quote Request Submissions
- User completes 6-step quote wizard
- Comprehensive project details collected
- Professional quote request email sent
- All project requirements clearly formatted

## 🎯 What Emails Look Like

### Contact Form Email
- **Subject**: "New Contact Form Submission from [Name]"
- **Content**: Name, email, message, submission details
- **Format**: Beautiful HTML with your brand colors

### Quote Request Email
- **Subject**: "🚀 New Quote Request from [Company]"
- **Content**: Complete project details, company info, requirements
- **Format**: Professional layout with all specifications

## 🛟 Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

### Custom SMTP
Use your web hosting provider's SMTP settings.

## 🔧 Testing

### Test Contact Form
1. Go to your website
2. Scroll to contact section
3. Fill out and submit form
4. Check your email inbox

### Test Quote Form
1. Go to `/quote` page
2. Complete the 6-step wizard
3. Submit quote request
4. Check your email for detailed quote request

## 📝 Current Status

**✅ WORKING WITHOUT EMAIL SETUP:**
- Forms validate and process submissions
- Success/error messages show to users
- All submissions logged in console (check terminal)

**✅ WORKING WITH EMAIL SETUP:**
- Everything above PLUS
- Emails sent to your inbox
- Professional HTML formatting
- All contact details preserved

## 🚨 Troubleshooting

### "Email not sent - SMTP not configured"
- Check that `.env.local` exists
- Verify SMTP settings are correct
- Restart development server after changes

### Gmail "Authentication failed"
- Use App Password, not regular password
- Enable 2-factor authentication first
- Check username is full email address

### No emails received
- Check spam folder
- Verify `CONTACT_EMAIL` is correct
- Test SMTP settings with an email client

## 📊 Current Implementation Status

- ✅ Contact form functional
- ✅ Quote form functional  
- ✅ Input validation & sanitization
- ✅ Error handling
- ✅ Email templates (HTML + text)
- ✅ Security measures
- ✅ Console logging (fallback)
- ⏳ Email configuration needed

**Ready for production!** Just add your email settings and deploy.