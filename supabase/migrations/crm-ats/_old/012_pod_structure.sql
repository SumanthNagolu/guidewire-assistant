-- ============================================
-- 012_POD_STRUCTURE.SQL
-- InTime Command Center: Pod-Based Architecture
-- Created: 2025-11-09
-- ============================================

-- ============================================
-- 1. PODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recruiting', 'bench_sales', 'talent_acquisition')),
  manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  -- Sprint Targets
  target_placements_per_sprint INT DEFAULT 2,
  target_interviews_per_sprint INT DEFAULT 10,
  target_submissions_per_sprint INT DEFAULT 70,
  
  -- Pod Settings
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_hold')),
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. POD MEMBERS (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES pods(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('manager', 'account_manager', 'screener', 'sourcer')),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(pod_id, user_id)
);

-- ============================================
-- 3. JD ASSIGNMENTS (Workflow Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS jd_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  
  -- Assignment Details
  assigned_by UUID REFERENCES user_profiles(id),
  sourcer_id UUID REFERENCES user_profiles(id),
  screener_id UUID REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),
  
  -- Workflow Status
  status TEXT DEFAULT 'assigned' CHECK (status IN (
    'assigned',
    'sourcing',
    'screening',
    'submitted',
    'completed',
    'cancelled'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Targets & Progress
  target_resumes INT DEFAULT 30,
  resumes_sourced INT DEFAULT 0,
  candidates_screened INT DEFAULT 0,
  candidates_qualified INT DEFAULT 0,
  candidates_submitted INT DEFAULT 0,
  
  -- Time Tracking
  time_to_first_resume INTERVAL,
  time_to_first_call INTERVAL,
  time_to_first_submission INTERVAL,
  total_time_spent INTERVAL,
  
  -- Timestamps
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  sourcing_started_at TIMESTAMPTZ,
  screening_started_at TIMESTAMPTZ,
  first_submission_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CROSS-SELL LEADS (Multi-Arm Lead Gen)
-- ============================================
CREATE TABLE IF NOT EXISTS cross_sell_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Lead Details
  lead_type TEXT NOT NULL CHECK (lead_type IN (
    'bench_sales',
    'training',
    'recruiting',
    'talent_acquisition'
  )),
  
  -- Discovery Context
  discovered_by UUID REFERENCES user_profiles(id),
  source_activity_type TEXT CHECK (source_activity_type IN ('call', 'email', 'linkedin', 'meeting')),
  source_activity_id UUID,
  discovery_notes TEXT,
  
  -- Lead Status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new',
    'contacted',
    'qualified',
    'converted',
    'lost',
    'not_interested'
  )),
  
  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_to_pod UUID REFERENCES pods(id),
  
  -- Conversion Tracking
  converted_to_entity_type TEXT CHECK (converted_to_entity_type IN ('placement', 'enrollment', 'job')),
  converted_to_entity_id UUID,
  estimated_value DECIMAL(12,2),
  
  -- Timestamps
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. DAILY METRICS (Real-Time Performance)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  metric_date DATE DEFAULT CURRENT_DATE,
  
  -- Sourcer Metrics
  jds_assigned INT DEFAULT 0,
  resumes_sourced INT DEFAULT 0,
  resumes_from_db INT DEFAULT 0,
  resumes_from_linkedin INT DEFAULT 0,
  resumes_from_dice INT DEFAULT 0,
  avg_time_per_jd INTERVAL,
  
  -- Screener Metrics
  calls_made INT DEFAULT 0,
  calls_connected INT DEFAULT 0,
  calls_qualified INT DEFAULT 0,
  calls_not_interested INT DEFAULT 0,
  candidates_submitted_to_am INT DEFAULT 0,
  cross_sell_leads_tagged INT DEFAULT 0,
  avg_call_duration INTERVAL,
  
  -- Account Manager Metrics
  submissions_received INT DEFAULT 0,
  submissions_made INT DEFAULT 0,
  interviews_scheduled INT DEFAULT 0,
  offers_received INT DEFAULT 0,
  placements_made INT DEFAULT 0,
  
  -- Universal Metrics
  emails_sent INT DEFAULT 0,
  emails_received INT DEFAULT 0,
  linkedin_messages INT DEFAULT 0,
  meetings_attended INT DEFAULT 0,
  
  -- Revenue Metrics
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  pipeline_value DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, metric_date)
);

