# 🚀 LOAD TEST USERS NOW - Step-by-Step Guide

## Quick Steps (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: **https://app.supabase.com**
2. Sign in to your account
3. Select your **IntimeSolutions** project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"** button

### Step 3: Load Test Users SQL
1. Open this file in your project:
   ```
   database/seed-test-users.sql
   ```

2. **Copy ALL the contents** (Cmd/Ctrl + A, then Cmd/Ctrl + C)

3. **Paste** into the Supabase SQL Editor

4. Click **"Run"** button (or press Cmd/Ctrl + Enter)

5. Wait 5-10 seconds for execution

6. You should see: ✅ **"Success. No rows returned"**

### Step 4: Verify Users Created
Run this query in SQL Editor:

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

You should see:
- **admin**: 2 users
- **account_manager**: 3 users
- **employee**: 3 users
- **operations**: 3 users
- **recruiter**: 5 users
- **sales**: 3 users
- **student**: 4 users

**Total: 22+ test users** ✅

### Step 5: Load Sample Data (Optional)
1. Open file: `database/seed-sample-data.sql`
2. Copy all contents
3. Paste in SQL Editor
4. Click "Run"

This adds:
- 5 clients
- 6 jobs
- 8 candidates
- 4 applications
- 4 opportunities

### Step 6: Test Login
1. Go to: **http://localhost:3000/hr/login**
2. Login with:
   ```
   Email: admin@intimeesolutions.com
   Password: test12345
   ```
3. You should see the HR Dashboard with data!

---

## All Test User Emails

### Copy-Paste Ready for Testing:

**Admins:**
```
admin@intimeesolutions.com
admin.john@intimeesolutions.com
```

**Recruiters:**
```
recruiter.sarah@intimeesolutions.com
recruiter.mike@intimeesolutions.com
recruiter.senior@intimeesolutions.com
recruiter.junior@intimeesolutions.com
manager.team@intimeesolutions.com
```

**Sales:**
```
sales.david@intimeesolutions.com
sales.lisa@intimeesolutions.com
sales.rep@intimeesolutions.com
```

**Account Managers:**
```
accountmgr.jennifer@intimeesolutions.com
accountmgr.robert@intimeesolutions.com
accountmgr.senior@intimeesolutions.com
```

**Operations:**
```
operations.maria@intimeesolutions.com
operations.james@intimeesolutions.com
operations.coordinator@intimeesolutions.com
```

**Employees:**
```
employee.john@intimeesolutions.com
employee.jane@intimeesolutions.com
employee.consultant@intimeesolutions.com
```

**Students:**
```
student.amy@intimeesolutions.com
student.bob@intimeesolutions.com
student.beginner@intimeesolutions.com
student.advanced@intimeesolutions.com
```

**Password for ALL:** `test12345`

---

## Testing HR Functionality

Once users are loaded:

### 1. Admin View
Login: `admin@intimeesolutions.com`
- Should see all employees
- Can create/edit/delete
- Full access to all HR features

### 2. Employee Self-Service
Login: `employee.john@intimeesolutions.com`
- Should see own profile
- Can submit leave requests
- Can submit expense claims
- Cannot see other employees

### 3. HR Manager View
Login: `operations.maria@intimeesolutions.com`
- Can view all employees
- Can approve timesheets
- Can manage leave requests

---

## Troubleshooting

### If SQL fails:
1. Check for existing users with same emails
2. Delete existing test users first:
   ```sql
   DELETE FROM user_profiles WHERE email LIKE '%@intimeesolutions.com';
   ```
3. Then run seed-test-users.sql again

### If login fails:
1. Verify user exists in Supabase auth
2. Check email is confirmed
3. Verify user_profiles entry exists

### If dashboard is empty:
1. Run seed-sample-data.sql
2. Refresh the page
3. Check browser console for errors

---

## Quick Verification SQL

Run this to see all test users:

```sql
SELECT 
  up.email,
  up.full_name,
  up.role,
  up.department,
  up.is_active,
  au.email_confirmed_at
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE up.email LIKE '%@intimeesolutions.com'
ORDER BY up.role, up.email;
```

---

## Next Steps After Loading

1. ✅ Login as admin
2. ✅ Navigate HR Dashboard
3. ✅ Test employee management
4. ✅ Try creating timesheet
5. ✅ Submit leave request
6. ✅ Test expense claim
7. ✅ Generate employee document
8. ✅ View reports

---

**Need Help?**

Check these files:
- `TEST_USER_CREDENTIALS.md` - Full user list
- `QUICK_START_TESTING.md` - Testing guide
- `TEST_USERS_QUICK_REFERENCE.md` - Quick reference

---

**Last Updated:** 2025-11-13  
**Status:** Ready to Load ✅

