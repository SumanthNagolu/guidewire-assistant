-- ================================================
-- PERFORMANCE MANAGEMENT MODULE - DATABASE SCHEMA
-- ================================================

-- Performance Review Cycles
CREATE TABLE IF NOT EXISTS performance_review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- "Q1 2025", "Annual 2024"
  cycle_code VARCHAR(20) UNIQUE NOT NULL,
  review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('Quarterly', 'Annual', 'Probation', 'MidYear')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'InProgress', 'Completed', 'Archived')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_cycle_dates CHECK (end_date >= start_date AND due_date >= end_date)
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_number VARCHAR(50) UNIQUE NOT NULL, -- "REV-2025-Q1-001"
  review_cycle_id UUID REFERENCES performance_review_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES employees(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  
  -- Section 1: Goal Achievement
  previous_goals JSONB DEFAULT '[]', -- [{id, title, status, achievement_pct, comments}]
  
  -- Section 2: Competency Ratings
  competency_ratings JSONB DEFAULT '{}', -- {technical: 4, communication: 5, teamwork: 4}
  competency_comments JSONB DEFAULT '{}', -- {technical: "comment", ...}
  average_rating DECIMAL(3,2),
  
  -- Section 3: Qualitative Assessment
  strengths TEXT,
  areas_for_improvement TEXT,
  
  -- Section 4: Overall Rating & Recommendations
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
  overall_rating_label VARCHAR(50), -- "Outstanding", "Exceeds", "Meets", "Needs Improvement", "Unsatisfactory"
  recommended_actions JSONB DEFAULT '[]', -- ["promotion", "raise", "training"]
  suggested_salary_increase DECIMAL(5,2),
  requires_pip BOOLEAN DEFAULT false, -- Performance Improvement Plan required
  
  -- Section 5: Goals for Next Period
  new_goals JSONB DEFAULT '[]', -- [{title, description, target_date, weight}]
  
  -- Section 6: Manager Comments
  manager_comments TEXT,
  
  -- Section 7: Employee Acknowledgment
  employee_comments TEXT,
  employee_self_assessment TEXT,
  employee_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  electronic_signature VARCHAR(100),
  acknowledgment_ip VARCHAR(50),
  
  -- Workflow Status
  status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN (
    'Draft', 'InReview', 'SubmittedToEmployee', 
    'ChangesRequested', 'Acknowledged', 'Completed', 'Archived'
  )),
  submitted_to_employee_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Change Requests
  change_request_reason TEXT,
  change_requested_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(review_cycle_id, employee_id)
);

-- Performance Goals
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  set_by UUID NOT NULL REFERENCES employees(id), -- Manager who set the goal
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  
  -- Categorization
  category VARCHAR(50), -- "Technical", "Leadership", "Process", "Sales", "Customer Service"
  weight INTEGER DEFAULT 0 CHECK (weight >= 0 AND weight <= 100), -- % importance
  
  -- Progress Tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status VARCHAR(20) DEFAULT 'NotStarted' CHECK (status IN ('NotStarted', 'InProgress', 'OnHold', 'Achieved', 'Missed', 'Cancelled')),
  last_progress_update_at TIMESTAMPTZ,
  progress_notes TEXT,
  
  -- Completion
  achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  achievement_percentage INTEGER, -- Final achievement (can be > 100 if exceeded)
  achievement_notes TEXT,
  
  -- Linkage
  review_id UUID REFERENCES performance_reviews(id) ON DELETE SET NULL, -- If set as part of a review
  parent_goal_id UUID REFERENCES performance_goals(id) ON DELETE SET NULL, -- For goal hierarchies
  
  -- Active Period
  active_from DATE NOT NULL DEFAULT CURRENT_DATE,
  active_to DATE, -- NULL means currently active
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Goal Progress Updates (History)
CREATE TABLE IF NOT EXISTS goal_progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES performance_goals(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES employees(id),
  previous_progress INTEGER,
  new_progress INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 360 Degree Feedback (Optional Enhancement)
CREATE TABLE IF NOT EXISTS performance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  feedback_from UUID NOT NULL REFERENCES employees(id),
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('Peer', 'Subordinate', 'Self', 'External')),
  ratings JSONB DEFAULT '{}',
  comments TEXT,
  anonymous BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Competency Framework (Configurable)
CREATE TABLE IF NOT EXISTS competency_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50), -- "Technical", "Behavioral", "Leadership"
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Improvement Plans (PIP)
CREATE TABLE IF NOT EXISTS performance_improvement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  review_id UUID REFERENCES performance_reviews(id),
  manager_id UUID NOT NULL REFERENCES employees(id),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  review_frequency VARCHAR(20), -- "Weekly", "BiWeekly", "Monthly"
  
  -- Issues & Expectations
  performance_issues TEXT NOT NULL,
  expected_improvements TEXT NOT NULL,
  success_criteria TEXT,
  
  -- Support & Resources
  support_provided TEXT,
  training_required TEXT,
  
  -- Progress
  current_status VARCHAR(20) DEFAULT 'Active' CHECK (current_status IN ('Active', 'OnTrack', 'NeedsAttention', 'Successful', 'Unsuccessful', 'Terminated')),
  progress_notes TEXT,
  
  -- Outcome
  outcome VARCHAR(20), -- "Successful", "Unsuccessful", "Extended", "Terminated"
  outcome_date DATE,
  outcome_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- PIP Check-in Meetings
