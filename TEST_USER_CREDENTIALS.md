# 🧪 Test User Credentials & Testing Guide

## Overview

This document contains all test user credentials and comprehensive testing scenarios for the IntimeSolutions platform.

**All users use:**
- Domain: `@intimeesolutions.com`
- Password: `test12345`

---

## 🔐 Test Users by Role

### 👑 ADMIN (2 users)

Full system access, user management, all data access, audit logs.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `admin@intimeesolutions.com` | System Administrator | +1-555-0100 | Administration | Primary admin testing |
| `admin.john@intimeesolutions.com` | John Admin | +1-555-0101 | Administration | Secondary admin, permission testing |

**Test Scenarios:**
- ✅ Full CRUD on all entities
- ✅ User role management
- ✅ View audit logs
- ✅ System configuration
- ✅ Override any permissions
- ✅ Delete/restore records

---

### 🎯 RECRUITER (5 users)

ATS-focused: candidates, jobs, applications, interviews.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `recruiter.sarah@intimeesolutions.com` | Sarah Johnson | +1-555-0200 | Recruiting | Senior recruiter with multiple candidates |
| `recruiter.mike@intimeesolutions.com` | Mike Chen | +1-555-0201 | Recruiting | Specialized in tech roles |
| `recruiter.senior@intimeesolutions.com` | Senior Recruiter | +1-555-0202 | Recruiting | Leadership/management testing |
| `recruiter.junior@intimeesolutions.com` | Junior Recruiter | +1-555-0203 | Recruiting | Entry-level, has manager assigned |
| `manager.team@intimeesolutions.com` | Team Manager | +1-555-0800 | Recruiting | Manager of junior recruiter |

**Test Scenarios:**
- ✅ Create/manage candidates
- ✅ Create/manage jobs
- ✅ Track applications
- ✅ Schedule interviews
- ✅ Submit candidates to clients
- ✅ View own candidates vs. all candidates
- ✅ Manager-employee hierarchy
- ❌ Cannot create clients
- ❌ Cannot approve timesheets
- ❌ Cannot change user roles

---

### 💼 SALES (3 users)

CRM-focused: leads, opportunities, clients.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `sales.david@intimeesolutions.com` | David Martinez | +1-555-0300 | Sales | Enterprise sales rep |
| `sales.lisa@intimeesolutions.com` | Lisa Anderson | +1-555-0301 | Sales | SMB-focused sales |
| `sales.rep@intimeesolutions.com` | Sales Representative | +1-555-0302 | Sales | Generic sales rep |

**Test Scenarios:**
- ✅ Create/manage clients
- ✅ Create/manage opportunities
- ✅ Track sales pipeline
- ✅ Create jobs for clients
- ✅ View candidate submissions
- ❌ Cannot manage candidates directly
- ❌ Cannot approve timesheets
- ❌ Cannot change application stages

---

### 🤝 ACCOUNT MANAGER (3 users)

Client relationship management, placement oversight.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `accountmgr.jennifer@intimeesolutions.com` | Jennifer Wilson | +1-555-0400 | Account Management | Manages top-tier clients |
| `accountmgr.robert@intimeesolutions.com` | Robert Taylor | +1-555-0401 | Account Management | Mid-tier client focus |
| `accountmgr.senior@intimeesolutions.com` | Senior Account Manager | +1-555-0402 | Account Management | Senior AM, escalations |

**Test Scenarios:**
- ✅ Manage assigned clients
- ✅ View placements for their clients
- ✅ Approve timesheets
- ✅ Track client satisfaction
- ✅ View opportunities
- ✅ Manage contracts
- ❌ Cannot create candidates
- ❌ Cannot schedule interviews
- ❌ Cannot create jobs directly

---

### ⚙️ OPERATIONS (3 users)

Placement management, timesheets, contracts, compliance.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `operations.maria@intimeesolutions.com` | Maria Garcia | +1-555-0500 | Operations | Timesheet & invoice management |
| `operations.james@intimeesolutions.com` | James Brown | +1-555-0501 | Operations | Contract & compliance focus |
| `operations.coordinator@intimeesolutions.com` | Operations Coordinator | +1-555-0502 | Operations | General operations |

