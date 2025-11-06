# Troubleshooting Guide

## Profile Setup Issues

### Problem: "Complete Setup" button keeps refreshing the page

**Root Cause**: The database tables or RLS (Row Level Security) policies haven't been set up properly.

**Solution**:

1. **Run the database schema first** (if you haven't already):
   - Open Supabase Dashboard → SQL Editor
   - Run the script from `database/schema.sql`
   - Wait for it to complete

2. **Run the RLS fix script**:
   - Open Supabase Dashboard → SQL Editor
   - Run the script from `database/FIX-AUTH-ISSUES.sql`
   - This will reset all RLS policies

3. **Verify your user profile**:
   ```sql
   -- Check your profile in Supabase SQL Editor
   SELECT * FROM user_profiles WHERE email = 'your-email@example.com';
   ```

4. **If profile exists but onboarding_completed is false**:
   ```sql
   -- Manually complete onboarding
   UPDATE user_profiles 
   SET onboarding_completed = true 
   WHERE email = 'your-email@example.com';
   ```

5. **Try logging in again** - you should now be redirected to the dashboard

---

## Cannot Access Quiz, Simulator, or Admin Pages

### Problem: Redirected to login when trying to access protected pages

**Root Cause**: Authentication middleware is protecting these routes but session might not be properly established.

**Solution**:

1. **Clear your browser cookies**:
   - Open DevTools → Application → Cookies
   - Delete all cookies for your domain
   - Log out and log in again

2. **Verify you're logged in**:
   - After login, check that you can see `/dashboard`
   - If dashboard works but other pages don't, there's a middleware issue

3. **Check your user role** (for admin access):
   ```sql
   -- Check your role in Supabase
   SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
   ```

4. **Grant admin access** (if needed):
   ```sql
   -- Make yourself an admin
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

---

## Login/Signup Both Go to Same Page

**This is actually expected behavior!**

- **After signup**: You're redirected to `/profile-setup` to complete your profile
- **After login (if profile incomplete)**: Also redirected to `/profile-setup`
- **After login (if profile complete)**: Redirected to `/dashboard`

The system checks if `onboarding_completed = true` to determine where to send you.

---

## Assessment System Setup

### Running the Assessment Database Migration

Before you can use quizzes or interview simulator:

1. Open Supabase Dashboard → SQL Editor
2. Run `database/2025-12-03_assessments.sql`
3. This creates tables for:
   - Quizzes and quiz questions
   - Quiz attempts
   - Interview templates and sessions
   - Interview messages and feedback

---

## Quick Diagnostic Commands

Run these in Supabase SQL Editor to diagnose issues:

### Check if user profile exists
```sql
SELECT * FROM user_profiles WHERE email = 'YOUR_EMAIL';
```

### Check if RLS is enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%user%';
```

### Check existing RLS policies
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
```

### Test if you can insert/update your profile
```sql
-- This should work if RLS is set up correctly
UPDATE user_profiles 
SET updated_at = NOW() 
WHERE id = auth.uid();
```

---

## Common Errors and Fixes

### Error: "Not authenticated"
- Clear cookies and log in again
- Verify you're using the correct email/password
- Check if email confirmation is required (check Supabase Auth settings)

### Error: "Failed to update profile"
- Run `database/FIX-AUTH-ISSUES.sql`
- Verify RLS policies are enabled
- Check Supabase logs for detailed error messages

### Error: "Permission denied"
- RLS policies might be too restrictive
- Run the FIX-AUTH-ISSUES.sql script
- Verify the `is_admin()` function exists

### Blank page after "Complete Setup"
- Open browser console (F12) and check for JavaScript errors
- Check Network tab for failed API calls
- Verify Supabase environment variables in `.env.local`

---

## Environment Variables

Verify these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or your Vercel URL)
```

---

## Getting Help

If none of these solutions work:

1. Check the browser console for errors (F12 → Console)
2. Check Supabase logs (Dashboard → Logs)
3. Check Vercel deployment logs
4. Verify all database migrations have been run
5. Try creating a fresh user account to test

---

## Deployment Checklist

After deploying to Vercel:

- [ ] Database schema has been run (`schema.sql`)
- [ ] Assessment migration has been run (`2025-12-03_assessments.sql`)
- [ ] RLS policies have been applied (`FIX-AUTH-ISSUES.sql` if needed)
- [ ] Environment variables are set in Vercel
- [ ] At least one product exists in the database
- [ ] At least one admin user has been created
- [ ] Build completed successfully
- [ ] Can access the landing page
- [ ] Can sign up and complete profile setup
- [ ] Can access dashboard after login
- [ ] Can access quiz and interview pages
- [ ] Admin can access admin pages

