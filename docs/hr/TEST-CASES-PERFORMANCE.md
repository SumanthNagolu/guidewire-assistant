# Performance Reviews - Complete Test Cases
**Module:** Performance Management  
**Coverage:** 100% of UX design  
**Total Test Cases:** 38

---

## TC-PERF-DASH: Performance Dashboard (Manager)

**TC-PERF-001: Navigate to Performance Dashboard**
- **User:** Manager
- **Steps:** HR Portal → Sidebar → Click "Performance"
- **Expected:** Navigate to `/hr/performance`
- **Verify:** Page loads with "Performance Management" header
- **Verify:** Stats cards show counts (Overdue, Upcoming, Completed)

**TC-PERF-002: View Pending Reviews**
- **Steps:** Check "Pending Reviews" table
- **Expected:** Shows reviews awaiting manager action
- **Verify:** Columns: Employee, Type, Period, Due Date, Action
- **Verify:** "Start" button for each review
- **Verify:** Overdue reviews highlighted in red

**TC-PERF-003: Filter Reviews**
- **Steps:** Use filter dropdown
- **Options:** All, Overdue, Upcoming, Completed
- **Expected:** Table filters accordingly
- **Verify:** Count updates

---

## TC-PERF-CREATE: Create & Conduct Review

**TC-PERF-004: Start New Review**
- **Steps:** Dashboard → Click "Start" on pending review
- **Expected:** Navigate to `/hr/performance/reviews/[id]`
- **Verify:** Employee info pre-filled
- **Verify:** Review period shown
- **Verify:** Progress bar at top (0/7 sections)

**TC-PERF-005: Fill Goal Achievement Section**
- **Steps:** Section 1 → Rate each previous goal
- **Input:** 
  - Goal 1: Achieved (100%)
  - Goal 2: Partially (70%)
  - Goal 3: Exceeded (120%)
- **Expected:** Can select status and add comments
- **Verify:** Statuses saved

**TC-PERF-006: Rate Competencies**
- **Steps:** Section 2 → Click stars to rate
- **Input:** Technical Skills = 4/5 stars
- **Expected:** Stars highlight on hover
- **Verify:** Rating updates
- **Verify:** Can add comments for each competency
- **Verify:** Average rating calculates automatically

**TC-PERF-007: Add Strengths & Improvements**
- **Steps:** Section 3 → Fill text areas
- **Input:**
  - Strengths: "Excellent technical skills..."
  - Improvements: "Work on delegation..."
- **Expected:** Text saves
- **Verify:** Character count (if applicable)

**TC-PERF-008: Set Overall Rating**
- **Steps:** Section 4 → Select rating radio button
- **Options:** 1-5 (Unsatisfactory to Outstanding)
- **Expected:** Radio button selected
- **Verify:** Recommendation checkboxes appear

**TC-PERF-009: Select Recommendations**
- **Steps:** Check recommended actions
- **Options:** Promotion, Raise, Training, PIP, None
- **Expected:** Can select multiple
- **Verify:** If "Raise" selected, salary field appears

**TC-PERF-010: Set New Goals**
- **Steps:** Section 5 → Click "Add Goal"
- **Input:**
  - Title: "Lead new feature"
  - Target Date: Sep 30, 2025
  - Weight: 30%
- **Expected:** Goal added to list
- **Verify:** Can add multiple goals
- **Verify:** Weights total to 100%

**TC-PERF-011: Save as Draft**
- **Steps:** Any section → Click "Save Draft"
- **Expected:** Success message
- **Verify:** Can navigate away and return
- **Verify:** All data persists

**TC-PERF-012: Submit for Employee Review**
- **Precondition:** All required sections completed
- **Steps:** Final section → Click "Submit for Employee Review"
- **Expected:** Confirmation dialog
- **Verify:** Shows summary of review
- **Verify:** Status changes to "Submitted"
- **Verify:** Employee receives notification

