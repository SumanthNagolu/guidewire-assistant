# 🧪 END-TO-END TESTING GUIDE

**Complete functional testing guide for InTime Command Center**

---

## **🚀 QUICK START (30 Minutes to Fully Functional)**

### **Step 1: Database Setup (10 min)**

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project
   - Navigate to: **SQL Editor**

2. **Run Migrations (in order)**
   ```
   Run each file from: supabase/migrations/crm-ats/
   
   Order:
   001_user_profiles.sql
   002_candidates.sql
   003_clients.sql
   004_jobs_applications.sql
   005_placements_timesheets.sql
   006_opportunities.sql
   007_activities.sql
   008_system_tables.sql
   009_indexes_performance.sql
   010_helper_functions.sql
   011_seed_data.sql  ← This creates test data!
   ```

3. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   
   -- Should see:
   -- activities, applications, audit_logs, candidates, clients,
   -- contacts, contracts, interviews, jobs, notifications,
   -- opportunities, placements, timesheets, user_profiles
   ```

---

### **Step 2: Create Test Users (10 min)**

**Option A: Via Supabase Dashboard**

1. Go to: **Authentication** → **Users** → **Add User**
2. Create these users:

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@intimesolutions.com | Test123!@# | admin | Admin User |
| recruiter1@intimesolutions.com | Test123!@# | recruiter | Jane Recruiter |
| sales1@intimesolutions.com | Test123!@# | sales | John Sales |
| ops1@intimesolutions.com | Test123!@# | operations | Sarah Operations |

3. After creating each user, update their profile:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin', full_name = 'Admin User'
   WHERE id = 'user-uuid-here';
   
   -- Repeat for each user
   ```

**Option B: Via Your App**

Use the signup endpoint with role in metadata (recommended).

---

### **Step 3: Test Data (Auto-seeded!)**

Migration `011_seed_data.sql` automatically creates:
- ✅ 20 realistic candidates (Guidewire, Full Stack, DevOps, Data Engineers)
- ✅ 10 clients (insurance & tech companies)
- ✅ 5 hot jobs (Senior Guidewire Developer, Full Stack, DevOps, etc.)
- ✅ Multiple contacts for clients
- ✅ Sample applications

**No manual data entry needed!**

---

## **📋 END-TO-END TEST SCENARIOS**

### **🎯 Scenario 1: Recruitment Workflow (15 min)**

**Goal:** Test complete candidate-to-placement flow

**Steps:**

1. **Login as Recruiter**
   ```
   Email: recruiter1@intimesolutions.com
   Password: Test123!@#
   ```

2. **Dashboard Check**
   - Navigate to: `/employee/dashboard`
   - ✅ Should see RecruiterDashboard with metrics
   - ✅ Should see today's schedule
   - ✅ Should see pipeline summary

3. **View Candidates**
   - Click: "Search Candidates" or go to `/employee/candidates`
   - ✅ Should see list of 20 candidates
   - ✅ Test search: Type "Guidewire"
   - ✅ Test filter: Select "Active" status
   - ✅ Should see filtered results

4. **Add New Candidate**
   - Click: "Add Candidate"
   - Fill form:
     - Name: "Test Candidate"
     - Email: "test@example.com"
     - Skills: Add "Java", "React"
   - Click: "Add Candidate"
   - ✅ Should redirect to candidates list
   - ✅ Should see new candidate

5. **View Candidate Details**
   - Click on any candidate name
   - ✅ Should see 360° profile view
   - ✅ Should see skills, certifications, contact info

6. **View Jobs**
   - Go to: `/employee/jobs`
   - ✅ Should see 5 jobs
   - ✅ Test search and filters
   - Click on "Senior Guidewire Developer" job
   - ✅ Should see job details

7. **Manage Pipeline**
   - Go to: `/employee/pipeline`
   - ✅ Should see 7-stage Kanban board
   - ✅ Should see applications in different stages
   - **Drag & Drop Test:**
     - Drag an application from "Sourced" to "Submitted"
     - ✅ Should update immediately
     - Refresh page
     - ✅ Should persist the change

