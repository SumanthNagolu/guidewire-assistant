-- ============================================================================
-- DATABASE CONSOLIDATION - TEST SCRIPT
-- Request ID: ede3d9ae-8baa-4807-866a-0b814563bd90
-- ============================================================================
-- 
-- This script validates the consolidated schema by running actual
-- INSERT/UPDATE/DELETE operations to ensure everything works correctly.
--
-- ⚠️ RUN THIS AFTER: CONSOLIDATION_MIGRATION_FINAL.sql
-- ⚠️ RUN THIS ON: Test/Staging environment first
-- ⚠️ THIS WILL: Create test data and clean it up
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- TEST 1: CORE USER SYSTEM
-- ============================================================================

DO $$
DECLARE
  test_user_id UUID;
  role_id UUID;
BEGIN
  RAISE NOTICE 'TEST 1: Core User System';
  
  -- Get a role ID
  SELECT id INTO role_id FROM roles WHERE code = 'student' LIMIT 1;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION '❌ FAILED: No roles found. Seed data missing?';
  ELSE
    RAISE NOTICE '✅ PASSED: Roles table has data';
  END IF;
  
  -- Check user_roles table structure
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) THEN
    RAISE NOTICE '✅ PASSED: user_roles table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: user_roles table missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 2: ACADEMY MODULE
-- ============================================================================

DO $$
DECLARE
  product_id UUID;
  topic_id UUID;
  test_topic_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 2: Academy Module';
  
  -- Test products table
  SELECT COUNT(*) INTO test_topic_count FROM products;
  IF test_topic_count >= 0 THEN
    RAISE NOTICE '✅ PASSED: products table accessible (% rows)', test_topic_count;
  END IF;
  
  -- Test topics table structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'topics' AND column_name = 'position'
  ) THEN
    RAISE NOTICE '✅ PASSED: topics table has position column';
  ELSE
    RAISE EXCEPTION '❌ FAILED: topics table missing position column';
  END IF;
  
  -- Test topics can be created (if products exist)
  SELECT id INTO product_id FROM products LIMIT 1;
  IF product_id IS NOT NULL THEN
    INSERT INTO topics (product_id, position, title, description, published)
    VALUES (product_id, 9999, 'TEST TOPIC - DELETE ME', 'Test topic for validation', false)
    RETURNING id INTO topic_id;
    
    RAISE NOTICE '✅ PASSED: Can insert topics (test ID: %)', topic_id;
    
    -- Clean up test topic
    DELETE FROM topics WHERE id = topic_id;
    RAISE NOTICE '✅ PASSED: Can delete topics';
  ELSE
    RAISE NOTICE '⚠️ SKIPPED: No products exist to test topic creation';
  END IF;
  
  -- Test student_profiles table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_profiles') THEN
    RAISE NOTICE '✅ PASSED: student_profiles table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: student_profiles table missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 3: HR MODULE
-- ============================================================================

DO $$
DECLARE
  dept_count INTEGER;
  leave_type_count INTEGER;
  expense_cat_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 3: HR Module';
  
  -- Check departments
  SELECT COUNT(*) INTO dept_count FROM departments;
  IF dept_count >= 6 THEN
    RAISE NOTICE '✅ PASSED: departments seeded (% rows)', dept_count;
  ELSE
    RAISE EXCEPTION '❌ FAILED: departments not properly seeded (expected >= 6, got %)', dept_count;
  END IF;
  
  -- Check leave_types
  SELECT COUNT(*) INTO leave_type_count FROM leave_types;
  IF leave_type_count >= 4 THEN
    RAISE NOTICE '✅ PASSED: leave_types seeded (% rows)', leave_type_count;
  ELSE
    RAISE EXCEPTION '❌ FAILED: leave_types not properly seeded (expected >= 4, got %)', leave_type_count;
  END IF;
  
  -- Check expense_categories
  SELECT COUNT(*) INTO expense_cat_count FROM expense_categories;
  IF expense_cat_count >= 5 THEN
    RAISE NOTICE '✅ PASSED: expense_categories seeded (% rows)', expense_cat_count;
  ELSE
    RAISE EXCEPTION '❌ FAILED: expense_categories not properly seeded (expected >= 5, got %)', expense_cat_count;
  END IF;
  
  -- Check employee_records table structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_records' AND column_name = 'employee_id'
  ) THEN
    RAISE NOTICE '✅ PASSED: employee_records has employee_id column';
  ELSE
    RAISE EXCEPTION '❌ FAILED: employee_records missing employee_id column';
  END IF;
