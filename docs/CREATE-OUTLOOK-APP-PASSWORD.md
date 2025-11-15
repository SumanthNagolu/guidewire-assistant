# 🔐 How to Create Outlook App Password

## 📍 Step-by-Step Instructions

### Method 1: From Security Info Page (You're Already There!)

Since you're on the Security Info page, follow these steps:

1. **On the Security Info page** (where you are now):
   - Scroll down or look for **"App passwords"** section
   - If you don't see it, you need to enable 2FA first (see below)

2. **If App Passwords section is visible:**
   - Click **"Create a new app password"** or **"+ Add"**
   - Name it: `Supabase SMTP`
   - Click **Generate** or **Create**
   - **Copy the password immediately** (you'll only see it once!)
   - It will look like: `abcd-efgh-ijkl-mnop`

### Method 2: Direct Link

1. Go directly to: https://account.microsoft.com/security/app-passwords
2. Or: https://mysignins.microsoft.com/security-info
3. Look for **"App passwords"** section
4. Click **"Create a new app password"**

### Method 3: Via Microsoft 365 Admin Center

1. Go to: https://admin.microsoft.com/
2. Click your profile icon (top right)
3. Click **"My account"**
4. Go to **"Security info"**
5. Find **"App passwords"** section
6. Click **"Create a new app password"**

---

## ⚠️ If You Don't See "App Passwords" Option

**This means 2FA is not enabled.** You need to enable it first:

### Enable 2FA First:

1. On the Security Info page, click **"+ Add sign-in method"**
2. Select **"App password"** or **"Authenticator app"**
3. Follow the setup wizard
4. Once 2FA is enabled, **App passwords** option will appear

**OR** if you don't want to enable 2FA:

- You can use your **regular email password** for SMTP
- But this is less secure
- App passwords are recommended for security

---

## 🔧 Using App Password in Supabase

Once you have the app password:

1. Go to Supabase Dashboard → **Authentication** → **Emails** → **SMTP Settings**

2. Fill in:
   - **Host:** `smtp.office365.com`
   - **Port:** `587`
   - **Username:** `admin@intimeesolutions.com` (your full email)
   - **Password:** `[Paste your App Password here]` (the one you just created)

3. Click **Save changes**

---

## 🐛 Troubleshooting Email Failures

### Common Issues:

#### 1. "Authentication failed" Error

**Causes:**
- Wrong password (using regular password instead of app password)
- Wrong username (not using full email address)
- 2FA enabled but not using app password

**Fix:**
- ✅ Use **App Password** (not regular password)
- ✅ Use **full email** as username: `admin@intimeesolutions.com`
- ✅ Copy password carefully (no extra spaces)

#### 2. "Connection timeout" Error

**Causes:**
- Wrong SMTP host
- Wrong port
- Firewall blocking

**Fix:**
- ✅ Host should be: `smtp.office365.com`
- ✅ Port should be: `587` (or try `465`)
- ✅ Check firewall settings

#### 3. "Relay access denied" Error

**Causes:**
- SMTP AUTH not enabled for your account
- Account restrictions

**Fix:**
- Contact your IT admin to enable SMTP AUTH
- Or enable via PowerShell (see below)

#### 4. "Email not sending" / No Error

**Check:**
- ✅ SMTP toggle is ON in Supabase
- ✅ All fields are filled
- ✅ Check Supabase logs: **Logs** → **Auth Logs**
- ✅ Check Outlook Sent Items folder
- ✅ Verify sender email matches your account

---

## 🔍 Quick Diagnostic Steps

### Step 1: Verify SMTP Settings

In Supabase SMTP Settings, verify:
- [ ] **Sender email:** `admin@intimeesolutions.com`
- [ ] **Host:** `smtp.office365.com`
- [ ] **Port:** `587`
- [ ] **Username:** `admin@intimeesolutions.com` (full email)
- [ ] **Password:** App Password (not regular password)

### Step 2: Test SMTP Connection

Try these settings:

**Option A: Port 587 (TLS)**
```
Host: smtp.office365.com
Port: 587
Encryption: TLS/STARTTLS
Username: admin@intimeesolutions.com
Password: [Your App Password]
```

**Option B: Port 465 (SSL)**
```
Host: smtp.office365.com
Port: 465
Encryption: SSL
Username: admin@intimeesolutions.com
Password: [Your App Password]
```

### Step 3: Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for SMTP errors
3. Check timestamps around when you tried to send

### Step 4: Check Outlook Settings

1. Verify your account is active
2. Check if there are any restrictions
3. Verify SMTP is enabled (may need IT admin)

---

## 💡 Alternative: Use Regular Password (If 2FA Not Enabled)

If you **don't have 2FA enabled** and don't want to enable it:

1. Use your **regular Outlook password** in Supabase SMTP settings
2. This works but is less secure
3. Recommended: Enable 2FA and use App Password

---

## 🔧 Enable SMTP AUTH via PowerShell (If Needed)

If you have admin access, run this:

```powershell
# Connect to Exchange Online
Connect-ExchangeOnline

# Enable SMTP AUTH for your user
Set-CASMailbox -Identity "admin@intimeesolutions.com" -SmtpClientAuthenticationDisabled $false
```

---

## ✅ Quick Checklist

- [ ] 2FA enabled (if you want to use App Password)
- [ ] App Password created
- [ ] App Password copied (saved securely)
- [ ] SMTP settings filled in Supabase
- [ ] Using full email as username
- [ ] Using App Password (not regular password)
- [ ] Port 587 selected
- [ ] SMTP toggle is ON
- [ ] Settings saved
- [ ] Test email sent
- [ ] Checked logs for errors

---

## 🆘 Still Not Working?

**Check these:**

1. **Verify App Password:**
   - Go back to Security Info
   - Create a NEW app password
   - Make sure you copy it correctly

2. **Try Different Port:**
   - Try port `465` instead of `587`
   - Or vice versa

3. **Check Account Status:**
   - Make sure your Outlook account is active
   - Check if there are any restrictions

4. **Contact IT Admin:**
   - May need to enable SMTP AUTH
   - May need to whitelist Supabase IPs

5. **Check Supabase Logs:**
   - Look for specific error messages
   - Share error details for more help

---

**Once you have the App Password, update Supabase SMTP settings and test again!** 🚀

