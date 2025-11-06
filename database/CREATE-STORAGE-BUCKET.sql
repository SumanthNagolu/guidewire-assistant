-- Create Storage Bucket for Course Content
-- Run this in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-content',
  'course-content',
  false, -- Private bucket (requires signed URLs)
  524288000, -- 500 MB max file size
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- .pptx
    'application/vnd.ms-powerpoint', -- .ppt
    'video/mp4',
    'video/quicktime', -- .mov
    'video/x-msvideo', -- .avi
    'video/webm',
    'application/msword', -- .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' -- .docx
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read from course-content bucket
CREATE POLICY "Authenticated users can read course content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-content');

-- Policy: Service role can upload files (for admin/bulk upload)
CREATE POLICY "Service role can upload course content"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'course-content');

-- Policy: Service role can update files
CREATE POLICY "Service role can update course content"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'course-content');

-- Policy: Service role can delete files
CREATE POLICY "Service role can delete course content"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'course-content');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'course-content';

-- Verify policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

