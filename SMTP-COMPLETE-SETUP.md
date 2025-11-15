# Complete SMTP Setup Guide - Step by Step

This guide will walk you through **everything** needed to get SMTP working with your email account.

---

## 🎯 Goal

Configure Supabase to send authentication emails from `norepl@intimeesolutions.com` using your email provider's SMTP.

---

## Step 1: Determine Email Provider & Get Credentials

**Email Account:** `norepl@intimeesolutions.com`  
**Password:** `Sadhguru@108!`

### Option A: Microsoft 365 / Office 365

1. **Go to Microsoft Account Security:**
   - Visit: https://account.microsoft.com/security
   - Sign in with: `norepl@intimeesolutions.com`

2. **Try App Password First (Recommended):**
   - Click **Advanced security options**
   - Under **App passwords**, click **Create a new app password**
   - Name it: `Supabase SMTP`
   - Click **Generate**
   - **COPY THE PASSWORD** (16 characters)

3. **If App Passwords Not Available:**
   - Enable Two-Factor Authentication first
   - Or use your regular password: `Sadhguru@108!`

### Option B: Google Workspace

1. **Go to Google App Passwords:**
   - Visit: https://myaccount.google.com/apppasswords
   - Sign in with: `norepl@intimeesolutions.com`

2. **Create App Password:**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter: `Supabase SMTP`
   - Click **Generate**
   - **COPY THE PASSWORD** (16 characters)

**⚠️ Try App Password first, but regular password may work too!**

---

## Step 2: Configure SMTP in Supabase Dashboard

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project (the one with errors)

2. **Navigate to SMTP Settings:**
   - Click **Project Settings** (gear icon in sidebar)
   - Click **Auth** in the left menu
   - Scroll down to **SMTP Settings** section

3. **Enable Custom SMTP:**
   - Toggle **Enable Custom SMTP** to **ON**

4. **Enter SMTP Configuration:**

   **For Microsoft 365 / Office 365:**
   ```
   SMTP Host: smtp.office365.com
   SMTP Port: 587
   SMTP User: norepl@intimeesolutions.com
   SMTP Password: Sadhguru@108! (or App Password if created)
   Sender Email: norepl@intimeesolutions.com
   Sender Name: InTime Solutions
   ```

   **For Google Workspace:**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: norepl@intimeesolutions.com
   SMTP Password: [App Password from Step 1]
   Sender Email: norepl@intimeesolutions.com
   Sender Name: InTime Solutions
   ```

5. **Save and Test:**
   - Click **Save** button
   - Wait for the connection test (should show green checkmark ✅)
   - If it fails, double-check:
     - App Password is correct (16 characters)
     - Email address matches exactly
     - Port is 587 (not 465)

---

## Step 3: Update Site URL and Redirect URLs

Still in **Auth** settings:

1. **Set Site URL:**
   - Scroll to **URL Configuration**
   - Set **Site URL** to: `https://intimeesolutions.com`
   - (Or your production URL)

2. **Add Redirect URLs:**
   - In **Redirect URLs** field, add:
     ```
     https://intimeesolutions.com/**
     http://localhost:3000/**
     ```
   - Click **Save**

---

## Step 4: Clean Up Failed Invites

1. **Open Supabase SQL Editor:**
   - In Supabase Dashboard, click **SQL Editor** in sidebar
   - Click **New query**

2. **Check Failed Invites:**
   ```sql
   -- See all unconfirmed users
   SELECT 
     id,
     email,
     email_confirmed_at,
     created_at,
     CASE 
       WHEN email_confirmed_at IS NULL THEN '❌ Unconfirmed (Failed)'
       ELSE '✅ Confirmed'
     END as status
   FROM auth.users
   WHERE email_confirmed_at IS NULL
   ORDER BY created_at DESC;
   ```

3. **Delete Failed Invites:**
   ```sql
   -- Delete all failed invites
   DELETE FROM auth.users 
   WHERE email_confirmed_at IS NULL;
   ```

4. **Run the query** (click **Run** button)

---

## Step 5: Test SMTP Configuration

### Option A: Test via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Invite User**
3. Enter: `norepl@intimeesolutions.com` (or any test email)
4. Click **Send Invite**
5. **Check your email inbox** (and spam folder)
6. You should receive the invite email ✅

### Option B: Test via Script

```bash
# Make sure you have .env.local with Supabase credentials
node scripts/test-smtp.js norepl@intimeesolutions.com
```

---

## Step 6: Verify Email Templates

Since you mentioned you already added templates:

1. **Check Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - Verify templates are configured:
     - **Confirm signup** - For new user signups
     - **Invite user** - For admin invites
     - **Magic Link** - For passwordless login
     - **Change Email Address** - For email changes
     - **Reset Password** - For password resets

2. **Customize Templates (Optional):**
   - Click on each template
   - Customize the subject and body
   - Use variables like `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc.
   - Click **Save**

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] App Password created and saved
- [ ] SMTP configured in Supabase Dashboard
- [ ] SMTP connection test passes (green checkmark)
- [ ] Site URL set to production URL
- [ ] Redirect URLs configured
- [ ] Failed invites cleaned up
- [ ] Test email received in inbox
- [ ] Email templates configured

---

## 🐛 Troubleshooting

### Issue: "SMTP connection failed"

**Solutions:**
1. ✅ Verify App Password is correct (16 characters, no spaces)
2. ✅ Check email address matches exactly: `s.nagolu@hotmail.com`
3. ✅ Ensure port is `587` (not 465 or 25)
4. ✅ Host is `smtp.office365.com` (not `smtp-mail.outlook.com`)
5. ✅ Two-factor authentication is enabled on Outlook account

### Issue: "Still getting rate limit errors"

**Solutions:**
1. Wait 1 hour after configuring SMTP (Supabase may cache old settings)
2. Check **Auth** → **Rate Limits** in Supabase Dashboard
3. Increase **Email Rate Limit** if needed

### Issue: "Emails not arriving"

**Solutions:**
1. Check spam/junk folder
2. Verify sender email matches SMTP user
3. Check Supabase logs: **Logs** → **Auth Logs**
4. Verify App Password hasn't expired (they don't expire, but check anyway)

### Issue: "Email link is invalid or expired"

**Solutions:**
1. Verify **Site URL** matches your production URL
2. Check **Redirect URLs** includes your domain with `/**`
3. Links expire after 1 hour by default (check email template settings)

---

## 🚀 Quick Commands

### Using the Helper Scripts

```bash
# Interactive SMTP setup guide
node scripts/setup-smtp.js

# Test SMTP configuration
node scripts/test-smtp.js s.nagolu@hotmail.com

# Clean up failed invites
node scripts/cleanup-failed-invites.js
# Or for specific email:
node scripts/cleanup-failed-invites.js s.nagolu@hotmail.com
```

---

## 📋 SMTP Settings Reference

**For Quick Copy-Paste (Microsoft 365):**

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

## 🎉 Success!

Once SMTP is working:

- ✅ New user signups will receive confirmation emails
- ✅ Password resets will work
- ✅ Admin invites will be delivered
- ✅ No more rate limit errors
- ✅ No more timeout errors

---

## 📚 Additional Resources

- **Supabase SMTP Docs**: https://supabase.com/docs/guides/auth/auth-smtp
- **Outlook App Passwords**: https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed5b-4263-e681-128a-a6f2979a7944
- **Email Templates Guide**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Need Help?** Check the logs in Supabase Dashboard → **Logs** → **Auth Logs** for detailed error messages.

