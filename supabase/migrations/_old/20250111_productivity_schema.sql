-- ============================================================================
-- PRODUCTIVITY & SCRUM ECOSYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Description: Comprehensive schema for employee monitoring, email/call analytics,
--              scrum management, AI bot, and productivity tracking
-- Created: 2025-01-11
-- ============================================================================

-- ============================================================================
-- ACTIVITY TRACKING TABLES
-- ============================================================================

-- Activity logs: Track employee computer activity (apps, websites, idle time)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Application tracking
  active_app_name TEXT,
  active_app_title TEXT,
  app_category TEXT CHECK (app_category IN ('productive', 'neutral', 'unproductive', 'unknown')),
  
  -- Website tracking
  active_url TEXT,
  url_domain TEXT,
  
  -- Activity metrics
  is_idle BOOLEAN DEFAULT FALSE,
  idle_duration_seconds INTEGER DEFAULT 0,
  keystrokes_count INTEGER DEFAULT 0,
  mouse_clicks_count INTEGER DEFAULT 0,
  
  -- Session info
  session_id UUID,
  device_name TEXT,
  os_type TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast queries
  CONSTRAINT activity_logs_timestamp_idx CHECK (timestamp IS NOT NULL)
);

CREATE INDEX idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp DESC);
CREATE INDEX idx_activity_logs_session ON activity_logs(session_id);
CREATE INDEX idx_activity_logs_category ON activity_logs(app_category);

-- Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================

-- Productivity snapshots: Store periodic screenshots with metadata
CREATE TABLE IF NOT EXISTS productivity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Screenshot storage
  screenshot_url TEXT, -- Supabase Storage URL
  screenshot_thumbnail_url TEXT,
  
  -- Context at time of screenshot
  active_app_name TEXT,
  active_app_title TEXT,
  active_url TEXT,
  
  -- Privacy & consent
  is_sensitive BOOLEAN DEFAULT FALSE,
  blur_applied BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  file_size_bytes INTEGER,
  retention_until TIMESTAMPTZ, -- Auto-delete after 30 days
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_retention CHECK (retention_until > created_at)
);

CREATE INDEX idx_snapshots_user_timestamp ON productivity_snapshots(user_id, timestamp DESC);
CREATE INDEX idx_snapshots_retention ON productivity_snapshots(retention_until);

-- Row Level Security
ALTER TABLE productivity_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON productivity_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all snapshots"
  ON productivity_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own snapshots"
  ON productivity_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EMAIL & CALL ANALYTICS TABLES
-- ============================================================================

-- Email analytics: Daily aggregated email metrics from Outlook
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Email counts
  emails_sent INTEGER DEFAULT 0,
  emails_received INTEGER DEFAULT 0,
  emails_read INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  
  -- Response metrics
  avg_response_time_hours DECIMAL(10, 2),
  median_response_time_hours DECIMAL(10, 2),
  
  -- Thread participation
  threads_participated INTEGER DEFAULT 0,
  
  -- Meeting metrics
  meetings_scheduled INTEGER DEFAULT 0,
  meetings_attended INTEGER DEFAULT 0,
  total_meeting_duration_minutes INTEGER DEFAULT 0,
  
  -- Calendar utilization
  calendar_utilization_percent DECIMAL(5, 2),
  
  -- Integration metadata
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT CHECK (sync_status IN ('success', 'failed', 'pending')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_email_analytics_user_date ON email_analytics(user_id, date DESC);

-- Row Level Security
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email analytics"
  ON email_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email analytics"
  ON email_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================

-- Call analytics: Daily aggregated call metrics from Dialpad
CREATE TABLE IF NOT EXISTS call_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Call counts
  total_calls INTEGER DEFAULT 0,
  inbound_calls INTEGER DEFAULT 0,
  outbound_calls INTEGER DEFAULT 0,
  
  -- Call outcomes
  answered_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  voicemail_calls INTEGER DEFAULT 0,
  
  -- Call duration
  total_call_duration_minutes INTEGER DEFAULT 0,
  avg_call_duration_minutes DECIMAL(10, 2),
  longest_call_duration_minutes INTEGER DEFAULT 0,
  
  -- Call quality
  avg_call_quality_score DECIMAL(3, 2), -- 0-5 scale
  
  -- Top contacts (JSON array of objects)
  top_contacts JSONB DEFAULT '[]'::jsonb,
  
  -- Integration metadata
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT CHECK (sync_status IN ('success', 'failed', 'pending')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_call_analytics_user_date ON call_analytics(user_id, date DESC);

-- Row Level Security
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own call analytics"
  ON call_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all call analytics"
  ON call_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SCRUM MANAGEMENT TABLES
-- ============================================================================

-- Sprints: Sprint planning and tracking
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sprint_number INTEGER,
  
  -- Sprint dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Sprint goals
  goal TEXT,
  description TEXT,
  
  -- Sprint metrics
  planned_story_points INTEGER DEFAULT 0,
  completed_story_points INTEGER DEFAULT 0,
  team_capacity_hours INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'cancelled')) DEFAULT 'planning',
  
  -- Team assignment
  team_id UUID, -- Future: Link to teams table
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_sprint_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- Row Level Security
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sprints"
  ON sprints FOR SELECT
  USING (true);

