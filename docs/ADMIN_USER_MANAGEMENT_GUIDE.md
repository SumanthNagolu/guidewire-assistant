# Admin User Management Guide

## Overview

This guide covers how to create, manage, and configure users in the IntimeSolutions platform. As an admin, you have full control over user accounts, roles, permissions, and organizational attributes.

---

## Table of Contents

1. [Creating Users](#creating-users)
2. [Managing Roles](#managing-roles)
3. [Assigning Permissions](#assigning-permissions)
4. [Organizational Attributes](#organizational-attributes)
5. [User Lifecycle Management](#user-lifecycle-management)
6. [Best Practices](#best-practices)

---

## Creating Users

### Creating Internal Users

Internal users are employees of your organization who need system access.

#### Step-by-Step Process

1. **Navigate to User Management**
   - Go to `/admin/users`
   - Click "Add User" button

2. **Step 1: Basic Information**
   - **First Name** (required): User's first name
   - **Last Name** (required): User's last name
   - **Email** (required): Work email address (must be unique)
   - **Phone** (optional): Contact phone number
   - Click "Next"

3. **Step 2: Role & Permissions**
   - **Role** (required): Select the user's primary role
     - Available roles: Admin, Recruiter, Sales, Account Manager, Operations, HR, Employee
   - The selected role automatically grants associated permissions
   - Custom permissions can be added later
   - Click "Next"

4. **Step 3: Organizational Details**
   - **Job Title**: Official job title
   - **Employment Type**: Full-time, Part-time, Contractor, or Intern
   - **Team**: Assign to an existing team
   - **Region**: Geographic region (North America, Europe, Asia Pacific, etc.)
   - **Stream/Vertical**: Business stream (Insurance, Healthcare, Technology, etc.)
   - **Office Location**: Physical office location
   - **Reports To**: Select the user's direct manager
   - **Start Date**: Employee start date
   - **Group/Pod Name**: Informal group or pod name
   - **Cost Center**: Accounting cost center code
   - Click "Next"

5. **Step 4: Review & Create**
   - Review all entered information
   - Check "Send welcome email" to automatically send login instructions
   - Click "Create User"

#### What Happens After Creation

- User account is created with a temporary password
- If "Send welcome email" is checked:
  - User receives an email with a password reset link
  - They can set their own password on first login
- User profile is visible in the user directory
- All organizational attributes are immediately active

---

## Managing Roles

### Available Internal Roles

| Role | Description | Typical Use Case |
|------|-------------|------------------|
| **Admin** | Full system access | System administrators, C-level executives |
| **Recruiter** | Manage candidates, jobs, applications | Talent acquisition team |
| **Sales** | Manage clients, opportunities | Sales representatives |
| **Account Manager** | Manage client relationships | Customer success, account management |
| **Operations** | Manage placements, timesheets | Delivery, operations team |
| **HR** | Manage employees, leave, benefits | Human resources team |
| **Employee** | Basic self-service access | All internal employees |

### Role Permissions Matrix

#### Admin
- ✅ All permissions across all modules
- ✅ User management
- ✅ System configuration
- ✅ Audit logs

#### Recruiter
- ✅ View, create, edit, assign candidates
- ✅ View, create, edit jobs
- ✅ Manage applications and interviews
- ✅ View reports
- ✅ View users
- ❌ Create clients
- ❌ Approve timesheets

#### Sales
- ✅ View, create, edit clients
- ✅ View, create jobs
- ✅ View candidates
- ✅ View reports
- ❌ Schedule interviews
- ❌ Manage placements

#### Account Manager
- ✅ View, edit clients
- ✅ View, manage placements
- ✅ View jobs
- ✅ View reports
- ❌ Create jobs
- ❌ Approve timesheets

#### Operations
- ✅ View, create, manage placements
- ✅ View, approve timesheets
- ✅ View candidates
- ✅ View reports
- ❌ Create jobs
- ❌ Conduct interviews

#### HR
- ✅ View, edit employees
- ✅ Manage leave requests
- ✅ Manage benefits
- ✅ Conduct performance reviews
- ✅ View reports
- ❌ Manage candidates
- ❌ Manage clients

#### Employee
- ✅ View own profile
- ✅ Submit timesheets
- ✅ Request leave
- ❌ View other employees
- ❌ Access admin functions

### Changing User Roles

1. Navigate to `/admin/users`
2. Find the user and click "Edit"
3. Change the role in Step 2
4. Save changes
5. New permissions take effect immediately

---

## Assigning Permissions

### Permission Model

The platform uses a two-tier permission system:

1. **Role-Based Permissions**: Automatically assigned based on role
2. **User-Specific Overrides**: Custom permissions for individual users

### Permission Categories

- **Users**: User management functions
- **Candidates**: Candidate/applicant management
- **Clients**: Client/company management
- **Jobs**: Job posting management
- **Applications**: Application and interview management
- **Placements**: Placement and staffing management
- **Timesheets**: Timesheet management
- **Reports**: Reporting and analytics
- **HR**: Human resources functions
- **System**: System administration

### Granting Custom Permissions

1. Go to `/admin/users/[user-id]/edit`
2. Navigate to "Permissions" tab
3. Check additional permissions to grant
4. Uncheck permissions to revoke
5. Save changes

### Permission Inheritance

- Users inherit all permissions from their role
- Custom permissions override role-based permissions
- Admins always have all permissions (cannot be revoked)

---

## Organizational Attributes

### Teams

**Purpose**: Group users by functional team

**How to Use**:
- Create teams in `/admin/teams`
- Assign users to teams during creation or editing
- Teams can have hierarchies (parent teams)
- Each team has a team lead

**Examples**:
- "Recruiting Team A"
- "Sales - West Coast"
- "Operations - Healthcare"

### Regions

**Purpose**: Geographic organization

**Options**:
- North America
- Europe
- Asia Pacific
- Latin America
- Middle East
- Global

**Use Cases**:
- Regional reporting
- Territory management
- Time zone coordination

### Streams/Verticals

**Purpose**: Business line or industry focus

**Options**:
- Insurance
- Healthcare
- Financial Services
- Technology
- General

**Use Cases**:
- Specialized team routing
- Industry-specific reporting
- Resource allocation

### Reporting Relationships

**Purpose**: Org chart and management hierarchy

**How It Works**:
- Set "Reports To" field to user's direct manager
- Creates hierarchical relationships
- Used for approval workflows
- Enables org chart visualization

---

## User Lifecycle Management

### Onboarding New Employees

1. **Before Start Date**:
   - Create user account 1-2 weeks before start date
   - Set start date accurately
   - Assign to team and manager
   - Send welcome email

2. **On Start Date**:
   - Verify user can log in
   - Confirm permissions are correct
   - User completes profile setup

3. **First Week**:
   - Monitor activity in audit logs
   - Ensure proper access to required resources

### Transferring Employees

1. **Update Role** (if changing departments)
2. **Update Team Assignment**
3. **Update Manager** ("Reports To")
4. **Update Location** (if relocating)
5. **Review and Adjust Permissions**

### Offboarding Employees

1. **Deactivate User**:
   - Go to user's profile
   - Click "Deactivate User"
   - User loses all system access immediately

2. **Data Retention**:
   - User's historical data is preserved
   - Can be reactivated if needed
   - Hard delete only if required by policy

### Reactivating Users

1. Go to `/admin/users`
2. Filter by "Inactive" status
3. Select user
4. Click "Reactivate"
5. Update details as needed

---

## Best Practices

### Security

- ✅ **Use Role-Based Access**: Assign the lowest permission level needed
- ✅ **Regular Audits**: Review user access quarterly
- ✅ **Deactivate Promptly**: Deactivate users immediately upon departure
- ✅ **Strong Passwords**: Ensure temporary passwords are secure
- ❌ **Avoid Over-Permissioning**: Don't make everyone an admin

### Data Management

- ✅ **Accurate Data**: Keep organizational data up-to-date
- ✅ **Consistent Naming**: Use consistent team/group names
- ✅ **Manager Assignment**: Always assign a manager
- ✅ **Start Dates**: Set accurate start dates for reporting

### Operational Efficiency

- ✅ **Batch Creation**: Use bulk import for multiple users (coming soon)
- ✅ **Template Roles**: Stick to standard roles when possible
- ✅ **Welcome Emails**: Always send welcome emails for smooth onboarding
- ✅ **Documentation**: Document any custom permission assignments

### Compliance

- ✅ **Audit Trail**: All user changes are logged
- ✅ **Access Reviews**: Conduct regular access reviews
- ✅ **Data Privacy**: Follow data privacy regulations
- ✅ **Separation of Duties**: Maintain appropriate role separation

---

## Common Scenarios

### Scenario 1: New Sales Representative

```
Role: Sales
Team: Sales - North America
Region: North America
Stream: Insurance
Reports To: Sales Manager
Permissions: Default sales permissions
```

### Scenario 2: Senior Recruiter with Extra Access

```
Role: Recruiter
Team: Recruiting
Region: Global
Custom Permissions:
  + clients.view (to see client requirements)
  + jobs.publish (to post jobs without approval)
```

### Scenario 3: Part-Time Contractor

```
Role: Employee
Employment Type: Contractor
Team: Operations - Healthcare
Limited Access: Timesheet submission only
```

### Scenario 4: HR Manager

```
Role: HR
Team: Human Resources
Region: Global
Reports To: VP of Operations
Full HR Permissions + reports.analytics
```

---

## Troubleshooting

### User Can't Log In

1. Check if user is active
2. Verify email address is correct
3. Resend welcome email
4. Check email spam folder

### User Missing Permissions

1. Verify role is correct
2. Check custom permission overrides
3. Review audit log for recent changes
4. Re-assign role if needed

### User in Wrong Team

1. Edit user profile
2. Update team assignment
3. Changes take effect immediately

---

## Support

For additional help:
- **Technical Issues**: Contact IT support
- **Permission Questions**: Contact your admin
- **Feature Requests**: Submit via admin portal

---

*Last Updated: [Current Date]*
*Version: 1.0*

