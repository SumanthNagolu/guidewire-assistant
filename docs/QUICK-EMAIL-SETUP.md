# ⚡ Quick Email Template Setup (5 Minutes)

## 🎯 What You Need

✅ **Already Done:**
- SMTP configured (`admin@intimesolutions.com`)
- SMTP host, port, username, password set

📝 **What to Do Now:**
- Customize email template in Supabase Dashboard
- Set up URL redirects

---

## 📍 Step-by-Step Instructions

### 1. Go to Email Templates

**Direct Link:**
```
https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre/auth/templates
```

**Or Navigate:**
1. Open Supabase Dashboard
2. Click **Authentication** (left sidebar)
3. Click **Email Templates** (under CONFIGURATION)

---

### 2. Edit "Confirm Signup" Template

1. Find **"Confirm signup"** in the list
2. Click **Edit** or click on it
3. You'll see two tabs: **Subject** and **Body**

---

### 3. Update Subject Line

**Replace with:**
```
Welcome to InTime eSolutions Academy! Confirm Your Email
```

---

### 4. Update Email Body (HTML)

**Copy this entire template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { padding: 20px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to InTime eSolutions Academy! 🎓</h1>
  </div>
  <div class="content">
    <h2 style="color: #1f2937;">Hi there!</h2>
    <p>Thank you for joining the InTime eSolutions Academy! We're excited to have you on board.</p>
    <p>To complete your registration and start your Guidewire learning journey, please confirm your email address:</p>
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email Address</a>
    </div>
    <p style="font-size: 14px; color: #6b7280;">Or copy this link: <span style="word-break: break-all; font-size: 12px;">{{ .ConfirmationURL }}</span></p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0 0 10px 0;"><strong>What's next?</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Confirm your email (click button above)</li>
        <li>Complete your profile setup</li>
        <li>Start learning Guidewire!</li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <p><strong>InTime eSolutions</strong><br>Transform Your Career. Power Your Business.</p>
  </div>
</body>
</html>
```

**Paste it into the Body (HTML) field**

---

### 5. Update Plain Text Version (Optional)

**Copy this:**

```
Welcome to InTime eSolutions Academy!

Hi there!

Thank you for joining! To complete your registration, please confirm your email:

{{ .ConfirmationURL }}

What's next?
• Confirm your email
• Complete your profile setup  
• Start learning Guidewire!

---
InTime eSolutions
Transform Your Career. Power Your Business.
```

**Paste into Body (Plain Text) field**

---

### 6. Configure URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://intimesolutions.com` (or your domain)
3. Add **Redirect URLs**:
   ```
   https://intimesolutions.com/**
   http://localhost:3000/**
   ```

---

### 7. Save & Test

1. Click **Save** in the template editor
2. Go to your app: `/signup/student`
3. Sign up with a test email
4. Check inbox for your custom email!

---

## ✅ Quick Checklist

- [ ] Template subject updated
- [ ] Template HTML body updated  
- [ ] Template plain text updated (optional)
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Tested signup flow
- [ ] Email received
- [ ] Confirmation link works

---

## 🎨 Customize Further

### Change Colors
Replace `#667eea` and `#764ba2` with your brand colors

### Add Logo
Add before `<h1>` in header:
```html
<img src="https://intimesolutions.com/logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
```

### Change Button Text
Update the button text: `Confirm Your Email Address`

---

## 🐛 Troubleshooting

**Email not sending?**
- Check SMTP settings are saved
- Verify sender email is correct
- Check spam folder

**Link not working?**
- Verify Site URL is correct
- Check Redirect URLs include your domain
- Ensure callback route exists: `/auth/callback`

**Template not updating?**
- Wait 2-3 minutes
- Clear browser cache
- Test with new signup

---

**That's it!** Your custom email template is now live. 🎉

