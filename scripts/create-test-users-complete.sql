-- ==========================================
-- 🚀 COMPLETE TEST USERS SETUP - ONE SCRIPT
-- ==========================================
-- This script creates users in auth.users AND assigns roles in user_profiles
-- Run this in Supabase SQL Editor
--
-- JAI VIJAYA! 🙏
-- ==========================================

-- Step 1: Create users in auth.users (using Supabase's internal structure)
-- Password for all test users: Test123!@#

DO $$
DECLARE
  admin_id UUID;
  recruiter_id UUID;
  sales_id UUID;
  ops_id UUID;
BEGIN
  -- Create Admin User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@intimesolutions.com',
    crypt('Test123!@#', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User","role":"admin"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_id;

  -- Create Recruiter User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'recruiter1@intimesolutions.com',
    crypt('Test123!@#', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jane Recruiter","role":"recruiter"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO recruiter_id;

  -- Create Sales User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'sales1@intimesolutions.com',
    crypt('Test123!@#', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"John Sales","role":"sales"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO sales_id;

  -- Create Operations User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'ops1@intimesolutions.com',
    crypt('Test123!@#', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Operations","role":"operations"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO ops_id;

  -- Create corresponding identities
  IF admin_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_id,
      format('{"sub":"%s","email":"admin@intimesolutions.com"}', admin_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  IF recruiter_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      recruiter_id,
      format('{"sub":"%s","email":"recruiter1@intimesolutions.com"}', recruiter_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  IF sales_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      sales_id,
      format('{"sub":"%s","email":"sales1@intimesolutions.com"}', sales_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  IF ops_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      ops_id,
      format('{"sub":"%s","email":"ops1@intimesolutions.com"}', ops_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Users created successfully!';
END $$;

-- Step 2: Wait a moment for triggers to fire, then update user_profiles
-- The handle_new_user() trigger should have created profiles automatically

-- Update Admin profile
UPDATE user_profiles 
SET 
  role = 'admin',
  full_name = 'Admin User',
  phone = '+1-555-100-0001',
  is_active = true,
  updated_at = NOW()
WHERE email = 'admin@intimesolutions.com';

-- Update Recruiter profile
UPDATE user_profiles 
SET 
  role = 'recruiter',
  full_name = 'Jane Recruiter',
  phone = '+1-555-100-0002',
  is_active = true,
  updated_at = NOW()
WHERE email = 'recruiter1@intimesolutions.com';

-- Update Sales profile
UPDATE user_profiles 
SET 
  role = 'sales',
  full_name = 'John Sales',
  phone = '+1-555-100-0003',
  is_active = true,
  updated_at = NOW()
WHERE email = 'sales1@intimesolutions.com';

-- Update Operations profile
UPDATE user_profiles 
SET 
  role = 'operations',
  full_name = 'Sarah Operations',
  phone = '+1-555-100-0004',
  is_active = true,
  updated_at = NOW()
WHERE email = 'ops1@intimesolutions.com';

-- Step 3: Verify everything worked
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
-- You should see 4 users with:
-- ✅ Email confirmed (email_confirmed_at is set)
-- ✅ Correct roles (admin, recruiter, sales, operations)
-- ✅ Full names assigned
-- ✅ Phone numbers assigned
-- ✅ is_active = true
--
-- 🔑 Login credentials for all users:
-- Password: Test123!@#
--
-- ==========================================
-- 🎉 WITH GURU'S GRACE! JAI VIJAYA! 🙏
-- ==========================================

