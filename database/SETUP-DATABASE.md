# Complete Database Setup Guide

Follow these steps IN ORDER to set up your Guidewire Training Platform database.

---

## 📋 **Step 1: Run Main Schema**

This creates all tables, functions, and policies.

### Instructions:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. **Open the file** `database/schema.sql` from your project
6. **Copy ALL contents** of `schema.sql` and paste into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
8. Wait for completion - should see "Success"

✅ **This creates:**
- All tables (products, topics, user_profiles, etc.)
- Indexes for performance
- RLS policies (with the recursion issue)
- Helper functions

---

## 📋 **Step 2: Fix RLS Infinite Recursion**

Now that tables exist, we need to fix the RLS policy issue.

### Instructions:

1. Still in **SQL Editor**, click **"New Query"**
2. Copy and paste this SQL:

```sql
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view feedback" ON beta_feedback_entries;
DROP POLICY IF EXISTS "Admins can manage topics" ON topics;
DROP POLICY IF EXISTS "Admins can view all completions" ON topic_completions;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON quiz_attempts;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recreate policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view feedback" 
  ON beta_feedback_entries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage topics"
  ON topics FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all completions"
  ON topic_completions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (public.is_admin());
```

3. Click **"Run"**
4. Should see "Success. No rows returned"

✅ **This fixes:**
- Infinite recursion in RLS policies
- Admin access checks

---

## 📋 **Step 3: Seed Initial Products**

Add the three Guidewire products (ClaimCenter, PolicyCenter, BillingCenter).

### Instructions:

1. Still in **SQL Editor**, click **"New Query"**
2. Copy and paste this SQL:

```sql
-- Insert Guidewire Products
INSERT INTO products (code, name, description) VALUES
  ('CC', 'ClaimCenter', 'Claims management system for property and casualty insurance'),
  ('PC', 'PolicyCenter', 'Policy administration and underwriting platform'),
  ('BC', 'BillingCenter', 'Billing and payment processing system')
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT * FROM products ORDER BY code;
```

3. Click **"Run"**
4. Should see 3 rows returned (CC, PC, BC)

✅ **This creates:**
- Three Guidewire products available for learning

---

## 📋 **Step 4: Make Yourself an Admin (Optional)**

If you want admin access to manage topics and view analytics.

### Instructions:

1. First, **sign up** on your platform to create a user account
2. Go to **SQL Editor** again
3. Copy and paste this SQL (replace with YOUR email):

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
```

4. Click **"Run"**
5. Should see your profile with role = 'admin'

✅ **This gives you:**
- Access to `/admin` dashboard
- Ability to upload topics
- Analytics and user management

---

## 📋 **Step 5: Seed Sample Topics (Optional)**

Load 50 ClaimCenter topics to test with.

### Instructions:

**Option A: Via Admin UI** (Recommended)
1. Sign in to your platform
2. Go to `/admin/topics`
3. Click **"Load 50 ClaimCenter Topics"** button
4. Wait for "Topics imported successfully" message

**Option B: Via Command Line**
```bash
cd "/Users/sumanthrajkumarnagolu/Projects/guidewire-training platform"
npm run seed:claimcenter
```

✅ **This creates:**
- 50 sequential ClaimCenter topics
- Proper prerequisite chains
- Sample learning content

---

## 📋 **Step 6: Enable Assessments & Interviews**

Sprint 4 adds quizzes and the mock interview simulator. Apply the migration to create new tables and policies.

### Instructions:

1. Open **SQL Editor** in Supabase
2. Click **"New Query"**
3. Copy contents of `database/2025-12-03_assessments.sql`
4. Run the script
5. Confirm it finishes with "Success"

✅ **This creates:**
- `quizzes` table + links to existing quiz questions
- Interview templates, sessions, messages, and feedback tables
- Updated RLS policies using `public.is_admin()` helper

---

## ✅ **Verification Checklist**

After completing all steps:

- [ ] Can sign up / sign in successfully
- [ ] Can complete profile setup without errors
- [ ] Can access dashboard at `/dashboard`
- [ ] Can view topics at `/topics`
- [ ] (If admin) Can access `/admin`
- [ ] (If topics seeded) See ClaimCenter topics listed
- [ ] Quizzes/Interview pages load without database errors

---

## 🚨 **Troubleshooting**

### "relation does not exist"
- You didn't run Step 1 (schema.sql)
- Go back and run the complete schema.sql file

### "infinite recursion detected"
- You didn't run Step 2 (RLS fix)
- Run the RLS fix SQL from Step 2

### "No products available"
- You didn't run Step 3 (seed products)
- Run the products insert SQL from Step 3

### "Not authorized" or "Access denied"
- RLS policies might not be working
- Check that you're signed in
- Verify your user exists in user_profiles table

---

## 📝 **What's Next?**

After database setup:
1. Complete your profile setup
2. Explore the first available topic
3. Try the AI mentor
4. If admin: Upload custom topics or manage content

**Need help?** Check the main README.md or project documentation.

