# Content Upload & Delivery Guide

## Overview

This guide explains how to upload your course content (slides, videos, assignments) to Supabase Storage and make it available to users through the platform.

## 🎯 Quick Start

### Step 1: Organize Your Content

Place all content in the `data/` directory with this structure:

```
data/
  CC/                          # ClaimCenter
    cc-01-001/
      slides.pdf
      demo.mp4
      assignment.pdf
    cc-01-002/
      slides.pptx
      demo-01.mp4
      demo-02.mp4
      assignment.pdf
  PC/                          # PolicyCenter
    pc-01-001/
      slides.pdf
      demo.mp4
      assignment.pdf
  BC/                          # BillingCenter
    bc-01-001/
      ...
  FW/                          # Foundation
    fw-01-001/
      ...
```

**Naming Convention:**
- Product folder: `CC`, `PC`, `BC`, `FW`, `COMMON`
- Topic folder: Match the topic `code` from database (e.g., `cc-01-001`)
- Files: Any name, but recommended:
  - `slides.pdf` or `slides.pptx`
  - `demo.mp4`, `demo-01.mp4`, `demo-02.mp4`
  - `assignment.pdf`, `assignment-solution.pdf`

---

### Step 2: Create Storage Bucket in Supabase

Run this SQL in Supabase SQL Editor:

```sql
-- See: database/CREATE-STORAGE-BUCKET.sql
```

This creates:
- ✅ `course-content` bucket (private, 500MB file limit)
- ✅ RLS policies (authenticated users can read, service role can manage)
- ✅ Allowed MIME types (PDF, PPTX, MP4, DOCX, etc.)

**Verify:**
```sql
SELECT * FROM storage.buckets WHERE id = 'course-content';
```

---

### Step 3: Bulk Upload Content

Run the upload script:

```bash
npx tsx scripts/upload-content.ts
```

**What it does:**
1. Scans the `data/` directory recursively
2. Uploads all files to `course-content` bucket in Supabase Storage
3. Maintains the same folder structure (e.g., `CC/cc-01-001/slides.pdf`)
4. Shows progress with file sizes and success/failure status

**Output Example:**
```
🚀 Starting bulk content upload...

📂 Found 250 files to upload

📁 Processing: CC/cc-01-001/slides.pdf
   📤 Uploading CC/cc-01-001/slides.pdf (1234.56 KB)...
   ✅ Uploaded: CC/cc-01-001/slides.pdf

...

📊 Upload Summary:
============================================================
   Total Files:    250
   ✅ Successful:  248
   ❌ Failed:      2
   ⏭️  Skipped:     0
============================================================
```

**Troubleshooting:**
- **"Missing environment variables"**: Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- **"Bucket not found"**: Run Step 2 first (CREATE-STORAGE-BUCKET.sql)
- **"File size limit exceeded"**: Files must be < 500MB (adjust in SQL script if needed)
- **"Rate limit exceeded"**: Script has 100ms delay between uploads; increase if needed

---

### Step 4: Update Topic Content URLs

Run this SQL to link uploaded files to topics:

```sql
-- See: scripts/update-topic-content-urls.sql
```

This updates the `content` JSONB field in `topics` table:

**Before:**
```json
{
  "notes": "Introduction to Claims Process",
  "learning_objectives": ["Understand claim lifecycle", ...]
}
```

**After:**
```json
{
  "notes": "Introduction to Claims Process",
  "learning_objectives": ["Understand claim lifecycle", ...],
  "slides_url": "/api/content/CC/cc-01-001/slides.pdf",
  "demo_url": "/api/content/CC/cc-01-001/demo.mp4",
  "assignment_url": "/api/content/CC/cc-01-001/assignment.pdf"
}
```

**Verify:**
```sql
SELECT 
  p.code as product,
  t.code as topic_code,
  t.title,
  t.content->>'slides_url' as slides,
  t.content->>'demo_url' as demo
FROM public.topics t
JOIN public.products p ON t.product_id = p.id
WHERE t.content->>'slides_url' IS NOT NULL
LIMIT 10;
```

---

## 🔧 How Content Delivery Works

### Architecture

```
User Browser
    ↓
Topic Page (/topics/[id])
    ↓
Fetch: GET /api/content/CC/cc-01-001/slides.pdf
    ↓
API generates signed URL (valid 1 hour)
    ↓
Supabase Storage serves file
```

### Content Delivery API

**Endpoint:** `/api/content/{product}/{topic}/{filename}`

