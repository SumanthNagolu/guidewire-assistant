-- ================================================================
-- TEST USERS SEED DATA
-- ================================================================
-- All users: @intimeesolutions.com domain
-- Standard password: test12345
-- ================================================================

-- ================================================================
-- 1. ADMIN USERS (Full System Access)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'admin@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Administrator"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'admin.john@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"John Admin"}',
    NOW(),
    NOW()
  );

-- Create admin profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'admin'::text,
  'Administration'::text,
  CASE 
    WHEN email = 'admin@intimeesolutions.com' THEN '+1-555-0100'
    WHEN email = 'admin.john@intimeesolutions.com' THEN '+1-555-0101'
  END,
  true
FROM auth.users 
WHERE email IN ('admin@intimeesolutions.com', 'admin.john@intimeesolutions.com');

-- ================================================================
-- 2. RECRUITER USERS (ATS-focused)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'recruiter.sarah@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Johnson"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'recruiter.mike@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mike Chen"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'recruiter.senior@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Senior Recruiter"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'recruiter.junior@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Junior Recruiter"}',
    NOW(),
    NOW()
  );

-- Create recruiter profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'recruiter'::text,
  'Recruiting'::text,
  CASE 
    WHEN email = 'recruiter.sarah@intimeesolutions.com' THEN '+1-555-0200'
    WHEN email = 'recruiter.mike@intimeesolutions.com' THEN '+1-555-0201'
    WHEN email = 'recruiter.senior@intimeesolutions.com' THEN '+1-555-0202'
    WHEN email = 'recruiter.junior@intimeesolutions.com' THEN '+1-555-0203'
  END,
  true
FROM auth.users 
WHERE email LIKE 'recruiter%@intimeesolutions.com';

-- ================================================================
-- 3. SALES USERS (CRM-focused)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'sales.david@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"David Martinez"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'sales.lisa@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Lisa Anderson"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'sales.rep@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sales Representative"}',
    NOW(),
    NOW()
  );

-- Create sales profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'sales'::text,
  'Sales'::text,
  CASE 
    WHEN email = 'sales.david@intimeesolutions.com' THEN '+1-555-0300'
    WHEN email = 'sales.lisa@intimeesolutions.com' THEN '+1-555-0301'
    WHEN email = 'sales.rep@intimeesolutions.com' THEN '+1-555-0302'
  END,
  true
FROM auth.users 
WHERE email LIKE 'sales%@intimeesolutions.com';

-- ================================================================
-- 4. ACCOUNT MANAGER USERS (Client Relationship Management)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'accountmgr.jennifer@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jennifer Wilson"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'accountmgr.robert@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Robert Taylor"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'accountmgr.senior@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Senior Account Manager"}',
    NOW(),
    NOW()
  );

-- Create account manager profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'account_manager'::text,
  'Account Management'::text,
  CASE 
    WHEN email = 'accountmgr.jennifer@intimeesolutions.com' THEN '+1-555-0400'
    WHEN email = 'accountmgr.robert@intimeesolutions.com' THEN '+1-555-0401'
    WHEN email = 'accountmgr.senior@intimeesolutions.com' THEN '+1-555-0402'
  END,
  true
FROM auth.users 
WHERE email LIKE 'accountmgr%@intimeesolutions.com';

-- ================================================================
-- 5. OPERATIONS USERS (Placement & Administrative Operations)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'operations.maria@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Maria Garcia"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'operations.james@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"James Brown"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'operations.coordinator@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Operations Coordinator"}',
    NOW(),
    NOW()
  );

-- Create operations profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'operations'::text,
  'Operations'::text,
  CASE 
    WHEN email = 'operations.maria@intimeesolutions.com' THEN '+1-555-0500'
    WHEN email = 'operations.james@intimeesolutions.com' THEN '+1-555-0501'
    WHEN email = 'operations.coordinator@intimeesolutions.com' THEN '+1-555-0502'
  END,
  true
FROM auth.users 
WHERE email LIKE 'operations%@intimeesolutions.com';

-- ================================================================
-- 6. EMPLOYEE USERS (Basic Employee Functions)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'employee.john@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"John Employee"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'employee.jane@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jane Employee"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'employee.consultant@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Consultant Employee"}',
    NOW(),
    NOW()
  );

-- Create employee profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'employee'::text,
  'General'::text,
  CASE 
    WHEN email = 'employee.john@intimeesolutions.com' THEN '+1-555-0600'
    WHEN email = 'employee.jane@intimeesolutions.com' THEN '+1-555-0601'
    WHEN email = 'employee.consultant@intimeesolutions.com' THEN '+1-555-0602'
  END,
  true
