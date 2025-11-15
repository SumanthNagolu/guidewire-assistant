# Training Management - Complete Test Cases
**Module:** Training & Development  
**Coverage:** 100% of UX design  
**Total Test Cases:** 35

---

## TC-TRAIN-DASH: Training Dashboard

**TC-TRAIN-001: Navigate to Training Dashboard**
- **User:** HR Manager
- **Steps:** HR Portal → Sidebar → Click "Training"
- **Expected:** Navigate to `/hr/training`
- **Verify:** Page loads with stats cards
- **Verify:** Shows active courses table

**TC-TRAIN-002: View Training Stats**
- **Steps:** Check stats cards
- **Expected:**
  - Total Courses count
  - Employees In Training count
  - Certifications Expiring count
  - Compliance Rate percentage
- **Verify:** Numbers match database

**TC-TRAIN-003: View Active Courses**
- **Steps:** Check "Active Training Courses" table
- **Expected:** Shows all active courses
- **Verify:** Columns: Name, Type, Assigned, Completed, Status
- **Verify:** Completion percentages accurate

---

## TC-TRAIN-CREATE: Create Training Course

**TC-TRAIN-004: Create New Course**
- **Steps:** Dashboard → Click "Create Course"
- **Expected:** Navigate to `/hr/training/courses/new`
- **Verify:** Course creation form loads

**TC-TRAIN-005: Fill Course Details**
- **Input:**
  - Name: "Annual Compliance Training 2025"
  - Category: Compliance
  - Type: Mandatory
  - Duration: 2 hours
  - Format: Online
  - Passing Score: 80%
  - Valid For: 1 year
- **Expected:** All fields accept input
- **Verify:** Validation messages for invalid values

**TC-TRAIN-006: Add Training Module**
- **Steps:** Click "+ Add Module"
- **Input:**
  - Module Name: "Introduction"
  - Duration: 15 min
  - Content Type: Video
  - Upload video file
- **Expected:** Module added to list
- **Verify:** Can add multiple modules

**TC-TRAIN-007: Reorder Modules**
- **Steps:** Drag Module 3 above Module 2
- **Expected:** Module order updates
- **Verify:** Order number changes

**TC-TRAIN-008: Remove Module**
- **Steps:** Click "Remove" on a module
- **Expected:** Confirmation dialog
- **Steps:** Confirm
- **Expected:** Module removed from list

**TC-TRAIN-009: Save Course Draft**
- **Steps:** Click "Save as Draft"
- **Expected:** Success message
- **Verify:** Course status = "Draft"
- **Verify:** Not visible to employees yet

**TC-TRAIN-010: Publish Course**
- **Steps:** Click "Create & Assign"
- **Expected:** Course created with status "Active"
- **Verify:** Appears in course list

---

## TC-TRAIN-ASSIGN: Assign Training

**TC-TRAIN-011: Assign to All Employees**
- **Steps:** Course details → Click "Assign to Employees"
- **Select:** "All Employees"
- **Set:** Due date June 30, 2025
- **Expected:** Assignment dialog opens
- **Steps:** Click "Assign"
- **Expected:** Success message
- **Verify:** 125 assignments created
- **Verify:** Employees receive notifications

**TC-TRAIN-012: Assign to Department**
- **Steps:** Select "Specific Department"
- **Choose:** IT Department
- **Expected:** Shows employee count (e.g., 25 employees)
- **Steps:** Assign
- **Expected:** 25 assignments created

**TC-TRAIN-013: Assign to Individuals**
- **Steps:** Select "Specific Employees"
- **Choose:** 5 employees from list
- **Expected:** 5 assignments created
- **Verify:** Only selected employees notified

---

## TC-TRAIN-EMPLOYEE: Employee Training Experience

**TC-TRAIN-014: View Assigned Training**
- **User:** Employee
- **Steps:** Login → Dashboard → Click "My Training"
- **Expected:** Navigate to `/hr/self-service/training`
- **Verify:** Shows assigned training tab
- **Verify:** Pending count accurate

**TC-TRAIN-015: Start Training**
- **Steps:** Click "Start Training" on assigned course
- **Expected:** Navigate to training player
- **Verify:** Module 1 is unlocked
- **Verify:** Other modules are locked

**TC-TRAIN-016: Complete Module**
- **Steps:** Watch/read Module 1 content
- **Steps:** Click "Mark Complete"
- **Expected:** Module 1 status → Complete ✓
- **Verify:** Module 2 unlocks automatically
- **Verify:** Progress bar updates (20% → 40%)
- **Verify:** Timestamp recorded

**TC-TRAIN-017: Resume Training**
- **Steps:** Exit training mid-course
- **Steps:** Return next day → Click "Continue Training"
- **Expected:** Resumes at last completed module
- **Verify:** Progress preserved
- **Verify:** Completed modules stay checked

**TC-TRAIN-018: Take Quiz**
- **Steps:** Complete all content modules
- **Expected:** Quiz module unlocks
- **Steps:** Start quiz
- **Expected:** Quiz loads with questions
- **Verify:** Timer starts (if timed)

