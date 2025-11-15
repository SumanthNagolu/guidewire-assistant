-- ============================================================================
-- MIGRATION ROLLBACK SCRIPT
-- Use ONLY if migration fails and you need to restore previous state
-- ============================================================================

-- WARNING: This will DROP tables created by MASTER_SCHEMA_V2.sql
-- Only run this if you have a verified backup!

BEGIN;

-- Drop self-learning tables
DROP TABLE IF EXISTS learning_loop_metrics CASCADE;
DROP TABLE IF EXISTS optimization_suggestions CASCADE;
DROP TABLE IF EXISTS ml_predictions CASCADE;
DROP TABLE IF EXISTS system_feedback CASCADE;

-- Drop shared/integration tables
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop productivity tables
DROP TABLE IF EXISTS context_summaries CASCADE;
DROP TABLE IF EXISTS productivity_scores CASCADE;
DROP TABLE IF EXISTS productivity_applications CASCADE;
DROP TABLE IF EXISTS productivity_screenshots CASCADE;
DROP TABLE IF EXISTS productivity_sessions CASCADE;

-- Drop platform/workflow tables
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS bottleneck_alerts CASCADE;
DROP TABLE IF EXISTS workflow_stage_history CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS pod_members CASCADE;
DROP TABLE IF EXISTS pods CASCADE;

-- Drop CRM tables
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS placement_timesheets CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS client_contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

-- Drop HR tables
DROP TABLE IF EXISTS bench_profiles CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS performance_history CASCADE;
DROP TABLE IF EXISTS expense_claims CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS work_shifts CASCADE;
DROP TABLE IF EXISTS employee_records CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Drop academy tables
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

-- Drop AI/companions tables
DROP TABLE IF EXISTS ai_usage_tracking CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;

-- Drop core user system
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
-- Note: Keep user_profiles if it existed before migration

COMMIT;

-- ============================================================================
-- RESTORE FROM BACKUP
-- ============================================================================

-- After running this rollback:
-- 1. Restore from backup using: npm run db:restore <backup-file>
-- 2. Verify data: npm run db:verify
-- 3. Re-apply original schemas if needed

