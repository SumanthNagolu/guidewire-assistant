# 🚀 Quick Start: Get SMTP Working NOW

**Follow these exact steps to get your Outlook SMTP working in 5 minutes:**

---

## ⚡ Step 1: Get App Password (2 minutes)

1. Go to: https://account.microsoft.com/security
2. Sign in with: `s.nagolu@hotmail.com`
3. Click **Advanced security options**
4. Under **App passwords**, click **Create a new app password**
5. Name: `Supabase SMTP`
6. **COPY THE PASSWORD** (16 characters)

---

## ⚡ Step 1B: Google Workspace Setup

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with: `norepl@intimeesolutions.com`
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter: `Supabase SMTP`
6. Click **Generate**
7. **COPY THE PASSWORD** (16 characters)

---

## ⚡ Step 2: Configure Supabase (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. **Project Settings** → **Auth** → **SMTP Settings**
4. Enable **Enable Custom SMTP**

### For Microsoft 365 / Office 365:
```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: [Your App Password or: Sadhguru@108!]
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

### For Google Workspace:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: [Your App Password from Step 1B]
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

5. Click **Save**
6. Wait for green checkmark ✅

**Note:** If App Password doesn't work, try your regular password: `Sadhguru@108!`

---

## ⚡ Step 3: Clean Up Failed Invites (1 minute)

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query:

```sql
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL;
```

---

## ✅ Test It!

1. Go to **Authentication** → **Users** → **Invite User**
2. Enter: `norepl@intimeesolutions.com` (or any test email)
3. Click **Send Invite**
4. Check your email inbox! 📧

---

## 🎉 Done!

Your SMTP is now working! All authentication emails will be sent from your Outlook account.

---

**Need more details?** See `SMTP-COMPLETE-SETUP.md` for troubleshooting and advanced configuration.

