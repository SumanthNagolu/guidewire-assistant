# ⚡ Quick Email Testing Checklist

## 🎯 Test Each Flow

### ✅ Test 1: Confirm Signup Flow

**Steps:**
1. Go to: `http://localhost:3000/signup/student`
2. Fill form with test email (use a real email you can check)
3. Submit form
4. Check email inbox

**Expected:**
- [ ] Redirected to confirmation page
- [ ] Email received
- [ ] Email has correct branding
- [ ] Confirmation link works
- [ ] Redirects to `/profile-setup` after clicking link

**Test Email:** _______________________

---

### ✅ Test 2: Reset Password Flow

**Steps:**
1. Go to Supabase Dashboard → Authentication → Users
2. Find a test user
3. Click "..." → "Send Password Reset Email"
4. Check email inbox

**Expected:**
- [ ] Email received
- [ ] Email has correct branding
- [ ] Reset link works
- [ ] Can set new password

**Test Email:** _______________________

---

### ✅ Test 3: Magic Link Flow (if enabled)

**Steps:**
1. Check if magic link is enabled in Supabase
2. Use API or dashboard to send magic link
3. Check email inbox

**Expected:**
- [ ] Email received
- [ ] Email has correct branding
- [ ] Magic link works
- [ ] User is signed in

**Test Email:** _______________________

---

### ✅ Test 4: Invite User Flow

**Steps:**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite User"
3. Enter test email
4. Send invitation
5. Check email inbox

**Expected:**
- [ ] Email received
- [ ] Email has correct branding
- [ ] Invitation link works
- [ ] User can complete signup

**Test Email:** _______________________

---

## 📝 Notes

Write any issues or observations here:

_________________________________________________
_________________________________________________
_________________________________________________

---

## ✅ Final Status

- [ ] All emails received
- [ ] All links work
- [ ] All redirects work correctly
- [ ] Branding looks good
- [ ] Ready for production

