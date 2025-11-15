# User Management Testing Guide

## Overview

This document provides comprehensive test scenarios for all user signup flows and admin user management features.

---

## Pre-Testing Setup

### 1. Database Setup

Before testing, ensure the following SQL scripts have been run in Supabase:

```bash
# Run in order:
1. database/migrations/RUN-THIS-FIRST-schema-updates.sql
2. database/migrations/004-enhanced-signup-trigger.sql
```

Verify:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'permissions', 'role_templates', 'user_permissions');

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 2. Start Development Server

```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-esolutions
npm run dev
```

Server should be running on `http://localhost:3000`

---

## Test Scenarios

### Test Suite 1: Student Signup Flow

**Test ID**: EXT-001  
**Purpose**: Verify students can self-register for Academy access

#### Test Steps:

1. **Navigate to signup selector**
   - Go to: `http://localhost:3000/signup`
   - Verify: 3 signup type cards are displayed
   - Verify: Student card shows "Learn Guidewire from experts"

2. **Click Student signup**
   - Click on Student card
   - Verify: Redirected to `/signup/student`
   - Verify: Form shows correct fields:
     - First Name (required)
     - Last Name (required)
     - Email (required)
     - Password (required)
     - Phone (optional)
     - LinkedIn URL (optional)

3. **Submit signup form**
   - Fill in:
     - First Name: "Test"
     - Last Name: "Student"
     - Email: "test.student@example.com"
     - Password: "TestPassword123!"
     - Phone: "+1 555-0100"
   - Click "Create Student Account"
   - Verify: Success message appears
   - Verify: Redirect to `/academy`

4. **Verify database records**
   ```sql
   -- Check user_profiles
   SELECT id, email, role, first_name, last_name, is_active
   FROM user_profiles
   WHERE email = 'test.student@example.com';
   
   -- Expected: role='student', is_active=true
   ```

5. **Test login**
   - Go to `/login`
   - Enter credentials
   - Verify: Can log in successfully
   - Verify: Redirect to `/academy`

**Pass Criteria**:
- ✅ Form validates correctly
- ✅ User created in database with role='student'
- ✅ Email verification sent
- ✅ Can log in after verification
- ✅ Redirects to Academy

---

### Test Suite 2: Candidate Signup Flow

**Test ID**: EXT-002  
**Purpose**: Verify job seekers can register as candidates

#### Test Steps:

1. **Navigate to candidate signup**
   - Go to: `http://localhost:3000/signup/candidate`
   - Verify: Form shows candidate-specific fields

2. **Submit signup form**
   - Fill in:
     - First Name: "Test"
     - Last Name: "Candidate"
     - Email: "test.candidate@example.com"
     - Password: "TestPassword123!"
     - Phone: "+1 555-0101"
     - Current Title: "Software Engineer"
     - Years of Experience: "5"
   - Click "Create Candidate Account"
   - Verify: Success message appears
   - Verify: Redirect to `/candidate/profile`

3. **Verify database records**
   ```sql
   -- Check user_profiles
   SELECT id, email, role FROM user_profiles
   WHERE email = 'test.candidate@example.com';
   
   -- Check candidates table
   SELECT id, email, current_title, years_of_experience, status
   FROM candidates
   WHERE email = 'test.candidate@example.com';
   
   -- Expected: role='candidate', status='active', candidate record exists
   ```

4. **Test login and permissions**
   - Log in as candidate
   - Verify: Can access candidate portal
   - Verify: Can view jobs
   - Verify: Cannot access admin functions

**Pass Criteria**:
- ✅ User created with role='candidate'
- ✅ Candidate record created in candidates table
- ✅ Status set to 'active'
- ✅ Can log in and access candidate portal

---

### Test Suite 3: Client Signup Flow

**Test ID**: EXT-003  
**Purpose**: Verify companies can request client accounts with approval workflow

#### Test Steps:

1. **Navigate to client signup**
   - Go to: `http://localhost:3000/signup/client`
   - Verify: Form shows company-specific fields

2. **Submit signup form**
   - Fill in:
     - Company Name: "Test Corp"
     - First Name: "Test"
     - Last Name: "Client"
     - Email: "test.client@testcorp.com"
     - Password: "TestPassword123!"
     - Phone: "+1 555-0102"
     - Industry: "Insurance"
     - Company Size: "51-200"
   - Click "Request Client Account"
   - Verify: Success message: "Thank you for registering! Your account is pending approval..."
   - Verify: Redirect to `/client/pending-approval`

