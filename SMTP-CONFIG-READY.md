# ✅ SMTP Configuration - Ready to Use

**Your Email Account:** `norepl@intimeesolutions.com`  
**Password:** `Sadhguru@108!`

---

## 🚀 Quick Configuration (Copy-Paste)

Go to: **Supabase Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**

Enable **Enable Custom SMTP** and paste:

### For Microsoft 365 / Office 365 (Most Likely):

```
SMTP Host: smtp.office365.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: Sadhguru@108!
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

### For Google Workspace (If you use Gmail):

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: norepl@intimeesolutions.com
SMTP Password: [Create App Password at myaccount.google.com/apppasswords]
Sender Email: norepl@intimeesolutions.com
Sender Name: InTime Solutions
```

---

## ⚡ Steps to Complete

1. **Determine Provider:**
   - Check where you access `norepl@intimeesolutions.com` email
   - Outlook/Office 365 → Use first config above
   - Gmail/Google → Use second config above

2. **Configure Supabase:**
   - Paste the settings above
   - Click **Save**
   - Wait for green checkmark ✅

3. **Clean Up Failed Invites:**
   ```sql
   DELETE FROM auth.users 
   WHERE email_confirmed_at IS NULL;
   ```

4. **Test:**
   - Go to **Authentication** → **Users** → **Invite User**
   - Enter any email address
   - Send invite
   - Check inbox!

---

## 🔍 If Connection Fails

### Try These:

1. **Check if 2FA is enabled:**
   - If yes → Create App Password (see guides)
   - If no → Regular password should work

2. **Try Different Port:**
   - Port `465` (SSL) instead of `587` (TLS)

3. **Check Email Provider:**
   - Contact your domain administrator
   - Ask: "What SMTP server does intimeesolutions.com use?"

4. **Verify Password:**
   - Make sure password is correct: `Sadhguru@108!`
   - Check for typos or extra spaces

---

## 📚 Full Guides

- **Quick Start:** `QUICK-START-SMTP.md`
- **Complete Guide:** `SMTP-COMPLETE-SETUP.md`
- **Technical Reference:** `SUPABASE-SMTP-SETUP.md`

---

**Ready?** Copy the settings above and paste into Supabase Dashboard! 🚀

