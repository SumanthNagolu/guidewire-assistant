# Recruitment/ATS - Complete Test Cases
**Module:** Applicant Tracking System  
**Coverage:** 100% of UX design  
**Total Test Cases:** 42

---

## TC-REC-DASH: Recruitment Dashboard

**TC-REC-001: Navigate to Recruitment Dashboard**
- **User:** Recruiter/HR Manager
- **Steps:** HR Portal → Sidebar → Click "Recruitment"
- **Expected:** Navigate to `/hr/recruitment`
- **Verify:** Page loads with "Recruitment Management" header
- **Verify:** Stats cards show correct counts

**TC-REC-002: View Dashboard Stats**
- **Steps:** Check stats cards
- **Expected:**
  - Active Jobs count
  - New Applications count
  - Interviews This Week count
  - Pending Offers count
- **Verify:** Numbers match actual data

**TC-REC-003: View Active Job Postings**
- **Steps:** Scroll to "Active Job Postings" table
- **Expected:** Shows all active jobs
- **Verify:** Columns: Title, Department, Applications, Status, Deadline
- **Verify:** Click row → Navigate to job details

---

## TC-REC-JOB: Job Posting Management

**TC-REC-004: Create New Job Posting**
- **Steps:** Dashboard → Click "Post New Job"
- **Expected:** Navigate to `/hr/recruitment/jobs/new`
- **Verify:** Multi-tab form loads (Basic Info, Description, Requirements, Preview)

**TC-REC-005: Fill Basic Information**
- **Input:**
  - Title: "Senior Software Engineer"
  - Department: IT
  - Location: New York, NY
  - Type: Full-time
  - Remote: Hybrid
  - Salary: $120k-$150k
  - Deadline: Jun 30, 2025
- **Expected:** All fields accept input
- **Verify:** Validation works

**TC-REC-006: Write Job Description**
- **Steps:** Switch to "Description" tab
- **Expected:** Rich text editor loads
- **Input:** Full job description with formatting
- **Verify:** Formatting preserved (bold, bullets, etc.)

**TC-REC-007: Add Requirements & Skills**
- **Steps:** Switch to "Requirements" tab
- **Input Skills:** React, Node.js, TypeScript (press Enter after each)
- **Input Qualifications:** Bullet list of requirements
- **Expected:** Skills saved as tags
- **Verify:** Can remove skills

**TC-REC-008: Preview Job Posting**
- **Steps:** Click "Preview" tab
- **Expected:** Shows formatted job posting as candidates will see it
- **Verify:** All info displays correctly

**TC-REC-009: Save Draft**
- **Steps:** Click "Save as Draft"
- **Expected:** Success message
- **Verify:** Job status = "Draft"
- **Verify:** Can edit later

**TC-REC-010: Publish Job**
- **Steps:** Click "Publish Job"
- **Expected:** Confirmation dialog
- **Steps:** Confirm
- **Expected:** Success message
- **Verify:** Job status = "Active"
- **Verify:** Appears on careers page

**TC-REC-011: Edit Job Posting**
- **Steps:** Dashboard → Click job → Edit
- **Change:** Update salary range
- **Steps:** Save
- **Expected:** Changes saved
- **Verify:** Updated values show

**TC-REC-012: Close Job Posting**
- **Steps:** Job details → Click "Close Posting"
- **Expected:** Confirmation dialog
- **Verify:** Job status → "Closed"
- **Verify:** No longer on careers page

---

## TC-REC-APP: Application Management

**TC-REC-013: View New Applications**
- **Steps:** Dashboard → "Recent Applications" section
- **Expected:** Shows latest applications with "New" badge
- **Verify:** Click application → Opens candidate profile

**TC-REC-014: Review Application**
- **Steps:** Click "Review" on new application
- **Expected:** Opens candidate profile page
- **Verify:** Shows resume, contact info, application details

**TC-REC-015: Download Resume**
- **Steps:** Candidate profile → Click "Download Resume"
- **Expected:** PDF downloads
- **Verify:** Filename: Resume_JohnSmith.pdf

**TC-REC-016: Rate Candidate**
- **Steps:** Candidate profile → Click stars to rate
- **Input:** 4/5 stars
- **Expected:** Rating saved
- **Verify:** Shows on candidate card

