# 📧 Complete Email Templates for All Categories

## Overview

This guide provides ready-to-use email templates for all Supabase email categories, branded for InTime eSolutions.

**Categories:**
1. ✅ Confirm signup
2. ✅ Invite user
3. ✅ Magic link
4. ✅ Change email address
5. ✅ Reset password
6. ✅ Reauthentication

---

## 🎨 Template Design

All templates use:
- **Brand colors:** Indigo/Purple gradient (`#667eea` to `#764ba2`)
- **Sender:** `admin@intimesolutions.com`
- **Brand name:** InTime eSolutions
- **Consistent styling:** Professional, clean, mobile-responsive

---

## 1️⃣ Confirm Signup Template

**When:** User signs up for an account

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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
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
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email Address</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="info-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1f2937;"><strong>What's next?</strong></p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
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
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
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

To complete your registration and start your Guidewire learning journey, please confirm your email address:

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

## 2️⃣ Invite User Template

**When:** Admin invites a new user to the platform

**Subject:**
```
You've been invited to InTime eSolutions Academy
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited! 🎉</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        You've been invited to join the <strong>InTime eSolutions Academy</strong>!
      </p>
      
      <p style="font-size: 16px; color: #4b5563;">
        We're excited to have you join our community of Guidewire professionals. Accept your invitation to get started:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="info-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1f2937;"><strong>What you'll get access to:</strong></p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li>Comprehensive Guidewire training courses</li>
          <li>Interactive learning materials</li>
          <li>Progress tracking and certifications</li>
          <li>AI-powered mentoring</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
You're Invited!

Hi there!

You've been invited to join the InTime eSolutions Academy!

We're excited to have you join our community of Guidewire professionals. Accept your invitation:

{{ .ConfirmationURL }}

What you'll get access to:
• Comprehensive Guidewire training courses
• Interactive learning materials
• Progress tracking and certifications
• AI-powered mentoring

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 3️⃣ Magic Link Template

**When:** User requests passwordless login via magic link

**Subject:**
```
Your InTime eSolutions Login Link
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .security-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Login Link 🔗</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        You requested a magic link to sign in to your InTime eSolutions account. Click the button below to sign in instantly:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Sign In to Your Account</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="security-box">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>🔒 Security Notice:</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
          This link will expire in 1 hour and can only be used once. If you didn't request this link, please ignore this email and consider changing your password.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        For security reasons, never share this link with anyone. Our team will never ask for your login link.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Your Login Link

Hi there!

You requested a magic link to sign in to your InTime eSolutions account. Click the link below to sign in instantly:

{{ .ConfirmationURL }}

🔒 Security Notice:
This link will expire in 1 hour and can only be used once. If you didn't request this link, please ignore this email and consider changing your password.

For security reasons, never share this link with anyone. Our team will never ask for your login link.

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 4️⃣ Change Email Address Template

**When:** User requests to change their email address