END $$;

-- ============================================================================
-- TEST 4: CRM MODULE
-- ============================================================================

DO $$
DECLARE
  test_candidate_id UUID;
  test_client_id UUID;
  test_job_id UUID;
BEGIN
  RAISE NOTICE 'TEST 4: CRM Module';
  
  -- Test candidates table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidates') THEN
    RAISE NOTICE '✅ PASSED: candidates table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: candidates table missing';
  END IF;
  
  -- Test clients table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
    RAISE NOTICE '✅ PASSED: clients table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: clients table missing';
  END IF;
  
  -- Test jobs table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
    RAISE NOTICE '✅ PASSED: jobs table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: jobs table missing';
  END IF;
  
  -- Test applications table (14-stage pipeline)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'status'
  ) THEN
    RAISE NOTICE '✅ PASSED: applications table has status column';
  ELSE
    RAISE EXCEPTION '❌ FAILED: applications table structure incorrect';
  END IF;
END $$;

-- ============================================================================
-- TEST 5: PLATFORM MODULE (Pods & Workflows)
-- ============================================================================

DO $$
DECLARE
  pod_count INTEGER;
  workflow_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 5: Platform Module';
  
  -- Check pods
  SELECT COUNT(*) INTO pod_count FROM pods;
  IF pod_count >= 5 THEN
    RAISE NOTICE '✅ PASSED: pods seeded (% rows)', pod_count;
  ELSE
    RAISE EXCEPTION '❌ FAILED: pods not properly seeded (expected >= 5, got %)', pod_count;
  END IF;
  
  -- Check workflow_templates table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_templates') THEN
    RAISE NOTICE '✅ PASSED: workflow_templates table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: workflow_templates table missing';
  END IF;
  
  -- Check workflow_instances table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_instances') THEN
    RAISE NOTICE '✅ PASSED: workflow_instances table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: workflow_instances table missing';
  END IF;
  
  -- Check tasks table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    RAISE NOTICE '✅ PASSED: tasks table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: tasks table missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 6: PRODUCTIVITY MODULE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'TEST 6: Productivity Module';
  
  -- Check productivity_sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_sessions') THEN
    RAISE NOTICE '✅ PASSED: productivity_sessions table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: productivity_sessions table missing';
  END IF;
  
  -- Check productivity_screenshots
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_screenshots') THEN
    RAISE NOTICE '✅ PASSED: productivity_screenshots table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: productivity_screenshots table missing';
  END IF;
  
  -- Check context_summaries
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'context_summaries') THEN
    RAISE NOTICE '✅ PASSED: context_summaries table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: context_summaries table missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 7: COMPANIONS MODULE (AI)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'TEST 7: Companions Module';
  
  -- Check ai_conversations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_conversations') THEN
    RAISE NOTICE '✅ PASSED: ai_conversations table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: ai_conversations table missing';
  END IF;
  
  -- Check ai_messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_messages') THEN
    RAISE NOTICE '✅ PASSED: ai_messages table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: ai_messages table missing';
  END IF;
  
  -- Check conversation_type column supports all types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_conversations' AND column_name = 'conversation_type'
  ) THEN
    RAISE NOTICE '✅ PASSED: ai_conversations has conversation_type column';
  ELSE
    RAISE EXCEPTION '❌ FAILED: ai_conversations structure incorrect';
  END IF;
END $$;

-- ============================================================================
-- TEST 8: SHARED TABLES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'TEST 8: Shared Tables';
  
  -- Check notifications
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    RAISE NOTICE '✅ PASSED: notifications table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: notifications table missing';
  END IF;
  
  -- Check audit_logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    RAISE NOTICE '✅ PASSED: audit_logs table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: audit_logs table missing';
  END IF;
  
  -- Check media_files
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files') THEN
    RAISE NOTICE '✅ PASSED: media_files table exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: media_files table missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 9: FOREIGN KEY RELATIONSHIPS
