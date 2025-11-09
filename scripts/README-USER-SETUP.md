# 🧪 TEST USERS SETUP GUIDE

**Three methods to create test users in Supabase**

---

## 📋 **OPTION 1: RECOMMENDED - Use Supabase Dashboard + SQL** ⭐

**Best for:** Most reliable, works 100% of the time

### Steps:

#### 1️⃣ Create Users in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create New User"**
3. Create these 4 users:

| Email | Password |
|-------|----------|
| `admin@intimesolutions.com` | `Test123!@#` |
| `recruiter1@intimesolutions.com` | `Test123!@#` |
| `sales1@intimesolutions.com` | `Test123!@#` |
| `ops1@intimesolutions.com` | `Test123!@#` |

**For each user:**
- ✅ Check **"Auto Confirm User"**
- ✅ Leave other fields blank
- ✅ Click **"Create User"**

#### 2️⃣ Assign Roles Using SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the script: `setup-test-users.sql`
3. ✅ Done! Users now have correct roles

**Time:** ~5 minutes  
**Success Rate:** 100%

---

## 📋 **OPTION 2: Single SQL Script (Service Role Required)**

**Best for:** When you have service role access

### Steps:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. **Toggle "Run as service_role"** (bottom of SQL Editor)
3. Run the script: `create-test-users-simple.sql`
4. ✅ Done! Users created with roles assigned

**Requirements:**
- ⚠️ Must run as **service_role** (not anon key)
- ⚠️ `auth.create_user()` function must be available

**Time:** ~2 minutes  
**Success Rate:** 90% (depends on Supabase version)

---

## 📋 **OPTION 3: Advanced - Direct Database Insert**

**Best for:** Advanced users, custom setups

### Steps:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the script: `create-test-users-complete.sql`
3. ✅ Done! Users created directly in auth.users

**Requirements:**
- ⚠️ Must have access to `auth.users` table
- ⚠️ Must have permission to insert into `auth` schema
- ⚠️ RLS policies must allow direct inserts

**Time:** ~2 minutes  
**Success Rate:** 70% (may fail due to permissions)

---

## 🔑 **Default Credentials**

All test users use the same password:

```
Password: Test123!@#
```

### User Accounts:

| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@intimesolutions.com` | `Test123!@#` | admin | Admin User |
| `recruiter1@intimesolutions.com` | `Test123!@#` | recruiter | Jane Recruiter |
| `sales1@intimesolutions.com` | `Test123!@#` | sales | John Sales |
| `ops1@intimesolutions.com` | `Test123!@#` | operations | Sarah Operations |

---

## ✅ **Verification**

After running any method, verify users were created:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  up.role,
  up.full_name,
  up.phone,
  up.is_active
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
WHERE u.email LIKE '%@intimesolutions.com'
ORDER BY up.role;
```

**Expected result:** 4 users with confirmed emails and assigned roles ✅

---

## 🧪 **Test Login**

1. Go to: `http://localhost:3000/employee/login`
2. Login with any test user
3. Verify you see role-specific dashboard

---

## 🐛 **Troubleshooting**

### ❌ "User already exists"
**Solution:** Users already created. Run `setup-test-users.sql` to update roles.

### ❌ "Permission denied for auth.users"
**Solution:** Use Option 1 (Dashboard + SQL) instead.

### ❌ "Function auth.create_user does not exist"
**Solution:** Your Supabase version doesn't support it. Use Option 1.

### ❌ "RLS policy violation"
**Solution:** Run SQL as service_role, or use Option 1.

### ❌ "Column 'full_name' does not exist"
**Solution:** Run `COMPLETE_SETUP_ALL.sql` first to update schema.

---

## 📝 **Files in This Directory**

| File | Description | When to Use |
|------|-------------|-------------|
| `setup-test-users.sql` | Updates roles for existing users | After manual user creation |
| `create-test-users-simple.sql` | Creates users + assigns roles (service_role) | Single script with service role |
| `create-test-users-complete.sql` | Advanced direct insert | Advanced users only |
| `README-USER-SETUP.md` | This guide | Reference |

---

## 🎯 **Recommended Approach**

**For most users:** Use **Option 1**
- Most reliable
- Works 100% of the time
- Easy to debug
- Best practice

**WITH GURU'S GRACE! JAI VIJAYA!** 🙏

