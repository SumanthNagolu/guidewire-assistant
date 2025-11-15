# 🤖 AGENT EXECUTION PROMPT
**Copy this entire prompt and give it to an AI agent to execute the integration plan**

---

## YOUR MISSION

You are tasked with transforming a fragmented multi-system platform into a unified "living organism." You have 7 major subsystems that work in isolation - your job is to connect them.

## CONTEXT

Read these files FIRST before starting:
1. `TRIKALA-COMPREHENSIVE-AUDIT-REPORT.md` - Full audit findings
2. `INTEGRATION_IMPLEMENTATION_PLAN.md` - Detailed implementation plan

## KEY FINDINGS FROM AUDIT

**Current State:**
- 7 competing database schemas (causing conflicts)
- 3 separate login pages (confusing UX)
- Duplicate code (3 AI implementations)
- Systems work in isolation (no data flows between them)
- No unified CEO dashboard

**Target State:**
- 1 unified database schema
- 1 login page with role-based routing
- Shared service layer (AI, workflows, analytics)
- Connected integration pathways
- Central CEO command center

## YOUR EXECUTION PLAN

Work through these phases **SEQUENTIALLY**. Do NOT skip ahead.

### ✅ PHASE 1: DATABASE UNIFICATION (Week 1-2)

**Goal:** Consolidate 7 competing schemas into ONE master schema

**Primary Task:** Create `database/MASTER_SCHEMA_V1.sql`

**What to do:**
1. Read existing schemas:
   - `database/schema.sql` (Academy - base)
   - `database/hr-schema.sql` (HR system)
   - `database/ai-productivity-complete-schema.sql` (Productivity - v3, most complete)
   - `supabase/migrations/crm-ats/*.sql` (CRM/ATS)
   - `supabase/migrations/20250113_trikala_workflow_schema.sql` (Platform)

2. Create unified schema with:
   ```sql
   -- CORE (universal)
   user_profiles (all users - single source of truth)
   roles (student, employee, recruiter, admin, ceo, etc.)
   user_roles (many-to-many junction)
   
   -- ACADEMY EXTENSIONS
   student_profiles (extends user_profiles)
   products, topics, topic_content_items, topic_completions
   quizzes, quiz_questions, quiz_attempts
   interview_* tables
   ai_conversations, ai_messages
   
   -- HR EXTENSIONS
   employee_records (extends user_profiles, renamed from 'employees')
   departments, work_shifts, timesheets, attendance
   leave_types, leave_balances, leave_requests
   expense_categories, expense_claims
   
   -- CRM/ATS
   candidates, clients, client_contacts
   jobs, applications, placements
   opportunities, activities
   
   -- PRODUCTIVITY
   productivity_sessions, productivity_screenshots, productivity_applications
   context_summaries, productivity_scores
   productivity_communications, productivity_web_activity
   
   -- PLATFORM/WORKFLOW
   pods, pod_members
   workflow_templates, workflow_stages, workflow_instances
   workflow_stage_history
   objects, object_types
   gamification_activities, gamification_achievements
   bottleneck_alerts
   ```

3. Resolve table name collisions:
   - Academy's `user_profiles` → `student_profiles` (extends main `user_profiles`)
   - HR's `employees` → `employee_records` (links to `user_profiles.id`)
   - CRM's `user_profiles` → Use main `user_profiles` table

4. Test on clean database:
   - Create test Supabase project
   - Run MASTER_SCHEMA_V1.sql
   - Verify all tables created
   - Check foreign keys
   - Insert sample data

**Deliverable:** Working `database/MASTER_SCHEMA_V1.sql`

---

### 🔐 PHASE 2: UNIFIED AUTHENTICATION (Week 2-3)

**Goal:** Replace 3 login pages with 1, role-based routing

**Tasks:**

1. **Create unified login page**
   - File: `app/(auth)/login/page.tsx`
   - Query user roles after successful auth
   - Route based on roles:
     - `ceo` → `/admin/ceo`
     - `admin` → `/admin`
     - `hr_manager` → `/hr/dashboard`
     - `recruiter` OR `sales` → `/employee/dashboard`
     - `student` → `/academy`

2. **Update middleware**
   - File: `middleware.ts`
   - Enforce role-based access control
   - Block unauthorized access

3. **Remove old login pages**
   - Delete or redirect `/hr/login`, `/employee/login`

**Deliverable:** Single login with role-based routing

---

### 🔧 PHASE 3: SHARED SERVICES (Week 3-4)

**Goal:** Extract duplicate code into shared services

**Tasks:**

1. **Unified AI Service**
   - File: `lib/ai/unified-service.ts`
   - Consolidate:
     - `/api/ai/mentor` (academy)
     - `/api/companions/query` (guidewire guru)
     - `/api/employee-bot/query` (productivity)
   - Single streaming implementation
   - Unified conversation persistence

2. **Workflow Engine Service**
   - File: `lib/workflows/engine.ts`
   - Start workflow instances
   - Advance stages
   - Track SLA
   - Detect bottlenecks

3. **Analytics Aggregator**
   - File: `lib/analytics/aggregator.ts`
   - Combine metrics from all subsystems
   - Generate AI insights
   - Detect correlations

