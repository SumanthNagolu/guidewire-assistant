# 📧 SMTP Setup - Complete Solution

This directory contains everything you need to configure SMTP for Supabase authentication emails.

---

## 🎯 What You Need

You're experiencing:
- ❌ **429: Email rate limit exceeded**
- ❌ **504: Request timeout**
- ❌ Failed user invites

**Solution:** Configure custom SMTP using your Outlook account.

---

## 📚 Documentation Files

### 1. **QUICK-START-SMTP.md** ⚡ START HERE
   - **5-minute quick setup guide**
   - Step-by-step instructions
   - Copy-paste ready settings

### 2. **SMTP-COMPLETE-SETUP.md** 📖 DETAILED GUIDE
   - Complete walkthrough
   - Troubleshooting section
   - Email template configuration
   - Verification checklist

### 3. **SUPABASE-SMTP-SETUP.md** 🔧 TECHNICAL REFERENCE
   - Both Outlook and Resend options
   - SMTP settings reference
   - Advanced configuration

---

## 🛠️ Helper Scripts

### Setup Script (Interactive)
```bash
npm run smtp:setup
# or
node scripts/setup-smtp.js
```
Guides you through App Password creation and SMTP configuration.

### Test Script
```bash
npm run smtp:test s.nagolu@hotmail.com
# or
node scripts/test-smtp.js s.nagolu@hotmail.com
```
Tests if SMTP is working by sending a test invite.

### Cleanup Script
```bash
npm run smtp:cleanup
# or
node scripts/cleanup-failed-invites.js
```
Removes failed user invites from the database.

---

## ⚡ Quick Start (5 Minutes)

1. **Get App Password:**
   - https://account.microsoft.com/security
   - Advanced security → App passwords → Create
   - Copy the 16-character password

2. **Configure Supabase:**
   - Dashboard → Project Settings → Auth → SMTP Settings
   - Enable Custom SMTP
   - Use settings from `QUICK-START-SMTP.md`

3. **Clean Up:**
   - Run SQL from `database/CLEANUP-FAILED-INVITES.sql`
   - Or use: `npm run smtp:cleanup`

4. **Test:**
   - Invite a user from Supabase Dashboard
   - Check email inbox!

---

## 📋 SMTP Settings (Copy-Paste Ready)

**Email Account:** `norepl@intimeesolutions.com`

**For Microsoft 365 / Office 365:**
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: Sadhguru@108!
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

**For Google Workspace:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: [App Password]
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

---

## ✅ Verification Checklist

After setup:

- [ ] App Password created (16 characters)
- [ ] SMTP configured in Supabase Dashboard
- [ ] Connection test passes (green ✅)
- [ ] Site URL set correctly
- [ ] Redirect URLs configured
- [ ] Failed invites cleaned up
- [ ] Test email received
- [ ] Email templates configured (you mentioned you already did this)

---

## 🐛 Common Issues

### "SMTP connection failed"
- ✅ Use App Password (not regular password)
- ✅ Port must be 587
- ✅ Host: `smtp.office365.com`

### "Still getting rate limit errors"
- Wait 1 hour (Supabase caches settings)
- Check Rate Limits in Auth settings

### "Emails not arriving"
- Check spam folder
- Verify App Password is correct
- Check Supabase Auth Logs

---

## 📞 Need Help?

1. Check **SMTP-COMPLETE-SETUP.md** for detailed troubleshooting
2. Review Supabase logs: Dashboard → Logs → Auth Logs
3. Verify email templates: Authentication → Email Templates

---

## 🎉 Success!

Once configured:
- ✅ No more rate limit errors
- ✅ No more timeout errors
- ✅ Emails sent from your Outlook account
- ✅ User invites work perfectly
- ✅ Password resets work
- ✅ Email confirmations work

---

**Ready to start?** Open `QUICK-START-SMTP.md` and follow the 5-minute guide! 🚀

