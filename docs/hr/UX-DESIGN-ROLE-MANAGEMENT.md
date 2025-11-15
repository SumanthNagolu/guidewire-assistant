# Role Management - Complete UX Design
**Module:** Role Management  
**User:** HR Manager/Admin  
**Purpose:** Configure HR roles and permissions

---

## USER JOURNEY

### Persona: HR Manager - Alice Johnson

**Scenario:** Alice needs to create a new "Payroll Specialist" role with specific permissions.

**User Flow:**
```
1. Alice logs into HR Portal → Dashboard
2. Clicks "Settings" in sidebar
3. Clicks "Roles" submenu
4. Sees list of existing roles (HR Manager, Employee, Manager, etc.)
5. Clicks "Add New Role" button (top-right)
6. Form opens with two sections: Basic Info + Permissions
7. Fills Basic Info:
   - Role Name: "Payroll Specialist"
   - Code: "PAYROLL_SPEC"
   - Description: "Responsible for payroll processing"
8. Configures Permissions (checkboxes):
   - ☑️ View All Employees
   - ☐ Edit Employees
   - ☑️ View Timesheets
   - ☑️ Approve Timesheets
   - ☑️ View Expenses
   - ☑️ Approve Expenses
   - ☑️ Process Payroll
   - ☐ Manage Roles
9. Clicks "Create Role"
10. Success message: "Role created successfully"
11. Returns to role list
12. New role appears in table
13. Can assign role to employees
```

---

## SCREEN DESIGNS

### Screen 1: Role Listing (`/hr/settings/roles`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Role Management                    [+ Add Role]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Manage HR roles and permissions                              │
│                                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐                         │
│  │   6    │  │  125   │  │   18   │                         │
│  │ Roles  │  │ Users  │  │ Perms  │                         │
│  └────────┘  └────────┘  └────────┘                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Role Name          │ Users │ Permissions  │ Status │ ⋮  ││
│  ├───────────────────────────────────────────────────────────││
│  │ 👑 HR Manager      │  5    │ Full Access  │ Active │[⋮] ││
│  │ 👔 Dept Manager    │ 15    │ Team Mgmt    │ Active │[⋮] ││
│  │ 👤 Employee        │ 98    │ Self-Service │ Active │[⋮] ││
│  │ 💰 Finance Mgr     │  3    │ Finance      │ Active │[⋮] ││
│  │ 📊 Team Lead       │  4    │ Limited      │ Active │[⋮] ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Header with back button
- "Add Role" button (top-right, primary color)
- Stats cards (Total Roles, Total Users, Total Permissions)
- Table with columns: Name, User Count, Permission Summary, Status, Actions
- Action menu (⋮) with: View, Edit, Duplicate, Deactivate

---