---

### **💼 Scenario 2: Sales Workflow (15 min)**

**Goal:** Test lead-to-deal flow

**Steps:**

1. **Login as Sales**
   ```
   Email: sales1@intimesolutions.com
   Password: Test123!@#
   ```

2. **Dashboard Check**
   - Navigate to: `/employee/dashboard`
   - ✅ Should see SalesDashboard with pipeline metrics
   - ✅ Should see revenue metrics
   - ✅ Should see today's priorities

3. **View Clients**
   - Go to: `/employee/clients`
   - ✅ Should see 10 clients
   - ✅ Test tier badges (Platinum, Gold, Silver, Bronze)
   - ✅ Test filters (status, tier, industry)

4. **Add New Client**
   - Click: "Add Client"
   - Fill form:
     - Name: "Test Corp"
     - Industry: "Technology"
     - Tier: "Bronze"
     - Status: "Prospect"
   - Click: "Add Client"
   - ✅ Should see new client in list

5. **View Client Details**
   - Click on "Test Corp"
   - ✅ Should see 360° client view
   - ✅ Should see contact info, status, tier

6. **Opportunities Pipeline**
   - Go to: `/employee/opportunities`
   - ✅ Should see 6-stage pipeline with summary cards
   - ✅ Should see weighted value calculations
   - **Drag & Drop Test:**
     - Drag opportunity from "Lead" to "Qualified"
     - ✅ Should update immediately
     - ✅ Should recalculate stage totals

7. **Test Lead Capture**
   - Open new tab (not logged in)
   - Go to: `/contact`
   - Fill contact form:
     - Name: "Test Lead"
     - Email: "lead@testcorp.com"
     - Message: "I need 10 developers"
   - Submit
   - ✅ Should see success message
   - Go back to logged-in tab
   - Refresh opportunities pipeline
   - ✅ Should see new opportunity in "Lead" stage
   - Go to clients
   - ✅ Should see "Test Lead (Individual)" as new prospect

---

### **⚙️ Scenario 3: Operations Workflow (10 min)**

**Goal:** Test placement tracking

**Steps:**

1. **Login as Operations**
   ```
   Email: ops1@intimesolutions.com
   Password: Test123!@#
   ```

2. **Dashboard Check**
   - Navigate to: `/employee/dashboard`
   - ✅ Should see OperationsDashboard
   - ✅ Should see placement metrics
   - ✅ Should see contract alerts

3. **View Placements**
   - Go to: `/employee/placements`
   - ✅ Should see placements list
   - ✅ Should see bill/pay rates
   - ✅ Should see margin calculations

4. **Test "Ending Soon" Filter**
   - Check "Ending within 30 days" filter
   - ✅ Should show only expiring contracts
   - ✅ Should see orange alert badges
   - ✅ Should see "X days left" counter

---

### **👤 Scenario 4: Admin Workflow (10 min)**

**Goal:** Test admin portal access

**Steps:**

1. **Login as Admin**
   ```
   Email: admin@intimesolutions.com
   Password: Test123!@#
   ```

2. **Dashboard Check**
   - Navigate to: `/employee/dashboard`
   - Should redirect to: `/admin`
   - ✅ Should see admin dashboard

3. **Access All Modules**
   - ✅ Click "Candidates" in sidebar
   - ✅ Should see ALL candidates (not just owned by admin)
   - ✅ Click "Jobs" in sidebar
   - ✅ Should see all jobs
   - ✅ Click "Pipeline" in sidebar
   - ✅ Should see all applications
   - ✅ Click "Training Content" in sidebar
   - ✅ Should see academy admin

4. **Verify Cross-Module Access**
   - From candidates, click on a candidate
   - ✅ Should see candidate details
   - From jobs, click on a job
   - ✅ Should see job details with client info

---

