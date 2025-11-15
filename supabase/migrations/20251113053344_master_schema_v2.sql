-- ============================================================================
-- TRIKALA MASTER SCHEMA V2.0
-- Unified Database Schema - Single Source of Truth
-- Created: 2025-01-13
-- ============================================================================
-- 
-- This schema consolidates 7 previously fragmented schemas into a single,
-- unified database design. It resolves all table collisions and creates
-- a cohesive foundation for the Trikala self-learning organism.
--
-- SECTIONS:
--   1. Core User System (Universal)
--   2. Academy Module (Training/LMS)
--   3. HR Module (Employee Management)
--   4. CRM Module (ATS/Recruiting)
--   5. Platform Module (Workflow & Pods)
--   6. Productivity Module (Activity Tracking)
--   7. Companions Module (AI Assistants)
--   8. Self-Learning Module (ML/Optimization)
--   9. Shared/Integration Tables
--
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For RAG/embeddings

-- ============================================================================
-- SECTION 1: CORE USER SYSTEM (Universal)
-- ============================================================================

-- Core user profiles table - SINGLE SOURCE OF TRUTH for all users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Unified role-based access control
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 'ceo', 'admin', 'recruiter', 'student', etc.
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0, -- Higher = more access (CEO=100, Student=1)
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_priority ON roles(priority DESC);

-- User-role junction table (many-to-many)
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
-- SECTION 2: ACADEMY MODULE (Training/LMS)
-- ============================================================================

-- Products table (ClaimCenter, PolicyCenter, BillingCenter, COMMON)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'CC', 'PC', 'BC', 'COMMON'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student-specific profile extension
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_product_id UUID REFERENCES products(id),
  assumed_persona TEXT, -- e.g., "10 years experienced"
  resume_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  learning_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics table (250 sequential topics)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Sequential order (1-250)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prerequisites JSONB DEFAULT '[]'::jsonb, -- Array of topic IDs
  duration_minutes INTEGER DEFAULT 60,
  content JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, position)
);

CREATE INDEX IF NOT EXISTS idx_topics_product_position ON topics(product_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(published) WHERE published = true;

-- Topic content items (videos, slides, demos)
CREATE TABLE IF NOT EXISTS topic_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'video', 'slide', 'demo', 'resource'
  title VARCHAR(255) NOT NULL,
  content_url TEXT,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_content_items_topic ON topic_content_items(topic_id, position);

-- Topic completions (progress tracking)
CREATE TABLE IF NOT EXISTS topic_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  completion_score INTEGER, -- 0-100
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
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
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

-- Interview simulations
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
  role VARCHAR(50) NOT NULL, -- 'user', 'assistant'
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

-- Learner reminder preferences
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
-- SECTION 3: HR MODULE (Employee Management)
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

-- Employee records - RENAMED from 'employees', links to user_profiles
CREATE TABLE IF NOT EXISTS employee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) UNIQUE NOT NULL, -- EMP-2025-0001
  
  -- Employment Details
  department_id UUID REFERENCES departments(id),
  designation VARCHAR(100),
  employment_type VARCHAR(50), -- 'Full-time', 'Part-time', 'Contract', 'Bench'
  employment_status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'On Leave', 'Terminated', 'Available'
  hire_date DATE NOT NULL,
  confirmation_date DATE,
  termination_date DATE,
  reporting_manager_id UUID REFERENCES employee_records(id),
  
  -- Personal Details
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  nationality VARCHAR(50),
  
  -- Contact Details
  personal_email VARCHAR(255),
  alternate_phone VARCHAR(20),
  
  -- Address
  current_address JSONB,
  permanent_address JSONB,
  
  -- Emergency Contact
  emergency_contact JSONB,
  
  -- Bank Details (encrypted)
  bank_details JSONB,
  
  -- Documents
  documents JSONB DEFAULT '[]',
  
  -- Metadata
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

