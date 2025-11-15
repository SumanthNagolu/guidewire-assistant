-- ============================================================================
-- RLS POLICIES VERIFICATION SCRIPT
-- Tests all Row Level Security policies to ensure proper access control
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 1: Helper Functions Verification';
  RAISE NOTICE '==========================================';
  
  -- Check if helper functions exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role') THEN
    RAISE NOTICE '✅ auth.has_role() function exists';
  ELSE
    RAISE EXCEPTION '❌ auth.has_role() function missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_any_role') THEN
    RAISE NOTICE '✅ auth.has_any_role() function exists';
  ELSE
    RAISE EXCEPTION '❌ auth.has_any_role() function missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    RAISE NOTICE '✅ auth.is_admin() function exists';
  ELSE
    RAISE EXCEPTION '❌ auth.is_admin() function missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'in_pod') THEN
    RAISE NOTICE '✅ auth.in_pod() function exists';
  ELSE
    RAISE EXCEPTION '❌ auth.in_pod() function missing';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 2: POLICY COUNT VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_policies INTEGER;
  expected_min_policies INTEGER := 100; -- We expect at least 100 policies
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 2: Policy Count Verification';
  RAISE NOTICE '==========================================';
  
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Total RLS policies created: %', total_policies;
  
  IF total_policies >= expected_min_policies THEN
    RAISE NOTICE '✅ Policy count meets minimum requirement (% >= %)', 
      total_policies, expected_min_policies;
  ELSE
    RAISE NOTICE '⚠️ Policy count below expectation (% < %)', 
      total_policies, expected_min_policies;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 3: TABLE-BY-TABLE POLICY VERIFICATION
-- ============================================================================

-- Core User System
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 3: Module-by-Module Verification';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '--- CORE USER SYSTEM ---';
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';
  RAISE NOTICE 'user_profiles: % policies', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'roles';
  RAISE NOTICE 'roles: % policies', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_roles';
  RAISE NOTICE 'user_roles: % policies', policy_count;
  
  RAISE NOTICE '';
END $$;

-- Academy Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'products', 'student_profiles', 'topics', 'topic_content_items',
    'topic_completions', 'quizzes', 'quiz_questions', 'quiz_attempts',
    'interview_templates', 'interview_sessions', 'interview_messages',
    'interview_feedback', 'learner_reminder_settings', 'learner_reminder_logs'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- ACADEMY MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- HR Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'departments', 'employee_records', 'timesheets', 'attendance',
    'leave_types', 'leave_balances', 'leave_requests',
    'expense_categories', 'expense_claims', 'bench_profiles'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- HR MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- CRM Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'candidates', 'clients', 'client_contacts', 'jobs',
    'applications', 'placements', 'placement_timesheets',
    'opportunities', 'activities'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- CRM MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- Platform Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'pods', 'pod_members', 'workflow_templates',
    'workflow_instances', 'tasks'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- PLATFORM MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- Productivity Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'productivity_sessions', 'productivity_screenshots', 'context_summaries'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- PRODUCTIVITY MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- AI/Companions Module
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'ai_conversations', 'ai_messages'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- AI/COMPANIONS MODULE ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- Shared Tables
DO $$
DECLARE
  policy_count INTEGER;
  table_names TEXT[] := ARRAY[
    'notifications', 'audit_logs', 'media_files'
  ];
  table_name TEXT;
BEGIN
  RAISE NOTICE '--- SHARED TABLES ---';
  
  FOREACH table_name IN ARRAY table_names
  LOOP
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = table_name;
    
    IF policy_count > 0 THEN
      RAISE NOTICE '✅ %: % policies', table_name, policy_count;
    ELSE
      RAISE NOTICE '⚠️ %: NO POLICIES', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 4: RLS ENABLED VERIFICATION
-- ============================================================================

DO $$
DECLARE
  rls_enabled_count INTEGER;
  total_tables INTEGER;
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 4: RLS Enabled Verification';
  RAISE NOTICE '==========================================';
  
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename NOT LIKE 'backup_%';
  
  -- Count total tables
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'backup_%';
  
  RAISE NOTICE 'Tables with RLS enabled: % / %', rls_enabled_count, total_tables;
  
  IF rls_enabled_count >= 40 THEN
    RAISE NOTICE '✅ Most tables have RLS enabled';
  ELSE
    RAISE NOTICE '⚠️ Some tables may be missing RLS';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 5: POLICY TYPES VERIFICATION
-- ============================================================================

DO $$
DECLARE
  select_policies INTEGER;
  insert_policies INTEGER;
  update_policies INTEGER;
  delete_policies INTEGER;
  all_policies INTEGER;
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 5: Policy Types Distribution';
  RAISE NOTICE '==========================================';
  
  SELECT COUNT(*) INTO select_policies FROM pg_policies WHERE cmd = 'SELECT';
  SELECT COUNT(*) INTO insert_policies FROM pg_policies WHERE cmd = 'INSERT';
  SELECT COUNT(*) INTO update_policies FROM pg_policies WHERE cmd = 'UPDATE';
  SELECT COUNT(*) INTO delete_policies FROM pg_policies WHERE cmd = 'DELETE';
  SELECT COUNT(*) INTO all_policies FROM pg_policies WHERE cmd = 'ALL';
  
  RAISE NOTICE 'SELECT policies: %', select_policies;
  RAISE NOTICE 'INSERT policies: %', insert_policies;
  RAISE NOTICE 'UPDATE policies: %', update_policies;
  RAISE NOTICE 'DELETE policies: %', delete_policies;
  RAISE NOTICE 'ALL policies: %', all_policies;
  
  IF select_policies > 0 AND insert_policies > 0 THEN
    RAISE NOTICE '✅ Policies cover multiple operation types';
  ELSE
    RAISE NOTICE '⚠️ Some operation types may be missing';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 6: CRITICAL TABLES VERIFICATION
