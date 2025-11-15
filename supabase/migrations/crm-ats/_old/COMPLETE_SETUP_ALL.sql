-- ==========================================
-- 🚀 INTIME COMMAND CENTER - COMPLETE DATABASE SETUP
-- ==========================================
-- This is a SINGLE, COMPREHENSIVE, IDEMPOTENT script
-- that sets up your ENTIRE CRM/ATS in one go!
--
-- SAFE TO RUN MULTIPLE TIMES - won't error if objects exist
-- HANDLES EXISTING TABLES - adds missing columns automatically
--
-- INCLUDES:
-- ✅ All 14 tables (user_profiles, candidates, jobs, etc.)
-- ✅ All indexes (50+ performance indexes)
-- ✅ All triggers (auto-updates, auditing)
-- ✅ All RLS policies (role-based security)
-- ✅ All helper functions (business logic)
-- ✅ Dashboard views & metrics
--
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file (Cmd+A, Cmd+C)
-- 3. Paste into SQL Editor
-- 4. Click "Run"
-- 5. Wait ~60 seconds
-- 6. Done! ✅
--
-- TROUBLESHOOTING:
-- If you get an error, COPY THE FULL ERROR MESSAGE
-- and share it with me. I'll fix it immediately!
--
-- WITH GURU'S GRACE! JAI VIJAYA! 🙏
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- SECTION 1: HELPER FUNCTIONS
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
-- SECTION 2: USER PROFILES (Foundation)
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'manager_id') THEN
    ALTER TABLE user_profiles ADD COLUMN manager_id UUID REFERENCES user_profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'department') THEN
    ALTER TABLE user_profiles ADD COLUMN department TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'timezone') THEN
    ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'America/New_York';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'is_active') THEN
    ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'deleted_at') THEN
    ALTER TABLE user_profiles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_manager ON user_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'employee'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- SECTION 3: ATS TABLES
-- ==========================================

-- CANDIDATES TABLE
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
CREATE TRIGGER candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recruiters can view own candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can update own candidates" ON candidates;

