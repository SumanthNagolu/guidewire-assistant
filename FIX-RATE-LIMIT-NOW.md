# 🚨 Fix Rate Limit Error - Do This NOW

You're getting **429: email rate limit exceeded** - this means SMTP is either:
1. ❌ Not configured yet (still using Supabase default email)
2. ⏳ Just configured (needs time to switch over)
3. ⚠️ Configured but hitting rate limits

---

## ✅ Step 1: Verify SMTP is Configured

1. Go to: **https://supabase.com/dashboard**
2. Your project → **Project Settings** → **Auth** → **SMTP Settings**
3. Check: Is **"Enable Custom SMTP"** toggle **ON**?
   - ❌ If OFF → Turn it ON and configure (see Step 2)
   - ✅ If ON → Check if connection test shows green ✅

---

## ✅ Step 2: Configure SMTP (If Not Done)

If SMTP is not configured, paste these settings:

```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: Sadhguru@108!
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

**Click Save** and wait for green checkmark ✅

---

## ✅ Step 3: Increase Rate Limits

Even with custom SMTP, Supabase has rate limits. Increase them:

1. Still in **Auth** settings, scroll to **Rate Limits**
2. Find **Email Rate Limit** (emails per hour)
3. Increase it to **100** or higher
4. Click **Save**

---

## ✅ Step 4: Clean Up Failed Invite

Run this in **SQL Editor** (or use the file `database/CLEANUP-SPECIFIC-INVITE.sql`):

```sql
-- Delete the failed invite
DELETE FROM auth.users 
WHERE id = '538e2c27-a866-49a3-a413-2ed54d9742d4';

-- Verify it's deleted
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'sumanthsocial@gmail.com';
```

---

## ✅ Step 5: Wait & Retry

**Important:** After configuring SMTP:
- ⏳ Wait **5-10 minutes** for Supabase to switch to custom SMTP
- ⏳ Wait **1 hour** for rate limit to reset (if you hit limits)

Then try inviting again.

---

## ✅ Step 6: Verify It's Working

Run this command to test:

```bash
npm run smtp:verify sumanthsocial@gmail.com
```

**Expected results:**
- ✅ **Success** = SMTP is working!
- ⚠️ **Rate limit** = SMTP is working, just wait 1 hour
- ❌ **Timeout/Connection** = SMTP not configured correctly

---

## 🐛 If Still Getting Rate Limits

### Option A: Wait for Rate Limit Reset
- Rate limits reset after **1 hour**
- Check Supabase Dashboard → **Logs** → **Auth Logs** for exact reset time

### Option B: Use Different Email
- Try inviting a different email address
- Rate limits are per email address

### Option C: Check Rate Limit Settings
- Go to **Auth** → **Rate Limits**
- Make sure **Email Rate Limit** is high enough (100+)

---

## 📋 Quick Checklist

- [ ] SMTP is enabled in Supabase Dashboard
- [ ] SMTP connection test shows green ✅
- [ ] Rate limits increased to 100+
- [ ] Failed invite deleted
- [ ] Waited 5-10 minutes after configuring SMTP
- [ ] Tested with `npm run smtp:verify`

---

## 🎯 What the Error Means

**429: email rate limit exceeded** = You sent too many emails too quickly

**Solutions:**
1. ✅ Configure custom SMTP (bypasses default limits)
2. ✅ Increase rate limits in Supabase
3. ✅ Wait 1 hour for reset
4. ✅ Use different email addresses

---

**After doing all steps above, try inviting again!** 🚀

