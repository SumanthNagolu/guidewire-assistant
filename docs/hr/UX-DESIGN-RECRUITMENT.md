# Recruitment/ATS Module - Complete UX Design
**Module:** Applicant Tracking System (ATS) & Recruitment  
**Users:** HR Manager, Recruiter, Hiring Manager  
**Purpose:** Manage job postings, track candidates, conduct interviews, make offers

---

## USER JOURNEYS

### Persona 1: Recruiter - Sarah Martinez
**Scenario:** Sarah needs to post a new job opening and manage applications.

**User Flow:**
```
1. Sarah logs into HR Portal → Dashboard
2. Clicks "Recruitment" in sidebar
3. Sees Recruitment Dashboard:
   - 5 Active Jobs
   - 23 New Applications (unreviewed)
   - 8 Interviews Scheduled This Week
   - 2 Offers Pending
4. Clicks "Post New Job" button
5. Job Posting Form opens:
   - Job Title: "Senior Software Engineer"
   - Department: IT (dropdown)
   - Location: Remote / Hybrid / On-site
   - Employment Type: Full-time
   - Salary Range: $120k - $150k
   - Job Description: (Rich text editor)
   - Requirements: (Bullet points)
   - Application Deadline: June 30, 2025
6. Clicks "Publish Job"
7. Success: Job posted to careers page + external job boards
8. Returns to dashboard → Sees new job in "Active Jobs"
9. Receives notification: New application received
10. Clicks notification → Views candidate profile
11. Reviews resume, cover letter, LinkedIn
12. Moves candidate to "Screening" stage
13. Schedules phone screen interview
14. Sends email invite to candidate
```

**Key Screens:** Dashboard → Post Job → View Applications → Candidate Profile → Schedule Interview

---

### Persona 2: Candidate - John Smith (External)
**Scenario:** John finds a job posting and applies online.

**User Flow:**
```
1. John visits careers page: intimesolutions.com/careers
2. Sees list of open positions
3. Filters by: Department (IT), Location (Remote)
4. Clicks on "Senior Software Engineer"
5. Reads job description and requirements
6. Clicks "Apply Now" button
7. Application form loads:
   - Personal Info: Name, Email, Phone
   - Resume Upload (PDF/DOCX)
   - Cover Letter (optional)
   - LinkedIn Profile URL
   - Current Salary, Expected Salary
   - Availability Date
   - How did you hear about us?
8. Fills all required fields
9. Uploads resume (validated: file type, size)
10. Clicks "Submit Application"
11. Confirmation message: "Application submitted successfully!"
12. Receives email confirmation with tracking link
13. Can check application status via tracking link
```

**Key Screens:** Careers Page → Job Detail → Application Form → Confirmation

---

## SCREEN DESIGNS

### Screen 1: Recruitment Dashboard (`/hr/recruitment`)

