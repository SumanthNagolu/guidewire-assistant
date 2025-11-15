# Supabase SMTP Configuration Guide

## Problem Summary

You're experiencing:
- **429: Email rate limit exceeded** - Supabase's default email service has strict limits (3 emails/hour per user)
- **504: Request timeout** - SMTP connection issues with Outlook

## Solution: Configure Custom SMTP in Supabase

---

## Option 1: Configure Microsoft 365 / Office 365 SMTP

**Email Account:** `norepl@intimeesolutions.com`  
**Password:** `Sadhguru@108!`

### Step 1: Get SMTP Credentials

**Option A: Try App Password (Recommended if 2FA enabled)**

1. Go to: https://account.microsoft.com/security
2. Sign in with: `norepl@intimeesolutions.com`
3. Navigate to **Security** → **Advanced security options**
4. Under **App passwords**, click **Create a new app password**
5. Name it: `Supabase SMTP`
6. **Copy the generated password** (16 characters)

**Option B: Use Regular Password**

If App Passwords are not available, you can try using your regular password: `Sadhguru@108!`

### Step 2: Configure SMTP in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to: **Project Settings** → **Auth** → **SMTP Settings**
3. Enable **Enable Custom SMTP**
4. Fill in the following settings:

```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: Sadhguru@108! (or App Password if created)
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

5. Click **Save**

### Step 3: Verify SMTP Connection

1. After saving, Supabase will test the connection
2. If successful, you'll see a green checkmark ✅
3. If it fails, check:
   - App Password is correct (not your regular password)
   - Email address matches exactly
   - Port is 587 (not 465 or 25)

### Step 4: Update Site URL and Redirect URLs

1. Still in **Auth** settings, scroll to **URL Configuration**
2. Set **Site URL** to: `https://intimeesolutions.com` (or your production URL)
3. Add to **Redirect URLs**:
   ```
   https://intimeesolutions.com/**
   http://localhost:3000/**
   ```

---

## Option 2: Use Resend (Better for Production)

Resend is already configured in your codebase and offers better deliverability.

### Step 1: Get Resend SMTP Credentials

1. Go to: https://resend.com/api-keys
2. Create an API key if you don't have one
3. Go to: https://resend.com/domains
4. Add your domain: `intimesolutions.com` (or use Resend's test domain)
5. Verify your domain (follow DNS instructions)
6. Once verified, go to **SMTP** tab
7. Copy your SMTP credentials:
   - Host: `smtp.resend.com`
   - Port: `587` or `465`
   - Username: `resend`
   - Password: `[Your Resend API Key]`

### Step 2: Configure in Supabase

1. Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Enable Custom SMTP**
3. Fill in:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@intimesolutions.com (or your verified domain)
Sender Name: InTime Solutions
```

4. Click **Save**

---

## Clean Up Failed User Invites

After configuring SMTP, clean up the failed invites:

### Step 1: Check Failed Invites

Run this in **Supabase SQL Editor**:

```sql
-- Check unconfirmed users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
    ELSE 'Confirmed'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

### Step 2: Delete Failed Invites

```sql
-- Delete all failed/unconfirmed invites
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL;
```

### Step 3: Test New Invite

After SMTP is configured, try inviting the user again from your application.

---

## Troubleshooting

### Issue: "SMTP connection failed"

**For Outlook:**
- ✅ Use App Password, not regular password
- ✅ Use port 587 (TLS)
- ✅ Host: `smtp.office365.com` (for Outlook/Hotmail accounts)

**For Resend:**
- ✅ Use your API key as password
- ✅ Username is always `resend`
- ✅ Verify your domain first

### Issue: "Still getting rate limit errors"

1. Wait 1 hour after configuring SMTP
2. Supabase may cache the old email service
3. Try again after the cache clears

### Issue: "Emails not arriving"

1. Check spam folder
2. Verify sender email matches your SMTP user
3. For Outlook: Check if App Password is still valid
4. For Resend: Check domain verification status

---

## Recommended Settings

### Development (Local)
- **Email Confirmation**: OFF
- **SMTP**: Not required
- **Site URL**: `http://localhost:3000`

### Production
- **Email Confirmation**: ON
- **SMTP**: Resend (Option 2) ✅ Recommended
- **Site URL**: `https://intimeesolutions.com`
- **Redirect URLs**: `https://intimeesolutions.com/**`

---

## Quick Checklist

- [ ] Created App Password (Outlook) or API Key (Resend)
- [ ] Configured SMTP in Supabase Dashboard
- [ ] Verified SMTP connection test passes
- [ ] Updated Site URL and Redirect URLs
- [ ] Cleaned up failed user invites
- [ ] Tested new user invite
- [ ] Verified email arrives in inbox (not spam)

---

## Next Steps

1. **Immediate**: Configure SMTP using Option 1 (Outlook) or Option 2 (Resend)
2. **Clean up**: Delete failed invites using SQL above
3. **Test**: Try inviting a user again
4. **Monitor**: Check Supabase logs for any remaining errors

---

## Additional Resources

- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend SMTP Setup](https://resend.com/docs/send-with-smtp)
- [Outlook App Passwords](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed5b-4263-e681-128a-a6f2979a7944)

