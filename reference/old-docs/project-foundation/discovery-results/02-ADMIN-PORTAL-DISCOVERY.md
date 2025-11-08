# 🎛️ ADMIN PORTAL DISCOVERY - Internal Operations Dashboard

**Category:** 2 of 8  
**Status:** In Progress  
**Started:** November 7, 2025

---

## 📋 DISCOVERY SECTIONS

### **Section 1: Portal Structure & Access**
### **Section 2: Dashboard & Analytics**
### **Section 3: Content Management**
### **Section 4: User Management**
### **Section 5: Operations Management**
### **Section 6: Reporting & Insights**
### **Section 7: Settings & Configuration**

---

# SECTION 1: PORTAL STRUCTURE & ACCESS (15 Questions)

## **1.1 Portal Architecture**

**Q1:** What is the primary purpose of the Admin Portal?

- [x] Multi-role portal (different dashboards for different roles)
- [x] Unified portal with role-based access control
- [x] Comprehensive - covers ALL business operations

**YOUR ANSWER:**

**"We have many roles."**

**Primary Purposes:**

**1. CEO Dashboard:**
- "To have an eye of everything and to do whatever I want to do"
- Full access to all departments
- Complete control and visibility

**2. Admin Role:**
- Full access (like CEO)
- Assignable to multiple people
- Trusted administrators

**3. Department-Specific Access:**
- **Recruiting Team:** Post jobs, manage applications, track candidates
- **Training Team:** Post training modules, manage assignments, handle resources
- **Bench Sales:** Update candidate talent pool, manage bench profiles
- **Talent Acquisition:** [Access TBD based on workflows]
- **HR:** [Access TBD]

**4. Academy Management:**
- Training material management
- Assignment handling
- Resources page updates
- AI assistant management (for students)

**5. Operations Monitoring:**
- Monitor entire application
- Cross-department visibility for authorized users
- Real-time operational oversight

**Scope:**
"Consider the entire scope of our organization for application and monitoring. Include everything in the portal architecture and also the purpose scope of it."

**Architecture Principle:**
One unified portal (`admin.intimeesolutions.com`) that serves all departments with role-based dashboards and access control.

---

**Q2:** Who needs access to the Admin Portal?

- [x] CEO/Founder (full access)
- [x] Admin role (assignable to multiple people, full access)
- [x] Department-specific roles
- [x] HR
- [x] All internal employees (with appropriate access levels)

**YOUR ANSWER:**

**"Definitely me, CEO, and also an admin. We can probably have a role called admin and assign it to multiple people with full access."**

**Access Levels:**

**Full Access:**
1. **CEO** (you)
2. **Admin** (role assignable to trusted individuals)

**Department Access:**
3. **Recruiting Team**
4. **Training Team**
5. **Bench Sales Team**
6. **Talent Acquisition Team**
7. **HR**

**"Maybe other different levels of access like recruiting, training and sales, talent acquisition, HR, blah blah blah as needed."**

**Expandable:**
- Finance/Accounting (as needed)
- Operations staff (as needed)
- Other roles (add as organization grows)

**Principle:**
Different access levels based on role and department, with CEO and Admin having unrestricted full access to everything.

---

**Q3:** Should each role have a completely different dashboard, or same dashboard with filtered data?

- [x] Completely different dashboards

**YOUR ANSWER:**

**"Completely your suggestion. In my head, I'm thinking different dashboard makes sense for different use case."**

**Rationale:**
"Because it's completely like different user flow, transaction flow, the purpose that the whole dashboard exists. So since the purpose itself is changing, I'm guessing it's better to change or use different dashboards."

**Implementation:**
- **CEO Dashboard:** Full visibility, all departments, high-level metrics + drill-down capability
- **Recruiting Dashboard:** Jobs, candidates, pipeline, placements
- **Training Dashboard:** Programs, students, progress, certifications
- **Bench Sales Dashboard:** Bench profiles, client matching, placements
- **HR Dashboard:** Employee management, leave, performance
- **Pod Member Dashboard:** Their own work, their tasks, their metrics

**Why Different Dashboards:**
- Different purposes → different layouts
- Different workflows → different actions/CTAs
- Different data priorities → different visualizations
- Optimized UX for each role's daily tasks

---

**Q4:** Portal location - subdomain or part of main site?

- [x] admin.intimeesolutions.com (dedicated admin subdomain)

**YOUR ANSWER:**

**"For portal, maybe admin.intimeesolutions or something like that would make sense."**

**Rationale:**
"Because the admin page is not specific to one particular subdomain and it's talking to all these subdomains. So maybe having itself as a subdomain make more sense."

