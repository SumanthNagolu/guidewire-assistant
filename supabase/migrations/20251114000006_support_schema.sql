-- ================================================
-- HR SUPPORT/TICKETING MODULE - DATABASE SCHEMA
-- ================================================

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Ticket Details
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'Payroll', 'Leave', 'Timesheet', 'Benefits', 'Profile', 'IT', 'Training', 'Other'
  )),
  priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- Assignment
  assigned_to UUID REFERENCES employees(id),
  assigned_at TIMESTAMPTZ,
  assignment_method VARCHAR(20), -- 'Manual', 'Auto', 'RoundRobin'
  
  -- Status & Workflow
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN (
    'New', 'Assigned', 'InProgress', 'Waiting', 'Resolved', 'Closed', 'Cancelled'
  )),
  status_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES employees(id),
  resolution_notes TEXT,
  resolution_time_hours DECIMAL(6,2), -- Time to resolve in hours
  
  -- Closure
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES employees(id),
  closure_reason VARCHAR(50),
  
  -- SLA (Service Level Agreement)
  sla_response_due_at TIMESTAMPTZ, -- When first response is due
  sla_resolution_due_at TIMESTAMPTZ, -- When resolution is due
  first_response_at TIMESTAMPTZ,
  sla_response_breached BOOLEAN DEFAULT false,
  sla_resolution_breached BOOLEAN DEFAULT false,
  
  -- Ratings & Feedback
  employee_rating INTEGER CHECK (employee_rating >= 1 AND employee_rating <= 5),
  employee_feedback TEXT,
  feedback_submitted_at TIMESTAMPTZ,
  
  -- Escalation
  is_escalated BOOLEAN DEFAULT false,
  escalated_to UUID REFERENCES employees(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  
  -- Tags
  tags TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Messages/Communication Thread
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES employees(id),
  
  -- Message Content
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to employee
  
  -- Attachments
  attachments JSONB DEFAULT '[]', -- [{filename, url, size, type}]
  
  -- Status Change (if this message changed status)
  status_change_from VARCHAR(20),
  status_change_to VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Support Categories Configuration
CREATE TABLE IF NOT EXISTS support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  default_priority VARCHAR(20) DEFAULT 'Normal',
  sla_response_hours INTEGER DEFAULT 8, -- Hours for first response
  sla_resolution_hours INTEGER DEFAULT 24, -- Hours for resolution
  assigned_team UUID[], -- Array of employee IDs who handle this category
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Canned Responses/Templates
CREATE TABLE IF NOT EXISTS ticket_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  template_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES employees(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_employee ON support_tickets(employee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla ON support_tickets(sla_resolution_due_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created ON ticket_messages(created_at);

-- Create triggers
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_categories_updated_at BEFORE UPDATE ON support_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_templates_updated_at BEFORE UPDATE ON ticket_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate SLA due times based on category
CREATE OR REPLACE FUNCTION set_ticket_sla()
RETURNS TRIGGER AS $$
DECLARE
  v_response_hours INTEGER;
  v_resolution_hours INTEGER;
BEGIN
  -- Get SLA hours from category
  SELECT sla_response_hours, sla_resolution_hours INTO v_response_hours, v_resolution_hours
  FROM support_categories
  WHERE code = NEW.category;

  -- Set default if category not found
  v_response_hours := COALESCE(v_response_hours, 8);
  v_resolution_hours := COALESCE(v_resolution_hours, 24);

  -- Adjust for priority
  IF NEW.priority = 'Urgent' THEN
    v_response_hours := v_response_hours / 2;
    v_resolution_hours := v_resolution_hours / 2;
  ELSIF NEW.priority = 'Low' THEN
    v_response_hours := v_response_hours * 2;
    v_resolution_hours := v_resolution_hours * 2;
  END IF;

  -- Calculate due times (business hours only - simplified to calendar hours)
  NEW.sla_response_due_at := NEW.created_at + (v_response_hours || ' hours')::INTERVAL;
  NEW.sla_resolution_due_at := NEW.created_at + (v_resolution_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_sla
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION set_ticket_sla();

-- Auto-check SLA breaches
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS void AS $$
BEGIN
  -- Check response SLA
  UPDATE support_tickets
  SET sla_response_breached = true
  WHERE first_response_at IS NULL
    AND sla_response_due_at < CURRENT_TIMESTAMP
    AND status NOT IN ('Resolved', 'Closed', 'Cancelled');

  -- Check resolution SLA
  UPDATE support_tickets
  SET sla_resolution_breached = true
  WHERE resolved_at IS NULL
    AND sla_resolution_due_at < CURRENT_TIMESTAMP
    AND status NOT IN ('Resolved', 'Closed', 'Cancelled');
END;
$$ LANGUAGE plpgsql;

-- Insert default support categories
INSERT INTO support_categories (name, code, description, default_priority, sla_response_hours, sla_resolution_hours) VALUES
('Payroll', 'PAYROLL', 'Salary and payroll related queries', 'High', 4, 12),
('Leave Management', 'LEAVE', 'Leave requests and balance queries', 'Normal', 8, 24),
('Timesheet', 'TIMESHEET', 'Time tracking and attendance issues', 'Normal', 8, 24),
('Benefits', 'BENEFITS', 'Employee benefits and insurance', 'Normal', 12, 48),
('Profile & Documents', 'PROFILE', 'Personal information updates', 'Low', 24, 48),
('IT Support', 'IT', 'Technical issues and access problems', 'High', 2, 8),
('Training', 'TRAINING', 'Training enrollment and completion', 'Normal', 12, 48),
('Other', 'OTHER', 'General HR queries', 'Normal', 8, 24)
ON CONFLICT (code) DO NOTHING;

-- Helper function for support stats
CREATE OR REPLACE FUNCTION get_support_stats(p_agent_id UUID DEFAULT NULL)
RETURNS TABLE(
  my_tickets INTEGER,
  unassigned_tickets INTEGER,
  resolved_today INTEGER,
  avg_resolution_hours DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*)::INTEGER FROM support_tickets 
     WHERE assigned_to = p_agent_id AND status IN ('Assigned', 'InProgress')),
    (SELECT COUNT(*)::INTEGER FROM support_tickets WHERE status = 'New'),
    (SELECT COUNT(*)::INTEGER FROM support_tickets 
     WHERE resolved_at::DATE = CURRENT_DATE),
    (SELECT ROUND(AVG(resolution_time_hours), 2) FROM support_tickets 
     WHERE resolved_at >= CURRENT_TIMESTAMP - interval '7 days');
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE support_tickets IS 'Employee support tickets and HR queries';
COMMENT ON TABLE ticket_messages IS 'Conversation thread for tickets';
COMMENT ON TABLE support_categories IS 'Configurable ticket categories with SLA rules';
COMMENT ON TABLE ticket_templates IS 'Canned responses for common issues';

