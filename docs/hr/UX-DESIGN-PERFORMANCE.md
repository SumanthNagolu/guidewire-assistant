# Performance Management - Complete UX Design
**Module:** Performance Reviews & Goal Management  
**Users:** HR Manager, Manager, Employee  
**Purpose:** Conduct performance reviews, set goals, track progress

---

## USER JOURNEYS

### Persona 1: Manager - Michael Chen
**Scenario:** Michael needs to conduct quarterly performance review for his team member John Doe.

**User Flow:**
```
1. Michael logs into HR Portal → Dashboard
2. Clicks "Performance" in sidebar
3. Sees dashboard with pending reviews (3 overdue, 5 upcoming)
4. Clicks "Start Review" for John Doe (Q1 2025)
5. Review form opens with sections:
   - Employee Info (pre-filled)
   - Review Period: Jan 1 - Mar 31, 2025
   - Review Type: Quarterly
6. Michael fills each section:
   
   SECTION 1: Goal Achievement (from previous review)
   - Goal 1: Complete Project X (Status: Achieved - 100%)
   - Goal 2: Learn React (Status: Partially - 70%)
   - Goal 3: Improve communication (Status: Exceeded - 120%)
   
   SECTION 2: Competency Ratings (1-5 scale)
   - Technical Skills: ★★★★☆ (4/5) + Comments
   - Communication: ★★★★★ (5/5) + Comments
   - Teamwork: ★★★★☆ (4/5) + Comments
   - Problem Solving: ★★★★★ (5/5) + Comments
   - Leadership: ★★★☆☆ (3/5) + Comments
   
   SECTION 3: Strengths & Areas for Improvement
   - Strengths: "Excellent technical skills, quick learner..."
   - Improvements: "Work on delegation and time management..."
   
   SECTION 4: Overall Rating
   - Performance Rating: Exceeds Expectations (4/5)
   - Recommended Action: Promotion / Raise / Training / None
   
   SECTION 5: Goals for Next Period
   - Goal 1: Lead new feature development
   - Goal 2: Mentor junior developer
   - Goal 3: Complete leadership training
   
   SECTION 6: Manager Comments
   - "John has been an exceptional performer this quarter..."

7. Michael clicks "Save as Draft" (can continue later)
8. Later, Michael clicks "Submit for Employee Review"
9. John receives notification to review and acknowledge
10. John logs in, sees pending review
11. John reads review, adds self-assessment comments
12. John clicks "Acknowledge & Sign"
13. Michael gets notification of acknowledgment
14. HR can now see completed review in reports
15. Review is locked and archived
```

**Key Screens:** Dashboard → Start Review → Fill Form → Submit → Employee Acknowledges

---

### Persona 2: Employee - John Doe
**Scenario:** John wants to view his performance history and track goal progress.

**User Flow:**
```
1. John logs into Employee Portal → Dashboard
2. Clicks "My Performance" in sidebar
3. Sees Performance Dashboard:
   - Current Rating: 4/5 (Exceeds Expectations)
   - Goal Progress: 3/5 goals achieved (60%)
   - Next Review: June 30, 2025
4. Clicks "View Current Goals" tab
5. Sees active goals with progress bars:
   - Lead feature development (Status: In Progress - 40%)
   - Mentor junior dev (Status: Achieved - 100% ✓)
   - Complete training (Status: Not Started - 0%)
6. John updates progress on Goal 1:
   - Clicks "Update Progress"
   - Changes from 40% to 60%
   - Adds note: "Completed API design phase"
   - Clicks "Save"
7. John clicks "Review History" tab
8. Sees timeline of past reviews:
   - Q1 2025: 4/5 (Exceeds) [View Details]
   - Q4 2024: 3.5/5 (Meets+) [View Details]
   - Q3 2024: 3/5 (Meets) [View Details]
9. John clicks "View Details" on Q1 2025
10. Modal opens showing complete review with all sections
11. Can download PDF copy for records
```

**Key Screens:** Performance Dashboard → Goals → History → Review Details

---

## SCREEN DESIGNS

