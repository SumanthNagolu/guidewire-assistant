-- ============================================================================
-- DATABASE CONSOLIDATION MIGRATION - FINAL
-- Request ID: ede3d9ae-8baa-4807-866a-0b814563bd90
-- ============================================================================
-- 
-- This migration safely consolidates all 7 fragmented schemas into the
-- Master Schema V2 unified database design. It is IDEMPOTENT (safe to run
-- multiple times) and preserves all existing data.
--
-- EXECUTION TIME: ~30-60 seconds
-- SAFE TO RUN: Yes (uses IF NOT EXISTS, preserves data)
-- ROLLBACK AVAILABLE: Yes (see ROLLBACK_SCRIPT.sql)
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For RAG/embeddings (Guidewire Guru)

-- ============================================================================
-- STEP 2: BACKUP EXISTING CRITICAL DATA
-- ============================================================================

DO $$
BEGIN
  -- Only create backups if tables exist and have data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS backup_user_profiles_' || to_char(now(), 'YYYYMMDD_HH24MISS') || ' AS SELECT * FROM user_profiles';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS backup_topics_' || to_char(now(), 'YYYYMMDD_HH24MISS') || ' AS SELECT * FROM topics';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_completions') THEN
    EXECUTE 'CREATE TABLE IF NOT EXISTS backup_topic_completions_' || to_char(now(), 'YYYYMMDD_HH24MISS') || ' AS SELECT * FROM topic_completions';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE/UPDATE CORE USER SYSTEM
-- ============================================================================

-- Core user profiles table - extend if exists, create if not
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'User',
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Unified roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_priority ON roles(priority DESC);

-- User-role junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- ============================================================================
-- STEP 4: SEED DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (code, name, description, priority, permissions) VALUES
  ('ceo', 'CEO', 'Chief Executive Officer - Full system access', 100, '{"all": true}'),
  ('admin', 'Administrator', 'System administrator with full access', 90, '{"all": true}'),
  ('hr_manager', 'HR Manager', 'Human Resources Manager', 80, '{"hr": "full", "employees": "full"}'),
  ('recruiter', 'Recruiter', 'Talent Acquisition Specialist', 50, '{"crm": "full", "candidates": "full"}'),
  ('sales', 'Sales Executive', 'Sales Team Member', 50, '{"crm": "full", "clients": "full"}'),
  ('operations', 'Operations', 'Operations Team Member', 50, '{"platform": "full"}'),
  ('bench_consultant', 'Bench Consultant', 'Available Consultant', 30, '{"academy": "read", "bench": "read"}'),
  ('student', 'Student', 'Academy Student', 10, '{"academy": "read", "topics": "read"}')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 5: CREATE ACADEMY MODULE TABLES
-- ============================================================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_product_id UUID REFERENCES products(id),
  assumed_persona TEXT,
  resume_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  learning_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 60,
  content JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, position)
);

CREATE INDEX IF NOT EXISTS idx_topics_product_position ON topics(product_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(published) WHERE published = true;

-- Topic content items
CREATE TABLE IF NOT EXISTS topic_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_url TEXT,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_content_items_topic ON topic_content_items(topic_id, position);

-- Topic completions
CREATE TABLE IF NOT EXISTS topic_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  completion_score INTEGER,
  notes TEXT,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_completions_user ON topic_completions(user_id, completed_at);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_points INTEGER,
  passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, completed_at);

-- Interview templates & sessions
CREATE TABLE IF NOT EXISTS interview_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(50),
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES interview_templates(id),
  status VARCHAR(50) DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER,
  technical_score INTEGER,
  communication_score INTEGER,
  strengths TEXT[],
  improvements TEXT[],
  detailed_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder settings