**TC-PERF-013: Validation - Incomplete Sections**
- **Scenario:** Try to submit with missing data
- **Expected:** Error: "Please complete all required sections"
- **Verify:** Highlights incomplete sections
- **Verify:** Cannot submit

---

## TC-PERF-EMPLOYEE: Employee Performance Dashboard

**TC-PERF-014: Navigate to My Performance**
- **User:** Employee
- **Steps:** Employee Portal → Click "My Performance"
- **Expected:** Navigate to `/hr/self-service/performance`
- **Verify:** Shows current rating, goal progress, next review date

**TC-PERF-015: View Current Goals**
- **Steps:** Click "Current Goals" tab
- **Expected:** Shows list of active goals
- **Verify:** Each goal shows:
  - Title, Due Date, Progress bar, Status
  - [Update Progress] button

**TC-PERF-016: Update Goal Progress**
- **Steps:** Click "Update Progress" on a goal
- **Expected:** Modal opens
- **Input:** Change progress from 40% to 60%
- **Input:** Add note: "Completed API phase"
- **Expected:** Progress bar updates
- **Verify:** Last updated timestamp changes

**TC-PERF-017: View Review History**
- **Steps:** Click "Review History" tab
- **Expected:** Timeline of past reviews
- **Verify:** Shows: Date, Rating, Reviewer, Status
- **Verify:** [View Details] button for each

**TC-PERF-018: View Review Details**
- **Steps:** Click "View Details" on a review
- **Expected:** Modal/Page shows complete review
- **Verify:** All sections visible (read-only)
- **Verify:** Can download PDF

**TC-PERF-019: Download Review PDF**
- **Steps:** In review details → Click "Download PDF"
- **Expected:** PDF downloads
- **Verify:** Filename: Review_Q12025_JohnDoe.pdf
- **Verify:** Professional formatting

---

## TC-PERF-ACK: Employee Acknowledgment

**TC-PERF-020: Receive Review Notification**
- **Scenario:** Manager submits review
- **Expected:** Employee receives email notification
- **Verify:** Email contains link to review
- **Verify:** Dashboard shows "Pending Action" badge

**TC-PERF-021: View Pending Review**
- **Steps:** Employee logs in → Sees notification
- **Steps:** Clicks to view review
- **Expected:** Opens review in acknowledgment mode
- **Verify:** All sections visible (read-only)
- **Verify:** Self-assessment fields available

**TC-PERF-022: Add Self-Assessment**
- **Steps:** Scroll to bottom → Add comments
- **Input:** "I agree with the assessment and appreciate..."
- **Expected:** Text field updates
- **Verify:** Character limit (if any)

**TC-PERF-023: Request Changes**
- **Steps:** Click "Request Changes" button
- **Expected:** Dialog: "Explain what needs to be changed"
- **Input:** Reason for change request
- **Expected:** Review status → "ChangesRequested"
- **Verify:** Manager notified

**TC-PERF-024: Acknowledge & Sign**
- **Precondition:** Employee has read review
- **Steps:** 
  - Check "I have read and understood" checkbox
  - Check "I agree to goals" checkbox
  - Enter electronic signature
  - Click "Acknowledge & Sign"
- **Expected:** Success message
- **Verify:** Status → "Acknowledged"
- **Verify:** Timestamp recorded
- **Verify:** Manager notified
- **Verify:** Review locked

**TC-PERF-025: Cannot Edit After Acknowledgment**
- **Scenario:** Employee tries to view acknowledged review
- **Expected:** All fields read-only
- **Verify:** No edit buttons visible
- **Verify:** Shows "Completed" badge

---

## TC-PERF-GOALS: Goal Management

**TC-PERF-026: Create Individual Goal**
- **User:** Manager or Employee
- **Steps:** Performance → Goals → Click "Add Goal"
- **Input:**
  - Title: "Complete React Training"
  - Description: "Finish online course"
  - Target Date: Dec 31, 2025
  - Weight: 20%
