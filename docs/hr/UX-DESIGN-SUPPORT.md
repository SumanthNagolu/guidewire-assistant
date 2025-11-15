# Support/Ticketing Module - Complete UX Design
**Module:** HR Support Ticketing System  
**Users:** Employee, HR Support Agent, HR Manager  
**Purpose:** Handle employee HR queries, track issues, provide support

---

## USER JOURNEYS

### Persona 1: Employee - Sarah Johnson
**Scenario:** Sarah needs help with a payroll issue.

**User Flow:**
```
1. Sarah logs into Employee Portal → Dashboard
2. Clicks "Help & Support" or "Submit Ticket"
3. Support Dashboard shows:
   - My Open Tickets: 0
   - Recently Resolved: 2
   - Knowledge Base Articles
4. Clicks "Create New Ticket" button
5. Ticket Creation Form opens:
   - Category: Payroll (dropdown)
   - Priority: Normal / Urgent
   - Subject: "Missing allowance in March paycheck"
   - Description: "My transport allowance was not included..."
   - Attachments: [Upload payslip]
6. Sarah fills all details
7. Uploads supporting document
8. Clicks "Submit Ticket"
9. Success: "Ticket #TKT-2025-045 created"
10. Confirmation email sent to Sarah
11. HR Support team receives notification
12. Ticket appears in Sarah's "Open Tickets" list
13. Sarah receives reply from HR (ticket updated)
14. Email notification: "Update on your ticket"
15. Sarah logs in → Views ticket → Sees HR response
16. Sarah adds follow-up comment
17. HR resolves issue → Marks ticket "Resolved"
18. Sarah receives resolution notification
19. Sarah clicks "Close Ticket" (confirms resolution)
20. Ticket status → Closed
```

**Key Screens:** Support Dashboard → Create Ticket → Ticket Details → Communication Thread

---

### Persona 2: HR Support Agent - Michael Lee
**Scenario:** Michael handles incoming support tickets.

**User Flow:**
```
1. Michael logs into HR Portal → Dashboard
2. Clicks "Support" in sidebar
3. Sees Support Agent Dashboard:
   - My Assigned Tickets: 8 open
   - Team Queue: 15 unassigned
   - Resolved Today: 12
   - Avg Response Time: 2.5 hours
4. Sees unassigned ticket queue:
   - TKT-2025-045: Payroll issue (Urgent)
   - TKT-2025-046: Leave balance query (Normal)
   - ...
5. Clicks "Assign to Me" on TKT-2025-045
6. Ticket moves to "My Tickets"
7. Michael clicks ticket to open
8. Sees full ticket details:
   - Employee: Sarah Johnson (EMP-023)
   - Category: Payroll
   - Priority: Urgent
   - Subject: Missing allowance
   - Description: Full text
   - Attachments: payslip.pdf
9. Michael reviews attached payslip
10. Checks payroll system (links to payroll records)
11. Identifies issue: allowance not configured
12. Michael adds internal note: "Need to update salary components"
13. Michael replies to Sarah: "We've identified the issue..."
14. Sets ticket status to "In Progress"
15. Michael fixes salary component
16. Verifies correction in next payroll
17. Replies: "Issue fixed. Will reflect in April payroll"
18. Changes status to "Resolved"
19. Sarah confirms → Ticket closed
20. SLA met: Resolved within 4 hours
```

**Key Screens:** Agent Dashboard → Ticket Queue → Ticket Details → Internal Notes → Resolution

---

## SCREEN DESIGNS

### Screen 1: Employee Support Dashboard (`/hr/self-service/support`)

