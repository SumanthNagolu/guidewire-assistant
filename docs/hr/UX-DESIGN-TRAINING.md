# Training Management - Complete UX Design
**Module:** Employee Training & Development  
**Users:** HR Manager, Manager, Employee  
**Purpose:** Manage training courses, track completions, certifications

---

## USER JOURNEYS

### Persona 1: HR Manager - Linda Brown
**Scenario:** Linda needs to assign mandatory compliance training to all employees.

**User Flow:**
```
1. Linda logs into HR Portal → Dashboard
2. Clicks "Training" in sidebar
3. Sees Training Dashboard:
   - 15 Active Courses
   - 45 Employees in Training
   - 23 Certifications Expiring Soon
   - 89% Compliance Rate
4. Clicks "Create New Course" button
5. Course Creation Form opens:
   - Course Name: "Annual Compliance Training 2025"
   - Category: Compliance
   - Type: Mandatory / Optional
   - Duration: 2 hours
   - Format: Online (Self-paced / Instructor-led)
   - Passing Score: 80%
   - Validity Period: 1 year
   - Course Content: Upload materials or link
6. Linda fills all fields
7. Uploads course materials (PDF, videos)
8. Clicks "Create Course"
9. Success: Course created
10. Linda clicks "Assign to Employees"
11. Selects "All Employees" or specific departments
12. Sets deadline: June 30, 2025
13. Clicks "Assign Training"
14. System sends notifications to 125 employees
15. Dashboard updates: 125 pending assignments
16. Linda can track completion progress in real-time
```

**Key Screens:** Dashboard → Create Course → Assign to Employees → Track Progress

---

### Persona 2: Employee - David Kim
**Scenario:** David receives training assignment and completes it.

**User Flow:**
```
1. David receives email: "New training assigned: Annual Compliance Training"
2. Logs into Employee Portal → Dashboard
3. Sees notification: "1 pending training assignment"
4. Clicks "My Training" in sidebar
5. Sees Training Dashboard:
   - Pending (1): Compliance Training - Due Jun 30
   - In Progress (0)
   - Completed (5)
   - Certifications (2)
6. Clicks "Start Training" on Compliance course
7. Training Player opens:
   - Progress: 0% (0/5 modules)
   - Module 1: Introduction (15 min) [Start →]
   - Module 2: Data Privacy (30 min) [Locked]
   - Module 3: Workplace Safety (25 min) [Locked]
   - Module 4: Ethics (20 min) [Locked]
   - Module 5: Quiz (30 min) [Locked]
8. David clicks "Start" on Module 1
9. Video/Content plays or displays
10. David reads/watches content
11. Clicks "Mark Complete" at end
12. Module 1 status → Complete ✓
13. Module 2 unlocks automatically
14. David continues through modules
15. After Module 4, takes Quiz (Module 5)
16. Answers 10 questions
17. Submits quiz
18. Score: 85% (Pass - required 80%)
19. Success message: "Training completed! Certificate generated"
20. Certificate auto-downloads (PDF)
21. Training status → Completed
22. Manager receives notification
23. Training record saved with completion date
```

**Key Screens:** Training List → Course Player → Quiz → Certificate

---

## SCREEN DESIGNS

### Screen 1: Training Dashboard (HR) (`/hr/training`)

