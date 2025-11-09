-- ==========================================
-- 🚀 SIMPLE TEST USERS SETUP - GUARANTEED TO WORK
-- ==========================================
-- This uses Supabase's built-in user creation method
-- Run this in Supabase SQL Editor AS THE SERVICE ROLE
--
-- IMPORTANT: Run this in the SQL Editor with "Run as service_role" enabled
-- (Toggle the switch at the bottom of SQL Editor)
--
-- JAI VIJAYA! 🙏
-- ==========================================

-- Create test users using Supabase's admin functions
-- Password for all users: Test123!@#

SELECT auth.create_user(
  jsonb_build_object(
    'email', 'admin@intimesolutions.com',
    'password', 'Test123!@#',
    'email_confirm', true,
    'user_metadata', jsonb_build_object(
      'full_name', 'Admin User',
      'role', 'admin'
    )
  )
);

SELECT auth.create_user(
  jsonb_build_object(
    'email', 'recruiter1@intimesolutions.com',
    'password', 'Test123!@#',
    'email_confirm', true,
    'user_metadata', jsonb_build_object(
      'full_name', 'Jane Recruiter',
      'role', 'recruiter'
    )
  )
);

SELECT auth.create_user(
  jsonb_build_object(
    'email', 'sales1@intimesolutions.com',
    'password', 'Test123!@#',
    'email_confirm', true,
    'user_metadata', jsonb_build_object(
      'full_name', 'John Sales',
      'role', 'sales'
    )
  )
);

SELECT auth.create_user(
  jsonb_build_object(
    'email', 'ops1@intimesolutions.com',
    'password', 'Test123!@#',
    'email_confirm', true,
    'user_metadata', jsonb_build_object(
      'full_name', 'Sarah Operations',
      'role', 'operations'
    )
  )
);

-- Wait for triggers to create user_profiles, then update them
DO $$
BEGIN
  PERFORM pg_sleep(2); -- Wait 2 seconds for triggers to fire
END $$;

-- Update user profiles with correct data
UPDATE user_profiles 
SET 
  role = 'admin',
  full_name = 'Admin User',
  phone = '+1-555-100-0001',
  is_active = true,
  updated_at = NOW()
WHERE email = 'admin@intimesolutions.com';

UPDATE user_profiles 
SET 
  role = 'recruiter',
  full_name = 'Jane Recruiter',
  phone = '+1-555-100-0002',
  is_active = true,
  updated_at = NOW()
WHERE email = 'recruiter1@intimesolutions.com';

UPDATE user_profiles 
SET 
  role = 'sales',
  full_name = 'John Sales',
  phone = '+1-555-100-0003',
  is_active = true,
  updated_at = NOW()
WHERE email = 'sales1@intimesolutions.com';

UPDATE user_profiles 
SET 
  role = 'operations',
  full_name = 'Sarah Operations',
  phone = '+1-555-100-0004',
  is_active = true,
  updated_at = NOW()
WHERE email = 'ops1@intimesolutions.com';

-- Verify everything worked
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  up.role,
  up.full_name,
  up.phone,
  up.is_active,
  up.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
WHERE u.email IN (
  'admin@intimesolutions.com',
  'recruiter1@intimesolutions.com',
  'sales1@intimesolutions.com',
  'ops1@intimesolutions.com'
)
ORDER BY up.role;

-- ==========================================
-- ✅ SUCCESS!
-- ==========================================
-- 🔑 All users created with password: Test123!@#
-- 🎉 WITH GURU'S GRACE! JAI VIJAYA! 🙏
-- ==========================================