### Screen 1: Performance Dashboard (Manager) (`/hr/performance`)

```
┌──────────────────────────────────────────────────────────────┐
│  Performance Management                        [Settings] [?] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   3        │  │     5      │  │   15       │             │
│  │ Overdue    │  │  Upcoming  │  │ Completed  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  [+ Create Review] [Bulk Import] [View Reports]              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Pending Reviews (Action Required)                         ││
│  ├───────────────────────────────────────────────────────────││
│  │ Employee      │ Type      │ Period    │ Due Date │ Action││
│  ├───────────────────────────────────────────────────────────││
│  │ John Doe      │ Quarterly │ Q1 2025   │ Apr 10   │[Start]││
│  │ Jane Smith    │ Annual    │ 2024      │ Overdue! │[Start]││
│  │ Bob Lee       │ Quarterly │ Q1 2025   │ Apr 15   │[Start]││
│  │ ... (5 more)                                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Recent Reviews                                            ││
│  ├───────────────────────────────────────────────────────────││
│  │ Alice Chen    │ Quarterly │ Q1 2025   │ Exceeds   │[View]││
│  │ Tom Wilson    │ Quarterly │ Q1 2025   │ Meets     │[View]││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Stats cards (Overdue, Upcoming, Completed)
- Action buttons (Create, Import, Reports)
- Pending reviews table with "Start" buttons
- Recent completed reviews
- Color-coded status: Red (Overdue), Yellow (Upcoming), Green (Completed)

---

### Screen 2: Conduct Review Form (`/hr/performance/reviews/[id]`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Performance Review - John Doe (Q1 2025)           │
├──────────────────────────────────────────────────────────────┤
│  Progress: [■■■■■□□] 5/7 Sections Complete                   │
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Employee Info           │  │ Review Info                │ │
│  ├─────────────────────────┤  ├───────────────────────────┤ │
│  │ Name: John Doe          │  │ Period: Q1 2025           │ │
│  │ ID: EMP-001             │  │ Type: Quarterly           │ │
│  │ Department: IT          │  │ Reviewer: Michael Chen     │ │
│  │ Position: Developer     │  │ Due: Apr 10, 2025         │ │
│  │ Tenure: 2 years         │  │ Status: Draft             │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                                │
│  [Section Navigation: 1 2 3 4 5 6 7]                          │
│                                                                │
│  ━━━ SECTION 1: Goal Achievement ━━━                          │
│                                                                │
│  Goals set in previous review:                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Goal 1: Complete Project X                                ││
│  │ Target: Launch by Mar 15  Status: ✅ Achieved (100%)     ││
│  │ Manager Comments: [___________________________________]   ││
│  │                                                            ││
│  │ Goal 2: Learn React Framework                             ││
│  │ Target: Complete course    Status: 🟡 Partially (70%)    ││
│  │ Manager Comments: [___________________________________]   ││
│  │                                                            ││
│  │ Goal 3: Improve Communication                             ││
│  │ Target: Present weekly     Status: ✅ Exceeded (120%)    ││
│  │ Manager Comments: [___________________________________]   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  [Previous] [Save Draft] [Next Section]                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ━━━ SECTION 2: Competency Ratings ━━━                        │
│                                                                │
│  Rate employee on 1-5 scale:                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Technical Skills                                          ││
│  │ ★★★★☆ (4/5)                                              ││
│  │ Comments: [_____________________________________________] ││
│  │                                                            ││
│  │ Communication                                             ││
│  │ ★★★★★ (5/5)                                              ││
│  │ Comments: [_____________________________________________] ││
│  │                                                            ││
│  │ Teamwork                                                  ││
│  │ ★★★★☆ (4/5)                                              ││
│  │ Comments: [_____________________________________________] ││
│  │                                                            ││
│  │ Problem Solving                                           ││
│  │ ★★★★★ (5/5)                                              ││
│  │ Comments: [_____________________________________________] ││
│  │                                                            ││
│  │ [+ Add Custom Competency]                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Average Rating: 4.25/5                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ━━━ SECTION 4: Overall Rating & Recommendation ━━━           │
│                                                                │
│  Overall Performance Rating:                                  │
│  ○ Outstanding (5) - Far Exceeds Expectations                 │
│  ● Exceeds (4) - Consistently Above Standards                 │
│  ○ Meets (3) - Satisfactory Performance                       │
│  ○ Needs Improvement (2) - Below Standards                    │
│  ○ Unsatisfactory (1) - Significantly Below Standards         │
│                                                                │
│  Recommended Action:                                          │
│  ☑️ Promotion Consideration                                   │
│  ☑️ Salary Increase (Suggest: 10%)                            │
│  ☐ Additional Training Required                               │
│  ☐ Performance Improvement Plan                               │
│  ☐ No Action Required                                         │
│                                                                │
│  Manager Summary:                                             │
│  [___________________________________________________________ ││
│   ___________________________________________________________ ││
│   ___________________________________________________________ ]││
│                                                                │
│  [Previous] [Save Draft] [Submit for Employee Review]        │
└──────────────────────────────────────────────────────────────┘
```

