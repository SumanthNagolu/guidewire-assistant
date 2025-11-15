# HR Manager Workflow - Complete Employee Management System

> **User Type:** HR Manager  
> **Primary Goal:** Manage all HR operations including employees, attendance, leave, expenses, payroll, and performance  
> **Test User:** `hr.manager@intimeesolutions.com` | Password: `test12345`  
> **Portal:** `/hr/dashboard`

---

## 📋 Table of Contents

1. [User Profile & Context](#user-profile--context)
2. [Primary Goals](#primary-goals)
3. [Feature Access](#feature-access)
4. [Complete User Journey](#complete-user-journey)
5. [Detailed Use Cases](#detailed-use-cases)
6. [Daily Workflow](#daily-workflow)
7. [Test Scenarios](#test-scenarios)
8. [Test Credentials](#test-credentials)
9. [Known Issues & Tips](#known-issues--tips)

---

## 👤 User Profile & Context

### Who is an HR Manager?

An **HR Manager** is responsible for managing all human resources operations within IntimeSolutions. They oversee employee lifecycle, attendance, leave management, expense processing, payroll, performance reviews, and organizational structure.

**Key Responsibilities:**
- Employee onboarding and offboarding
- Attendance and timesheet management
- Leave request approvals
- Expense claim processing
- Payroll administration
- Performance review coordination
- Department and role management
- HR analytics and reporting
- Document generation (offer letters, certificates, etc.)

**Key Characteristics:**
- Full HR system access
- Can approve/reject leave, expenses, timesheets
- Can create and manage employees
- Access to all HR reports and analytics
- Can generate HR documents
- Manages organizational structure

---

## 🎯 Primary Goals

1. **Employee Management** - Onboard, manage, and maintain employee records
2. **Attendance Tracking** - Monitor and approve timesheets and attendance
3. **Leave Management** - Process leave requests and manage leave balances
4. **Expense Processing** - Review and approve expense claims
5. **Payroll Administration** - Process payroll and manage paystubs
6. **Performance Management** - Coordinate performance reviews
7. **Organizational Management** - Manage departments, roles, and structure
8. **Reporting & Analytics** - Generate HR reports and insights
9. **Document Generation** - Create employment letters and certificates
10. **Compliance** - Ensure HR compliance and maintain records

---

## 🔓 Feature Access

### ✅ Available Features

| Feature Category | Features | Access Level |
|-----------------|----------|--------------|
| **Dashboard** | Overview stats, pending approvals, quick actions | Full Access |
| **Employee Management** | CRUD operations, import/export, profiles | Full Access |
| **Attendance & Timesheets** | Clock in/out, timesheet approval, reports | Full Access |
| **Leave Management** | Request approval, balance management, calendar | Full Access |
| **Expense Management** | Claim approval, payment tracking, reports | Full Access |
| **Payroll** | Payroll runs, paystub generation, settings | Full Access |
| **Performance** | Review coordination, evaluations, tracking | Full Access |
| **Recruitment** | Job posting, application tracking | Full Access |
| **Training** | Training program management | Full Access |
| **Documents** | Generate letters, certificates, templates | Full Access |
| **Reports & Analytics** | HR analytics, custom reports | Full Access |
| **Settings** | Departments, roles, permissions, configurations | Full Access |
| **Self-Service** | Personal profile, own requests | Self Only |

### ❌ Restricted Features

- ❌ Admin Panel (Platform administration)
- ❌ ATS/CRM (Recruiting and sales systems)
- ❌ Academy Management (Training content)
- ❌ System Configuration (Platform settings)

---

## 🗺️ Complete User Journey

### Overview: Login → Daily Operations (End-to-End)

```
1. Login to HR Portal
   ↓
2. View Dashboard (Stats, Pending Approvals)
   ↓
3. Process Pending Items (Leave, Expenses, Timesheets)
   ↓
4. Employee Management (Add/Edit/View)
   ↓
5. Generate Reports & Analytics
   ↓
6. Document Generation (Letters, Certificates)
   ↓
7. Organizational Management (Departments, Roles)
```

---

## 📝 Detailed Use Cases

### Use Case 1: Daily Dashboard Review

**Goal:** Get overview of HR operations and pending items

**Steps:**
1. Navigate to `/hr/dashboard`
2. View dashboard statistics:
   - Total Employees
   - Active Leave Requests
   - Pending Expenses
   - Today's Attendance
3. Review Pending Approvals widget
4. Check Upcoming Events (birthdays, anniversaries)
5. View Recent Activities feed

**Expected Result:** Complete overview of HR status at a glance

---

### Use Case 2: Employee Onboarding

**Goal:** Add a new employee to the system

**Steps:**
1. Navigate to `/hr/employees/new`
2. Fill in employee details:
   - Personal Information (Name, Email, Phone, DOB)
   - Employment Details (Employee ID, Designation, Department, Employment Type)
   - Reporting Manager
   - Hire Date
   - Salary Information
   - Bank Details (optional)
3. Upload documents (Resume, Contract, etc.)
4. Assign HR Role (HR Manager, Manager, Employee)
5. Set permissions
6. Submit form

**Expected Result:** New employee created with profile and access

**Post-Actions:**
- Employee receives login credentials
- Leave balances initialized
- Employee appears in directory
- Welcome email sent (if configured)

---

### Use Case 3: Approve Leave Request

**Goal:** Review and approve/reject employee leave request

**Steps:**
1. Navigate to `/hr/leave/requests`
2. View pending leave requests (filtered by status)
3. Click on a request to view details:
   - Employee name and details
   - Leave type (Annual, Sick, Personal, etc.)
   - Start and end dates
   - Total days
   - Reason/notes
   - Current leave balance
4. Review leave balance availability
5. Approve or Reject:
   - **Approve:** Click "Approve" button
   - **Reject:** Click "Reject", enter reason, confirm
6. System automatically updates leave balance (if approved)

**Expected Result:** Leave request processed, balance updated, employee notified

**Business Rules:**
- Cannot approve if insufficient balance
- Must provide rejection reason
- Balance deducted automatically on approval

---

### Use Case 4: Process Expense Claim

**Goal:** Review and approve employee expense claim

**Steps:**
1. Navigate to `/hr/expenses/claims`
2. View submitted expense claims (filter by status)
3. Click on a claim to view details:
   - Employee information
   - Expense items with amounts
   - Receipts (if uploaded)
   - Total amount
   - Submission date
4. Review receipts and verify amounts
5. Approve or Reject:
   - **Approve:** Click "Approve", set payment status
   - **Reject:** Click "Reject", enter reason
6. If approved, mark for payment processing

**Expected Result:** Expense claim processed, payment tracked, employee notified

---

### Use Case 5: Approve Timesheet

**Goal:** Review and approve employee timesheet

**Steps:**
1. Navigate to `/hr/timesheets`
2. View timesheet calendar or table view
3. Filter by employee, date range, or status
4. Click on a timesheet to view details:
   - Clock in/out times
   - Total hours worked
   - Break duration
   - Overtime hours
   - Status (Draft, Submitted, Approved)
5. Verify hours and attendance
6. Approve or Request Changes:
   - **Approve:** Click "Approve"
   - **Request Changes:** Add comments, return to employee

**Expected Result:** Timesheet approved, hours recorded, payroll ready

---

### Use Case 6: Generate Employment Document

**Goal:** Create employment confirmation letter or certificate

**Steps:**
1. Navigate to `/hr/documents/generate`
2. Select document type:
   - Employment Confirmation Letter
   - Experience Certificate
   - Salary Certificate
   - Offer Letter
3. Select employee from dropdown
4. Fill in additional details (if required)
5. Preview document
6. Generate PDF
7. Download or email to employee

**Expected Result:** Professional document generated and delivered

---

### Use Case 7: View HR Analytics

**Goal:** Analyze HR metrics and trends

**Steps:**
1. Navigate to `/hr/reports/analytics`
2. Select date range (default: current month)
3. View key metrics:
   - Employee distribution by department
   - Employment type breakdown
   - Attendance trends
   - Leave utilization rates
   - Expense trends
   - Turnover metrics
4. Filter by department, date range, or other criteria
5. Export reports (if available)

**Expected Result:** Comprehensive HR insights and trends

---

### Use Case 8: Manage Departments

**Goal:** Add or edit organizational departments

**Steps:**
1. Navigate to `/hr/settings/departments`
2. View list of existing departments
3. **Add New:**
   - Click "Add Department"
   - Enter department name, code, description
   - Assign department head (optional)
   - Set budget (optional)
   - Save
4. **Edit Existing:**
   - Click on department
   - Update details
   - Save changes

**Expected Result:** Department structure updated

---

### Use Case 9: Manage HR Roles & Permissions

**Goal:** Configure role-based access control

**Steps:**
1. Navigate to `/hr/settings/roles`
2. View existing roles (HR Manager, Manager, Employee)
3. **Create New Role:**
   - Click "Add Role"
   - Enter role name and description
   - Configure permissions:
     - Employees (view, create, edit, delete)
     - Timesheets (view, create, edit, approve)
     - Leaves (view, create, edit, approve)
     - Expenses (view, create, edit, approve)
     - Reports (view, export)
     - Settings (view, edit)
   - Save role
4. **Edit Role:** Click on role, modify permissions, save

**Expected Result:** Role permissions configured

---

### Use Case 10: Process Payroll

**Goal:** Run payroll for employees

**Steps:**
1. Navigate to `/hr/payroll`
2. View payroll runs history
3. **Create New Payroll Run:**
   - Click "New Payroll Run"
   - Select pay period (month, date range)
   - Select employees (all or filtered)
   - Review timesheet hours
   - Calculate salaries (base + overtime - deductions)
   - Review payroll summary
   - Generate paystubs
   - Process payroll
4. View individual paystubs at `/hr/payroll/[id]`

**Expected Result:** Payroll processed, paystubs generated

---

## 🌅 Daily Workflow

### Morning Routine (9:00 AM - 10:00 AM)

1. **Login** → `/hr/login`
2. **Dashboard Review** → Check pending approvals
3. **Priority Items:**
   - Urgent leave requests
   - Expense claims requiring immediate attention
   - Timesheet approvals for payroll

### Mid-Morning (10:00 AM - 12:00 PM)

4. **Employee Management:**
   - Process new employee onboarding
   - Update employee records
   - Handle employee queries

5. **Leave Management:**
   - Review and approve/reject leave requests
   - Check leave balances
   - Update leave calendar

### Afternoon (1:00 PM - 3:00 PM)

6. **Expense Processing:**
   - Review expense claims
   - Verify receipts
   - Approve/reject claims

7. **Timesheet Management:**
   - Review submitted timesheets
   - Approve timesheets
   - Resolve discrepancies

### Late Afternoon (3:00 PM - 5:00 PM)

8. **Document Generation:**
   - Generate employment letters
   - Create certificates
   - Handle document requests

9. **Reporting & Analytics:**
   - Review HR metrics
   - Generate reports
   - Analyze trends

10. **Organizational Management:**
    - Update departments
    - Manage roles
    - Configure settings

### End of Day (5:00 PM)

11. **Final Review:**
    - Check pending items
    - Plan for next day
    - Logout

---

## 🧪 Test Scenarios

### Scenario 1: Complete Employee Onboarding Flow

**Test Steps:**
1. Login as HR Manager
2. Navigate to Add Employee
3. Fill all required fields
4. Submit form
5. Verify employee appears in list
6. Verify employee can login
7. Verify leave balances initialized

**Expected:** Employee successfully onboarded with all systems configured

---

### Scenario 2: Leave Approval Workflow

**Test Steps:**
1. Login as HR Manager
2. Navigate to Leave Requests
3. View pending request
4. Check employee leave balance
5. Approve request
6. Verify balance deducted
7. Verify status updated
8. Check notification sent (if configured)

**Expected:** Leave approved, balance updated, employee notified

---

### Scenario 3: Expense Claim Processing

**Test Steps:**
1. Login as HR Manager
2. Navigate to Expense Claims
3. View submitted claim
4. Review receipts
5. Verify amounts
6. Approve claim
7. Mark for payment
8. Verify status updated

**Expected:** Expense approved and ready for payment

---

### Scenario 4: Timesheet Approval

**Test Steps:**
1. Login as HR Manager
2. Navigate to Timesheets
3. Filter by "Submitted" status
4. Review timesheet details
5. Verify hours and attendance
6. Approve timesheet
7. Verify status updated
8. Check payroll integration

**Expected:** Timesheet approved and included in payroll

---

### Scenario 5: Document Generation

**Test Steps:**
1. Login as HR Manager
2. Navigate to Document Generation
3. Select document type
4. Select employee
5. Fill required details
6. Preview document
7. Generate PDF
8. Download document

**Expected:** Professional document generated successfully

---

### Scenario 6: HR Analytics Review

**Test Steps:**
1. Login as HR Manager
2. Navigate to HR Analytics
3. Select date range
4. View all metrics
5. Filter by department
6. Export report (if available)

**Expected:** Comprehensive analytics displayed

---

### Scenario 7: Department Management

**Test Steps:**
1. Login as HR Manager
2. Navigate to Departments
3. Add new department
4. Edit existing department
5. Verify changes reflected
6. Check employee assignments

**Expected:** Department structure updated correctly

---

### Scenario 8: Role & Permission Configuration

**Test Steps:**
1. Login as HR Manager
2. Navigate to Roles
3. Create new role
4. Configure permissions
5. Assign role to employee
6. Verify access control works

**Expected:** Role created and permissions enforced

---

## 🔐 Test Credentials

### HR Manager Test User

```
Email: hr.manager@intimeesolutions.com
Password: test12345
Role: HR Manager
Permissions: Full HR access
```

### Demo Credentials (from HR-SYSTEM-README.md)

```
Email: demo@intimesolutions.com
Password: demo123456
```

### Creating Test Users

**Via Database:**
```sql
-- Create auth user first (via Supabase Auth)
-- Then create employee record:
INSERT INTO employees (
  user_id, employee_id, first_name, last_name, 
  email, designation, employment_type, employment_status, 
  hire_date, role_id
) VALUES (
  'user_uuid_from_auth',
  'EMP2025001',
  'HR',
  'Manager',
  'hr.manager@intimeesolutions.com',
  'HR Manager',
  'Full-time',
  'Active',
  CURRENT_DATE,
  (SELECT id FROM hr_roles WHERE name = 'HR Manager')
);
```

---

## 🐛 Known Issues & Tips

### Common Issues

1. **Leave Balance Not Updating**
   - **Issue:** Balance not deducted after approval
   - **Solution:** Check database function `update_leave_balance` is working
   - **Workaround:** Manually update balance if needed

2. **Timesheet Approval Not Reflecting**
   - **Issue:** Status not updating after approval
   - **Solution:** Refresh page, check database directly
   - **Workaround:** Clear cache and retry

3. **Document Generation Fails**
   - **Issue:** PDF not generating
   - **Solution:** Check template variables match employee data
   - **Workaround:** Use different template or manual generation

4. **Permission Issues**
   - **Issue:** Cannot access certain features
   - **Solution:** Verify role permissions in database
   - **Workaround:** Check `hr_roles.permissions` JSON structure

### Tips & Best Practices

1. **Daily Approvals:** Process approvals daily to avoid backlog
2. **Leave Balance:** Always check balance before approving leave
3. **Expense Receipts:** Verify receipts match claim amounts
4. **Timesheet Accuracy:** Cross-check timesheets with attendance records
5. **Document Templates:** Keep templates updated with latest company info
6. **Backup Data:** Regular exports of employee data recommended
7. **Audit Trail:** All actions are logged in `hr_audit_log` table

---

## 📊 Key Routes Reference

| Route | Purpose | Access Level |
|-------|---------|--------------|
| `/hr/login` | HR Portal Login | Public |
| `/hr/dashboard` | Main Dashboard | HR Manager |
| `/hr/employees` | Employee List | HR Manager |
| `/hr/employees/new` | Add Employee | HR Manager |
| `/hr/employees/[id]` | Employee Profile | HR Manager |
| `/hr/employees/[id]/edit` | Edit Employee | HR Manager |
| `/hr/timesheets` | Timesheet Management | HR Manager |
| `/hr/timesheets/clock` | Clock In/Out | All Employees |
| `/hr/leave/requests` | Leave Requests | HR Manager |
| `/hr/leave/apply` | Apply for Leave | All Employees |
| `/hr/expenses/claims` | Expense Claims | HR Manager |
| `/hr/expenses/new` | Submit Expense | All Employees |
| `/hr/payroll` | Payroll Management | HR Manager |
| `/hr/payroll/new` | Create Payroll Run | HR Manager |
| `/hr/performance` | Performance Reviews | HR Manager |
| `/hr/documents/generate` | Generate Documents | HR Manager |
| `/hr/reports/analytics` | HR Analytics | HR Manager |
| `/hr/settings/departments` | Department Management | HR Manager |
| `/hr/settings/roles` | Role Management | HR Manager |
| `/hr/self-service` | Employee Self-Service | All Employees |

---

## 🔗 Integration Points

### With Other Systems

1. **Authentication:** Uses Supabase Auth (shared with platform)
2. **Payroll:** Integrates with timesheet data
3. **Notifications:** Email notifications (if configured)
4. **Storage:** Document storage via Supabase Storage
5. **Analytics:** HR metrics feed into admin dashboard

### Database Tables Used

- `employees` - Employee master data
- `departments` - Department structure
- `hr_roles` - Role definitions
- `timesheets` - Time tracking
- `attendance` - Daily attendance
- `leave_requests` - Leave applications
- `leave_balances` - Leave balances
- `expense_claims` - Expense submissions
- `expense_items` - Expense line items
- `payroll_runs` - Payroll processing
- `performance_reviews` - Performance data
- `document_templates` - Document templates
- `generated_documents` - Generated documents
- `hr_audit_log` - Audit trail

---

## 📈 Success Metrics

### Key Performance Indicators

1. **Approval Turnaround Time:** < 24 hours for leave/expense approvals
2. **Employee Onboarding Time:** < 1 day from hire to system access
3. **Payroll Accuracy:** 100% accuracy in payroll processing
4. **Document Generation:** < 5 minutes per document
5. **System Uptime:** 99.9% availability

---

## 🚀 Future Enhancements

### Planned Features

- [ ] Mobile app for HR operations
- [ ] Advanced analytics with AI insights
- [ ] Automated workflow approvals
- [ ] Integration with external payroll systems
- [ ] Employee self-service mobile app
- [ ] Slack/Teams notifications
- [ ] Advanced reporting with custom queries
- [ ] Bulk operations (bulk leave approval, etc.)

---

**Last Updated:** November 13, 2025  
**Documentation Version:** 1.0  
**System Version:** HR Management System v1.0

