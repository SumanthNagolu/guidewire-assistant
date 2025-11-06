-- Fix email verification issues for development
-- Option 1: Disable email confirmation (recommended for development)
-- Option 2: Auto-confirm emails (for testing)

-- ========================================
-- OPTION 1: Disable Email Confirmation (Development Only)
-- ========================================
-- Run this in Supabase Dashboard → Authentication → Settings → Email Auth
-- Set "Enable email confirmations" to OFF

-- ========================================
-- OPTION 2: Auto-Confirm Existing Unconfirmed Users
-- ========================================
-- This confirms all existing unconfirmed users
-- Useful if you've already created test accounts

UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ========================================
-- OPTION 3: Delete Unconfirmed Test Users
-- ========================================
-- If you want to start fresh, delete all unconfirmed users
-- CAUTION: This will delete ALL unconfirmed users

-- Uncomment the line below to delete unconfirmed users:
-- DELETE FROM auth.users WHERE email_confirmed_at IS NULL;

-- ========================================
-- Verification
-- ========================================
-- Check which users are confirmed vs unconfirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ========================================
-- RECOMMENDED APPROACH FOR DEVELOPMENT
-- ========================================
-- 1. Disable email confirmation in Supabase Dashboard
-- 2. Delete existing unconfirmed users (if any)
-- 3. Test signup again - should work without email verification

