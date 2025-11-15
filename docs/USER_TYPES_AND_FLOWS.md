# User Types & Signup Flows

## Overview

This document defines all user types in the IntimeSolutions platform, their signup flows, and default permissions.

---

## User Type Categories

### 1. External Users (Self-Service Signup)
- Students
- Candidates
- Clients

### 2. Internal Users (Admin-Created Only)
- Admins
- Recruiters
- Sales Representatives
- Account Managers
- Operations Staff
- HR Staff
- Employees

---

## External User Types

### Student

**Purpose**: Individuals learning Guidewire through the Academy

**Signup Flow**:
- Path: `/signup/student`
- Self-service signup
- Email verification required
- Immediate access to Academy after verification

**Information Captured**:
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required)
- Phone (optional)
- LinkedIn URL (optional)

**Default Permissions**:
- Access to Academy content
- Track course progress
- View certificates
- Update own profile

**Redirect After Signup**: `/academy`

**Status**: Active immediately after email verification

---

### Candidate

**Purpose**: Job seekers looking for Guidewire opportunities

**Signup Flow**:
- Path: `/signup/candidate`
- Self-service signup
- Email verification required
- Profile completion encouraged

**Information Captured**:
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required)
- Phone (required)
- Current Title (optional)
- Years of Experience (optional)

**Automatic Record Creation**:
- Creates entry in `user_profiles` table with role='candidate'
- Creates entry in `candidates` table with status='active'
- Candidate record linked to user profile

**Default Permissions**:
- View and apply for jobs
- Upload/manage resume
- Track application status
- Message recruiters
- Update profile

**Redirect After Signup**: `/candidate/profile`

**Status**: Active immediately

---

### Client

**Purpose**: Companies looking to hire Guidewire talent

**Signup Flow**:
- Path: `/signup/client`
- Self-service signup
- Email verification required
- **Admin approval required before full access**

**Information Captured**:
- Company Name (required)
- First Name (required)
- Last Name (required)
- Email (required - work email recommended)
- Password (required)
- Phone (required)
- Industry (optional)
- Company Size (optional)

**Automatic Record Creation**:
- Creates entry in `user_profiles` table with role='client'
- Creates entry in `clients` table with status='pending_approval'
- Admin receives notification of new client signup

**Default Permissions (After Approval)**:
- Post job opportunities
- View candidate matches
- Manage job postings
- Message candidates
- View analytics

**Redirect After Signup**: `/client/pending-approval`

**Status**: `pending_approval` → `active` (after admin approval)

**Approval Process**:
1. Client signs up
2. Admin receives notification
3. Admin reviews client information
4. Admin approves/rejects via `/admin/client-approvals`
5. Client receives approval/rejection email
6. Approved clients gain full access

---

## Internal User Types

### Admin

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: System administrators with full access

**Default Permissions**: ALL (complete system access)

**Typical Use Cases**:
- System configuration
- User management
- Access to all data
- Audit log review

**Organizational Attributes**:
- Usually assigned to "Administration" team
- Global region
- Reports to C-level

---

### Recruiter

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Talent acquisition team members

**Default Permissions**:
- View, create, edit, assign candidates
- View, create, edit jobs
- Manage applications and interviews
- View reports
- View users

**Typical Use Cases**:
- Source and screen candidates
- Conduct interviews
- Manage job postings
- Track application pipeline

**Organizational Attributes**:
- Team: Recruiting (or regional recruiting teams)
- Stream: May be industry-specific
- Reports to: Recruiting Manager

---

### Sales

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Business development and client acquisition

**Default Permissions**:
- View, create, edit clients
- View, create jobs
- View candidates
- View reports
- View users

**Typical Use Cases**:
- Prospect new clients
- Manage client relationships (pre-sale)
- Understand candidate availability
- Generate new business

**Organizational Attributes**:
- Team: Sales (often regional)
- Region: Territory-based
- Stream: Industry vertical
- Reports to: Sales Manager

---

### Account Manager

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Manage ongoing client relationships

**Default Permissions**:
- View, edit clients
- View, manage placements
- View jobs
- View reports
- View users

**Typical Use Cases**:
- Client retention and growth
- Placement management
- Contract renewals
- Client satisfaction

**Organizational Attributes**:
- Team: Account Management / Customer Success
- Region: May be client-based
- Reports to: Director of Customer Success

---

### Operations

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Manage placements, timesheets, and fulfillment

**Default Permissions**:
- View, create, manage placements
- View, approve timesheets
- View candidates
- View reports
- View users

**Typical Use Cases**:
- Placement coordination
- Timesheet approval
- Contractor management
- Compliance tracking

**Organizational Attributes**:
- Team: Operations
- Stream: Often industry-specific
- Reports to: Operations Manager

---

### HR

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Human resources management