### Screen 2: Create Role (`/hr/settings/roles/new`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Create New Role                                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Basic Information       │  │ Quick Tips                 │ │
│  ├─────────────────────────┤  ├───────────────────────────┤ │
│  │ * Role Name:            │  │ • Use clear, descriptive  │ │
│  │   [_______________]     │  │   role names              │ │
│  │                          │  │ • Code must be unique     │ │
│  │ * Role Code:            │  │ • Start with few perms,   │ │
│  │   [_______________]     │  │   add more as needed      │ │
│  │   (e.g., PAYROLL_SPEC)  │  │                           │ │
│  │                          │  │ Permissions:              │ │
│  │   Description:          │  │ 18 available permissions  │ │
│  │   [________________     │  │ 0 selected                │ │
│  │   ________________       │  │                           │ │
│  │   ________________]      │  │ Template Roles:           │ │
│  │                          │  │ [Copy from Manager]       │ │
│  │ ✓ Role is active        │  │ [Copy from Employee]      │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                                │
│  Permission Matrix                                            │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Employee Management                                       ││
│  │ ☐ View All Employees    ☐ Create Employee               ││
│  │ ☐ Edit Employee         ☐ Delete Employee               ││
│  │                                                           ││
│  │ Leave Management                                         ││
│  │ ☐ View Team Leaves      ☐ Approve Team Leaves           ││
│  │ ☐ View All Leaves       ☐ Configure Leave Types         ││
│  │                                                           ││
│  │ Time & Attendance                                        ││
│  │ ☐ View Team Timesheets  ☐ Approve Team Timesheets       ││
│  │ ☐ View All Timesheets   ☐ Configure Shifts              ││
│  │                                                           ││
│  │ Expense Management                                       ││
│  │ ☐ View Team Expenses    ☐ Approve Team Expenses         ││
│  │ ☐ View All Expenses     ☐ Process Payments              ││
│  │                                                           ││
│  │ Payroll                                                  ││
│  │ ☐ View Payroll          ☐ Process Payroll               ││
│  │ ☐ Generate Pay Stubs                                     ││
│  │                                                           ││
│  │ Reports & Analytics                                      ││
│  │ ☐ View Team Reports     ☐ View All Reports              ││
│  │ ☐ Export Reports                                         ││
│  │                                                           ││
│  │ Settings                                                 ││
│  │ ☐ Manage Departments    ☐ Manage Roles                  ││
│  │ ☐ System Configuration                                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  [Cancel]                                 [Save Draft] [Create│
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click checkbox → Permission toggles
- Click permission name → Shows description tooltip
- Click "Template" button → Copies permissions from existing role
- As permissions selected → Right sidebar updates count

---

### Screen 3: Edit Role (`/hr/settings/roles/[id]`)

Same layout as Create, but:
- Pre-filled with current values
- Shows "Last Updated" info
- Shows "X employees have this role" warning
- Delete button (red, bottom-left) with confirmation
- "Save Changes" instead of "Create"

---

## PERMISSION CATEGORIES & DESCRIPTIONS

### Employee Management (6 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View All Employees | `view_all_employees` | See all employee records |
| View Team Employees | `view_team_employees` | See only direct reports |
| Create Employee | `create_employee` | Add new employees |
| Edit Employee | `edit_employee` | Modify employee records |
| Delete Employee | `delete_employee` | Remove/deactivate employees |
| Approve Profile Changes | `approve_profile_changes` | Approve employee updates |

### Leave Management (6 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View Team Leaves | `view_team_leaves` | See team leave requests |
| View All Leaves | `view_all_leaves` | See all company leaves |
| Approve Team Leaves | `approve_team_leaves` | Approve direct reports |
| Approve All Leaves | `approve_all_leaves` | Final HR approval |
| Configure Leave Types | `configure_leave_types` | Manage leave policies |
| Adjust Leave Balances | `adjust_leave_balances` | Modify employee balances |

### Time & Attendance (5 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View Team Timesheets | `view_team_timesheets` | See team timesheets |
| View All Timesheets | `view_all_timesheets` | See all timesheets |
| Approve Team Timesheets | `approve_team_timesheets` | Approve team hours |
| Approve All Timesheets | `approve_all_timesheets` | Final approval |
| Configure Shifts | `configure_shifts` | Manage work shifts |

### Expense Management (5 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View Team Expenses | `view_team_expenses` | See team claims |
| View All Expenses | `view_all_expenses` | See all claims |
| Approve Team Expenses | `approve_team_expenses` | Approve team claims |
| Approve All Expenses | `approve_all_expenses` | Final approval |
| Process Payments | `process_expense_payments` | Mark as paid |

### Payroll (3 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View Payroll | `view_payroll` | Access payroll data |
| Process Payroll | `process_payroll` | Run payroll processing |
| Generate Pay Stubs | `generate_pay_stubs` | Create pay stubs |

### Reports (3 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| View Team Reports | `view_team_reports` | Team analytics |
| View All Reports | `view_all_reports` | Company-wide reports |
| Export Reports | `export_reports` | Download reports |

### Administration (4 permissions)
| Permission | Code | Description |
|------------|------|-------------|
| Manage Departments | `manage_departments` | CRUD departments |
| Manage Roles | `manage_roles` | CRUD roles |
| System Configuration | `system_config` | Configure system settings |
| View Audit Log | `view_audit_log` | Access audit trail |

**Total Permissions:** 32

---

## INTERACTIONS & VALIDATIONS

### Create Role Form

**Validations:**
- Role Name: Required, 2-50 characters, unique
- Role Code: Required, uppercase, 2-20 chars, unique, no spaces
- Description: Optional, max 500 chars
- At least 1 permission must be selected

**Real-time Feedback:**
- As user types role name → Code auto-suggests
- As permissions selected → Counter updates "X/32 selected"
- If code exists → Error: "Role code already in use"
- Before save → Preview shows permission summary

**Permission Conflicts:**
- If "Approve All" selected → Auto-checks "View All"
- If "Edit" selected → Auto-checks "View"
- Hierarchical dependencies enforced

---

**NEXT:** Implement this UX design with complete code

