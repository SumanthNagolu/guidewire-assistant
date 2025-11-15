# 🐛 **DEBUG: Screenshot Upload Failing**

## 🔍 **The Problem:**
Agent shows: `❌ Upload Error: Request failed with status code 500`
Response: `{ error: 'Failed to save screenshot metadata' }`

This means the database INSERT is failing.

---

## 📋 **Step 1: Check Your Next.js Terminal**

Look for lines that say:
```
❌ Database insert error: { ... }
```

**What error code do you see?**
- `PGRST204` = Column doesn't exist
- `PGRST205` = Table doesn't exist  
- `23505` = Duplicate key violation
- `42P01` = Undefined table

---

## 🔧 **Step 2: Did You Run the SQL Migration?**

### **Check if table exists:**

Go to Supabase → SQL Editor → Run:

```sql
-- Check if productivity_screenshots has application_detected column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productivity_screenshots';
```

**Expected columns:**
- `id`
- `user_id`
- `screenshot_url`
- `storage_path`
- `captured_at`
- `application_detected` ⬅️ **THIS IS NEW**
- `activity_description`
- `work_category`
- `productivity_score`
- `focus_score`
- `processing_status` ⬅️ **THIS IS NEW**
- `processed_at` ⬅️ **THIS IS NEW**
- `file_size`
- `created_at`

### **Check if productivity_summaries exists:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'productivity_summaries';
```

**Expected:** Should return 1 row

---

## 🚨 **Most Likely Issue:**

You probably haven't run the `FINAL-DATABASE-FIX.sql` yet!

### **Quick Fix:**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy ENTIRE contents** of `FINAL-DATABASE-FIX.sql`
3. **Paste and Click "Run"**
4. **Wait for "Success. No rows returned"**

Then:

```bash
# Restart Next.js (Terminal with npm run dev)
# Press Ctrl+C, then:
npm run dev

# Agent will automatically retry
# Watch Next.js terminal for success messages
```

---

## 📊 **Step 3: If SQL is Already Run**

There might be a different issue. Let's check the exact error:

### **Enable detailed error logging:**

Add this temporarily to `app/api/productivity/screenshot-upload/route.ts` line 78:

```typescript
if (dbError) {
  console.error('❌ Database insert error:', dbError);
  console.error('   Error code:', dbError.code);
  console.error('   Error message:', dbError.message);
  console.error('   Error details:', dbError.details);
  console.error('   Error hint:', dbError.hint);
  return NextResponse.json({ 
    error: 'Failed to save screenshot metadata',
    debug: dbError // ⬅️ Add this for debugging
  }, { status: 500 });
}
```

Then check the agent terminal for the full error details.

---

## 🎯 **Alternative: Test Database Directly**

Run this in Supabase SQL Editor to test insert:

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'admin@intimesolutions.com';

-- Copy the ID and use it below
INSERT INTO productivity_screenshots (
  user_id,
  screenshot_url,
  storage_path,
  captured_at,
  application_detected,
  processing_status,
  file_size
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual UUID
  'https://test.com/test.jpg',
  'test/test.jpg',
  NOW(),
  'Test Application',
  'pending',
  12345
) RETURNING *;
```

**If this works:** The table structure is fine, issue is elsewhere
**If this fails:** You'll see the exact SQL error

---

## 💡 **Common Solutions:**

### **Solution 1: Missing Columns** (Most Common)
```sql
ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS application_detected TEXT;

ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
```

### **Solution 2: User Not Found**
```sql
-- Check if admin user exists
SELECT id, email FROM auth.users WHERE email = 'admin@intimesolutions.com';

-- Check if user profile exists
SELECT id, email FROM user_profiles WHERE email = 'admin@intimesolutions.com';
```

### **Solution 3: RLS Policy Blocking**
```sql
-- Temporarily disable RLS to test
ALTER TABLE productivity_screenshots DISABLE ROW LEVEL SECURITY;

-- Try again, then re-enable:
ALTER TABLE productivity_screenshots ENABLE ROW LEVEL SECURITY;
```

---

## 📞 **Quick Commands:**

```bash
# View Next.js logs (look for "Database insert error")
# Just check the terminal where npm run dev is running

# Test the upload endpoint directly
curl -X POST http://localhost:3000/api/productivity/screenshot-upload \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin@intimesolutions.com",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "application": "Test",
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'

# Should return either success or detailed error
```

---

**Share the error from your Next.js terminal and I'll fix it immediately!** 🚀