**Subject:**
```
Confirm Your New Email Address - InTime eSolutions
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .security-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirm Email Change 📧</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        You requested to change your email address for your InTime eSolutions account.
      </p>
      
      <p style="font-size: 16px; color: #4b5563;">
        To complete this change, please confirm your new email address by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email Address</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="security-box">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>🔒 Security Notice:</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
          This link will expire in 24 hours. If you didn't request to change your email address, please ignore this email and contact our support team immediately.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        After confirming, your account email will be updated and you'll receive future emails at your new address.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Confirm Email Change

Hi there!

You requested to change your email address for your InTime eSolutions account.

To complete this change, please confirm your new email address:

{{ .ConfirmationURL }}

🔒 Security Notice:
This link will expire in 24 hours. If you didn't request to change your email address, please ignore this email and contact our support team immediately.

After confirming, your account email will be updated and you'll receive future emails at your new address.

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 5️⃣ Reset Password Template

**When:** User requests password reset

**Subject:**
```
Reset Your Password - InTime eSolutions
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .security-box { background: #fee2e2; border: 1px solid #f87171; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password 🔐</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        We received a request to reset the password for your InTime eSolutions account.
      </p>
      
      <p style="font-size: 16px; color: #4b5563;">
        Click the button below to create a new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="security-box">
        <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>🔒 Security Notice:</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">
          This link will expire in 1 hour and can only be used once. If you didn't request a password reset, please ignore this email and contact our support team immediately. Your password will not be changed unless you click the link above.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Tips for a strong password:</strong>
      </p>
      <ul style="font-size: 14px; color: #4b5563;">
        <li>Use at least 8 characters</li>
        <li>Include uppercase and lowercase letters</li>
        <li>Include numbers and special characters</li>
        <li>Don't use personal information</li>
      </ul>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Reset Your Password

Hi there!

We received a request to reset the password for your InTime eSolutions account.

Click the link below to create a new password:

{{ .ConfirmationURL }}

🔒 Security Notice:
This link will expire in 1 hour and can only be used once. If you didn't request a password reset, please ignore this email and contact our support team immediately. Your password will not be changed unless you click the link above.

Tips for a strong password:
• Use at least 8 characters
• Include uppercase and lowercase letters
• Include numbers and special characters
• Don't use personal information

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 6️⃣ Reauthentication Template

**When:** User needs to re-authenticate for sensitive operations

**Subject:**
```
Confirm Reauthentication - InTime eSolutions
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    .security-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirm Your Identity 🔒</h1>
    </div>
    
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">Hi there!</h2>
      
      <p style="font-size: 16px; color: #4b5563;">
        For security reasons, we need to verify your identity before you can complete a sensitive action on your InTime eSolutions account.
      </p>
      
      <p style="font-size: 16px; color: #4b5563;">
        Please confirm your identity by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Identity</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:
      </p>
      <p class="link-text">{{ .ConfirmationURL }}</p>
      
      <div class="security-box">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>🔒 Security Notice:</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
          This link will expire in 15 minutes and can only be used once. If you didn't request this verification, please ignore this email and contact our support team immediately.
        </p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        This extra security step helps protect your account from unauthorized access.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.<br><a href="{{ .SiteURL }}" style="color: #667eea; text-decoration: none;">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Confirm Your Identity

Hi there!

For security reasons, we need to verify your identity before you can complete a sensitive action on your InTime eSolutions account.

Please confirm your identity:

{{ .ConfirmationURL }}

🔒 Security Notice:
This link will expire in 15 minutes and can only be used once. If you didn't request this verification, please ignore this email and contact our support team immediately.

This extra security step helps protect your account from unauthorized access.

---
InTime eSolutions
Transform Your Career. Power Your Business.
{{ .SiteURL }}
```

---

## 📋 Quick Setup Instructions

### Step 1: Go to Email Templates

1. Supabase Dashboard → **Authentication** → **Emails** → **Templates** tab
2. Direct link: `https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre/auth/templates`

### Step 2: Update Each Template

For each template category:

1. Click on the template name (e.g., "Confirm sign up")
2. **Subject:** Copy the subject line from above
3. **Body (HTML):** Copy the HTML template
4. **Body (Plain Text):** Copy the plain text version
5. Click **Save**

### Step 3: Test

1. Test each flow:
   - Sign up → Check confirmation email
   - Request password reset → Check reset email
   - Request magic link → Check magic link email
   - etc.

---

## ✅ Template Checklist

- [ ] Confirm signup template updated
- [ ] Invite user template updated
- [ ] Magic link template updated
- [ ] Change email address template updated
- [ ] Reset password template updated
- [ ] Reauthentication template updated
- [ ] All templates tested
- [ ] Emails received correctly
- [ ] Links work properly

---

## 🎨 Customization Tips

### Change Colors
Replace gradient colors in `.header` and `.button`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Change `#667eea` and `#764ba2` to your brand colors.

### Add Logo
Add before `<h1>` in header:
```html
<img src="https://intimesolutions.com/logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
```

### Change Button Text
Update button text in each template as needed.

---

## 📚 Available Variables

All templates can use:
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Token (usually in URL)
- `{{ .RedirectTo }}` - Redirect URL after action

---

**All templates are ready to use!** Just copy and paste into Supabase. 🎉