3. **Verify database records**
   ```sql
   -- Check user_profiles
   SELECT id, email, role, is_active FROM user_profiles
   WHERE email = 'test.client@testcorp.com';
   
   -- Check clients table
   SELECT id, name, email, status FROM clients
   WHERE email = 'test.client@testcorp.com';
   
   -- Expected: role='client', client.status='pending_approval'
   ```

4. **Test pending state**
   - Try to log in as client
   - Verify: Can log in
   - Verify: Sees pending approval message
   - Verify: Limited access until approved

5. **Admin approval process**
   - Log in as admin
   - Go to: `/admin/client-approvals`
   - Find pending client
   - Click "Approve"
   - Verify: Client status changes to 'active'

6. **Test approved state**
   - Log out and log in as client again
   - Verify: Full access granted
   - Verify: Can post jobs
   - Verify: Can view candidates

**Pass Criteria**:
- ✅ User created with role='client'
- ✅ Client record created with status='pending_approval'
- ✅ User can log in but has limited access
- ✅ Admin can approve client
- ✅ After approval, client has full access

---

### Test Suite 4: Admin User Creation

**Test ID**: INT-001  
**Purpose**: Verify admin can create internal users with full organizational attributes

#### Test Steps:

1. **Login as admin**
   - Go to: `http://localhost:3000/login`
   - Email: "admin@intimeesolutions.com"
   - Password: "test12345"
   - Verify: Redirected to admin dashboard

2. **Navigate to user creation**
   - Go to: `/admin/users/new`
   - Verify: 4-step wizard is displayed
   - Verify: Progress indicators shown

3. **Step 1: Basic Information**
   - Fill in:
     - First Name: "John"
     - Last Name: "Recruiter"
     - Email: "john.recruiter@intimeesolutions.com"
     - Phone: "+1 555-0200"
   - Click "Next"
   - Verify: Moves to Step 2

4. **Step 2: Role & Permissions**
   - Select Role: "Recruiter"
   - Verify: Role description displayed
   - Click "Next"
   - Verify: Moves to Step 3

5. **Step 3: Organizational Details**
   - Fill in:
     - Job Title: "Senior Recruiter"
     - Employment Type: "Full-time"
     - Team: "Recruiting"
     - Region: "North America"
     - Stream: "Healthcare"
     - Location: "New York, NY"
     - Reports To: Select a manager
     - Start Date: Today's date
     - Group Name: "Recruiting Pod A"
     - Cost Center: "CC-1001"
   - Click "Next"
   - Verify: Moves to Step 4

6. **Step 4: Review & Create**
   - Verify: All entered information displayed correctly
   - Check: "Send welcome email"
   - Click "Create User"
   - Verify: Success message
   - Verify: Redirected to `/admin/users`

7. **Verify database records**
   ```sql
   SELECT 
     id, email, role, full_name, job_title, 
     team_id, region, stream, location,
     employment_type, reporting_to, start_date,
     group_name, cost_center, is_active
   FROM user_profiles
   WHERE email = 'john.recruiter@intimeesolutions.com';
   
   -- Expected: All organizational fields populated correctly
   ```

8. **Verify user can login**
   - Check email for welcome message
   - Click password reset link
   - Set new password
   - Log in with new credentials
   - Verify: Access to recruiter portal
   - Verify: Can view candidates
   - Verify: Can create jobs

**Pass Criteria**:
- ✅ All wizard steps work correctly
- ✅ User created with all attributes
- ✅ Welcome email sent
- ✅ User can set password and login
- ✅ Permissions match selected role

---

### Test Suite 5: User Directory & Management

**Test ID**: INT-002  
**Purpose**: Verify admin can view, search, and filter users

#### Test Steps:

1. **Access user directory**
   - Login as admin
   - Go to: `/admin/users`
   - Verify: User table displayed

2. **Test search functionality**
   - Enter "john" in search box
   - Verify: Only matching users displayed
   - Clear search
   - Enter email address
   - Verify: Finds correct user

3. **Test role filter**
   - Select "Recruiter" from role filter
   - Verify: Only recruiters displayed
   - Select "All Roles"
   - Verify: All users displayed again

4. **Test team filter**
   - Select "Recruiting" team
   - Verify: Only users in that team displayed

5. **Test status filter**
   - Select "Active"
   - Verify: Only active users shown
   - Select "Inactive"
   - Verify: Only inactive users shown

6. **Test CSV export**
   - Click "Export CSV"
   - Verify: CSV file downloads
   - Open CSV
   - Verify: Contains correct user data

7. **Test user actions**
   - Click actions menu on a user
   - Verify: Options shown:
     - View Details
     - Edit User
     - Send Welcome Email
     - Deactivate User