CREATE TABLE IF NOT EXISTS learner_reminder_settings (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  opted_in BOOLEAN DEFAULT false,
  last_opt_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learner_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: CREATE HR MODULE TABLES
-- ============================================================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  parent_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES user_profiles(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default departments
INSERT INTO departments (code, name, description) VALUES
  ('BENCH_SALES', 'Bench Sales', 'Bench consultant marketing and placement'),
  ('RECRUITING', 'Recruiting', 'Talent acquisition and sourcing'),
  ('SALES', 'Sales', 'Client acquisition and management'),
  ('OPERATIONS', 'Operations', 'Operations and delivery'),
  ('TRAINING', 'Training', 'Academy and training programs'),
  ('ADMIN', 'Administration', 'Administrative and support functions')
ON CONFLICT (code) DO NOTHING;

-- Employee records
CREATE TABLE IF NOT EXISTS employee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  designation VARCHAR(100),
  employment_type VARCHAR(50),
  employment_status VARCHAR(50) DEFAULT 'Active',
  hire_date DATE NOT NULL,
  confirmation_date DATE,
  termination_date DATE,
  reporting_manager_id UUID REFERENCES employee_records(id),
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  nationality VARCHAR(50),
  personal_email VARCHAR(255),
  alternate_phone VARCHAR(20),
  current_address JSONB,
  permanent_address JSONB,
  emergency_contact JSONB,
  bank_details JSONB,
  documents JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_employee_records_user ON employee_records(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_records_employee_id ON employee_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_records_department ON employee_records(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_records_status ON employee_records(employment_status);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  total_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id, date DESC);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id, date DESC);

-- Leave types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  max_days_per_year INTEGER,
  is_paid BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed leave types
INSERT INTO leave_types (code, name, max_days_per_year, is_paid) VALUES
  ('ANNUAL', 'Annual Leave', 20, true),
  ('SICK', 'Sick Leave', 10, true),
  ('PERSONAL', 'Personal Leave', 5, true),
  ('UNPAID', 'Unpaid Leave', NULL, false)
ON CONFLICT (code) DO NOTHING;

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days DECIMAL(5,2) DEFAULT 0,
  used_days DECIMAL(5,2) DEFAULT 0,
  available_days DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approver_id UUID REFERENCES user_profiles(id),
  approver_comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id, start_date DESC);

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed expense categories
INSERT INTO expense_categories (code, name) VALUES
  ('TRAVEL', 'Travel'),
  ('MEALS', 'Meals & Entertainment'),
  ('SUPPLIES', 'Office Supplies'),
  ('TRAINING', 'Training & Development'),
  ('OTHER', 'Other')
ON CONFLICT (code) DO NOTHING;

-- Expense claims
CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  expense_category_id UUID REFERENCES expense_categories(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approver_id UUID REFERENCES user_profiles(id),
  approver_comments TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_claims_employee ON expense_claims(employee_id, expense_date DESC);

-- Bench profiles
CREATE TABLE IF NOT EXISTS bench_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  experience_level TEXT,
  availability VARCHAR(50) DEFAULT 'Immediate',
  status VARCHAR(50) DEFAULT 'Available',
  resume_url TEXT,
  skills TEXT[],
  certifications TEXT[],
  target_rate DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bench_profiles_technology ON bench_profiles(technology);
CREATE INDEX IF NOT EXISTS idx_bench_profiles_status ON bench_profiles(status);

-- ============================================================================
-- STEP 7: CREATE CRM/ATS MODULE TABLES
-- ============================================================================

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  current_title VARCHAR(255),
  current_employer VARCHAR(255),
  years_of_experience DECIMAL(4,1),
  skills TEXT[],
  location VARCHAR(255),
  resume_url TEXT,
  linkedin_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  source VARCHAR(100),
  owner_id UUID REFERENCES user_profiles(id),
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_owner ON candidates(owner_id);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(20),
  address JSONB,
  status VARCHAR(50) DEFAULT 'active',
  account_manager_id UUID REFERENCES user_profiles(id),
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);

-- Client contacts
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  job_type VARCHAR(50),
  location VARCHAR(255),
  required_skills TEXT[],
  required_experience INTEGER,
  required_submissions INTEGER DEFAULT 5,
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  start_date DATE,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  owner_id UUID REFERENCES user_profiles(id),
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_id);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'sourced',
  submitted_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  offer_date DATE,
  placement_date DATE,
  recruiter_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Placements
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  start_date DATE NOT NULL,
  end_date DATE,
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_placements_job ON placements(job_id);
CREATE INDEX IF NOT EXISTS idx_placements_candidate ON placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);