**Architecture:**
- **Main site:** intimeesolutions.com
- **Jobs:** jobs.intimeesolutions.com
- **Academy:** academy.intimeesolutions.com
- **Resources:** resources.intimeesolutions.com
- **Admin Portal:** admin.intimeesolutions.com

**Why admin subdomain:**
- Cross-domain operations (manages all other subdomains)
- Clear separation (internal vs. public)
- Security isolation
- Independent deployment/scaling
- Professional URL structure

---

**Q5:** Authentication - how do internal team members log in?

- [x] Microsoft SSO (for internal employees)
- [x] Email + password (fallback option)
- [x] Multiple options for external users

**YOUR ANSWER:**

**"We use Microsoft, so probably we can give them email plus password, Microsoft, Gmail, blah, blah, blah, whatever. But employee, we can do the Microsoft."**

**Internal Employees:**
- **Primary:** Microsoft SSO (Office 365 integration)
- **Fallback:** Email + password (if SSO fails)
- **"Actually, I think internal is better for employee."**

**External Users** (if needed - clients, partners):
- Email + password
- Google OAuth
- Microsoft OAuth
- Magic link

**Implementation:**
- Supabase Auth with Microsoft OAuth provider
- Automatic role assignment based on email domain (@intimeesolutions.com)
- 2FA optional (can enable for sensitive roles like CEO, Admin)

---

## **1.2 Navigation & Layout**

**Q6:** Main navigation structure for Admin Portal?

- [x] AI Recommendation: Top bar + side nav combination
- [x] Aligned with overall application theme

**YOUR ANSWER:**

**"Top navigation bar with drop down, side navigation, collapsible top bar plus side. I'm open. Not getting a clear picture to imagine. So pick the best that aligns with the entire theme that we're going with elsewhere in our application and go the same route."**

**AI Recommendation:**

**Top Bar + Side Navigation Combination**

**Top Bar:**
- Logo/brand
- Quick actions (notifications, profile, logout)
- Search (global search across all entities)
- User info with role indicator

**Side Navigation:**
- Primary modules (Dashboard, Jobs, Candidates, etc.)
- Collapsible sections for sub-modules
- Icons + labels
- Can collapse to icons-only (more workspace)
- Active state highlighting

**Why This Approach:**
- Industry standard for admin portals (familiar UX)
- Efficient space usage
- Scalable (can add modules easily)
- Consistent with modern admin dashboards (Vercel, Stripe, Linear)
- Works well on desktop (primary use case)
- Matches "minimalist + professional + tech-forward" brand
- Similar to Guidewire Policy Center admin (familiar to you)

---

**Q7:** What are the main sections/modules in the Admin Portal?

- [x] ALL of the above + MORE
- [x] Comprehensive coverage of entire business operations

**YOUR ANSWER:**

**"Dashboard, jobs management, candidates, clients, training, students, team management, content, communication, report. I mean, pretty much all of this makes sense."**

**"Plug in everything and anything that's inside our scope and that might need some kind of a maintenance or admin work. Put that into the structure and also into the sections."**

**COMPLETE MODULE LIST:**

### **Core Business Operations:**

**1. Dashboard / Home**
- Overview metrics (all departments)
- Real-time activity feed
- KPI visualizations
- Quick actions
- Alerts/notifications

**2. Jobs Management**
- Post new jobs
- Edit/update job listings
- View applications
- Application tracking
- Job performance analytics
- Job board sync status

**3. Candidates**
- Candidate database
- Profile management
- Application tracking
- Resume management
- Candidate pipeline
- Interview scheduling
- Communication history

**4. Clients (Employers)**
- Client accounts
- Contracts/agreements
- Job postings by client
- Client communication
- Billing/invoicing

**5. Training Programs (Academy)**
- Program management
- Course creation/editing
- Training materials upload
- Assignment management
- Quiz/assessment management
- Certification management
- AI assistant configuration

**6. Students (Trainees)**
- Student profiles
- Enrollment tracking
- Progress monitoring
- Assignment submissions
- Quiz scores
- Certification status
- Placement tracking

**7. Bench Management**
- Talent pool (bench profiles)
- Availability status
- Skills matrix
- Client matching
- Bench-to-placement tracking

**8. Team Management**
- Employee profiles
- Pod structure management
- Role assignments
- Performance tracking
- Leave management (calendar integration)
- Backup user assignments

**9. Content Management**
- Website content (homepage, services, about)
- Blog posts
- Resources page
- Training materials
- Email templates

**10. Communications**
- Email campaigns
- In-app messages
- SMS/WhatsApp integration
- Notification center
- Communication templates
- Broadcast messages

