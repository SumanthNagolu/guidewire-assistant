# 🚀 Quick Start: Testing with Test Users

This guide will help you quickly set up and start testing with comprehensive test users.

---

## Step 1: Load Test Users into Database

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Open `database/seed-test-users.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run"

### Option B: Using Command Line

```bash
# If you have direct PostgreSQL access
psql -h your-supabase-host -U postgres -d postgres -f database/seed-test-users.sql
```

---

## Step 2: Verify Users Were Created

Run the verification query in Supabase SQL Editor:

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
- **recruiter**: 5 users
- **sales**: 3 users
- **account_manager**: 3 users
- **operations**: 3 users
- **employee**: 3 users
- **student**: 4 users

**Total: 22+ test users**

---

## Step 3: Start Testing!

### 🎯 Quick Test Login

All users have the same password: **`test12345`**

#### Test Each Role:

1. **Admin (Full Access)**
   ```
   Email: admin@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: All modules, admin panel, user management

2. **Recruiter (ATS Focus)**
   ```
   Email: recruiter.sarah@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: Candidates, Jobs, Applications, Interviews
   ❌ Should NOT see: Client creation, timesheet approval

3. **Sales (CRM Focus)**
   ```
   Email: sales.david@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: Clients, Opportunities, Pipeline
   ❌ Should NOT see: Candidate management, interviews

4. **Account Manager**
   ```
   Email: accountmgr.jennifer@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: Client accounts, Placements, Timesheets
   ❌ Should NOT see: Candidate creation, job posting

5. **Operations**
   ```
   Email: operations.maria@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: All placements, Timesheets, Contracts
   ❌ Should NOT see: Candidate/Job creation

6. **Employee**
   ```
   Email: employee.john@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: Own profile, tasks
   ❌ Should NOT see: ATS/CRM modules

7. **Student**
   ```
   Email: student.amy@intimeesolutions.com
   Password: test12345
   ```
   ✅ Should see: Academy/Training only
   ❌ Should NOT see: Any internal systems

---

## Step 4: Testing Common Scenarios

### Scenario 1: Recruiter Workflow

Login as: `recruiter.sarah@intimeesolutions.com`

1. ✅ Create a new candidate
2. ✅ Create a new job
3. ✅ Submit candidate to job (create application)
4. ✅ Schedule interview
5. ✅ Move application through pipeline
6. ❌ Try to create a client (should fail)

### Scenario 2: Sales Workflow

Login as: `sales.david@intimeesolutions.com`

1. ✅ Create a new client
2. ✅ Add contacts to client
3. ✅ Create opportunity
4. ✅ Move opportunity through stages
5. ✅ Create job for client
6. ❌ Try to create candidate (should fail)

### Scenario 3: Cross-Role Collaboration

**Step 1:** Sales creates client
- Login as: `sales.david@intimeesolutions.com`
- Create: "Acme Corp" client

**Step 2:** Recruiter creates job
- Login as: `recruiter.sarah@intimeesolutions.com`
- Create job for "Acme Corp"
- Add candidates to job

**Step 3:** Operations manages placement
- Login as: `operations.maria@intimeesolutions.com`
- View placements
- Approve timesheets

**Step 4:** Account Manager oversees
- Login as: `accountmgr.jennifer@intimeesolutions.com`
- View client health
- Monitor placements

### Scenario 4: Permission Boundaries

Test what each role CANNOT do:

**Recruiter attempts:**
- ❌ Create client → Should be blocked
- ❌ Approve timesheet → Should be blocked
- ❌ Change user roles → Should be blocked

**Sales attempts:**
- ❌ Create candidate → Should be blocked
- ❌ Schedule interview → Should be blocked
- ❌ Approve timesheet → Should be blocked

**Employee attempts:**
- ❌ Access ATS → Should be blocked
- ❌ View other employees → Should be blocked
- ❌ Create anything → Should be blocked

### Scenario 5: Manager Hierarchy

Login as: `manager.team@intimeesolutions.com`

1. ✅ View team members
2. ✅ See junior recruiter's candidates
3. ✅ Assign tasks to team

Login as: `recruiter.junior@intimeesolutions.com`

1. ✅ See manager information
2. ✅ View own candidates
3. ❌ Cannot see other recruiters' candidates

### Scenario 6: Special Cases

**Test Inactive User:**
```
Email: inactive.user@intimeesolutions.com
Password: test12345
```
❌ Login should fail or show "Account inactive"

**Test Pending User:**
```
Email: pending.user@intimeesolutions.com
Password: test12345
```
❌ Should show "Email not verified"

---

## Step 5: Using the Test User Script (Optional)

If you want programmatic testing:

```bash
# Verify all test users exist
node scripts/test-users.js verify