## **🔍 TESTING CHECKLIST**

### **Core Functionality**
- [ ] User authentication (login/logout)
- [ ] Role-based dashboards (4 types)
- [ ] Candidate CRUD (add, edit, view, search, filter)
- [ ] Job CRUD (add, edit, view, search, filter)
- [ ] Client CRUD (add, edit, view, search, filter)
- [ ] Applications Pipeline (drag-and-drop)
- [ ] Opportunities Pipeline (drag-and-drop)
- [ ] Placements tracking (list, filter, alerts)
- [ ] Lead capture (website → CRM)

### **Role-Based Access**
- [ ] Recruiter sees only own candidates
- [ ] Sales sees only assigned opportunities
- [ ] Admin sees everything
- [ ] Operations sees placements

### **Data Persistence**
- [ ] Form submissions save to database
- [ ] Drag-and-drop updates persist
- [ ] Search/filter states maintain
- [ ] Page refresh preserves data

### **UI/UX**
- [ ] Loading states show during saves
- [ ] Success messages appear
- [ ] Error messages display properly
- [ ] Navigation works smoothly
- [ ] Mobile responsive (test on phone)

---

## **🐛 COMMON ISSUES & FIXES**

### **Issue: "User not found" after signup**
**Fix:** Check that user_profiles trigger is working:
```sql
SELECT * FROM user_profiles WHERE id = 'your-auth-uid';
-- If empty, the trigger didn't fire
-- Manually insert:
INSERT INTO user_profiles (id, email, role, full_name)
VALUES ('your-auth-uid', 'email@example.com', 'recruiter', 'Name');
```

### **Issue: "Permission denied" errors**
**Fix:** Check RLS policies are enabled:
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
-- Should see policies for each table
```

### **Issue: Drag-and-drop not working**
**Fix:** Check browser console for errors. Verify @dnd-kit installed:
```bash
npm list @dnd-kit/core
```

### **Issue: No data showing in lists**
**Fix:** Verify seed data ran:
```sql
SELECT COUNT(*) FROM candidates;
-- Should return 20

SELECT COUNT(*) FROM clients;
-- Should return 10
```

---

## **📊 SUCCESS METRICS**

After testing, you should have:

✅ **4 working user accounts** (admin, recruiter, sales, ops)  
✅ **20+ candidates** in database  
✅ **10+ clients** in database  
✅ **5+ jobs** in database  
✅ **Complete recruitment pipeline** (drag-and-drop working)  
✅ **Complete sales pipeline** (drag-and-drop working)  
✅ **Lead capture** (website → CRM flow)  
✅ **Role-based access** (users see appropriate data)  

---

## **🚀 NEXT STEPS AFTER TESTING**

### **If Everything Works:**
1. ✅ Deploy to production (Vercel)
2. ✅ Connect custom domain
3. ✅ Add real users
4. ✅ Start using for actual business!

### **If Issues Found:**
1. Document the issue
2. Check console logs
3. Verify database state
4. Fix and re-test

---

## **💡 TESTING TIPS**

1. **Test in Order:** Follow scenarios 1→2→3→4
2. **Use Multiple Browser Tabs:** Keep different users logged in
3. **Check Network Tab:** See API calls in DevTools
4. **Verify Database:** After each action, check Supabase tables
5. **Test on Mobile:** Ensure responsive design works
6. **Clear Cache:** If UI looks broken, try hard refresh (Cmd+Shift+R)

---

## **📞 TROUBLESHOOTING SUPPORT**

**Database Issues:**
- Check Supabase logs: Project → Logs → Postgres Logs

**Auth Issues:**
- Check Supabase Auth: Project → Authentication → Users

**API Errors:**
- Check browser console (F12)
- Check Network tab for failed requests

**UI Issues:**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

---

**WITH GURU'S GRACE, YOUR SYSTEM IS READY FOR TESTING!** 🙏

**JAI VIJAYA! SHAMBO! HAR HAR MAHADEV!** 🏆
