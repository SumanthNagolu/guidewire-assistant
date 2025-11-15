# Cursor AI Commands - Admin Portal Implementation

**Purpose**: Command reference for sequential epic implementation  
**Usage**: Execute commands in order to implement admin portal

---

## Command Structure

### Parent Command

```
/implement-admin-portal
```

**Description**: Initiates complete admin portal implementation workflow  
**Usage**: Run once to start the full implementation  
**Duration**: 5-6 weeks for all 15 epics

---

## Child Commands (Execute Sequentially)

### Phase 1: Foundation (Week 1)

#### Command: `/admin-01-authentication`
- **Epic**: Epic 1 - Authentication & Access Control
- **Stories**: 12 user stories (AUTH-001 to AUTH-012)
- **Duration**: 3-4 days
- **Prerequisites**: None (first epic)
- **Deliverables**:
  - Admin login page
  - Auth guards on all routes
  - Session management
  - Logout functionality
- **Documentation**: `documentation/admin/01-EPIC-Authentication.md`
- **Testing**: Login flow, session persistence, role verification

#### Command: `/admin-02-dashboard`
- **Epic**: Epic 2 - CEO Dashboard
- **Stories**: 15 user stories (DASH-001 to DASH-015+)
- **Duration**: 4-5 days
- **Prerequisites**: Epic 1 complete
- **Deliverables**:
  - Executive dashboard
  - KPI cards (revenue, placements, pipeline, pods)
  - Pod performance table
  - Critical alerts section
  - Growth trajectory
- **Documentation**: `documentation/admin/02-EPIC-Dashboard.md`
- **Testing**: Metric calculations, data fetching, real-time updates

#### Command: `/admin-03-user-management`
- **Epic**: Epic 3 - User Management
- **Stories**: 18 user stories (USER-001 to USER-018)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1 complete
- **Deliverables**:
  - User directory with search/filter
  - Role assignment dialog
  - Bulk operations
  - User statistics
- **Documentation**: `documentation/admin/03-EPIC-UserManagement.md`
- **Testing**: User CRUD, role changes, bulk operations

#### Command: `/admin-04-permissions`
- **Epic**: Epic 4 - Permissions & Audit System
- **Stories**: 14 user stories (PERM-001 to PERM-014)
- **Duration**: 4-5 days
- **Prerequisites**: Epic 1, 3 complete
- **Deliverables**:
  - Permission matrix
  - Audit log viewer
  - Real-time logging
  - Role definitions
- **Documentation**: `documentation/admin/04-EPIC-Permissions.md`
- **Testing**: Audit logging, permission checks, filters

---

### Phase 2: Infrastructure (Week 2)

#### Command: `/admin-14-setup`
- **Epic**: Epic 14 - Platform Setup
- **Stories**: 10 user stories (SETUP-001 to SETUP-010)
- **Duration**: 3-4 days
- **Prerequisites**: Epic 1 complete
- **Deliverables**:
  - Storage bucket configuration
  - Email verification
  - Database health checks
  - System status dashboard
- **Documentation**: `documentation/admin/14-EPIC-PlatformSetup.md`
- **Testing**: Storage access, email sending, database queries

#### Command: `/admin-11-media`
- **Epic**: Epic 11 - Media Library
- **Stories**: 19 user stories (MED-001 to MED-019)
- **Duration**: 6-7 days
- **Prerequisites**: Epic 1, 14 complete
- **Deliverables**:
  - Media library with upload
  - Folder organization
  - Media selector dialog
  - Usage tracking
- **Documentation**: `documentation/admin/11-EPIC-MediaLibrary.md`
- **Testing**: File upload, organization, selector functionality

---

### Phase 3: Content Management (Week 3)

#### Command: `/admin-06-blog`
- **Epic**: Epic 6 - Blog Management
- **Stories**: 22 user stories (BLOG-001 to BLOG-022)
- **Duration**: 6-7 days
- **Prerequisites**: Epic 1, 11 complete
- **Deliverables**:
  - Blog CMS with rich editor
  - SEO optimization
  - Publishing workflow
  - Auto-save
