-- ============================================
-- COMPREHENSIVE FIX FOR WORK CATEGORIES
-- ============================================

-- STEP 1: DIAGNOSE - Show what's actually in the database
-- This will show you EXACTLY what values are causing problems
SELECT 
  '=== PROBLEMATIC VALUES ===' as info;

SELECT
  work_category,
  COUNT(*) AS count,
  LENGTH(work_category) as length,
  -- Show invisible characters
  '>' || work_category || '<' as visible,
  -- Check if it would pass the new constraint
  CASE 
    WHEN work_category IS NULL THEN 'OK - NULL'
    WHEN work_category IN (
      'coding','development','debugging','testing','code_review',
      'documentation','research','learning','planning','meetings',
      'communication','email','break','idle','other','work',
      'deployment','design','analysis','training','support',
      'management','sales','recruitment'
    ) THEN 'OK - Valid'
    ELSE 'PROBLEM - Will fail constraint'
  END as status
FROM productivity_ai_analysis
GROUP BY work_category
ORDER BY status DESC, count DESC;

-- STEP 2: AGGRESSIVE NORMALIZATION
-- Handle ALL edge cases: Unicode, spaces, case, empty strings
UPDATE productivity_ai_analysis
SET work_category = LOWER(TRIM(work_category))
WHERE work_category IS NOT NULL;

-- Convert empty strings to NULL
UPDATE productivity_ai_analysis
SET work_category = NULL
WHERE work_category = '';

-- Remove any non-ASCII characters and normalize spacing
UPDATE productivity_ai_analysis
SET work_category = regexp_replace(
  regexp_replace(
    regexp_replace(
      LOWER(work_category),
      '[^a-z0-9_]',  -- Remove anything that's not alphanumeric or underscore
      '_',
      'g'
    ),
    '_+',  -- Collapse multiple underscores
    '_',
    'g'
  ),
  '^_|_$',  -- Remove leading/trailing underscores
  '',
  'g'
)
WHERE work_category IS NOT NULL;

-- STEP 3: MAP ALL KNOWN VARIATIONS TO CANONICAL VALUES
UPDATE productivity_ai_analysis
SET work_category = CASE
  -- Documentation variations
  WHEN work_category IN ('documentation', 'docs', 'doc', 'documenting', 'document') THEN 'documentation'
  
  -- Work variations
  WHEN work_category IN ('work', 'working', 'general', 'general_work', 'misc') THEN 'work'
  
  -- Development variations
  WHEN work_category IN ('development', 'dev', 'developing', 'coding_development') THEN 'development'
  
  -- Meeting variations
  WHEN work_category IN ('meeting', 'meetings', 'mtg', 'meet', 'standup', 'scrum') THEN 'meetings'
  
  -- Communication variations
  WHEN work_category IN ('communications', 'communication', 'chat', 'slack', 'teams', 'messaging') THEN 'communication'
  
  -- Code review variations
  WHEN work_category IN ('code_review', 'codereview', 'review', 'pr_review', 'pull_request') THEN 'code_review'
  
  -- Training variations (from your existing data)
  WHEN work_category IN ('training', 'learning', 'study', 'education', 'tutorial') THEN 'training'
  
  -- Client communication (existing)
  WHEN work_category IN ('client_communication', 'client_comm', 'client_meeting') THEN 'communication'
  
  -- Resume/recruiting (existing)
  WHEN work_category IN ('resume_screening', 'resume_review', 'cv_screening') THEN 'recruitment'
  WHEN work_category IN ('candidate_sourcing', 'sourcing', 'recruiting') THEN 'recruitment'
  WHEN work_category IN ('interview_scheduling', 'interview', 'interviewing') THEN 'recruitment'
  WHEN work_category IN ('job_posting', 'job_post', 'posting') THEN 'recruitment'
  
  -- Sales variations
  WHEN work_category IN ('proposal_writing', 'proposal', 'rfp') THEN 'sales'
  WHEN work_category IN ('crm_update', 'crm', 'salesforce') THEN 'sales'
  WHEN work_category IN ('lead_generation', 'leads', 'prospecting') THEN 'sales'
  
  -- Testing variations
  WHEN work_category IN ('testing', 'test', 'qa', 'quality_assurance') THEN 'testing'
  
  -- Debugging variations
  WHEN work_category IN ('debugging', 'debug', 'troubleshooting', 'fixing') THEN 'debugging'
  
  -- Research variations
  WHEN work_category IN ('research', 'researching', 'investigation', 'analysis') THEN 'research'
  
  -- Break/idle variations
  WHEN work_category IN ('break', 'coffee', 'lunch', 'rest') THEN 'break'
  WHEN work_category IN ('idle', 'inactive', 'away', 'afk') THEN 'idle'
  
  -- Email variations
  WHEN work_category IN ('email', 'emails', 'mail', 'outlook') THEN 'email'
  
  -- Planning variations
  WHEN work_category IN ('planning', 'plan', 'strategy', 'roadmap') THEN 'planning'
  
  -- Support variations
  WHEN work_category IN ('support', 'help', 'assistance', 'ticket') THEN 'support'
  
  -- Management variations
  WHEN work_category IN ('management', 'managing', 'admin', 'administration') THEN 'management'
  
  -- Design variations
  WHEN work_category IN ('design', 'designing', 'ui', 'ux', 'mockup') THEN 'design'
  
  -- Deployment variations
  WHEN work_category IN ('deployment', 'deploy', 'release', 'production') THEN 'deployment'
  
  -- Certification/practice (from existing)
  WHEN work_category IN ('certification', 'cert', 'certificate') THEN 'training'
  WHEN work_category IN ('practice', 'practicing', 'exercise') THEN 'training'
  
  -- Catch remaining valid values
  WHEN work_category IN (
    'coding','development','debugging','testing','code_review',
    'documentation','research','learning','planning','meetings',
    'communication','email','break','idle','other','work',
    'deployment','design','analysis','training','support',
    'management','sales','recruitment'
  ) THEN work_category
  
  -- Everything else becomes 'other'
  ELSE 'other'
