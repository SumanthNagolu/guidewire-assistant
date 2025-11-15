-- CRITICAL DATABASE FIXES
-- Run these in Supabase SQL Editor NOW

-- 1. Add missing column to productivity_screenshots
ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS application_detected TEXT;

-- 2. Add 'troubleshooting' to allowed work categories
ALTER TABLE productivity_ai_analysis 
DROP CONSTRAINT IF EXISTS productivity_ai_analysis_work_category_check;

ALTER TABLE productivity_ai_analysis 
ADD CONSTRAINT productivity_ai_analysis_work_category_check 
CHECK (work_category IN (
  'training', 'certification', 'practice', 'learning',
  'client_communication', 'proposal_writing', 'crm_update', 'lead_generation',
  'resume_screening', 'candidate_sourcing', 'interview_scheduling', 'job_posting',
  'email', 'meeting', 'documentation', 'research', 'break', 'idle',
  'troubleshooting', 'coding', 'debugging', 'testing'  -- Added new categories
));

-- 3. Create productivity_summaries table (if you haven't run the SQL from RUN-THIS-SQL-NOW.md)
CREATE TABLE IF NOT EXISTS productivity_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Time window configuration
  window_type TEXT NOT NULL CHECK (window_type IN ('5min', '30min', '1hour', '2hour', '4hour', 'daily', 'weekly', 'monthly')),
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Summary content
  summary_text TEXT NOT NULL,
  key_activities JSONB DEFAULT '[]',
  applications_used JSONB DEFAULT '{}',
  productivity_metrics JSONB DEFAULT '{}',
  
  -- Context chain
  previous_summary_id UUID REFERENCES productivity_summaries(id),
  context_preserved TEXT,
  
  -- Statistics
  screenshot_count INT DEFAULT 0,
  total_active_time INT DEFAULT 0,
  avg_productivity_score DECIMAL(5,2),
  avg_focus_score DECIMAL(5,2),
  
  -- Processing metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generation_method TEXT DEFAULT 'ai',
  ai_model TEXT,
  processing_time_ms INT,
  
  -- Indexing
  CONSTRAINT unique_user_window UNIQUE (user_id, window_type, window_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_summaries_user_window 
ON productivity_summaries(user_id, window_type, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_summaries_window_end 
ON productivity_summaries(window_end);

-- Enable RLS
ALTER TABLE productivity_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own summaries"
  ON productivity_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Service role can manage all summaries"
  ON productivity_summaries FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Refresh Supabase schema cache
NOTIFY pgrst, 'reload schema';