**Sections:**
1. Goal Achievement (from previous review)
2. Competency Ratings (star ratings + comments)
3. Strengths & Improvements (text areas)
4. Overall Rating & Recommendations
5. Goals for Next Period
6. Manager Comments
7. Review Summary

**Features:**
- Multi-step form with progress indicator
- Save draft at any time
- Pre-filled employee info
- Star ratings with hover tooltips
- Real-time average calculation
- Validation before submission

---

### Screen 3: Employee Performance Dashboard (`/hr/self-service/performance`)

```
┌──────────────────────────────────────────────────────────────┐
│  My Performance                                               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   4.0/5    │  │   60%      │  │  Jun 30    │             │
│  │ Rating     │  │ Goal Prog. │  │ Next Review│             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  Tabs: [Current Goals] [Review History] [Feedback]           │
│                                                                │
│  ━━━ Current Goals Tab ━━━                                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Goal 1: Lead new feature development                      ││
│  │ Due: Sep 30, 2025                                         ││
│  │ Progress: [■■■■■■░░░░] 60%                                ││
│  │ Last Updated: 2 days ago                                  ││
│  │ [Update Progress] [View Details]                          ││
│  ├───────────────────────────────────────────────────────────││
│  │ Goal 2: Mentor junior developer                           ││
│  │ Due: Jun 30, 2025                                         ││
│  │ Progress: [■■■■■■■■■■] 100% ✅                            ││
│  │ Status: ACHIEVED                                          ││
│  │ [View Details]                                            ││
│  ├───────────────────────────────────────────────────────────││
│  │ Goal 3: Complete leadership training                      ││
│  │ Due: Dec 31, 2025                                         ││
│  │ Progress: [░░░░░░░░░░] 0%                                 ││
│  │ Status: NOT STARTED                                       ││
│  │ [Update Progress] [View Details]                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Overall Goal Progress: 3/5 goals on track                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ━━━ Review History Tab ━━━                                   │
│                                                                │
│  Timeline View:                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📅 Q1 2025 - Quarterly Review                             ││
│  │    Date: Apr 5, 2025                                      ││
│  │    Rating: 4.0/5 (Exceeds Expectations)                   ││
│  │    Reviewer: Michael Chen                                 ││
│  │    Status: ✅ Completed & Acknowledged                    ││
│  │    [View Details] [Download PDF]                          ││
│  ├───────────────────────────────────────────────────────────││
│  │ 📅 2024 - Annual Review                                   ││
│  │    Date: Dec 15, 2024                                     ││
│  │    Rating: 3.5/5 (Meets Expectations+)                    ││
│  │    Reviewer: Michael Chen                                 ││
│  │    Status: ✅ Completed                                   ││
│  │    [View Details] [Download PDF]                          ││
│  ├───────────────────────────────────────────────────────────││
│  │ 📅 Q3 2024 - Quarterly Review                             ││
│  │    Date: Oct 10, 2024                                     ││
│  │    Rating: 3.0/5 (Meets Expectations)                     ││
│  │    [View Details]                                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Performance Trend: 📈 Improving (3.0 → 3.5 → 4.0)            │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Stats cards (current rating, goal progress, next review date)
- Tab navigation (Goals, History, Feedback)
- Goal progress bars with percentages
- Update progress action
- Review history timeline
- Download PDF of reviews
- Performance trend indicator

---

### Screen 4: Employee Review Acknowledgment

```
┌──────────────────────────────────────────────────────────────┐
│  Review Pending Your Acknowledgment                           │
├──────────────────────────────────────────────────────────────┤
│  ⚠️ Action Required: Please review and acknowledge           │
│                                                                │
│  [Full Review Display - Read-Only]                            │
│                                                                │
│  Your manager has completed your Q1 2025 performance review.  │
│  Please read carefully and provide your feedback below.       │
│                                                                │
│  Employee Self-Assessment (Optional):                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Your comments on this review:                             ││
│  │ [_________________________________________________________││
│  │  _________________________________________________________││
│  │  _________________________________________________________]││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Additional Feedback or Concerns:                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [_________________________________________________________││
│  │  _________________________________________________________]││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ☑️ I have read and understood this performance review        │
│  ☑️ I agree to work towards the goals set for next period     │
│                                                                │
│  Electronic Signature:                                        │
│  [John Doe]                   Date: [Apr 10, 2025]           │
│                                                                │
│  [Request Changes] [Acknowledge & Sign]                       │
└──────────────────────────────────────────────────────────────┘
```

---

## DATABASE SCHEMA

```sql
-- Performance Review Cycles
CREATE TABLE performance_review_cycles (
  id UUID PRIMARY KEY,
  name VARCHAR(50), -- "Q1 2025", "Annual 2024"
  review_type VARCHAR(20), -- Quarterly, Annual, Probation
  start_date DATE,
  end_date DATE,
  due_date DATE,
  status VARCHAR(20), -- Draft, InProgress, Completed
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Performance Reviews
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY,
  review_cycle_id UUID REFERENCES performance_review_cycles(id),
  employee_id UUID REFERENCES employees(id),
  reviewer_id UUID REFERENCES employees(id),
  review_period_start DATE,
  review_period_end DATE,
  
  -- Goal Achievement Section
  previous_goals JSONB, -- Array of goals with achievement status
  
  -- Competency Ratings Section
  competency_ratings JSONB, -- {technical: 4, communication: 5, ...}
  competency_comments JSONB,
  
  -- Overall Assessment
  overall_rating DECIMAL(2,1), -- 1.0 to 5.0
  strengths TEXT,
  areas_for_improvement TEXT,
  
  -- Recommendations
  recommended_actions JSONB, -- [promotion, raise, training, pip, none]
  suggested_salary_increase DECIMAL(5,2),
  
  -- New Goals
  new_goals JSONB, -- Array of goals for next period
  
  -- Manager Comments
  manager_comments TEXT,
  
  -- Employee Acknowledgment
  employee_comments TEXT,
  employee_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  electronic_signature VARCHAR(100),
  
  -- Status & Workflow
  status VARCHAR(20), -- Draft, SubmittedToEmployee, Acknowledged, Completed
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Goals
CREATE TABLE performance_goals (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  set_by UUID REFERENCES employees(id),
  title VARCHAR(200),
  description TEXT,
  target_date DATE,
  category VARCHAR(50), -- Technical, Leadership, Process, etc.
  weight INTEGER, -- Percentage importance (0-100)
  
  -- Progress Tracking
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(20), -- NotStarted, InProgress, Achieved, Missed
  last_updated_at TIMESTAMPTZ,
  
  -- Completion
  achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  achievement_notes TEXT,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- 360 Degree Feedback (Optional)
CREATE TABLE performance_feedback (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES performance_reviews(id),
  feedback_from UUID REFERENCES employees(id),
  feedback_type VARCHAR(20), -- Peer, Subordinate, Self
  ratings JSONB,
  comments TEXT,
  anonymous BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

---

**NEXT:** Create test cases and implementation