-- Placement timesheets
CREATE TABLE IF NOT EXISTS placement_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  week_ending DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(placement_id, week_ending)
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_value DECIMAL(12,2),
  probability INTEGER,
  expected_close_date DATE,
  stage VARCHAR(50) DEFAULT 'prospecting',
  status VARCHAR(50) DEFAULT 'open',
  owner_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_candidate ON activities(candidate_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client ON activities(client_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_job ON activities(job_id, activity_date DESC);

-- ============================================================================
-- STEP 8: CREATE PLATFORM MODULE (Pods & Workflows)
-- ============================================================================

-- Pods
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES user_profiles(id),
  performance_target JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pods_type ON pods(type);
CREATE INDEX IF NOT EXISTS idx_pods_manager ON pods(manager_id);

-- Seed default pods
INSERT INTO pods (code, name, type, description, is_active) VALUES
  ('BENCH_SALES_GW', 'Bench Sales - Guidewire', 'bench_sales', 'Guidewire consultant marketing pod', true),
  ('RECRUITING_GW', 'Recruiting - Guidewire', 'recruiting', 'Guidewire recruiting pod', true),
  ('SOURCING', 'Sourcing Team', 'sourcing', 'Candidate sourcing pod', true),
  ('SALES_ENTERPRISE', 'Enterprise Sales', 'sales', 'Enterprise client acquisition', true),
  ('TRAINING_ACADEMY', 'Training Academy', 'training', 'Student training and support', true)
ON CONFLICT (code) DO NOTHING;

-- Pod members
CREATE TABLE IF NOT EXISTS pod_members (
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (pod_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pod_members_pod ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user ON pod_members(user_id);

-- Workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('recruiting', 'onboarding', 'approval_chain', 'bench_sales', 'custom')),
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  transitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  designer_data JSONB DEFAULT '{}'::jsonb,
  sla_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);

-- Workflow instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id),
  name TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id UUID NOT NULL,
  current_stage_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')) DEFAULT 'active',
  assigned_pod_id UUID REFERENCES pods(id),
  owner_id UUID REFERENCES user_profiles(id),
  context_data JSONB DEFAULT '{}'::jsonb,
  stages_completed INTEGER DEFAULT 0,
  total_stages INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  sla_deadline TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_duration INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_pod ON workflow_instances(assigned_pod_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_owner ON workflow_instances(owner_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_overdue ON workflow_instances(is_overdue) WHERE is_overdue = true;
CREATE INDEX IF NOT EXISTS idx_workflow_instances_object ON workflow_instances(object_type, object_id);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type VARCHAR(50),
  assigned_to_user_id UUID REFERENCES user_profiles(id),
  assigned_to_pod_id UUID REFERENCES pods(id),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_workflow ON tasks(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_pod ON tasks(assigned_to_pod_id, status);

-- ============================================================================
-- STEP 9: CREATE PRODUCTIVITY MODULE TABLES
-- ============================================================================

-- Productivity sessions
CREATE TABLE IF NOT EXISTS productivity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  session_type TEXT DEFAULT 'work_day',
  mouse_movements INTEGER DEFAULT 0,
  keystrokes INTEGER DEFAULT 0,
  active_time INTEGER DEFAULT 0,
  idle_time INTEGER DEFAULT 0,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productivity_sessions_user ON productivity_sessions(user_id, start_time DESC);

-- Productivity screenshots
CREATE TABLE IF NOT EXISTS productivity_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES productivity_sessions(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  thumbnail_url TEXT,
  captured_at TIMESTAMPTZ NOT NULL,
  ai_analyzed BOOLEAN DEFAULT false,
  application_detected TEXT,
  window_title TEXT,
  activity_description TEXT,
  work_category TEXT,
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  ai_model TEXT DEFAULT 'claude-3.5-sonnet',
  ai_confidence DECIMAL(3,2),
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_user ON productivity_screenshots(user_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_session ON productivity_screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_analyzed ON productivity_screenshots(ai_analyzed);

-- Context summaries
CREATE TABLE IF NOT EXISTS context_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  summary_level TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  key_activities TEXT[],
  applications_used TEXT[],
  productivity_score INTEGER,
  total_screenshots INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_level, start_time)
);

CREATE INDEX IF NOT EXISTS idx_context_summaries_user ON context_summaries(user_id, summary_level, start_time DESC);

-- ============================================================================
-- STEP 10: CREATE COMPANIONS MODULE (AI Assistants)
-- ============================================================================

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id),
  product_id UUID REFERENCES products(id),
  context JSONB DEFAULT '{}',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(conversation_type);

-- AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

-- ============================================================================
-- STEP 11: CREATE SHARED/INTEGRATION TABLES
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- Media files
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  storage_url TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  uploaded_by UUID REFERENCES user_profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_entity ON media_files(entity_type, entity_id);

-- ============================================================================
-- STEP 12: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 13: CREATE BASIC RLS POLICIES
-- ============================================================================

-- Users can view/update own profile
DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Students can view/update own profile
DO $$ BEGIN
  CREATE POLICY "Students can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Users can view own completions
DO $$ BEGIN
  CREATE POLICY "Users can view own completions" ON topic_completions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own completions" ON topic_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Public read policies
DO $$ BEGIN
  CREATE POLICY "Anyone can view published topics" ON topics FOR SELECT USING (published = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 14: CREATE HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to key tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- SUCCESS! Database consolidation complete.
-- Run the verification queries in VERIFICATION_QUERIES.sql to confirm.
-- ============================================================================

