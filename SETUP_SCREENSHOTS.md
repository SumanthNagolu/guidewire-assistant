# Setup Screenshots Storage in Supabase

## 1. Create Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create storage bucket for productivity screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productivity-screenshots',
  'productivity-screenshots',
  true, -- Make public for easy access
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

## 2. Set up RLS Policies

Then run these policies:

```sql
-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productivity-screenshots' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'productivity-screenshots' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'productivity-screenshots' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Public access for viewing (since bucket is public)
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'productivity-screenshots');
```

## 3. Test the Setup

The desktop agent will:
1. Capture screenshots every 30 seconds (for testing)
2. Upload them to Supabase Storage
3. Save metadata to the `productivity_screenshots` table
4. Display them in the dashboard at http://localhost:3000/productivity/insights

## Current Status

✅ Desktop agent is running
✅ API endpoints are configured with test-key authentication
✅ Screenshot capture is set to 30-second intervals for testing
✅ Activity tracking is working

## Viewing Data

1. Open http://localhost:3000/productivity/insights
2. You should see:
   - Activity metrics (keystrokes, mouse movements)
   - Application usage
   - Screenshots (after they're captured and uploaded)

## Troubleshooting

If screenshots aren't appearing:
1. Check the Electron app console for errors
2. Verify the storage bucket exists in Supabase
3. Check the API logs in the Next.js terminal
4. Ensure the test user exists in `user_profiles` table


