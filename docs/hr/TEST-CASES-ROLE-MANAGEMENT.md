# Role Management - Complete Test Cases
**Module:** Role Management  
**Coverage:** 100% of UX design

---

## TEST CASE CATEGORIES

### TC-ROLE-LIST: Role Listing Page

**TC-ROLE-001: Navigate to Role Management**
- **Steps:** Dashboard → Settings → Roles
- **Expected:** `/hr/settings/roles` loads
- **Verify:** Page title "Role Management"
- **Verify:** Stats cards show correct counts
- **Verify:** Table displays all existing roles

**TC-ROLE-002: View Role Statistics**
- **Steps:** On roles page, check stats cards
- **Expected:** 
  - Total Roles card shows count (e.g., 6)
  - Total Users card shows employee count (e.g., 125)
  - Total Permissions shows 32
- **Verify:** Numbers match database

**TC-ROLE-003: Sort Roles Table**
- **Steps:** Click column headers
- **Expected:** Table sorts by that column
- **Verify:** Sort by Name (A-Z, Z-A)
- **Verify:** Sort by User Count (high-low, low-high)

**TC-ROLE-004: Search Roles**
- **Steps:** Type in search box
- **Input:** "Manager"
- **Expected:** Filters to roles containing "Manager"
- **Verify:** Shows HR Manager, Dept Manager

---

### TC-ROLE-CREATE: Create New Role

**TC-ROLE-005: Open Create Form**
- **Steps:** Click "Add New Role" button
- **Expected:** Navigate to `/hr/settings/roles/new`
- **Verify:** Form loads with Basic Info and Permissions sections
- **Verify:** All 32 permissions listed

**TC-ROLE-006: Auto-Generate Code**
- **Steps:** Type role name "Payroll Specialist"
- **Expected:** Code auto-fills "PAYROLL_SPEC"
- **Verify:** Code updates as name types
- **Verify:** Removes spaces, converts uppercase

**TC-ROLE-007: Fill Basic Information**
- **Input:**
  - Name: "Payroll Specialist"
  - Code: "PAYROLL_SPEC"  
  - Description: "Manages payroll processing"
  - Active: ✓ checked
- **Expected:** All fields accept input
- **Verify:** Character counters work
- **Verify:** Validation messages for invalid input

**TC-ROLE-008: Select Permissions - Individual**
- **Steps:** Click checkbox for "View Payroll"
- **Expected:** Checkbox checked
- **Verify:** Counter updates "1/32 selected"
- **Verify:** Permission highlighted in list

**TC-ROLE-009: Select Permissions - Hierarchical**
- **Steps:** Check "Approve All Timesheets"
- **Expected:** Auto-checks dependent "View All Timesheets"
- **Verify:** Both checkboxes checked
- **Verify:** Counter shows 2 selected
- **Verify:** Tooltip explains dependency

**TC-ROLE-010: Use Permission Template**
- **Steps:** Click "Copy from Employee" button
- **Expected:** Copies all permissions from Employee role
- **Verify:** All Employee permissions now checked
- **Verify:** Counter updates to show Employee's permission count

**TC-ROLE-011: Save New Role**
- **Steps:** Fill all required fields, select 5 permissions, click "Create Role"
- **Expected:** Success message "Role created successfully"
- **Verify:** Redirect to roles list
- **Verify:** New role appears in table
- **Verify:** Database record created

**TC-ROLE-012: Validation - Duplicate Code**
- **Steps:** Create role with code "EMPLOYEE" (existing)
- **Expected:** Error: "Role code already exists"
- **Verify:** Form doesn't submit
- **Verify:** Code field highlighted red

**TC-ROLE-013: Validation - Missing Required**
- **Steps:** Leave name blank, click Create
- **Expected:** Error: "Role name is required"
- **Verify:** Form validation prevents submit

**TC-ROLE-014: Validation - No Permissions**
- **Steps:** Fill name/code, select 0 permissions, click Create
- **Expected:** Error: "Please select at least one permission"
- **Verify:** Cannot create role with no permissions

**TC-ROLE-015: Save as Draft**
- **Steps:** Fill partial info, click "Save as Draft"
- **Expected:** Role saved with status "Draft"
- **Verify:** Can edit and activate later

---

### TC-ROLE-EDIT: Edit Existing Role

**TC-ROLE-016: Open Edit Form**
- **Steps:** On role list, click ⋮ → Edit on "Employee" role
- **Expected:** Navigate to `/hr/settings/roles/[id]`
- **Verify:** Form pre-filled with current values
- **Verify:** All existing permissions checked

