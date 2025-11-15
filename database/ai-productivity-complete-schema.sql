-- ============================================
-- AI-POWERED PRODUCTIVITY INTELLIGENCE PLATFORM
-- Complete Database Schema
-- ============================================

-- ============================================
-- PHASE 1: USER ENHANCEMENT
-- ============================================

-- Add role-specific tags to existing user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS user_tags TEXT[] DEFAULT '{}';

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS industry_role TEXT;

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS work_context JSONB DEFAULT '{}'::jsonb;

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS ai_analysis_enabled BOOLEAN DEFAULT true;

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS preferred_work_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00"}'::jsonb;

-- Add CHECK constraint for industry_role (drop first if exists for idempotency)
DO $$ 
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS industry_role_allowed_values_chk;
  ALTER TABLE user_profiles ADD CONSTRAINT industry_role_allowed_values_chk
    CHECK (industry_role IN (
      'bench_resource',      -- Available consultants
      'active_consultant',   -- Deployed consultants
      'sales_executive',     -- Sales team
      'recruiter',          -- Talent acquisition
      'operations',         -- Operations team
      'admin',              -- Management
      'training'            -- In training
    ));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- PHASE 2: TEAM ORGANIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS productivity_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_code TEXT UNIQUE NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES user_profiles(id),
  team_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productivity_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES productivity_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_in_team TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(team_id, user_id)
);

-- ============================================
-- PHASE 3: AI ANALYSIS INFRASTRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS productivity_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_id UUID REFERENCES productivity_screenshots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Core Analysis
  application_detected TEXT NOT NULL,
  window_title TEXT,
  activity_description TEXT NOT NULL,
  
  -- Categorization based on role
  work_category TEXT NOT NULL CHECK (work_category IN (
    'training', 'certification', 'practice', 'learning',
    'client_communication', 'proposal_writing', 'crm_update', 'lead_generation',
    'resume_screening', 'candidate_sourcing', 'interview_scheduling', 'job_posting',
    'email', 'meeting', 'documentation', 'research', 'break', 'idle'
  )),
  
  -- Productivity Metrics
  productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  
  -- Context Detection
  project_context TEXT,
  client_context TEXT,
  detected_entities TEXT[],
  
  -- AI Model Metadata
  ai_model TEXT DEFAULT 'claude-3-opus',
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  processing_time_ms INTEGER,
  
  -- Timestamps
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PHASE 4: WORK SUMMARIES & AGGREGATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS productivity_work_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  time_window TEXT NOT NULL,
  
  -- Aggregated Metrics
  total_productive_minutes INTEGER DEFAULT 0,
  total_break_minutes INTEGER DEFAULT 0,
  total_meeting_minutes INTEGER DEFAULT 0,
  
  -- Category Breakdown
  category_breakdown JSONB DEFAULT '{}',
  application_breakdown JSONB DEFAULT '{}',
  
  -- AI Generated Summary
  ai_summary TEXT,
  key_accomplishments TEXT[],
  improvement_suggestions TEXT[],
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, summary_date, time_window)
);

-- ============================================
-- PHASE 5: ATTENDANCE & PRESENCE
-- ============================================

CREATE TABLE IF NOT EXISTS productivity_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Presence Data
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  total_active_minutes INTEGER DEFAULT 0,
  
  -- Status Tracking
  current_status TEXT DEFAULT 'offline',
  status_updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Work Pattern Analysis
  work_pattern JSONB DEFAULT '{}',
  
  UNIQUE(user_id, date)
);

-- ============================================
-- PHASE 6: ENHANCED SCREENSHOTS
-- ============================================

ALTER TABLE productivity_screenshots 
  ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS blur_sensitive BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ============================================
-- PHASE 7: WEBSITE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS productivity_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  full_url TEXT,
  page_title TEXT,
  
  -- Categorization
  category TEXT CHECK (category IN (
    'work_related', 'research', 'learning', 
    'social_media', 'news', 'entertainment', 'other'
  )),
  
  -- Time Tracking
  visited_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  
  -- Context
  work_context TEXT,
  productivity_impact TEXT
);

