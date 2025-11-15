-- ==========================================
-- ENHANCED SIGNUP TRIGGER FOR MULTIPLE USER TYPES
-- ==========================================
-- This trigger handles signup for:
-- - Students (academy users)
-- - Candidates (job seekers)
-- - Clients (companies)
-- - Internal users (created by admin)

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Enhanced function to handle different user types
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
  user_type TEXT;
BEGIN
  -- Extract user type from metadata (set during signup)
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user');
  
  -- Determine role based on user_type
  CASE user_type
    WHEN 'student' THEN user_role := 'student';
    WHEN 'candidate' THEN user_role := 'candidate';
    WHEN 'client' THEN user_role := 'client';
    ELSE user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  END CASE;

  -- Create user profile
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    phone,
    role,
    onboarding_completed,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''))
    ),
    NEW.raw_user_meta_data->>'phone',
    user_role,
    CASE WHEN user_role IN ('student', 'candidate', 'client') THEN false ELSE true END,
    true
  );

  -- Create candidate record if user_type is candidate
  IF user_type = 'candidate' THEN
    INSERT INTO public.candidates (
      id,
      first_name,
      last_name,
      email,
      phone,
      current_title,
      years_of_experience,
      status,
      source
    )
    VALUES (
      gen_random_uuid(),
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'current_title',
      COALESCE((NEW.raw_user_meta_data->>'years_of_experience')::INTEGER, 0),
      'active',
      'website_signup'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create client record if user_type is client
  IF user_type = 'client' THEN
    INSERT INTO public.clients (
      id,
      name,
      email,
      phone,
      industry,
      company_size,
      status,
      source
    )
    VALUES (
      gen_random_uuid(),
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unknown Company'),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'industry',
      NEW.raw_user_meta_data->>'company_size',
      'pending_approval', -- Clients need admin approval
      'website_signup'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

