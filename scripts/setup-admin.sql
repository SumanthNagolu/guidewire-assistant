-- ============================================
-- COMPLETE ADMIN USER SETUP
-- ============================================

-- Step 1: Confirm the email
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmation_sent_at = NOW(),
  updated_at = NOW()
WHERE email = 'admin@intimeesolutions.com';

-- Step 2: Delete any existing profile (to start fresh)
DELETE FROM user_profiles 
WHERE email = 'admin@intimeesolutions.com';

-- Step 3: Create the admin profile
INSERT INTO user_profiles (
  id,
  email,
  role,
  first_name,
  last_name,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  id,
  'admin@intimeesolutions.com',
  'admin',
  'Admin',
  'User',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@intimeesolutions.com';

-- Verification
SELECT 
  au.id = up.id as ids_match,
  au.id as auth_id,
  up.id as profile_id,
  up.role,
  up.onboarding_completed,
  au.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'admin@intimeesolutions.com';

