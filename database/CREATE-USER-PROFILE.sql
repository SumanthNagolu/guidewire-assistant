-- Create user profile for current authenticated user
-- Run this while logged in to your Supabase dashboard

-- First, check your user ID
SELECT auth.uid() as your_user_id;

-- Create profile with the authenticated user's ID
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  onboarding_completed,
  assumed_persona,
  preferred_product_id
)
VALUES (
  auth.uid(),  -- Uses currently logged-in user
  (SELECT email FROM auth.users WHERE id = auth.uid()),  -- Gets email from auth
  'Your',  -- Update this
  'Name',  -- Update this
  'admin',  -- Give yourself admin access
  true,  -- Mark onboarding as complete
  '3-5 years experience',
  (SELECT id FROM products WHERE code = 'CC' LIMIT 1)  -- Default to ClaimCenter
)
ON CONFLICT (id) DO UPDATE SET
  onboarding_completed = true,
  role = 'admin';

-- Verify profile created
SELECT id, email, first_name, last_name, role, onboarding_completed
FROM user_profiles
WHERE id = auth.uid();