CREATE POLICY "Admins and managers can manage sprints"
  ON sprints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

-- ============================================================================

-- Tasks: User stories, tasks, and assignments
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Task classification
  task_type TEXT CHECK (task_type IN ('story', 'task', 'bug', 'epic', 'spike')) DEFAULT 'task',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Sprint assignment
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id),
  
  -- Status tracking
  status TEXT CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked')) DEFAULT 'backlog',
  
  -- Story points & time
  story_points INTEGER,
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  
  -- Dates
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Blocking
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[], -- Array of tags for filtering
  attachments JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Track status changes for analytics
  last_status_change TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can update assigned tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = assigned_to OR auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

-- ============================================================================

-- Daily standups: Standup submissions and blockers
CREATE TABLE IF NOT EXISTS daily_standups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Standup questions
  what_did_yesterday TEXT,
  what_will_do_today TEXT,
  blockers TEXT,
  
  -- Additional context
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'struggling', 'blocked')),
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  
  -- Tasks referenced
  tasks_completed UUID[], -- Array of task IDs
  tasks_planned UUID[],
  
  -- Submission metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  
  -- Bot interaction
  collected_by_bot BOOLEAN DEFAULT FALSE,
  conversation_id UUID, -- Link to bot conversation
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_standups_user_date ON daily_standups(user_id, date DESC);
CREATE INDEX idx_standups_date ON daily_standups(date DESC);

-- Row Level Security
ALTER TABLE daily_standups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own standups"
  ON daily_standups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all standups"
  ON daily_standups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

CREATE POLICY "Users can insert own standups"
  ON daily_standups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own standups"
  ON daily_standups FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================

-- Productivity scores: Daily and weekly productivity scores per employee
CREATE TABLE IF NOT EXISTS productivity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Time metrics
  total_active_time_minutes INTEGER DEFAULT 0,
  productive_time_minutes INTEGER DEFAULT 0,
  neutral_time_minutes INTEGER DEFAULT 0,
  unproductive_time_minutes INTEGER DEFAULT 0,
  idle_time_minutes INTEGER DEFAULT 0,
  
  -- Activity metrics
  total_keystrokes INTEGER DEFAULT 0,
  total_mouse_clicks INTEGER DEFAULT 0,
  app_switches INTEGER DEFAULT 0,
  
  -- Communication metrics
  emails_sent INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  meetings_attended INTEGER DEFAULT 0,
  
  -- Task completion
  tasks_completed INTEGER DEFAULT 0,
  story_points_completed INTEGER DEFAULT 0,
  
  -- Calculated scores (0-100)
  activity_score INTEGER CHECK (activity_score >= 0 AND activity_score <= 100),
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  completion_score INTEGER CHECK (completion_score >= 0 AND completion_score <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Peak productivity
  peak_hour_start INTEGER, -- 0-23
  peak_hour_end INTEGER,
  
  -- Flags
  is_workday BOOLEAN DEFAULT TRUE,
  is_anomaly BOOLEAN DEFAULT FALSE, -- Flagged by AI for review
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_productivity_scores_user_date ON productivity_scores(user_id, date DESC);
CREATE INDEX idx_productivity_scores_overall ON productivity_scores(overall_score DESC);

-- Row Level Security
ALTER TABLE productivity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores"
  ON productivity_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
  ON productivity_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

-- ============================================================================

-- Bottlenecks: AI-detected issues and suggestions
CREATE TABLE IF NOT EXISTS bottlenecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Bottleneck classification
  type TEXT CHECK (type IN ('low_productivity', 'stuck_task', 'high_idle', 'missed_standup', 'slow_response', 'declining_velocity', 'workload_imbalance', 'blocked_task')) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Affected entities
  affected_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  affected_sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  affected_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Detection
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  detection_reason TEXT NOT NULL,
  
  -- AI analysis
  ai_analysis TEXT,
  ai_suggestions TEXT,
  confidence_score DECIMAL(3, 2), -- 0-1 scale
  
  -- Data points
  metrics JSONB DEFAULT '{}'::jsonb, -- Supporting data
  
  -- Resolution
  status TEXT CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')) DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bottlenecks_user ON bottlenecks(affected_user_id);
CREATE INDEX idx_bottlenecks_status ON bottlenecks(status);
CREATE INDEX idx_bottlenecks_severity ON bottlenecks(severity);
CREATE INDEX idx_bottlenecks_type ON bottlenecks(type);
CREATE INDEX idx_bottlenecks_detected ON bottlenecks(detected_at DESC);

-- Row Level Security
ALTER TABLE bottlenecks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bottlenecks about themselves"
  ON bottlenecks FOR SELECT
  USING (auth.uid() = affected_user_id);

CREATE POLICY "Admins can view all bottlenecks"
  ON bottlenecks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

CREATE POLICY "Admins can manage bottlenecks"
  ON bottlenecks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'operations')
    )
  );

