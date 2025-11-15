-- ==========================================
-- 🚀 CREATE HR AND EMPLOYEE TEST USERS
-- ==========================================
-- Creates users with proper roles and permissions
-- Run this in Supabase SQL Editor
-- ==========================================

DO $$
DECLARE
  hr_user_id UUID;
  employee_user_id UUID;
  hr_role_id UUID;
  employee_role_id UUID;
BEGIN
  -- Step 1: Ensure roles exist (create if they don't)
  INSERT INTO roles (code, name, description, priority, permissions) VALUES
    ('hr_manager', 'HR Manager', 'Human Resources Manager - Full HR access', 80, '{"hr": "full", "employees": "full", "timesheets": "full", "leave": "full", "expenses": "full"}'),
    ('employee', 'Employee', 'Employee - Self-service access', 20, '{"self": true, "timesheets": "own", "leave": "own", "expenses": "own"}')
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    priority = EXCLUDED.priority,
    permissions = EXCLUDED.permissions;

  -- Get role IDs
  SELECT id INTO hr_role_id FROM roles WHERE code = 'hr_manager';
  SELECT id INTO employee_role_id FROM roles WHERE code = 'employee';

  -- Step 2: Create HR User in auth.users
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
    'hr@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"HR Manager","role":"hr_manager"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('test12345', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO hr_user_id;

  -- Step 3: Create Employee User in auth.users
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
    'employee@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Employee","role":"employee"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('test12345', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO employee_user_id;

  -- Step 4: Create identities for HR user
  IF hr_user_id IS NOT NULL THEN
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
      hr_user_id,
      format('{"sub":"%s","email":"hr@intimeesolutions.com"}', hr_user_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  -- Step 5: Create identities for Employee user
  IF employee_user_id IS NOT NULL THEN
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
      employee_user_id,
      format('{"sub":"%s","email":"employee@intimeesolutions.com"}', employee_user_id)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (provider, user_id) DO NOTHING;
  END IF;

  -- Step 6: Wait a moment for triggers, then ensure user_profiles exist
  -- The handle_new_user() trigger should create profiles, but we'll ensure they exist
  INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES
    (hr_user_id, 'hr@intimeesolutions.com', 'HR', 'Manager', 'hr_manager', true, NOW(), NOW()),
    (employee_user_id, 'employee@intimeesolutions.com', 'Test', 'Employee', 'employee', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Step 7: Assign roles via user_roles table
  -- HR Manager role
  INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
  VALUES (hr_user_id, hr_role_id, NOW(), true)
  ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = NOW();

  -- Employee role
  INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
  VALUES (employee_user_id, employee_role_id, NOW(), true)
  ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = NOW();

  RAISE NOTICE '✅ Users created successfully!';
  RAISE NOTICE 'HR User ID: %', hr_user_id;
  RAISE NOTICE 'Employee User ID: %', employee_user_id;
END $$;

-- Step 8: Verify the users were created correctly
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  up.first_name || ' ' || up.last_name as full_name,
  up.role as profile_role,
  r.code as role_code,
  r.name as role_name,
  r.priority as role_priority,
  up.is_active,
  up.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = true
LEFT JOIN roles r ON r.id = ur.role_id
WHERE u.email IN (
  'hr@intimeesolutions.com',
  'employee@intimeesolutions.com'
)
ORDER BY u.email;

-- ==========================================
-- ✅ SUCCESS!
-- ==========================================
-- Login credentials:
-- 
-- HR Manager:
--   Email: hr@intimeesolutions.com
--   Password: test12345
--
-- Employee:
--   Email: employee@intimeesolutions.com
--   Password: test12345
--
-- ==========================================