```
┌──────────────────────────────────────────────────────────────┐
│  Recruitment Management                   [Settings] [Reports]│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │   5        │  │    23      │  │     8      │  │    2    ││
│  │ Active Jobs│  │ New Apps   │  │ Interviews │  │ Offers  ││
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘│
│                                                                │
│  [+ Post New Job] [Import Candidates] [View Pipeline]        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Active Job Postings                                       ││
│  ├───────────────────────────────────────────────────────────││
│  │ Job Title           │ Dept  │ Apps │ Status  │ Deadline  ││
│  ├───────────────────────────────────────────────────────────││
│  │ Senior SW Engineer  │ IT    │  23  │ Active  │ Jun 30    ││
│  │ Marketing Manager   │ MKT   │  15  │ Active  │ Jul 15    ││
│  │ Sales Executive     │ Sales │   8  │ Active  │ Jun 20    ││
│  │ HR Coordinator      │ HR    │  12  │ Active  │ Jul 01    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Recent Applications (23 New)                    [View All]││
│  ├───────────────────────────────────────────────────────────││
│  │ Candidate     │ Job Position        │ Date  │ Status     ││
│  ├───────────────────────────────────────────────────────────││
│  │ 🆕 John Smith │ Senior SW Engineer  │ Today │ [Review]   ││
│  │ 🆕 Jane Doe   │ Marketing Manager   │ Today │ [Review]   ││
│  │ 🆕 Bob Lee    │ Sales Executive     │ Today │ [Review]   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Upcoming Interviews This Week                             ││
│  ├───────────────────────────────────────────────────────────││
│  │ Thu 2PM  │ Alice Chen   │ Technical Round │ [Join Call]  ││
│  │ Fri 10AM │ Tom Wilson   │ HR Screen       │ [Join Call]  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Stats cards (Jobs, Applications, Interviews, Offers)
- Action buttons (Post Job, Import, Pipeline)
- Active jobs table
- Recent applications feed with "New" badges
- Upcoming interviews calendar view

---

### Screen 2: Post New Job (`/hr/recruitment/jobs/new`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Post New Job Opening                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Tabs: [Basic Info] [Description] [Requirements] [Preview]   │
│                                                                │
│  ━━━ Basic Information ━━━                                    │
│                                                                │
│  * Job Title:                                                 │
│  [_______________________________________________________]    │
│                                                                │
│  * Department:               * Employment Type:               │
│  [IT ▼]                     [Full-time ▼]                    │
│                                                                │
│  * Location:                 * Remote Policy:                 │
│  [New York, NY ▼]           [○ On-site ● Hybrid ○ Remote]   │
│                                                                │
│  Salary Range:              Experience Level:                 │
│  Min: [$120,000]            [Senior ▼]                       │
│  Max: [$150,000]                                             │
│  [☑] Show salary in posting                                  │
│                                                                │
│  * Application Deadline:     Positions Available:             │
│  [2025-06-30]               [1]                              │
│                                                                │
│  ━━━ Job Description ━━━                                      │
│                                                                │
│  [Rich Text Editor with formatting tools]                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ We are seeking a Senior Software Engineer to join our... ││
│  │                                                            ││
│  │ Responsibilities:                                         ││
│  │ • Lead development of new features                        ││
│  │ • Mentor junior developers                                ││
│  │ • ...                                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ━━━ Requirements ━━━                                         │
│                                                                │
│  Required Skills: (Press Enter to add)                        │
│  [React] [Node.js] [TypeScript] [+ Add more]                 │
│                                                                │
│  Required Qualifications:                                     │
│  [Bullet list editor]                                         │
│  • Bachelor's in Computer Science or equivalent              │
│  • 5+ years of experience...                                 │
│                                                                │
│  [Save as Draft] [Preview] [Publish Job]                     │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Multi-tab form for organization
- Rich text editor for description
- Salary range with visibility toggle
- Tag input for skills
- Save draft capability
- Preview before publishing

---

### Screen 3: Candidate Pipeline (`/hr/recruitment/jobs/[id]/pipeline`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Senior Software Engineer - Candidate Pipeline     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Pipeline View: [Kanban] [List] [Calendar]                   │
│                                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ NEW    │  │SCREEN  │  │INTER-  │  │ OFFER  │  │ HIRED  ││
│  │ (23)   │  │ ING    │  │ VIEW   │  │ (2)    │  │ (1)    ││
│  │        │  │ (8)    │  │ (5)    │  │        │  │        ││
│  ├────────┤  ├────────┤  ├────────┤  ├────────┤  ├────────┤│
│  │┌──────┐│  │┌──────┐│  │┌──────┐│  │┌──────┐│  │┌──────┐││
│  ││John  ││  ││Alice ││  ││Sarah ││  ││Mike  ││  ││Tom   │││
│  ││Smith ││  ││Chen  ││  ││Brown ││  ││Davis ││  ││Wilson│││
│  ││      ││  ││      ││  ││      ││  ││      ││  ││      │││
│  ││★★★★☆││  ││★★★★★││  ││★★★★☆││  ││★★★★★││  ││★★★★★│││
│  ││      ││  ││      ││  ││      ││  ││      ││  ││      │││
│  ││Applied││  ││Phone ││  ││Tech  ││  ││Offer ││  ││Start │││
│  ││Today  ││  ││Screen││  ││Round ││  ││Sent  ││  ││Jun 1 │││
│  │└──────┘│  │└──────┘│  │└──────┘│  │└──────┘│  │└──────┘││
│  │        │  │        │  │        │  │        │  │        ││
│  │┌──────┐│  │┌──────┐│  │        │  │        │  │        ││
│  ││Jane  ││  ││...    ││  │        │  │        │  │        ││
│  ││Doe   ││  │└──────┘│  │        │  │        │  │        ││
│  │└──────┘│  │        │  │        │  │        │  │        ││
│  │        │  │        │  │        │  │        │  │        ││
│  │[+ 21]  │  │        │  │        │  │        │  │        ││
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
│                                                                │
│  Click candidate to view details • Drag to move between stages│
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Drag & drop candidates between stages
- Click card → Opens candidate profile
- Bulk actions (select multiple → move stage)
- Filter by rating, date, source
- View toggle (Kanban/List/Calendar)

---

### Screen 4: Candidate Profile (`/hr/recruitment/candidates/[id]`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  John Smith - Candidate Profile                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ 👤 John Smith           │  │ Quick Actions             │ │
│  │ Senior Software Engineer│  ├───────────────────────────┤ │
│  │                          │  │ [Move to Next Stage]      │ │
│  │ ★★★★☆ 4.5/5 Rating     │  │ [Schedule Interview]      │ │
│  │                          │  │ [Send Email]              │ │
│  │ 📧 john@example.com     │  │ [Download Resume]         │ │
│  │ 📱 (555) 123-4567       │  │ [Reject Candidate]        │ │
│  │ 🔗 linkedin.com/in/john │  └───────────────────────────┘ │
│  │                          │                                 │
│  │ Applied: May 15, 2025   │  ┌───────────────────────────┐ │
│  │ Source: LinkedIn        │  │ Timeline                   │ │
│  │ Current Stage: New      │  ├───────────────────────────┤ │
│  └─────────────────────────┘  │ Today: Application received││
│                                 │ [Add Note]                 │ │
│  Tabs: [Resume] [Cover Letter] [Interview Notes] [History] │ │
│                                                                │
│  ━━━ Resume Tab ━━━                                           │
│                                                                │
│  [PDF Viewer showing resume or parsed text]                  │
│                                                                │
│  Parsed Skills:                                               │
│  [React] [Node.js] [TypeScript] [AWS] [Docker]              │
│                                                                │
│  Experience:                                                  │
│  • Senior Developer at Tech Corp (2020-Present)              │
│  • Developer at StartupXYZ (2018-2020)                       │
│  • Total: 7 years                                            │
│                                                                │
│  Education:                                                   │
│  • BS Computer Science, MIT (2018)                           │
│                                                                │
│  ━━━ Interview Notes Tab ━━━                                 │
│                                                                │
│  Phone Screen (May 16, 2025) - Sarah Martinez               │
│  Rating: ★★★★★ 5/5                                           │
│  Notes: "Strong technical skills, great communication..."    │
│                                                                │
│  [+ Add Interview Feedback]                                  │
│                                                                │
│  ━━━ History Tab ━━━                                         │
│                                                                │
│  📅 May 16: Moved to "Screening" by Sarah Martinez           │
│  📅 May 15: Application received                             │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Candidate summary card
- Quick action buttons
- Activity timeline
- Multi-tab content (Resume, Cover Letter, Notes, History)
- PDF resume viewer
- Skill parsing
- Rating system
- Interview feedback

---

### Screen 5: Schedule Interview (`/hr/recruitment/interviews/schedule`)

```
┌──────────────────────────────────────────────────────────────┐
│  Schedule Interview - John Smith                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  * Interview Type:                                            │
│  ○ Phone Screen (15-30 min)                                  │
│  ● Technical Interview (1 hour)                              │
│  ○ Cultural Fit (30 min)                                     │
│  ○ Final Round (1-2 hours)                                   │
│                                                                │
│  * Interviewer(s):                                            │
│  [Select from team...▼]  [+ Add Another]                     │
│  ☑ Sarah Martinez (Recruiter)                                │
│  ☑ Michael Chen (Engineering Manager)                        │
│                                                                │
│  * Date & Time:                                               │
│  [2025-05-20] [14:00] Timezone: [EST ▼]                     │
│                                                                │
│  Duration:                                                    │
│  [1 hour ▼]                                                  │
│                                                                │
│  Interview Format:                                            │
│  ○ In-person  ● Video Call  ○ Phone                         │
│                                                                │
│  Video Conference Link:                                       │
│  [https://meet.google.com/abc-defg-hij]                     │
│  [Auto-generate Zoom Link]                                   │
│                                                                │
│  Agenda / Notes:                                              │
│  [________________________________________________            │
│   ________________________________________________]            │
│                                                                │
│  Email Template:                                              │
│  [Standard Interview Invitation ▼]                           │
│                                                                │
│  Preview Email:                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Subject: Interview Invitation - Senior SW Engineer       ││
│  │                                                            ││
│  │ Hi John,                                                  ││
│  │                                                            ││
│  │ We'd like to invite you for a technical interview...     ││
│  │ Date: May 20, 2025 at 2:00 PM EST                        ││
│  │ Duration: 1 hour                                          ││
│  │ Format: Video Call                                        ││
│  │ Link: [Zoom Link]                                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ☑ Send calendar invite to candidate                          │
│  ☑ Send calendar invite to interviewers                       │
│  ☑ Add to recruitment calendar                                │
│                                                                │
│  [Cancel] [Save Draft] [Schedule & Send Invite]              │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Interview type selection
- Multiple interviewers
- Date/time picker with timezone
- Video conference integration
- Email template customization
- Calendar integration
- Automatic invites

---

### Screen 6: Careers Page (Public) (`/careers`)

```
┌──────────────────────────────────────────────────────────────┐
│  ═══════════════════════════════════════════════════════════ │
│         INTIMESOLUTIONS - JOIN OUR TEAM                       │
│  ═══════════════════════════════════════════════════════════ │
│                                                                │
│  Build the future of HR technology with us                    │
│                                                                │
│  [Search jobs...] [All Departments ▼] [All Locations ▼]      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📍 Senior Software Engineer                      Remote   ││
│  │   IT Department • Full-time • $120k-$150k                ││
│  │                                                            ││
│  │   We're seeking a Senior SW Engineer to build...         ││
│  │                                                            ││
│  │   Posted 2 days ago • 23 applicants         [Apply Now →]││
│  ├───────────────────────────────────────────────────────────││
│  │ 📍 Marketing Manager                   New York, NY      ││
│  │   Marketing • Full-time • $90k-$110k                     ││
│  │   ...                                                     ││
│  │   Posted 5 days ago • 15 applicants         [Apply Now →]││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ━━━ Why Work With Us? ━━━                                   │
│  • Competitive Salary & Benefits                             │
│  • Remote-First Culture                                      │
│  • Professional Development                                   │
│  • Work-Life Balance                                         │
└──────────────────────────────────────────────────────────────┘
```

**Public Features:**
- Job search and filters
- Clean, attractive listing
- Apply button for each job
- Company culture section
- Mobile-responsive

---

## DATABASE SCHEMA

```sql
-- Job Postings
CREATE TABLE job_postings (
  id UUID PRIMARY KEY,
  job_title VARCHAR(200),
  department_id UUID REFERENCES departments(id),
  location VARCHAR(100),
  employment_type VARCHAR(20), -- Full-time, Part-time, Contract
  remote_policy VARCHAR(20), -- On-site, Hybrid, Remote
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  show_salary BOOLEAN,
  description TEXT,
  requirements TEXT,
  required_skills TEXT[],
  experience_level VARCHAR(20), -- Entry, Mid, Senior, Lead
  positions_available INTEGER,
  application_deadline DATE,
  status VARCHAR(20), -- Draft, Active, Paused, Closed
  posted_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  linkedin_url VARCHAR(255),
  current_company VARCHAR(100),
  current_title VARCHAR(100),
  current_salary DECIMAL(10,2),
  expected_salary DECIMAL(10,2),
  availability_date DATE,
  resume_url TEXT,
  cover_letter TEXT,
  skills TEXT[],
  total_experience_years INTEGER,
  source VARCHAR(50), -- LinkedIn, Referral, Website, etc.
  overall_rating DECIMAL(2,1),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY,
  job_posting_id UUID REFERENCES job_postings(id),
  candidate_id UUID REFERENCES candidates(id),
  application_date DATE,
  current_stage VARCHAR(30), -- New, Screening, Interview, Offer, Hired, Rejected
  stage_updated_at TIMESTAMPTZ,
  resume_url TEXT,
  cover_letter TEXT,
  questionnaire_responses JSONB,
  status VARCHAR(20), -- Active, Withdrawn, Rejected, Hired
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(job_posting_id, candidate_id)
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  interview_type VARCHAR(30), -- Phone, Technical, Cultural, Final
  scheduled_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  format VARCHAR(20), -- In-person, Video, Phone
  meeting_link VARCHAR(255),
  interviewers UUID[], -- Array of employee IDs
  agenda TEXT,
  status VARCHAR(20), -- Scheduled, Completed, Cancelled, NoShow
  feedback TEXT,
  rating DECIMAL(2,1),
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Interview Feedback
CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id),
  interviewer_id UUID REFERENCES employees(id),
  rating DECIMAL(2,1),
  technical_skills_rating DECIMAL(2,1),
  communication_rating DECIMAL(2,1),
  cultural_fit_rating DECIMAL(2,1),
  strengths TEXT,
  concerns TEXT,
  recommendation VARCHAR(20), -- StrongYes, Yes, Maybe, No, StrongNo
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);

-- Offers
CREATE TABLE job_offers (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  offer_date DATE,
  job_title VARCHAR(200),
  department_id UUID,
  salary DECIMAL(10,2),
  bonus DECIMAL(10,2),
  equity VARCHAR(50),
  benefits TEXT,
  start_date DATE,
  offer_letter_url TEXT,
  expiry_date DATE,
  status VARCHAR(20), -- Draft, Sent, Accepted, Rejected, Expired
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

**NEXT:** Create test cases and implement complete recruitment system