**Test Scenarios:**
- ✅ View all placements
- ✅ Approve/reject timesheets
- ✅ Manage contracts
- ✅ View all candidates (read-only)
- ✅ Track compliance
- ✅ Generate invoices
- ❌ Cannot create candidates
- ❌ Cannot create jobs
- ❌ Cannot manage clients directly

---

### 👤 EMPLOYEE (3 users)

Basic employee functions, self-service.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `employee.john@intimeesolutions.com` | John Employee | +1-555-0600 | General | Has manager assigned |
| `employee.jane@intimeesolutions.com` | Jane Employee | +1-555-0601 | General | No manager |
| `employee.consultant@intimeesolutions.com` | Consultant Employee | +1-555-0602 | General | Placed consultant role |

**Test Scenarios:**
- ✅ View own profile
- ✅ Update own information
- ✅ View assigned tasks
- ✅ Submit timesheets (if placed)
- ❌ Cannot view other employees
- ❌ Cannot access ATS/CRM
- ❌ Cannot view system data

---

### 🎓 STUDENT (4 users)

Training platform only.

| Email | Full Name | Phone | Department | Use Case |
|-------|-----------|-------|------------|----------|
| `student.amy@intimeesolutions.com` | Amy Student | +1-555-0700 | Academy | General student |
| `student.bob@intimeesolutions.com` | Bob Student | +1-555-0701 | Academy | General student |
| `student.beginner@intimeesolutions.com` | Beginner Student | +1-555-0702 | Academy | New to platform |
| `student.advanced@intimeesolutions.com` | Advanced Student | +1-555-0703 | Academy | Advanced courses |

**Test Scenarios:**
- ✅ Access academy/training only
- ✅ Enroll in courses
- ✅ Track progress
- ✅ Complete assignments
- ❌ No access to ATS/CRM
- ❌ No access to internal systems
- ❌ Only training portal visible

---

### 🔬 SPECIAL SCENARIO USERS (2 users)

Edge cases and special testing scenarios.

| Email | Full Name | Status | Use Case |
|-------|-----------|--------|----------|
| `inactive.user@intimeesolutions.com` | Inactive User | `is_active: false` | Test inactive account handling |
| `pending.user@intimeesolutions.com` | Pending User | Email not confirmed | Test pending activation flow |

**Test Scenarios:**
- ✅ Inactive user cannot login
- ✅ Pending user needs email confirmation
- ✅ Re-activation workflow
- ✅ Email verification process

---

## 🔄 Manager-Employee Relationships

Testing hierarchical relationships:

```
manager.team@intimeesolutions.com (Team Manager)
  ├── recruiter.junior@intimeesolutions.com (Junior Recruiter)
  └── employee.john@intimeesolutions.com (Employee)
```

**Test Scenarios:**
- ✅ Manager can view team members
- ✅ Manager can assign tasks
- ✅ Employee sees manager info
- ✅ Hierarchical reporting

---

## 📋 Comprehensive Testing Checklist

### Authentication Tests

- [ ] Login with each role
- [ ] Password reset flow
- [ ] Email verification
- [ ] Inactive account blocked
- [ ] Session timeout
- [ ] Multi-device login

### Authorization Tests

#### Admin
- [ ] Access all modules
- [ ] Manage users and roles
- [ ] View audit logs
- [ ] System configuration
- [ ] Override permissions

#### Recruiter
- [ ] Create candidates
- [ ] Create jobs
- [ ] Manage applications
- [ ] Schedule interviews
- [ ] View own vs. all data
- [ ] Cannot access client creation
- [ ] Cannot approve timesheets

#### Sales
- [ ] Create clients
- [ ] Manage opportunities
- [ ] Track pipeline
- [ ] Cannot manage candidates
- [ ] Cannot schedule interviews

