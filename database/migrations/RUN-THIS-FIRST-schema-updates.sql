-- ==========================================
-- COMPLETE DATABASE SCHEMA UPDATES
-- Run this in Supabase SQL Editor
-- ==========================================
-- This script:
-- 1. Adds organizational attributes to user_profiles
-- 2. Creates teams table
-- 3. Creates permissions system tables
-- 4. Sets up default teams, permissions, and role templates

-- ==========================================
-- PART 1: Add Organizational Attributes
-- ==========================================

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

CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_stream ON user_profiles(stream) WHERE stream IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_reporting_to ON user_profiles(reporting_to) WHERE reporting_to IS NOT NULL;

-- ==========================================
-- PART 2: Create Teams Table
-- ==========================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES user_profiles(id),
  parent_team_id UUID REFERENCES teams(id),
  region TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(name, deleted_at)
);

-- Add foreign key after teams table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_profiles_team'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT fk_user_profiles_team 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_team ON user_profiles(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_lead ON teams(team_lead_id) WHERE team_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_parent ON teams(parent_team_id) WHERE parent_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active) WHERE is_active = true;

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated users can view active teams" ON teams;
CREATE POLICY "All authenticated users can view active teams"
  ON teams FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS teams_updated_at ON teams;
CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

INSERT INTO teams (name, description, department, region) VALUES
  ('Engineering', 'Software engineering team', 'Technology', 'global'),
  ('Sales - North America', 'Sales team for North America region', 'Sales', 'north-america'),
  ('Sales - Europe', 'Sales team for Europe region', 'Sales', 'europe'),
  ('Recruiting', 'Talent acquisition team', 'HR', 'global'),
  ('Operations', 'Operations and delivery team', 'Operations', 'global'),
  ('Account Management', 'Client success and account management', 'Customer Success', 'global')
ON CONFLICT (name, deleted_at) DO NOTHING;

