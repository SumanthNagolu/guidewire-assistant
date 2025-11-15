# Test Code Test - User Workflow Implementation

## Purpose
This command loads the appropriate user workflow context and continues implementation from where we left off. It maintains history and progress across sessions.

## Usage
test-code-test [user-type]


Examples:
- `test-code-test student`
- `test-code-test recruiter`
- `test-code-test candidate`
- `test-code-test client`

---

## Instructions for AI Agent

You are implementing and testing user workflows for the IntimeSolutions platform. The user has invoked this command with a specific user type. Follow these steps:

### Step 1: Load Context

**Read these files in order**:
1. `/documentation/README.md` - Overall documentation structure
2. `/documentation/DOCUMENTATION-COMPLETE.md` - Implementation status
3. `/documentation/01-${USER_TYPE}-workflow.md` - Specific workflow (if exists)
4. `/documentation/VALIDATION-REPORT-${USER_TYPE}.md` - Progress report (if exists)

**USER_TYPE will be provided as**: `{{user_input}}`

If workflow documentation doesn't exist for this user type, start fresh.

### Step 2: Assess Current State

After reading documentation, determine:
1. **Has implementation started?** (Check VALIDATION-REPORT or workflow completion status)
2. **What's completed?** (List completed features)
3. **What's next?** (Identify next incomplete task)
4. **Are there blockers?** (Note any issues or dependencies)

Present a brief status summary:
📊 Current Status for [USER_TYPE]
✅ Completed: [List 3-5 key completed items]
🚧 In Progress: [Current work item]
⏭️ Next Steps: [Next 3 items to implement]
🔴 Blockers: [Any issues or none]


### Step 3: Continue Implementation

Based on the workflow documentation (documentation/01-${USER_TYPE}-workflow.md), implement the next uncompleted section:

**Implementation Priority Order**:
1. Database schema/migrations
2. Backend server actions
3. Frontend pages/components
4. Integration/testing
5. Documentation updates

**For each implementation**:
- ✅ Write actual code (don't just suggest)
- ✅ Update validation report with progress
- ✅ Test the implemented feature
- ✅ Document any issues or decisions made
- ✅ Mark completed items in workflow doc

### Step 4: Maintain Progress History

After completing work, **update** these files:

1. **`/documentation/VALIDATION-REPORT-${USER_TYPE}.md`**:
   - Add timestamp of session
   - List completed items
   - Note any issues encountered
   - Update completion percentage
   - Add next session goals

2. **`/documentation/01-${USER_TYPE}-workflow.md`**:
   - Mark completed sections with ✅
   - Add implementation notes
   - Update status indicators

3. **`/documentation/DOCUMENTATION-COMPLETE.md`**:
   - Update overall progress
   - Add session summary

### Step 5: Session Summary

At the end of each session, provide:
📝 Session Summary - [USER_TYPE] - [Date]
Completed:
[Item 1 with file paths]
[Item 2 with file paths]
[Item 3 with file paths]
Files Modified/Created:
path/to/file1.ts
path/to/file2.tsx
Testing Status:
✅ [What was tested]
⏭️ [What needs testing]
Next Session:
[ ] [Next task 1]
[ ] [Next task 2]
[ ] [Next task 3]
Blockers: [None or list]


---

## Context Maintenance Rules

### Always Check First
Before implementing, **always read**:
1. Previous validation reports
2. Existing workflow documentation
3. Related code files
4. Database schema

### Never Duplicate
- Don't recreate existing components
- Don't rewrite working code
- Build on what exists

### Progressive Implementation
- Implement one complete feature at a time
- Test before moving to next feature
- Update docs after each feature

### Consistent Progress Tracking
Every session must:
- Start with status check
- End with progress update
- Maintain session history

---

## User Types & Their Workflows

### Student
**Focus**: Signup → Email Verification → Profile Setup → Academy Access
**Key Files**:
- `app/(auth)/signup/student/page.tsx`
- `app/(auth)/student-profile-setup/page.tsx`
- `modules/auth/actions.ts` (signUpStudent, completeStudentProfile)

### Candidate
**Focus**: Signup → Profile → Job Application → Interview Tracking
**Key Files**:
- `app/(auth)/signup/candidate/page.tsx`
- `app/candidate/` (portal pages)
- `modules/auth/actions.ts` (signUpCandidate)

### Client
**Focus**: Signup → Approval → Post Jobs → View Candidates
**Key Files**:
- `app/(auth)/signup/client/page.tsx`
- `app/client/` (portal pages)
- `app/admin/client-approvals/page.tsx`

### Recruiter (Internal)
**Focus**: Admin creates → Full ATS access → Manage candidates/jobs
**Key Files**:
- `app/admin/users/new/page.tsx` (creation)
- `app/employee/candidates/` (ATS features)
- `components/admin/users/UserCreationWizard.tsx`

### Sales (Internal)
**Focus**: Admin creates → CRM access → Manage clients/opportunities
**Key Files**:
- `app/admin/users/new/page.tsx` (creation)
- `app/employee/clients/` (CRM features)

### Operations (Internal)
**Focus**: Admin creates → Placement management → Timesheet approval
**Key Files**:
- `app/admin/users/new/page.tsx` (creation)
- `app/employee/placements/` (placement features)

---

## Example Interaction

**User runs**: `test-code-test student`

**Agent should**:
1. Read `/documentation/01-student-workflow.md`
2. Read `/documentation/VALIDATION-REPORT-STUDENT.md`
3. Determine current progress (e.g., 60% complete)
4. Show status: "✅ Signup complete, 🚧 Profile setup in progress"
5. Continue implementing next incomplete feature
6. Test the implementation
7. Update validation report with progress
8. Provide session summary

**Next session**: User runs `test-code-test student` again
- Agent picks up from updated validation report
- Continues next incomplete task
- Maintains context from previous session

---

## Success Criteria

A successful session should:
- ✅ Complete at least one full feature
- ✅ Update all documentation
- ✅ Provide clear next steps
- ✅ Maintain continuity for next session
- ✅ No duplicated work
- ✅ Clear progress tracking

---

## Remember

- **Read before you write** - Check existing code first
- **One user type at a time** - Focus completely on current workflow
- **Test as you go** - Don't implement without testing
- **Document everything** - Future sessions depend on it
- **Progressive enhancement** - Build on existing work