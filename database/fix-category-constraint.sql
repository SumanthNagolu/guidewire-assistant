-- Fix the work_category constraint to accept more variations
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE productivity_ai_analysis 
DROP CONSTRAINT IF EXISTS productivity_ai_analysis_work_category_check;

-- Add a more flexible constraint that accepts various categories
ALTER TABLE productivity_ai_analysis 
ADD CONSTRAINT productivity_ai_analysis_work_category_check 
CHECK (
  work_category IS NULL OR 
  LOWER(work_category) IN (
    'coding',
    'development',
    'debugging',
    'testing',
    'code_review',
    'documentation',
    'research',
    'learning',
    'planning',
    'meetings',
    'communication',
    'email',
    'break',
    'idle',
    'other',
    'work',
    'deployment',
    'design',
    'analysis',
    'training',
    'support',
    'management',
    'sales',
    'recruitment'
  )
);

-- Also update the processed column issue if needed
ALTER TABLE productivity_screenshots
  ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS screen_hash TEXT,
  ADD COLUMN IF NOT EXISTS idle_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_screenshots_processed 
ON productivity_screenshots(user_id, processed, captured_at);

-- Verify the fix
SELECT 
  COUNT(*) as total_screenshots,
  COUNT(*) FILTER (WHERE processed = false) as unprocessed,
  COUNT(*) FILTER (WHERE processed = true) as processed
FROM productivity_screenshots
WHERE user_id = (SELECT id FROM user_profiles WHERE email = 'admin@intimesolutions.com');


