-- Guidewire Training Platform - Database Schema
-- PostgreSQL with Supabase Extensions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Products table (ClaimCenter, PolicyCenter, BillingCenter)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'CC', 'PC', 'BC'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table (250 sequential topics)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Sequential order (1-250)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prerequisites JSONB DEFAULT '[]'::jsonb, -- Array of topic IDs
  duration_minutes INTEGER DEFAULT 60,
  content JSONB DEFAULT '{}'::jsonb, -- Flexible content structure
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, position)
);

-- Create index for faster topic queries
CREATE INDEX IF NOT EXISTS idx_topics_product_position ON topics(product_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_published ON topics(published) WHERE published = true;

-- Content structure in JSONB:
-- {
--   "video_url": "https://youtube.com/...",
--   "slides_url": "https://...",
--   "notes": "Markdown content...",
--   "learning_objectives": ["Objective 1", "Objective 2"],
--   "demo_video_url": "https://...",
--   "additional_resources": []
-- }

-- ============================================================================
-- USER MANAGEMENT
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  assumed_persona VARCHAR(255), -- e.g., "10 years experienced"
  resume_url TEXT,
  preferred_product_id UUID REFERENCES products(id),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Learner reminder preferences
CREATE TABLE IF NOT EXISTS learner_reminder_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  opted_in BOOLEAN DEFAULT false,
  last_opt_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder delivery logs
CREATE TABLE IF NOT EXISTS learner_reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_user ON learner_reminder_logs(user_id, delivered_at DESC);

ALTER TABLE learner_reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reminder settings" ON learner_reminder_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage reminder settings" ON learner_reminder_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update reminder settings" ON learner_reminder_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view reminder logs" ON learner_reminder_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts reminder logs" ON learner_reminder_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Beta feedback entries
CREATE TABLE IF NOT EXISTS beta_feedback_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  biggest_win TEXT,
  biggest_blocker TEXT,
  help_requested TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_submitted_at
  ON beta_feedback_entries(user_id, submitted_at DESC);

ALTER TABLE beta_feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback" ON beta_feedback_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view feedback" ON beta_feedback_entries
  FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- PROGRESS TRACKING
-- ============================================================================

-- Topic completions (granular progress tracking)
CREATE TABLE IF NOT EXISTS topic_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent_seconds INTEGER DEFAULT 0,
  video_progress_seconds INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Indexes for fast progress queries
CREATE INDEX IF NOT EXISTS idx_completions_user_topic ON topic_completions(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_completions_user_completed ON topic_completions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_completions_topic ON topic_completions(topic_id);

-- Materialized view for aggregated user progress (100x faster than on-the-fly calculations)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_progress AS
SELECT
  user_id,
  product_id,
  COUNT(DISTINCT t.id) as total_topics,
  COUNT(DISTINCT CASE WHEN tc.completed_at IS NOT NULL THEN tc.topic_id END) as completed_topics,
  ROUND(
    (COUNT(DISTINCT CASE WHEN tc.completed_at IS NOT NULL THEN tc.topic_id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT t.id), 0)) * 100, 
    2
  ) as completion_percentage,
  SUM(COALESCE(tc.time_spent_seconds, 0)) as total_time_seconds
FROM topics t
LEFT JOIN topic_completions tc ON t.id = tc.topic_id
WHERE t.published = true
GROUP BY user_id, product_id;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_progress ON mv_user_progress(user_id, product_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_progress()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AI CONVERSATIONS
-- ============================================================================

-- AI conversations (chat sessions)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) NOT NULL CHECK (conversation_type IN ('mentor', 'interview', 'general')),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversation queries
CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON ai_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_topic ON ai_conversations(topic_id);

-- AI messages (individual messages in conversations)
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model_used VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON ai_messages(created_at);

-- ============================================================================
-- ASSESSMENTS (QUIZZES & ASSIGNMENTS)
-- ============================================================================

-- Quiz definitions (groups of questions)
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  passing_percentage INTEGER DEFAULT 70 CHECK (passing_percentage BETWEEN 0 AND 100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_product ON quizzes(product_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'drag_drop')),
  question_text TEXT NOT NULL,
  options JSONB, -- For multiple choice: ["Option A", "Option B", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE;

-- Index for quiz queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- Quiz attempts (user quiz submissions)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  answers JSONB NOT NULL, -- Store user's answers
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;

-- Indexes for quiz attempt queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- =========================================================================
-- INTERVIEW SIMULATOR TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS interview_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  persona VARCHAR(100),
  focus_area VARCHAR(100),
  rubric JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_templates_product ON interview_templates(product_id);
CREATE INDEX IF NOT EXISTS idx_interview_templates_active ON interview_templates(is_active);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES interview_templates(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  readiness_score DECIMAL(5,2),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);

CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'interviewer', 'candidate')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_messages_session ON interview_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  summary TEXT,
  strengths TEXT,
  improvements TEXT,
  recommendations TEXT,
  rubric_scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has completed prerequisites for a topic
CREATE OR REPLACE FUNCTION check_prerequisites(p_user_id UUID, p_topic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prerequisites_met BOOLEAN;
BEGIN
  -- Get the topic's prerequisites
  SELECT COALESCE(
    (SELECT COUNT(*) = 0
     FROM topics t
     CROSS JOIN LATERAL jsonb_array_elements_text(t.prerequisites) AS prereq_id
     WHERE t.id = p_topic_id
     AND NOT EXISTS (
       SELECT 1 FROM topic_completions tc
       WHERE tc.user_id = p_user_id
       AND tc.topic_id = prereq_id::UUID
       AND tc.completed_at IS NOT NULL
     )), 
    TRUE  -- If no prerequisites, return true
  ) INTO prerequisites_met;
  
  RETURN prerequisites_met;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's next recommended topic
CREATE OR REPLACE FUNCTION get_next_topic(p_user_id UUID, p_product_id UUID)
RETURNS UUID AS $$
DECLARE
  next_topic_id UUID;
BEGIN
  SELECT t.id INTO next_topic_id
  FROM topics t
  LEFT JOIN topic_completions tc ON t.id = tc.topic_id AND tc.user_id = p_user_id
  WHERE t.product_id = p_product_id
    AND t.published = true
    AND tc.completed_at IS NULL  -- Not completed
    AND check_prerequisites(p_user_id, t.id)  -- Prerequisites met
  ORDER BY t.position ASC
  LIMIT 1;
  
  RETURN next_topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update topic completion
CREATE OR REPLACE FUNCTION update_topic_completion(
  p_user_id UUID,
  p_topic_id UUID,
  p_completion_percentage INTEGER DEFAULT 100,
  p_time_spent_seconds INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert or update completion record
  INSERT INTO topic_completions (user_id, topic_id, completion_percentage, time_spent_seconds, completed_at)
  VALUES (
    p_user_id, 
    p_topic_id, 
    p_completion_percentage,
    p_time_spent_seconds,
    CASE WHEN p_completion_percentage >= 100 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, topic_id) 
  DO UPDATE SET
    completion_percentage = GREATEST(topic_completions.completion_percentage, p_completion_percentage),
    time_spent_seconds = topic_completions.time_spent_seconds + p_time_spent_seconds,
    completed_at = CASE 
      WHEN p_completion_percentage >= 100 AND topic_completions.completed_at IS NULL 
      THEN NOW() 
      ELSE topic_completions.completed_at 
    END,
    updated_at = NOW()
  RETURNING jsonb_build_object(
    'id', id,
    'completion_percentage', completion_percentage,
    'completed_at', completed_at,
    'time_spent_seconds', time_spent_seconds
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Products table (public read access)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_admin());

-- Topics policies
CREATE POLICY "Published topics are viewable by authenticated users"
  ON topics FOR SELECT
  USING (published = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage topics"
  ON topics FOR ALL
  USING (public.is_admin());

-- Topic completions policies
CREATE POLICY "Users can view own completions"
  ON topic_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON topic_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON topic_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all completions
CREATE POLICY "Admins can view all completions"
  ON topic_completions FOR SELECT
  USING (public.is_admin());

-- AI conversations policies
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can view messages in own conversations"
  ON ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Quiz questions policies
CREATE POLICY "Authenticated users can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (public.is_admin());

-- Quizzes policies
CREATE POLICY "Authenticated users can view active quizzes"
  ON quizzes FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  USING (public.is_admin());

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all quiz attempts
CREATE POLICY "Admins can view all quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (public.is_admin());

-- Interview template policies
CREATE POLICY "Authenticated users can view active interview templates"
  ON interview_templates FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage interview templates"
  ON interview_templates FOR ALL
  USING (public.is_admin());

-- Interview session policies
CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create interview sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view interview sessions"
  ON interview_sessions FOR SELECT
  USING (public.is_admin());

-- Interview messages policies
CREATE POLICY "Users can view messages in own interview sessions"
  ON interview_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_messages.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own interview sessions"
  ON interview_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_messages.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view interview messages"
  ON interview_messages FOR SELECT
  USING (public.is_admin());

-- Interview feedback policies
CREATE POLICY "Users can view feedback for own interview sessions"
  ON interview_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_feedback.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage interview feedback"
  ON interview_feedback FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_completions_updated_at BEFORE UPDATE ON topic_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_templates_updated_at BEFORE UPDATE ON interview_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learner_reminder_settings_updated_at BEFORE UPDATE ON learner_reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert products
INSERT INTO products (code, name, description) VALUES
  ('CC', 'ClaimCenter', 'Guidewire ClaimCenter - Claims management platform'),
  ('PC', 'PolicyCenter', 'Guidewire PolicyCenter - Policy administration platform'),
  ('BC', 'BillingCenter', 'Guidewire BillingCenter - Billing and payments platform')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Materialized view refresh:
-- Run periodically (e.g., every hour or after significant progress updates):
-- SELECT refresh_user_progress();

-- To manually refresh the view:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress;

-- Cost monitoring query:
-- SELECT 
--   DATE_TRUNC('day', created_at) as date,
--   model_used,
--   SUM(tokens_used) as total_tokens,
--   COUNT(*) as message_count
-- FROM ai_messages
-- GROUP BY DATE_TRUNC('day', created_at), model_used
-- ORDER BY date DESC;

