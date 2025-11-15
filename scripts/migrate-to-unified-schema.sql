-- ====================================================================
-- TRIKALA UNIFIED DATABASE MIGRATION
-- This script consolidates all 7 separate schemas into ONE unified system
-- RUN THIS TO ACTUALLY INTEGRATE THE PLATFORM
-- ====================================================================

BEGIN;

-- ====================================================================
-- STEP 1: BACKUP EXISTING DATA
-- ====================================================================

-- Create backup tables for existing data
CREATE TABLE IF NOT EXISTS backup_user_profiles AS SELECT * FROM user_profiles;
CREATE TABLE IF NOT EXISTS backup_student_profiles AS SELECT * FROM student_profiles WHERE EXISTS (SELECT 1 FROM student_profiles LIMIT 1);
CREATE TABLE IF NOT EXISTS backup_employees AS SELECT * FROM employees WHERE EXISTS (SELECT 1 FROM employees LIMIT 1);

-- ====================================================================
-- STEP 2: CREATE UNIFIED USER SYSTEM
-- ====================================================================

-- Drop old conflicting tables and recreate unified structure
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS employee_records CASCADE;

-- Create roles table for RBAC
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (code, name, description) VALUES
  ('student', 'Student', 'Academy learner'),
  ('employee', 'Employee', 'Company employee'),
  ('recruiter', 'Recruiter', 'Recruitment team member'),
  ('sourcer', 'Sourcer', 'Talent sourcer'),
  ('screener', 'Screener', 'Candidate screener'),
  ('manager', 'Manager', 'Team manager'),
  ('hr', 'HR Manager', 'Human resources manager'),
  ('admin', 'Administrator', 'System administrator'),
  ('ceo', 'CEO', 'Chief Executive Officer')
ON CONFLICT (code) DO NOTHING;

-- Alter existing user_profiles to be the single source of truth
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS department_id UUID,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS employment_type TEXT,
  ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS reporting_manager_id UUID,
  ADD COLUMN IF NOT EXISTS work_location TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS is_bench BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bench_start_date DATE,
  ADD COLUMN IF NOT EXISTS expected_rate DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS visa_status TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT;

-- Create user-role junction table for multiple roles
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- ====================================================================
-- STEP 3: MIGRATE EXISTING DATA TO UNIFIED STRUCTURE
-- ====================================================================

-- Migrate employee data into user_profiles
UPDATE user_profiles up
SET 
  role = COALESCE(e.role, 'employee'),
  employee_id = e.employee_id,
  department_id = e.department_id,
  designation = e.designation,
  employment_type = e.employment_type,
  employment_status = e.employment_status,
  hire_date = e.hire_date,
  reporting_manager_id = e.reporting_manager_id,
  work_location = e.work_location
FROM (SELECT * FROM employees WHERE EXISTS (SELECT 1 FROM employees LIMIT 1)) e
WHERE up.id = e.user_id;

-- Migrate student profile data
UPDATE user_profiles up
SET
  experience_level = sp.experience_level,
  linkedin_url = sp.linkedin_url,
  github_url = sp.github_url
FROM (SELECT * FROM student_profiles WHERE EXISTS (SELECT 1 FROM student_profiles LIMIT 1)) sp
WHERE up.id = sp.user_id;

-- Assign roles based on current user types
INSERT INTO user_roles (user_id, role_id)
SELECT 
  up.id,
  r.id
FROM user_profiles up
CROSS JOIN roles r
WHERE 
  (up.role = 'student' AND r.code = 'student')
  OR (up.role = 'employee' AND r.code = 'employee')
  OR (up.role = 'admin' AND r.code = 'admin')
  OR (up.role = 'recruiter' AND r.code = 'recruiter')
  OR (up.role = 'manager' AND r.code = 'manager')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- STEP 4: CREATE SYSTEM EVENT BUS FOR INTEGRATION
-- ====================================================================

CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] DEFAULT '{}',
  payload JSONB NOT NULL,
  processed_by TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes for event bus
CREATE INDEX IF NOT EXISTS idx_system_events_status ON system_events(status);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at DESC);

-- ====================================================================
-- STEP 5: CREATE INTEGRATION TRIGGERS
-- ====================================================================

