# 🚀 DO THIS NOW - 3 Simple Steps

**I can't do it for you** (Supabase doesn't allow API access for SMTP settings), but I'll make it **super easy** - just 3 steps!

---

## ⚡ Step 1: Open Supabase Dashboard (30 seconds)

1. Go to: **https://supabase.com/dashboard**
2. Click on your project
3. Click **Project Settings** (gear icon in sidebar)
4. Click **Auth** in the left menu
5. Scroll down to **SMTP Settings**

---

## ⚡ Step 2: Paste These Settings (1 minute)

1. Toggle **Enable Custom SMTP** to **ON**

2. Copy and paste these **exact** settings:

```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: Sadhguru@108!
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

3. Click **Save** button at the bottom

4. **Wait for green checkmark ✅** (connection test)

---

## ⚡ Step 3: Clean Up & Test (1 minute)

### Clean Up Failed Invites:

1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Paste this:

```sql
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL;
```

4. Click **Run**

### Test It:

1. Click **Authentication** → **Users** in sidebar
2. Click **Invite User** button
3. Enter: `norepl@intimeesolutions.com`
4. Click **Send Invite**
5. Check your email inbox! 📧

---

## ✅ That's It!

**Total time: ~3 minutes**

If you see the green checkmark ✅ after Step 2, you're done! SMTP is working.

---

## 🐛 If It Fails

**Connection test fails?**
- Double-check password: `Sadhguru@108!`
- Make sure there are no extra spaces
- Try port `465` instead of `587`

**Still not working?**
- Check if 2FA is enabled on the email account
- If yes, create an App Password (see `SMTP-COMPLETE-SETUP.md`)

---

**Need help?** Run this to verify after setup:
```bash
npm run smtp:test norepl@intimeesolutions.com
```

