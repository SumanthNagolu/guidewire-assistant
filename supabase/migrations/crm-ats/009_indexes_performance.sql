-- Performance Indexes & Optimization
-- Additional indexes for common query patterns

-- Composite indexes for common filters
CREATE INDEX idx_candidates_status_owner ON candidates(status, owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_availability_skills ON candidates(availability) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_jobs_status_priority ON jobs(status, priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_applications_job_stage ON applications(job_id, stage) WHERE is_active = true;
CREATE INDEX idx_applications_candidate_stage ON applications(candidate_id, stage) WHERE is_active = true;
CREATE INDEX idx_placements_active_recruiter ON placements(recruiter_id, status) WHERE status = 'active';
CREATE INDEX idx_placements_ending_soon ON placements(end_date) WHERE status = 'ending_soon';
CREATE INDEX idx_opportunities_stage_owner ON opportunities(stage, owner_id);

-- Indexes for reporting queries
CREATE INDEX idx_applications_created_date ON applications((created_at::date));
CREATE INDEX idx_placements_start_month ON placements((DATE_TRUNC('month', start_date)));
CREATE INDEX idx_opportunities_close_month ON opportunities((DATE_TRUNC('month', expected_close_date))) WHERE stage NOT IN ('closed_won', 'closed_lost');

-- Partial indexes for active records
CREATE INDEX idx_active_candidates ON candidates(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_open_jobs ON jobs(id) WHERE status = 'open' AND deleted_at IS NULL;
CREATE INDEX idx_pending_applications ON applications(id) WHERE stage NOT IN ('placed', 'rejected', 'withdrawn') AND is_active = true;

-- GIN indexes for array columns
CREATE INDEX idx_candidates_tags ON candidates USING GIN(tags);
CREATE INDEX idx_jobs_requirements ON jobs USING GIN(requirements);
CREATE INDEX idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);

-- JSONB indexes
CREATE INDEX idx_candidates_education ON candidates USING GIN(education);
CREATE INDEX idx_candidates_parsed_resume ON candidates USING GIN(resume_parsed_data);
CREATE INDEX idx_activities_metadata ON activities USING GIN(metadata);

-- Create materialized view for dashboard metrics
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT
  -- ATS Metrics
  (SELECT COUNT(*) FROM candidates WHERE status = 'active' AND deleted_at IS NULL) as active_candidates,
  (SELECT COUNT(*) FROM jobs WHERE status = 'open' AND deleted_at IS NULL) as open_jobs,
  (SELECT COUNT(*) FROM applications WHERE stage NOT IN ('placed', 'rejected', 'withdrawn') AND is_active = true) as active_applications,
  (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled' AND scheduled_at >= NOW()) as upcoming_interviews,
  
  -- CRM Metrics
  (SELECT COUNT(*) FROM clients WHERE status = 'active' AND deleted_at IS NULL) as active_clients,
  (SELECT COUNT(*) FROM opportunities WHERE stage NOT IN ('closed_won', 'closed_lost')) as open_opportunities,
  (SELECT COALESCE(SUM(weighted_value), 0) FROM opportunities WHERE stage NOT IN ('closed_won', 'closed_lost')) as pipeline_value,
  
  -- Operations Metrics
  (SELECT COUNT(*) FROM placements WHERE status = 'active') as active_placements,
  (SELECT COUNT(*) FROM timesheets WHERE status = 'submitted') as pending_timesheets,
  (SELECT COUNT(*) FROM contracts WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days' AND status = 'signed') as expiring_contracts,
  
  NOW() as last_updated;

-- Index on materialized view
CREATE UNIQUE INDEX idx_dashboard_metrics_updated ON dashboard_metrics(last_updated);

-- Function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for recruiter pipeline
CREATE OR REPLACE VIEW recruiter_pipeline AS
SELECT
  u.id as recruiter_id,
  u.full_name as recruiter_name,
  
  -- Pipeline counts
  COUNT(DISTINCT CASE WHEN a.stage = 'sourced' THEN a.id END) as sourced,
  COUNT(DISTINCT CASE WHEN a.stage = 'screening' THEN a.id END) as screening,
  COUNT(DISTINCT CASE WHEN a.stage = 'submitted' THEN a.id END) as submitted,
  COUNT(DISTINCT CASE WHEN a.stage IN ('client_review', 'interview_scheduled', 'interviewing', 'interview_completed') THEN a.id END) as interviewing,
  COUNT(DISTINCT CASE WHEN a.stage IN ('offer', 'offer_accepted') THEN a.id END) as offers,
  COUNT(DISTINCT CASE WHEN a.stage = 'placed' THEN a.id END) as placed,
  
  -- Success metrics
  COUNT(DISTINCT c.id) as total_candidates,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT CASE WHEN a.stage = 'placed' AND a.stage_changed_at >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) as placements_this_month
  
FROM user_profiles u
LEFT JOIN candidates c ON c.owner_id = u.id AND c.deleted_at IS NULL
LEFT JOIN applications a ON a.owner_id = u.id AND a.is_active = true
LEFT JOIN jobs j ON j.owner_id = u.id AND j.deleted_at IS NULL
WHERE u.role = 'recruiter' AND u.is_active = true
GROUP BY u.id, u.full_name;

-- Create view for sales pipeline
CREATE OR REPLACE VIEW sales_pipeline AS
SELECT
  u.id as sales_rep_id,
  u.full_name as sales_rep_name,
  
  -- Pipeline counts
  COUNT(DISTINCT CASE WHEN o.stage = 'lead' THEN o.id END) as leads,
  COUNT(DISTINCT CASE WHEN o.stage = 'qualified' THEN o.id END) as qualified,
  COUNT(DISTINCT CASE WHEN o.stage = 'proposal' THEN o.id END) as proposals,
  COUNT(DISTINCT CASE WHEN o.stage = 'negotiation' THEN o.id END) as negotiations,
  COUNT(DISTINCT CASE WHEN o.stage = 'closed_won' AND o.actual_close_date >= CURRENT_DATE - INTERVAL '30 days' THEN o.id END) as closed_this_month,
  
  -- Value metrics
  COALESCE(SUM(CASE WHEN o.stage NOT IN ('closed_won', 'closed_lost') THEN o.weighted_value END), 0) as pipeline_value,
  COALESCE(SUM(CASE WHEN o.stage = 'closed_won' AND o.actual_close_date >= DATE_TRUNC('quarter', CURRENT_DATE) THEN o.estimated_value END), 0) as revenue_this_quarter,
  
  -- Client metrics
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_clients
  
FROM user_profiles u
LEFT JOIN opportunities o ON o.owner_id = u.id
LEFT JOIN clients c ON c.sales_rep_id = u.id AND c.deleted_at IS NULL
WHERE u.role IN ('sales', 'account_manager') AND u.is_active = true
GROUP BY u.id, u.full_name;

-- Create view for placement metrics
CREATE OR REPLACE VIEW placement_metrics AS
SELECT
  DATE_TRUNC('month', p.start_date) as month,
  COUNT(*) as placements_started,
  AVG(p.margin_percentage) as avg_margin_percentage,
  SUM(p.bill_rate) as total_monthly_billing,
  COUNT(DISTINCT p.client_id) as unique_clients,
  COUNT(DISTINCT p.candidate_id) as unique_consultants
FROM placements p
WHERE p.start_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', p.start_date)
ORDER BY month DESC;

-- Function to get candidate match score
CREATE OR REPLACE FUNCTION get_candidate_match_score(
  p_candidate_id UUID,
  p_job_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_candidate_skills TEXT[];
  v_job_requirements TEXT[];
  v_matching_skills INTEGER;
BEGIN
  -- Get candidate skills and job requirements
  SELECT skills INTO v_candidate_skills FROM candidates WHERE id = p_candidate_id;
  SELECT requirements INTO v_job_requirements FROM jobs WHERE id = p_job_id;
  
  -- Count matching skills
  SELECT COUNT(*)
  INTO v_matching_skills
  FROM unnest(v_candidate_skills) AS skill
  WHERE skill = ANY(v_job_requirements);
  
  -- Calculate score (0-100)
  IF array_length(v_job_requirements, 1) > 0 THEN
    v_score := (v_matching_skills * 100) / array_length(v_job_requirements, 1);
  END IF;
  
  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get recruiter performance
CREATE OR REPLACE FUNCTION get_recruiter_performance(
  p_recruiter_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  metric TEXT,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'candidates_added'::TEXT, COUNT(DISTINCT c.id)::NUMERIC
  FROM candidates c
  WHERE c.owner_id = p_recruiter_id
  AND c.created_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  SELECT 'applications_submitted'::TEXT, COUNT(DISTINCT a.id)::NUMERIC
  FROM applications a
  WHERE a.owner_id = p_recruiter_id
  AND a.submitted_to_client_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  SELECT 'interviews_scheduled'::TEXT, COUNT(DISTINCT i.id)::NUMERIC
  FROM interviews i
  JOIN applications a ON a.id = i.application_id
  WHERE a.owner_id = p_recruiter_id
  AND i.scheduled_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  SELECT 'placements_made'::TEXT, COUNT(DISTINCT p.id)::NUMERIC
  FROM placements p
  WHERE p.recruiter_id = p_recruiter_id
  AND p.start_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

