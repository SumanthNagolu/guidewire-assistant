# Database Setup & Content Seeding Guide

This guide walks through setting up the database schema and seeding ClaimCenter content for Sprint 3.

## Prerequisites

1. **Supabase Project** created and configured
2. **Environment variables** set in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Step 1: Apply Database Schema

The schema includes all necessary tables, RLS policies, and reminder system tables.

### Option A: Via Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database/schema.sql`
4. Paste and click **Run**
5. Verify no errors in the output

### Option B: Via Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

## Step 2: Verify Database Setup

Before seeding content, verify that all tables are properly created:

```bash
npm run db:verify
```

**Expected output:**
```
🔍 Verifying database setup for Sprint 3...

✅ Environment variables configured
✅ Products table ready (found: ClaimCenter)
✅ Reminder tables exist
⚠️  No ClaimCenter topics found in database (ready to seed)

✅ Database is ready for topic seeding!
```

### Troubleshooting

If verification fails:

- **Missing products:** Run `schema.sql` step to seed the products table
- **Missing reminder tables:** Re-run the schema; reminder tables were added in Sprint 3
- **Connection errors:** Check your `.env.local` credentials

## Step 3: Seed ClaimCenter Topics

The seeding script reads `data/claimcenter-topics.json` and inserts 50+ ClaimCenter topics with proper prerequisite chains.

### Run the Seed Script

```bash
npm run seed:claimcenter
```

**Expected output:**
```
✅ Imported 50 topics successfully.
```

### Verify Seeding

1. **Via Supabase Dashboard:**
   - Navigate to **Table Editor** → `topics`
   - Filter by `product_id` = ClaimCenter
   - Verify topics appear with proper positions (1-50)

2. **Via App UI:**
   - Start dev server: `npm run dev`
   - Login as admin
   - Navigate to `/topics?product=CC`
   - Verify topics render with titles, descriptions, and learning objectives

3. **Re-run verification script:**
   ```bash
   npm run db:verify
   ```
   
   Should now show:
   ```
   ✅ Found 50 existing ClaimCenter topics
      First topic: "ClaimCenter Orientation & Navigation"
   ```

## Step 4: Validate Prerequisites

Ensure the sequential learning logic works:

1. Login as a **regular user** (not admin)
2. Navigate to **Topics**
3. Verify only Topic 1 is unlocked
4. Complete Topic 1
5. Verify Topic 2 becomes unlocked
6. Verify Topic 3 remains locked until Topic 2 is completed

## Content Schema

Each topic follows this structure:

```json
{
  "id": "uuid-v4",
  "product_code": "CC",
  "position": 1,
  "title": "Topic Title",
  "description": "Brief description",
  "duration_minutes": 25,
  "prerequisites": ["uuid-of-prerequisite-topic"],
  "content": {
    "video_url": "https://youtube.com/...",
    "slides_url": "https://slides.example.com/...",
    "learning_objectives": [
      "Objective 1",
      "Objective 2"
    ]
  },
  "published": true
}
```

## Re-seeding / Updates

The seed script uses `upsert` based on topic `id`, so:

- **New topics:** Added to database
- **Existing topics:** Updated with new data
- **Deleted topics:** Remain in database (manual cleanup required)

To update content:

1. Edit `data/claimcenter-topics.json`
2. Re-run: `npm run seed:claimcenter`
3. Changes propagate to database

## Bulk Operations

### Seeding Custom Topics

You can seed from a different file:

```bash
npm run seed:claimcenter path/to/custom-topics.json
```

### Admin UI Upload

Alternatively, use the admin dashboard:

1. Login as admin
2. Navigate to `/admin/topics`
3. Upload JSON file via the form
4. Review import results

## Common Issues

### Duplicate Position Errors

**Error:** `Duplicate position X detected for product CC`

**Solution:** Ensure each topic has a unique `position` value within the same `product_code`.

### Missing Prerequisites

**Error:** `Topic "X" references missing prerequisites: [uuid]`

**Solution:** 
- Ensure all prerequisite IDs exist in the topics array
- Prerequisite topics must be defined before dependent topics

### RLS Policy Errors

**Error:** `new row violates row-level security policy`

**Solution:** Use the service role key (not anon key) when seeding. The script automatically handles this.

## Next Steps

After successful seeding:

1. ✅ Verify topics render in UI
2. ✅ Test sequential locks
3. ✅ Test AI mentor with topic context
4. ✅ Review admin dashboard analytics
5. ✅ Begin beta learner onboarding

---

**Related Files:**
- `database/schema.sql` - Full database schema
- `scripts/seed-claimcenter.ts` - Seeding script
- `scripts/verify-db-setup.ts` - Verification script
- `data/claimcenter-topics.json` - Content source
- `modules/topics/admin.ts` - Ingestion logic

