-- ==========================================
-- Create Permissions Tables
-- ==========================================
-- Granular permission system for role-based access control

-- Permission definitions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- e.g., 'users', 'candidates', 'clients', 'jobs', 'reports'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role templates (predefined permission sets)
CREATE TABLE IF NOT EXISTS role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false, -- System roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many: role templates to permissions
CREATE TABLE IF NOT EXISTS role_template_permissions (
  role_template_id UUID REFERENCES role_templates(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_template_id, permission_id)
);

-- User-specific permission overrides
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true, -- false = explicitly denied
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, permission_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_template_perms_role ON role_template_permissions(role_template_id);

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_template_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Permissions are visible to all authenticated users
CREATE POLICY "All authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can view role templates"
  ON role_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can view role template permissions"
  ON role_template_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions"
  ON permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage role templates"
  ON role_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage user permissions"
  ON user_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ==========================================
-- Insert Default Permissions
-- ==========================================

INSERT INTO permissions (name, description, category) VALUES
  -- User Management
  ('users.view', 'View user profiles', 'users'),
  ('users.create', 'Create new users', 'users'),
  ('users.edit', 'Edit user profiles', 'users'),
  ('users.delete', 'Delete users', 'users'),
  ('users.manage_roles', 'Assign and change user roles', 'users'),
  
  -- Candidate Management
  ('candidates.view', 'View candidates', 'candidates'),
  ('candidates.create', 'Add new candidates', 'candidates'),
  ('candidates.edit', 'Edit candidate information', 'candidates'),
  ('candidates.delete', 'Delete candidates', 'candidates'),
  ('candidates.assign', 'Assign candidates to jobs', 'candidates'),
  
  -- Client Management
  ('clients.view', 'View clients', 'clients'),
  ('clients.create', 'Create new clients', 'clients'),
  ('clients.edit', 'Edit client information', 'clients'),
  ('clients.delete', 'Delete clients', 'clients'),
  ('clients.approve', 'Approve new client signups', 'clients'),
  
  -- Job Management
  ('jobs.view', 'View job postings', 'jobs'),
  ('jobs.create', 'Create new jobs', 'jobs'),
  ('jobs.edit', 'Edit job postings', 'jobs'),
  ('jobs.delete', 'Delete jobs', 'jobs'),
  ('jobs.publish', 'Publish jobs', 'jobs'),
  
  -- Application Management
  ('applications.view', 'View applications', 'applications'),
  ('applications.manage', 'Manage application status', 'applications'),
  ('applications.interview', 'Schedule and conduct interviews', 'applications'),
  
  -- Placement Management
  ('placements.view', 'View placements', 'placements'),
  ('placements.create', 'Create new placements', 'placements'),
  ('placements.manage', 'Manage active placements', 'placements'),
  
  -- Timesheet Management
  ('timesheets.view', 'View timesheets', 'timesheets'),
  ('timesheets.submit', 'Submit timesheets', 'timesheets'),
  ('timesheets.approve', 'Approve timesheets', 'timesheets'),
  
  -- Reporting
  ('reports.view', 'View reports', 'reports'),
  ('reports.export', 'Export data and reports', 'reports'),
  ('reports.analytics', 'Access analytics dashboards', 'reports'),
  
  -- HR Management
  ('hr.view_employees', 'View employee information', 'hr'),
  ('hr.manage_leave', 'Manage leave requests', 'hr'),
  ('hr.manage_benefits', 'Manage employee benefits', 'hr'),
  ('hr.performance_reviews', 'Conduct performance reviews', 'hr'),
  
  -- System Administration
  ('system.settings', 'Manage system settings', 'system'),
  ('system.audit_logs', 'View audit logs', 'system'),
  ('system.integrations', 'Manage integrations', 'system')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- Insert Default Role Templates
-- ==========================================

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

-- ==========================================
-- Assign Permissions to Role Templates
-- ==========================================

-- Admin - All permissions
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
CROSS JOIN permissions p
WHERE rt.role_name = 'admin'
ON CONFLICT DO NOTHING;

-- Recruiter
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.assign',
  'jobs.view', 'jobs.create', 'jobs.edit',
  'applications.view', 'applications.manage', 'applications.interview',
  'reports.view', 'users.view'
)
WHERE rt.role_name = 'recruiter'
ON CONFLICT DO NOTHING;

-- Sales
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'clients.view', 'clients.create', 'clients.edit',
  'jobs.view', 'jobs.create',
  'candidates.view',
  'reports.view', 'users.view'
)
WHERE rt.role_name = 'sales'
ON CONFLICT DO NOTHING;

-- Account Manager
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'clients.view', 'clients.edit',
  'placements.view', 'placements.manage',
  'jobs.view',
  'reports.view', 'users.view'
)
WHERE rt.role_name = 'account_manager'
ON CONFLICT DO NOTHING;

-- Operations
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'placements.view', 'placements.create', 'placements.manage',
  'timesheets.view', 'timesheets.approve',
  'candidates.view',
  'reports.view', 'users.view'
)
WHERE rt.role_name = 'operations'
ON CONFLICT DO NOTHING;

-- HR
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'hr.view_employees', 'hr.manage_leave', 'hr.manage_benefits', 'hr.performance_reviews',
  'users.view', 'users.edit',
  'reports.view'
)
WHERE rt.role_name = 'hr'
ON CONFLICT DO NOTHING;

-- Employee
INSERT INTO role_template_permissions (role_template_id, permission_id)
SELECT rt.id, p.id
FROM role_templates rt
JOIN permissions p ON p.name IN (
  'timesheets.view', 'timesheets.submit',
  'users.view'
)
WHERE rt.role_name = 'employee'
ON CONFLICT DO NOTHING;

-- Student, Candidate, Client roles have minimal permissions (handled by specific portal access)

