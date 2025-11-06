-- Update Topics with Content URLs
-- Run this AFTER uploading content to Supabase Storage
--
-- This script updates the `content` JSONB field in topics to reference uploaded files
-- Files are accessed via the /api/content/{product}/{topic}/{filename} endpoint

-- Strategy 1: Update all topics with standard file structure
-- Assumes each topic has: slides.pdf, demo.mp4, assignment.pdf

-- Example for ClaimCenter topics
UPDATE public.topics
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(content, '{}'::jsonb),
      '{slides_url}',
      to_jsonb('/api/content/' || p.code || '/' || t.code || '/slides.pdf'),
      true
    ),
    '{demo_url}',
    to_jsonb('/api/content/' || p.code || '/' || t.code || '/demo.mp4'),
    true
  ),
  '{assignment_url}',
  to_jsonb('/api/content/' || p.code || '/' || t.code || '/assignment.pdf'),
  true
)
FROM public.topics t
JOIN public.products p ON t.product_id = p.id
WHERE public.topics.id = t.id
  AND p.code IN ('CC', 'PC', 'BC', 'FW');

-- Verify updates
SELECT 
  p.code as product,
  t.code as topic_code,
  t.title,
  t.content->>'slides_url' as slides,
  t.content->>'demo_url' as demo,
  t.content->>'assignment_url' as assignment
FROM public.topics t
JOIN public.products p ON t.product_id = p.id
WHERE t.content IS NOT NULL
ORDER BY p.code, t.position
LIMIT 20;

-- Strategy 2: Manual update for specific topics (if structure varies)
-- Example: Update a single topic

/*
UPDATE public.topics
SET content = jsonb_set(
  content,
  '{slides_url}',
  '"/api/content/CC/cc-01-001/custom-slides.pdf"'::jsonb,
  true
)
WHERE code = 'cc-01-001';
*/

-- Strategy 3: Update only if files exist (requires verification)
-- You can check which files exist in storage:

/*
SELECT 
  name,
  bucket_id,
  created_at,
  (metadata->>'size')::bigint / 1024 as size_kb
FROM storage.objects
WHERE bucket_id = 'course-content'
ORDER BY name
LIMIT 100;
*/

-- Notes:
-- 1. The /api/content endpoint will generate signed URLs on-demand
-- 2. URLs are valid for 1 hour and cached for 50 minutes
-- 3. Users must be authenticated to access content
-- 4. If a file doesn't exist, the API will return a 500 error

-- Common patterns:
-- - slides.pdf / slides.pptx
-- - demo.mp4 / demo-01.mp4, demo-02.mp4
-- - assignment.pdf / assignment-solution.pdf

