-- Run this to create CMS tables
-- Execute via Supabase SQL Editor

-- ================================================================
-- CMS (CONTENT MANAGEMENT SYSTEM) SCHEMA
-- ================================================================
-- Purpose: Centralized content management for all website updates
-- Created: 2025-01-13
-- ================================================================

-- Enable necessary extensions if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION "uuid-ossp";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION "pgcrypto";
  END IF;
END
$$;

-- ================================================================
-- MEDIA ASSETS TABLE
-- ================================================================
-- Central repository for all uploaded files (images, videos, documents)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File Information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL, -- CDN URL
  thumbnail_url TEXT, -- For images/videos
  
  -- Metadata
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  
  -- Organization
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Upload info
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_assets_mime_type ON media_assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);

-- ================================================================
-- BLOG POSTS TABLE
-- ================================================================
-- Articles with full content management capabilities
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- Rich text/markdown
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_id UUID REFERENCES media_assets(id),
  
  -- Categorization
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  featured_image_id UUID REFERENCES media_assets(id),
  gallery_images UUID[] DEFAULT '{}', -- Array of media_asset IDs
  
  -- Author & Status
  author_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'archived')) DEFAULT 'draft',
  
  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER,
  enable_comments BOOLEAN DEFAULT true,
  
  -- Versions
  version INTEGER DEFAULT 1,
  published_version INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(excerpt, '') || ' ' ||
    COALESCE(content, '')
  )
);

-- ================================================================
-- BLOG POST VERSIONS TABLE
-- ================================================================
-- Track all versions of blog posts for revision history
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  
  -- Version info
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Change tracking
  changed_by UUID REFERENCES auth.users(id),
  change_summary TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, version)
);

CREATE INDEX IF NOT EXISTS idx_blog_versions_post ON blog_post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_versions_created ON blog_post_versions(created_at DESC);

-- ================================================================
-- RESOURCES TABLE
-- ================================================================
-- Downloadable content (whitepapers, case studies, guides)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('whitepaper', 'case_study', 'guide', 'ebook', 'template', 'webinar', 'other')) NOT NULL,
  
  -- File
  file_id UUID REFERENCES media_assets(id) NOT NULL,
  file_size_display TEXT, -- "2.5 MB"
  page_count INTEGER,
  
  -- Thumbnail/Cover
  thumbnail_id UUID REFERENCES media_assets(id),
  
  -- Categorization
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  industry TEXT[],
  
  -- Gating
  is_gated BOOLEAN DEFAULT false,
  required_fields TEXT[] DEFAULT '{}', -- ['email', 'company', 'phone']
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  -- Author
  author_id UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_industry ON resources USING GIN(industry);

-- ================================================================
-- BANNERS TABLE
-- ================================================================
-- Promotional banners with placement and scheduling
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_url TEXT,
  
  -- Design
  background_image_id UUID REFERENCES media_assets(id),
  background_color TEXT, -- hex color
  text_color TEXT, -- hex color
  overlay_opacity DECIMAL(3,2) DEFAULT 0.5,
  
  -- Placement
  placement TEXT CHECK (placement IN ('home_hero', 'home_banner', 'all_pages_top', 'all_pages_bottom', 'specific_pages')) NOT NULL,
  specific_pages TEXT[], -- page slugs if placement is 'specific_pages'
  
  -- Display Rules
  display_order INTEGER DEFAULT 0,
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  
  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Targeting
  target_audience TEXT[], -- ['new_visitors', 'returning_visitors', 'logged_in_users']
  
  -- Analytics
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN impression_count > 0 THEN (click_count::DECIMAL / impression_count) * 100
      ELSE 0
    END
  ) STORED,
  
  -- A/B Testing
  variant_name TEXT,
  experiment_id TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'expired')) DEFAULT 'draft',
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_placement ON banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

