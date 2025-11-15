# 📧 Microsoft 365/Outlook SMTP Setup Guide

## 🎯 Using Your Company Outlook Account

Since you have a Microsoft 365/Outlook account for your company, you can use it directly for SMTP! This is perfect because:
- ✅ No additional cost (already paid for)
- ✅ Professional sender address (`admin@intimesolutions.com`)
- ✅ Reliable Microsoft infrastructure
- ✅ No rate limits (within reason)

---

## ⚙️ Step 1: Get Your SMTP Settings

### Microsoft 365/Outlook SMTP Settings

**Host:**
```
smtp.office365.com
```
(For Outlook.com personal accounts, use `smtp-mail.outlook.com`)

**Port:**
```
587
```
(Use TLS encryption - recommended)

**Alternative Port:**
```
465
```
(Use SSL encryption - if 587 doesn't work)

**Username:**
```
admin@intimesolutions.com
```
(Your full email address)

**Password:**
```
[Your email password]
```
(Or App Password - see Step 2)

**Encryption:**
```
TLS (STARTTLS)
```
(For port 587)

---

## 🔐 Step 2: Create App Password (Recommended)

If you have **2-Factor Authentication (2FA)** enabled (which you should!), you'll need an **App Password** instead of your regular password.

### 2.1 Create App Password

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in with `admin@intimesolutions.com`
3. Go to **Security** → **Advanced security options**
4. Under **App passwords**, click **Create a new app password**
5. Name it: `Supabase SMTP`
6. Click **Generate**
7. **Copy the password** (you'll only see it once!)
   - It will look like: `abcd-efgh-ijkl-mnop`

**OR** if you're using Microsoft 365 Admin Center:

1. Go to [Microsoft 365 Admin Center](https://admin.microsoft.com/)
2. Go to **Users** → **Active users**
3. Click on your user (`admin@intimesolutions.com`)
4. Go to **Mail** tab
5. Click **Manage email apps**
6. Enable **Authenticated SMTP** (if not already enabled)
7. Create App Password from Security settings

### 2.2 Use App Password

- **Username:** `admin@intimesolutions.com`
- **Password:** `[The App Password you just created]`

---

## 📋 Step 3: Configure in Supabase

### 3.1 Navigate to SMTP Settings

1. Go to Supabase Dashboard
2. **Authentication** → **Emails** → **SMTP Settings** tab
3. Direct link: `https://supabase.com/dashboard/project/jbusreaeuxzpjszuhvre/auth/smtp`

### 3.2 Enable Custom SMTP

1. Toggle **"Enable custom SMTP"** to **ON** (green)

### 3.3 Fill in Sender Details

**Sender email address:**
```
admin@intimesolutions.com
```
(Must match your Outlook account)

**Sender name:**
```
InTime eSolutions
```
(Or whatever you want displayed)

### 3.4 Fill in SMTP Provider Settings

**Host:**
```
smtp.office365.com
```

**Port number:**
```
587
```

**Username:**
```
admin@intimesolutions.com
```
(Your full email address)

**Password:**
```
[Your Outlook password or App Password]
```
(Use App Password if you have 2FA enabled)

**Minimum interval per user:**
```
60
```
(seconds - prevents spam)

### 3.5 Save Settings

1. Click **"Save changes"** (green button)
2. Wait for confirmation
3. The warning should disappear!

---

## ✅ Step 4: Test Your Setup

### 4.1 Test via Signup

1. Go to your app: `/signup/student`
2. Sign up with a test email
3. Check inbox for confirmation email
4. Verify email comes from `admin@intimesolutions.com`

### 4.2 Check Email Logs

1. Check your Outlook **Sent Items** folder
2. Verify emails are being sent
3. Check Supabase logs: **Logs** → **Auth Logs**

---

## 🐛 Troubleshooting

### "Authentication failed" Error

**Problem:** Wrong username or password

**Solutions:**
1. ✅ Use **full email address** as username (not just `admin`)
2. ✅ If you have 2FA, use **App Password** (not regular password)
3. ✅ Check for extra spaces when copying
4. ✅ Verify password is correct
5. ✅ Try regenerating App Password

### "Connection timeout" Error

**Problem:** Can't connect to SMTP server

**Solutions:**
1. ✅ Verify host is `smtp.office365.com` (not `smtp.outlook.com`)
2. ✅ Try port `587` first, then `465` if needed
3. ✅ Check firewall isn't blocking port 587
4. ✅ Verify your network allows SMTP connections

### "Relay access denied" Error

**Problem:** SMTP relay not enabled for your account

**Solutions:**
1. ✅ Contact your IT admin to enable SMTP AUTH
2. ✅ Go to Microsoft 365 Admin Center
3. ✅ **Settings** → **Mail** → **POP and IMAP**
4. ✅ Enable **Authenticated SMTP**
5. ✅ Or enable via PowerShell (see below)

### Emails Not Sending

**Check:**
1. ✅ SMTP toggle is ON
2. ✅ All fields are filled correctly
3. ✅ Using App Password if 2FA is enabled
4. ✅ Port 587 with TLS (or 465 with SSL)
5. ✅ Host is `smtp.office365.com`
6. ✅ Sender email matches your Outlook account

---

## 🔧 Advanced: Enable SMTP AUTH via PowerShell

If SMTP AUTH is disabled, enable it:

```powershell
# Connect to Exchange Online
Connect-ExchangeOnline

# Enable SMTP AUTH for your user
Set-CASMailbox -Identity "admin@intimesolutions.com" -SmtpClientAuthenticationDisabled $false

# Or enable for all users
Get-CASMailbox | Set-CASMailbox -SmtpClientAuthenticationDisabled $false
```

---

## 📊 Port Comparison

| Port | Encryption | When to Use |
|------|------------|-------------|
| **587** | TLS (STARTTLS) | ✅ **Recommended** - Most compatible |
| **465** | SSL | Use if 587 doesn't work |
| **25** | None | ❌ Avoid - Often blocked |

---

## 🔒 Security Best Practices

### 1. Use App Passwords
- ✅ More secure than regular password
- ✅ Can be revoked individually
- ✅ Required if 2FA is enabled

### 2. Enable 2FA
- ✅ Protects your account
- ✅ Requires App Password (more secure)

### 3. Monitor Usage
- ✅ Check Sent Items regularly
- ✅ Monitor for unauthorized use
- ✅ Set up alerts for unusual activity

### 4. Rotate Passwords
- ✅ Change App Password every 90 days
- ✅ Use strong passwords
- ✅ Don't share passwords

---

## 📋 Quick Setup Checklist

- [ ] Got SMTP settings (host, port, username)
- [ ] Created App Password (if 2FA enabled)
- [ ] Enabled custom SMTP in Supabase
- [ ] Filled sender email (`admin@intimesolutions.com`)
- [ ] Filled sender name (`InTime eSolutions`)
- [ ] Filled host (`smtp.office365.com`)
- [ ] Filled port (`587`)
- [ ] Filled username (full email)
- [ ] Filled password (App Password if 2FA)
- [ ] Saved settings
- [ ] Tested signup flow
- [ ] Verified email received
- [ ] Checked email in Sent Items

---

## 💡 Pro Tips

1. **Use App Password** - More secure and required for 2FA
2. **Start with port 587** - Most compatible
3. **Test immediately** - Catch issues early
4. **Monitor Sent Items** - Verify emails are sending
5. **Keep App Password safe** - Store securely, don't share

---

## 🆚 Outlook vs SendGrid Comparison

| Feature | Outlook/M365 | SendGrid |
|---------|--------------|----------|
| **Cost** | ✅ Included | 💰 $19.95/month |
| **Setup** | ⭐⭐ Medium | ⭐⭐⭐ Easy |
| **Rate Limits** | ✅ High | ✅ Very High |
| **Deliverability** | ✅ Good | ✅ Excellent |
| **Best For** | Existing M365 users | High volume |

**Since you already have Outlook, use it!** No need to pay for SendGrid unless you need higher volume or better deliverability.

---

## 📚 Additional Resources

- [Microsoft 365 SMTP Settings](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353)
- [Create App Password](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944)
- [Enable SMTP AUTH](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission)

---

## ✅ Next Steps

Once SMTP is configured:

1. ✅ **Customize email templates** - See `docs/EMAIL-TEMPLATE-SETUP.md`
2. ✅ **Test signup flow** - Verify emails are sent
3. ✅ **Monitor email delivery** - Check Sent Items and logs
4. ✅ **Set up email templates** - Customize confirmation emails

---

**You're all set!** Your Outlook account is now configured for production email sending. 🎉

