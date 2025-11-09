-- 🧪 TEST USERS SETUP SCRIPT
-- Run this AFTER you've created users in Supabase Auth
-- This updates their profiles with correct roles

-- Instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create 4 users with these emails (use password: Test123!@#)
-- 3. Copy each user's UUID
-- 4. Replace the UUIDs below with your actual user UUIDs
-- 5. Run this script in SQL Editor

-- ==========================================
-- UPDATE THESE UUIDs WITH YOUR ACTUAL UUIDs
-- ==========================================

-- Admin User
UPDATE user_profiles 
SET 
  role = 'admin',
  full_name = 'Admin User',
  phone = '+1-555-100-0001',
  updated_at = NOW()
WHERE email = 'admin@intimesolutions.com';

-- Recruiter
UPDATE user_profiles 
SET 
  role = 'recruiter',
  full_name = 'Jane Recruiter',
  phone = '+1-555-100-0002',
  updated_at = NOW()
WHERE email = 'recruiter1@intimesolutions.com';

-- Sales
UPDATE user_profiles 
SET 
  role = 'sales',
  full_name = 'John Sales',
  phone = '+1-555-100-0003',
  updated_at = NOW()
WHERE email = 'sales1@intimesolutions.com';

-- Operations
UPDATE user_profiles 
SET 
  role = 'operations',
  full_name = 'Sarah Operations',
  phone = '+1-555-100-0004',
  updated_at = NOW()
WHERE email = 'ops1@intimesolutions.com';

-- Verify roles updated
SELECT id, email, role, full_name, created_at
FROM user_profiles
WHERE email IN (
  'admin@intimesolutions.com',
  'recruiter1@intimesolutions.com',
  'sales1@intimesolutions.com',
  'ops1@intimesolutions.com'
)
ORDER BY role;

-- Should show 4 users with correct roles