- **Documentation**: `documentation/admin/06-EPIC-BlogManagement.md`
- **Testing**: Content creation, SEO, publishing, preview

#### Command: `/admin-07-resources`
- **Epic**: Epic 7 - Resource Management
- **Stories**: 18 user stories (RES-001 to RES-018)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1, 11 complete
- **Deliverables**:
  - Resource library
  - Gating system
  - Download tracking
  - Lead capture
- **Documentation**: `documentation/admin/07-EPIC-ResourceManagement.md`
- **Testing**: File management, gating, analytics

#### Command: `/admin-05-training`
- **Epic**: Epic 5 - Training Content
- **Stories**: 16 user stories (TRAIN-001 to TRAIN-016)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1 complete
- **Deliverables**:
  - Topic management
  - Prerequisites system
  - Bulk upload
  - Content organization
- **Documentation**: `documentation/admin/05-EPIC-TrainingContent.md`
- **Testing**: Topic CRUD, prerequisites, organization

#### Command: `/admin-10-banners`
- **Epic**: Epic 10 - Banner Management
- **Stories**: 15 user stories (BAN-001 to BAN-015)
- **Duration**: 4-5 days
- **Prerequisites**: Epic 1, 11 complete
- **Deliverables**:
  - Banner campaigns
  - Scheduling
  - A/B testing
  - Analytics
- **Documentation**: `documentation/admin/10-EPIC-BannerManagement.md`
- **Testing**: Campaign management, scheduling, tracking

---

### Phase 4: Business Operations (Week 4)

#### Command: `/admin-08-jobs`
- **Epic**: Epic 8 - Job Management
- **Stories**: 20 user stories (JOB-001 to JOB-020)
- **Duration**: 6-7 days
- **Prerequisites**: Epic 1, 4 complete
- **Deliverables**:
  - Job posting system
  - Approval workflow
  - Application tracking
  - Job analytics
- **Documentation**: `documentation/admin/08-EPIC-JobManagement.md`
- **Testing**: Job CRUD, approval flow, applications

#### Command: `/admin-09-talent`
- **Epic**: Epic 9 - Talent Management
- **Stories**: 17 user stories (TAL-001 to TAL-017)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1, 8 complete
- **Deliverables**:
  - Candidate database
  - Advanced search
  - Job matching
  - Communication log
- **Documentation**: `documentation/admin/09-EPIC-TalentManagement.md`
- **Testing**: Candidate CRUD, search, matching

---

### Phase 5: Learning Platform (Week 5)

#### Command: `/admin-12-courses`
- **Epic**: Epic 12 - Course Management
- **Stories**: 16 user stories (COURSE-001 to COURSE-016)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1, 5 complete
- **Deliverables**:
  - Course builder
  - Learning paths
  - Topic sequencing
  - Enrollment tracking
- **Documentation**: `documentation/admin/12-EPIC-CourseManagement.md`
- **Testing**: Course creation, sequencing, publishing

#### Command: `/admin-15-upload`
- **Epic**: Epic 15 - Content Upload
- **Stories**: 12 user stories (UPL-001 to UPL-012)
- **Duration**: 4-5 days
- **Prerequisites**: Epic 5, 11 complete
- **Deliverables**:
  - Bulk upload interface
  - File validation
  - Progress tracking
  - Error recovery
- **Documentation**: `documentation/admin/15-EPIC-ContentUpload.md`
- **Testing**: Upload workflow, validation, error handling

---

### Phase 6: Intelligence & Optimization (Week 6)

#### Command: `/admin-13-analytics`
- **Epic**: Epic 13 - Analytics Dashboard
- **Stories**: 14 user stories (ANAL-001 to ANAL-014)
- **Duration**: 5-6 days
- **Prerequisites**: Epic 1, 2 complete
- **Deliverables**:
  - Analytics dashboard
  - Charts and visualizations
  - Report export
  - Real-time metrics
