-- Hierarchical Summary System for InTime eSolutions
-- Maintains summaries at different time windows for context preservation and cost optimization

-- Drop existing tables if needed (for clean setup)
DROP TABLE IF EXISTS productivity_summaries CASCADE;

-- Create hierarchical summaries table
CREATE TABLE productivity_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Time window configuration
  window_type TEXT NOT NULL CHECK (window_type IN ('5min', '30min', '1hour', '2hour', '4hour', 'daily', 'weekly', 'monthly')),
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Summary content
  summary_text TEXT NOT NULL,
  key_activities JSONB DEFAULT '[]', -- Array of main activities
  applications_used JSONB DEFAULT '{}', -- App usage stats
  productivity_metrics JSONB DEFAULT '{}', -- Scores and metrics
  
  -- Context chain
  previous_summary_id UUID REFERENCES productivity_summaries(id),
  context_preserved TEXT, -- Key context to carry forward
  
  -- Statistics
  screenshot_count INT DEFAULT 0,
  total_active_time INT DEFAULT 0, -- in seconds
  avg_productivity_score DECIMAL(5,2),
  avg_focus_score DECIMAL(5,2),
  
  -- Processing metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generation_method TEXT DEFAULT 'ai', -- 'ai' or 'aggregation'
  ai_model TEXT,
  processing_time_ms INT,
  
  -- Indexing for fast queries
  CONSTRAINT unique_user_window UNIQUE (user_id, window_type, window_start)
);

-- Create indexes for performance
CREATE INDEX idx_summaries_user_window ON productivity_summaries(user_id, window_type, window_start DESC);
CREATE INDEX idx_summaries_window_end ON productivity_summaries(window_end);
CREATE INDEX idx_summaries_previous ON productivity_summaries(previous_summary_id);

-- Create summary generation schedule table
CREATE TABLE IF NOT EXISTS summary_generation_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  window_type TEXT NOT NULL,
  generation_interval INTERVAL NOT NULL,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT unique_window_type UNIQUE (window_type)
);

-- Insert default generation schedule
INSERT INTO summary_generation_schedule (window_type, generation_interval) VALUES
  ('5min', INTERVAL '5 minutes'),
  ('30min', INTERVAL '30 minutes'),
  ('1hour', INTERVAL '1 hour'),
  ('2hour', INTERVAL '2 hours'),
  ('4hour', INTERVAL '4 hours'),
  ('daily', INTERVAL '1 day'),
  ('weekly', INTERVAL '7 days'),
  ('monthly', INTERVAL '30 days')
ON CONFLICT (window_type) DO NOTHING;

-- Function to get the appropriate summary for context
CREATE OR REPLACE FUNCTION get_context_summary(
  p_user_id UUID,
  p_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS TABLE (
  window_type TEXT,
  summary_text TEXT,
  context_preserved TEXT,
  productivity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.window_type,
    s.summary_text,
    s.context_preserved,
    s.avg_productivity_score
  FROM productivity_summaries s
  WHERE s.user_id = p_user_id
    AND s.window_start <= p_timestamp
    AND s.window_end >= p_timestamp
  ORDER BY 
    CASE s.window_type
      WHEN '5min' THEN 1
      WHEN '30min' THEN 2
      WHEN '1hour' THEN 3
      WHEN '2hour' THEN 4
      WHEN '4hour' THEN 5
      WHEN 'daily' THEN 6
      WHEN 'weekly' THEN 7
      WHEN 'monthly' THEN 8
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE productivity_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own summaries"
  ON productivity_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all summaries"
  ON productivity_summaries FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON productivity_summaries TO authenticated;
GRANT ALL ON productivity_summaries TO service_role;
GRANT SELECT ON summary_generation_schedule TO authenticated;
GRANT ALL ON summary_generation_schedule TO service_role;


