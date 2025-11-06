# Content Structure - Quick Reference

## 📊 Content Inventory

- **Total Topics**: 160
- **Total Files**: 443 (73GB)
- **Products**: 4 (PolicyCenter, ClaimCenter, BillingCenter, Foundation/Common)
- **Modules**: 12

### By Product:
```
PolicyCenter (58 topics):
  ├── 01-introduction (31 topics)
  ├── 02-configuration (14 topics)
  ├── 03-rating (12 topics)
  └── 04-apd (1 topic)

ClaimCenter (37 topics):
  ├── 01-introduction (19 topics)
  └── 02-configuration (18 topics)

BillingCenter (19 topics):
  └── 01-introduction (19 topics)

Common/Foundation (44 topics):
  ├── 001-guidewire-cloud (1 topic)
  ├── 002-surepath (2 topics)
  ├── 003-implementation-tools (1 topic)
  ├── 004-developer-fundamentals (22 topics)
  └── 005-integration (21 topics)
```

---

## 🗄️ Database Schema

### Topics Table Structure:
```sql
topics:
  - id (UUID)                 -- Auto-generated primary key
  - code (VARCHAR(50))        -- Sequential: pc-04-001, cc-01-001, common-001
  - product_id (UUID)         -- Links to products (BC, CC, COMMON, PC)
  - position (INTEGER)        -- Sequential order: 1, 2, 3...
  - title (VARCHAR(255))      -- Topic title
  - description (TEXT)        -- Topic description
  - prerequisites (JSONB)     -- Array of prerequisite codes: ["pc-01-001"]
  - duration_minutes (INT)    -- Estimated duration
  - content (JSONB)           -- File URLs: {slides_url, video_urls[], assignment_url}
  - published (BOOLEAN)       -- Visibility flag
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### Products Required:
```sql
- BC (BillingCenter)
- CC (ClaimCenter)
- COMMON (Foundation)  ← Must be created manually
- PC (PolicyCenter)
```

---

## 🚀 Import Process (3 Steps)

### Step 1: Create COMMON Product
**File**: `database/ADD-COMMON-PRODUCT.sql`

```bash
cat database/ADD-COMMON-PRODUCT.sql | pbcopy
# Paste into Supabase SQL Editor and run
```

Creates the Foundation product for Guidewire Cloud, SurePath, Developer Fundamentals, and Integration content.

---

### Step 2: Add Code Column
**File**: `database/FIX-TOPICS-SCHEMA.sql`

```bash
cat database/FIX-TOPICS-SCHEMA.sql | pbcopy
# Paste and run
```

- Adds `code` column (VARCHAR(50) UNIQUE)
- Creates index on code
- Truncates existing topics (clean slate)
- Sets up RLS policies

---

### Step 3: Import All Topics
**File**: `import-topics-fixed.sql`

```bash
cat import-topics-fixed.sql | pbcopy
# Paste and run (takes 10-20 seconds)
```

- Imports 160 topics with metadata
- Uses gen_random_uuid() for id
- Uses sequential codes for code column
- Handles conflicts with ON CONFLICT (code) DO UPDATE

---

## ✅ Verification Queries

```sql
-- Count total topics (should be 160)
SELECT COUNT(*) FROM topics;

-- Count by product
SELECT p.code, p.name, COUNT(t.id) as topics
FROM products p
LEFT JOIN topics t ON t.product_id = p.id
GROUP BY p.code, p.name
ORDER BY p.code;

-- Expected results:
-- BC     | BillingCenter | 19
-- CC     | ClaimCenter   | 37
-- COMMON | Foundation    | 44
-- PC     | PolicyCenter  | 58

-- View first 10 topics
SELECT code, title, position, published
FROM topics
ORDER BY position
LIMIT 10;