CREATE TABLE IF NOT EXISTS pip_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pip_id UUID NOT NULL REFERENCES performance_improvement_plans(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  attendees UUID[], -- Array of employee IDs
  progress_summary TEXT,
  areas_of_concern TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_performance_review_cycles_status ON performance_review_cycles(status);
CREATE INDEX IF NOT EXISTS idx_performance_review_cycles_dates ON performance_review_cycles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_cycle ON performance_reviews(review_cycle_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_status ON performance_goals(status);
CREATE INDEX IF NOT EXISTS idx_performance_goals_active ON performance_goals(active_from, active_to);
CREATE INDEX IF NOT EXISTS idx_goal_progress_updates_goal ON goal_progress_updates(goal_id);
CREATE INDEX IF NOT EXISTS idx_pip_employee ON performance_improvement_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_pip_status ON performance_improvement_plans(current_status);

-- Create updated_at trigger
CREATE TRIGGER update_performance_review_cycles_updated_at BEFORE UPDATE ON performance_review_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at BEFORE UPDATE ON performance_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competency_definitions_updated_at BEFORE UPDATE ON competency_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pip_updated_at BEFORE UPDATE ON performance_improvement_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default competencies
INSERT INTO competency_definitions (name, code, description, category, display_order) VALUES
('Technical Skills', 'TECHNICAL', 'Proficiency in required technical competencies', 'Technical', 1),
('Communication', 'COMMUNICATION', 'Verbal and written communication effectiveness', 'Behavioral', 2),
('Teamwork', 'TEAMWORK', 'Collaboration and team contribution', 'Behavioral', 3),
('Problem Solving', 'PROBLEM_SOLVING', 'Analytical thinking and solution development', 'Technical', 4),
('Leadership', 'LEADERSHIP', 'Ability to guide and influence others', 'Leadership', 5),
('Initiative', 'INITIATIVE', 'Self-motivation and proactive behavior', 'Behavioral', 6),
('Adaptability', 'ADAPTABILITY', 'Flexibility and response to change', 'Behavioral', 7),
('Quality of Work', 'QUALITY', 'Accuracy, thoroughness, and attention to detail', 'Technical', 8),
('Time Management', 'TIME_MGMT', 'Prioritization and deadline management', 'Behavioral', 9),
('Customer Focus', 'CUSTOMER', 'Customer service orientation', 'Behavioral', 10)
ON CONFLICT (code) DO NOTHING;

-- Create view for active goals
CREATE OR REPLACE VIEW active_performance_goals AS
SELECT g.*, e.first_name, e.last_name, e.employee_id
FROM performance_goals g
JOIN employees e ON g.employee_id = e.id
WHERE g.status IN ('NotStarted', 'InProgress')
  AND (g.active_to IS NULL OR g.active_to >= CURRENT_DATE)
ORDER BY g.target_date;

-- Create function to calculate review stats
CREATE OR REPLACE FUNCTION get_employee_review_stats(p_employee_id UUID)
RETURNS TABLE(
  total_reviews INTEGER,
  average_rating DECIMAL,
  last_review_date DATE,
  last_review_rating DECIMAL,
  trend VARCHAR
) AS $$
DECLARE
  v_total INTEGER;
  v_avg DECIMAL;
  v_last_date DATE;
  v_last_rating DECIMAL;
  v_prev_rating DECIMAL;
  v_trend VARCHAR;
BEGIN
  -- Get total reviews
  SELECT COUNT(*) INTO v_total
  FROM performance_reviews
  WHERE employee_id = p_employee_id AND status = 'Completed';

  -- Get average rating
  SELECT AVG(overall_rating) INTO v_avg
  FROM performance_reviews
  WHERE employee_id = p_employee_id AND status = 'Completed';

  -- Get last review
  SELECT completed_at::DATE, overall_rating INTO v_last_date, v_last_rating
  FROM performance_reviews
  WHERE employee_id = p_employee_id AND status = 'Completed'
  ORDER BY completed_at DESC
  LIMIT 1;

  -- Get previous review rating for trend
  SELECT overall_rating INTO v_prev_rating
  FROM performance_reviews
  WHERE employee_id = p_employee_id AND status = 'Completed'
  ORDER BY completed_at DESC
  OFFSET 1 LIMIT 1;

  -- Calculate trend
  IF v_prev_rating IS NULL THEN
    v_trend := 'New';
  ELSIF v_last_rating > v_prev_rating THEN
    v_trend := 'Improving';
  ELSIF v_last_rating < v_prev_rating THEN
    v_trend := 'Declining';
  ELSE
    v_trend := 'Stable';
  END IF;

  RETURN QUERY SELECT v_total, v_avg, v_last_date, v_last_rating, v_trend;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE performance_review_cycles IS 'Review periods (quarterly, annual, etc.)';
COMMENT ON TABLE performance_reviews IS 'Individual employee performance reviews';
COMMENT ON TABLE performance_goals IS 'Employee goals and objectives';
COMMENT ON TABLE goal_progress_updates IS 'History of goal progress changes';
COMMENT ON TABLE performance_feedback IS '360-degree feedback from peers/subordinates';
COMMENT ON TABLE competency_definitions IS 'Configurable competency framework';
COMMENT ON TABLE performance_improvement_plans IS 'PIPs for underperforming employees';
COMMENT ON TABLE pip_check_ins IS 'Regular check-in meetings during PIP';