-- ==========================================
-- PART 3: Create Permissions Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_template_permissions (
  role_template_id UUID REFERENCES role_templates(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_template_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_template_perms_role ON role_template_permissions(role_template_id);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_template_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated users can view permissions" ON permissions;
CREATE POLICY "All authenticated users can view permissions"
  ON permissions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "All authenticated users can view role templates" ON role_templates;
CREATE POLICY "All authenticated users can view role templates"
  ON role_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "All authenticated users can view role template permissions" ON role_template_permissions;
CREATE POLICY "All authenticated users can view role template permissions"
  ON role_template_permissions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;
CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage role templates" ON role_templates;
CREATE POLICY "Admins can manage role templates"
  ON role_templates FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage user permissions" ON user_permissions;
CREATE POLICY "Admins can manage user permissions"
  ON user_permissions FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin')
  );

-- ==========================================
-- PART 4: Insert Default Data
-- ==========================================

-- Permissions
INSERT INTO permissions (name, description, category) VALUES
  ('users.view', 'View user profiles', 'users'),
  ('users.create', 'Create new users', 'users'),
  ('users.edit', 'Edit user profiles', 'users'),
  ('users.delete', 'Delete users', 'users'),
  ('users.manage_roles', 'Assign and change user roles', 'users'),
  ('candidates.view', 'View candidates', 'candidates'),
  ('candidates.create', 'Add new candidates', 'candidates'),
  ('candidates.edit', 'Edit candidate information', 'candidates'),
  ('candidates.delete', 'Delete candidates', 'candidates'),
  ('candidates.assign', 'Assign candidates to jobs', 'candidates'),
  ('clients.view', 'View clients', 'clients'),
  ('clients.create', 'Create new clients', 'clients'),
  ('clients.edit', 'Edit client information', 'clients'),
  ('clients.delete', 'Delete clients', 'clients'),
  ('clients.approve', 'Approve new client signups', 'clients'),
  ('jobs.view', 'View job postings', 'jobs'),
  ('jobs.create', 'Create new jobs', 'jobs'),
  ('jobs.edit', 'Edit job postings', 'jobs'),
  ('jobs.delete', 'Delete jobs', 'jobs'),
  ('jobs.publish', 'Publish jobs', 'jobs'),
  ('applications.view', 'View applications', 'applications'),
  ('applications.manage', 'Manage application status', 'applications'),
  ('applications.interview', 'Schedule and conduct interviews', 'applications'),
  ('placements.view', 'View placements', 'placements'),
  ('placements.create', 'Create new placements', 'placements'),
  ('placements.manage', 'Manage active placements', 'placements'),
  ('timesheets.view', 'View timesheets', 'timesheets'),
  ('timesheets.submit', 'Submit timesheets', 'timesheets'),
  ('timesheets.approve', 'Approve timesheets', 'timesheets'),
  ('reports.view', 'View reports', 'reports'),
  ('reports.export', 'Export data and reports', 'reports'),
  ('reports.analytics', 'Access analytics dashboards', 'reports'),
  ('hr.view_employees', 'View employee information', 'hr'),
  ('hr.manage_leave', 'Manage leave requests', 'hr'),
  ('hr.manage_benefits', 'Manage employee benefits', 'hr'),
  ('hr.performance_reviews', 'Conduct performance reviews', 'hr'),
  ('system.settings', 'Manage system settings', 'system'),
  ('system.audit_logs', 'View audit logs', 'system'),
  ('system.integrations', 'Manage integrations', 'system')
ON CONFLICT (name) DO NOTHING;

-- Role Templates
INSERT INTO role_templates (role_name, display_name, description, is_system) VALUES
  ('admin', 'Administrator', 'Full system access', true),
  ('recruiter', 'Recruiter', 'Manage candidates and jobs', true),
  ('sales', 'Sales Representative', 'Manage clients and opportunities', true),
  ('account_manager', 'Account Manager', 'Manage client relationships', true),
  ('operations', 'Operations', 'Manage placements and timesheets', true),
  ('hr', 'HR Manager', 'Manage employee records and HR functions', true),
  ('employee', 'Employee', 'Basic employee self-service', true),
  ('student', 'Student', 'Access academy content', true),
  ('candidate', 'Candidate', 'Job seeker portal access', true),
  ('client', 'Client', 'Client portal access', true)
ON CONFLICT (role_name) DO NOTHING;

-- Admin permissions (all)
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt CROSS JOIN permissions p WHERE rt.role_name = 'admin'
ON CONFLICT DO NOTHING;

-- Recruiter permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.assign',
  'jobs.view', 'jobs.create', 'jobs.edit',
  'applications.view', 'applications.manage', 'applications.interview',
  'reports.view', 'users.view'
) WHERE rt.role_name = 'recruiter' ON CONFLICT DO NOTHING;

-- Sales permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'clients.view', 'clients.create', 'clients.edit',
  'jobs.view', 'jobs.create', 'candidates.view', 'reports.view', 'users.view'
) WHERE rt.role_name = 'sales' ON CONFLICT DO NOTHING;

-- Account Manager permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'clients.view', 'clients.edit', 'placements.view', 'placements.manage',
  'jobs.view', 'reports.view', 'users.view'
) WHERE rt.role_name = 'account_manager' ON CONFLICT DO NOTHING;

-- Operations permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'placements.view', 'placements.create', 'placements.manage',
  'timesheets.view', 'timesheets.approve', 'candidates.view', 'reports.view', 'users.view'
) WHERE rt.role_name = 'operations' ON CONFLICT DO NOTHING;

-- HR permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'hr.view_employees', 'hr.manage_leave', 'hr.manage_benefits', 'hr.performance_reviews',
  'users.view', 'users.edit', 'reports.view'
) WHERE rt.role_name = 'hr' ON CONFLICT DO NOTHING;

-- Employee permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id FROM role_templates rt JOIN permissions p ON p.name IN (
  'timesheets.view', 'timesheets.submit', 'users.view'
) WHERE rt.role_name = 'employee' ON CONFLICT DO NOTHING;

-- Verification
SELECT 'Teams created:' as info, COUNT(*) as count FROM teams;
SELECT 'Permissions created:' as info, COUNT(*) as count FROM permissions;
SELECT 'Role templates created:' as info, COUNT(*) as count FROM role_templates;
SELECT 'Role-permission mappings:' as info, COUNT(*) as count FROM role_template_permissions;

