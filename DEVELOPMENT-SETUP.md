# Development Setup Guide 🛠️

## Email Verification Setup (IMPORTANT!)

For local development, you should **disable email confirmation** to avoid verification link issues.

---

## 🚀 Quick Fix: Disable Email Confirmation

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to: **Authentication** → **Providers** → **Email**

### Step 2: Disable Email Confirmation

Scroll down and find:
- **Enable email confirmations** toggle
- Turn it **OFF** (disable it)
- Click **Save**

### Step 3: Clean Up Existing Unconfirmed Users

Run this in **Supabase SQL Editor**:

```sql
-- Option A: Auto-confirm existing users
-- Note: confirmed_at is a GENERATED column, so only update email_confirmed_at
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Option B: Delete unconfirmed test users (to start fresh)
-- DELETE FROM auth.users WHERE email_confirmed_at IS NULL;
```

### Step 4: Test Signup Again

1. Go to `/signup`
2. Create a new account
3. **Expected:** Immediately logged in, redirected to `/profile-setup`
4. **No email verification needed!** ✅

---

## 🔐 Alternative: Use Confirmed Email Provider

If you want to test email verification:

### Option 1: Configure SMTP (Recommended for staging/production)

**📖 See detailed guide: `SUPABASE-SMTP-SETUP.md`**

Quick steps:
1. Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider:
   - **Outlook/Hotmail**: Use App Password (see `SUPABASE-SMTP-SETUP.md`)
   - **Resend**: Use API key (recommended for production)
3. Set **Site URL** to your deployed URL (e.g., `https://intimeesolutions.com`)
4. Set **Redirect URLs** to include: `https://intimeesolutions.com/**`

### Option 2: Use Supabase Email Service (Production)

For production, Supabase provides email service:
- Emails come from `noreply@mail.app.supabase.io`
- Rate limited (default: 3 emails per hour per user)
- Upgrade plan for higher limits

---

## 🧪 Testing Flow

### With Email Confirmation Disabled:

```
1. /signup → Fill form → Submit
   ↓
2. Account created (no email needed)
   ↓
3. Redirect to /profile-setup
   ↓
4. Complete profile (select product, persona)
   ↓
5. Redirect to /dashboard ✅
```

### With Email Confirmation Enabled:

```
1. /signup → Fill form → Submit
   ↓
2. "Check your email" message
   ↓
3. Click email link
   ↓
4. Redirect to /profile-setup
   ↓
5. Complete profile
   ↓
6. Redirect to /dashboard ✅
```

---

## 🐛 Common Issues

### Issue 1: "Email link is invalid or has expired"

**Cause:** Email confirmation is enabled but links are expiring

**Fix:**
```bash
# Disable email confirmation (see above)
# OR
# Configure proper Site URL in Supabase:
# Dashboard → Auth → Site URL = http://localhost:3000 (for dev)
```

### Issue 2: "Account already exists" but can't log in

**Cause:** User signed up but never confirmed email

**Fix:**
```sql
-- Find unconfirmed users
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- Confirm specific user (confirmed_at is auto-generated)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';

-- OR delete and recreate
DELETE FROM auth.users WHERE email = 'user@example.com';
```

### Issue 3: Duplicate profiles created

**Cause:** Trigger fired multiple times

**Fix:**
```sql
-- Check for duplicates
SELECT email, COUNT(*) 
FROM user_profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep oldest)
DELETE FROM user_profiles
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
    FROM user_profiles
  ) t
  WHERE t.rn > 1
);
```

---

## 📝 Recommended Development Settings

### Supabase Auth Settings:

| Setting | Development | Production |
|---------|-------------|------------|
| Email Confirmation | **OFF** ✅ | **ON** |
| Auto-confirm Email | **ON** ✅ | **OFF** |
| Secure Email Change | OFF | ON |
| Site URL | `http://localhost:3000` | `https://yourdomain.com` |
| Redirect URLs | `http://localhost:3000/**` | `https://yourdomain.com/**` |

### Environment Variables:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://jbusreaeuxzpjszuhvre.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Email confirmation is disabled in Supabase Dashboard
- [ ] Existing unconfirmed users are cleaned up
- [ ] Can sign up without email verification
- [ ] Signup redirects to `/profile-setup`
- [ ] Profile setup redirects to `/dashboard`
- [ ] Login works with new credentials
- [ ] No "Failed to create profile" errors
- [ ] No "Email link expired" errors

---

## 🚀 Quick Commands

```bash
# Check Supabase Auth status
supabase projects list

# View auth users (if using local Supabase)
supabase db dump --data-only --schema auth

# Reset auth (DANGER: deletes all users)
# TRUNCATE auth.users CASCADE;
```

---

## 📖 Related Documentation

- **SUPABASE-SMTP-SETUP.md** - Complete SMTP configuration guide (Outlook/Resend)
- **CLEANUP-FAILED-INVITES.sql** - Clean up failed user invites
- **SIGNUP-FIX-GUIDE.md** - Trigger and RLS setup
- **TROUBLESHOOTING.md** - Login and profile issues
- **FIX-EMAIL-VERIFICATION.sql** - SQL commands for email issues
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth

---

## 🎯 Summary

**For Development:**
1. ✅ Disable email confirmation
2. ✅ Clean up unconfirmed users
3. ✅ Test signup flow
4. ✅ Enjoy instant account creation!

**For Production:**
1. Enable email confirmation
2. Configure SMTP
3. Set proper Site URL and Redirect URLs
4. Test thoroughly before launch