-- Check a specific topic
SELECT * FROM topics WHERE code = 'pc-01-001';
```

---

## 📦 Storage Setup

### Create Bucket:
1. Supabase Dashboard → Storage → New Bucket
2. Name: `training-content`
3. Public: ✅ Yes
4. File size limit: 100MB+
5. Allowed MIME types: .pptx, .mp4, .pdf, .docx, .xlsx

### Upload Content (Option 1 - CLI):
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login and link
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Upload all content
supabase storage upload training-content/ data/ --recursive
```

### Upload Content (Option 2 - Web UI):
1. Storage → training-content
2. Upload folder
3. Select folders from `data/`

---

## 🔗 Update Content URLs

After uploading files, update topics with actual URLs:

```sql
-- Example: Update one topic
UPDATE topics
SET content = jsonb_set(
  jsonb_set(
    content,
    '{slides_url}',
    '"https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-content/path/to/slides.pptx"'::jsonb
  ),
  '{video_urls}',
  '["https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-content/path/to/demo-01.mp4"]'::jsonb
)
WHERE code = 'pc-01-001';
```

For bulk updates, use the script approach documented in `SUPABASE-CONTENT-UPLOAD-GUIDE.md`.

---

## 🎯 Code Convention

### Sequential Codes Format:
```
Product Prefix + Module + Position
├── pc-01-001    (PolicyCenter, Module 01, Topic 001)
├── cc-02-020    (ClaimCenter, Module 02, Topic 020)
├── bc-01-001    (BillingCenter, Module 01, Topic 001)
└── common-001   (Foundation, Topic 001)
```

### File Structure in data/:
```
data/
├── Chapter 1 - Guidewire Cloud Overview/
├── Chapter 4 - Policy Center Introduction/
│   ├── In_policy_01/
│   │   ├── PC_Intro_01_Accounts.pptx
│   │   ├── In_policy_01_01.mp4
│   │   └── In_policy_01_02.mp4
│   └── ...
└── ...
```

Upload as-is to Supabase Storage. No reorganization needed!

---

## 📚 Detailed Documentation

- **`IMPORT-TOPICS-GUIDE.md`** - Step-by-step import with troubleshooting
- **`SUPABASE-CONTENT-UPLOAD-GUIDE.md`** - Three upload methods (Web, CLI, API)
- **`CONTENT-MIGRATION-SUMMARY.md`** - Complete inventory and workflow
- **`CONTENT-STRUCTURE-ANALYSIS.md`** - Original structure analysis
- **`CONTENT-STRUCTURE-COMPARISON.md`** - Option A vs B comparison

---

## 🐛 Common Errors & Fixes

### Error: "column 'icon' does not exist"
**Fix**: Column is `icon_url`, not `icon`. Already fixed in latest `ADD-COMMON-PRODUCT.sql`.

### Error: "null value in column 'product_id'"
**Fix**: Run `ADD-COMMON-PRODUCT.sql` first. COMMON product is missing.

### Error: "invalid input syntax for type uuid"
**Fix**: Use `import-topics-fixed.sql` (not `import-topics.sql`). Fixed version uses gen_random_uuid() for id column.

### Error: "column 'code' does not exist"
**Fix**: Run `FIX-TOPICS-SCHEMA.sql` before importing topics.

---

## 💡 Pro Tips

1. **Safe to re-run**: All scripts use `ON CONFLICT` or `IF NOT EXISTS`, so you can run them multiple times

2. **Test first**: Import one chapter/product, verify it works, then upload remaining content

3. **Keep originals**: Don't delete local `data/` folder until everything is verified in Supabase

4. **Version control**: Only commit SQL scripts and docs to Git, not the 73GB content files

5. **URL updates**: Can be done manually for a few topics or scripted for all 160

---

## 🔄 Update Workflow

To update existing content:

1. Upload new files to Supabase Storage
2. Update the topic's `content` JSONB with new URLs
3. Optionally keep old versions with `-v2` suffix for rollback

The `code` column ensures prerequisites stay valid even if file URLs change!

