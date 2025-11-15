# ✅ Verify Your SMTP Configuration

I can see your SMTP is configured! Let's verify everything is correct:

---

## ✅ What I See (Looks Good!)

- ✅ **Host:** `smtp.office365.com` ✓
- ✅ **Port:** `587` ✓
- ✅ **Sender Email:** `noreply@intimeesolutions.com` ✓
- ✅ **Sender Name:** `InTime eSolutions` ✓
- ✅ **Username:** `noreply@intimeesolutions.com` ✓
- ✅ **Password:** Configured (masked) ✓
- ✅ **Minimum Interval:** 60 seconds ✓

---

## ⚠️ Important Checks

### 1. Verify Password is Correct

The password field is masked, but make sure it's set to: `Sadhguru@108!`

**To verify:**
- Click the **eye icon** next to the password field (if available)
- Or clear the field and re-enter: `Sadhguru@108!`
- Click **Save** again

### 2. Check Connection Status

Look for a **green checkmark ✅** or "Connection successful" message after saving.

**If you see an error:**
- ❌ "Connection failed" → Password might be wrong
- ❌ "Authentication failed" → Try App Password instead
- ✅ "Connection successful" → You're good!

---

## 🚀 Next Steps

### Step 1: Increase Rate Limits

The "Minimum interval per user" (60 seconds) is different from the overall rate limit.

1. Scroll down in the **Auth** settings
2. Find **Rate Limits** section
3. Look for **"Email Rate Limit"** (emails per hour)
4. Increase it to **100** or higher
5. Click **Save**

### Step 2: Clean Up Failed Invite

Run this in **SQL Editor**:

```sql
DELETE FROM auth.users 
WHERE id = '538e2c27-a866-49a3-a413-2ed54d9742d4';
```

### Step 3: Wait 5-10 Minutes

After configuring SMTP, Supabase needs a few minutes to switch over from the default email service.

### Step 4: Test It!

Run this command:

```bash
npm run smtp:verify sumanthsocial@gmail.com
```

Or try inviting the user again from the Supabase Dashboard.

---

## 🐛 If Still Getting Rate Limit Errors

### Option 1: Wait for Rate Limit Reset
- Rate limits reset after **1 hour**
- Check **Logs** → **Auth Logs** for exact timing

### Option 2: Increase Rate Limits More
- Go to **Auth** → **Rate Limits**
- Set **Email Rate Limit** to **500** or higher
- This applies to custom SMTP too

### Option 3: Check Password
- If connection test fails, password might be wrong
- Try creating an App Password if 2FA is enabled:
  - https://account.microsoft.com/security
  - Advanced security → App passwords

---

## ✅ Configuration Checklist

- [ ] Password is correct: `Sadhguru@108!`
- [ ] Connection test shows green ✅
- [ ] Rate limits increased to 100+
- [ ] Waited 5-10 minutes after saving
- [ ] Failed invite cleaned up
- [ ] Tested with `npm run smtp:verify`

---

## 📧 Email Address Note

I see you're using `noreply@intimeesolutions.com` (not `norepl@`). That's fine! Just make sure:
- The email account exists
- Password is correct for that account
- You can log into that email account

---

**Your configuration looks correct!** The rate limit errors should stop once:
1. ✅ SMTP is properly connected (green checkmark)
2. ✅ Rate limits are increased
3. ✅ You wait a few minutes for Supabase to switch over

Try inviting again after completing the steps above! 🚀

