-- ============================================================================
-- DATABASE CONSOLIDATION - VERIFICATION QUERIES
-- Request ID: ede3d9ae-8baa-4807-866a-0b814563bd90
-- ============================================================================
-- 
-- Run these queries AFTER executing the consolidation migration to verify
-- that everything was created successfully and data is intact.
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSION VERIFICATION
-- ============================================================================

SELECT 
  'Extensions' as check_category,
  extname as name,
  extversion as version,
  '✅ Installed' as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector')
ORDER BY extname;

-- Expected: 3 extensions (uuid-ossp, pgcrypto, vector)

-- ============================================================================
-- SECTION 2: TABLE EXISTENCE CHECK
-- ============================================================================

-- Count total tables created
SELECT 
  'Total Tables' as metric,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 60 THEN '✅ All tables present'
    ELSE '⚠️ Some tables missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%';

-- List all core tables with row counts
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count,
  pg_size_pretty(pg_total_relation_size('public.'||table_name)) as size,
  CASE 
    WHEN table_name IN ('user_profiles', 'roles', 'products', 'topics') THEN '🔥 Core'
    WHEN table_name LIKE 'student_%' OR table_name LIKE 'quiz_%' OR table_name LIKE 'interview_%' THEN '🎓 Academy'
    WHEN table_name LIKE 'employee_%' OR table_name IN ('departments', 'attendance', 'leave_requests') THEN '👔 HR'
    WHEN table_name IN ('candidates', 'clients', 'jobs', 'applications', 'placements') THEN '💼 CRM'
    WHEN table_name IN ('pods', 'workflow_templates', 'workflow_instances', 'tasks') THEN '⚙️ Platform'
    WHEN table_name LIKE 'productivity_%' OR table_name = 'context_summaries' THEN '📊 Productivity'
    WHEN table_name LIKE 'ai_%' THEN '🤖 AI'
    ELSE '📦 Shared'
  END as module
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%'
ORDER BY module, table_name;

-- ============================================================================
-- SECTION 3: DATA INTEGRITY CHECK
-- ============================================================================

-- Verify critical tables have data (or can accept data)
WITH table_checks AS (
  SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
  UNION ALL
  SELECT 'roles', COUNT(*) FROM roles
  UNION ALL
  SELECT 'departments', COUNT(*) FROM departments
  UNION ALL
  SELECT 'pods', COUNT(*) FROM pods
  UNION ALL
  SELECT 'leave_types', COUNT(*) FROM leave_types
  UNION ALL
  SELECT 'expense_categories', COUNT(*) FROM expense_categories
  UNION ALL
  SELECT 'products', COUNT(*) FROM products WHERE EXISTS (SELECT 1 FROM products LIMIT 1)
  UNION ALL
  SELECT 'topics', COUNT(*) FROM topics WHERE EXISTS (SELECT 1 FROM topics LIMIT 1)
)
SELECT 
  table_name,
  row_count,
  CASE 
    WHEN table_name IN ('roles', 'departments', 'pods', 'leave_types', 'expense_categories') 
         AND row_count > 0 THEN '✅ Seeded'
    WHEN table_name IN ('user_profiles', 'products', 'topics') 
         AND row_count > 0 THEN '✅ Has data'
    WHEN row_count = 0 THEN '⚠️ Empty (OK if new system)'
    ELSE '✅ Ready'
  END as status
FROM table_checks
ORDER BY table_name;

-- ============================================================================
-- SECTION 4: INDEX VERIFICATION
-- ============================================================================

-- Count indexes per table
SELECT 
  tablename,
  COUNT(*) as index_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ No indexes'
    WHEN COUNT(*) BETWEEN 1 AND 2 THEN '✅ Basic indexes'
    WHEN COUNT(*) >= 3 THEN '✅ Well-indexed'
  END as index_status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'topics', 'candidates', 'jobs', 'applications', 
                    'employee_records', 'productivity_screenshots', 'workflow_instances')
GROUP BY tablename
ORDER BY index_count DESC;