**11. Reports & Analytics**
- Department-wise reports
- Performance metrics
- Financial reports
- Custom report builder
- Data visualization
- Export capabilities (for managers/admins)

**12. Settings & Configuration**
- User management (add/edit users)
- Role & permission management
- System settings
- Integration settings
- Email configuration
- Notification preferences

### **Additional Modules:**

**13. Finance / Billing**
- Client invoicing
- Payment tracking
- Employee compensation
- Revenue analytics

**14. Calendar / Scheduling**
- Interview scheduling
- Training session calendar
- Team availability
- Leave calendar
- Meeting scheduler

**15. Tasks / Workflow**
- Task assignment
- To-do lists (by user)
- Workflow automation rules
- Approval workflows

**16. HR Management**
- Employee onboarding
- Leave requests/approvals
- Performance reviews
- Backup user management
- Training/development plans

**17. Audit Logs**
- User activity logs
- System access logs
- Data change history
- Security events

**18. Integrations**
- External job boards (Indeed, LinkedIn, etc.)
- CRM integrations
- Email service providers
- Payment gateways
- Calendar integrations
- Communication platforms (WhatsApp, Telegram)

**19. AI Bot Management**
- Bot configuration
- Training data management
- Bot performance metrics
- User interaction logs

**Module Grouping in Navigation:**

```
├─ 📊 Dashboard
├─ 💼 Recruiting
│  ├─ Jobs
│  ├─ Candidates
│  └─ Clients
├─ 🎓 Academy
│  ├─ Programs
│  ├─ Students
│  ├─ Content
│  └─ AI Assistant
├─ 🤝 Bench Sales
│  ├─ Talent Pool
│  └─ Placements
├─ 👥 Team
│  ├─ Employees
│  ├─ Performance
│  └─ Leave Management
├─ 📝 Content
│  ├─ Website
│  ├─ Blog
│  └─ Resources
├─ 📧 Communications
│  ├─ Messages
│  ├─ Campaigns
│  └─ Templates
├─ 📈 Reports & Analytics
├─ 💰 Finance
├─ 📅 Calendar
├─ ✅ Tasks
├─ 🔌 Integrations
├─ 🤖 AI Bots
├─ 🔍 Audit Logs
└─ ⚙️ Settings
```

**Principle:** If it needs admin work or monitoring, it's in the portal.

---

**Q8:** Should pod members see data from other pods?

- [x] No - controlled visibility only
- [x] Cross-pod data only in reports (for strategic planning)

**YOUR ANSWER:**

**"No, I think it's better to have a control on who sees what."**

**Visibility Rules:**

**Pod Member (Individual Contributor):**
- ❌ Cannot see other pods' data
- ✅ Can see only their own work
- ✅ Can see their pod's aggregated metrics (for collaboration)

**Pod Lead/Manager:**
- ✅ Can see their entire pod's work
- ❌ Cannot see other pods' individual data
- ✅ Can see cross-pod summary metrics (in reports)

**Department Head:**
- ✅ Can see all pods in their department
- ❌ Cannot see other departments (unless granted)

**CEO/Admin:**
- ✅ Can see everything

**Exception - Strategic Reports:**
**"Maybe in some cases it might help as a dashboard, but I think we can handle that in reporting where you know bench team is anticipating how many training students are coming out onto our own bench."**

**Cross-Pod Visibility in Reports:**
- Bench Sales team can see: "X students graduating from training next month"
- Recruiting team can see: "Y candidates in bench available for placement"
- **BUT:** Aggregated data only, not individual records
- Purpose: Strategic planning, resource anticipation

**"But I think these things at this point of time can be handled in the reporting."**

**Implementation:**
- Row-level security (RLS) based on pod assignment
- Reports module has curated cross-pod views
- Audit log tracks any cross-pod data access

---

**Q9:** Real-time updates - do dashboards update live?

- [x] Yes, real-time (WebSockets/Supabase Realtime)

**YOUR ANSWER:**

**"Dashboards update live. I prefer live."**

**"Yes, going forward since we are in the tech industry, I see no reason or I don't expect any applications to be behind other than real time. So let's go with real time."**