-- ================================================================
-- CMS PAGES TABLE
-- ================================================================
-- Dynamic page content management
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Page Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_slug TEXT, -- for nested pages
  
  -- Content Blocks (JSONB for flexibility)
  content_blocks JSONB DEFAULT '[]', -- Array of content blocks
  /*
  Example block structure:
  {
    "type": "hero|text|image|video|cta|testimonial|faq|contact_form",
    "order": 1,
    "content": {...},
    "settings": {...}
  }
  */
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_id UUID REFERENCES media_assets(id),
  
  -- Page Settings
  layout TEXT DEFAULT 'default',
  show_in_nav BOOLEAN DEFAULT true,
  nav_order INTEGER DEFAULT 0,
  
  -- Access Control
  is_public BOOLEAN DEFAULT true,
  allowed_roles TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_parent ON cms_pages(parent_slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_nav ON cms_pages(show_in_nav, nav_order);

-- ================================================================
-- RESOURCE DOWNLOADS TABLE
-- ================================================================
-- Track resource downloads for analytics
CREATE TABLE IF NOT EXISTS resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  
  -- User Info
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  company TEXT,
  phone TEXT,
  
  -- Additional captured data
  form_data JSONB DEFAULT '{}',
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamp
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON resource_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_date ON resource_downloads(downloaded_at DESC);

-- ================================================================
-- BANNER ANALYTICS TABLE
-- ================================================================
-- Track banner impressions and clicks
CREATE TABLE IF NOT EXISTS banner_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
  
  -- Event Type
  event_type TEXT CHECK (event_type IN ('impression', 'click')) NOT NULL,
  
  -- User Info
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  -- Context
  page_url TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner ON banner_analytics(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_type ON banner_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_date ON banner_analytics(created_at DESC);

-- ================================================================
-- AUDIT LOG TABLE
-- ================================================================
-- Track all admin actions for security and compliance
CREATE TABLE IF NOT EXISTS cms_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action Info
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'archive'
  entity_type TEXT NOT NULL, -- 'blog_post', 'resource', 'banner', 'page'
  entity_id UUID NOT NULL,
  entity_title TEXT,
  
  -- Change Details
  changes JSONB DEFAULT '{}', -- Before/after values
  
  -- User Info
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON cms_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON cms_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON cms_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_date ON cms_audit_log(created_at DESC);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  -- Media Assets
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_media_assets_updated_at') THEN
    CREATE TRIGGER update_media_assets_updated_at
      BEFORE UPDATE ON media_assets
      FOR EACH ROW
      EXECUTE FUNCTION update_cms_updated_at();
  END IF;

  -- Blog Posts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at') THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_cms_updated_at();
  END IF;

  -- Resources
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resources_updated_at') THEN
    CREATE TRIGGER update_resources_updated_at
      BEFORE UPDATE ON resources
      FOR EACH ROW
      EXECUTE FUNCTION update_cms_updated_at();
  END IF;

  -- Banners
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_banners_updated_at') THEN
    CREATE TRIGGER update_banners_updated_at
      BEFORE UPDATE ON banners
      FOR EACH ROW
      EXECUTE FUNCTION update_cms_updated_at();
  END IF;

  -- CMS Pages
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cms_pages_updated_at') THEN
    CREATE TRIGGER update_cms_pages_updated_at
      BEFORE UPDATE ON cms_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_cms_updated_at();
  END IF;
END
$$;

-- Function to create blog post version
CREATE OR REPLACE FUNCTION create_blog_post_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content or title changed
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO blog_post_versions (
      post_id, version, title, content, excerpt, changed_by
    ) VALUES (
      NEW.id, NEW.version, NEW.title, NEW.content, NEW.excerpt, auth.uid()
    );
    
    -- Increment version
    NEW.version = NEW.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog post versioning
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'blog_post_versioning') THEN
    CREATE TRIGGER blog_post_versioning
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION create_blog_post_version();
  END IF;
END
$$;

-- Function to track resource downloads
CREATE OR REPLACE FUNCTION track_resource_download(
  p_resource_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_form_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_download_id UUID;
BEGIN
  -- Insert download record
  INSERT INTO resource_downloads (
    resource_id, user_id, email, name, company, phone, form_data
  ) VALUES (
    p_resource_id, p_user_id, p_email, p_name, p_company, p_phone, p_form_data
  )
  RETURNING id INTO v_download_id;
  
  -- Update download count
  UPDATE resources 
  SET download_count = download_count + 1
  WHERE id = p_resource_id;
  
  RETURN v_download_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track banner analytics
CREATE OR REPLACE FUNCTION track_banner_event(
  p_banner_id UUID,
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert analytics record
  INSERT INTO banner_analytics (
    banner_id, event_type, user_id, session_id, page_url
  ) VALUES (
    p_banner_id, p_event_type, p_user_id, p_session_id, p_page_url
  );
  
  -- Update banner counters
  IF p_event_type = 'impression' THEN
    UPDATE banners 
    SET impression_count = impression_count + 1
    WHERE id = p_banner_id;
  ELSIF p_event_type = 'click' THEN
    UPDATE banners 
    SET click_count = click_count + 1
    WHERE id = p_banner_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log CMS actions
CREATE OR REPLACE FUNCTION log_cms_action(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_title TEXT,
  p_changes JSONB DEFAULT '{}'::jsonb,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Insert log record
  INSERT INTO cms_audit_log (
    action, entity_type, entity_id, entity_title, changes, user_id, user_email
  ) VALUES (
    p_action, p_entity_type, p_entity_id, p_entity_title, p_changes, p_user_id, v_user_email
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_audit_log ENABLE ROW LEVEL SECURITY;

-- Media Assets Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Anyone can view media assets') THEN
    CREATE POLICY "Anyone can view media assets"
      ON media_assets FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_assets' AND policyname = 'Admins can manage media assets') THEN
    CREATE POLICY "Admins can manage media assets"
      ON media_assets FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- Blog Posts Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Anyone can view published blog posts') THEN
    CREATE POLICY "Anyone can view published blog posts"
      ON blog_posts FOR SELECT
      USING (status = 'published' OR author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Authors can manage their own posts') THEN
    CREATE POLICY "Authors can manage their own posts"
      ON blog_posts FOR ALL
      USING (author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END
$$;

-- Resources Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'Anyone can view published resources') THEN
    CREATE POLICY "Anyone can view published resources"
      ON resources FOR SELECT
      USING (status = 'published' OR author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'Admins can manage resources') THEN
    CREATE POLICY "Admins can manage resources"
      ON resources FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- Banners Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Anyone can view active banners') THEN
    CREATE POLICY "Anyone can view active banners"
      ON banners FOR SELECT
      USING (is_active = true AND status = 'active');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admins can manage banners') THEN
    CREATE POLICY "Admins can manage banners"
      ON banners FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- CMS Pages Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_pages' AND policyname = 'Anyone can view public pages') THEN
    CREATE POLICY "Anyone can view public pages"
      ON cms_pages FOR SELECT
      USING (is_public = true AND status = 'published');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_pages' AND policyname = 'Admins can manage pages') THEN
    CREATE POLICY "Admins can manage pages"
      ON cms_pages FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END
$$;

-- Downloads and Analytics - Admin only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resource_downloads' AND policyname = 'Admins can view downloads') THEN
    CREATE POLICY "Admins can view downloads"
      ON resource_downloads FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resource_downloads' AND policyname = 'System can insert downloads') THEN
    CREATE POLICY "System can insert downloads"
      ON resource_downloads FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banner_analytics' AND policyname = 'Admins can view banner analytics') THEN
    CREATE POLICY "Admins can view banner analytics"
      ON banner_analytics FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banner_analytics' AND policyname = 'System can insert analytics') THEN
    CREATE POLICY "System can insert analytics"
      ON banner_analytics FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Audit Log - Admin only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_audit_log' AND policyname = 'Admins can view audit logs') THEN
    CREATE POLICY "Admins can view audit logs"
      ON cms_audit_log FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_audit_log' AND policyname = 'System can insert audit logs') THEN
    CREATE POLICY "System can insert audit logs"
      ON cms_audit_log FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_list ON blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_resources_list ON resources(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_banners_active_list ON banners(is_active, status, display_order) WHERE is_active = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_cms_pages_navigation ON cms_pages(status, show_in_nav, nav_order) WHERE status = 'published' AND show_in_nav = true;

-- ================================================================
-- INITIAL DATA
-- ================================================================

-- Add unique constraint for folder markers
CREATE UNIQUE INDEX IF NOT EXISTS uq_media_assets_folder_filename
ON media_assets (filename)
WHERE mime_type = 'folder';

-- Insert default media folders using WHERE NOT EXISTS pattern
INSERT INTO media_assets (filename, original_filename, file_size, mime_type, file_url, folder_path)
SELECT t.filename, t.original_filename, t.file_size, t.mime_type, t.file_url, t.folder_path
FROM (VALUES
  ('_folder_blogs', '_folder_blogs', 0, 'folder', '/', '/blogs'),
  ('_folder_resources', '_folder_resources', 0, 'folder', '/', '/resources'),
  ('_folder_banners', '_folder_banners', 0, 'folder', '/', '/banners'),
  ('_folder_pages', '_folder_pages', 0, 'folder', '/', '/pages')
) AS t(filename, original_filename, file_size, mime_type, file_url, folder_path)
WHERE NOT EXISTS (
  SELECT 1 FROM media_assets m
  WHERE m.filename = t.filename
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CMS schema created successfully!';
END
$$;
