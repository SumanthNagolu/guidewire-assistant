# 🎯 DATABASE CONSOLIDATION PLAN
## Request ID: ede3d9ae-8baa-4807-866a-0b814563bd90

---

## 📊 CURRENT STATE ANALYSIS

### Existing Schema Files (Fragmented):
1. **Academy LMS** - `supabase/migrations/_old/20250113_academy_lms_schema.sql`
2. **HR Module** - `supabase/migrations/20251114000001-20251114000006_*.sql` (6 files)
3. **CRM/ATS Module** - `supabase/migrations/crm-ats/*.sql` (13 files)
4. **Productivity** - `supabase/migrations/_old/20250111_productivity_schema.sql`
5. **Guidewire Guru** - `supabase/migrations/_old/20250110_guidewire_guru_schema.sql`
6. **CMS** - `supabase/migrations/_old/20250113_cms_schema.sql`
7. **Trikala Workflow** - `supabase/migrations/_old/20250113_trikala_workflow_schema.sql`

### Unified Schema (Target):
- **MASTER_SCHEMA_V2.sql** - Consolidated single-source-of-truth (1536 lines)
- Already created in `database/MASTER_SCHEMA_V2.sql`
- Already exists in `supabase/migrations/20251113053344_master_schema_v2.sql`

---

## 🎯 CONSOLIDATION STRATEGY

The Master Schema V2 has already been created and includes all 9 sections:

1. ✅ **Core User System** - Universal user profiles, roles, RBAC
2. ✅ **Academy Module** - Training/LMS with topics, quizzes, progress tracking
3. ✅ **HR Module** - Employee management, attendance, leave, payroll
4. ✅ **CRM Module** - ATS/Recruiting with candidates, jobs, placements
5. ✅ **Platform Module** - Workflow engine, pods, task management
6. ✅ **Productivity Module** - Screenshot tracking, AI analysis, context summaries
7. ✅ **Companions Module** - AI conversations (Mentor, Guru, Interview)
8. ✅ **Self-Learning Module** - ML predictions, optimization suggestions
9. ✅ **Shared Tables** - Notifications, audit logs, media files

---

## 🔍 WHAT NEEDS TO BE DONE

### Current Situation:
The Master Schema V2 migration file exists but may not have been fully applied to your Supabase database. We need to:

1. **Check what's currently in production**
2. **Create an idempotent consolidation migration** (safe to run multiple times)
3. **Migrate existing data** without losing anything
4. **Add any missing tables/columns**
5. **Update RLS policies**
6. **Verify everything works**

### Key Conflicts to Resolve:

#### 1. **User Profile Consolidation**
- Old: Multiple tables (`student_profiles`, `employees`, `candidates`)
- New: Single `user_profiles` with role-based extensions

#### 2. **Role System Upgrade**
- Old: Simple `role` VARCHAR field
- New: Proper RBAC with `roles` and `user_roles` tables

#### 3. **Table Renames**
- Old: `employees` table
- New: `employee_records` table (to avoid confusion with employee users)

#### 4. **Missing Extensions**
- Need: `user_profiles` extended with HR/CRM fields
- Need: Productivity tables integrated
- Need: Workflow engine tables

---

## 📋 CONSOLIDATION STEPS

### Step 1: Data Backup (Safety First)
```sql
-- Create backup of critical tables before consolidation
CREATE TABLE IF NOT EXISTS backup_user_profiles_20251113 AS SELECT * FROM user_profiles;
CREATE TABLE IF NOT EXISTS backup_topics_20251113 AS SELECT * FROM topics WHERE EXISTS (SELECT 1 FROM topics LIMIT 1);
CREATE TABLE IF NOT EXISTS backup_topic_completions_20251113 AS SELECT * FROM topic_completions WHERE EXISTS (SELECT 1 FROM topic_completions LIMIT 1);
```

### Step 2: Run Master Schema V2
- The migration is already created at `supabase/migrations/20251113053344_master_schema_v2.sql`
- It uses `CREATE TABLE IF NOT EXISTS` so it's safe to run
- It will add missing tables and columns

### Step 3: Data Migration
- Migrate data from old structures to new unified structure
- Preserve all existing relationships
- Update foreign keys

### Step 4: Verification
- Ensure all data is intact
- Test each module independently
- Verify RLS policies work correctly

### Step 5: Cleanup
- Archive old migration files
- Remove backup tables after verification
- Update application code if needed

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss | Critical | Full backup before migration |
| Downtime | High | Run during low-traffic period |
| Foreign key conflicts | Medium | Disable temporarily, re-enable after |
| RLS policy errors | Medium | Test with different user roles |
| Application breakage | High | Test APIs after migration |

---

## ✅ SUCCESS CRITERIA

- [ ] All 9 schema sections deployed
- [ ] No data loss (verify row counts)
- [ ] All foreign keys intact
- [ ] RLS policies working
- [ ] All API endpoints functioning
- [ ] Each user role can access appropriate data
- [ ] No duplicate tables
- [ ] Helper functions operational
- [ ] Triggers active

---

## 🚀 NEXT STEPS

1. I'll create a **safe, idempotent consolidation migration**
2. Create a **rollback script** (just in case)
3. Create **verification queries** to check success
4. Provide **step-by-step deployment instructions**

---

**Status:** Ready to create consolidation migration script
**Estimated Time:** 30 minutes to prepare, 5-10 minutes to execute
**Risk Level:** Low (with proper backups and rollback plan)