```
┌──────────────────────────────────────────────────────────────┐
│  Training Management                       [Settings] [Reports│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │   15       │  │    45      │  │    23      │  │   89%   ││
│  │ Courses    │  │ In Training│  │  Expiring  │  │Compliance││
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘│
│                                                                │
│  [+ Create Course] [Assign Training] [View Reports]          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Active Training Courses                                   ││
│  ├───────────────────────────────────────────────────────────││
│  │ Course Name          │ Type  │ Assigned │ Complete│ Status││
│  ├───────────────────────────────────────────────────────────││
│  │ Compliance 2025      │ Mand. │   125    │   98    │ Active││
│  │ React Fundamentals   │ Opt.  │    15    │   12    │ Active││
│  │ Leadership Skills    │ Opt.  │    10    │    7    │ Active││
│  │ Security Awareness   │ Mand. │   125    │  123    │ Active││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Certifications Expiring Soon (23)             [View All]  ││
│  ├───────────────────────────────────────────────────────────││
│  │ John Doe      │ First Aid      │ Expires: Jun 15 │[Renew]││
│  │ Jane Smith    │ Safety Officer │ Expires: Jun 20 │[Renew]││
│  │ ... (21 more)                                             ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Stats cards (Courses, In Training, Expiring Certs, Compliance%)
- Action buttons
- Active courses table with completion tracking
- Expiring certifications alert section

---

### Screen 2: Create Training Course (`/hr/training/courses/new`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Create Training Course                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  * Course Name:                                               │
│  [_______________________________________________________]    │
│                                                                │
│  Category:                    Type:                           │
│  [Compliance ▼]              ● Mandatory  ○ Optional          │
│                                                                │
│  Duration:                    Format:                         │
│  [2] hours                   ● Online ○ Classroom ○ Blended  │
│                                                                │
│  Learning Type:                                               │
│  ● Self-paced  ○ Instructor-led  ○ Hybrid                    │
│                                                                │
│  Passing Score: [80]%         Attempts Allowed: [3]          │
│                                                                │
│  Valid For: [1] year(s)       Certificate: ☑ Generate         │
│                                                                │
│  Description:                                                 │
│  [_________________________________________________________   │
│   _________________________________________________________]  │
│                                                                │
│  ━━━ Course Content ━━━                                       │
│                                                                │
│  Module 1: Introduction                                       │
│  [+] Add Module                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Module Name: [Introduction to Compliance]                ││
│  │ Duration: [15] min                                        ││
│  │ Content Type: ● Video ○ Document ○ SCORM ○ Quiz         ││
│  │ [Upload File] or [Enter URL]                             ││
│  │ [Remove]                                                  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Module 2: Main Content                                       │
│  [+] Add Module                                               │
│                                                                │
│  [Cancel] [Save as Draft] [Create & Assign]                  │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Multi-field form for course details
- Module builder (add/remove modules)
- Content upload (videos, PDFs, SCORM packages)
- Quiz configuration
- Certificate generation option
- Save draft or publish

---

### Screen 3: Employee Training Dashboard (`/hr/self-service/training`)

```
┌──────────────────────────────────────────────────────────────┐
│  My Training & Development                                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   1        │  │     0      │  │     5      │             │
│  │ Pending    │  │ In Progress│  │ Completed  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  Tabs: [Assigned] [In Progress] [Completed] [Certificates]   │
│                                                                │
│  ━━━ Assigned Tab ━━━                                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⚠️ Annual Compliance Training 2025                        ││
│  │ Category: Compliance • Duration: 2 hours                  ││
│  │ Due: June 30, 2025 (15 days remaining)                   ││
│  │ Type: MANDATORY                                           ││
│  │                                                            ││
│  │ Progress: [░░░░░░░░░░] 0%                                 ││
│  │                                                            ││
│  │ [Start Training →]                                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ━━━ Completed Tab ━━━                                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ✅ Security Awareness 2024                                ││
│  │ Completed: Dec 15, 2024 • Score: 95%                     ││
│  │ Certificate: [Download PDF] [View]                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ━━━ Certificates Tab ━━━                                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📜 First Aid Certification                                ││
│  │ Issued: Jan 10, 2024 • Expires: Jan 10, 2027             ││
│  │ Status: ✅ Valid                                          ││
│  │ [Download] [Renew]                                        ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Stats cards (Pending, In Progress, Completed)
- Tab navigation
- Training assignments with due dates
- Progress tracking
- Completed courses with scores
- Certificate downloads
- Expiration tracking

---