**TC-TRAIN-019: Answer Quiz Questions**
- **Steps:** Select answers for all 10 questions
- **Steps:** Click "Submit Quiz"
- **Expected:** Confirmation: "Are you sure?"
- **Steps:** Confirm
- **Expected:** Quiz submitted, scored immediately

**TC-TRAIN-020: Pass Quiz**
- **Scenario:** Score 85% (passing = 80%)
- **Expected:** Success message: "Congratulations! You passed"
- **Verify:** Training status → "Completed"
- **Verify:** Certificate generated
- **Verify:** Can download certificate
- **Verify:** Completion date recorded

**TC-TRAIN-021: Fail Quiz (First Attempt)**
- **Scenario:** Score 65% (below 80%)
- **Expected:** Message: "You scored 65%. Passing score is 80%"
- **Verify:** Shows: "You have 2 attempts remaining"
- **Verify:** Can retake quiz
- **Verify:** Training status stays "InProgress"

**TC-TRAIN-022: Fail Quiz (All Attempts)**
- **Scenario:** Failed 3 times (max attempts)
- **Expected:** Message: "No attempts remaining. Contact your manager"
- **Verify:** Training status → "Failed"
- **Verify:** Manager notified
- **Verify:** Cannot retake without approval

---

## TC-TRAIN-CERT: Certification Management

**TC-TRAIN-023: View Certifications**
- **User:** Employee
- **Steps:** Training Dashboard → Click "Certificates" tab
- **Expected:** Shows all certificates
- **Verify:** Active and expired certificates displayed

**TC-TRAIN-024: Download Certificate**
- **Steps:** Click "Download" on a certificate
- **Expected:** PDF downloads
- **Verify:** Certificate includes: Name, Course, Date, Expiry, Signature

**TC-TRAIN-025: Renew Expiring Certification**
- **Steps:** Certificate expiring soon → Click "Renew"
- **Expected:** Re-enrolls in training course
- **Verify:** New assignment created
- **Verify:** Due date set based on expiry

---

## TC-TRAIN-TRACK: Progress Tracking (Manager/HR)

**TC-TRAIN-026: View Team Training Progress**
- **User:** Manager
- **Steps:** Training → Click "Team Progress"
- **Expected:** Shows table of direct reports
- **Verify:** Columns: Employee, Course, Progress%, Status, Due Date

**TC-TRAIN-027: View Individual Progress**
- **Steps:** Click on employee row
- **Expected:** Detailed progress view
- **Verify:** Shows module-by-module completion
- **Verify:** Shows quiz scores if taken

**TC-TRAIN-028: Send Reminder**
- **Steps:** Select employees with overdue training
- **Steps:** Click "Send Reminder"
- **Expected:** Reminder emails sent
- **Verify:** Email contains course link and deadline

---

## TC-TRAIN-REPORT: Reporting & Analytics

**TC-TRAIN-029: Compliance Report**
- **Steps:** Training → Reports → Compliance
- **Expected:** Shows compliance percentage by department
- **Verify:** Chart displays completion rates
- **Verify:** Can export to CSV

**TC-TRAIN-030: Training Hours Report**
- **Steps:** Reports → Training Hours
- **Expected:** Shows total training hours by employee
- **Verify:** Sortable by employee, department, period

---

## TC-TRAIN-EDGE: Edge Cases

**TC-TRAIN-031: Mandatory Training Overdue**
- **Scenario:** Employee misses deadline for mandatory training
- **Expected:** Training status → "Overdue"
- **Verify:** Red alert on employee dashboard
- **Verify:** Manager receives escalation
- **Verify:** Can still complete (with overdue flag)

**TC-TRAIN-032: Certificate Expiration**
- **Scenario:** Certificate expires
- **Expected:** Status → "Expired"
- **Verify:** Employee notified 30/15/7 days before
- **Verify:** Auto-assign renewal training

**TC-TRAIN-033: Course Content Update**
- **Scenario:** HR updates course content
- **Expected:** In-progress enrollments continue with old content
- **Verify:** New enrollments get new content
- **Verify:** Version tracking

**TC-TRAIN-034: Bulk Assignment**
- **Steps:** Assign course to 500 employees
- **Expected:** Processing indicator shown
- **Verify:** All 500 assignments created
- **Verify:** No timeouts or failures

**TC-TRAIN-035: Sequential Module Lock**
- **Scenario:** Try to access Module 3 before completing Module 2
- **Expected:** Module 3 shows "Locked" status
- **Verify:** Click shows message: "Complete previous modules first"

---

## ACCEPTANCE CRITERIA

Training module complete when:
- [ ] All 35 test cases pass
- [ ] HR can create and publish courses
- [ ] Employees can take training
- [ ] Sequential module unlock works
- [ ] Quizzes score correctly
- [ ] Certificates generate and download
- [ ] Progress tracks accurately
- [ ] Mandatory training enforced
- [ ] Expiration reminders sent
- [ ] Reports generate correctly
- [ ] No console errors
- [ ] Mobile responsive

---

**NEXT:** Implement complete Training module