END
WHERE work_category IS NOT NULL;

-- STEP 4: VERIFY ALL VALUES ARE NOW VALID
SELECT 
  '=== AFTER NORMALIZATION ===' as info;

SELECT
  work_category,
  COUNT(*) AS count,
  CASE 
    WHEN work_category IS NULL THEN 'OK - NULL'
    WHEN work_category IN (
      'coding','development','debugging','testing','code_review',
      'documentation','research','learning','planning','meetings',
      'communication','email','break','idle','other','work',
      'deployment','design','analysis','training','support',
      'management','sales','recruitment'
    ) THEN 'OK - Valid'
    ELSE 'STILL A PROBLEM!'
  END as status
FROM productivity_ai_analysis
GROUP BY work_category
ORDER BY status DESC, count DESC;

-- This should return 0 rows if everything is fixed
SELECT COUNT(*) as problematic_rows
FROM productivity_ai_analysis
WHERE work_category IS NOT NULL
  AND work_category NOT IN (
    'coding','development','debugging','testing','code_review',
    'documentation','research','learning','planning','meetings',
    'communication','email','break','idle','other','work',
    'deployment','design','analysis','training','support',
    'management','sales','recruitment'
  );

-- STEP 5: DROP AND RECREATE THE CONSTRAINT
-- Only run this after verifying step 4 shows 0 problematic rows
ALTER TABLE productivity_ai_analysis 
DROP CONSTRAINT IF EXISTS productivity_ai_analysis_work_category_check;

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

-- STEP 6: CREATE TRIGGER TO PREVENT FUTURE ISSUES
-- This will automatically normalize any new values
CREATE OR REPLACE FUNCTION normalize_work_category() 
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.work_category IS NOT NULL THEN
    -- Normalize the input
    NEW.work_category := LOWER(TRIM(NEW.work_category));
    
    -- Map common variations
    NEW.work_category := CASE
      WHEN NEW.work_category IN ('documentation', 'docs') THEN 'documentation'
      WHEN NEW.work_category IN ('work', 'working') THEN 'work'
      WHEN NEW.work_category IN ('meeting', 'meetings') THEN 'meetings'
      WHEN NEW.work_category IN ('', ' ') THEN NULL
      ELSE NEW.work_category
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_work_category ON productivity_ai_analysis;
CREATE TRIGGER trg_normalize_work_category
BEFORE INSERT OR UPDATE ON productivity_ai_analysis
FOR EACH ROW EXECUTE FUNCTION normalize_work_category();

-- STEP 7: VERIFY EVERYTHING WORKS
SELECT 
  '=== FINAL STATUS ===' as info;

SELECT 
  COUNT(*) as total_records,
  COUNT(work_category) as with_category,
  COUNT(*) - COUNT(work_category) as null_category
FROM productivity_ai_analysis;

-- STEP 8: Fix screenshots table too
ALTER TABLE productivity_screenshots
  ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS screen_hash TEXT,
  ADD COLUMN IF NOT EXISTS idle_detected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Add optimized indexes
CREATE INDEX IF NOT EXISTS idx_screenshots_processed 
  ON productivity_screenshots(user_id, processed, captured_at);

CREATE INDEX IF NOT EXISTS idx_screenshots_unprocessed
  ON productivity_screenshots(user_id, captured_at)
  WHERE processed = false;

-- DONE!
SELECT '✅ All categories normalized and constraint added successfully!' as result;


