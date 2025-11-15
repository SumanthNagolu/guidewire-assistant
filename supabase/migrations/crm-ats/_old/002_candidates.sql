-- Candidates Table
-- Core ATS entity for tracking potential hires

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  
  -- Professional Details
  current_title TEXT,
  years_of_experience INTEGER,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Documents
  resume_url TEXT,
  resume_parsed_data JSONB,
  linkedin_url TEXT,
  portfolio_url TEXT,
  
  -- Availability
  availability TEXT CHECK (availability IN ('immediate', 'within_2_weeks', 'within_1_month', 'not_available')) DEFAULT 'within_2_weeks',
  desired_rate_min INTEGER,
  desired_rate_max INTEGER,
  work_authorization TEXT CHECK (work_authorization IN ('us_citizen', 'green_card', 'h1b', 'opt', 'ead', 'requires_sponsorship')),
  
  -- Status & Source
  status TEXT CHECK (status IN ('active', 'placed', 'inactive', 'do_not_contact')) DEFAULT 'active',
  source TEXT,
  referred_by UUID REFERENCES user_profiles(id),
  
  -- Ratings
  technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  owner_id UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_owner ON candidates(owner_id);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_deleted ON candidates(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_candidates_search ON candidates USING GIN(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(current_title, '') || ' ' ||
    COALESCE(array_to_string(skills, ' '), '')
  )
);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS candidates_updated_at ON candidates;
CREATE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Recruiters can view own candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can update own candidates" ON candidates;
DROP POLICY IF EXISTS "Recruiters can soft delete own candidates" ON candidates;

-- Recruiters can view their own candidates
CREATE POLICY "Recruiters can view own candidates"
  ON candidates FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'account_manager')
    )
  );

-- Recruiters can insert candidates
CREATE POLICY "Recruiters can insert candidates"
  ON candidates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter')
    )
  );

-- Recruiters can update their own candidates
CREATE POLICY "Recruiters can update own candidates"
  ON candidates FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Soft delete policy
CREATE POLICY "Recruiters can soft delete own candidates"
  ON candidates FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (deleted_at IS NOT NULL);