**Default Permissions**:
- View, edit employees
- Manage leave requests
- Manage benefits
- Conduct performance reviews
- View reports
- View users

**Typical Use Cases**:
- Employee onboarding/offboarding
- Leave management
- Benefits administration
- Performance management

**Organizational Attributes**:
- Team: Human Resources
- Region: Global or regional
- Reports to: VP of Operations / COO

---

### Employee

**Creation**: Admin-only via `/admin/users/new`

**Purpose**: Basic internal employee access

**Default Permissions**:
- View own profile
- Submit timesheets
- Request leave
- View users

**Typical Use Cases**:
- Self-service HR functions
- Timesheet submission
- Basic system access

**Organizational Attributes**:
- Team: Various
- Reports to: Department manager

---

## Signup Flow Diagrams

### External User Signup Flow

```
User visits signup page
    ↓
Selects user type (Student / Candidate / Client)
    ↓
Fills out signup form
    ↓
Submits form
    ↓
Backend validates data
    ↓
Creates auth.users entry
    ↓
Trigger creates user_profiles entry
    ↓
[If Candidate] Creates candidates entry
[If Client] Creates clients entry (status=pending_approval)
    ↓
Sends verification email
    ↓
User verifies email
    ↓
User redirected to appropriate portal
```

### Internal User Creation Flow

```
Admin navigates to /admin/users/new
    ↓
Step 1: Enters basic information
    ↓
Step 2: Selects role
    ↓
Step 3: Sets organizational attributes
    ↓
Step 4: Reviews and confirms
    ↓
Admin clicks "Create User"
    ↓
Backend generates temporary password
    ↓
Creates auth.users entry
    ↓
Trigger creates user_profiles entry
    ↓
Updates profile with org attributes
    ↓
[If selected] Sends welcome email with reset link
    ↓
User receives email and sets password
    ↓
User logs in with new password
    ↓
User accesses system based on role
```

---

## Permission Matrix

| Feature | Student | Candidate | Client | Employee | HR | Ops | Acct Mgr | Sales | Recruiter | Admin |
|---------|---------|-----------|--------|----------|----|----|----------|-------|-----------|-------|
| Academy Access | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Jobs | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply for Jobs | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Post Jobs | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Candidates | ❌ | ❌ | ✅* | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Manage Candidates | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Clients | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Manage Clients | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Manage Placements | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Submit Timesheets | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve Timesheets | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| HR Functions | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Reports | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*After approval

---

## Role Assignment Guidelines

### When to use each role:

**Admin**:
- System administrators
- C-level executives who need full visibility
- IT staff managing the platform

**Recruiter**:
- Talent acquisition specialists
- Recruiting coordinators
- Sourcers
- Interview schedulers

**Sales**:
- Business development representatives
- Sales executives
- Account executives (pre-sale)

**Account Manager**:
- Customer success managers
- Account managers (post-sale)
- Client relationship managers

**Operations**:
- Delivery managers
- Operations coordinators
- Compliance specialists
- Contractor coordinators

**HR**:
- HR managers
- HR generalists
- Benefits administrators
- Payroll administrators

**Employee**:
- Any internal employee needing basic access
- Contractors
- Part-time staff

---

## Common Multi-Role Scenarios

Some users may need capabilities from multiple roles. Handle these with custom permissions:

### Recruiting Manager (Recruiter + Management)
- Base role: Recruiter
- Add: `reports.analytics`, `users.view` (team members)

### Sales Engineer (Sales + Technical)
- Base role: Sales
- Add: `candidates.view` (to understand technical capabilities)

### Operations Manager (Operations + HR)
- Base role: Operations
- Add: `hr.view_employees`, `hr.manage_leave`

### VP of Delivery (Leadership)
- Base role: Admin
- All permissions by default

---

## Database Schema Reference

### user_profiles Table

All users have an entry here, regardless of type.

Key fields:
- `id`: UUID (references auth.users.id)
- `email`: String (unique)
- `role`: String (see roles above)
- `full_name`: String
- `phone`: String (optional)
- `is_active`: Boolean
- `team_id`: UUID (references teams)
- `region`: String
- `stream`: String
- `location`: String
- `job_title`: String
- `employment_type`: String
- `start_date`: Date
- `reporting_to`: UUID (references user_profiles)
- `cost_center`: String
- `group_name`: String

### Additional Tables by User Type

**Candidates**: `candidates` table
- Linked by email to user_profiles
- Contains candidate-specific fields (resume, skills, etc.)

**Clients**: `clients` table
- Linked by email to user_profiles
- Contains company information

---

## Testing Credentials

For testing purposes, you can create test users with domain `@intimeesolutions.com` and password `test12345`.

See `TEST_USER_CREDENTIALS.md` for a complete list of test users.

---

*Last Updated: [Current Date]*
*Version: 1.0*

