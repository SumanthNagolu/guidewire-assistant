# 📧 Email Template Setup Guide

## Overview

This guide shows you how to customize Supabase email templates for the student signup confirmation flow. You already have SMTP configured, so we just need to customize the templates.

---

## 🎯 Step 1: Navigate to Email Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre
2. Navigate to: **Authentication** → **Email Templates**
3. You'll see templates for:
   - **Confirm signup** (Email confirmation)
   - **Magic Link**
   - **Change Email Address**
   - **Reset Password**
   - **Invite user**

---

## ✏️ Step 2: Customize "Confirm Signup" Template

Click on **"Confirm signup"** template. This is the email sent when students sign up.

### Available Variables

You can use these variables in your template:

- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Confirmation token (usually in the link)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation
- `{{ .ConfirmationURL }}` - Full confirmation link (use this!)

### Custom Template Example

Replace the default template with this custom one:

**Subject:**
```
Welcome to InTime eSolutions Academy! Confirm Your Email
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      padding: 20px 30px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to InTime eSolutions Academy! 🎓</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        Thank you for joining the InTime eSolutions Academy! We're excited to have you on board.
      </p>
      
      <p style="font-size: 16px; color: #4b5563;">
        To complete your registration and start your Guidewire learning journey, please confirm your email address by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">
          Confirm Your Email Address
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
        {{ .ConfirmationURL }}
      </p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0; font-size: 14px; color: #1f2937;">
          <strong>What's next?</strong>
        </p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #4b5563;">
          <li>Confirm your email (click the button above)</li>
          <li>Complete your profile setup</li>
          <li>Start learning Guidewire with our comprehensive courses</li>
          <li>Track your progress and earn certifications</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        If you didn't create an account with us, please ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">
        <strong>InTime eSolutions</strong><br>
        Transform Your Career. Power Your Business.<br>
        <a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a>
      </p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Welcome to InTime eSolutions Academy!

Hi there!

Thank you for joining the InTime eSolutions Academy! We're excited to have you on board.

To complete your registration and start your Guidewire learning journey, please confirm your email address by clicking the link below:

{{ .ConfirmationURL }}

What's next?
• Confirm your email (click the link above)
• Complete your profile setup
• Start learning Guidewire with our comprehensive courses
• Track your progress and earn certifications

If you didn't create an account with us, please ignore this email.

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 🔧 Step 3: Configure URL Settings

Make sure your URLs are configured correctly:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://intimesolutions.com` (or your production URL)
3. Add **Redirect URLs**:
   - `https://intimesolutions.com/**`
   - `http://localhost:3000/**` (for local development)

---

## ✅ Step 4: Test Your Template

1. **Save** your template in Supabase Dashboard
2. Go to your signup page: `/signup/student`
3. Fill out the form and submit
4. Check your email inbox (and spam folder)
5. You should see your custom template!

---

## 🎨 Customization Tips

### Change Colors
Update the gradient colors in the header:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Replace with your brand colors.

### Add Logo
Add your logo to the header:
```html
<div class="header">
  <img src="https://intimesolutions.com/logo.png" alt="InTime eSolutions" style="max-width: 200px; margin-bottom: 20px;">
  <h1>Welcome to InTime eSolutions Academy! 🎓</h1>
</div>
```

### Add Social Links
Add social media links in the footer:
```html
<div style="text-align: center; margin-top: 20px;">
  <a href="https://linkedin.com/company/intimesolutions" style="margin: 0 10px;">
    LinkedIn
  </a>
  <a href="https://twitter.com/intimesolutions" style="margin: 0 10px;">
    Twitter
  </a>
</div>
```

---

## 📋 Other Templates to Customize

### Magic Link Template
Used for passwordless login. Customize similarly with your branding.

### Reset Password Template
Used when users request password reset. Include:
- Clear instructions
- Security warning
- Link expiration notice

### Invite User Template
Used when admins invite users. Include:
- Who invited them
- What they're being invited to
- Clear call-to-action

---

## 🐛 Troubleshooting

### Emails Not Sending
1. Check SMTP settings are correct
2. Verify sender email is verified in your domain
3. Check spam folder
4. Review Supabase logs: **Logs** → **Auth Logs**

### Links Not Working
1. Verify **Site URL** is correct
2. Check **Redirect URLs** include your domain
3. Ensure `emailRedirectTo` in code matches your callback URL

### Template Not Updating
1. Clear browser cache
2. Wait a few minutes for changes to propagate
3. Test with a new signup

---

## 📚 Additional Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Variables Reference](https://supabase.com/docs/guides/auth/auth-email-templates#variables)

---

## ✅ Checklist

- [ ] SMTP configured (already done ✅)
- [ ] Custom "Confirm Signup" template created
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Template tested with signup
- [ ] Email received and link works
- [ ] Redirects to profile-setup page correctly

---

**Need Help?** Check Supabase Dashboard → **Support** or review the logs for any errors.