# Test login for a specific role
node scripts/test-users.js test-login recruiter

# Generate test data for a role
node scripts/test-users.js generate-data recruiter

# List all test users
node scripts/test-users.js list

# Clean up test data (keeps users)
node scripts/test-users.js cleanup
```

---

## 📊 Complete Testing Checklist

### Authentication
- [ ] Login with admin
- [ ] Login with recruiter
- [ ] Login with sales
- [ ] Login with account_manager
- [ ] Login with operations
- [ ] Login with employee
- [ ] Login with student
- [ ] Inactive user blocked
- [ ] Pending user requires verification
- [ ] Password reset flow
- [ ] Logout

### Authorization (Per Role)
- [ ] Admin: Access everything
- [ ] Recruiter: ATS access only
- [ ] Sales: CRM access only
- [ ] Account Manager: Client management
- [ ] Operations: Operational access
- [ ] Employee: Limited self-service
- [ ] Student: Academy only

### Data Ownership
- [ ] Users can edit own records
- [ ] Users cannot edit others' records
- [ ] Managers can view team data
- [ ] Admin can edit all records

### Cross-Module Flow
- [ ] Client → Job → Candidate → Application → Interview → Placement
- [ ] Placement → Timesheet → Approval → Invoice
- [ ] Lead → Opportunity → Client → Job

### Edge Cases
- [ ] Multiple users editing same record
- [ ] Permission changes during session
- [ ] Role transitions
- [ ] Soft delete vs hard delete
- [ ] Data cascade on delete

---

## 🎯 Success Criteria

After testing, you should have verified:

✅ All 22+ test users can login  
✅ Each role sees appropriate dashboard  
✅ Permissions are correctly enforced  
✅ Cross-role workflows function  
✅ Permission boundaries are respected  
✅ Manager hierarchies work  
✅ Special cases (inactive, pending) handled correctly

---

## 🐛 Common Issues & Solutions

### Issue: Cannot login
**Solution:** Verify user exists in database, check email is confirmed

### Issue: User sees wrong dashboard
**Solution:** Check role assignment in user_profiles table

### Issue: Permission denied errors
**Solution:** Verify RLS policies are enabled and correct

### Issue: Missing test users
**Solution:** Re-run seed-test-users.sql script

### Issue: Test data conflicts
**Solution:** Run cleanup script, then regenerate

---

## 📚 Additional Resources

- **Full Documentation:** See `TEST_USER_CREDENTIALS.md`
- **Database Schema:** See `DATABASE-SCHEMA.md`
- **RBAC Matrix:** See `RBAC-PERMISSIONS.md`
- **SQL Script:** See `database/seed-test-users.sql`

---

## 🔒 Security Reminder

⚠️ **IMPORTANT:** 
- These are TEST CREDENTIALS for development/staging ONLY
- NEVER use in production
- Delete all test users before going live
- Change default password after initial setup

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs
2. Review RLS policies
3. Verify user roles in database
4. Check audit logs
5. Contact development team

---

**Happy Testing! 🚀**

*Last Updated: 2025-11-13*