-- ============================================================================
-- SECTION 5: FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Verify foreign key relationships
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  '✅ Valid' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('topics', 'topic_completions', 'employee_records', 
                        'applications', 'placements', 'workflow_instances')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) CHECK
-- ============================================================================

-- Verify RLS is enabled on sensitive tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '⚠️ RLS Disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 'student_profiles', 'employee_records',
    'topics', 'topic_completions', 'candidates', 'clients', 'jobs',
    'applications', 'placements', 'productivity_screenshots',
    'ai_conversations', 'notifications'
  )
ORDER BY tablename;

-- Count RLS policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ No policies'
    WHEN COUNT(*) BETWEEN 1 AND 2 THEN '⚠️ Basic policies'
    WHEN COUNT(*) >= 3 THEN '✅ Well-protected'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- ============================================================================
-- SECTION 7: FUNCTION & TRIGGER VERIFICATION
-- ============================================================================

-- Check key functions exist
SELECT 
  routine_name as function_name,
  routine_type as type,
  '✅ Created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column')
ORDER BY routine_name;

-- Check triggers are active
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation,
  '✅ Active' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ============================================================================
-- SECTION 8: SEED DATA VERIFICATION
-- ============================================================================

-- Check that seed data was inserted
SELECT '🎭 Roles' as category, COUNT(*) as count, 
  CASE WHEN COUNT(*) >= 8 THEN '✅ Complete' ELSE '⚠️ Incomplete' END as status
FROM roles
UNION ALL
SELECT '🏢 Departments', COUNT(*),
  CASE WHEN COUNT(*) >= 6 THEN '✅ Complete' ELSE '⚠️ Incomplete' END
FROM departments
UNION ALL
SELECT '👥 Pods', COUNT(*),
  CASE WHEN COUNT(*) >= 5 THEN '✅ Complete' ELSE '⚠️ Incomplete' END
FROM pods
UNION ALL
SELECT '🏖️ Leave Types', COUNT(*),
  CASE WHEN COUNT(*) >= 4 THEN '✅ Complete' ELSE '⚠️ Incomplete' END
FROM leave_types
UNION ALL
SELECT '💰 Expense Categories', COUNT(*),
  CASE WHEN COUNT(*) >= 5 THEN '✅ Complete' ELSE '⚠️ Incomplete' END
FROM expense_categories;

-- ============================================================================
-- SECTION 9: MODULE-SPECIFIC CHECKS
-- ============================================================================

-- Academy Module
SELECT 
  'Academy Module' as module,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM topics) as topics,
  (SELECT COUNT(*) FROM student_profiles) as students,
  CASE 
    WHEN (SELECT COUNT(*) FROM products) > 0 THEN '✅ Ready'
    ELSE '⚠️ No products yet'
  END as status;

-- HR Module
SELECT 
  'HR Module' as module,
  (SELECT COUNT(*) FROM departments) as departments,
  (SELECT COUNT(*) FROM employee_records) as employees,
  (SELECT COUNT(*) FROM leave_types) as leave_types,
  CASE 
    WHEN (SELECT COUNT(*) FROM departments) >= 6 THEN '✅ Ready'
    ELSE '⚠️ Setup needed'
  END as status;

-- CRM Module
SELECT 
  'CRM Module' as module,
  (SELECT COUNT(*) FROM candidates) as candidates,
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM jobs) as jobs,
  (SELECT COUNT(*) FROM applications) as applications,
  CASE 
    WHEN (SELECT COUNT(*) FROM candidates) > 0 OR 
         (SELECT COUNT(*) FROM clients) > 0 THEN '✅ Has data'
    ELSE '⚠️ Empty (OK if new)'
  END as status;

-- Platform Module
SELECT 
  'Platform Module' as module,
  (SELECT COUNT(*) FROM pods) as pods,
  (SELECT COUNT(*) FROM workflow_templates) as workflows,
  (SELECT COUNT(*) FROM workflow_instances) as active_workflows,
  CASE 
    WHEN (SELECT COUNT(*) FROM pods) >= 5 THEN '✅ Ready'
    ELSE '⚠️ Setup needed'
  END as status;

