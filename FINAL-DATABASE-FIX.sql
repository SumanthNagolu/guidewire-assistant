-- ========================================
-- FINAL DATABASE FIX - Run in Supabase SQL Editor
-- ========================================
-- This fixes all schema issues for the productivity system
-- ========================================

-- 1. Add missing column to productivity_screenshots
ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS application_detected TEXT;

-- 2. Create hierarchical summaries table
CREATE TABLE IF NOT EXISTS productivity_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  window_type TEXT NOT NULL CHECK (window_type IN ('5min', '30min', '1hour', '2hour', '4hour', 'daily', 'weekly', 'monthly')),
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  summary_text TEXT NOT NULL,
  key_activities JSONB DEFAULT '[]',
  applications_used JSONB DEFAULT '{}',
  productivity_metrics JSONB DEFAULT '{}',
  previous_summary_id UUID REFERENCES productivity_summaries(id),
  context_preserved TEXT,
  screenshot_count INT DEFAULT 0,
  total_active_time INT DEFAULT 0,
  avg_productivity_score DECIMAL(5,2),
  avg_focus_score DECIMAL(5,2),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generation_method TEXT DEFAULT 'ai',
  ai_model TEXT,
  processing_time_ms INT,
  CONSTRAINT unique_user_window UNIQUE (user_id, window_type, window_start)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_summaries_user_window
  ON productivity_summaries(user_id, window_type, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_summaries_window_start 
  ON productivity_summaries(window_start DESC);

-- 4. Enable Row Level Security
ALTER TABLE productivity_summaries ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies with proper checks
DO $$
BEGIN
  -- Policy for authenticated users to view their own summaries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'productivity_summaries'
      AND policyname = 'Users view own summaries'
  ) THEN
    CREATE POLICY "Users view own summaries"
      ON productivity_summaries
      FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  -- Policy for service role to manage all summaries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'productivity_summaries'
      AND policyname = 'Service role manages summaries'
  ) THEN
    CREATE POLICY "Service role manages summaries"
      ON productivity_summaries
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- 6. Update work_category constraint to include all categories
ALTER TABLE productivity_ai_analysis 
DROP CONSTRAINT IF EXISTS productivity_ai_analysis_work_category_check;

ALTER TABLE productivity_ai_analysis 
ADD CONSTRAINT productivity_ai_analysis_work_category_check 
CHECK (work_category IN (
  'training', 'certification', 'practice', 'learning',
  'client_communication', 'proposal_writing', 'crm_update', 'lead_generation',
  'resume_screening', 'candidate_sourcing', 'interview_scheduling', 'job_posting',
  'email', 'meeting', 'documentation', 'research', 'break', 'idle',
  'troubleshooting', 'coding', 'debugging', 'testing'
));

-- 7. Refresh PostgREST schema cache (for Supabase)
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION QUERIES (Optional - Run separately to check)
-- ========================================

-- Check if application_detected column exists
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'productivity_screenshots' AND column_name = 'application_detected';

-- Check if productivity_summaries table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name = 'productivity_summaries';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'productivity_summaries';

-- Check work_category constraint
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'productivity_ai_analysis'::regclass AND conname LIKE '%work_category%';