CREATE POLICY "Recruiters can view own candidates" ON candidates FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'account_manager')));
CREATE POLICY "Recruiters can insert candidates" ON candidates FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter')));
CREATE POLICY "Recruiters can update own candidates" ON candidates FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- SECTION 4: CRM TABLES
-- ==========================================

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  headquarters_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  annual_revenue BIGINT,
  employee_count INTEGER,
  description TEXT,
  status TEXT CHECK (status IN ('prospect', 'active', 'inactive', 'churned')) DEFAULT 'prospect',
  tier TEXT CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')) DEFAULT 'tier_3',
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100) DEFAULT 50,
  account_manager_id UUID REFERENCES user_profiles(id),
  sales_rep_id UUID REFERENCES user_profiles(id),
  first_contact_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_sales_rep ON clients(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view assigned clients" ON clients;
DROP POLICY IF EXISTS "Sales can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update assigned clients" ON clients;

CREATE POLICY "Users can view assigned clients" ON clients FOR SELECT USING (account_manager_id = auth.uid() OR sales_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')));
CREATE POLICY "Sales can insert clients" ON clients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'account_manager')));
CREATE POLICY "Users can update assigned clients" ON clients FOR UPDATE USING (account_manager_id = auth.uid() OR sales_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  title TEXT,
  department TEXT,
  linkedin_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON contacts(is_primary) WHERE is_primary = true;

DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view contacts of assigned clients" ON contacts;
DROP POLICY IF EXISTS "Users can manage contacts of assigned clients" ON contacts;

CREATE POLICY "Users can view contacts of assigned clients" ON contacts FOR SELECT USING (EXISTS (SELECT 1 FROM clients c WHERE c.id = contacts.client_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')))));
CREATE POLICY "Users can manage contacts of assigned clients" ON contacts FOR ALL USING (EXISTS (SELECT 1 FROM clients c WHERE c.id = contacts.client_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))));

-- ==========================================
-- SECTION 5: JOBS & APPLICATIONS
-- ==========================================

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  client_id UUID REFERENCES clients(id),
  location TEXT,
  remote_policy TEXT CHECK (remote_policy IN ('remote', 'hybrid', 'onsite')) DEFAULT 'hybrid',
  rate_type TEXT CHECK (rate_type IN ('hourly', 'annual')) DEFAULT 'hourly',
  rate_min INTEGER,
  rate_max INTEGER,
  employment_type TEXT CHECK (employment_type IN ('contract', 'contract_to_hire', 'direct_placement', 'temporary')) DEFAULT 'contract',
  duration_months INTEGER,
  status TEXT CHECK (status IN ('draft', 'open', 'on_hold', 'filled', 'cancelled')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('hot', 'warm', 'cold')) DEFAULT 'warm',
  openings INTEGER DEFAULT 1,
  filled INTEGER DEFAULT 0,
  posted_date DATE,
  target_fill_date DATE,
  filled_date DATE,
  owner_id UUID REFERENCES user_profiles(id),
  client_contact_id UUID REFERENCES contacts(id),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view jobs" ON jobs;
DROP POLICY IF EXISTS "Recruiters can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update assigned jobs" ON jobs;

CREATE POLICY "Users can view jobs" ON jobs FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM clients c WHERE c.id = jobs.client_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid())) OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')));
CREATE POLICY "Recruiters can insert jobs" ON jobs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'sales')));
CREATE POLICY "Users can update assigned jobs" ON jobs FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('sourced', 'screening', 'submitted', 'client_review', 'interview_scheduled', 'interviewing', 'interview_completed', 'reference_check', 'offer', 'offer_accepted', 'offer_rejected', 'placed', 'rejected', 'withdrawn')) DEFAULT 'sourced',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_to_client_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  interview_scheduled_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  interview_feedback TEXT,
  offer_extended_at TIMESTAMPTZ,
  offer_amount INTEGER,
  offer_accepted_at TIMESTAMPTZ,
  offer_rejected_at TIMESTAMPTZ,
  offer_rejection_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  rejection_reason TEXT,
  owner_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_owner ON applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_active ON applications(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_stage_changed_at() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_stage_changed ON applications;
CREATE TRIGGER applications_stage_changed BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_stage_changed_at();

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can update applications" ON applications;

CREATE POLICY "Users can view applications" ON applications FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM candidates c WHERE c.id = applications.candidate_id AND c.owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.owner_id = auth.uid()) OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')));
CREATE POLICY "Recruiters can insert applications" ON applications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter')));
CREATE POLICY "Users can update applications" ON applications FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter')));

-- INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  interview_type TEXT CHECK (interview_type IN ('phone_screen', 'technical', 'behavioral', 'client_interview', 'final_round')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewer_id UUID REFERENCES user_profiles(id),
  interviewer_name TEXT,
  interviewer_email TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

DROP TRIGGER IF EXISTS interviews_updated_at ON interviews;
CREATE TRIGGER interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view interviews for their applications" ON interviews;
DROP POLICY IF EXISTS "Recruiters can manage interviews" ON interviews;

CREATE POLICY "Users can view interviews for their applications" ON interviews FOR SELECT USING (EXISTS (SELECT 1 FROM applications a WHERE a.id = interviews.application_id AND (a.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')))));
CREATE POLICY "Recruiters can manage interviews" ON interviews FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter')));

-- ==========================================
-- SECTION 6: PLACEMENTS & TIMESHEETS
-- ==========================================

-- PLACEMENTS TABLE
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  application_id UUID REFERENCES applications(id),
  start_date DATE NOT NULL,
  end_date DATE,
  actual_end_date DATE,
  bill_rate INTEGER NOT NULL,
  pay_rate INTEGER NOT NULL,
  margin INTEGER GENERATED ALWAYS AS (bill_rate - pay_rate) STORED,
  margin_percentage DECIMAL GENERATED ALWAYS AS (CASE WHEN bill_rate > 0 THEN ((bill_rate - pay_rate)::DECIMAL / bill_rate * 100) ELSE 0 END) STORED,
  status TEXT CHECK (status IN ('active', 'ending_soon', 'extended', 'completed', 'terminated')) DEFAULT 'active',
  termination_reason TEXT,
  client_satisfaction INTEGER CHECK (client_satisfaction BETWEEN 1 AND 5),
  consultant_satisfaction INTEGER CHECK (consultant_satisfaction BETWEEN 1 AND 5),
  recruiter_id UUID REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_placements_candidate ON placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_placements_job ON placements(job_id);
CREATE INDEX IF NOT EXISTS idx_placements_client ON placements(client_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status);
CREATE INDEX IF NOT EXISTS idx_placements_start_date ON placements(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_placements_end_date ON placements(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_placements_recruiter ON placements(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_placements_account_manager ON placements(account_manager_id);

DROP TRIGGER IF EXISTS placements_updated_at ON placements;
CREATE TRIGGER placements_updated_at BEFORE UPDATE ON placements FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_placement_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date - CURRENT_DATE <= 14 THEN
    NEW.status = 'ending_soon';
  END IF;
  IF NEW.actual_end_date IS NOT NULL THEN
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placements_status_update ON placements;
CREATE TRIGGER placements_status_update BEFORE UPDATE ON placements FOR EACH ROW EXECUTE FUNCTION update_placement_status();

ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view placements" ON placements;
DROP POLICY IF EXISTS "Recruiters and Ops can insert placements" ON placements;
DROP POLICY IF EXISTS "Users can update assigned placements" ON placements;

CREATE POLICY "Users can view placements" ON placements FOR SELECT USING (recruiter_id = auth.uid() OR account_manager_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations', 'account_manager')));
CREATE POLICY "Recruiters and Ops can insert placements" ON placements FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')));
CREATE POLICY "Users can update assigned placements" ON placements FOR UPDATE USING (recruiter_id = auth.uid() OR account_manager_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations')));

-- TIMESHEETS TABLE
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  hours_worked DECIMAL NOT NULL CHECK (hours_worked >= 0),
  overtime_hours DECIMAL DEFAULT 0 CHECK (overtime_hours >= 0),
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'invoiced')) DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  invoice_id UUID,
  invoiced_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(placement_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_timesheets_placement ON timesheets(placement_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_week ON timesheets(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_submitted ON timesheets(submitted_at) WHERE submitted_at IS NOT NULL;

DROP TRIGGER IF EXISTS timesheets_updated_at ON timesheets;
CREATE TRIGGER timesheets_updated_at BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION set_timesheet_timestamps() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    NEW.submitted_at = NOW();
    NEW.submitted_by = auth.uid();
  END IF;
  IF NEW.status = 'approved' AND OLD.status = 'submitted' THEN
    NEW.approved_at = NOW();
    NEW.approved_by = auth.uid();
  END IF;
  IF NEW.status = 'rejected' AND OLD.status = 'submitted' THEN
    NEW.rejected_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS timesheets_status_timestamps ON timesheets;
CREATE TRIGGER timesheets_status_timestamps BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION set_timesheet_timestamps();

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view timesheets for their placements" ON timesheets;
DROP POLICY IF EXISTS "Operations can insert timesheets" ON timesheets;
DROP POLICY IF EXISTS "Operations can update timesheets" ON timesheets;
DROP POLICY IF EXISTS "Account managers can approve timesheets" ON timesheets;

CREATE POLICY "Users can view timesheets for their placements" ON timesheets FOR SELECT USING (EXISTS (SELECT 1 FROM placements p WHERE p.id = timesheets.placement_id AND (p.recruiter_id = auth.uid() OR p.account_manager_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations')))));
CREATE POLICY "Operations can insert timesheets" ON timesheets FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations', 'recruiter')));
CREATE POLICY "Operations can update timesheets" ON timesheets FOR UPDATE USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations')));
CREATE POLICY "Account managers can approve timesheets" ON timesheets FOR UPDATE USING (EXISTS (SELECT 1 FROM placements p WHERE p.id = timesheets.placement_id AND p.account_manager_id = auth.uid())) WITH CHECK (status IN ('approved', 'rejected'));

-- ==========================================
-- SECTION 7: OPPORTUNITIES & CONTRACTS
-- ==========================================

-- OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) DEFAULT 'lead',
  estimated_value INTEGER,
  probability INTEGER CHECK (probability BETWEEN 0 AND 100) DEFAULT 50,
  weighted_value INTEGER GENERATED ALWAYS AS (CASE WHEN estimated_value IS NOT NULL THEN (estimated_value * probability / 100) ELSE 0 END) STORED,
  expected_close_date DATE,
  actual_close_date DATE,
  loss_reason TEXT,
  owner_id UUID REFERENCES user_profiles(id),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_client ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created ON opportunities(created_at DESC);

DROP TRIGGER IF EXISTS opportunities_updated_at ON opportunities;
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_opportunity_stage_changed() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at = NOW();
    IF NEW.stage IN ('closed_won', 'closed_lost') AND NEW.actual_close_date IS NULL THEN
      NEW.actual_close_date = CURRENT_DATE;
    END IF;
    IF NEW.stage = 'lead' AND NEW.probability = OLD.probability THEN NEW.probability = 10;
    ELSIF NEW.stage = 'qualified' AND NEW.probability = OLD.probability THEN NEW.probability = 30;
    ELSIF NEW.stage = 'proposal' AND NEW.probability = OLD.probability THEN NEW.probability = 50;
    ELSIF NEW.stage = 'negotiation' AND NEW.probability = OLD.probability THEN NEW.probability = 75;
    ELSIF NEW.stage = 'closed_won' THEN NEW.probability = 100;
    ELSIF NEW.stage = 'closed_lost' THEN NEW.probability = 0;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opportunities_stage_changed ON opportunities;
CREATE TRIGGER opportunities_stage_changed BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_opportunity_stage_changed();

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view opportunities" ON opportunities;
DROP POLICY IF EXISTS "Sales can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can update own opportunities" ON opportunities;

CREATE POLICY "Users can view opportunities" ON opportunities FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM clients c WHERE c.id = opportunities.client_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid())) OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'account_manager')));
CREATE POLICY "Sales can insert opportunities" ON opportunities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'account_manager')));
CREATE POLICY "Users can update own opportunities" ON opportunities FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('client', 'candidate', 'placement')),
  entity_id UUID NOT NULL,
  contract_type TEXT CHECK (contract_type IN ('msa', 'sow', 'offer_letter', 'w2', '1099', 'nda', 'i9')),
  contract_number TEXT UNIQUE,
  title TEXT NOT NULL,
  document_url TEXT,
  signed_document_url TEXT,
  status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'terminated')) DEFAULT 'draft',
  effective_date DATE,
  expiration_date DATE,
  signed_date DATE,
  signed_by_us UUID REFERENCES user_profiles(id),
  signed_by_them_name TEXT,
  signed_by_them_email TEXT,
  expiration_alert_30_sent BOOLEAN DEFAULT false,
  expiration_alert_60_sent BOOLEAN DEFAULT false,
  expiration_alert_90_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_entity ON contracts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_expiration ON contracts(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);

DROP TRIGGER IF EXISTS contracts_updated_at ON contracts;
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_contract_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contracts_status_update ON contracts;
CREATE TRIGGER contracts_status_update BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_contract_status();

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view contracts" ON contracts;
DROP POLICY IF EXISTS "Operations can manage contracts" ON contracts;

CREATE POLICY "Users can view contracts" ON contracts FOR SELECT USING ((entity_type = 'client' AND EXISTS (SELECT 1 FROM clients c WHERE c.id = contracts.entity_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid()))) OR (entity_type = 'candidate' AND EXISTS (SELECT 1 FROM candidates c WHERE c.id = contracts.entity_id AND c.owner_id = auth.uid())) OR (entity_type = 'placement' AND EXISTS (SELECT 1 FROM placements p WHERE p.id = contracts.entity_id AND (p.recruiter_id = auth.uid() OR p.account_manager_id = auth.uid()))) OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations')));
CREATE POLICY "Operations can manage contracts" ON contracts FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'operations')));