```
┌──────────────────────────────────────────────────────────────┐
│  Help & Support                                               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   0        │  │     2      │  │    12      │             │
│  │ Open       │  │  Resolved  │  │   Total    │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  [+ Create New Ticket] [Browse Knowledge Base]               │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ My Support Tickets                                        ││
│  ├───────────────────────────────────────────────────────────││
│  │ Ticket #    │ Subject            │ Category │ Status     ││
│  ├───────────────────────────────────────────────────────────││
│  │ No open tickets                                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Recently Resolved                                         ││
│  ├───────────────────────────────────────────────────────────││
│  │ #TKT-044 │ Leave balance query  │ Resolved 2 days ago    ││
│  │ #TKT-042 │ Update bank details  │ Resolved 5 days ago    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📚 Common Topics (Knowledge Base)                         ││
│  ├───────────────────────────────────────────────────────────││
│  │ • How to apply for leave                                  ││
│  │ • How to submit expense claims                            ││
│  │ • How to update personal information                      ││
│  │ • How to view pay stubs                                   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Stats cards (Open, Resolved, Total tickets)
- Create ticket button
- My tickets table
- Recently resolved section
- Knowledge base quick links

---

### Screen 2: Create Support Ticket (`/hr/self-service/support/new`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Create Support Ticket                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  * Category:                                                  │
│  [Payroll ▼]                                                 │
│  Options: Payroll, Leave, Timesheet, Benefits, IT, Other     │
│                                                                │
│  * Priority:                                                  │
│  ○ Low  ● Normal  ○ High  ○ Urgent                          │
│                                                                │
│  * Subject:                                                   │
│  [_______________________________________________________]    │
│                                                                │
│  * Description:                                               │
│  [_________________________________________________________   │
│   _________________________________________________________   │
│   _________________________________________________________   │
│   _________________________________________________________]  │
│                                                                │
│  Attachments: (Max 5 files, 10MB each)                       │
│  [📎 payslip.pdf] [X]                                        │
│  [+ Add Attachment]                                          │
│                                                                │
│  ━━━ Related Information ━━━                                 │
│                                                                │
│  Similar tickets/articles:                                    │
│  • "Payroll allowance not showing" [View Article]            │
│  • "Update salary components" [View Article]                 │
│                                                                │
│  [Cancel] [Submit Ticket]                                    │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Category dropdown with common issues
- Priority selection
- Rich text description
- File attachments with validation
- Smart suggestions (AI-powered or keyword-based)
- Auto-save draft

---

### Screen 3: Ticket Details (`/hr/self-service/support/tickets/[id]`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Ticket #TKT-2025-045                              │
│  Status: In Progress                   Priority: Urgent      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Ticket Information      │  │ Status Timeline            │ │
│  ├─────────────────────────┤  ├───────────────────────────┤ │
│  │ Ticket #: TKT-2025-045  │  │ • Created: May 15, 10:30AM│ │
│  │ Category: Payroll       │  │ • Assigned: May 15, 11:00│ │
│  │ Priority: Urgent        │  │ • In Progress: May 15,    │ │
│  │ Created: May 15, 2025   │  │   2:00PM                  │ │
│  │ Assigned to: M. Lee     │  │ • SLA: 4h remaining       │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                                │
│  Subject: Missing allowance in March paycheck                 │
│                                                                │
│  ━━━ Conversation ━━━                                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤 Sarah Johnson (You) - May 15, 10:30 AM                ││
│  │                                                            ││
│  │ My transport allowance was not included in my March       ││
│  │ paycheck. I usually receive $100/month but it's missing.  ││
│  │                                                            ││
│  │ 📎 payslip_march_2025.pdf                                 ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👨‍💼 Michael Lee (HR Support) - May 15, 2:15 PM             ││
│  │                                                            ││
│  │ Hi Sarah,                                                 ││
│  │                                                            ││
│  │ Thank you for reporting this. We've identified the issue  ││
│  │ and are working on a resolution. Your transport allowance ││
│  │ will be included in your April payroll with the backpay.  ││
│  │                                                            ││
│  │ Status updated to: In Progress                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Add Reply:                                                   │
│  [_________________________________________________________]  │
│  [📎 Attach File]                                            │
│  [Send Reply]                                                 │
│                                                                │
│  ⚠️ Ticket is being handled by HR. You'll be notified of     │
│     updates via email.                                        │
│                                                                │
│  [Close Ticket] (if resolved)                                │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Ticket info card with status timeline
- Conversation thread (employee ↔ HR)
- File attachments in thread
- Reply box
- Status indicators
- Close ticket button

---

### Screen 4: HR Support Agent Dashboard (`/hr/support`)

```
┌──────────────────────────────────────────────────────────────┐
│  Support Management                        [Settings] [Reports│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │   8        │  │    15      │  │    12      │  │  2.5h   ││
│  │ My Tickets │  │ Unassigned │  │  Resolved  │  │Avg Time ││
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘│
│                                                                │
│  Filter: [All ▼] [Payroll ▼] [High Priority ▼]              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Unassigned Tickets (Team Queue)                           ││
│  ├───────────────────────────────────────────────────────────││
│  │ #     │ Subject           │ Category │ Priority│ SLA     ││
│  ├───────────────────────────────────────────────────────────││
│  │ 🔴 045│ Missing allowance │ Payroll  │ Urgent  │ 4h left ││
│  │       │ Sarah Johnson     │          │         │[Assign] ││
│  ├───────────────────────────────────────────────────────────││
│  │ 🟡 046│ Leave balance     │ Leave    │ Normal  │ 1d left ││
│  │       │ John Doe          │          │         │[Assign] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ My Assigned Tickets (8)                                   ││
│  ├───────────────────────────────────────────────────────────││
│  │ #044  │ Update info       │ Profile  │ Normal │ ✅ Resolv││
│  │ #043  │ Benefits question │ Benefits │ Normal │ 🔄 InProg││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Stats cards (My Tickets, Unassigned, Resolved Today, Avg Response Time)
- Filters (status, category, priority)
- Unassigned queue with SLA timers
- My assigned tickets
- Assign button for quick claiming

---

## DATABASE SCHEMA

```sql
-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE,
  employee_id UUID REFERENCES employees(id),
  category VARCHAR(50), -- Payroll, Leave, Benefits, IT, Profile, Other
  priority VARCHAR(20), -- Low, Normal, High, Urgent
  subject VARCHAR(200),
  description TEXT,
  status VARCHAR(20), -- New, Assigned, InProgress, Resolved, Closed, Cancelled
  assigned_to UUID REFERENCES employees(id),
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  sla_due_at TIMESTAMPTZ,
  sla_breached BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Ticket Messages/Comments
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id),
  author_id UUID REFERENCES employees(id),
  message TEXT,
  is_internal BOOLEAN, -- Internal notes vs. customer-visible
  attachments JSONB,
  created_at TIMESTAMPTZ
);
```

---

**NEXT:** Create test cases and implementation

