# 🗄️ InTime Command Center - Database Migrations

Complete database schema for the InTime CRM/ATS platform.

---

## **Migration Files**

### **Foundation (001-003)**
- **001_user_profiles.sql** - User management with role-based access
  - 7 roles: admin, recruiter, sales, account_manager, operations, employee, student
  - Auto-create profile on signup
  - Manager hierarchy support

- **002_candidates.sql** - Candidate tracking system
  - Full ATS candidate database
  - Skills array, certifications, education (JSONB)
  - Resume parsing support (JSONB storage)
  - Full-text search on name, title, skills
  - Work authorization tracking

- **003_clients.sql** - Client & contact management
  - Client database with health scores
  - Tiering system (tier_1, tier_2, tier_3)
  - Multiple contacts per client
  - Decision maker tracking

### **Core ATS (004)**
- **004_jobs_applications.sql** - Jobs, applications, and interviews
  - Job requisitions with status tracking
  - 14-stage application pipeline
  - Interview scheduling & feedback
  - Auto-update stage timestamps

### **Operations (005-006)**
- **005_placements_timesheets.sql** - Placement tracking
  - Active placement management
  - Margin calculation (bill rate - pay rate)
  - Auto-update status (ending_soon, completed)
  - Weekly timesheet submission
  - Approval workflow

- **006_opportunities.sql** - CRM deals & contracts
  - Sales pipeline (lead → closed_won)
  - Weighted value calculation
  - Auto-adjust probability by stage
  - Contract management (MSA, SOW, NDA, etc.)
  - Expiration alerts (30/60/90 days)

### **Activity & System (007-008)**
- **007_activities.sql** - Universal activity tracking
  - Polymorphic design (works with any entity)
  - 11 activity types (note, email, call, meeting, task, etc.)
  - Task management with due dates
  - Helper function to create activities

- **008_system_tables.sql** - Audit logs & notifications
  - Complete audit trail (all changes logged)
  - User notifications with read/unread status
  - Saved searches for advanced filtering
  - Generic audit trigger for all tables

### **Performance & Utilities (009-010)**
- **009_indexes_performance.sql** - Performance optimization
  - Composite indexes for common queries
  - GIN indexes for arrays & JSONB
  - Materialized view for dashboard metrics
  - Recruiter & sales pipeline views
  - Helper functions (match score, performance metrics)

- **010_helper_functions.sql** - Business logic
  - Auto-assign candidates to recruiters (round-robin)
  - Auto-assign leads to sales (round-robin)
  - Duplicate candidate detection
  - Contract expiration alerts
  - Timesheet reminders
  - Skill gap analysis
  - Bulk operations

### **Seed Data (011)**
- **011_seed_data.sql** - Test data
  - 20 realistic candidates (Guidewire, Full Stack, DevOps, etc.)
  - 10 clients (insurance companies, tech firms)
  - 5 jobs (hot positions)
  - Contacts for major clients

---

## **How to Run Migrations**

### **Option 1: Supabase CLI (Recommended)**

```bash
# Initialize Supabase (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Copy migrations to supabase/migrations
cp supabase/migrations/crm-ats/*.sql supabase/migrations/

# Run migrations
supabase db push

# Verify
supabase db diff
```

### **Option 2: Supabase Dashboard**

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Copy & paste each migration file **in order** (001 → 011)
5. Click **Run** for each file

### **Option 3: Direct PostgreSQL**

```bash
# Connect to your database
psql postgres://[user]:[password]@[host]:[port]/[database]

# Run each migration
\i supabase/migrations/crm-ats/001_user_profiles.sql
\i supabase/migrations/crm-ats/002_candidates.sql
# ... etc
```

---

## **Post-Migration Setup**

### **1. Create Test Users**

```typescript
// Via Supabase Auth in your app
await supabase.auth.signUp({
  email: 'admin@intimesolutions.com',
  password: 'secure_password',
  options: {
    data: {
      full_name: 'Admin User',
      role: 'admin'
    }
  }
});

await supabase.auth.signUp({
  email: 'recruiter1@intimesolutions.com',
  password: 'secure_password',
  options: {
    data: {
      full_name: 'Jane Recruiter',
      role: 'recruiter'
    }
  }
});

await supabase.auth.signUp({
  email: 'sales1@intimesolutions.com',
  password: 'secure_password',
  options: {
    data: {
      full_name: 'John Sales',
      role: 'sales'
    }
  }
});
```

### **2. Run Seed Data**

After creating users, run:

```sql
-- Run seed data
\i supabase/migrations/crm-ats/011_seed_data.sql
```

### **3. Generate TypeScript Types**

```bash
supabase gen types typescript --local > types/supabase.ts
```

---

## **Database Schema Overview**

```
┌─────────────────┐
│  user_profiles  │
└────────┬────────┘
         │
         ├───────> candidates
         │          ├─> applications ─> interviews
         │          └─> placements ─> timesheets
         │
         ├───────> jobs
         │          └─> applications
         │
         ├───────> clients
         │          ├─> contacts
         │          ├─> opportunities
         │          └─> contracts
         │
         └───────> activities (polymorphic)
```

---

## **Key Features**

### **Security**
✅ Row-Level Security (RLS) on all tables  
✅ Role-based permissions (7 roles)  
✅ Audit logs for all changes  
✅ Soft deletes (never lose data)  

### **Performance**
✅ 50+ optimized indexes  
✅ Full-text search (candidates, jobs)  
✅ Materialized views for dashboards  
✅ JSONB for flexible data  

### **Automation**
✅ Auto-assign candidates to recruiters  
✅ Auto-assign leads to sales  
✅ Contract expiration alerts  
✅ Timesheet reminders  
✅ Status updates (placement ending soon)  

### **Business Logic**
✅ 14-stage recruitment pipeline  
✅ Sales pipeline (lead → closed_won)  
✅ Margin calculation for placements  
✅ Weighted value for opportunities  
✅ Skill matching algorithm  

---

## **Testing Permissions**

```sql
-- Test as recruiter (should only see own candidates)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'recruiter-user-id';
SELECT * FROM candidates; -- Should only see candidates with owner_id = recruiter-user-id

-- Test as admin (should see everything)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'admin-user-id';
SELECT * FROM candidates; -- Should see ALL candidates
```

---

## **Scheduled Jobs (Optional)**

If your Supabase plan includes pg_cron:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily contract expiration alerts (9 AM)
SELECT cron.schedule(
  'send-contract-alerts',
  '0 9 * * *',
  'SELECT send_contract_expiration_alerts()'
);

-- Weekly timesheet reminders (Friday 4 PM)
SELECT cron.schedule(
  'send-timesheet-reminders',
  '0 16 * * 5',
  'SELECT send_timesheet_reminders()'
);

-- Hourly dashboard metrics refresh
SELECT cron.schedule(
  'refresh-dashboard',
  '0 * * * *',
  'SELECT refresh_dashboard_metrics()'
);
```

---

## **Rollback Plan**

If you need to undo migrations:

```sql
-- Drop all tables (CAUTION: Destroys all data)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics CASCADE;

-- Drop views
DROP VIEW IF EXISTS recruiter_pipeline CASCADE;
DROP VIEW IF EXISTS sales_pipeline CASCADE;
DROP VIEW IF EXISTS placement_metrics CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
-- ... (list all other functions)
```

---

## **Support**

For issues or questions:
- Check `DATABASE-SCHEMA.md` for entity details
- Check `RBAC-PERMISSIONS.md` for permission matrix
- Check `WEEK-1-PLAN.md` for workflow documentation

---

**Created:** November 2024  
**Version:** 1.0  
**Status:** Production-Ready ✅

