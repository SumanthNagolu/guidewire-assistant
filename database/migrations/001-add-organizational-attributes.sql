-- ==========================================
-- Add Organizational Attributes to user_profiles
-- ==========================================
-- This migration adds team, region, stream, and other organizational attributes
-- to support the admin user management system

-- Add organizational columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS stream TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contractor', 'intern')),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS reporting_to UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_team ON user_profiles(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_stream ON user_profiles(stream) WHERE stream IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_reporting_to ON user_profiles(reporting_to) WHERE reporting_to IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.region IS 'Geographic region (e.g., north-america, europe, asia-pacific)';
COMMENT ON COLUMN user_profiles.team_id IS 'Reference to teams table';
COMMENT ON COLUMN user_profiles.group_name IS 'Informal group/pod name (e.g., sales-team-a, recruiting-pod-1)';
COMMENT ON COLUMN user_profiles.stream IS 'Business stream/vertical (e.g., healthcare, technology, finance)';
COMMENT ON COLUMN user_profiles.employment_type IS 'Type of employment relationship';
COMMENT ON COLUMN user_profiles.start_date IS 'Employee start date';
COMMENT ON COLUMN user_profiles.reporting_to IS 'Direct manager/supervisor';
COMMENT ON COLUMN user_profiles.cost_center IS 'Cost center code for accounting';
COMMENT ON COLUMN user_profiles.location IS 'Physical office location';
COMMENT ON COLUMN user_profiles.job_title IS 'Official job title';

