# 🗄️ Database Migration - Step by Step

## ✅ SQL Syntax Error FIXED!

The ALTER TABLE syntax has been corrected. Each column now has its own ADD COLUMN statement.

---

## 📋 Migration Steps

### 1. Open Supabase SQL Editor

Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql`

### 2. Copy the Fixed SQL

File: `database/ai-productivity-complete-schema.sql`

The file is now **371 lines** with corrected syntax.

### 3. Paste and Run

1. Click "New Query"
2. Paste the ENTIRE contents of `ai-productivity-complete-schema.sql`
3. Click "Run" (or press Cmd/Ctrl + Enter)
4. Wait for completion (should take 5-10 seconds)

### 4. Verify Success

You should see:
- ✅ "Success. No rows returned"
- OR a list of created tables/functions

### 5. Check Tables Were Created

Run this verification query:

```sql
-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'productivity_%'
ORDER BY table_name;
```

**Expected tables:**
- productivity_ai_analysis
- productivity_applications  
- productivity_attendance
- productivity_communications
- productivity_presence
- productivity_screenshots
- productivity_teams
- productivity_team_members
- productivity_web_activity
- productivity_websites
- productivity_work_summaries

---

## 🚨 If You Get Errors

### "relation does not exist"
This is OK if it's a DROP statement - means the constraint didn't exist yet.

### "column already exists"
This is OK - the IF NOT EXISTS handles this gracefully.

### Other errors
Copy the error message and I'll help debug!

---

## ✅ After Migration Success

### Update Test User

Run this to set up your admin user for testing:

```sql
-- Update the test user with industry role
UPDATE user_profiles 
SET 
  industry_role = 'admin',
  user_tags = ARRAY['management', 'leadership'],
  ai_analysis_enabled = true
WHERE email = 'admin@intimesolutions.com';
```

### Create Initial Teams

```sql
-- Teams are auto-created by the migration!
-- Verify they exist:
SELECT * FROM productivity_teams;
```

---

## 🎯 Next Step: Start the Dashboard

```bash
# Make sure ANTHROPIC_API_KEY is in .env.local
npm run dev
```

Then visit: **http://localhost:3000/productivity/ai-dashboard**

---

**The migration is ready to run!** 🚀



