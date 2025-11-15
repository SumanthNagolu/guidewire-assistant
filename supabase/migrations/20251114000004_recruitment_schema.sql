-- ================================================
-- RECRUITMENT/ATS MODULE - DATABASE SCHEMA
-- ================================================

-- Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number VARCHAR(50) UNIQUE NOT NULL, -- "JOB-2025-001"
  job_title VARCHAR(200) NOT NULL,
  department_id UUID REFERENCES departments(id),
  location VARCHAR(100),
  employment_type VARCHAR(20) NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary')),
  remote_policy VARCHAR(20) DEFAULT 'On-site' CHECK (remote_policy IN ('On-site', 'Hybrid', 'Remote')),
  
  -- Compensation
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'USD',
  show_salary BOOLEAN DEFAULT false,
  
  -- Job Details
  description TEXT NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  required_skills TEXT[],
  preferred_skills TEXT[],
  benefits TEXT,
  
  -- Classification
  experience_level VARCHAR(20) CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  job_category VARCHAR(50),
  
  -- Posting Management
  positions_available INTEGER DEFAULT 1,
  application_deadline DATE,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Closed', 'Filled')),
  posted_date TIMESTAMPTZ,
  closed_date TIMESTAMPTZ,
  closed_reason TEXT,
  
  -- SEO & Visibility
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  external_boards TEXT[], -- ['LinkedIn', 'Indeed', 'Glassdoor']
  
  -- Hiring Team
  hiring_manager_id UUID REFERENCES employees(id),
  recruiters UUID[], -- Array of employee IDs
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_salary_range CHECK (salary_max IS NULL OR salary_max >= salary_min)
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_number VARCHAR(50) UNIQUE NOT NULL, -- "CAN-2025-001"
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  location VARCHAR(100),
  
  -- Professional Info
  current_company VARCHAR(100),
  current_title VARCHAR(100),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  github_url VARCHAR(255),
  
  -- Experience & Skills
  total_experience_years DECIMAL(3,1),
  skills TEXT[],
  certifications TEXT[],
  education JSONB, -- [{degree, institution, year, major}]
  
  -- Documents
  resume_url TEXT,
  cover_letter_url TEXT,
  portfolio_url_files TEXT[],
  
  -- Compensation Expectations
  current_salary DECIMAL(10,2),
  expected_salary DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Availability
  availability_date DATE,
  notice_period_days INTEGER,
  willing_to_relocate BOOLEAN,
  work_authorization VARCHAR(50),
  
  -- Source & Tags
  source VARCHAR(50), -- 'LinkedIn', 'Referral', 'Website', 'Indeed'
  referrer_name VARCHAR(100),
  tags TEXT[],
  
  -- Overall Assessment
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  
  -- GDPR / Data Privacy
  consent_to_store_data BOOLEAN DEFAULT true,
  consent_date TIMESTAMPTZ,
  data_retention_until DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Applications (links candidates to job postings)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR(50) UNIQUE NOT NULL, -- "APP-2025-001"
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Application Details
  application_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(50), -- 'Website', 'LinkedIn', 'Referral', 'Direct'
  referrer_employee_id UUID REFERENCES employees(id),
  
  -- Documents (can override candidate's default)
  resume_url TEXT,
  cover_letter TEXT,
  additional_documents JSONB,
  
  -- Questionnaire Responses
  questionnaire_responses JSONB, -- [{question, answer}]
  
  -- Pipeline Stage
  current_stage VARCHAR(30) DEFAULT 'New' CHECK (current_stage IN (
    'New', 'Screening', 'Interview', 'Assessment', 'Offer', 'Hired', 'Rejected', 'Withdrawn'
  )),
  stage_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  stage_updated_by UUID REFERENCES employees(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Withdrawn', 'Rejected', 'Hired')),
  rejection_reason VARCHAR(50),
  rejection_notes TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES employees(id),
  
  -- Assignment
  assigned_recruiter_id UUID REFERENCES employees(id),
  
  -- Ratings & Notes
  recruiter_rating DECIMAL(2,1),
  hiring_manager_rating DECIMAL(2,1),
  internal_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(job_posting_id, candidate_id)
);

-- Application Timeline/Activity
CREATE TABLE IF NOT EXISTS application_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  activity_type VARCHAR(30) NOT NULL, -- 'stage_change', 'note_added', 'email_sent', 'interview_scheduled'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Interviews
CREATE TABLE IF NOT EXISTS recruitment_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_number VARCHAR(50) UNIQUE NOT NULL, -- "INT-2025-001"
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Interview Details
  interview_type VARCHAR(30) NOT NULL CHECK (interview_type IN (
    'Phone Screen', 'Video Call', 'Technical', 'Cultural Fit', 'Panel', 'Final Round', 'On-site'
  )),
  round_number INTEGER DEFAULT 1,
  
  -- Scheduling
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Format & Location
  format VARCHAR(20) NOT NULL CHECK (format IN ('In-person', 'Video', 'Phone')),
  location VARCHAR(200),
  meeting_link VARCHAR(255),
  meeting_id VARCHAR(100),
  meeting_password VARCHAR(100),
  
  -- Participants
  interviewers UUID[] NOT NULL, -- Array of employee IDs
  organizer_id UUID REFERENCES employees(id),
  
  -- Agenda
  agenda TEXT,
  interview_plan TEXT,
  
  -- Status & Outcome
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN (
    'Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow', 'Rescheduled'
  )),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES employees(id),
  
  -- Overall Outcome
  overall_rating DECIMAL(2,1),
  overall_feedback TEXT,
  recommendation VARCHAR(20) CHECK (recommendation IN ('StrongYes', 'Yes', 'Maybe', 'No', 'StrongNo')),
  
  -- Notifications
  invitation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Interview Feedback (individual interviewer feedback)
CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES recruitment_interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES employees(id),
  
  -- Ratings (1-5 scale)
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  technical_skills_rating DECIMAL(2,1),
  communication_rating DECIMAL(2,1),
  cultural_fit_rating DECIMAL(2,1),
  problem_solving_rating DECIMAL(2,1),
  leadership_rating DECIMAL(2,1),
  
  -- Qualitative Feedback
  strengths TEXT,
  concerns TEXT,
  notable_responses TEXT,
  
  -- Recommendation
  recommendation VARCHAR(20) NOT NULL CHECK (recommendation IN ('StrongYes', 'Yes', 'Maybe', 'No', 'StrongNo')),
  notes TEXT,
  
  -- Submission
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(interview_id, interviewer_id)
);

-- Job Offers
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_number VARCHAR(50) UNIQUE NOT NULL, -- "OFF-2025-001"
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  
  -- Offer Details
  job_title VARCHAR(200) NOT NULL,
  department_id UUID REFERENCES departments(id),
  employment_type VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  remote_policy VARCHAR(20),
  
  -- Compensation
  base_salary DECIMAL(10,2) NOT NULL,
  signing_bonus DECIMAL(10,2),
  annual_bonus DECIMAL(10,2),
  equity VARCHAR(100), -- "10,000 stock options"
  other_compensation TEXT,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Benefits
  benefits_summary TEXT,
  vacation_days INTEGER,
  additional_perks TEXT,
  
  -- Start Details
  proposed_start_date DATE,
  report_to_name VARCHAR(100),
  work_schedule TEXT,
  
  -- Offer Letter
  offer_letter_url TEXT,
  offer_letter_template_id UUID,
  
  -- Validity
  offer_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  response_deadline DATE,
  
  -- Status & Outcome
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN (
    'Draft', 'Pending Approval', 'Approved', 'Sent', 'Accepted', 'Declined', 'Expired', 'Withdrawn'
  )),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  declined_reason TEXT,
  
  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Negotiation
  negotiation_notes TEXT,
  revised_offer_id UUID REFERENCES job_offers(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES employees(id)
);

-- Job Posting Views (Analytics)
CREATE TABLE IF NOT EXISTS job_posting_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  viewer_ip VARCHAR(50),
  viewer_location VARCHAR(100),
  referrer_url TEXT,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date ON job_postings(posted_date);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(current_stage);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_application_activities_app ON application_activities(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON recruitment_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON recruitment_interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON recruitment_interviews(status);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_application ON job_offers(application_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);

-- Create updated_at triggers
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruitment_interviews_updated_at BEFORE UPDATE ON recruitment_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_feedback_updated_at BEFORE UPDATE ON interview_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_offers_updated_at BEFORE UPDATE ON job_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment application count when new application is created
CREATE OR REPLACE FUNCTION increment_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_postings 
  SET applications_count = applications_count + 1
  WHERE id = NEW.job_posting_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_application_count
AFTER INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION increment_job_application_count();

-- Auto-log application stage changes
CREATE OR REPLACE FUNCTION log_application_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    INSERT INTO application_activities (
      application_id,
      activity_type,
      description,
      old_value,
      new_value,
      performed_by
    ) VALUES (
      NEW.id,
      'stage_change',
      'Stage changed from ' || OLD.current_stage || ' to ' || NEW.current_stage,
      OLD.current_stage,
      NEW.current_stage,
      NEW.stage_updated_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_stage_change
AFTER UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION log_application_stage_change();

-- Create view for active job postings (public)
CREATE OR REPLACE VIEW public_job_postings AS
SELECT 
  id,
  job_number,
  job_title,
  location,
  employment_type,
  remote_policy,
  CASE WHEN show_salary THEN salary_min ELSE NULL END as salary_min,
  CASE WHEN show_salary THEN salary_max ELSE NULL END as salary_max,
  salary_currency,
  description,
  requirements,
  required_skills,
  experience_level,
  application_deadline,
  posted_date,
  applications_count,
  views_count
FROM job_postings
WHERE status = 'Active'
  AND is_public = true
  AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
ORDER BY posted_date DESC;

-- Helper function to get application stats
CREATE OR REPLACE FUNCTION get_recruitment_stats()
RETURNS TABLE(
  active_jobs INTEGER,
  total_applications INTEGER,
  new_applications INTEGER,
  interviews_this_week INTEGER,
  pending_offers INTEGER
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*)::INTEGER FROM job_postings WHERE status = 'Active'),
    (SELECT COUNT(*)::INTEGER FROM applications WHERE status = 'Active'),
    (SELECT COUNT(*)::INTEGER FROM applications 
     WHERE status = 'Active' AND current_stage = 'New'),
    (SELECT COUNT(*)::INTEGER FROM recruitment_interviews 
     WHERE status IN ('Scheduled', 'Confirmed')
     AND scheduled_date >= date_trunc('week', CURRENT_DATE)
     AND scheduled_date < date_trunc('week', CURRENT_DATE) + interval '1 week'),
    (SELECT COUNT(*)::INTEGER FROM job_offers WHERE status = 'Sent');
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE job_postings IS 'Job openings and postings';
COMMENT ON TABLE candidates IS 'Candidate database (talent pool)';
COMMENT ON TABLE applications IS 'Applications linking candidates to jobs';
COMMENT ON TABLE application_activities IS 'Activity log for application timeline';
COMMENT ON TABLE recruitment_interviews IS 'Interview scheduling and management';
COMMENT ON TABLE interview_feedback IS 'Individual interviewer feedback';
COMMENT ON TABLE job_offers IS 'Job offers made to candidates';
COMMENT ON TABLE job_posting_views IS 'Analytics for job posting views';

