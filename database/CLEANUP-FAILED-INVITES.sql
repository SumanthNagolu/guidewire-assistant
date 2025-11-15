-- Clean up failed user invites due to SMTP/rate limit issues
-- Run this AFTER configuring SMTP in Supabase Dashboard

-- ========================================
-- STEP 1: Check Failed Invites
-- ========================================
-- View all unconfirmed users (failed invites)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Unconfirmed (Failed)'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ========================================
-- STEP 2: Check Specific Email (Optional)
-- ========================================
-- Replace 'norepl@intimeesolutions.com' with your test email
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  COUNT(*) OVER (PARTITION BY email) as duplicate_count
FROM auth.users
WHERE email = 'norepl@intimeesolutions.com'
ORDER BY created_at DESC;

-- ========================================
-- STEP 3: Delete Failed Invites for Specific Email (Optional)
-- ========================================
-- CAUTION: This will delete ALL unconfirmed invites for this email
-- Only run this if you're sure you want to remove them
-- Replace 'norepl@intimeesolutions.com' with your test email

-- Uncomment the line below to delete:
-- DELETE FROM auth.users 
-- WHERE email = 'norepl@intimeesolutions.com' 
--   AND email_confirmed_at IS NULL;

-- ========================================
-- STEP 4: Delete ALL Failed Invites (Nuclear Option)
-- ========================================
-- CAUTION: This deletes ALL unconfirmed users
-- Only use this if you want to start completely fresh
-- Uncomment to run:

-- DELETE FROM auth.users 
-- WHERE email_confirmed_at IS NULL;

-- ========================================
-- STEP 5: Keep Only Latest Invite (Recommended)
-- ========================================
-- This keeps the most recent invite and deletes older duplicates
-- Useful if you have multiple failed invites for the same email

-- Uncomment to run:
/*
WITH ranked_users AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM auth.users
  WHERE email_confirmed_at IS NULL
)
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM ranked_users WHERE rn > 1
);
*/

-- ========================================
-- VERIFICATION
-- ========================================
-- After cleanup, verify no unconfirmed users remain:
SELECT 
  COUNT(*) as unconfirmed_count,
  COUNT(DISTINCT email) as unique_emails
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- Should return 0 unconfirmed_count after cleanup