-- ============================================================================
-- AI EMPLOYEE BOT TABLES
-- ============================================================================

-- Bot conversations: Track bot chat sessions
CREATE TABLE IF NOT EXISTS bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Conversation metadata
  title TEXT,
  bot_type TEXT CHECK (bot_type IN ('employee_bot', 'guidewire_guru')) DEFAULT 'employee_bot',
  
  -- Current mode
  current_mode TEXT CHECK (current_mode IN ('standup', 'coach', 'project_manager', 'workflow', 'general')) DEFAULT 'general',
  
  -- Conversation state
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_conversations_user ON bot_conversations(user_id);
CREATE INDEX idx_bot_conversations_active ON bot_conversations(is_active, user_id);

-- Row Level Security
ALTER TABLE bot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot conversations"
  ON bot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bot conversations"
  ON bot_conversations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================

-- Bot messages: Individual messages in bot conversations
CREATE TABLE IF NOT EXISTS bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  
  -- Context
  mode TEXT CHECK (mode IN ('standup', 'coach', 'project_manager', 'workflow', 'general')),
  
  -- AI metadata
  model_used TEXT, -- 'gpt-4o', 'claude-3.5-sonnet'
  tokens_used INTEGER,
  response_time_ms INTEGER,
  
  -- Sources (if RAG used)
  sources JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_messages_conversation ON bot_messages(conversation_id, created_at);

-- Row Level Security
ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON bot_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bot_conversations
      WHERE bot_conversations.id = bot_messages.conversation_id
      AND bot_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON bot_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bot_conversations
      WHERE bot_conversations.id = bot_messages.conversation_id
      AND bot_conversations.user_id = auth.uid()
    )
  );

-- ============================================================================

-- Bot actions: Actions taken by bot (create tasks, schedule, etc.)
CREATE TABLE IF NOT EXISTS bot_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT CHECK (action_type IN ('create_task', 'update_task', 'schedule_meeting', 'submit_standup', 'create_sprint', 'send_notification')) NOT NULL,
  action_status TEXT CHECK (action_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  
  -- Action data
  action_payload JSONB NOT NULL, -- Contains action-specific data
  action_result JSONB, -- Result after execution
  
  -- Related entities
  related_task_id UUID REFERENCES tasks(id),
  related_sprint_id UUID REFERENCES sprints(id),
  related_standup_id UUID REFERENCES daily_standups(id),
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

CREATE INDEX idx_bot_actions_user ON bot_actions(user_id);
CREATE INDEX idx_bot_actions_status ON bot_actions(action_status);
CREATE INDEX idx_bot_actions_conversation ON bot_actions(conversation_id);

-- Row Level Security
ALTER TABLE bot_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot actions"
  ON bot_actions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- INTEGRATION CREDENTIALS TABLE
-- ============================================================================

-- Integration tokens: Store OAuth tokens for Outlook, Dialpad, etc.
CREATE TABLE IF NOT EXISTS integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Integration type
  integration_type TEXT CHECK (integration_type IN ('outlook', 'dialpad', 'zoom', 'slack')) NOT NULL,
  
  -- OAuth tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Integration status
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'failed', 'pending')),
  
  -- Metadata
  scopes TEXT[], -- OAuth scopes granted
  integration_user_id TEXT, -- External service user ID
  integration_metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, integration_type)
);

CREATE INDEX idx_integration_tokens_user ON integration_tokens(user_id);
CREATE INDEX idx_integration_tokens_active ON integration_tokens(is_active);