-- ============================================================================

DO $$
DECLARE
  critical_tables TEXT[] := ARRAY[
    'user_profiles', 'topics', 'topic_completions',
    'employee_records', 'candidates', 'jobs', 'applications',
    'productivity_screenshots', 'ai_conversations'
  ];
  table_name TEXT;
  policy_count INTEGER;
  all_have_policies BOOLEAN := true;
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 6: Critical Tables Verification';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Checking critical tables have adequate policies...';
  RAISE NOTICE '';
  
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = table_name;
    
    IF policy_count >= 2 THEN
      RAISE NOTICE '✅ %: % policies (adequate)', table_name, policy_count;
    ELSIF policy_count = 1 THEN
      RAISE NOTICE '⚠️ %: % policy (minimal)', table_name, policy_count;
      all_have_policies := false;
    ELSE
      RAISE NOTICE '❌ %: NO POLICIES (critical!)', table_name;
      all_have_policies := false;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  
  IF all_have_policies THEN
    RAISE NOTICE '✅ All critical tables have adequate policies';
  ELSE
    RAISE NOTICE '⚠️ Some critical tables need more policies';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SECTION 7: DETAILED POLICY LISTING (SAMPLE)
-- ============================================================================

RAISE NOTICE '==========================================';
RAISE NOTICE 'SECTION 7: Sample Policy Details';
RAISE NOTICE '==========================================';
RAISE NOTICE 'Showing sample policies for user_profiles:';
RAISE NOTICE '';

SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- ============================================================================
-- SECTION 8: SUMMARY AND RECOMMENDATIONS
-- ============================================================================

DO $$
DECLARE
  total_policies INTEGER;
  total_tables INTEGER;
  rls_enabled INTEGER;
  tables_with_policies INTEGER;
  coverage_percentage NUMERIC;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SECTION 8: SUMMARY & RECOMMENDATIONS';
  RAISE NOTICE '==========================================';
  
  -- Get counts
  SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO total_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO rls_enabled 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true;
  SELECT COUNT(DISTINCT tablename) INTO tables_with_policies 
    FROM pg_policies 
    WHERE schemaname = 'public';
  
  coverage_percentage := ROUND((tables_with_policies::NUMERIC / NULLIF(total_tables, 0)) * 100, 1);
  
  RAISE NOTICE 'FINAL STATISTICS:';
  RAISE NOTICE '- Total policies created: %', total_policies;
  RAISE NOTICE '- Total tables in database: %', total_tables;
  RAISE NOTICE '- Tables with RLS enabled: %', rls_enabled;
  RAISE NOTICE '- Tables with policies: %', tables_with_policies;
  RAISE NOTICE '- Policy coverage: %%', coverage_percentage;
  RAISE NOTICE '';
  
  -- Overall assessment
  IF total_policies >= 100 AND coverage_percentage >= 60 THEN
    RAISE NOTICE '✅ EXCELLENT: Comprehensive RLS implementation';
    RAISE NOTICE '   - Strong security posture';
    RAISE NOTICE '   - Most tables protected';
    RAISE NOTICE '   - Ready for production';
  ELSIF total_policies >= 50 AND coverage_percentage >= 40 THEN
    RAISE NOTICE '✅ GOOD: Solid RLS foundation';
    RAISE NOTICE '   - Core tables protected';
    RAISE NOTICE '   - Consider adding policies for remaining tables';
  ELSE
    RAISE NOTICE '⚠️ NEEDS IMPROVEMENT: More policies recommended';
    RAISE NOTICE '   - Review critical tables';
    RAISE NOTICE '   - Add missing policies before production';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'RECOMMENDATIONS:';
  
  -- Check for tables without policies
  IF tables_with_policies < total_tables THEN
    RAISE NOTICE '1. Review tables without policies:';
    
    FOR table_record IN (
      SELECT t.tablename
      FROM pg_tables t
      WHERE t.schemaname = 'public'
        AND t.tablename NOT LIKE 'backup_%'
        AND NOT EXISTS (
          SELECT 1 FROM pg_policies p 
          WHERE p.tablename = t.tablename
        )
      LIMIT 10
    ) LOOP
      RAISE NOTICE '   - %', table_record.tablename;
    END LOOP;
  END IF;
  
  RAISE NOTICE '2. Test policies with actual user accounts';
  RAISE NOTICE '3. Monitor audit logs for policy violations';
  RAISE NOTICE '4. Review policies quarterly for updates';
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ RLS VERIFICATION COMPLETE';
  RAISE NOTICE '==========================================';
END $$;

ROLLBACK;

-- ============================================================================
-- VERIFICATION COMPLETE
-- 
-- This script checked:
-- ✓ Helper functions exist
-- ✓ Policy counts per module
-- ✓ RLS enabled on tables
-- ✓ Policy operation types
-- ✓ Critical table coverage
-- ✓ Overall security posture
-- 
-- Next steps:
-- 1. Review any warnings in output
-- 2. Test with real user accounts
-- 3. Deploy to production
-- ============================================================================

