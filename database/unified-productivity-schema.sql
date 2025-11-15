-- ============================================
-- UNIFIED PRODUCTIVITY SYSTEM - DATABASE SCHEMA
-- Human-like context tracking with batch processing
-- ============================================

-- ============================================
-- CONTEXT SUMMARIES TABLE
-- Stores hierarchical context summaries for all time windows
-- ============================================
CREATE TABLE IF NOT EXISTS context_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  window_type TEXT NOT NULL CHECK (window_type IN (
    '15min', '30min', '1hr', '2hr', '4hr',
    '1day', '1week', '1month', '1year'
  )),
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  
  -- Human-readable summary
  summary_text TEXT NOT NULL,
  
  -- Structured data
  activities JSONB DEFAULT '[]',
  idle_minutes INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  
  -- Context chaining
  context_preserved TEXT, -- Key context to pass to next window
  parent_summary_id UUID REFERENCES context_summaries(id), -- Hierarchical link
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique summaries per user, window type, and time period
  UNIQUE(user_id, window_type, window_start)
);

-- ============================================
-- ENHANCED SCREENSHOTS TABLE
-- Add idle detection and batch processing capabilities
-- ============================================
ALTER TABLE productivity_screenshots
  ADD COLUMN IF NOT EXISTS screen_hash TEXT,
  ADD COLUMN IF NOT EXISTS idle_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Add index for batch processing
CREATE INDEX IF NOT EXISTS idx_screenshots_batch_processing 
  ON productivity_screenshots(user_id, processed, captured_at);

CREATE INDEX IF NOT EXISTS idx_screenshots_batch_id
  ON productivity_screenshots(batch_id);

-- Partial index for finding unprocessed screenshots efficiently
CREATE INDEX IF NOT EXISTS idx_screenshots_unprocessed
  ON productivity_screenshots(user_id, captured_at)
  WHERE processed = FALSE;

-- ============================================
-- PROCESSING BATCHES TABLE
-- Track batch processing jobs
-- ============================================
CREATE TABLE IF NOT EXISTS processing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Processing timestamps
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Batch details
  screenshots_processed INTEGER DEFAULT 0,
  screenshots_total INTEGER DEFAULT 0,
  
  -- Context data
  context_input JSONB DEFAULT '{}', -- Previous summaries used
  context_output JSONB DEFAULT '{}', -- Generated summaries
  
  -- Status tracking
  status TEXT DEFAULT 'processing' CHECK (status IN (
    'processing', 'completed', 'failed', 'cancelled'
  )),
  error_message TEXT,
  
  -- Performance metrics
  processing_time_ms INTEGER,
  api_cost_estimate DECIMAL(10,4),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Context summaries indexes
CREATE INDEX IF NOT EXISTS idx_context_summaries_user_window 
  ON context_summaries(user_id, window_type, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_context_summaries_parent
  ON context_summaries(parent_summary_id);

CREATE INDEX IF NOT EXISTS idx_context_summaries_window_end
  ON context_summaries(window_end DESC);

-- Batch processing indexes  
CREATE INDEX IF NOT EXISTS idx_processing_batches_user
  ON processing_batches(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_processing_batches_status
  ON processing_batches(status, started_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE context_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_batches ENABLE ROW LEVEL SECURITY;

-- Policies for context_summaries
CREATE POLICY "Users can view own context summaries" 
  ON context_summaries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all context summaries"
  ON context_summaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'admin@intimesolutions.com')
    )
  );

-- Policies for processing_batches  
CREATE POLICY "Users can view own processing batches"
  ON processing_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all processing batches"
  ON processing_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'admin@intimesolutions.com')
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get latest context for a window type
CREATE OR REPLACE FUNCTION get_latest_context(
  p_user_id UUID,
  p_window_type TEXT
) RETURNS TABLE (
  summary_text TEXT,
  context_preserved TEXT,
  window_end TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.summary_text,
    cs.context_preserved,
    cs.window_end
  FROM context_summaries cs
  WHERE cs.user_id = p_user_id
    AND cs.window_type = p_window_type
  ORDER BY cs.window_end DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get all context windows for chaining
CREATE OR REPLACE FUNCTION get_all_contexts(
  p_user_id UUID
) RETURNS TABLE (
  window_type TEXT,
  summary_text TEXT,
  context_preserved TEXT,
  window_end TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_summaries AS (
    SELECT DISTINCT ON (window_type)
      window_type,
      summary_text,
      context_preserved,
      window_end
    FROM context_summaries
    WHERE user_id = p_user_id
    ORDER BY window_type, window_end DESC
  )
  SELECT * FROM latest_summaries
  ORDER BY 
    CASE window_type
      WHEN '15min' THEN 1
      WHEN '30min' THEN 2
      WHEN '1hr' THEN 3
      WHEN '2hr' THEN 4
      WHEN '4hr' THEN 5
      WHEN '1day' THEN 6
      WHEN '1week' THEN 7
      WHEN '1month' THEN 8
      WHEN '1year' THEN 9
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMMENTS
-- ============================================

COMMENT ON TABLE context_summaries IS 'Hierarchical context summaries for all time windows with human-like descriptions';
COMMENT ON TABLE processing_batches IS 'Track batch processing jobs for cost-efficient AI analysis';
COMMENT ON COLUMN context_summaries.summary_text IS 'Human-readable summary as if written by personal assistant';
COMMENT ON COLUMN context_summaries.context_preserved IS 'Key context to maintain continuity across time windows';
COMMENT ON COLUMN productivity_screenshots.screen_hash IS 'MD5 hash of screenshot for idle detection';
COMMENT ON COLUMN productivity_screenshots.idle_detected IS 'True if screen has not changed from previous capture';