**Pass Criteria**:
- ✅ Search works correctly
- ✅ All filters function properly
- ✅ CSV export contains correct data
- ✅ User actions menu works

---

### Test Suite 6: Permission System

**Test ID**: INT-003  
**Purpose**: Verify permission system works correctly

#### Test Steps:

1. **Test recruiter permissions**
   - Login as recruiter
   - Verify: Can access `/employee/candidates`
   - Verify: Can access `/employee/jobs`
   - Try to access `/admin/users`
   - Verify: Access denied or redirected

2. **Test sales permissions**
   - Login as sales rep
   - Verify: Can access `/employee/clients`
   - Verify: Can create new clients
   - Try to access `/employee/candidates` (detailed view)
   - Verify: Limited or no access

3. **Test admin override**
   - Login as admin
   - Verify: Can access all pages
   - Verify: No permission errors anywhere

4. **Test custom permissions**
   - As admin, edit a user
   - Add custom permission: `clients.create` to recruiter
   - Save
   - Login as that recruiter
   - Verify: Can now create clients
   - Verify: Permission persists across sessions

**Pass Criteria**:
- ✅ Role-based permissions enforced
- ✅ Access denied for unauthorized actions
- ✅ Custom permissions work
- ✅ Admin has full access

---

### Test Suite 7: User Lifecycle

**Test ID**: INT-004  
**Purpose**: Verify user lifecycle management (create, edit, deactivate, reactivate)

#### Test Steps:

1. **Edit user**
   - Login as admin
   - Go to user directory
   - Click "Edit" on a user
   - Change: Job title, team, region
   - Save
   - Verify: Changes reflected immediately

2. **Deactivate user**
   - Click "Deactivate User"
   - Confirm action
   - Verify: User marked inactive
   - Try to login as that user
   - Verify: Cannot login or sees "Account deactivated" message

3. **Reactivate user**
   - Filter by "Inactive"
   - Select deactivated user
   - Click "Reactivate"
   - Verify: User active again
   - Login as that user
   - Verify: Can login successfully

4. **Resend welcome email**
   - Select a user
   - Click "Send Welcome Email"
   - Verify: Email sent
   - Check email inbox
   - Verify: Password reset email received

**Pass Criteria**:
- ✅ Can edit user attributes
- ✅ Deactivation works correctly
- ✅ Deactivated users cannot login
- ✅ Can reactivate users
- ✅ Welcome emails send successfully

---

## Automated Test Script

For automated testing, run:

```bash
npm run test:e2e
```

Or manually run Playwright tests:

```bash
npx playwright test tests/e2e/user-management.spec.ts
```

---

## Test Data Cleanup

After testing, clean up test users:

```sql
-- Delete test users
DELETE FROM user_profiles 
WHERE email LIKE 'test.%@example.com' 
OR email LIKE 'test.%@testcorp.com'
OR email LIKE 'john.recruiter@intimeesolutions.com';

-- Clean up auth.users too
-- (Run in Supabase dashboard → Authentication → Users)
```

---

## Common Issues & Solutions

### Issue: "Email already registered"
**Solution**: Check if user exists from previous test. Delete or use different email.

### Issue: Signup trigger not firing
**Solution**: Verify trigger exists:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

### Issue: Permission denied errors
**Solution**: Check RLS policies are enabled and correctly configured.

### Issue: Welcome email not sending
**Solution**: 
- Check Supabase email settings
- Verify SMTP configuration
- Check email rate limits

---

## Test Checklist

### External Signups
- [ ] Student signup works
- [ ] Candidate signup works
- [ ] Client signup works (with approval flow)
- [ ] All signups create correct database records
- [ ] Email verification works
- [ ] Redirects work correctly

### Internal User Management
- [ ] Admin can create users
- [ ] All wizard steps work
- [ ] Organizational attributes save correctly
- [ ] Welcome emails send
- [ ] Users can login after creation

### User Directory
- [ ] Search works
- [ ] Filters work (role, team, status)
- [ ] CSV export works
- [ ] User actions work

### Permissions
- [ ] Role-based permissions enforced
- [ ] Custom permissions work
- [ ] Admin has full access
- [ ] Unauthorized access blocked

### User Lifecycle
- [ ] Can edit users
- [ ] Can deactivate users
- [ ] Deactivated users cannot login
- [ ] Can reactivate users
- [ ] Welcome emails resend correctly

---

**Testing Status**: Ready for execution  
**Last Updated**: [Current Date]  
**Version**: 1.0

