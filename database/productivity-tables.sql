-- ================================================================
-- PRODUCTIVITY MONITORING TABLES
-- ================================================================
-- These tables support the desktop monitoring agent and productivity dashboard
-- Created: November 11, 2025

-- ================================================================
-- 1. PRODUCTIVITY SESSIONS
-- ================================================================
-- Tracks individual productivity sessions with activity metrics
CREATE TABLE IF NOT EXISTS productivity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  mouse_movements INTEGER DEFAULT 0,
  keystrokes INTEGER DEFAULT 0,
  active_time INTEGER DEFAULT 0, -- in seconds
  idle_time INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_productivity_sessions_user_id ON productivity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_sessions_start_time ON productivity_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_productivity_sessions_user_date ON productivity_sessions(user_id, start_time);

-- Row Level Security
ALTER TABLE productivity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own productivity sessions"
  ON productivity_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity sessions"
  ON productivity_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity sessions"
  ON productivity_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- 2. PRODUCTIVITY APPLICATIONS
-- ================================================================
-- Tracks application usage with window titles and duration
CREATE TABLE IF NOT EXISTS productivity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name VARCHAR(255) NOT NULL,
  window_title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_productivity_applications_user_id ON productivity_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_applications_app_name ON productivity_applications(app_name);
CREATE INDEX IF NOT EXISTS idx_productivity_applications_start_time ON productivity_applications(start_time);
CREATE INDEX IF NOT EXISTS idx_productivity_applications_user_date ON productivity_applications(user_id, start_time);

-- Row Level Security
ALTER TABLE productivity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own application usage"
  ON productivity_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application usage"
  ON productivity_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 3. PRODUCTIVITY SCREENSHOTS
-- ================================================================
-- Stores screenshot metadata with URLs from Supabase Storage
CREATE TABLE IF NOT EXISTS productivity_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  file_size INTEGER, -- in bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_user_id ON productivity_screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_captured_at ON productivity_screenshots(captured_at);
CREATE INDEX IF NOT EXISTS idx_productivity_screenshots_user_date ON productivity_screenshots(user_id, captured_at);

-- Row Level Security
ALTER TABLE productivity_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own screenshots"
  ON productivity_screenshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own screenshots"
  ON productivity_screenshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 4. COMPANION CONVERSATIONS
-- ================================================================
-- Tracks AI companion conversations (Guidewire Guru, etc.)
CREATE TABLE IF NOT EXISTS companion_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name VARCHAR(100) NOT NULL, -- 'guidewire-guru', 'debugging-studio', etc.
  capability VARCHAR(50), -- 'resume', 'debugging', 'interview', etc.
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companion_conversations_user_id ON companion_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_conversations_agent_name ON companion_conversations(agent_name);
CREATE INDEX IF NOT EXISTS idx_companion_conversations_created_at ON companion_conversations(created_at);

-- Row Level Security
ALTER TABLE companion_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companion conversations"
  ON companion_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own companion conversations"
  ON companion_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companion conversations"
  ON companion_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================================
-- 5. COMPANION MESSAGES
-- ================================================================
-- Stores individual messages within companion conversations
CREATE TABLE IF NOT EXISTS companion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES companion_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  model_used VARCHAR(50), -- 'gpt-4o', 'claude-3.5-sonnet', etc.
  tokens_used INTEGER,
  sources JSONB DEFAULT '[]', -- Knowledge base sources used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companion_messages_conversation_id ON companion_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_companion_messages_created_at ON companion_messages(created_at);

-- Row Level Security
ALTER TABLE companion_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON companion_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companion_conversations
      WHERE companion_conversations.id = companion_messages.conversation_id
      AND companion_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their conversations"
  ON companion_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companion_conversations
      WHERE companion_conversations.id = companion_messages.conversation_id
      AND companion_conversations.user_id = auth.uid()
    )
  );

-- ================================================================
-- 6. STORAGE BUCKET FOR SCREENSHOTS
-- ================================================================
-- Create storage bucket for productivity screenshots
-- Run this in Supabase SQL Editor or via Supabase dashboard

INSERT INTO storage.buckets (id, name, public)
VALUES ('productivity-screenshots', 'productivity-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'productivity-screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'productivity-screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'productivity-screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE productivity_sessions IS 'Tracks user productivity sessions with activity metrics';
COMMENT ON TABLE productivity_applications IS 'Records application usage with window tracking';
COMMENT ON TABLE productivity_screenshots IS 'Stores screenshot metadata from desktop agent';
COMMENT ON TABLE companion_conversations IS 'Manages AI companion conversation sessions';
COMMENT ON TABLE companion_messages IS 'Stores individual messages in companion conversations';

-- ================================================================
-- DONE
-- ================================================================
-- All tables created with proper indexes and RLS policies
-- Remember to run this in your Supabase SQL Editor