**TC-ROLE-017: Update Role Name**
- **Steps:** Change name from "Employee" to "Team Member"
- **Expected:** Name updates
- **Verify:** Code optionally updates or stays same
- **Verify:** Save button enabled

**TC-ROLE-018: Add Permission to Role**
- **Steps:** Check "Export Reports" (wasn't checked before)
- **Expected:** Permission added
- **Verify:** Counter increments
- **Verify:** Can save

**TC-ROLE-019: Remove Permission from Role**
- **Steps:** Uncheck "View Team Reports"
- **Expected:** Permission removed
- **Verify:** Counter decrements
- **Verify:** If employees have role, warning shown

**TC-ROLE-020: Save Changes**
- **Steps:** Modify role, click "Save Changes"
- **Expected:** Success message
- **Verify:** Role list shows updated info
- **Verify:** Database updated
- **Verify:** Audit log entry created

**TC-ROLE-021: Warning - Role In Use**
- **Steps:** Try to remove permission from role with 50 users
- **Expected:** Warning: "50 employees will be affected"
- **Verify:** Requires confirmation to proceed

---

### TC-ROLE-DELETE: Delete Role

**TC-ROLE-022: Delete Unused Role**
- **Steps:** On role list, click ⋮ → Delete on role with 0 users
- **Expected:** Confirmation dialog appears
- **Verify:** Dialog shows "This action cannot be undone"
- **Verify:** Shows "0 employees affected"

**TC-ROLE-023: Confirm Delete**
- **Steps:** In delete dialog, click "Delete"
- **Expected:** Role deleted
- **Verify:** Success message
- **Verify:** Role removed from list
- **Verify:** Database record deleted

**TC-ROLE-024: Cannot Delete Role In Use**
- **Steps:** Try to delete role with active users
- **Expected:** Error: "Cannot delete role with X active users"
- **Verify:** Delete button disabled
- **Verify:** Must reassign users first

**TC-ROLE-025: Deactivate Instead of Delete**
- **Steps:** Click Deactivate on role with users
- **Expected:** Role status → Inactive
- **Verify:** Users keep role but it's marked inactive
- **Verify:** Cannot assign inactive role to new users

---

### TC-ROLE-ASSIGN: Assign Role to Employee

**TC-ROLE-026: Assign from Employee Edit**
- **Steps:** Edit employee → Change role dropdown
- **Expected:** List shows all active roles
- **Verify:** Can select different role
- **Verify:** Permissions update when saved

**TC-ROLE-027: Bulk Role Assignment**
- **Steps:** Select 5 employees, click "Assign Role"
- **Expected:** Modal shows role selection
- **Verify:** Can assign same role to multiple users
- **Verify:** Confirmation required
- **Verify:** All employees updated

---

### TC-ROLE-PERMISSIONS: Permission System

**TC-ROLE-028: Permission Takes Effect Immediately**
- **Steps:** 
  1. User has Employee role (no payroll access)
  2. Admin adds "View Payroll" to Employee role
  3. User refreshes page
- **Expected:** Payroll menu item now visible
- **Verify:** User can access payroll pages
- **Verify:** No logout/login required

**TC-ROLE-029: Revoked Permission Blocks Access**
- **Steps:**
  1. User has role with "Edit Employee"
  2. Admin removes permission
  3. User tries to edit employee
- **Expected:** Access denied
- **Verify:** Edit button not visible OR shows error if accessed
- **Verify:** Immediate effect

---

## TEST DATA REQUIRED

### Existing Roles (from test-data-setup.sql)
1. HR Manager (role-001) - Full access - 5 users
2. Department Manager (role-002) - Team management - 15 users
3. Team Lead (role-003) - Limited - 4 users
4. Employee (role-004) - Self-service - 98 users
5. Finance Manager (role-005) - Finance + Payroll - 3 users
6. Executive (role-006) - View-only - 2 users

### New Role to Create (Testing)
- Name: "Payroll Specialist"
- Code: "PAYROLL_SPEC"
- Permissions: View Payroll, Process Payroll, View Timesheets, View Employees

---

## ACCEPTANCE CRITERIA

All test cases must PASS before marking Role Management as complete:
- [ ] All 29 test cases executed
- [ ] All navigation works
- [ ] All forms validate correctly
- [ ] All buttons perform expected actions
- [ ] Database updates correctly
- [ ] Permissions enforce correctly
- [ ] No console errors
- [ ] Responsive on mobile/tablet
- [ ] Accessibility compliant

---

**NEXT:** Build implementation to pass all these test cases