-- Work Shifts
CREATE TABLE IF NOT EXISTS work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 60, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES work_shifts(id),
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  total_hours DECIMAL(5,2),
  break_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
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
  status VARCHAR(50) NOT NULL, -- 'Present', 'Absent', 'Leave', 'Holiday'
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id, date DESC);

-- Leave Types
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

-- Leave Balances
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

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approver_id UUID REFERENCES user_profiles(id),
  approver_comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id, start_date DESC);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Claims
CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  expense_category_id UUID REFERENCES expense_categories(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
  approver_id UUID REFERENCES user_profiles(id),
  approver_comments TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_claims_employee ON expense_claims(employee_id, expense_date DESC);

-- Performance History
CREATE TABLE IF NOT EXISTS performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  productivity_score INTEGER, -- From productivity module
  targets_met INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Templates (for offer letters, etc.)
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bench Profiles (for consultants available for placement)
CREATE TABLE IF NOT EXISTS bench_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  experience_level TEXT,
  availability VARCHAR(50) DEFAULT 'Immediate', -- 'Immediate', '2 weeks', '1 month'
  status VARCHAR(50) DEFAULT 'Available', -- 'Available', 'In Discussion', 'Placed'
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
-- SECTION 4: CRM MODULE (ATS/Recruiting)
-- ============================================================================

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Professional Details
  current_title VARCHAR(255),
  current_employer VARCHAR(255),
  years_of_experience DECIMAL(4,1),
  skills TEXT[],
  location VARCHAR(255),
  
  -- Documents
  resume_url TEXT,
  linkedin_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'placed', 'inactive'
  source VARCHAR(100), -- 'LinkedIn', 'Referral', 'Job Board'
  
  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_owner ON candidates(owner_id);

-- Clients (Employers)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  
  -- Contact Info
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  primary_contact_phone VARCHAR(20),
  
  -- Address
  address JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'prospect'
  
  -- Assignment
  account_manager_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);

-- Client Contacts
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

-- Jobs (Job Requisitions)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Job Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  job_type VARCHAR(50), -- 'Contract', 'Permanent', 'Contract-to-Hire'
  location VARCHAR(255),
  
  -- Requirements
  required_skills TEXT[],
  required_experience INTEGER, -- years
  required_submissions INTEGER DEFAULT 5,
  
  -- Compensation
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  
  -- Dates
  start_date DATE,
  deadline DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'filled', 'on_hold', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_id);

-- Applications (Candidate-Job linkage)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Status (14-stage pipeline)
  status VARCHAR(50) DEFAULT 'sourced',
  -- Stages: sourced, screened, submitted, client_interview_scheduled, 
  --         interviewing, offer_extended, offer_accepted, placed, etc.
  
  -- Metadata
  submitted_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  offer_date DATE,
  placement_date DATE,
  
  -- Assignment
  recruiter_id UUID REFERENCES user_profiles(id),
  
  -- Notes
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
  
  -- Placement Details
  start_date DATE NOT NULL,
  end_date DATE,
  bill_rate DECIMAL(10,2),
  pay_rate DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'terminated'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_placements_job ON placements(job_id);
CREATE INDEX IF NOT EXISTS idx_placements_candidate ON placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);

-- Placement Timesheets
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

