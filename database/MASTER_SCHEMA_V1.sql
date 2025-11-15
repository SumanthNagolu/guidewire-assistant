-- ====================================================================
-- TRIKALA MASTER DATABASE SCHEMA V1.0
-- Unified schema for IntimeSolutions/Trikala Platform
-- Created: November 2025
-- Purpose: Consolidate all database schemas into single source of truth
-- ====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ====================================================================
-- PART 1: CORE USER SYSTEM (Universal across all modules)
-- ====================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS employee_records CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS system_events CASCADE;

-- Core user profiles table (single source of truth for all users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table for RBAC
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'student', 'employee', 'recruiter', 'admin', 'ceo', etc.
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-role junction table (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- System-wide event bus for cross-module communication
CREATE TABLE system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'course_completed', 'job_placed', 'employee_hired'
  source_module TEXT NOT NULL, -- 'academy', 'hr', 'crm', 'productivity'
  target_modules TEXT[] DEFAULT '{}',
  payload JSONB NOT NULL,
  processed_by TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ====================================================================
-- PART 2: ACADEMY/LMS TABLES
-- ====================================================================

-- Products (Guidewire modules)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (Sequential learning units)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  product_id UUID NOT NULL REFERENCES products(id),
  sequence INTEGER NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  prerequisites UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, sequence)
);

-- Topic content items
CREATE TABLE IF NOT EXISTS topic_content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'ppt', 'assignment', 'demo', 'link')),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  sequence INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, sequence)
);

-- Topic completions
CREATE TABLE IF NOT EXISTS topic_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, topic_id)
);

-- Student profiles (extends user_profiles for academy-specific data)
CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_product_id UUID REFERENCES products(id),
  assumed_persona TEXT,
  experience_level TEXT,
  learning_goals TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  completion_certificate_url TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  graduated_at TIMESTAMPTZ
);

-- AI conversations (for mentor, guru, etc.)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  type TEXT NOT NULL, -- 'mentor', 'guru', 'interview_bot', 'employee_bot'
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id),
  product_id UUID NOT NULL REFERENCES products(id),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken_minutes INTEGER
);

-- ====================================================================
-- PART 3: HR MANAGEMENT TABLES
-- ====================================================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee records (extends user_profiles for HR data)
CREATE TABLE employee_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  designation TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern', 'bench')),
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on-leave')),
  hire_date DATE NOT NULL,
  reporting_manager_id UUID REFERENCES employee_records(id),
  work_location TEXT,
  salary_currency TEXT DEFAULT 'USD',
  salary_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work shifts
CREATE TABLE IF NOT EXISTS work_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance logs
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employee_records(id),
  date DATE NOT NULL,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  shift_id UUID REFERENCES work_shifts(id),
  status TEXT DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Leave types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  days_allowed INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employee_records(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  entitled_days INTEGER NOT NULL,
  used_days DECIMAL(3,1) DEFAULT 0,
  remaining_days DECIMAL(3,1) GENERATED ALWAYS AS (entitled_days - used_days) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employee_records(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested DECIMAL(3,1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approver_id UUID REFERENCES employee_records(id),
  approved_at TIMESTAMPTZ,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PART 4: PRODUCTIVITY MONITORING TABLES
-- ====================================================================

-- Productivity sessions
CREATE TABLE IF NOT EXISTS productivity_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_active_time INTEGER DEFAULT 0,
  total_idle_time INTEGER DEFAULT 0,
  mouse_movements INTEGER DEFAULT 0,
  keystrokes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screenshot captures
CREATE TABLE IF NOT EXISTS productivity_screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  session_id UUID REFERENCES productivity_sessions(id),
  screenshot_url TEXT NOT NULL,
  thumbnail_url TEXT,
  activity_level INTEGER DEFAULT 0, -- 0-100 scale
  ai_analysis JSONB, -- AI-generated analysis
  ai_summary TEXT, -- AI-generated summary
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Context summaries (hierarchical: 15min, 1hr, 1day, 1week)
CREATE TABLE IF NOT EXISTS context_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  summary_type TEXT NOT NULL CHECK (summary_type IN ('15min', '1hour', '1day', '1week', '1month')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  summary_data JSONB NOT NULL,
  ai_insights TEXT,
  key_activities TEXT[],
  productivity_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_type, period_start)
);

-- Productivity scores
CREATE TABLE IF NOT EXISTS productivity_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  date DATE NOT NULL,
  overall_score INTEGER DEFAULT 0,
  active_time_score INTEGER DEFAULT 0,
  focus_score INTEGER DEFAULT 0,
  task_completion_score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ====================================================================
-- PART 5: PLATFORM/TRIKALA WORKFLOW TABLES
-- ====================================================================

-- Pods (team structures)
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'talent_acquisition', 'operations'
  description TEXT,
  manager_id UUID REFERENCES user_profiles(id),
  performance_target JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pod members
CREATE TABLE IF NOT EXISTS pod_members (
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'manager', 'recruiter', 'sourcer', 'screener'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (pod_id, user_id)
);

-- Workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL, -- Array of stage definitions
  default_sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id),
  object_type TEXT NOT NULL, -- 'job', 'candidate', 'leave_request', etc.
  object_id UUID NOT NULL,
  current_stage_id TEXT NOT NULL,
  assigned_pod_id UUID REFERENCES pods(id),
  assigned_user_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'stuck'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Workflow stage history
CREATE TABLE IF NOT EXISTS workflow_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  duration_minutes INTEGER
);

