-- ============================================
-- VERIFY AI PRODUCTIVITY MIGRATION
-- Run this after executing ai-productivity-complete-schema.sql
-- ============================================

-- 1. Check all new tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'productivity_ai_analysis',
    'productivity_work_summaries',
    'productivity_presence',
    'productivity_teams',
    'productivity_team_members',
    'productivity_websites'
  )
ORDER BY table_name;

-- Expected: 6 tables with column counts

-- 2. Check user_profiles has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN ('industry_role', 'user_tags', 'work_context', 'ai_analysis_enabled')
ORDER BY column_name;

-- Expected: 4 columns

-- 3. Check teams were created
SELECT id, name, team_code FROM productivity_teams ORDER BY name;

-- Expected: 5 default teams (Bench, Sales, Recruiting, Operations, Management)

-- 4. Check indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename LIKE 'productivity_%'
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: Multiple indexes for performance

-- 5. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'productivity_ai_analysis',
    'productivity_work_summaries',
    'productivity_presence',
    'productivity_websites'
  );

-- Expected: All should show rowsecurity = true

-- 6. Check triggers exist
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
  'screenshot_updates_presence',
  'ai_analysis_updates_active_time'
)
ORDER BY trigger_name;

-- Expected: 2 triggers

-- 7. Verify admin user exists and has industry_role
SELECT 
  id,
  email,
  industry_role,
  user_tags,
  ai_analysis_enabled
FROM user_profiles
WHERE email = 'admin@intimesolutions.com';

-- Expected: 1 row with your admin user

-- ============================================
-- SUCCESS CRITERIA
-- ============================================
-- ✅ All 6 new tables exist
-- ✅ user_profiles has 4 new columns
-- ✅ 5 teams created
-- ✅ Multiple indexes created
-- ✅ RLS enabled on AI tables
-- ✅ 2 triggers created
-- ✅ Admin user exists

-- If all queries return data, migration was SUCCESSFUL! 🎉