**Example Requests:**
```bash
GET /api/content/CC/cc-01-001/slides.pdf
GET /api/content/PC/pc-02-003/demo.mp4
GET /api/content/FW/fw-01-001/assignment.pdf
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://xxx.supabase.co/storage/v1/object/sign/course-content/CC/cc-01-001/slides.pdf?token=...",
    "path": "CC/cc-01-001/slides.pdf",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not logged in
- `400 Bad Request`: Invalid path format
- `500 Internal Server Error`: File not found or storage error

### Caching Strategy

- **Signed URLs**: Valid for 1 hour (3600 seconds)
- **API Response**: Cached for 50 minutes (3000 seconds)
- **Why 50 minutes?**: Ensures cached URLs don't expire before browser cache

### Security

- ✅ **Authentication Required**: Only logged-in users can access content
- ✅ **Private Bucket**: Files not publicly accessible
- ✅ **Signed URLs**: Time-limited access tokens
- ✅ **RLS Policies**: Database-level access control

---

## 📊 File Size Recommendations

| File Type | Recommended Size | Max Size |
|-----------|------------------|----------|
| PDF Slides | 5-20 MB | 50 MB |
| PPTX Slides | 10-50 MB | 100 MB |
| Demo Videos (MP4) | 50-200 MB | 500 MB |
| Assignments (PDF) | 1-5 MB | 20 MB |

**Optimization Tips:**
1. **Videos**: Compress to H.264, 720p, 1-2 Mbps bitrate
2. **PDFs**: Use "Save As Optimized PDF" in Adobe Acrobat
3. **PPTXs**: Compress images before embedding

---

## 🔄 Updating Content

### Replace a Single File

1. **Delete old file** (Supabase Storage UI or SQL):
   ```sql
   DELETE FROM storage.objects 
   WHERE bucket_id = 'course-content' 
   AND name = 'CC/cc-01-001/slides.pdf';
   ```

2. **Upload new file**:
   ```bash
   npx tsx scripts/upload-content.ts
   # Or upload via Supabase Dashboard
   ```

3. **No database update needed** (URL stays the same)

### Update All Content

1. Replace files in `data/` directory
2. Run bulk upload script (with `upsert: true`)
3. URLs automatically point to new files

---

## 🚨 Common Issues

### Issue: "File not found" when accessing content
**Solution:** Verify file exists in storage:
```sql
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'course-content' 
  AND name LIKE 'CC/cc-01-001/%';
```

### Issue: Video won't play
**Possible Causes:**
1. Wrong MIME type → Check `getContentType()` in upload script
2. File corrupted during upload → Re-upload
3. Browser doesn't support codec → Use H.264 MP4

### Issue: Upload script fails with "bucket not found"
**Solution:** Run `CREATE-STORAGE-BUCKET.sql` first

### Issue: Slow video playback
**Solutions:**
1. Compress videos to lower bitrate
2. Use Supabase CDN (automatically enabled)
3. Consider external video hosting (YouTube, Vimeo, Loom) for large files

---

## 📈 Cost Estimates (Supabase Storage)

### Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **Egress**: $0.09/GB after limit

### Paid Tier (Pro: $25/month)
- **Storage**: 100 GB included
- **Bandwidth**: 200 GB/month included

### Example Calculation (100 users)
- **250 topics** × 100 MB avg = 25 GB storage
- **100 users** × 10 topics/month × 100 MB = 100 GB bandwidth
- **Cost**: $25/month (Pro plan) + 0 (within limits)

---

## 🎯 Best Practices

1. **Consistent Naming**: Use lowercase, hyphens (not spaces)
2. **Folder Structure**: Match database topic codes exactly
3. **File Formats**: Prefer PDF over PPTX, MP4 over MOV
4. **Compression**: Always compress before uploading
5. **Backup**: Keep original files outside `data/` folder
6. **Testing**: Test a few topics before bulk upload
7. **Monitoring**: Check Supabase Storage usage monthly

---

## 🔗 Alternative: External Hosting

For very large video files (>500MB), consider:

1. **YouTube (Unlisted)**
   - Free, unlimited storage
   - Excellent CDN
   - Update `content.video_url` to YouTube embed URL

2. **Vimeo**
   - Better for professional content
   - No ads
   - Private videos supported

3. **Loom**
   - Great for screen recordings
   - Easy sharing
   - Embed support

**Update topic manually:**
```sql
UPDATE topics
SET content = jsonb_set(
  content,
  '{video_url}',
  '"https://www.youtube.com/watch?v=VIDEO_ID"'::jsonb,
  true
)
WHERE code = 'cc-01-001';
```

---

## ✅ Post-Upload Checklist

- [ ] Storage bucket created in Supabase
- [ ] RLS policies enabled
- [ ] All files uploaded successfully
- [ ] Topic `content` URLs updated
- [ ] Test 2-3 topics end-to-end:
  - [ ] Slides load
  - [ ] Videos play
  - [ ] Assignments download
- [ ] Verify signed URLs work (check API response)
- [ ] Monitor Supabase Storage usage

---

**Need Help?** Check:
- Supabase Dashboard → Storage → course-content
- Browser DevTools → Network tab (check API calls)
- Supabase Logs (for storage errors)