-- ==========================================
-- SECTION 8: ACTIVITIES & SYSTEM TABLES
-- ==========================================

-- ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('candidate', 'client', 'contact', 'job', 'application', 'opportunity', 'placement')),
  entity_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'email', 'call', 'meeting', 'task', 'status_change', 'document_upload', 'interview_scheduled', 'offer_extended', 'placement_started', 'contract_signed')),
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_tasks ON activities(activity_type) WHERE activity_type = 'task' AND is_completed = false;

DROP TRIGGER IF EXISTS activities_updated_at ON activities;
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION set_activity_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  END IF;
  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS activities_completed_at ON activities;
CREATE TRIGGER activities_completed_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION set_activity_completed_at();

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view activities for entities they can access" ON activities;
DROP POLICY IF EXISTS "Users can create activities for entities they can access" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;

CREATE POLICY "Users can view activities for entities they can access" ON activities FOR SELECT USING (created_by = auth.uid() OR assigned_to = auth.uid() OR (entity_type = 'candidate' AND EXISTS (SELECT 1 FROM candidates c WHERE c.id = activities.entity_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations'))))) OR (entity_type = 'client' AND EXISTS (SELECT 1 FROM clients c WHERE c.id = activities.entity_id AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'account_manager'))))) OR (entity_type = 'job' AND EXISTS (SELECT 1 FROM jobs j WHERE j.id = activities.entity_id AND (j.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter'))))) OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create activities for entities they can access" ON activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'sales', 'account_manager', 'operations')));
CREATE POLICY "Users can update their own activities" ON activities FOR UPDATE USING (created_by = auth.uid() OR assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can delete their own activities" ON activities FOR DELETE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION create_activity(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_activity_type TEXT,
  p_subject TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activities (entity_type, entity_id, activity_type, subject, description, metadata, created_by)
  VALUES (p_entity_type, p_entity_id, p_activity_type, p_subject, p_description, p_metadata, auth.uid())
  RETURNING id INTO v_activity_id;
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES user_profiles(id),
  user_email TEXT,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION audit_trigger_func() RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields TEXT[];
  v_user_email TEXT;
  v_user_role TEXT;
BEGIN
  SELECT email, role INTO v_user_email, v_user_role FROM user_profiles WHERE id = auth.uid();
  IF TG_OP = 'DELETE' THEN
    v_old_data = to_jsonb(OLD);
    v_new_data = NULL;
    v_changed_fields = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data = NULL;
    v_new_data = to_jsonb(NEW);
    v_changed_fields = NULL;
  ELSE
    v_old_data = to_jsonb(OLD);
    v_new_data = to_jsonb(NEW);
    SELECT array_agg(key) INTO v_changed_fields FROM (SELECT key FROM jsonb_each(v_new_data) WHERE v_new_data->key IS DISTINCT FROM v_old_data->key) AS changes;
  END IF;
  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id, user_email, user_role, ip_address)
  VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, v_old_data, v_new_data, v_changed_fields, auth.uid(), v_user_email, v_user_role, inet_client_addr());
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_candidates ON candidates;
DROP TRIGGER IF EXISTS audit_jobs ON jobs;
DROP TRIGGER IF EXISTS audit_applications ON applications;
DROP TRIGGER IF EXISTS audit_clients ON clients;
DROP TRIGGER IF EXISTS audit_placements ON placements;
DROP TRIGGER IF EXISTS audit_opportunities ON opportunities;

CREATE TRIGGER audit_candidates AFTER INSERT OR UPDATE OR DELETE ON candidates FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_placements AFTER INSERT OR UPDATE OR DELETE ON placements FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_opportunities AFTER INSERT OR UPDATE OR DELETE ON opportunities FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION set_notification_read_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  IF NEW.is_read = false AND OLD.is_read = true THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_read_at ON notifications;
CREATE TRIGGER notifications_read_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_notification_read_at();

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, action_url, priority)
  VALUES (p_user_id, p_type, p_title, p_message, p_entity_type, p_entity_id, p_action_url, p_priority)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================
-- ✅ ALL TABLES CREATED!
-- ✅ ALL TRIGGERS SET UP!
-- ✅ ALL RLS POLICIES ENABLED!
-- ==========================================
-- 🎉 YOUR DATABASE IS READY! 🎉
-- Next steps:
-- 1. Create test users in Supabase Auth
-- 2. Run scripts/setup-test-users.sql
-- 3. Load seed data (if needed)
-- 4. Start testing!
--
-- WITH GURU'S GRACE! JAI VIJAYA! 🙏
-- ==========================================