-- Row Level Security
ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integration tokens"
  ON integration_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integration tokens"
  ON integration_tokens FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_email_analytics_updated_at
  BEFORE UPDATE ON email_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_analytics_updated_at
  BEFORE UPDATE ON call_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bottlenecks_updated_at
  BEFORE UPDATE ON bottlenecks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_conversations_updated_at
  BEFORE UPDATE ON bot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_tokens_updated_at
  BEFORE UPDATE ON integration_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================

-- Function: Track task status changes
CREATE OR REPLACE FUNCTION track_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_status_change = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_status_change_tracker
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION track_task_status_change();

-- ============================================================================

-- Function: Auto-set screenshot retention (30 days)
CREATE OR REPLACE FUNCTION set_snapshot_retention()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.retention_until IS NULL THEN
    NEW.retention_until = NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_snapshot_retention_trigger
  BEFORE INSERT ON productivity_snapshots
  FOR EACH ROW EXECUTE FUNCTION set_snapshot_retention();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View: Daily team productivity summary
CREATE OR REPLACE VIEW daily_team_productivity AS
SELECT
  ps.date,
  COUNT(DISTINCT ps.user_id) as active_employees,
  AVG(ps.overall_score)::INTEGER as avg_productivity_score,
  SUM(ps.total_active_time_minutes) as total_active_minutes,
  SUM(ps.tasks_completed) as total_tasks_completed,
  SUM(ps.story_points_completed) as total_story_points,
  COUNT(ds.id) as standups_submitted,
  COUNT(DISTINCT b.id) as active_bottlenecks
FROM productivity_scores ps
LEFT JOIN daily_standups ds ON ps.user_id = ds.user_id AND ps.date = ds.date
LEFT JOIN bottlenecks b ON ps.user_id = b.affected_user_id 
  AND DATE(b.detected_at) = ps.date 
  AND b.status = 'open'
GROUP BY ps.date
ORDER BY ps.date DESC;

-- ============================================================================

-- View: Current sprint status
CREATE OR REPLACE VIEW current_sprint_status AS
SELECT
  s.*,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'blocked' THEN t.id END) as blocked_tasks,
  SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END) as completed_points,
  ROUND(
    (SUM(CASE WHEN t.status = 'done' THEN t.story_points ELSE 0 END)::DECIMAL / 
     NULLIF(s.planned_story_points, 0) * 100), 2
  ) as completion_percentage
FROM sprints s
LEFT JOIN tasks t ON s.id = t.sprint_id
WHERE s.status = 'active'
GROUP BY s.id;

-- ============================================================================

-- View: Employee productivity leaderboard
CREATE OR REPLACE VIEW productivity_leaderboard AS
SELECT
  up.id as user_id,
  up.first_name,
  up.last_name,
  up.email,
  AVG(ps.overall_score)::INTEGER as avg_score,
  SUM(ps.tasks_completed) as total_tasks,
  SUM(ps.story_points_completed) as total_points,
  COUNT(DISTINCT ps.date) as days_tracked
FROM user_profiles up
LEFT JOIN productivity_scores ps ON up.id = ps.user_id
WHERE ps.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY up.id, up.first_name, up.last_name, up.email
ORDER BY avg_score DESC NULLS LAST;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE activity_logs IS 'Tracks employee computer activity including apps, websites, and idle time';
COMMENT ON TABLE productivity_snapshots IS 'Stores periodic screenshots with 30-day retention';
COMMENT ON TABLE email_analytics IS 'Daily aggregated email metrics from Outlook via Microsoft Graph API';
COMMENT ON TABLE call_analytics IS 'Daily aggregated call metrics from Dialpad';
COMMENT ON TABLE sprints IS 'Sprint planning and tracking for agile development';
COMMENT ON TABLE tasks IS 'User stories, tasks, and bug tracking';
COMMENT ON TABLE daily_standups IS 'Daily standup submissions collected by AI bot';
COMMENT ON TABLE productivity_scores IS 'Calculated daily productivity scores (0-100) per employee';
COMMENT ON TABLE bottlenecks IS 'AI-detected productivity bottlenecks and blockers';
COMMENT ON TABLE bot_conversations IS 'Employee bot chat conversation sessions';
COMMENT ON TABLE bot_messages IS 'Individual messages within bot conversations';
COMMENT ON TABLE bot_actions IS 'Actions executed by bot (create tasks, schedule meetings, etc.)';
COMMENT ON TABLE integration_tokens IS 'OAuth tokens for external integrations (Outlook, Dialpad)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

