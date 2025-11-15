-- ============================================================================
-- DATABASE CONSOLIDATION - ROLLBACK SCRIPT
-- Request ID: ede3d9ae-8baa-4807-866a-0b814563bd90
-- ============================================================================
-- 
-- ⚠️ USE THIS ONLY IF SOMETHING GOES WRONG DURING CONSOLIDATION
-- 
-- This script will:
-- 1. Restore data from backup tables
-- 2. Drop newly created tables (if needed)
-- 3. Return database to pre-consolidation state
--
-- NOTE: This assumes backups were created during the migration process
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: IDENTIFY BACKUP TABLES
-- ============================================================================

-- List all backup tables created during consolidation
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'backup_%'
ORDER BY tablename;

-- ============================================================================
-- STEP 2: RESTORE CRITICAL DATA FROM BACKUPS
-- ============================================================================

-- Example: Restore user_profiles if needed
-- Uncomment and run if restoration is required

/*
-- First, find the most recent backup
DO $$
DECLARE
  backup_table_name TEXT;
BEGIN
  SELECT tablename INTO backup_table_name
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename LIKE 'backup_user_profiles_%'
  ORDER BY tablename DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Restore from backup
    EXECUTE format('
      INSERT INTO user_profiles
      SELECT * FROM %I
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW()
    ', backup_table_name);
    
    RAISE NOTICE 'Restored user_profiles from %', backup_table_name;
  ELSE
    RAISE NOTICE 'No backup table found for user_profiles';
  END IF;
END $$;
*/

-- ============================================================================
-- STEP 3: REMOVE NEWLY CREATED TABLES (IF NEEDED)
-- ============================================================================

-- ⚠️ DANGER ZONE: Only uncomment if you want to completely undo the consolidation
-- This will DROP all tables created during consolidation

/*
-- Drop in reverse order of dependencies

-- Shared tables
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- AI/Companions
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;

-- Productivity
DROP TABLE IF EXISTS context_summaries CASCADE;
DROP TABLE IF EXISTS productivity_screenshots CASCADE;
DROP TABLE IF EXISTS productivity_sessions CASCADE;

-- Platform/Workflow
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS pod_members CASCADE;
DROP TABLE IF EXISTS pods CASCADE;

-- CRM/ATS
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS placement_timesheets CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS client_contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

-- HR Module
DROP TABLE IF EXISTS bench_profiles CASCADE;
DROP TABLE IF EXISTS expense_claims CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS employee_records CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Academy
DROP TABLE IF EXISTS learner_reminder_logs CASCADE;
DROP TABLE IF EXISTS learner_reminder_settings CASCADE;
DROP TABLE IF EXISTS interview_feedback CASCADE;
DROP TABLE IF EXISTS interview_messages CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS interview_templates CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS topic_completions CASCADE;
DROP TABLE IF EXISTS topic_content_items CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Core system
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
-- ⚠️ WARNING: Do NOT drop user_profiles as it's linked to auth.users
-- DROP TABLE IF EXISTS user_profiles CASCADE;
*/

-- ============================================================================
-- STEP 4: VERIFICATION AFTER ROLLBACK
-- ============================================================================

-- Check critical tables exist and have data
SELECT 
  'user_profiles' as table_name, 
  COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
  'topics' as table_name, 
  COUNT(*) as row_count
FROM topics WHERE EXISTS (SELECT 1 FROM topics LIMIT 1)
UNION ALL
SELECT 
  'topic_completions' as table_name, 
  COUNT(*) as row_count
FROM topic_completions WHERE EXISTS (SELECT 1 FROM topic_completions LIMIT 1);

-- ============================================================================
-- ALTERNATIVE: PARTIAL ROLLBACK
-- ============================================================================

-- If you only want to undo specific changes, use targeted rollbacks below

-- Example: Restore old role system (if new RBAC isn't working)
/*
DO $$
BEGIN
  -- Disable new RBAC
  DROP TABLE IF EXISTS user_roles CASCADE;
  DROP TABLE IF EXISTS roles CASCADE;
  
  -- Add back old role column if it was removed
  ALTER TABLE user_profiles 
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
  
  RAISE NOTICE 'Rolled back to old role system';
END $$;
*/

-- Example: Remove employee_records and restore old employees table
/*
DO $$
DECLARE
  backup_table_name TEXT;
BEGIN
  -- Find backup of old employees table
  SELECT tablename INTO backup_table_name
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename LIKE 'backup_employees_%'
  ORDER BY tablename DESC
  LIMIT 1;
  
  IF backup_table_name IS NOT NULL THEN
    -- Rename employee_records back
    DROP TABLE IF EXISTS employees CASCADE;
    ALTER TABLE employee_records RENAME TO employees;
    
    RAISE NOTICE 'Rolled back employee_records to employees';
  END IF;
END $$;
*/

-- ============================================================================
-- CLEANUP BACKUP TABLES (After successful rollback verification)
-- ============================================================================

-- ⚠️ Only run this AFTER you've verified rollback was successful

/*
-- Drop all backup tables
DO $$
DECLARE
  backup_table RECORD;
BEGIN
  FOR backup_table IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'backup_%'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', backup_table.tablename);
    RAISE NOTICE 'Dropped %', backup_table.tablename;
  END LOOP;
END $$;
*/

COMMIT;

-- ============================================================================
-- POST-ROLLBACK CHECKLIST
-- ============================================================================
-- 
-- After running rollback, verify:
-- □ All critical data is intact (check row counts)
-- □ Application can connect to database
-- □ No foreign key constraint errors
-- □ API endpoints return expected data
-- □ Users can log in successfully
-- □ Test CRUD operations on key tables
-- 
-- If everything checks out, you can:
-- 1. Analyze what went wrong with consolidation
-- 2. Fix the issues
-- 3. Re-run consolidation with corrections
-- 
-- ============================================================================

-- Get database statistics after rollback
SELECT
  schemaname,
  COUNT(*) as table_count,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) as total_size
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