#### Account Manager
- [ ] View assigned clients
- [ ] Approve timesheets
- [ ] Manage placements
- [ ] Cannot create jobs
- [ ] Cannot manage candidates

#### Operations
- [ ] View all placements
- [ ] Approve timesheets
- [ ] Manage contracts
- [ ] Cannot create candidates
- [ ] Cannot create jobs

#### Employee
- [ ] View own profile
- [ ] Submit timesheets (if placed)
- [ ] Cannot access ATS/CRM
- [ ] Cannot view other users

#### Student
- [ ] Access academy only
- [ ] No access to internal systems

### Data Ownership Tests

- [ ] Users can edit own records
- [ ] Users cannot edit others' records (except admin)
- [ ] Managers can view team data
- [ ] Cross-role data visibility rules
- [ ] Soft delete vs. hard delete

### Integration Tests

- [ ] Candidate → Application → Job → Client flow
- [ ] Application → Interview → Placement flow
- [ ] Client → Opportunity → Job flow
- [ ] Placement → Timesheet → Invoice flow
- [ ] Activity tracking across modules

---

## 🚀 Quick Start Testing

### 1. Run the SQL Script

```bash
# Using psql
psql -h your-supabase-host -U postgres -d postgres -f database/seed-test-users.sql

# Or in Supabase SQL Editor
# Copy and paste the entire seed-test-users.sql file
```

### 2. Verify Users Created

```sql
SELECT 
  role,
  COUNT(*) as user_count,
  STRING_AGG(email, ', ' ORDER BY email) as emails
FROM user_profiles
WHERE email LIKE '%@intimeesolutions.com'
GROUP BY role
ORDER BY role;
```

### 3. Test Login

Visit your application and try logging in with any user:
- Email: `[role].username@intimeesolutions.com`
- Password: `test12345`

### 4. Recommended Testing Order

1. **Admin** - Verify full access
2. **Recruiter** - Test ATS flow
3. **Sales** - Test CRM flow
4. **Account Manager** - Test client management
5. **Operations** - Test operational processes
6. **Employee** - Test limited access
7. **Student** - Test academy isolation

---

## 📊 Test Data Recommendations

After loading test users, consider adding:

### Sample Candidates (for Recruiters)
- 10-20 candidates with various skills
- Different experience levels
- Various availabilities

### Sample Clients (for Sales)
- 5-10 clients
- Different industries
- Various stages (prospect, active, inactive)

### Sample Jobs (for Recruiters)
- 5-10 open positions
- Link to sample clients
- Various priorities

### Sample Applications
- Link candidates to jobs
- Various pipeline stages
- Test data for interviews

### Sample Placements
- Active placements
- Link to candidates, jobs, clients
- Test timesheet scenarios

---

## 🐛 Known Testing Scenarios

### Edge Cases to Test

1. **Concurrent Access**
   - Multiple users editing same record
   - Real-time updates

2. **Permission Boundaries**
   - Cross-role data access
   - Ownership changes
   - Role transitions

3. **Data Relationships**
   - Cascading deletes
   - Orphaned records
   - Constraint violations

4. **Performance**
   - Large datasets
   - Complex queries
   - Report generation

---

## 📝 Notes

- All users are created with confirmed emails (except `pending.user@intimeesolutions.com`)
- All users are active (except `inactive.user@intimeesolutions.com`)
- Phone numbers are in sequence for easy identification
- Manager relationships are pre-configured for hierarchy testing
- Use these credentials for automated testing as well

---

## 🔒 Security Notes

⚠️ **IMPORTANT:** These are test credentials for development/staging environments only.

- **NEVER** use these in production
- Change default password after initial setup
- Delete all test users before going live
- Use separate test database
- Enable audit logging during testing

---

## 📞 Support

If you encounter issues with test users:
1. Check database connection
2. Verify RLS policies are enabled
3. Check Supabase logs
4. Review audit logs
5. Contact development team

---

**Last Updated:** 2025-11-13  
**Version:** 1.0  
**Total Test Users:** 22+