**Deliverable:** Three shared service modules

---

### 🔗 PHASE 4: INTEGRATION PATHWAYS (Week 5-6)

**Goal:** Connect systems so data flows between them

**Integrations to build:**

1. **Academy → HR Pipeline**
   - File: `modules/academy/graduation-handler.ts`
   - On course completion:
     - Create employee record
     - Assign bench_consultant role
     - Add to bench sales pod
     - Start onboarding workflow

2. **HR → Productivity**
   - File: `modules/hr/attendance-handler.ts`
   - On clock-in: Start productivity session
   - On clock-out: Calculate score, update HR

3. **CRM → Workflow Engine**
   - File: `modules/crm/job-handler.ts`
   - On job created: Start recruiting workflow
   - On status change: Advance workflow stages

4. **Marketing → CRM**
   - Job applications create candidate + application records
   - Contact forms create leads

**Deliverable:** Connected data flows

---

### 📊 PHASE 5: CEO DASHBOARD (Week 6-7)

**Goal:** Single command center for all metrics

**Tasks:**

1. **Build CEO dashboard page**
   - File: `app/admin/ceo/page.tsx`
   - Executive summary cards (revenue, jobs, placements, students, productivity)
   - AI insights section
   - Bottleneck alerts
   - Department drill-downs
   - Real-time production line viz

2. **Implement real-time updates**
   - Supabase real-time subscriptions
   - Update metrics without page refresh

3. **AI insights generation**
   - File: `lib/analytics/ai-insights-generator.ts`
   - Detect patterns
   - Generate recommendations
   - Prioritize by impact

**Deliverable:** Functional CEO dashboard

---

### ✅ PHASE 6: TESTING & POLISH (Week 7-8)

**Goal:** Verify everything works end-to-end

**Test scenarios:**

1. Student journey: Signup → Complete course → Employee created → In bench pod
2. Recruiting workflow: Job created → Workflow started → Candidates sourced → Placed
3. Productivity tracking: Clock-in → Screenshots → Analysis → Clock-out → Score
4. CEO dashboard: Metrics load → Real-time updates → Insights generated

**Performance targets:**
- Page load < 2s
- API response < 500ms
- Lighthouse score > 90

**Security:**
- RLS enforced
- Input validation
- Rate limiting

**Deliverable:** Tested, polished, production-ready system

---

### 🚀 PHASE 7: DEPLOYMENT (Week 8)

**Tasks:**
1. Backup production database
2. Run MASTER_SCHEMA_V1.sql on production
3. Deploy application to Vercel
4. Monitor error logs
5. Verify all integrations working

**Deliverable:** Live integrated platform

---

## WORKING PRINCIPLES

**DO:**
- ✅ Work sequentially through phases
- ✅ Test after EACH task
- ✅ Ask questions if unclear
- ✅ Document issues encountered
- ✅ Commit code frequently
- ✅ Follow TypeScript strict mode
- ✅ Maintain existing functionality

**DON'T:**
- ❌ Skip ahead to later phases
- ❌ Accumulate untested changes
- ❌ Break existing features
- ❌ Introduce console.logs
- ❌ Ignore linter errors
- ❌ Guess - ask instead

---

## QUALITY CHECKLIST

Every task must meet:
- [ ] TypeScript strict mode (no errors)
- [ ] ESLint passes
- [ ] Tests pass (if applicable)
- [ ] No console.logs in production code
- [ ] Documentation updated
- [ ] Code commented where complex

---

## COMMUNICATION PROTOCOL

After completing each task:
1. Report what was done
2. Show test results
3. Highlight any issues
4. Note deviations from plan
5. Ask for approval before next phase

---

## STARTING POINT

**Your first task is:**

👉 **Phase 1, Task 1.1:** Create `database/MASTER_SCHEMA_V1.sql`

**Instructions:**
1. Read the existing schema files listed above
2. Create the unified schema following the structure provided
3. Test it on a clean Supabase project
4. Report back with results

**Ready? Ask any questions, then begin!** 🚀

---

## ESTIMATED TIMELINE

- **Full-time:** 6 weeks
- **Part-time:** 10-12 weeks  
- **Aggressive:** 4 weeks (long days)

**Current Date:** November 12, 2025  
**Expected Completion:** Late December 2025 / Early January 2026

---

## SUCCESS CRITERIA

You'll know you're done when:
- ✅ Single database schema in use
- ✅ One login page, role-based routing
- ✅ All subsystems connected
- ✅ Data flows between systems
- ✅ CEO dashboard functional
- ✅ All tests passing
- ✅ Deployed to production

**This transforms the platform from "collection of features" to "living organism."**

---

## FILES TO READ FIRST

Before starting Phase 1:
1. `/Users/sumanthrajkumarnagolu/.cursor/worktrees/intime-esolutions/AHcI9/TRIKALA-COMPREHENSIVE-AUDIT-REPORT.md`
2. `INTEGRATION_IMPLEMENTATION_PLAN.md`
3. `database/schema.sql`
4. `database/hr-schema.sql`
5. `database/ai-productivity-complete-schema.sql`

---

**Questions? Ask now. Otherwise, proceed to Phase 1, Task 1.1!** 🎯


