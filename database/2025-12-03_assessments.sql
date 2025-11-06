-- Sprint 4 baseline migration: quizzes + interview simulator

-- Helper function to check admin role (idempotent)
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

-- Quiz scaffolding ---------------------------------------------------------

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

ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE;

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_product ON quizzes(product_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
CREATE POLICY "Admins can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON quiz_attempts;
CREATE POLICY "Admins can view all quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view quiz questions" ON quiz_questions;
CREATE POLICY "Authenticated users can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view active quizzes" ON quizzes;
CREATE POLICY "Authenticated users can view active quizzes"
  ON quizzes FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  USING (public.is_admin());

-- Interview simulator tables -----------------------------------------------

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

CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'interviewer', 'candidate')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_interview_templates_product ON interview_templates(product_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_messages_session ON interview_messages(session_id, created_at);

ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active interview templates" ON interview_templates;
CREATE POLICY "Authenticated users can view active interview templates"
  ON interview_templates FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage interview templates" ON interview_templates;
CREATE POLICY "Admins can manage interview templates"
  ON interview_templates FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own interview sessions" ON interview_sessions;
CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create interview sessions" ON interview_sessions;
CREATE POLICY "Users can create interview sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interview sessions" ON interview_sessions;
CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view interview sessions" ON interview_sessions;
CREATE POLICY "Admins can view interview sessions"
  ON interview_sessions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view messages in own interview sessions" ON interview_messages;
CREATE POLICY "Users can view messages in own interview sessions"
  ON interview_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_messages.session_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in own interview sessions" ON interview_messages;
CREATE POLICY "Users can insert messages in own interview sessions"
  ON interview_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_messages.session_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view interview messages" ON interview_messages;
CREATE POLICY "Admins can view interview messages"
  ON interview_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view feedback for own interview sessions" ON interview_feedback;
CREATE POLICY "Users can view feedback for own interview sessions"
  ON interview_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_feedback.session_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage interview feedback" ON interview_feedback;
CREATE POLICY "Admins can manage interview feedback"
  ON interview_feedback FOR ALL
  USING (public.is_admin());

-- Trigger wiring -----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_interview_templates_updated_at BEFORE UPDATE ON interview_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