-- Productivity Module
SELECT 
  'Productivity Module' as module,
  (SELECT COUNT(*) FROM productivity_sessions) as sessions,
  (SELECT COUNT(*) FROM productivity_screenshots) as screenshots,
  (SELECT COUNT(*) FROM context_summaries) as summaries,
  CASE 
    WHEN (SELECT COUNT(*) FROM productivity_screenshots) > 0 THEN '✅ Has data'
    ELSE '⚠️ No tracking yet'
  END as status;

-- AI/Companions Module
SELECT 
  'AI Module' as module,
  (SELECT COUNT(*) FROM ai_conversations) as conversations,
  (SELECT COUNT(*) FROM ai_messages) as messages,
  CASE 
    WHEN (SELECT COUNT(*) FROM ai_conversations) > 0 THEN '✅ Active'
    ELSE '⚠️ Not used yet'
  END as status;

-- ============================================================================
-- SECTION 10: DISK USAGE & PERFORMANCE
-- ============================================================================

-- Table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size('public.'||table_name)) as total_size,
  pg_size_pretty(pg_relation_size('public.'||table_name)) as data_size,
  pg_size_pretty(pg_total_relation_size('public.'||table_name) - pg_relation_size('public.'||table_name)) as index_size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'backup_%'
ORDER BY pg_total_relation_size('public.'||table_name) DESC
LIMIT 20;

-- Database overall size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as table_count,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public') as total_columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;

-- ============================================================================
-- SECTION 11: FINAL HEALTH CHECK
-- ============================================================================

-- Overall system health summary
WITH health_checks AS (
  SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 60 as tables_ok,
    (SELECT COUNT(*) FROM roles) >= 8 as roles_ok,
    (SELECT COUNT(*) FROM departments) >= 6 as departments_ok,
    (SELECT COUNT(*) FROM pods) >= 5 as pods_ok,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_profiles' LIMIT 1) as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0 as policies_exist,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_updated_at_column') = 1 as functions_ok
)
SELECT 
  CASE 
    WHEN tables_ok AND roles_ok AND departments_ok AND pods_ok AND rls_enabled AND policies_exist AND functions_ok 
    THEN '✅ DATABASE CONSOLIDATION SUCCESSFUL! All checks passed.'
    ELSE '⚠️ CONSOLIDATION INCOMPLETE - Review warnings above'
  END as overall_status,
  tables_ok as "Tables✓",
  roles_ok as "Roles✓",
  departments_ok as "Departments✓",
  pods_ok as "Pods✓",
  rls_enabled as "RLS✓",
  policies_exist as "Policies✓",
  functions_ok as "Functions✓"
FROM health_checks;

-- ============================================================================
-- SECTION 12: ACTION ITEMS (If any checks failed)
-- ============================================================================

-- If any checks above showed warnings, uncomment and run relevant fixes:

/*
-- Example: Re-seed roles if missing
INSERT INTO roles (code, name, description, priority, permissions) VALUES
  ('student', 'Student', 'Academy Student', 10, '{"academy": "read"}')
ON CONFLICT (code) DO NOTHING;

-- Example: Create missing indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Example: Enable RLS on a table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- END OF VERIFICATION
-- ============================================================================

-- 📋 VERIFICATION CHECKLIST:
-- □ All extensions installed (uuid-ossp, pgcrypto, vector)
-- □ 60+ tables created
-- □ Seed data populated (8 roles, 6 departments, 5 pods, 4 leave types, 5 expense categories)
-- □ Indexes created on key tables
-- □ Foreign key constraints active
-- □ RLS enabled on sensitive tables
-- □ RLS policies created
-- □ Triggers active (updated_at)
-- □ No error messages in any queries above
-- □ Database size reasonable (<100MB if empty, varies with data)
-- 
-- If all checkboxes pass: ✅ CONSOLIDATION COMPLETE!
-- If any fail: Review specific sections above for details
-- ============================================================================

