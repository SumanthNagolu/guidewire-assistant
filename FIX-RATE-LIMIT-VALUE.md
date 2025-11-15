# 🚨 Fix Rate Limit - Change This NOW!

I can see your **Email Rate Limit is set to 1 per hour** - that's way too low!

---

## ⚡ Quick Fix

### Step 1: Increase Email Rate Limit

In the screenshot, I can see:
- **Email Rate Limit:** `1` per hour ❌ (TOO LOW!)
- **Minimum interval per user:** `60` seconds ✅ (This is fine)

**Change it to:**

1. Click on the **Email Rate Limit** field
2. Change `1` to `100` (or higher)
3. Click **Save**

---

## ✅ Recommended Settings

For production use, set:

```
Email Rate Limit: 100 per hour
Minimum interval per user: 60 seconds
```

Or even higher if you expect lots of signups:

```
Email Rate Limit: 500 per hour
Minimum interval per user: 60 seconds
```

---

## 🎯 Why This Fixes It

- **Current:** Only 1 email per hour total (across ALL users)
- **After fix:** 100+ emails per hour (plenty for normal usage)
- **Minimum interval:** Still prevents spam (60 seconds between emails to same user)

---

## ✅ After Changing

1. **Save** the settings
2. **Wait 1 minute** for changes to apply
3. **Try inviting again** - should work now!

---

## 📋 What Each Setting Does

- **Email Rate Limit (1/hour):** Total emails your project can send per hour
  - ❌ Too low = Rate limit errors
  - ✅ Set to 100+ for normal usage

- **Minimum interval per user (60 seconds):** Time between emails to same email address
  - ✅ This prevents spam - keep it at 60 seconds

---

**Change Email Rate Limit from `1` to `100` and save!** That should fix your rate limit errors! 🚀

