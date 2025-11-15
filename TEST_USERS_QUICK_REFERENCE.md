# 🎴 Test Users Quick Reference Card

> **Password for ALL users:** `test12345`

---

## 👑 ADMINS (Full Access)

```
admin@intimeesolutions.com
admin.john@intimeesolutions.com
```
✅ Everything | ❌ Nothing

---

## 🎯 RECRUITERS (ATS)

```
recruiter.sarah@intimeesolutions.com    # Senior
recruiter.mike@intimeesolutions.com     # Tech specialist
recruiter.senior@intimeesolutions.com   # Leadership
recruiter.junior@intimeesolutions.com   # Entry-level
manager.team@intimeesolutions.com       # Team manager
```
✅ Candidates, Jobs, Applications, Interviews  
❌ Client creation, Timesheet approval

---

## 💼 SALES (CRM)

```
sales.david@intimeesolutions.com        # Enterprise
sales.lisa@intimeesolutions.com         # SMB
sales.rep@intimeesolutions.com          # Generic
```
✅ Clients, Opportunities, Pipeline  
❌ Candidate management, Interviews

---

## 🤝 ACCOUNT MANAGERS

```
accountmgr.jennifer@intimeesolutions.com  # Top-tier
accountmgr.robert@intimeesolutions.com    # Mid-tier
accountmgr.senior@intimeesolutions.com    # Senior
```
✅ Client accounts, Placements, Timesheets  
❌ Candidate creation, Job posting

---

## ⚙️ OPERATIONS

```
operations.maria@intimeesolutions.com       # Timesheets
operations.james@intimeesolutions.com       # Contracts
operations.coordinator@intimeesolutions.com # General
```
✅ Placements, Timesheets, Contracts  
❌ Candidate/Job creation

---

## 👤 EMPLOYEES

```
employee.john@intimeesolutions.com       # Has manager
employee.jane@intimeesolutions.com       # No manager
employee.consultant@intimeesolutions.com # Placed
```
✅ Own profile, Tasks  
❌ ATS/CRM access

---

## 🎓 STUDENTS

```
student.amy@intimeesolutions.com
student.bob@intimeesolutions.com
student.beginner@intimeesolutions.com
student.advanced@intimeesolutions.com
```
✅ Academy only  
❌ Internal systems

---

## 🔬 SPECIAL CASES

```
inactive.user@intimeesolutions.com   # Cannot login
pending.user@intimeesolutions.com    # Email not confirmed
```

---

## ⚡ Quick Test Commands

### Verify Users
```bash
node scripts/test-users.js verify
```

### Test Login
```bash
node scripts/test-users.js test-login recruiter
```

### Generate Data
```bash
node scripts/test-users.js generate-data sales
```

### List All
```bash
node scripts/test-users.js list
```

---

## 🎯 Fast Testing Path

1. **Load Users** → Run `seed-test-users.sql`
2. **Load Data** → Run `seed-sample-data.sql`  
3. **Test Admin** → `admin@intimeesolutions.com`
4. **Test Recruiter** → `recruiter.sarah@intimeesolutions.com`
5. **Test Sales** → `sales.david@intimeesolutions.com`

---

## 📊 What's Included

| Role | Count | Sample Data |
|------|-------|-------------|
| Admin | 2 | Full access |
| Recruiter | 5 | 8 candidates, 6 jobs |
| Sales | 3 | 5 clients, 4 opps |
| Account Mgr | 3 | Client assignments |
| Operations | 3 | Ready for work |
| Employee | 3 | Personal data |
| Student | 4 | Academy access |
| **TOTAL** | **22+** | **Ready to test** |

---

## ⚠️ Remember

- 🔒 Test environment only
- 🚫 Never use in production
- 🗑️ Delete before go-live
- 🔐 Change default password

---

**Print this card and keep it handy while testing!**

