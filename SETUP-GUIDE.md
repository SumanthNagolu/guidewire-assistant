# 🚀 IntimeSolutions HR System - Setup Guide

## What You Need to Do

### Step 1: Apply Database Schema in Supabase

The schema needs to be manually applied in Supabase. Here's how:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy & Run Schema**
   - Open the file: `database/hr-schema.sql`
   - Copy ALL the contents (it's a long file)
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - ✅ You should see "Success. No rows returned"

4. **Load Document Templates**
   - Open the file: `database/hr-document-templates.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run"
   - ✅ Should see success message

5. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see new tables:
     - employees
     - departments
     - hr_roles
     - timesheets
     - leave_requests
     - expense_claims
     - ... and more!

---

### Step 2: Access the HR Portal

Once the schema is applied, you can access the system:

#### Option A: Portal Hub (Recommended)
```
http://localhost:3002/portals
```
This shows all available portals:
- HR Portal
- Learning Portal
- Admin Portal
- Main Website

#### Option B: Direct HR Login
```
http://localhost:3002/hr/login
```

**Login Credentials:**
```
Email: admin@intimesolutions.com
Password: admin123456
```

---

### Step 3: Portal Switcher

Once logged in, you'll see a **Portal Switcher** in the top-left of the header:

```
[HR Portal ▼]
```

Click it to switch between:
- 🏢 HR Portal
- 🎓 Learning Portal  
- ⚙️ Admin Portal
- 🌐 Main Website

---

## Why Port 3002?

Port 3000 is being used by another Next.js process. To fix this:

**Option 1: Kill the other process**
```bash
# Find and kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart on port 3000
npm run dev
```

**Option 2: Use port 3002** (easier)
Just use `http://localhost:3002` - it works the same!

---

## Missing Dependencies Fixed

The errors you saw were for missing packages. These have been installed:
- ✅ react-countup
- ✅ react-intersection-observer

The homepage should now load without errors!

---

## Complete Setup Checklist

- [ ] Apply `hr-schema.sql` in Supabase
- [ ] Apply `hr-document-templates.sql` in Supabase
- [ ] Verify tables exist in Supabase Table Editor
- [ ] Navigate to http://localhost:3002/portals
- [ ] Login with admin@intimesolutions.com / admin123456
- [ ] Test portal switcher
- [ ] Explore HR Dashboard
- [ ] Try clock in/out
- [ ] Submit a leave request
- [ ] Create an expense claim

---

## Quick Links

**Portal Hub:**
http://localhost:3002/portals

**Direct Access:**
- HR: http://localhost:3002/hr/dashboard
- Login: http://localhost:3002/hr/login

**Supabase SQL Editor:**
https://app.supabase.com → Your Project → SQL Editor

---

## What the Portal Switcher Gives You

### 1. **Unified Navigation**
No more jumping between different URLs - switch portals with one click!

### 2. **Context Awareness**
The switcher knows which portal you're in and highlights it.

### 3. **Quick Access**
Jump from HR to Learning to Admin without logging in again.

### 4. **Professional UX**
Users see all their available portals in one place.

---

## Architecture

```
IntimeSolutions Platform
├── / (Main Website)
│   └── Marketing pages
│
├── /portals (Portal Hub)
│   └── Portal selector
│
├── /hr/* (HR Portal)
│   ├── /hr/dashboard
│   ├── /hr/employees
│   ├── /hr/timesheets
│   ├── /hr/leave
│   ├── /hr/expenses
│   ├── /hr/documents
│   ├── /hr/reports
│   └── /hr/self-service
│
├── /academy/* (Learning Portal)
│   └── Training courses
│
└── /admin/* (Admin Portal)
    └── System administration
```

---

## Next Steps After Setup

1. **Explore the HR Dashboard**
   - See all the widgets
   - Check quick actions
   - View attendance overview

2. **Try Clock In/Out**
   - Go to "Clock In/Out" quick action
   - Clock in
   - See live timer
   - Clock out

3. **Submit Leave Request**
   - Click "Apply Leave"
   - Select leave type
   - Choose dates
   - Submit

4. **Create Expense Claim**
   - Click "Submit Expense"
   - Add expense items
   - Upload receipt (optional for now)
   - Submit claim

5. **Generate Document**
   - Go to Documents → Generate
   - Select employee (yourself)
   - Choose template
   - Generate & preview

6. **View Reports**
   - Check HR Analytics
   - See charts and graphs
   - View different report types

---

## Troubleshooting

### Schema not applying?
- Make sure you copied the ENTIRE file
- Check for any SQL errors in the output
- Try applying in smaller chunks if needed

### Can't login?
- Make sure schema was applied (creates auth tables)
- Check credentials: admin@intimesolutions.com / admin123456
- Clear browser cache if needed

### Portal switcher not showing?
- Refresh the page
- Check if you're logged in
- Navigate to /hr/dashboard first

### Tables not visible in Supabase?
- Refresh the Table Editor
- Check you're in the right project
- Verify SQL ran successfully

---

## Support

If you encounter any issues:
1. Check this guide first
2. Review error messages in browser console (F12)
3. Check Supabase logs
4. Verify all schema was applied

---

**You're ready to go! 🎉**

The complete HR system is built and waiting for you at:
**http://localhost:3002/portals**


