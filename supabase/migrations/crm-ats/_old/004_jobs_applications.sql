-- Jobs Table
-- Job requisitions from clients

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job Details
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  
  -- Client & Location
  client_id UUID REFERENCES clients(id),
  location TEXT,
  remote_policy TEXT CHECK (remote_policy IN ('remote', 'hybrid', 'onsite')) DEFAULT 'hybrid',
  
  -- Compensation
  rate_type TEXT CHECK (rate_type IN ('hourly', 'annual')) DEFAULT 'hourly',
  rate_min INTEGER,
  rate_max INTEGER,
  
  -- Job Type
  employment_type TEXT CHECK (employment_type IN ('contract', 'contract_to_hire', 'direct_placement', 'temporary')) DEFAULT 'contract',
  duration_months INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'open', 'on_hold', 'filled', 'cancelled')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('hot', 'warm', 'cold')) DEFAULT 'warm',
  
  -- Openings
  openings INTEGER DEFAULT 1,
  filled INTEGER DEFAULT 0,
  
  -- Dates
  posted_date DATE,
  target_fill_date DATE,
  filled_date DATE,
  
  -- Ownership
  owner_id UUID REFERENCES user_profiles(id),
  client_contact_id UUID REFERENCES contacts(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_owner ON jobs(owner_id);
CREATE INDEX idx_jobs_priority ON jobs(priority);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Full-text search
CREATE INDEX idx_jobs_search ON jobs USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' ||
    COALESCE(array_to_string(requirements, ' '), '')
  )
);

-- Auto-update updated_at
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view jobs"
  ON jobs FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = jobs.client_id
      AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'operations')
    )
  );

CREATE POLICY "Recruiters can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'sales')
    )
  );

CREATE POLICY "Users can update assigned jobs"
  ON jobs FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Applications Table
-- Links candidates to jobs through recruitment pipeline

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- Pipeline Stage
  stage TEXT NOT NULL CHECK (stage IN (
    'sourced',
    'screening',
    'submitted',
    'client_review',
    'interview_scheduled',
    'interviewing',
    'interview_completed',
    'reference_check',
    'offer',
    'offer_accepted',
    'offer_rejected',
    'placed',
    'rejected',
    'withdrawn'
  )) DEFAULT 'sourced',
  
  -- Timeline
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Submitted to Client
  submitted_to_client_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  
  -- Interview Details
  interview_scheduled_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  interview_feedback TEXT,
  
  -- Offer Details
  offer_extended_at TIMESTAMPTZ,
  offer_amount INTEGER,
  offer_accepted_at TIMESTAMPTZ,
  offer_rejected_at TIMESTAMPTZ,
  offer_rejection_reason TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  rejection_reason TEXT,
  
  -- Ownership
  owner_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(candidate_id, job_id)
);

-- Indexes
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_stage ON applications(stage);
CREATE INDEX idx_applications_owner ON applications(owner_id);
CREATE INDEX idx_applications_active ON applications(is_active) WHERE is_active = true;

-- Auto-update updated_at
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update stage_changed_at when stage changes
CREATE OR REPLACE FUNCTION update_stage_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_stage_changed
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_changed_at();

-- RLS Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view applications"
  ON applications FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = applications.candidate_id
      AND c.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = applications.job_id
      AND j.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'operations')
    )
  );

CREATE POLICY "Recruiters can insert applications"
  ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
    )
  );

CREATE POLICY "Users can update applications"
  ON applications FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'recruiter')
    )
  );

-- Interviews Table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Interview Details
  interview_type TEXT CHECK (interview_type IN ('phone_screen', 'technical', 'behavioral', 'client_interview', 'final_round')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  
  -- Participants
  interviewer_id UUID REFERENCES user_profiles(id),
  interviewer_name TEXT,
  interviewer_email TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  
  -- Feedback
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Auto-update updated_at
CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interviews for their applications"
  ON interviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = interviews.application_id
      AND (
        a.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() 
          AND role IN ('admin', 'recruiter', 'operations')
        )
      )
    )
  );

CREATE POLICY "Recruiters can manage interviews"
  ON interviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
    )
  );

