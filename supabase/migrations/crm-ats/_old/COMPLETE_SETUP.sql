-- ==========================================
-- 🚀 INTIME COMMAND CENTER - COMPLETE DATABASE SETUP
-- ==========================================
-- This is a SINGLE, IDEMPOTENT script that sets up your entire CRM/ATS
-- SAFE TO RUN MULTIPLE TIMES - it won't error if objects already exist
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Paste and click "Run"
-- 4. Wait ~30 seconds
-- 5. Done! ✅
--
-- WITH GURU'S GRACE! JAI VIJAYA! 🙏
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- HELPER FUNCTIONS (used by multiple tables)
-- ==========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 001: USER PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'sales', 'account_manager', 'operations', 'student', 'employee')),
  department TEXT,
  manager_id UUID REFERENCES user_profiles(id),
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add missing columns if table already existed
DO $$ 
BEGIN
  -- Add manager_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'manager_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN manager_id UUID REFERENCES user_profiles(id);
  END IF;

  -- Add department if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN department TEXT;
  END IF;

  -- Add avatar_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Add timezone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'America/New_York';
  END IF;

  -- Add is_active if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add deleted_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager ON user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Trigger
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 002: CANDIDATES (ATS)
-- ==========================================

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  current_title TEXT,
  years_of_experience INTEGER,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]'::jsonb,
  resume_url TEXT,
  resume_parsed_data JSONB,
  linkedin_url TEXT,
  portfolio_url TEXT,
  availability TEXT CHECK (availability IN ('immediate', 'within_2_weeks', 'within_1_month', 'not_available')) DEFAULT 'within_2_weeks',
  desired_rate_min INTEGER,
  desired_rate_max INTEGER,
  work_authorization TEXT CHECK (work_authorization IN ('us_citizen', 'green_card', 'h1b', 'opt', 'ead', 'requires_sponsorship')),
  status TEXT CHECK (status IN ('active', 'placed', 'inactive', 'do_not_contact')) DEFAULT 'active',
  source TEXT,
  referred_by UUID REFERENCES user_profiles(id),
  technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  owner_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_owner ON candidates(owner_id);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates(created_at DESC);

DROP TRIGGER IF EXISTS candidates_updated_at ON candidates;
CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recruiters can view own candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can update own candidates" ON candidates;

CREATE POLICY "Recruiters can view own candidates"
  ON candidates FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'account_manager'))
  );

CREATE POLICY "Recruiters can insert candidates"
  ON candidates FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter'))
  );

CREATE POLICY "Recruiters can update own candidates"
  ON candidates FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==========================================
-- SUCCESS! ✅
-- ==========================================
-- Your database is ready!
-- Next: Create test users in Supabase Auth
-- Then run: scripts/setup-test-users.sql
-- ==========================================