FROM auth.users 
WHERE email LIKE 'employee%@intimeesolutions.com';

-- ================================================================
-- 7. STUDENT USERS (Training Platform Only)
-- ================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'student.amy@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amy Student"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'student.bob@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Bob Student"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'student.beginner@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Beginner Student"}',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'student.advanced@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Advanced Student"}',
    NOW(),
    NOW()
  );

-- Create student profiles
INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  (raw_user_meta_data->>'full_name')::text,
  email,
  'student'::text,
  'Academy'::text,
  CASE 
    WHEN email = 'student.amy@intimeesolutions.com' THEN '+1-555-0700'
    WHEN email = 'student.bob@intimeesolutions.com' THEN '+1-555-0701'
    WHEN email = 'student.beginner@intimeesolutions.com' THEN '+1-555-0702'
    WHEN email = 'student.advanced@intimeesolutions.com' THEN '+1-555-0703'
  END,
  true
FROM auth.users 
WHERE email LIKE 'student%@intimeesolutions.com';

-- ================================================================
-- 8. SPECIAL SCENARIO USERS
-- ================================================================

-- Inactive User (for testing inactive account scenarios)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'inactive.user@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Inactive User"}',
    NOW(),
    NOW()
  );

INSERT INTO user_profiles (id, full_name, email, role, department, is_active)
SELECT 
  id, 
  'Inactive User',
  email,
  'employee'::text,
  'General'::text,
  false
FROM auth.users 
WHERE email = 'inactive.user@intimeesolutions.com';

-- Pending Activation User (email not confirmed)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'pending.user@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NULL, -- Not confirmed
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Pending User"}',
    NOW(),
    NOW()
  );

INSERT INTO user_profiles (id, full_name, email, role, department, is_active)
SELECT 
  id, 
  'Pending User',
  email,
  'employee'::text,
  'General'::text,
  true
FROM auth.users 
WHERE email = 'pending.user@intimeesolutions.com';

-- Manager-Employee Hierarchy (for testing manager relationships)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'manager.team@intimeesolutions.com',
    crypt('test12345', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Team Manager"}',
    NOW(),
    NOW()
  );

INSERT INTO user_profiles (id, full_name, email, role, department, phone, is_active)
SELECT 
  id, 
  'Team Manager',
  email,
  'recruiter'::text,
  'Recruiting'::text,
  '+1-555-0800',
  true
FROM auth.users 
WHERE email = 'manager.team@intimeesolutions.com';

-- Update some recruiters to have this manager
UPDATE user_profiles 
SET manager_id = (SELECT id FROM user_profiles WHERE email = 'manager.team@intimeesolutions.com')
WHERE email IN ('recruiter.junior@intimeesolutions.com', 'employee.john@intimeesolutions.com');

-- ================================================================
-- SUMMARY OF TEST USERS
-- ================================================================
-- Total: 22+ test users across all roles
--
-- ADMINS (2):
--   - admin@intimeesolutions.com
--   - admin.john@intimeesolutions.com
--
-- RECRUITERS (5):
--   - recruiter.sarah@intimeesolutions.com
--   - recruiter.mike@intimeesolutions.com
--   - recruiter.senior@intimeesolutions.com
--   - recruiter.junior@intimeesolutions.com
--   - manager.team@intimeesolutions.com (also a manager)
--
-- SALES (3):
--   - sales.david@intimeesolutions.com
--   - sales.lisa@intimeesolutions.com
--   - sales.rep@intimeesolutions.com
--
-- ACCOUNT MANAGERS (3):
--   - accountmgr.jennifer@intimeesolutions.com
--   - accountmgr.robert@intimeesolutions.com
--   - accountmgr.senior@intimeesolutions.com
--
-- OPERATIONS (3):
--   - operations.maria@intimeesolutions.com
--   - operations.james@intimeesolutions.com
--   - operations.coordinator@intimeesolutions.com
--
-- EMPLOYEES (3):
--   - employee.john@intimeesolutions.com (has manager)
--   - employee.jane@intimeesolutions.com
--   - employee.consultant@intimeesolutions.com
--
-- STUDENTS (4):
--   - student.amy@intimeesolutions.com
--   - student.bob@intimeesolutions.com
--   - student.beginner@intimeesolutions.com
--   - student.advanced@intimeesolutions.com
--
-- SPECIAL CASES (2):
--   - inactive.user@intimeesolutions.com (is_active = false)
--   - pending.user@intimeesolutions.com (email not confirmed)
--
-- PASSWORD FOR ALL: test12345
-- ================================================================

-- Verify insertion
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(email, ', ' ORDER BY email) as emails
FROM user_profiles
WHERE email LIKE '%@intimeesolutions.com'
GROUP BY role
ORDER BY role;