**Implementation:**
- **Supabase Realtime** subscriptions for all dashboard data
- **Live updates** for:
  - New job applications
  - Candidate status changes
  - Team activity feed
  - Performance metrics
  - Notification alerts
  - User presence (who's online)
  - Report generation completion

**Real-Time Features:**
- New data appears without refresh
- Live counters (jobs posted today, applications received, etc.)
- Instant notifications
- Activity stream updates
- Collaborative editing indicators (if multiple users editing same record)

**Performance Optimization:**
- Debounce rapid updates (batch within 500ms)
- Lazy load large datasets
- Paginate real-time updates (show last 50, load more)
- Efficient queries (indexed, optimized)

**Philosophy:** "Tech industry standard - always real-time."

---

**Q10:** Mobile access - do team members need mobile app or mobile-responsive web?

- [x] Desktop primary (admin portal not needed on mobile)
- [x] 🚀 **INNOVATIVE IDEA:** AI Bot for employee logging (replaces traditional scrum)

**YOUR ANSWER:**

**"Team mates, it's not needed."**

**Admin Portal:**
- Desktop-focused (no mobile app needed)
- Can be responsive for occasional mobile access, but not priority

**HOWEVER - BRILLIANT SIDE IDEA:**

**🤖 AI-Powered Employee Activity Logging Bot**

**"One idea that I had around this, I was trying to think of ways to get rid of the traditional scrum and also still maintain the log, essentially a logbook of employee. And I've tried multiple ways where I've asked them to use monday.com or other ATS or CRM tools to enter in the data. I'll do a quick update what they did. Entire team is in loop and also like I can hold them for accountability. But none of them worked."**

**The Problem:**
- Traditional scrums: Time-consuming, not working
- Monday.com / CRM tools: Too manual, employees don't use consistently
- Need: Accountability + activity log + team visibility

**The Solution - AI Bot:**

**"So probably again, I don't see any reason for employee, but the only additional thought I had was to inside our own portal when we give a specific bot to the user every hour or every once every couple hours bot itself will question the employee to give them a voice voice input of what they have done for the last two hours."**

**How It Works:**

**1. Scheduled Bot Check-Ins:**
- Every 1-2 hours (configurable)
- Bot proactively asks employee: "What have you done in the last 2 hours?"
- Employee responds via **voice input** (not typing - less friction)

**2. Structured Template Training:**
"And maybe what can train the employee to give the updates in a specific template, maintaining the context."

- Bot trains employees to follow consistent format
- Example template:
  - "Worked on [Task/Project]"
  - "Completed [Specific actions]"
  - "Next steps: [What's coming]"
  - "Blockers: [Any issues]"

**3. Automated Processing:**
"And that as a project we can make use of and also the direct lead at you know, the very first step can make use it in the very textual format."

- Voice → Text transcription
- AI processes and structures the update
- Stored in project context
- Available in textual format for:
  - Direct lead/manager (immediate visibility)
  - Project timeline
  - Performance tracking
  - Team activity feed

**Benefits:**

**For Employees:**
- ✅ No meetings (no scrum calls)
- ✅ Voice input (fast, low friction)
- ✅ Works from anywhere (mobile, desktop)
- ✅ Natural conversation with bot
- ✅ Builds habit through consistent prompts

**For Managers:**
- ✅ Real-time visibility into team work
- ✅ Structured, searchable logs
- ✅ Accountability without micromanagement
- ✅ Can review anytime (no scheduling meetings)
- ✅ Aggregate team activity automatically

**For Company:**
- ✅ Replaces traditional scrum (saves time)
- ✅ Better accountability than manual tools
- ✅ Data for performance tracking
- ✅ Project context building
- ✅ Cross-team visibility (what's everyone working on)

**Implementation:**

**Technology:**
- WhatsApp bot or In-app bot (or both)
- Voice-to-text (Whisper API or similar)
- AI processing (GPT-4o-mini for structuring)
- Push notifications (scheduled reminders)
- Database storage (all updates logged)

**User Flow:**
1. 10 AM: Bot pings employee → "Hi! What did you work on since 8 AM?"
2. Employee voice-responds: "I called 5 clients for the Java developer role, got 2 interested, sent them JDs. Updated candidate pipeline."
3. Bot processes → Structures → Saves
4. Manager sees in dashboard: "John: 5 client calls, 2 leads, pipeline updated"
5. 12 PM: Bot pings again → repeat

**Configurable:**
- Frequency (hourly, every 2 hours, custom)
- Working hours (don't ping outside work time)
- Format (voice, text, or both)
- Visibility (who sees whose updates)

**Integration with Performance Tracking:**
- Activity logs feed into performance scores
- Managers can review before 1-on-1s
- Automated reports ("John logged 40 updates this week")
- Inactivity alerts ("Mary hasn't logged in 6 hours")

**THIS IS GOLD.** 🏆

**Replaces scrum, increases accountability, low friction, builds data for performance system.**

**Action Item:** Create dedicated discovery section for "AI Bot System" (Category 5 or include in Multi-Agent Discovery)

---

## **1.3 Permissions & Security**

**Q11:** Permission system - how granular?

- [x] Granular permissions (Guidewire-style architecture)
- [x] Users → Groups → Regions → Roles → Permissions

**YOUR ANSWER:**

**"Permissions and security have granular. Make it the best again. Simple rules might not work. We might need the granule permissions for sure."**

**Guidewire-Style Permission Architecture:**

**"Like to not give especially when it comes to ATS like the permissions has to be granular. Maybe again from Guidewire perspective we have users, we have team which is which is called groups. So we have group table, we have user table, and we have region table, we have role table, and role is essentially a type list or a combination of multiple permissions."**

**"Granular permissions which can be put into a role and that can be assigned to the user exactly like you're showing us or you know some combination of role specific permission. I think that level is needed."**

**Permission Architecture:**

```
Database Schema (Guidewire-inspired):

TABLE: users
- id, name, email, etc.

TABLE: groups (teams/pods)
- id, name, department, parent_group_id

TABLE: regions (if multi-location, otherwise optional)
- id, name, location

TABLE: roles
- id, name, description

TABLE: permissions (granular actions)
- id, name, resource, action
  Examples:
  - jobs:view, jobs:create, jobs:edit, jobs:delete
  - candidates:view, candidates:edit, candidates:delete
  - reports:view, reports:export
  - users:manage, roles:manage

TABLE: role_permissions (many-to-many)
- role_id, permission_id

TABLE: user_roles (user assignments)
- user_id, role_id, group_id, region_id

```

**Role Examples:**

**1. CEO Role:**
- ALL permissions (*)

**2. Admin Role:**
- ALL permissions (*)

**3. Recruiting Manager Role:**
- jobs:* (all job permissions)
- candidates:* (all candidate permissions)
- clients:view, clients:edit
- reports:view, reports:export
- users:view (team only)

**4. Recruiter Role:**
- jobs:view, jobs:create, jobs:edit
- candidates:view, candidates:create, candidates:edit
- candidates:communicate
- clients:view
- reports:view

**5. Training Manager Role:**
- programs:* (all program permissions)
- students:* (all student permissions)
- content:* (all content permissions)
- reports:view, reports:export

**6. Trainer Role:**
- programs:view
- students:view, students:edit
- content:view, content:edit
- assignments:manage
- reports:view

**7. Bench Sales Manager Role:**
- bench:* (all bench permissions)
- candidates:view, candidates:edit
- clients:view, clients:edit
- placements:*
- reports:view, reports:export

**8. Bench Sales Member Role:**
- bench:view, bench:edit
- candidates:view
- clients:view
- placements:view, placements:create

**9. HR Manager Role:**
- employees:*
- leave:*
- performance:*
- reports:view, reports:export

**Permission Granularity Examples:**

**Jobs Module:**
- jobs:view
- jobs:create
- jobs:edit
- jobs:delete
- jobs:publish
- jobs:archive
- jobs:view_salary (sensitive)

**Candidates Module:**
- candidates:view
- candidates:create
- candidates:edit
- candidates:delete
- candidates:view_contact (PII)
- candidates:communicate
- candidates:export

**Reports Module:**
- reports:view
- reports:create_custom
- reports:export
- reports:view_financial (sensitive)

**System:**
- users:manage
- roles:manage
- permissions:manage
- settings:manage
- audit_logs:view

**Implementation:**
- Middleware checks permissions on every API call
- UI dynamically shows/hides features based on permissions
- Row-level security (RLS) in Supabase enforces data access
- Can assign multiple roles to a user
- Can add role + specific permissions (override/extend)

**Best of both worlds:** Pre-defined roles for common cases + granular permissions for custom needs.

---

**Q12:** Can users perform actions on behalf of others?

- [x] Yes, with backup user system (delegation)
- [x] Logged and audited
- [x] Integrated with leave/calendar system

**YOUR ANSWER:**

**"Can users perform action and behave on behalf of others? If it is a backup user then probably will definitely need an option to set the backup user for our internal internal employees."**

**Backup User System:**

**Leave Approval Workflow:**
**"So when someone's not going on a vacation the moment his calendar or his maybe if you are tracking the HR also inside this, then the moment his leave starts to be able to even get the leave approved, he needs to mark the backup user and make sure that backup user confirms it by checking the Boolean value or something."**

**How It Works:**

**1. Leave Request Process:**
- Employee requests leave
- **MUST** designate a backup user
- Backup user must confirm/accept (boolean confirmation)
- Leave cannot be approved without confirmed backup
- Manager approves leave only after backup is set

**2. Backup User Access:**
- Backup user gets **temporary** elevated permissions
- Can access original user's work:
  - Their jobs
  - Their candidates
  - Their pending tasks
  - Their communications
- Access is **time-bound** (active only during leave period)

**3. Audit Trail:**
- All actions logged as: "John (acting as Mary) posted job XYZ"
- Clear differentiation in logs
- Notification to Mary when her backup takes action
- Manager can see all backup activities

**4. Automatic Revocation:**
- Permissions automatically revoke when:
  - Leave period ends
  - Mary returns and logs in
  - Manual override by manager/admin

**5. HR/Leave Integration:**
- Calendar shows:
  - Who's on leave
  - Who's their backup
  - When backup access is active
- Dashboard shows:
  - "You are backing up for Mary (Dec 10-15)"
  - "John is backing up for you (Jan 5-10)"

**6. Notifications:**
- Backup user: "Mary designated you as backup for Dec 10-15. Do you accept?"
- Manager: "Mary's leave request pending - backup confirmed"
- Team: "Mary is out Dec 10-15, contact John for her work"

**Use Cases:**

**Backup Scenarios:**
1. Vacation leave
2. Sick leave (if planned)
3. Extended absence
4. Training/conference attendance

**Non-Backup Scenarios:**
- Managers can always access their team's work (based on role permissions)
- CEO/Admin always have full access (no delegation needed)

**Database Schema:**

```
TABLE: leave_requests
- id
- user_id
- backup_user_id
- start_date
- end_date
- backup_confirmed (boolean)
- approved (boolean)
- status (pending, approved, active, completed)

TABLE: backup_access_log
- id
- acting_user_id (backup)
- original_user_id (on leave)
- action
- entity_type
- entity_id
- timestamp
```

**UI:**
- User profile: "Set default backup user"
- Leave request form: "Select backup" (required field)
- Dashboard: "Active backups" section
- Audit logs: "Backup actions" filter

**This ensures:**
- No work gets dropped during absences
- Clear accountability
- Automatic access control
- Manager visibility
- Smooth handoff/handback

---

**Q13:** Audit logging - do we track all admin actions?

- [x] ALL OF THE ABOVE
- [x] Comprehensive audit trail for everything

**YOUR ANSWER:**

**"Audit logging, yes, we do want to log every single thing."**

**"Definitely who logged in, who logged out, who edited, who created, who accessed. You know, fail knocking permission changes all the above."**

**Complete Audit Logging:**

**1. Authentication Events:**
- ✅ Login (successful)
- ✅ Logout
- ✅ Failed login attempts (with IP address)
- ✅ Password changes
- ✅ 2FA events
- ✅ SSO events
- ✅ Session timeouts

**2. Data Operations:**
- ✅ Record created (who, what, when, which fields)
- ✅ Record edited (who, what, when, which fields changed, before/after values)
- ✅ Record deleted (who, what, when, soft delete or hard delete)
- ✅ Bulk operations (import, export, batch update)

**3. Sensitive Data Access:**
- ✅ Candidate contact information viewed
- ✅ Salary information viewed
- ✅ Financial data accessed
- ✅ PII (Personally Identifiable Information) accessed
- ✅ Resume downloads
- ✅ Report exports

**4. Permission & Role Changes:**
- ✅ User role assigned/removed
- ✅ Permission granted/revoked
- ✅ Backup user designated
- ✅ Access level modified

**5. System Configuration:**
- ✅ Settings changed
- ✅ Integration configured
- ✅ Email templates modified
- ✅ Workflow rules changed

**6. Security Events:**
- ✅ Failed access attempts (unauthorized page/data)
- ✅ Permission denied events
- ✅ Suspicious activity patterns
- ✅ IP address changes (if security concern)

**7. Communication:**
- ✅ Email sent (to whom, template used)
- ✅ SMS sent
- ✅ WhatsApp messages
- ✅ In-app messages

**8. Business Operations:**
- ✅ Job posted/edited/deleted
- ✅ Candidate status changed
- ✅ Application moved in pipeline
- ✅ Interview scheduled
- ✅ Placement made
- ✅ Training enrolled
- ✅ Certificate issued

**Audit Log Structure:**

```
TABLE: audit_logs
- id (UUID)
- timestamp (timestamptz)
- user_id (who performed action)
- action (created, updated, deleted, viewed, etc.)
- entity_type (job, candidate, user, etc.)
- entity_id (which specific record)
- changes (JSONB - before/after values)
- ip_address
- user_agent
- session_id
- result (success, failed, error)
- metadata (JSONB - additional context)
```

**Audit Log UI:**

**Admin View:**
- Filterable by:
  - User
  - Action type
  - Entity type
  - Date range
  - Result (success/failed)
- Searchable
- Exportable (for compliance)
- Real-time view

**User Self-View:**
- "My Activity" page
- Shows their own actions only
- Transparency (know what's logged)

**Alerts:**
- Failed login attempts (3+ within 10 minutes)
- Bulk deletions
- Sensitive data mass access
- Permission escalation

**Retention:**
- Keep logs for X years (compliance requirement)
- Archived logs (compressed storage)
- Ability to restore/query old logs

**Compliance:**
- GDPR right to access (user can see all logs about them)
- GDPR right to erasure (handle carefully with audit logs)
- SOC 2 compliance (if needed)
- Data breach notification requirements

**Performance:**
- Async logging (doesn't slow down operations)
- Indexed for fast queries
- Partitioned by date (monthly/yearly)
- Separate database or schema (doesn't impact main DB)

**Benefits:**
- Full accountability
- Security forensics
- Compliance readiness
- Dispute resolution
- Performance tracking (who's doing what)
- Training (identify workflow issues)

---

**Q14:** Data export - can users export data?

- [x] Only managers/admins (not in admin portal)
- [x] Limited, contextual exports in workflows
- [x] All exports logged/audited

**YOUR ANSWER:**

**"Data exports? No, definitely not. Maybe only the managers and admins."**

**"Maybe here and there, depending on the use case, we might give that functionality in a very... definitely not in the admin portal."**

**Export Strategy:**

**1. Admin Portal:**
- ❌ No general "Export to CSV" buttons
- ✅ Only managers/admins can export from Reports module
- ✅ Controlled, audited exports only

**2. Contextual Workflow Exports:**
**"Maybe in some other places where as part of the workflow user can input something and download the output, you know, formatted in certain way or whatever it is."**

**Examples:**

**A. Resume Batch Processing:**
**"When we have a profile and we give the resume, we can batch it to the best."**
- User uploads resume
- System processes/parses
- User can download formatted version
- This is transformation, not data export

**B. JD Template Processing:**
**"And when we give the JD, we can write our own system to put back into the particular template."**
- User provides job description
- System formats into company template
- User downloads formatted JD
- Again, transformation output

**C. Report Generation:**
- Manager requests specific report
- System generates (filtered to their permissions)
- Manager downloads PDF/Excel
- Logged in audit trail

**3. Export Controls:**

**Who Can Export:**
- ❌ Regular team members: NO
- ✅ Team Leads: LIMITED (their team's data only, specific reports)
- ✅ Department Heads: YES (their department, reports module)
- ✅ Managers/Admins: YES (full access)
- ✅ CEO: YES (everything)

**What Can Be Exported:**
- ✅ Reports (aggregated data, analytics)
- ✅ Processed/formatted documents (resume templates, JD templates)
- ✅ User's own work summary
- ❌ Raw candidate database
- ❌ Full job listing database
- ❌ Sensitive PII in bulk

**Export Limits:**
- Max X records per export (e.g., 1000)
- Rate limiting (1 export per 5 minutes)
- Size limits (max 50MB file)
- Field filtering (exclude sensitive data by default)

**4. Audit Trail:**
Every export logged with:
- Who exported
- What data (entity type, filters, fields)
- How many records
- When
- Why (purpose field, optional but encouraged)
- IP address

**5. Data Loss Prevention (DLP):**
- Watermark exports (username + timestamp)
- Track file downloads
- Alert on bulk exports
- Flag unusual export patterns

**6. Approved Use Cases for Export:**

**✅ Allowed:**
- Manager monthly performance report (their team)
- CEO quarterly analytics
- HR compliance reports
- Financial reports for accounting
- Custom reports within permission scope

**❌ Not Allowed:**
- "Export all candidates" button
- Bulk email lists
- Competitor intelligence gathering
- Unrestricted data dumps

**7. Alternative to Exports:**

**In-App Views:**
- Rich filtering and search
- Printable views (instead of Excel)
- Dashboards with all needed info
- Real-time updates (no need to export for fresh data)

**Goal:** Minimize data leaving the system while supporting legitimate business needs.

**Principle:** "Data stays in the system. Insights and outputs come out."

---

**Q15:** Session management - how long can users stay logged in?

- [x] Session expires after inactivity
- [x] 30 minutes to 1.5 hours inactivity timeout

**YOUR ANSWER:**

**"Session management probably 5, 10, 15 minutes is what I want. Essentially to ensure that employees logged in and working."**

**"Maybe we can start with one hour or hour and a half or 30 minutes inactive, kick them out."**

**Session Strategy:**

**Purpose:**
- Ensure employees are actively working
- Security (prevent unauthorized access to unattended sessions)
- Accountability (track actual working time)

**Inactivity Timeout:**

**Initial Configuration:**
- **30 minutes** (conservative start)
- **OR 1 hour** (balanced)
- **OR 1.5 hours** (relaxed)

**User's Initial Thought:**
"5, 10, 15 minutes" - Very strict, but reconsidered to be more practical

**Recommended: 30-60 minutes**

**Implementation:**

**1. Inactivity Detection:**
Counts as "activity":
- Mouse movement
- Keyboard input
- API calls (data fetching, saves)
- Page navigation
- Form interactions

**No activity** = No interaction for X minutes

**2. Warning Before Logout:**
- At 25 minutes (if 30-minute timeout): "You'll be logged out in 5 minutes due to inactivity"
- User can click "I'm here" to extend session
- Auto-logout if no response

**3. Session Extension:**
- Each activity resets the timer
- Maximum session length: 8-10 hours (full work day)
- After max session, force re-auth (even if active)

**4. Different Timeouts by Context:**

**High Security Areas:**
- Finance module: 15 minutes
- HR/Payroll: 15 minutes
- Admin settings: 30 minutes

**Regular Work:**
- Jobs, candidates, content: 60 minutes

**Read-Only:**
- Reports, dashboards: 90 minutes

**5. "Remember Me" Option:**
- Available for less sensitive users
- Extends session to 7 days
- Still requires re-auth for sensitive actions
- CEO/trusted admins can enable

**6. Logging Out:**
When session expires:
- Redirect to login
- Show message: "Logged out due to inactivity"
- Save any unsaved work (auto-saved forms)
- Clear session completely

**7. Cross-Tab/Window Sessions:**
- Activity in ANY tab counts (if same domain)
- All tabs logged out simultaneously
- Consistent experience

**8. Mobile Considerations:**
- Mobile web: Same rules
- Can be slightly longer (background app behavior)

**9. Security Benefits:**
- Unattended computer: Auto-logout protects data
- Shared workspaces: Prevents others accessing session
- Compliance: Demonstrates access control

**10. Monitoring:**
- Track average session lengths
- Identify patterns (are 30 min too short? Users constantly re-logging?)
- Adjust based on data

**11. Special Cases:**

**Active Call/Meeting:**
- If user is on scheduled call (calendar integration)
- Extend timeout automatically
- Or send warning but don't auto-logout

**Long-Running Tasks:**
- Report generation, batch processing
- Keep session alive until task completes
- Show "Processing..." indicator

**12. User Notifications:**
- Email if unusual login location
- Notify if session logged out (security alert)
- Weekly summary: "You logged in X times this week"

**Recommended Settings:**

```
Default: 60 minutes inactivity
CEO/Admin: 90 minutes (can configure own)
Sensitive modules: 30 minutes
Maximum session: 8 hours (force re-auth)
Warning before logout: 5 minutes
Remember me: 7 days (optional, lower security)
```

**Configuration UI:**
- Admin can adjust timeout per role
- User preference (within allowed range)
- Override for specific users if needed

**Balance:**
- Short enough: Employees stay engaged, security maintained
- Long enough: Not annoying, productivity not hampered
- Configurable: Can adjust based on real usage patterns

**Start with 60 minutes, monitor, adjust as needed.**

---

# ✅ SECTION 1 COMPLETE

**Questions 1-15:** ALL ANSWERED

---

## 🎯 KEY DECISIONS CAPTURED

### **Portal Architecture:**
- Multi-role portal with completely different dashboards per role
- Location: `admin.intimeesolutions.com`
- Microsoft SSO for internal auth
- Real-time updates (Supabase Realtime)
- Desktop-focused (no mobile app needed)

### **Access Control:**
- CEO + Admin (full access)
- Department-specific roles (Recruiting, Training, Bench Sales, HR, etc.)
- Pod-based data isolation (no cross-pod visibility except in reports)
- Granular Guidewire-style permissions (Users → Groups → Regions → Roles → Permissions)

### **19 Major Modules:**
Dashboard, Jobs, Candidates, Clients, Training, Students, Bench, Team, Content, Communications, Reports, Finance, Calendar, Tasks, HR, Audit Logs, Integrations, AI Bots, Settings

### **Security & Compliance:**
- Comprehensive audit logging (every action)
- Backup user system (leave delegation with confirmation)
- Controlled data exports (managers/admins only, all logged)
- Session timeout: 30-60 minutes inactivity
- Row-level security (RLS) enforcement

### **🚀 INNOVATIVE FEATURE:**
**AI Bot for Employee Logging** - Replaces traditional scrums with scheduled voice-input check-ins every 1-2 hours, builds activity logs automatically, feeds performance system.

---

## 📋 NEXT: SECTION 2 - DASHBOARD & ANALYTICS

Coming up: Metrics, KPIs, visualizations, CEO dashboard vs department dashboards, real-time data display.

**Ready to continue?** 🎯


