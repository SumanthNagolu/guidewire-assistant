-- System Tables
-- Audit logs, notifications, and system-level tracking

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Changes
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Who & When
  user_id UUID REFERENCES user_profiles(id),
  user_email TEXT,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- RLS Policies (Admin only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields TEXT[];
  v_user_email TEXT;
  v_user_role TEXT;
BEGIN
  -- Get user info
  SELECT email, role INTO v_user_email, v_user_role
  FROM user_profiles
  WHERE id = auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    v_old_data = to_jsonb(OLD);
    v_new_data = NULL;
    v_changed_fields = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data = NULL;
    v_new_data = to_jsonb(NEW);
    v_changed_fields = NULL;
  ELSE -- UPDATE
    v_old_data = to_jsonb(OLD);
    v_new_data = to_jsonb(NEW);
    
    -- Detect changed fields
    SELECT array_agg(key)
    INTO v_changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(v_new_data)
      WHERE v_new_data->key IS DISTINCT FROM v_old_data->key
    ) AS changes;
  END IF;
  
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    user_id,
    user_email,
    user_role,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    v_old_data,
    v_new_data,
    v_changed_fields,
    auth.uid(),
    v_user_email,
    v_user_role,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_candidates
  AFTER INSERT OR UPDATE OR DELETE ON candidates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_jobs
  AFTER INSERT OR UPDATE OR DELETE ON jobs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_applications
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_placements
  AFTER INSERT OR UPDATE OR DELETE ON placements
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_opportunities
  AFTER INSERT OR UPDATE OR DELETE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  
  -- Related Entity
  entity_type TEXT,
  entity_id UUID,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Action
  action_url TEXT,
  
  -- Priority
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority) WHERE is_read = false;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Auto-set read_at when marked as read
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  
  IF NEW.is_read = false AND OLD.is_read = true THEN
    NEW.read_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_read_at();

-- Helper function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    action_url,
    priority
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_entity_type,
    p_entity_id,
    p_action_url,
    p_priority
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Saved Searches Table (for advanced filtering)
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Search Details
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('candidate', 'job', 'client', 'opportunity', 'placement')),
  
  -- Filters (JSON)
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_entity ON saved_searches(entity_type);

-- Auto-update updated_at
CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view shared searches"
  ON saved_searches FOR SELECT
  USING (is_shared = true);