- **Documentation**: `documentation/admin/13-EPIC-Analytics.md`
- **Testing**: Chart rendering, data accuracy, export

---

## Command Usage Guide

### Starting an Epic

```bash
# 1. Read epic documentation
open documentation/admin/01-EPIC-Authentication.md

# 2. Execute command (in Cursor)
/admin-01-authentication

# 3. Follow user stories sequentially
# 4. Test after each story
# 5. Mark complete when all stories done
```

### Command Workflow

Each command will:
1. Display epic overview and user stories
2. Ask which story to implement
3. Generate implementation code
4. Run tests
5. Mark story complete
6. Move to next story

### Progress Tracking

Use `00-IMPLEMENTATION-GUIDE.md` to track:
- Epic completion status
- Story progress
- Overall percentage
- Next epic to start

---

## Command Templates

### Epic Implementation Command Template

```markdown
Command: /admin-{number}-{epic-name}

Example: /admin-01-authentication

Flow:
1. Show epic overview from documentation
2. List all user stories with status
3. Ask: "Which story to implement? (or 'all' for sequential)"
4. For selected story:
   a. Show acceptance criteria
   b. Generate implementation code
   c. Create necessary files
   d. Run tests
   e. Mark complete
5. Repeat until epic complete
```

### Story Implementation Flow

```markdown
For each story:

1. Display Story Card:
   - Story ID
   - Title
   - User story format
   - Acceptance criteria
   - Technical specs

2. Confirm Implementation:
   "Ready to implement {STORY-ID}: {Title}? (y/n)"

3. Generate Code:
   - Create/modify files
   - Add types
   - Add tests
   - Update documentation

4. Verify:
   - TypeScript compiles
   - Tests pass
   - No linter errors

5. Mark Complete:
   - Update progress tracker
   - Show next story
```

---

## Emergency Commands

### `/admin-status`
Shows current implementation status across all epics

### `/admin-test-epic-{number}`
Runs all tests for specific epic

### `/admin-rollback-{epic}`
Reverts changes for epic (use with caution)

### `/admin-verify-all`
Runs complete test suite across all implemented epics

---

## Best Practices

1. **Sequential Execution**: Always complete one epic before starting next
2. **Test After Each Story**: Don't accumulate technical debt
3. **Commit Frequently**: Commit after each completed story
4. **Documentation First**: Read epic docs before executing command
5. **Verify Prerequisites**: Ensure dependent epics are complete

---

## Troubleshooting

### Command Not Working
1. Check prerequisites are met
2. Verify documentation exists
3. Check for TypeScript errors
4. Review previous epic completion

### Story Failing Tests
1. Review acceptance criteria
2. Check technical implementation
3. Verify database schema
4. Review error messages

### Epic Taking Too Long
1. Review story breakdown
2. Check for scope creep
3. Verify story independence
4. Consider breaking into smaller stories

---

## Progress Dashboard

After each command, check progress in `00-IMPLEMENTATION-GUIDE.md`:

```
Epic 1: Authentication ✅ (12/12 stories)
Epic 2: Dashboard 🔄 (8/15 stories)
Epic 3: User Management ⏳ (0/18 stories)
...

Overall Progress: 20/238 stories (8.4%)
```

---

## Command History Log

Keep track of executed commands:

```bash
# Week 1
/admin-01-authentication  ✅ Completed 2025-11-15
/admin-02-dashboard       🔄 In Progress
/admin-03-user-management ⏳ Not Started

# Week 2
/admin-14-setup           ⏳ Not Started
/admin-11-media           ⏳ Not Started
...
```

---

## Success Criteria

Before marking epic complete:
- [ ] All stories implemented
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Accessibility verified
- [ ] Performance acceptable

---

## Next Steps

1. Start with Epic 1:
   ```
   /admin-01-authentication
   ```

2. Work through Phase 1 epics (Week 1)

3. Continue through phases sequentially

4. Complete all 15 epics

5. Run integration tests

6. Optimize and deploy

---

**Ready to begin? Execute the first command!**

```bash
/admin-01-authentication
```

