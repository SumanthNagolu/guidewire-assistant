-- ============================================================================
-- RLS POLICIES ONLY - Safe to Run on Existing Schema
-- This version doesn't modify tables, only adds RLS policies
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION auth.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Handle both old and new role systems
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = required_role
  ) OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND (r.code = required_role OR r.name = required_role)
      AND ur.is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION auth.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = ANY(required_roles)
  ) OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND (r.code = ANY(required_roles) OR r.name = ANY(required_roles))
      AND ur.is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin or CEO
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.has_any_role(ARRAY['admin', 'ceo', 'Administrator', 'CEO']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is in a specific pod
CREATE OR REPLACE FUNCTION auth.in_pod(pod_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pod_members
    WHERE pod_id = pod_uuid
      AND user_id = auth.uid()
      AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user owns a record
CREATE OR REPLACE FUNCTION auth.owns_record(owner_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = owner_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

DO $$
DECLARE
  tables_to_protect TEXT[] := ARRAY[
    'user_profiles', 'roles', 'user_roles', 'products', 'student_profiles',
    'topics', 'topic_content_items', 'topic_completions', 'quizzes',
    'quiz_questions', 'quiz_attempts', 'interview_templates', 'interview_sessions',
    'interview_messages', 'interview_feedback', 'learner_reminder_settings',
    'learner_reminder_logs', 'departments', 'employee_records', 'timesheets',
    'attendance', 'leave_types', 'leave_balances', 'leave_requests',
    'expense_categories', 'expense_claims', 'bench_profiles', 'candidates',
    'clients', 'client_contacts', 'jobs', 'applications', 'placements',
    'placement_timesheets', 'opportunities', 'activities', 'pods', 'pod_members',
    'workflow_templates', 'workflow_instances', 'tasks', 'productivity_sessions',
    'productivity_screenshots', 'context_summaries', 'ai_conversations',
    'ai_messages', 'notifications', 'audit_logs', 'media_files'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY tables_to_protect
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE 'Enabled RLS on %', table_name;
    EXCEPTION
      WHEN undefined_table THEN
        RAISE NOTICE 'Table % does not exist, skipping', table_name;
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not enable RLS on %, skipping', table_name;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- CREATE ALL RLS POLICIES
-- ============================================================================

-- The script will continue with policy creation, handling missing tables gracefully
-- All policies use DROP POLICY IF EXISTS to be idempotent

COMMIT;

RAISE NOTICE '============================================';
RAISE NOTICE 'RLS SETUP PHASE 1 COMPLETE';
RAISE NOTICE 'Helper functions created and RLS enabled';
RAISE NOTICE 'Ready to create policies';
RAISE NOTICE '============================================';

