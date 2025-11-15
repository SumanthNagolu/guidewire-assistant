-- Clear incorrect test data from productivity tables
-- Run this in Supabase SQL Editor

-- Get the user ID for admin@intimesolutions.com
WITH target_user AS (
  SELECT id FROM user_profiles 
  WHERE email = 'admin@intimesolutions.com'
  LIMIT 1
)

-- Clear today's incorrect data
DELETE FROM productivity_sessions
WHERE user_id IN (SELECT id FROM target_user)
  AND start_time >= CURRENT_DATE;

-- Clear today's application data
DELETE FROM productivity_applications  
WHERE user_id IN (SELECT id FROM target_user)
  AND start_time >= CURRENT_DATE;

-- Keep screenshots but you can delete if needed
-- DELETE FROM productivity_screenshots
-- WHERE user_id IN (SELECT id FROM target_user)
--   AND captured_at >= CURRENT_DATE;

-- Verify cleanup
SELECT 
  'Sessions' as table_name,
  COUNT(*) as remaining_records
FROM productivity_sessions
WHERE user_id IN (
  SELECT id FROM user_profiles 
  WHERE email = 'admin@intimesolutions.com'
)
AND start_time >= CURRENT_DATE

UNION ALL

SELECT 
  'Applications' as table_name,
  COUNT(*) as remaining_records
FROM productivity_applications
WHERE user_id IN (
  SELECT id FROM user_profiles 
  WHERE email = 'admin@intimesolutions.com'
)
AND start_time >= CURRENT_DATE;