-- ============================================
-- PHASE 8: PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_date 
  ON productivity_ai_analysis(user_id, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_category 
  ON productivity_ai_analysis(work_category);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_screenshot 
  ON productivity_ai_analysis(screenshot_id);

CREATE INDEX IF NOT EXISTS idx_screenshots_user_date 
  ON productivity_screenshots(user_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_screenshots_processed 
  ON productivity_screenshots(ai_processed, processing_status);

CREATE INDEX IF NOT EXISTS idx_presence_date 
  ON productivity_presence(date DESC);

CREATE INDEX IF NOT EXISTS idx_presence_user_date 
  ON productivity_presence(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_summaries_user_window 
  ON productivity_work_summaries(user_id, time_window);

CREATE INDEX IF NOT EXISTS idx_summaries_date 
  ON productivity_work_summaries(summary_date DESC);

CREATE INDEX IF NOT EXISTS idx_websites_user_visited 
  ON productivity_websites(user_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_websites_domain 
  ON productivity_websites(domain);

CREATE INDEX IF NOT EXISTS idx_team_members_team 
  ON productivity_team_members(team_id);

CREATE INDEX IF NOT EXISTS idx_team_members_user 
  ON productivity_team_members(user_id);

-- ============================================
-- PHASE 9: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE productivity_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_work_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_websites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users view own ai analysis" ON productivity_ai_analysis;
DROP POLICY IF EXISTS "Admins view all ai analysis" ON productivity_ai_analysis;
DROP POLICY IF EXISTS "Users view own summaries" ON productivity_work_summaries;
DROP POLICY IF EXISTS "Admins view all summaries" ON productivity_work_summaries;
DROP POLICY IF EXISTS "Users view own presence" ON productivity_presence;
DROP POLICY IF EXISTS "Admins view all presence" ON productivity_presence;
DROP POLICY IF EXISTS "Users view own websites" ON productivity_websites;
DROP POLICY IF EXISTS "Admins view all websites" ON productivity_websites;

-- Policies for regular users (see own data)
CREATE POLICY "Users view own ai analysis" ON productivity_ai_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own summaries" ON productivity_work_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own presence" ON productivity_presence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own websites" ON productivity_websites
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for admins (see all data)
CREATE POLICY "Admins view all ai analysis" ON productivity_ai_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins view all summaries" ON productivity_work_summaries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins view all presence" ON productivity_presence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins view all websites" ON productivity_websites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PHASE 10: INITIAL DATA SETUP
-- ============================================

-- Create default teams
INSERT INTO productivity_teams (name, team_code, description) VALUES
  ('Bench Resources', 'BENCH', 'Available consultants ready for deployment'),
  ('Sales Team', 'SALES', 'Sales executives and business development'),
  ('Recruiting Team', 'RECRUITING', 'Talent acquisition and candidate sourcing'),
  ('Operations', 'OPERATIONS', 'Operations and administrative staff'),
  ('Management', 'MANAGEMENT', 'Leadership and management team')
ON CONFLICT (team_code) DO NOTHING;

-- ============================================
-- PHASE 11: HELPER FUNCTIONS
-- ============================================

-- Function to update presence on activity
CREATE OR REPLACE FUNCTION update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO productivity_presence (user_id, date, last_seen_at, current_status, status_updated_at)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    NEW.captured_at,
    'active',
    NEW.captured_at
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    last_seen_at = NEW.captured_at,
    current_status = 'active',
    status_updated_at = NEW.captured_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update presence when screenshot is captured
DROP TRIGGER IF EXISTS screenshot_updates_presence ON productivity_screenshots;
CREATE TRIGGER screenshot_updates_presence
  AFTER INSERT ON productivity_screenshots
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presence();

-- Function to calculate active minutes from AI analysis
CREATE OR REPLACE FUNCTION calculate_active_minutes()
RETURNS TRIGGER AS $$
DECLARE
  active_mins INTEGER := 0;
BEGIN
  -- Calculate based on productivity score
  IF NEW.work_category NOT IN ('break', 'idle') THEN
    active_mins := 1; -- Each analysis represents ~30 seconds = 0.5 min, round to 1
  END IF;
  
  UPDATE productivity_presence
  SET total_active_minutes = total_active_minutes + active_mins
  WHERE user_id = NEW.user_id 
    AND date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate active time from AI analysis
DROP TRIGGER IF EXISTS ai_analysis_updates_active_time ON productivity_ai_analysis;
CREATE TRIGGER ai_analysis_updates_active_time
  AFTER INSERT ON productivity_ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION calculate_active_minutes();

COMMENT ON TABLE productivity_ai_analysis IS 'AI-powered analysis of screenshot activity';
COMMENT ON TABLE productivity_work_summaries IS 'Aggregated work summaries generated by AI';
COMMENT ON TABLE productivity_presence IS 'Real-time user presence and status tracking';
COMMENT ON TABLE productivity_teams IS 'Team organization structure';
COMMENT ON TABLE productivity_websites IS 'Website visit tracking and categorization';

