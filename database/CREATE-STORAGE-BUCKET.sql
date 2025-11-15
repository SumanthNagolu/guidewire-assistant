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