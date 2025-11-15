# 📧 SMTP Setup Guide - Production Ready

## ⚠️ Why You Need Custom SMTP

The built-in Supabase email service has:
- ❌ Rate limits (3 emails/hour per user)
- ❌ Not meant for production
- ❌ Generic sender address
- ❌ Limited customization

**Custom SMTP gives you:**
- ✅ No rate limits (based on your provider)
- ✅ Professional sender address (`admin@intimesolutions.com`)
- ✅ Full control over email delivery
- ✅ Better deliverability

---

## 🎯 Step 1: Choose Your SMTP Provider

### Option A: SendGrid (Recommended)
- **Free tier:** 100 emails/day
- **Paid:** $19.95/month for 50,000 emails
- **Pros:** Reliable, good deliverability, easy setup
- **Sign up:** https://sendgrid.com

### Option B: Mailgun
- **Free tier:** 5,000 emails/month (first 3 months)
- **Paid:** $35/month for 50,000 emails
- **Pros:** Developer-friendly, great API
- **Sign up:** https://mailgun.com

### Option C: AWS SES
- **Free tier:** 62,000 emails/month (if on EC2)
- **Paid:** $0.10 per 1,000 emails
- **Pros:** Very cheap, scalable
- **Sign up:** https://aws.amazon.com/ses

### Option D: Your Own Email Server
- Use your existing email server (if you have one)
- Requires server configuration
- **Pros:** Full control
- **Cons:** Requires maintenance

---

## 📋 Step 2: Set Up SendGrid (Recommended)

### 2.1 Create SendGrid Account

1. Go to https://sendgrid.com
2. Click **"Start for Free"**
3. Sign up with your email
4. Verify your email address

### 2.2 Create API Key

1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name it: `Supabase SMTP`
4. Select **"Full Access"** or **"Restricted Access"** → **"Mail Send"**
5. Click **"Create & View"**
6. **Copy the API key** (you'll need this!)

### 2.3 Verify Sender Domain (Important!)

1. Go to **Settings** → **Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Select your DNS provider (or "Other")
4. Add the DNS records to your domain:
   - Add CNAME records (SendGrid will show you exactly what to add)
   - Add MX records (if needed)
5. Wait for verification (can take up to 48 hours, usually faster)

**OR** (Quick Start - Single Sender):

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Enter: `admin@intimesolutions.com`
4. Fill in the form
5. Verify via email link
6. **Note:** Single sender has limitations, domain verification is better for production

---

## ⚙️ Step 3: Configure SMTP in Supabase

### 3.1 Navigate to SMTP Settings

1. Go to Supabase Dashboard
2. **Authentication** → **Emails** → **SMTP Settings** tab
3. Or direct link: `https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre/auth/smtp`

### 3.2 Enable Custom SMTP

1. Toggle **"Enable custom SMTP"** to **ON** (green)

### 3.3 Fill in Sender Details

**Sender email address:**
```
admin@intimesolutions.com
```

**Sender name:**
```
InTime eSolutions
```

### 3.4 Fill in SMTP Provider Settings

#### For SendGrid:

**Host:**
```
smtp.sendgrid.net
```

**Port number:**
```
587
```
(Use 465 for SSL, 587 for TLS - TLS is recommended)

**Username:**
```
apikey
```
(This is literally the word "apikey" - not your email!)

**Password:**
```
[Your SendGrid API Key from Step 2.2]
```
(Paste the API key you copied)

**Minimum interval per user:**
```
60
```
(seconds between emails to same user)

#### For Mailgun:

**Host:**
```
smtp.mailgun.org
```

**Port:**
```
587
```

**Username:**
```
postmaster@mg.intimesolutions.com
```
(Your Mailgun domain)

**Password:**
```
[Your Mailgun SMTP password]
```

#### For AWS SES:

**Host:**
```
email-smtp.us-east-1.amazonaws.com
```
(Replace `us-east-1` with your region)

**Port:**
```
587
```

**Username:**
```
[Your AWS SES SMTP username]
```

**Password:**
```
[Your AWS SES SMTP password]
```

### 3.5 Save Settings

1. Click **"Save changes"** (green button)
2. Wait for confirmation
3. Test by sending a test email (if available)

---

## ✅ Step 4: Test Your SMTP Setup

### 4.1 Test via Signup

1. Go to your app: `/signup/student`
2. Sign up with a test email
3. Check inbox for confirmation email
4. Verify email comes from `admin@intimesolutions.com`

### 4.2 Check Email Logs

1. In SendGrid/Mailgun dashboard, check **Activity** or **Logs**
2. Verify emails are being sent
3. Check for any errors

---

## 🐛 Troubleshooting

### "All fields must be filled" Error

**Problem:** Warning shows even after filling fields

**Solution:**
- Make sure **Sender email** is filled
- Make sure **Sender name** is filled
- Make sure all SMTP fields are filled
- Try refreshing the page
- Save again

### Emails Not Sending

**Check:**
1. ✅ SMTP toggle is ON
2. ✅ All fields are filled correctly
3. ✅ API key/password is correct (no extra spaces)
4. ✅ Port is correct (587 for TLS, 465 for SSL)
5. ✅ Host is correct
6. ✅ Sender email is verified in your provider

**Common Issues:**
- **Wrong username:** For SendGrid, use `apikey` (not your email)
- **Wrong port:** Use 587 for TLS (most common)
- **API key expired:** Regenerate in SendGrid
- **Domain not verified:** Complete domain verification

### Emails Going to Spam

**Solutions:**
1. Verify your domain (not just single sender)
2. Set up SPF records
3. Set up DKIM records
4. Set up DMARC records
5. Warm up your domain (send gradually increasing volumes)

---

## 📊 SMTP Provider Comparison

| Provider | Free Tier | Paid Tier | Setup Difficulty | Best For |
|----------|-----------|-----------|------------------|----------|
| **SendGrid** | 100/day | $19.95/50k | Easy ⭐⭐⭐ | Most users |
| **Mailgun** | 5k/month | $35/50k | Easy ⭐⭐⭐ | Developers |
| **AWS SES** | 62k/month* | $0.10/1k | Medium ⭐⭐ | High volume |
| **Resend** | 3k/month | $20/50k | Easy ⭐⭐⭐ | Modern apps |

*If on EC2, otherwise pay-as-you-go

---

## 🎯 Quick Setup Checklist

- [ ] Chosen SMTP provider
- [ ] Created account with provider
- [ ] Created API key/SMTP credentials
- [ ] Verified sender domain or email
- [ ] Enabled custom SMTP in Supabase
- [ ] Filled sender details
- [ ] Filled SMTP host, port, username, password
- [ ] Saved settings
- [ ] Tested signup flow
- [ ] Verified email received
- [ ] Checked email logs for errors

---

## 📚 Additional Resources

- [SendGrid Setup Guide](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Mailgun SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [AWS SES SMTP Setup](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 💡 Pro Tips

1. **Start with SendGrid** - Easiest to set up and most reliable
2. **Verify your domain** - Better deliverability than single sender
3. **Monitor your logs** - Check for bounces and spam reports
4. **Set up SPF/DKIM** - Prevents emails going to spam
5. **Test thoroughly** - Send test emails before going live

---

**Once SMTP is set up, you can customize your email templates!** See `docs/EMAIL-TEMPLATE-SETUP.md` for template customization.

