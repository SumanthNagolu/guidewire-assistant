# 🧪 Email Flow Testing Guide

## Overview

This guide helps you test all 6 email flows to ensure everything works correctly.

---

## ✅ Pre-Testing Checklist

Before testing, verify:
- [ ] SMTP is configured and enabled
- [ ] Email templates are saved in Supabase
- [ ] Site URL is set correctly
- [ ] Redirect URLs are configured
- [ ] You have access to test email accounts

---

## 1️⃣ Test: Confirm Signup Flow

### Steps:
1. Go to: `/signup/student`
2. Fill out the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test.signup@example.com` (use a real email you can access)
   - Password: `Test123456!`
   - Phone: `1234567890` (optional)
3. Click **"Create Student Account"**

### Expected Results:
- ✅ Redirected to `/signup/student/confirmation` page
- ✅ Confirmation page shows "Thank You!" message
- ✅ Email received at `test.signup@example.com`
- ✅ Email subject: "Welcome to InTime eSolutions Academy! Confirm Your Email"
- ✅ Email has branded styling (indigo/purple gradient)
- ✅ Email contains confirmation button/link
- ✅ Clicking link redirects to `/auth/callback`
- ✅ After callback, redirected to `/profile-setup`

### Check Email:
- [ ] Email received (check inbox and spam)
- [ ] Email looks correct (branding, colors)
- [ ] Confirmation link works
- [ ] Link redirects correctly
- [ ] Profile setup page loads

---

## 2️⃣ Test: Invite User Flow

### Steps:
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Invite User"** (or use API)
3. Enter email: `test.invite@example.com`
4. Send invitation

### Expected Results:
- ✅ Email received at `test.invite@example.com`
- ✅ Email subject: "You've been invited to InTime eSolutions Academy"
- ✅ Email has invitation button/link
- ✅ Clicking link accepts invitation
- ✅ User can set password and complete setup

### Check Email:
- [ ] Email received
- [ ] Email looks correct
- [ ] Invitation link works
- [ ] User can complete signup

---

## 3️⃣ Test: Magic Link Flow

### Steps:
1. Go to: `/login`
2. Look for **"Sign in with Magic Link"** option
3. Enter email: `test.magiclink@example.com`
4. Click **"Send Magic Link"**

### Expected Results:
- ✅ Email received at `test.magiclink@example.com`
- ✅ Email subject: "Your InTime eSolutions Login Link"
- ✅ Email has sign-in button/link
- ✅ Link expires in 1 hour
- ✅ Clicking link signs user in
- ✅ Redirects to dashboard/academy

### Check Email:
- [ ] Email received
- [ ] Email looks correct
- [ ] Magic link works
- [ ] User is signed in after clicking

---

## 4️⃣ Test: Change Email Address Flow

### Steps:
1. Sign in to your account
2. Go to account settings/profile
3. Find **"Change Email"** option
4. Enter new email: `test.newemail@example.com`
5. Submit request

### Expected Results:
- ✅ Email received at `test.newemail@example.com`
- ✅ Email subject: "Confirm Your New Email Address - InTime eSolutions"
- ✅ Email has confirmation button/link
- ✅ Clicking link confirms new email
- ✅ Email address is updated in account

### Check Email:
- [ ] Email received at new address
- [ ] Email looks correct
- [ ] Confirmation link works
- [ ] Email address updated in account

---

## 5️⃣ Test: Reset Password Flow

### Steps:
1. Go to: `/login`
2. Click **"Forgot Password"** or **"Reset Password"**
3. Enter email: `test.reset@example.com`
4. Click **"Send Reset Link"**

### Expected Results:
- ✅ Email received at `test.reset@example.com`
- ✅ Email subject: "Reset Your Password - InTime eSolutions"
- ✅ Email has reset button/link
- ✅ Link expires in 1 hour
- ✅ Clicking link opens password reset form
- ✅ Can set new password successfully

### Check Email:
- [ ] Email received
- [ ] Email looks correct
- [ ] Reset link works
- [ ] Can reset password
- [ ] Can login with new password

---

## 6️⃣ Test: Reauthentication Flow

### Steps:
1. Sign in to your account
2. Try to perform a sensitive action (e.g., change password, delete account)
3. System should request reauthentication
4. Request reauthentication email

### Expected Results:
- ✅ Email received
- ✅ Email subject: "Confirm Reauthentication - InTime eSolutions"
- ✅ Email has confirmation button/link
- ✅ Link expires in 15 minutes
- ✅ Clicking link confirms identity
- ✅ Can complete sensitive action

### Check Email:
- [ ] Email received
- [ ] Email looks correct
- [ ] Reauthentication link works
- [ ] Can complete sensitive action

---

## 🐛 Troubleshooting

### Email Not Received

**Check:**
1. ✅ Check spam/junk folder
2. ✅ Verify email address is correct
3. ✅ Check SMTP settings are saved
4. ✅ Check Supabase logs: **Logs** → **Auth Logs**
5. ✅ Verify sender email is correct
6. ✅ Check SMTP provider logs (SendGrid/Outlook)

### Email Received But Link Doesn't Work

**Check:**
1. ✅ Verify Site URL is correct in Supabase
2. ✅ Check Redirect URLs include your domain
3. ✅ Ensure callback route exists: `/auth/callback`
4. ✅ Check link hasn't expired
5. ✅ Verify link is complete (not truncated)

### Email Looks Wrong

**Check:**
1. ✅ Verify template is saved in Supabase
2. ✅ Check HTML is correct (no broken tags)
3. ✅ Verify variables are correct (`{{ .ConfirmationURL }}`)
4. ✅ Test in different email clients
5. ✅ Check plain text version

### SMTP Errors

**Check:**
1. ✅ Verify SMTP credentials are correct
2. ✅ Check SMTP host and port
3. ✅ Verify App Password (if using Outlook)
4. ✅ Check SMTP provider status
5. ✅ Review error logs in Supabase

---

## 📊 Test Results Template

Copy this and fill it out:

```
Email Flow Testing Results
Date: ___________

1. Confirm Signup
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Redirects correctly: [ ] Yes [ ] No
   - Notes: _______________________

2. Invite User
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Notes: _______________________

3. Magic Link
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Notes: _______________________

4. Change Email
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Notes: _______________________

5. Reset Password
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Notes: _______________________

6. Reauthentication
   - Email received: [ ] Yes [ ] No
   - Link works: [ ] Yes [ ] No
   - Notes: _______________________

Overall Status: [ ] All Pass [ ] Some Issues [ ] Major Issues
```

---

## ✅ Success Criteria

All flows pass if:
- ✅ All emails are received
- ✅ All emails have correct branding
- ✅ All links work correctly
- ✅ All redirects work as expected
- ✅ No errors in logs
- ✅ User experience is smooth

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. ✅ Document any issues found
2. ✅ Fix any problems
3. ✅ Retest fixed flows
4. ✅ Update templates if needed
5. ✅ Monitor production usage

---

**Ready to test!** Start with the Confirm Signup flow and work through each one systematically. 🚀