-- ====================================================================
-- PART 6: CRM/ATS TABLES
-- ====================================================================

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  current_title TEXT,
  current_company TEXT,
  years_experience INTEGER,
  skills TEXT[],
  location TEXT,
  visa_status TEXT,
  availability TEXT,
  expected_rate DECIMAL(10,2),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  size TEXT,
  type TEXT DEFAULT 'direct', -- 'direct', 'vendor', 'partner'
  status TEXT DEFAULT 'active',
  account_manager_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  remote_type TEXT, -- 'onsite', 'remote', 'hybrid'
  job_type TEXT, -- 'full-time', 'contract', 'c2c', 'w2'
  rate_min DECIMAL(10,2),
  rate_max DECIMAL(10,2),
  rate_type TEXT, -- 'hourly', 'annual'
  openings INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  status TEXT DEFAULT 'new',
  stage TEXT DEFAULT 'sourced',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  rejection_reason TEXT,
  UNIQUE(job_id, candidate_id)
);

-- Placements
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id),
  start_date DATE NOT NULL,
  end_date DATE,
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PART 7: AI LEARNING & SELF-OPTIMIZATION TABLES
-- ====================================================================

-- AI learning data
CREATE TABLE IF NOT EXISTS ai_learning_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  use_case TEXT NOT NULL, -- 'mentor', 'recruiter', 'productivity', 'ceo_insights'
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  outcome JSONB, -- success metrics, user feedback
  success_score DECIMAL(3,2), -- 0.00 to 1.00
  user_feedback TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML predictions
CREATE TABLE IF NOT EXISTS ml_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  prediction JSONB NOT NULL,
  confidence DECIMAL(3,2),
  actual_outcome JSONB,
  accuracy DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System feedback for self-learning
CREATE TABLE IF NOT EXISTS system_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  outcome TEXT NOT NULL, -- 'success', 'failure', 'partial'
  performance_metrics JSONB,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- ====================================================================

-- User system indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_system_events_status ON system_events(status);
CREATE INDEX idx_system_events_created_at ON system_events(created_at);

-- Academy indexes
CREATE INDEX idx_topics_product_sequence ON topics(product_id, sequence);
CREATE INDEX idx_topic_completions_user_topic ON topic_completions(user_id, topic_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);

-- HR indexes
CREATE INDEX idx_employee_records_user_id ON employee_records(user_id);
CREATE INDEX idx_attendance_logs_employee_date ON attendance_logs(employee_id, date);
CREATE INDEX idx_leave_requests_employee_status ON leave_requests(employee_id, status);

-- Productivity indexes
CREATE INDEX idx_productivity_sessions_user_time ON productivity_sessions(user_id, start_time);
CREATE INDEX idx_productivity_screenshots_user_time ON productivity_screenshots(user_id, captured_at);
CREATE INDEX idx_context_summaries_user_type_period ON context_summaries(user_id, summary_type, period_start);

-- Platform indexes
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_object ON workflow_instances(object_type, object_id);
CREATE INDEX idx_pod_members_user ON pod_members(user_id);

-- CRM indexes
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_jobs_client_status ON jobs(client_id, status);

-- ====================================================================
-- PART 9: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (expand as needed)
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can read topics" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own completions" ON topic_completions
  FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- PART 10: INITIAL DATA SEED
-- ====================================================================

-- Insert default roles
INSERT INTO roles (code, name, description) VALUES
  ('student', 'Student', 'Academy learner'),
  ('employee', 'Employee', 'Company employee'),
  ('recruiter', 'Recruiter', 'Recruitment team member'),
  ('sales', 'Sales', 'Sales team member'),
  ('hr_manager', 'HR Manager', 'Human resources manager'),
  ('admin', 'Administrator', 'System administrator'),
  ('ceo', 'CEO', 'Chief Executive Officer')
ON CONFLICT (code) DO NOTHING;

-- Insert default products
INSERT INTO products (code, name, description) VALUES
  ('CC', 'ClaimCenter', 'Guidewire ClaimCenter'),
  ('PC', 'PolicyCenter', 'Guidewire PolicyCenter'),
  ('BC', 'BillingCenter', 'Guidewire BillingCenter'),
  ('COMMON', 'Common Topics', 'Cross-product common topics')
ON CONFLICT (code) DO NOTHING;

-- Insert default leave types
INSERT INTO leave_types (name, days_allowed, is_paid) VALUES
  ('Annual Leave', 21, true),
  ('Sick Leave', 10, true),
  ('Personal Leave', 5, true),
  ('Unpaid Leave', 30, false)
ON CONFLICT (name) DO NOTHING;

-- Insert default workflow templates
INSERT INTO workflow_templates (code, name, stages, default_sla_hours) VALUES
  ('standard_recruiting', 'Standard Recruiting', 
   '[
     {"id": "sourcing", "name": "Sourcing", "type": "task"},
     {"id": "screening", "name": "Screening", "type": "review"},
     {"id": "submission", "name": "Client Submission", "type": "task"},
     {"id": "interview", "name": "Interview", "type": "wait"},
     {"id": "offer", "name": "Offer", "type": "review"},
     {"id": "placement", "name": "Placement", "type": "end"}
   ]'::jsonb, 
   72)
ON CONFLICT (code) DO NOTHING;

-- ====================================================================
-- END OF MASTER SCHEMA V1
-- ====================================================================

-- Note: This schema consolidates:
-- 1. Academy/LMS (training platform)
-- 2. HR Management System
-- 3. Productivity Monitoring
-- 4. Platform/Trikala Workflows
-- 5. CRM/ATS (recruiting)
-- 6. AI Learning System
-- 7. Unified User System
-- 8. Cross-module Event Bus

-- Migration notes:
-- 1. Backup existing data before running
-- 2. Run in transaction for atomicity
-- 3. Migrate data from old tables to new structure
-- 4. Update application code to use new table names
-- 5. Test thoroughly before production deployment