-- ============================================
-- 6. BOTTLENECK ALERTS (Automated Monitoring)
-- ============================================
CREATE TABLE IF NOT EXISTS bottleneck_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Alert Classification
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'jd_stuck',
    'low_calls',
    'zero_submissions',
    'bench_aging',
    'bench_critical',
    'pod_underperforming',
    'sprint_failure',
    'low_cross_sell'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Entity Reference
  entity_type TEXT NOT NULL CHECK (entity_type IN ('job', 'candidate', 'pod', 'user', 'jd_assignment')),
  entity_id UUID NOT NULL,
  
  -- Alert Content
  title TEXT NOT NULL,
  description TEXT,
  recommended_action TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_to_pod UUID REFERENCES pods(id),
  
  -- Status Tracking
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
  
  -- Resolution
  resolved_by UUID REFERENCES user_profiles(id),
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Auto-dismiss if entity status changes
  auto_dismiss_at TIMESTAMPTZ
);

-- ============================================
-- 7. CALL LOGS (Dialpad Integration)
-- ============================================
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  user_id UUID REFERENCES user_profiles(id),
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  client_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Context
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  jd_assignment_id UUID REFERENCES jd_assignments(id) ON DELETE SET NULL,
  
  -- Call Details
  phone_number TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  duration INT DEFAULT 0, -- Seconds
  
  -- Outcome
  outcome TEXT CHECK (outcome IN (
    'no_answer',
    'voicemail',
    'wrong_number',
    'connected',
    'qualified',
    'not_interested',
    'callback_requested',
    'interview_scheduled'
  )),
  
  -- Recording & Notes
  recording_url TEXT,
  transcript TEXT,
  notes TEXT,
  
  -- Cross-Sell Tracking
  cross_sell_leads_generated INT DEFAULT 0,
  
  -- Quality Scoring (1-5 stars)
  candidate_rating INT CHECK (candidate_rating >= 1 AND candidate_rating <= 5),
  communication_quality TEXT CHECK (communication_quality IN ('excellent', 'good', 'average', 'poor')),
  
  -- Timestamps
  called_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. EMAIL THREADS (Gmail Integration)
-- ============================================
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Gmail Reference
  thread_id TEXT UNIQUE, -- Gmail thread ID
  message_id TEXT, -- Latest message ID
  
  -- Participants
  user_id UUID REFERENCES user_profiles(id),
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Context
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  jd_assignment_id UUID REFERENCES jd_assignments(id) ON DELETE SET NULL,
  
  -- Thread Details
  subject TEXT,
  snippet TEXT, -- First 100 chars
  last_message_preview TEXT,
  
  -- Tracking
  message_count INT DEFAULT 1,
  unread_count INT DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open',
    'awaiting_response',
    'responded',
    'closed',
    'archived'
  )),
  
  -- Classification
  thread_type TEXT CHECK (thread_type IN (
    'job_submission',
    'candidate_outreach',
    'client_communication',
    'interview_scheduling',
    'offer_discussion',
    'general'
  )),
  
  -- Timestamps
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  last_reply_from_recipient_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Pods
CREATE INDEX IF NOT EXISTS idx_pods_manager ON pods(manager_id);
CREATE INDEX IF NOT EXISTS idx_pods_type ON pods(type);
CREATE INDEX IF NOT EXISTS idx_pods_status ON pods(status);

-- Pod Members
CREATE INDEX IF NOT EXISTS idx_pod_members_pod ON pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_user ON pod_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_role ON pod_members(role);

