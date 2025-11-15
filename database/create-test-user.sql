-- Create a test user profile for productivity testing
-- Run this in Supabase SQL Editor

-- First, create a test user in auth.users (if not exists)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  'test-user-001',
  'test@intimesolutions.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Create the user profile
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
)
VALUES (
  'test-user-001',
  'test@intimesolutions.com',
  'Test',
  'User',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Add some sample productivity data for testing
INSERT INTO productivity_sessions (
  user_id,
  start_time,
  mouse_movements,
  keystrokes,
  active_time,
  idle_time
)
VALUES 
  ('test-user-001', NOW() - INTERVAL '1 hour', 1500, 850, 3000, 600),
  ('test-user-001', NOW() - INTERVAL '2 hours', 2000, 1200, 3300, 300),
  ('test-user-001', NOW() - INTERVAL '3 hours', 1800, 950, 3400, 200)
ON CONFLICT DO NOTHING;

-- Add some sample application usage
INSERT INTO productivity_applications (
  user_id,
  app_name,
  window_title,
  start_time,
  end_time,
  duration
)
VALUES
  ('test-user-001', 'VS Code', 'Project - Visual Studio Code', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 1800),
  ('test-user-001', 'Chrome', 'GitHub - Google Chrome', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', 1800),
  ('test-user-001', 'Slack', 'Slack - Team Chat', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2.5 hours', 1800)
ON CONFLICT DO NOTHING;

SELECT 'Test user created successfully!' as message;


