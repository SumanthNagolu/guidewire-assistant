-- ================================================================
-- SETUP MEDIA STORAGE BUCKET
-- ================================================================
-- Run this in Supabase SQL Editor to create storage bucket for media

-- 1) Ensure the media bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Optional: basic grants (RLS still applies)
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;

-- 3) Create RLS policies on storage.objects

-- 3a) Anyone can view objects in the 'media' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view media'
  ) THEN
    CREATE POLICY "Public can view media"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'media');
  END IF;
END$$;

-- 3b) Authenticated users can upload to 'media'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can upload media'
  ) THEN
    CREATE POLICY "Authenticated can upload media"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'media'
        AND (SELECT auth.uid()) IS NOT NULL
      );
  END IF;
END$$;

-- 3c) Admins can update objects in 'media'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update media'
  ) THEN
    CREATE POLICY "Admins can update media"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'media'
        AND EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
        )
      )
      WITH CHECK (
        bucket_id = 'media'
        AND EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
        )
      );
  END IF;
END$$;

-- 3d) Admins can delete objects in 'media'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete media'
  ) THEN
    CREATE POLICY "Admins can delete media"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'media'
        AND EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = (SELECT auth.uid())
            AND up.role = 'admin'
        )
      );
  END IF;
END$$;

-- 4) Helpful indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket ON storage.objects(bucket_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media storage bucket configured successfully!';
END
$$;