-- Opportunities (Sales Pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Value
  estimated_value DECIMAL(12,2),
  probability INTEGER, -- 0-100
  
  -- Dates
  expected_close_date DATE,
  
  -- Status
  stage VARCHAR(50) DEFAULT 'prospecting',
  -- Stages: prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  
  status VARCHAR(50) DEFAULT 'open',
  
  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities (Notes, Calls, Emails, Meetings)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related Entities
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  
  -- Activity Details
  activity_type VARCHAR(50) NOT NULL, -- 'note', 'call', 'email', 'meeting', 'task'
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_candidate ON activities(candidate_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client ON activities(client_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_job ON activities(job_id, activity_date DESC);

-- ============================================================================
-- SECTION 5: PLATFORM MODULE (Workflow & Pods)
-- ============================================================================

-- Pods (Teams/Units) - UNIFIED pod system
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'training', 'sourcing', 'sales'
  description TEXT,
  
  -- Leadership
  manager_id UUID REFERENCES user_profiles(id),
  
  -- Performance Targets
  performance_target JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pods_type ON pods(type);
CREATE INDEX IF NOT EXISTS idx_pods_manager ON pods(manager_id);

-- Pod Members
CREATE TABLE IF NOT EXISTS pod_members (
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'manager', 'recruiter', 'sourcer', 'consultant', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (pod_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pod_members_pod ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user ON pod_members(user_id);

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('recruiting', 'onboarding', 'approval_chain', 'bench_sales', 'custom')),
  
  -- Workflow Definition
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  transitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Visual Designer Data
  designer_data JSONB DEFAULT '{}'::jsonb,
  
  -- SLA Configuration
  sla_config JSONB DEFAULT '{}',
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System templates can't be edited
  version INTEGER DEFAULT 1,
  
  -- Ownership
  created_by UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active);

-- Workflow Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id),
  
  -- Instance Details
  name TEXT NOT NULL,
  object_type TEXT NOT NULL, -- 'job', 'candidate', 'leave_request', 'expense_claim', 'employee'
  object_id UUID NOT NULL,
  
  -- Current State
  current_stage_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')) DEFAULT 'active',
  
  -- Assignment
  assigned_pod_id UUID REFERENCES pods(id),
  owner_id UUID REFERENCES user_profiles(id),
  
  -- Context Data
  context_data JSONB DEFAULT '{}'::jsonb,
  
  -- Progress Tracking
  stages_completed INTEGER DEFAULT 0,
  total_stages INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  
  -- SLA Tracking
  sla_deadline TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT false,
  
  -- Time Tracking
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

-- Workflow Stage History
CREATE TABLE IF NOT EXISTS workflow_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  
  -- Stage Transition
  from_stage_id TEXT,
  to_stage_id TEXT NOT NULL,
  
  -- Transition Metadata
  transitioned_by UUID REFERENCES user_profiles(id),
  transition_reason TEXT,
  
  -- Duration in Previous Stage
  duration_in_stage INTERVAL,
  
  -- Data Snapshot
  stage_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_stage_history_instance ON workflow_stage_history(instance_id, created_at);

-- Bottleneck Alerts
CREATE TABLE IF NOT EXISTS bottleneck_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id),
  
  -- Alert Details
  stuck_stage_id TEXT NOT NULL,
  stuck_duration INTERVAL NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- AI Analysis
  ai_suggestion TEXT,
  ai_confidence DECIMAL(3,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'dismissed'
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_workflow ON bottleneck_alerts(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_status ON bottleneck_alerts(status);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  
  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  task_type VARCHAR(50), -- 'sourcing', 'screening', 'approval', 'follow_up'
  
  -- Assignment
  assigned_to_user_id UUID REFERENCES user_profiles(id),
  assigned_to_pod_id UUID REFERENCES pods(id),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Dates
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
-- SECTION 6: PRODUCTIVITY MODULE (Activity Tracking)
-- ============================================================================
-- Using v3: ai-productivity-complete-schema.sql

-- Productivity Sessions
CREATE TABLE IF NOT EXISTS productivity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Session Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  session_type TEXT DEFAULT 'work_day', -- 'work_day', 'meeting', 'break'
  
  -- Activity Metrics
  mouse_movements INTEGER DEFAULT 0,
  keystrokes INTEGER DEFAULT 0,
  active_time INTEGER DEFAULT 0, -- seconds
  idle_time INTEGER DEFAULT 0, -- seconds
  
  -- Metadata
  device_info JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productivity_sessions_user ON productivity_sessions(user_id, start_time DESC);

-- Productivity Screenshots
CREATE TABLE IF NOT EXISTS productivity_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES productivity_sessions(id) ON DELETE CASCADE,
  
  -- Screenshot Data
  screenshot_url TEXT NOT NULL,
  thumbnail_url TEXT,
  captured_at TIMESTAMPTZ NOT NULL,
  
  -- AI Analysis (Claude Vision)
  ai_analyzed BOOLEAN DEFAULT false,
  application_detected TEXT,
  window_title TEXT,
  activity_description TEXT,
  work_category TEXT, -- 'coding', 'meeting', 'email', 'research', 'break'
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  
  -- AI Metadata
  ai_model TEXT DEFAULT 'claude-3.5-sonnet',
  ai_confidence DECIMAL(3,2),
  analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_user ON productivity_screenshots(user_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_session ON productivity_screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_analyzed ON productivity_screenshots(ai_analyzed);

-- Productivity Applications
CREATE TABLE IF NOT EXISTS productivity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES productivity_sessions(id) ON DELETE CASCADE,
  
  -- Application Details
  application_name TEXT NOT NULL,
  window_title TEXT,
  
  -- Time Tracking
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- seconds
  
  -- Categorization
  app_category TEXT, -- 'development', 'communication', 'browser', 'productivity'
  is_productive BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productivity_applications_user ON productivity_applications(user_id, start_time DESC);

-- Productivity Scores (Daily Aggregates)
CREATE TABLE IF NOT EXISTS productivity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Scores
  score INTEGER CHECK (score >= 0 AND score <= 100),
  active_time_score INTEGER CHECK (active_time_score >= 0 AND active_time_score <= 100),
  output_score INTEGER CHECK (output_score >= 0 AND output_score <= 100),
  
  -- Time Breakdown
  total_active_minutes INTEGER DEFAULT 0,
  productive_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,
  
  -- Category Breakdown
  category_scores JSONB DEFAULT '{}',
  
  -- AI Summary
  ai_summary TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_productivity_scores_user ON productivity_scores(user_id, date DESC);

-- Context Summaries (Hierarchical: 15min → 1hr → 1day → 1week)
CREATE TABLE IF NOT EXISTS context_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Time Window
  summary_level TEXT NOT NULL, -- '15min', '1hour', '1day', '1week'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- AI-Generated Summary
  summary TEXT NOT NULL,
  key_activities TEXT[],
  applications_used TEXT[],
  
  -- Metrics
  productivity_score INTEGER,
  total_screenshots INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_level, start_time)
);

CREATE INDEX IF NOT EXISTS idx_context_summaries_user ON context_summaries(user_id, summary_level, start_time DESC);

-- ============================================================================
-- SECTION 7: COMPANIONS MODULE (AI Assistants)
-- ============================================================================

-- AI Conversations (Shared by all AI features)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Conversation Type
  conversation_type TEXT NOT NULL, -- 'mentor', 'guru', 'employee_bot', 'interview', 'productivity_analysis'
  
  -- Context
  topic_id UUID REFERENCES topics(id),
  product_id UUID REFERENCES products(id),
  context JSONB DEFAULT '{}',
  
  -- Metadata
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(conversation_type);

-- AI Messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  
  -- Message Details
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  
  -- AI Metadata
  model TEXT, -- 'gpt-4o-mini', 'gpt-4o', 'claude-3.5-sonnet'
  tokens_used INTEGER,
  cost DECIMAL(10,6),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

-- AI Usage Tracking (for cost monitoring)
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL,
  model TEXT NOT NULL,
  
  -- Usage
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10,6) NOT NULL,
  
  -- Metadata
  request_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_tracking(user_id, request_date DESC);

-- ============================================================================
-- SECTION 8: SELF-LEARNING MODULE (ML/Optimization)
-- ============================================================================

-- System Feedback (Captures all events for learning)
CREATE TABLE IF NOT EXISTS system_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Information
  entity_type TEXT NOT NULL, -- 'job', 'candidate', 'workflow', 'pod', 'graduation', 'placement'
  entity_id UUID NOT NULL,
  
  -- Action Information
  action_type TEXT NOT NULL, -- 'workflow_step', 'ai_suggestion', 'pod_assignment', 'academy_to_hr_pipeline'
  outcome TEXT NOT NULL, -- 'success', 'failure', 'partial'
  
  -- Performance Metrics
  performance_metrics JSONB DEFAULT '{}',
  
  -- User Context
  user_id UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_feedback_entity ON system_feedback(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_feedback_action ON system_feedback(action_type, created_at DESC);

-- ML Predictions
CREATE TABLE IF NOT EXISTS ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Model Information
  model_name TEXT NOT NULL, -- 'job_fill_time', 'candidate_success', 'pod_performance'
  model_version TEXT DEFAULT '1.0',
  
  -- Entity Information
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Prediction
  prediction JSONB NOT NULL, -- {predicted_value, confidence, factors}
  
  -- Actual Outcome (filled after prediction is validated)
  actual_outcome JSONB,
  
  -- Accuracy
  accuracy_score DECIMAL(5,4), -- Calculated after actual outcome
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_model ON ml_predictions(model_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_entity ON ml_predictions(entity_type, entity_id);

-- Optimization Suggestions (AI-generated improvements)
CREATE TABLE IF NOT EXISTS optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Suggestion Details
  suggestion_type TEXT NOT NULL, -- 'workflow_change', 'routing_optimization', 'target_adjustment', 'reassign_task'
  current_state JSONB NOT NULL,
  suggested_change JSONB NOT NULL,
  
  -- Expected Impact
  expected_improvement DECIMAL(5,2), -- Percentage improvement
  confidence DECIMAL(3,2), -- 0-1
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'implemented', 'rejected', 'cancelled')),
  
  -- Implementation
  implemented_by UUID REFERENCES user_profiles(id),
  implemented_at TIMESTAMPTZ,
  
  -- Validation
  actual_improvement DECIMAL(5,2), -- Measured after implementation
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_status ON optimization_suggestions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_suggestions_type ON optimization_suggestions(suggestion_type);

-- Learning Loop Metrics (Aggregated insights)
CREATE TABLE IF NOT EXISTS learning_loop_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metrics
  optimizations_applied INTEGER DEFAULT 0,
  avg_improvement DECIMAL(5,2),
  predictions_made INTEGER DEFAULT 0,
  prediction_accuracy DECIMAL(5,4),
  
  -- Key Insights
  key_insights TEXT[],
  bottlenecks_detected INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: SHARED/INTEGRATION TABLES
-- ============================================================================

-- Notifications (System-wide)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
  category TEXT, -- 'workflow', 'task', 'approval', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Entity
  related_entity_type TEXT,
  related_entity_id UUID,
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Audit Logs (All critical actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Information
  user_id UUID REFERENCES user_profiles(id),
  
  -- Action Details
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'approve', 'reject'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- Media Files (Centralized file storage)
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File Details
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio'
  mime_type TEXT,
  file_size BIGINT, -- bytes
  storage_url TEXT NOT NULL,
  
  -- Related Entity
  entity_type TEXT,
  entity_id UUID,
  
  -- Metadata
  uploaded_by UUID REFERENCES user_profiles(id),
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_entity ON media_files(entity_type, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
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

-- Basic RLS Policies (Users can access their own data)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own completions" ON topic_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON topic_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own productivity sessions" ON productivity_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own productivity sessions" ON productivity_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own screenshots" ON productivity_screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenshots" ON productivity_screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public read policies (for published content)
CREATE POLICY "Anyone can view published topics" ON topics FOR SELECT USING (published = true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (is_active = true);

-- Admin policies (full access for admins/CEO)
-- Note: Implement function to check if user has admin/ceo role

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_records_updated_at BEFORE UPDATE ON employee_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate leave balance
CREATE OR REPLACE FUNCTION calculate_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_days = NEW.total_days - NEW.used_days;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leave_balance BEFORE INSERT OR UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION calculate_leave_balance();

-- ============================================================================
-- SEED DATA - Default Roles
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
-- SEED DATA - Default Departments
-- ============================================================================

INSERT INTO departments (code, name, description) VALUES
  ('BENCH_SALES', 'Bench Sales', 'Bench consultant marketing and placement'),
  ('RECRUITING', 'Recruiting', 'Talent acquisition and sourcing'),
  ('SALES', 'Sales', 'Client acquisition and management'),
  ('OPERATIONS', 'Operations', 'Operations and delivery'),
  ('TRAINING', 'Training', 'Academy and training programs'),
  ('ADMIN', 'Administration', 'Administrative and support functions')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DATA - Default Pods
-- ============================================================================

INSERT INTO pods (code, name, type, description, is_active) VALUES
  ('BENCH_SALES_GW', 'Bench Sales - Guidewire', 'bench_sales', 'Guidewire consultant marketing pod', true),
  ('RECRUITING_GW', 'Recruiting - Guidewire', 'recruiting', 'Guidewire recruiting pod', true),
  ('SOURCING', 'Sourcing Team', 'sourcing', 'Candidate sourcing pod', true),
  ('SALES_ENTERPRISE', 'Enterprise Sales', 'sales', 'Enterprise client acquisition', true),
  ('TRAINING_ACADEMY', 'Training Academy', 'training', 'Student training and support', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DATA - Default Workflow Templates
-- ============================================================================

INSERT INTO workflow_templates (code, name, category, description, stages, is_system) VALUES
  ('standard_recruiting', 'Standard Recruiting Workflow', 'recruiting', '9-stage recruiting process',
   '[
     {"id": "sourcing", "name": "Sourcing", "order": 1},
     {"id": "screening", "name": "Screening", "order": 2},
     {"id": "submission", "name": "Submission", "order": 3},
     {"id": "client_review", "name": "Client Review", "order": 4},
     {"id": "interview_scheduling", "name": "Interview Scheduling", "order": 5},
     {"id": "interviewing", "name": "Interviewing", "order": 6},
     {"id": "offer", "name": "Offer", "order": 7},
     {"id": "onboarding", "name": "Onboarding", "order": 8},
     {"id": "placed", "name": "Placed", "order": 9}
   ]'::jsonb,
   true),
  ('employee_onboarding', 'Employee Onboarding', 'onboarding', 'New employee onboarding process',
   '[
     {"id": "documentation", "name": "Documentation", "order": 1},
     {"id": "setup", "name": "Setup", "order": 2},
     {"id": "training", "name": "Training", "order": 3},
     {"id": "complete", "name": "Complete", "order": 4}
   ]'::jsonb,
   true),
  ('approval_chain', 'Approval Chain', 'approval_chain', 'Standard approval workflow',
   '[
     {"id": "pending", "name": "Pending", "order": 1},
     {"id": "manager_review", "name": "Manager Review", "order": 2},
     {"id": "approved", "name": "Approved", "order": 3}
   ]'::jsonb,
   true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DATA - Leave Types
-- ============================================================================

INSERT INTO leave_types (code, name, max_days_per_year, is_paid) VALUES
  ('ANNUAL', 'Annual Leave', 20, true),
  ('SICK', 'Sick Leave', 10, true),
  ('PERSONAL', 'Personal Leave', 5, true),
  ('UNPAID', 'Unpaid Leave', NULL, false)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED DATA - Expense Categories
-- ============================================================================

INSERT INTO expense_categories (code, name) VALUES
  ('TRAVEL', 'Travel'),
  ('MEALS', 'Meals & Entertainment'),
  ('SUPPLIES', 'Office Supplies'),
  ('TRAINING', 'Training & Development'),
  ('OTHER', 'Other')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- END OF MASTER SCHEMA V2.0
-- ============================================================================