- **Expected:** Goal created
- **Verify:** Appears in active goals list

**TC-PERF-027: Edit Goal**
- **Steps:** Click on goal → Click "Edit"
- **Change:** Update target date
- **Expected:** Changes saved
- **Verify:** Updated date shows

**TC-PERF-028: Mark Goal as Achieved**
- **Steps:** Goal at 100% → Click "Mark as Achieved"
- **Expected:** Status changes to "Achieved"
- **Verify:** Achievement date recorded
- **Verify:** Moves to "Completed Goals" section

**TC-PERF-029: Goal Progress Validation**
- **Input:** Try to set progress > 100%
- **Expected:** Error: "Progress cannot exceed 100%"
- **Verify:** Value capped at 100

---

## TC-PERF-REPORT: Reports & Analytics

**TC-PERF-030: View Team Performance Report**
- **User:** Manager
- **Steps:** Performance → Reports → Team Performance
- **Expected:** Shows summary of team reviews
- **Verify:** Average rating, distribution chart
- **Verify:** List of team members with ratings

**TC-PERF-031: Export Review Data**
- **Steps:** Reports → Click "Export to CSV"
- **Expected:** CSV downloads
- **Verify:** Contains: Employee, Rating, Date, Reviewer

**TC-PERF-032: Performance Trend Analysis**
- **Steps:** Reports → Click "Trends"
- **Expected:** Chart showing ratings over time
- **Verify:** Can filter by department, period

---

## TC-PERF-EDGE: Edge Cases

**TC-PERF-033: Review for Termed Employee**
- **Scenario:** Employee terminated mid-review period
- **Expected:** Review still accessible
- **Verify:** Shows "Terminated" badge
- **Verify:** Can complete review

**TC-PERF-034: Overdue Review Warning**
- **Scenario:** Review due date passed
- **Expected:** Email sent to manager
- **Verify:** Dashboard shows overdue count
- **Verify:** Red highlight on review

**TC-PERF-035: Manager Changes Mid-Review**
- **Scenario:** Employee's manager changes
- **Expected:** Review transfers to new manager
- **Verify:** Old manager loses access
- **Verify:** New manager receives notification

**TC-PERF-036: Employee Rejects Review**
- **Scenario:** Employee requests changes
- **Expected:** Review status → "ChangesRequested"
- **Verify:** Manager can edit
- **Verify:** Employee reason visible to manager

**TC-PERF-037: Concurrent Editing**
- **Scenario:** Two managers try to edit same review
- **Expected:** Only one can edit at a time
- **Verify:** Second user sees "Locked" message

**TC-PERF-038: Performance Improvement Plan (PIP)**
- **Scenario:** Rating < 2 (Needs Improvement)
- **Expected:** System suggests PIP
- **Verify:** PIP template available
- **Verify:** Follow-up review scheduled

---

## TEST DATA REQUIRED

### Employees
- John Doe (EMP-001) - Good performer, rating 4/5
- Jane Smith (EMP-002) - Excellent performer, rating 5/5
- Bob Lee (EMP-003) - New employee, first review
- Alice Chen (EMP-004) - Needs improvement, rating 2/5

### Review Cycles
- Q1 2025 - Quarterly (Jan-Mar 2025)
- Annual 2024 - Annual review
- Probation - 90-day review

### Goals
- 5 sample goals per employee with varying progress
- Mix of technical, leadership, and process goals

---

## ACCEPTANCE CRITERIA

Performance module complete when:
- [ ] All 38 test cases pass
- [ ] Managers can conduct full reviews
- [ ] Employees can view and acknowledge reviews
- [ ] Goals can be created and tracked
- [ ] Progress updates work
- [ ] Reports generate correctly
- [ ] Email notifications sent
- [ ] Edge cases handled
- [ ] Mobile responsive
- [ ] No console errors

---

**NEXT:** Implement complete Performance module