### Screen 4: Training Player (`/hr/self-service/training/[id]/learn`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Exit]  Annual Compliance Training 2025                   │
│  Progress: [■■■■■░░░░░] 50% (2/5 modules complete)           │
├──────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │Module 1│  │Module 2│  │Module 3│  │Module 4│  │Module 5││
│  │  ✅    │  │  ✅    │  │  ▶️    │  │  🔒    │  │  🔒    ││
│  │  15min │  │  30min │  │  25min │  │  20min │  │  30min ││
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                            ││
│  │              MODULE 3: WORKPLACE SAFETY                   ││
│  │                                                            ││
│  │         [Video Player or Content Area]                    ││
│  │                                                            ││
│  │              📺 25 minutes                                ││
│  │                                                            ││
│  │         [▶ Play] [⏸ Pause] [━━━━━━━━━░] 60%             ││
│  │                                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Module Content:                                              │
│  • Introduction to workplace safety...                        │
│  • Emergency procedures...                                    │
│  • Safety equipment usage...                                  │
│                                                                │
│  [< Previous Module] [Mark Complete & Continue] [Next Module>]│
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Module navigation (locked/unlocked)
- Video/content player
- Progress tracking
- Sequential unlock (must complete modules in order)
- Mark complete button
- Auto-advance to next module

---

### Screen 5: Training Quiz

```
┌──────────────────────────────────────────────────────────────┐
│  Annual Compliance Training - Final Quiz                     │
│  Time Remaining: 25:30        Questions: 5/10                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Question 5 of 10:                                            │
│                                                                │
│  What is the correct procedure for reporting a safety hazard?│
│                                                                │
│  ○ A) Ignore it and continue working                         │
│  ○ B) Report to supervisor immediately                       │
│  ○ C) Report within 24 hours                                 │
│  ○ D) Only report if it causes an incident                   │
│                                                                │
│  [< Previous] [Flag for Review] [Next >]                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Question Navigator:                                       ││
│  │ [1✓] [2✓] [3✓] [4✓] [5 ] [6 ] [7 ] [8 ] [9 ] [10]       ││
│  │  Answered: 4    Unanswered: 6    Flagged: 0              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  [Save Progress] [Submit Quiz]                                │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Question navigation
- Timer (if timed quiz)
- Flag questions for review
- Save progress
- Question navigator grid
- Submit with confirmation

---

## DATABASE SCHEMA

```sql
-- Training Courses
CREATE TABLE training_courses (
  id UUID PRIMARY KEY,
  course_name VARCHAR(200),
  course_code VARCHAR(50) UNIQUE,
  category VARCHAR(50), -- Compliance, Technical, Soft Skills, etc.
  course_type VARCHAR(20), -- Mandatory, Optional
  description TEXT,
  duration_hours DECIMAL(4,2),
  format VARCHAR(20), -- Online, Classroom, Blended
  learning_type VARCHAR(20), -- SelfPaced, InstructorLed, Hybrid
  passing_score INTEGER, -- Percentage (0-100)
  max_attempts INTEGER,
  validity_period_months INTEGER,
  generates_certificate BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Course Modules/Content
CREATE TABLE training_modules (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES training_courses(id),
  module_name VARCHAR(200),
  module_order INTEGER,
  duration_minutes INTEGER,
  content_type VARCHAR(20), -- Video, Document, SCORM, Quiz
  content_url TEXT,
  content_data JSONB, -- For quiz questions, etc.
  is_mandatory BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Training Assignments
CREATE TABLE training_assignments (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES training_courses(id),
  employee_id UUID REFERENCES employees(id),
  assigned_by UUID REFERENCES employees(id),
  assigned_date DATE,
  due_date DATE,
  status VARCHAR(20), -- Assigned, InProgress, Completed, Overdue, Expired
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INTEGER,
  attempts_used INTEGER,
  certificate_url TEXT,
  is_mandatory BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Training Progress
CREATE TABLE training_progress (
  id UUID PRIMARY KEY,
  assignment_id UUID REFERENCES training_assignments(id),
  module_id UUID REFERENCES training_modules(id),
  employee_id UUID REFERENCES employees(id),
  status VARCHAR(20), -- NotStarted, InProgress, Completed
  progress_percentage INTEGER,
  time_spent_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  certificate_name VARCHAR(200),
  certificate_type VARCHAR(50), -- Training, Professional, External
  issued_date DATE,
  expiry_date DATE,
  certificate_number VARCHAR(100),
  issuing_authority VARCHAR(100),
  certificate_url TEXT,
  is_valid BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

**NEXT:** Create test cases and implementation