**TC-REC-017: Add Notes**
- **Steps:** Candidate profile → Timeline → "Add Note"
- **Input:** "Strong technical background, good communication"
- **Expected:** Note added to timeline
- **Verify:** Shows timestamp and author

---

## TC-REC-PIPE: Candidate Pipeline

**TC-REC-018: View Pipeline (Kanban)**
- **Steps:** Job details → Click "Pipeline"
- **Expected:** Kanban board with stages: New, Screening, Interview, Offer, Hired
- **Verify:** Candidates grouped by stage
- **Verify:** Stage counts shown

**TC-REC-019: Move Candidate to Next Stage**
- **Steps:** Drag candidate card from "New" to "Screening"
- **Expected:** Card moves
- **Verify:** Stage updated in database
- **Verify:** Timeline entry created

**TC-REC-020: Bulk Move Candidates**
- **Steps:** Select 3 candidates → Click "Move to..."
- **Expected:** Bulk action menu appears
- **Steps:** Select "Screening"
- **Expected:** All 3 candidates move
- **Verify:** Timeline updated for each

**TC-REC-021: Filter Pipeline**
- **Steps:** Use filter dropdown
- **Options:** By rating (4+ stars), By source (LinkedIn)
- **Expected:** Pipeline filters
- **Verify:** Only matching candidates show

**TC-REC-022: Switch to List View**
- **Steps:** Click "List" view toggle
- **Expected:** Pipeline changes to table format
- **Verify:** Same candidates, different layout

---

## TC-REC-INT: Interview Management

**TC-REC-023: Schedule Interview**
- **Steps:** Candidate profile → "Schedule Interview"
- **Expected:** Interview scheduling form opens
- **Input:**
  - Type: Technical Interview
  - Interviewers: Sarah Martinez, Michael Chen
  - Date/Time: May 20, 2025 @ 2:00 PM EST
  - Format: Video Call
  - Duration: 1 hour
- **Expected:** Form accepts input

**TC-REC-024: Auto-Generate Meeting Link**
- **Steps:** Click "Auto-generate Zoom Link"
- **Expected:** Zoom link created and populated
- **Verify:** Link format valid

**TC-REC-025: Preview Email Invitation**
- **Steps:** Scroll to "Preview Email" section
- **Expected:** Shows formatted email with all details
- **Verify:** Date, time, link included

**TC-REC-026: Send Interview Invitation**
- **Steps:** Click "Schedule & Send Invite"
- **Expected:** Success message
- **Verify:** Interview created in database
- **Verify:** Email sent to candidate
- **Verify:** Calendar invites sent to interviewers
- **Verify:** Appears in "Upcoming Interviews"

**TC-REC-027: Join Interview (Video)**
- **Steps:** Dashboard → "Upcoming Interviews" → Click "Join Call"
- **Expected:** Opens meeting link in new tab
- **Verify:** Correct Zoom/Meet link

**TC-REC-028: Submit Interview Feedback**
- **Steps:** After interview → Click "Submit Feedback"
- **Input:**
  - Overall Rating: 5/5
  - Technical Skills: 5/5
  - Communication: 4/5
  - Strengths: "Excellent problem solving..."
  - Recommendation: Strong Yes
- **Expected:** Feedback saved
- **Verify:** Shows on candidate profile

**TC-REC-029: Cancel Interview**
- **Steps:** Interview details → Click "Cancel"
- **Expected:** Confirmation dialog
- **Input:** Reason: "Candidate withdrew"
- **Expected:** Interview status → "Cancelled"
- **Verify:** Notifications sent

---

## TC-REC-OFFER: Offer Management

**TC-REC-030: Create Job Offer**
- **Steps:** Candidate profile → "Make Offer"
- **Input:**
  - Salary: $130,000
  - Bonus: $10,000
  - Start Date: Jul 1, 2025
  - Benefits: Standard package
  - Offer Expiry: Jun 15, 2025
- **Expected:** Offer draft created

**TC-REC-031: Generate Offer Letter**
- **Steps:** Offer details → Click "Generate Letter"
- **Expected:** PDF generated with all details
- **Verify:** Professional formatting
- **Verify:** All offer terms included