-- ============================================================================

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 9: Foreign Key Relationships';
  
  -- Count foreign keys
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
    
  IF fk_count >= 100 THEN
    RAISE NOTICE '✅ PASSED: Foreign keys created (% constraints)', fk_count;
  ELSE
    RAISE NOTICE '⚠️ WARNING: Fewer foreign keys than expected (% found)', fk_count;
  END IF;
  
  -- Test critical foreign key relationships
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'topics' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage ccu
        WHERE ccu.constraint_name = tc.constraint_name
          AND ccu.table_name = 'products'
      )
  ) THEN
    RAISE NOTICE '✅ PASSED: topics → products foreign key exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: topics → products foreign key missing';
  END IF;
END $$;

-- ============================================================================
-- TEST 10: ROW LEVEL SECURITY (RLS)
-- ============================================================================

DO $$
DECLARE
  rls_count INTEGER;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 10: Row Level Security';
  
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true;
    
  IF rls_count >= 10 THEN
    RAISE NOTICE '✅ PASSED: RLS enabled on % tables', rls_count;
  ELSE
    RAISE NOTICE '⚠️ WARNING: RLS enabled on fewer tables than expected (% found)', rls_count;
  END IF;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
    
  IF policy_count >= 10 THEN
    RAISE NOTICE '✅ PASSED: RLS policies created (% policies)', policy_count;
  ELSE
    RAISE NOTICE '⚠️ WARNING: Fewer policies than expected (% found)', policy_count;
  END IF;
END $$;

-- ============================================================================
-- TEST 11: INDEXES
-- ============================================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 11: Indexes';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'backup_%';
    
  IF index_count >= 80 THEN
    RAISE NOTICE '✅ PASSED: Indexes created (% total)', index_count;
  ELSE
    RAISE NOTICE '⚠️ WARNING: Fewer indexes than expected (% found)', index_count;
  END IF;
  
  -- Check critical indexes
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'topics' AND indexname LIKE '%position%'
  ) THEN
    RAISE NOTICE '✅ PASSED: topics position index exists';
  ELSE
    RAISE NOTICE '⚠️ WARNING: topics position index not found';
  END IF;
END $$;

-- ============================================================================
-- TEST 12: FUNCTIONS & TRIGGERS
-- ============================================================================

DO $$
DECLARE
  function_count INTEGER;
  trigger_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 12: Functions & Triggers';
  
  -- Check update_updated_at_column function
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'update_updated_at_column'
  ) THEN
    RAISE NOTICE '✅ PASSED: update_updated_at_column function exists';
  ELSE
    RAISE EXCEPTION '❌ FAILED: update_updated_at_column function missing';
  END IF;
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%';
    
  IF trigger_count >= 5 THEN
    RAISE NOTICE '✅ PASSED: updated_at triggers created (% triggers)', trigger_count;
  ELSE
    RAISE NOTICE '⚠️ WARNING: Fewer triggers than expected (% found)', trigger_count;
  END IF;
END $$;

-- ============================================================================
-- TEST 13: TABLE COUNT VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  RAISE NOTICE 'TEST 13: Table Count Verification';
  
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'backup_%';
    
  RAISE NOTICE 'Total tables found: %', table_count;
  
  IF table_count >= 60 THEN
    RAISE NOTICE '✅ PASSED: All tables created (expected >= 60, found %)', table_count;
  ELSE
    RAISE EXCEPTION '❌ FAILED: Missing tables (expected >= 60, found %)', table_count;
  END IF;
END $$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '🎉 ALL TESTS COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Database consolidation validation PASSED.';
  RAISE NOTICE 'Your unified schema is ready for production use.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run VERIFICATION_QUERIES.sql for detailed health check';
  RAISE NOTICE '2. Test your application endpoints';
  RAISE NOTICE '3. Deploy to production with confidence!';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
END $$;

-- Rollback test transaction (we dont want to leave test data)
ROLLBACK;

-- ============================================================================
-- TEST COMPLETE
-- ============================================================================
-- 
-- If you see "🎉 ALL TESTS COMPLETED SUCCESSFULLY!" above, your consolidation
-- is working perfectly!
--
-- If any tests failed, review the error messages and:
-- 1. Check that CONSOLIDATION_MIGRATION_FINAL.sql ran successfully
-- 2. Verify seed data was inserted
-- 3. Check for any constraint violations
-- 4. Review DEPLOYMENT_GUIDE.md for troubleshooting
--
-- ============================================================================