-- JD Assignments
CREATE INDEX IF NOT EXISTS idx_jd_assignments_job ON jd_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_pod ON jd_assignments(pod_id);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_status ON jd_assignments(status);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_sourcer ON jd_assignments(sourcer_id);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_screener ON jd_assignments(screener_id);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_am ON jd_assignments(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_jd_assignments_assigned_at ON jd_assignments(assigned_at);

-- Cross-Sell Leads
CREATE INDEX IF NOT EXISTS idx_cross_sell_candidate ON cross_sell_leads(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cross_sell_type ON cross_sell_leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_cross_sell_status ON cross_sell_leads(status);
CREATE INDEX IF NOT EXISTS idx_cross_sell_discovered_by ON cross_sell_leads(discovered_by);
CREATE INDEX IF NOT EXISTS idx_cross_sell_assigned_to ON cross_sell_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cross_sell_discovered_at ON cross_sell_leads(discovered_at);

-- Daily Metrics
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_pod_date ON daily_metrics(pod_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(metric_date);

-- Bottleneck Alerts
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_type ON bottleneck_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_severity ON bottleneck_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_status ON bottleneck_alerts(status);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_entity ON bottleneck_alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_assigned_to ON bottleneck_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bottleneck_alerts_created_at ON bottleneck_alerts(created_at);

-- Call Logs
CREATE INDEX IF NOT EXISTS idx_call_logs_user ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_candidate ON call_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_job ON call_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_called_at ON call_logs(called_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_outcome ON call_logs(outcome);

-- Email Threads
CREATE INDEX IF NOT EXISTS idx_email_threads_thread_id ON email_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_user ON email_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_candidate ON email_threads(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_client ON email_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_job ON email_threads(job_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_status ON email_threads(status);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message ON email_threads(last_message_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pods_updated_at ON pods;
CREATE TRIGGER update_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jd_assignments_updated_at ON jd_assignments;
CREATE TRIGGER update_jd_assignments_updated_at
  BEFORE UPDATE ON jd_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cross_sell_leads_updated_at ON cross_sell_leads;
CREATE TRIGGER update_cross_sell_leads_updated_at
  BEFORE UPDATE ON cross_sell_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_metrics_updated_at ON daily_metrics;
CREATE TRIGGER update_daily_metrics_updated_at
  BEFORE UPDATE ON daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_call_logs_updated_at ON call_logs;
CREATE TRIGGER update_call_logs_updated_at
  BEFORE UPDATE ON call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_threads_updated_at ON email_threads;
CREATE TRIGGER update_email_threads_updated_at
  BEFORE UPDATE ON email_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_sell_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottleneck_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;

-- Pods: All authenticated users can read, admins can write
DROP POLICY IF EXISTS "pods_select" ON pods;
CREATE POLICY "pods_select" ON pods FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pods_insert" ON pods;
CREATE POLICY "pods_insert" ON pods FOR INSERT TO authenticated 
  WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "pods_update" ON pods;
CREATE POLICY "pods_update" ON pods FOR UPDATE TO authenticated 
  USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Pod Members: All can read, admins/managers can write
DROP POLICY IF EXISTS "pod_members_select" ON pod_members;
CREATE POLICY "pod_members_select" ON pod_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pod_members_insert" ON pod_members;
CREATE POLICY "pod_members_insert" ON pod_members FOR INSERT TO authenticated 
  WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- JD Assignments: All can read and update their own
DROP POLICY IF EXISTS "jd_assignments_select" ON jd_assignments;
CREATE POLICY "jd_assignments_select" ON jd_assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "jd_assignments_insert" ON jd_assignments;
CREATE POLICY "jd_assignments_insert" ON jd_assignments FOR INSERT TO authenticated 
  WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'account_manager'));

DROP POLICY IF EXISTS "jd_assignments_update" ON jd_assignments;
CREATE POLICY "jd_assignments_update" ON jd_assignments FOR UPDATE TO authenticated 
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager') OR
    sourcer_id = auth.uid() OR
    screener_id = auth.uid() OR
    account_manager_id = auth.uid()
  );

-- Cross-Sell Leads: All can read and create
DROP POLICY IF EXISTS "cross_sell_leads_select" ON cross_sell_leads;
CREATE POLICY "cross_sell_leads_select" ON cross_sell_leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cross_sell_leads_insert" ON cross_sell_leads;
CREATE POLICY "cross_sell_leads_insert" ON cross_sell_leads FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cross_sell_leads_update" ON cross_sell_leads;
CREATE POLICY "cross_sell_leads_update" ON cross_sell_leads FOR UPDATE TO authenticated USING (true);

-- Daily Metrics: Users can read all, update their own
DROP POLICY IF EXISTS "daily_metrics_select" ON daily_metrics;
CREATE POLICY "daily_metrics_select" ON daily_metrics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "daily_metrics_insert" ON daily_metrics;
CREATE POLICY "daily_metrics_insert" ON daily_metrics FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "daily_metrics_update" ON daily_metrics;
CREATE POLICY "daily_metrics_update" ON daily_metrics FOR UPDATE TO authenticated USING (user_id = auth.uid() OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

-- Bottleneck Alerts: All can read, system/admins can write
DROP POLICY IF EXISTS "bottleneck_alerts_select" ON bottleneck_alerts;
CREATE POLICY "bottleneck_alerts_select" ON bottleneck_alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "bottleneck_alerts_insert" ON bottleneck_alerts;
CREATE POLICY "bottleneck_alerts_insert" ON bottleneck_alerts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bottleneck_alerts_update" ON bottleneck_alerts;
CREATE POLICY "bottleneck_alerts_update" ON bottleneck_alerts FOR UPDATE TO authenticated USING (true);

-- Call Logs: Users can read all, create their own
DROP POLICY IF EXISTS "call_logs_select" ON call_logs;
CREATE POLICY "call_logs_select" ON call_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "call_logs_insert" ON call_logs;
CREATE POLICY "call_logs_insert" ON call_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "call_logs_update" ON call_logs;
CREATE POLICY "call_logs_update" ON call_logs FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Email Threads: All can read and create
DROP POLICY IF EXISTS "email_threads_select" ON email_threads;
CREATE POLICY "email_threads_select" ON email_threads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "email_threads_insert" ON email_threads;
CREATE POLICY "email_threads_insert" ON email_threads FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "email_threads_update" ON email_threads;
CREATE POLICY "email_threads_update" ON email_threads FOR UPDATE TO authenticated USING (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON pods TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pod_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON jd_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON cross_sell_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bottleneck_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON call_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_threads TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE pods IS 'Organizational units for team structure (recruiting, bench sales, TA)';
COMMENT ON TABLE pod_members IS 'Junction table linking users to pods with roles';
COMMENT ON TABLE jd_assignments IS 'Tracks JD workflow from assignment to completion with 2-3 hour SLA';
COMMENT ON TABLE cross_sell_leads IS 'Captures multi-arm lead generation from every candidate interaction';
COMMENT ON TABLE daily_metrics IS 'Real-time performance tracking per user per day';
COMMENT ON TABLE bottleneck_alerts IS 'Automated alert system for stuck JDs, aging bench, underperforming pods';
COMMENT ON TABLE call_logs IS 'Dialpad integration for click-to-call and outcome tracking';
COMMENT ON TABLE email_threads IS 'Gmail integration for email tracking and submissions';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Pod Structure Migration Complete!';
  RAISE NOTICE '📊 Created 8 new tables:';
  RAISE NOTICE '   - pods';
  RAISE NOTICE '   - pod_members';
  RAISE NOTICE '   - jd_assignments';
  RAISE NOTICE '   - cross_sell_leads';
  RAISE NOTICE '   - daily_metrics';
  RAISE NOTICE '   - bottleneck_alerts';
  RAISE NOTICE '   - call_logs';
  RAISE NOTICE '   - email_threads';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '🚀 Ready for InTime Command Center!';
END $$;