-- Trigger: When student completes academy, create HR onboarding event
CREATE OR REPLACE FUNCTION on_academy_completion() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    INSERT INTO system_events (
      event_type, 
      source_module, 
      target_modules, 
      payload
    ) VALUES (
      'academy_completed',
      'academy',
      ARRAY['hr', 'productivity'],
      jsonb_build_object(
        'user_id', NEW.user_id,
        'completed_at', NEW.completed_at,
        'product_id', NEW.product_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to student completions
DROP TRIGGER IF EXISTS trigger_academy_completion ON topic_completions;
CREATE TRIGGER trigger_academy_completion
  AFTER UPDATE ON topic_completions
  FOR EACH ROW
  EXECUTE FUNCTION on_academy_completion();

-- Trigger: When employee hired, start productivity tracking
CREATE OR REPLACE FUNCTION on_employee_hired() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employment_status = 'active' AND 
     (OLD.employment_status IS NULL OR OLD.employment_status != 'active') THEN
    INSERT INTO system_events (
      event_type,
      source_module,
      target_modules,
      payload
    ) VALUES (
      'employee_hired',
      'hr',
      ARRAY['productivity', 'academy'],
      jsonb_build_object(
        'user_id', NEW.id,
        'hire_date', NEW.hire_date,
        'department_id', NEW.department_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_employee_hired ON user_profiles;
CREATE TRIGGER trigger_employee_hired
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (NEW.employment_status = 'active')
  EXECUTE FUNCTION on_employee_hired();

-- ====================================================================
-- STEP 6: CREATE UNIFIED VIEWS FOR BACKWARDS COMPATIBILITY
-- ====================================================================

-- View for employee records (for HR module)
CREATE OR REPLACE VIEW employee_records AS
SELECT 
  id,
  id as user_id,
  employee_id,
  email,
  first_name,
  last_name,
  department_id,
  designation,
  employment_type,
  employment_status,
  hire_date,
  reporting_manager_id,
  work_location,
  created_at,
  updated_at
FROM user_profiles
WHERE employee_id IS NOT NULL;

-- View for student profiles (for Academy module)
CREATE OR REPLACE VIEW student_profiles AS
SELECT
  id as user_id,
  email,
  first_name,
  last_name,
  assumed_persona,
  preferred_product_id,
  experience_level,
  resume_url,
  linkedin_url,
  github_url,
  onboarding_completed,
  created_at
FROM user_profiles
WHERE role = 'student' OR EXISTS (
  SELECT 1 FROM user_roles ur 
  JOIN roles r ON ur.role_id = r.id 
  WHERE ur.user_id = user_profiles.id AND r.code = 'student'
);

-- ====================================================================
-- STEP 7: CREATE CROSS-MODULE FUNCTIONS
-- ====================================================================

-- Function to get user's complete profile with all roles
CREATE OR REPLACE FUNCTION get_user_complete_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', up.id,
    'email', up.email,
    'full_name', CONCAT(up.first_name, ' ', up.last_name),
    'roles', array_agg(DISTINCT r.code),
    'is_student', bool_or(r.code = 'student'),
    'is_employee', up.employee_id IS NOT NULL,
    'is_admin', bool_or(r.code = 'admin'),
    'academy_progress', (
      SELECT json_build_object(
        'topics_completed', COUNT(DISTINCT tc.topic_id),
        'total_time_spent', SUM(tc.time_spent_minutes),
        'current_product', p.name
      )
      FROM topic_completions tc
      LEFT JOIN topics t ON tc.topic_id = t.id
      LEFT JOIN products p ON t.product_id = p.id
      WHERE tc.user_id = p_user_id
    ),
    'hr_details', CASE 
      WHEN up.employee_id IS NOT NULL THEN
        json_build_object(
          'employee_id', up.employee_id,
          'department_id', up.department_id,
          'designation', up.designation,
          'hire_date', up.hire_date
        )
      ELSE NULL
    END,
    'productivity_stats', (
      SELECT json_build_object(
        'total_sessions', COUNT(*),
        'avg_productivity_score', AVG(ps.overall_score)
      )
      FROM productivity_scores ps
      WHERE ps.user_id = p_user_id
      AND ps.date >= CURRENT_DATE - INTERVAL '30 days'
    )
  ) INTO result
  FROM user_profiles up
  LEFT JOIN user_roles ur ON ur.user_id = up.id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE up.id = p_user_id
  GROUP BY up.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- STEP 8: UPDATE RLS POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- User can see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- User can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.code = 'admin'
    )
  );

-- Users can see their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- ====================================================================
-- STEP 9: CREATE REALTIME SUBSCRIPTIONS
-- ====================================================================

-- Enable realtime for system events
ALTER PUBLICATION supabase_realtime ADD TABLE system_events;

-- Enable realtime for user profile updates
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

COMMIT;

-- ====================================================================
-- POST-MIGRATION VERIFICATION
-- ====================================================================

-- Run these queries to verify migration success:
-- SELECT COUNT(*) as total_users FROM user_profiles;
-- SELECT COUNT(*) as users_with_roles FROM user_roles;
-- SELECT COUNT(*) as pending_events FROM system_events WHERE status = 'pending';
-- SELECT * FROM get_user_complete_profile('YOUR_USER_ID'::uuid);