**TC-REC-032: Send Offer**
- **Steps:** Click "Send Offer to Candidate"
- **Expected:** Confirmation dialog
- **Expected:** Offer status → "Sent"
- **Verify:** Email sent with offer letter attached
- **Verify:** Application stage → "Offer"

**TC-REC-033: Candidate Accepts Offer**
- **Scenario:** Candidate clicks "Accept" in email
- **Expected:** Offer status → "Accepted"
- **Verify:** Application stage → "Hired"
- **Verify:** Notifications sent to HR/Manager

**TC-REC-034: Candidate Rejects Offer**
- **Scenario:** Candidate clicks "Reject" in email
- **Input:** Reason: "Accepted another offer"
- **Expected:** Offer status → "Rejected"
- **Verify:** Application stage → "Rejected"
- **Verify:** Rejection reason recorded

---

## TC-REC-PUBLIC: Careers Page (Public)

**TC-REC-035: View Careers Page**
- **User:** Public visitor
- **Steps:** Visit `/careers`
- **Expected:** Public careers page loads
- **Verify:** Shows all active job postings
- **Verify:** Company branding visible

**TC-REC-036: Search Jobs**
- **Steps:** Enter "Engineer" in search box
- **Expected:** Filters to matching jobs
- **Verify:** Shows only jobs with "Engineer" in title

**TC-REC-037: Filter by Department**
- **Steps:** Select "IT" from department dropdown
- **Expected:** Shows only IT department jobs

**TC-REC-038: View Job Details**
- **Steps:** Click on "Senior Software Engineer"
- **Expected:** Job detail page opens
- **Verify:** Shows full description, requirements, salary (if enabled)
- **Verify:** "Apply Now" button visible

**TC-REC-039: Submit Application**
- **Steps:** Job detail → Click "Apply Now"
- **Expected:** Application form opens
- **Input:**
  - Name: John Smith
  - Email: john@example.com
  - Phone: (555) 123-4567
  - Resume: Upload PDF file
  - LinkedIn: linkedin.com/in/johnsmith
  - Cover Letter: "I am excited..."
  - Current Salary: $110k
  - Expected Salary: $130k
- **Expected:** Form validates all fields

**TC-REC-040: Validation - Required Fields**
- **Scenario:** Try to submit without required fields
- **Expected:** Error messages for missing fields
- **Verify:** Cannot submit until complete

**TC-REC-041: Validation - File Upload**
- **Scenario:** Try to upload .exe file
- **Expected:** Error: "Only PDF or DOCX files allowed"
- **Scenario:** Upload 20MB file
- **Expected:** Error: "File size must be under 5MB"

**TC-REC-042: Application Confirmation**
- **Steps:** Complete form → Click "Submit Application"
- **Expected:** Success page with confirmation message
- **Verify:** Application appears in recruiter's dashboard
- **Verify:** Confirmation email sent to candidate
- **Verify:** Candidate receives tracking link

---

## TEST DATA REQUIRED

### Job Postings
1. Senior Software Engineer - IT - Remote - Active
2. Marketing Manager - Marketing - NY - Active
3. Sales Executive - Sales - Hybrid - Active
4. Junior Developer - IT - Remote - Draft

### Candidates
1. John Smith - Applied to SW Engineer - New stage
2. Jane Doe - Applied to Marketing - Screening
3. Alice Chen - Applied to SW Engineer - Interview
4. Bob Lee - Applied to Sales - Offer
5. Tom Wilson - Applied to SW Engineer - Hired

### Interviews
- Scheduled: Alice Chen - May 20 @ 2PM
- Completed: Jane Doe - Rating 4/5
- Cancelled: Old interview

---

## ACCEPTANCE CRITERIA

Recruitment module complete when:
- [ ] All 42 test cases pass
- [ ] Can post jobs and manage lifecycle
- [ ] Applications received and tracked
- [ ] Candidate pipeline works (drag & drop)
- [ ] Interviews can be scheduled and tracked
- [ ] Offers can be created and sent
- [ ] Public careers page functional
- [ ] Application form validates correctly
- [ ] Email notifications sent
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Load time < 3 seconds

---

**NEXT:** Implement complete Recruitment/ATS module

