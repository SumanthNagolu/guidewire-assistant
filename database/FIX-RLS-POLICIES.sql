-- Fix RLS policies for user_profiles
-- This ensures users can read and update their own profiles
-- This script is IDEMPOTENT (safe to run multiple times)

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies with exact names (including any that already exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Policy 3: Service role can insert profiles (for the trigger)
-- This allows the handle_new_user() trigger to create profiles
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

