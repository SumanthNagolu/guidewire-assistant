# 🚀 Quick Guide: Create HR Test Users

Since the Admin API is having issues, here are **3 reliable ways** to create the users:

## ✅ **OPTION 1: Supabase Dashboard (RECOMMENDED - 100% Works)**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create New User"**
3. Create these users:

### HR Manager:
- **Email:** `hr@intimeesolutions.com`
- **Password:** `test12345`
- ✅ Check **"Auto Confirm User"**
- Click **"Create User"**

### Employee:
- **Email:** `employee@intimeesolutions.com`
- **Password:** `test12345`
- ✅ Check **"Auto Confirm User"**
- Click **"Create User"**

4. Then run the SQL script `scripts/create-hr-employee-users.sql` in **SQL Editor** to assign roles

---

## ✅ **OPTION 2: SQL Script (If you have service_role access)**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. **Toggle "Run as service_role"** (bottom of SQL Editor)
3. Copy and paste the contents of `scripts/create-hr-employee-users.sql`
4. Click **"Run"**

---

## ✅ **OPTION 3: Manual SQL (Advanced)**

If the above don't work, you can manually insert into `auth.users` using the SQL script, but this requires direct database access.

---

## 🔍 **Troubleshooting**

If you get "Database error creating new user", it's usually because:
- Database triggers are failing
- RLS policies are blocking
- Missing required fields in user_profiles table

**Solution:** Use Option 1 (Dashboard) - it bypasses all these issues!

---

## ✅ **After Creating Users**

Once users are created, you can login at:
- **URL:** http://localhost:3000/hr/login
- **HR:** hr@intimeesolutions.com / test12345
- **Employee:** employee@intimeesolutions.com / test12345

