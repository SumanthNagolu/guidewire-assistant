-- Debug profile setup issues
-- Run these queries to understand what's happening

-- 1. Check if user profile exists and its current state
-- Replace 'your-email@example.com' with your actual email
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  assumed_persona,
  preferred_product_id,
  onboarding_completed,
  created_at,
  updated_at
FROM user_profiles
WHERE email = 'your-email@example.com';  -- REPLACE WITH YOUR EMAIL

-- 2. Check if products exist (needed for preferred_product_id)
SELECT id, code, name
FROM products
ORDER BY code;

-- 3. Check current RLS policies on user_profiles
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 4. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Test if UPDATE works (replace with your actual user ID from query #1)
-- DO NOT RUN THIS YET - just check the syntax
-- UPDATE user_profiles
-- SET 
--   first_name = 'Test',
--   last_name = 'User',
--   assumed_persona = '3-5 years experience',
--   preferred_product_id = (SELECT id FROM products WHERE code = 'PC'),
--   onboarding_completed = true,
--   updated_at = NOW()
-- WHERE id = 'YOUR-USER-ID-HERE';

-- 6. Check auth.users to see if user is properly authenticated
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE email = 'your-email@example.com';  -- REPLACE WITH YOUR EMAIL

