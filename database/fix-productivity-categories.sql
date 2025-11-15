-- ============================================
-- FIX PRODUCTIVITY CATEGORIES
-- ============================================

-- Step 1: Check what values are currently in the database
SELECT 
  work_category,
  COUNT(*) as count,
  CASE 
    WHEN work_category IS NULL THEN 'NULL (valid)'
    WHEN LOWER(work_category) IN (
      'coding','development','debugging','testing','code_review',
      'documentation','research','learning','planning','meetings',
      'communication','email','break','idle','other','work',
      'deployment','design','analysis','training','support',
      'management','sales','recruitment'
    ) THEN 'Will pass new constraint'
    ELSE 'WILL FAIL - needs fix'
  END as status
FROM productivity_ai_analysis
GROUP BY work_category
ORDER BY status DESC, count DESC;

-- Step 2: Normalize existing data (convert to lowercase)
UPDATE productivity_ai_analysis
SET work_category = LOWER(TRIM(work_category))
WHERE work_category IS NOT NULL;

-- Step 3: Map any remaining variants to canonical values
UPDATE productivity_ai_analysis
SET work_category = CASE
  -- Map common variations
  WHEN LOWER(work_category) IN ('documentation', 'docs', 'doc') THEN 'documentation'
  WHEN LOWER(work_category) IN ('work', 'working', 'general') THEN 'work'
  WHEN LOWER(work_category) IN ('development', 'dev', 'developing') THEN 'development'
  WHEN LOWER(work_category) IN ('meeting', 'meetings', 'mtg') THEN 'meetings'
  WHEN LOWER(work_category) IN ('communications', 'communication', 'chat') THEN 'communication'
  WHEN LOWER(work_category) IN ('code_review', 'code review', 'review') THEN 'code_review'
  ELSE LOWER(work_category)
END
WHERE work_category IS NOT NULL;

-- Step 4: Drop the old constraint
ALTER TABLE productivity_ai_analysis 
DROP CONSTRAINT IF EXISTS productivity_ai_analysis_work_category_check;

-- Step 5: Add the new, more flexible constraint
ALTER TABLE productivity_ai_analysis 
ADD CONSTRAINT productivity_ai_analysis_work_category_check 
CHECK (
  work_category IS NULL OR 
  work_category IN (
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

-- Step 6: Fix the AI analysis to always return lowercase categories
-- This is a note for the application code, not SQL

-- Step 7: Verify the fix worked
SELECT 
  'Categories after fix:' as info,
  work_category,
  COUNT(*) as count
FROM productivity_ai_analysis
GROUP BY work_category
ORDER BY count DESC;

-- Step 8: Also ensure screenshots table has all needed columns
ALTER TABLE productivity_screenshots
  ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS screen_hash TEXT,
  ADD COLUMN IF NOT EXISTS idle_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Step 9: Add the performance index
CREATE INDEX IF NOT EXISTS idx_screenshots_processed 
ON productivity_screenshots(user_id, processed, captured_at);

-- Step 10: Verify everything is working
SELECT 
  'Screenshots table ready' as status,
  COUNT(*) as total_screenshots,
  COUNT(*) FILTER (WHERE processed = false) as unprocessed,
  COUNT(*) FILTER (WHERE processed = true) as processed
FROM productivity_screenshots;


