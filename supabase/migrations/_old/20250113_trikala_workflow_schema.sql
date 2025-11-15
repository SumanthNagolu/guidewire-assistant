-- ============================================
-- TRIKALA WORKFLOW ORCHESTRATION PLATFORM
-- Database Schema Extensions
-- Created: 2025-01-13
-- ============================================
-- Extends existing CRM/ATS and Productivity schemas with:
-- - Visual workflow engine
-- - Enhanced object lifecycle management
-- - Gamification system
-- - AI integration points
-- - Advanced performance tracking
-- ============================================

-- ============================================
-- 1. WORKFLOW ENGINE TABLES
-- ============================================

-- Workflow templates: Define reusable workflow patterns
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('recruiting', 'bench_sales', 'training', 'sales', 'talent_acquisition', 'custom')),
  
  -- Workflow definition (JSON)
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  transitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Visual designer data
  designer_data JSONB DEFAULT '{}'::jsonb, -- Positions, colors, etc.
  
  -- Template settings
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE, -- System templates can't be edited
  version INTEGER DEFAULT 1,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  pod_id UUID REFERENCES pods(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active);

-- ============================================

-- Workflow instances: Active workflow executions
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workflow_templates(id),
  
  -- Instance identification
  name TEXT NOT NULL,
  instance_type TEXT CHECK (instance_type IN ('job', 'candidate', 'lead', 'training', 'custom')),
  
  -- Current state
  current_stage TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')) DEFAULT 'active',
  
  -- Assignment
  pod_id UUID REFERENCES pods(id),
  owner_id UUID REFERENCES auth.users(id),
  
  -- Context data
  context_data JSONB DEFAULT '{}'::jsonb, -- Workflow-specific data
  
  -- Related entities
  job_id UUID REFERENCES jobs(id),
  candidate_id UUID REFERENCES candidates(id),
  
  -- Progress tracking
  stages_completed INTEGER DEFAULT 0,
  total_stages INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  
  -- SLA tracking
  sla_deadline TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT FALSE,
  
  -- Time tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_duration INTERVAL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_pod ON workflow_instances(pod_id);
CREATE INDEX idx_workflow_instances_owner ON workflow_instances(owner_id);
CREATE INDEX idx_workflow_instances_overdue ON workflow_instances(is_overdue) WHERE is_overdue = TRUE;

-- ============================================

-- Workflow stage history: Track stage transitions
CREATE TABLE IF NOT EXISTS workflow_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  
  -- Stage transition
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  
  -- Transition metadata
  transitioned_by UUID REFERENCES auth.users(id),
  transition_reason TEXT,
  
  -- Duration in previous stage
  duration_in_stage INTERVAL,
  
  -- Data snapshot at transition
  stage_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_stage_history_instance ON workflow_stage_history(instance_id, created_at);

-- ============================================
-- 2. ENHANCED OBJECT LIFECYCLE TABLES
-- ============================================

-- Object types: Define object schemas
CREATE TABLE IF NOT EXISTS object_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  
  -- Object schema
  fields_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Lifecycle configuration
  default_workflow_template_id UUID REFERENCES workflow_templates(id),
  lifecycle_stages JSONB DEFAULT '[]'::jsonb,
  
  -- UI configuration
  icon TEXT,
  color TEXT,
  list_display_fields TEXT[],
  search_fields TEXT[],
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================

-- Objects: Universal object store
CREATE TABLE IF NOT EXISTS objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID NOT NULL REFERENCES object_types(id),
  
  -- Object identification
  name TEXT NOT NULL,
  external_id TEXT, -- ID from external system
  
  -- Object data
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Workflow state
  workflow_instance_id UUID REFERENCES workflow_instances(id),
  current_stage TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  pod_id UUID REFERENCES pods(id),
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_objects_type ON objects(type_id);
CREATE INDEX idx_objects_workflow ON objects(workflow_instance_id);
CREATE INDEX idx_objects_assigned ON objects(assigned_to);
CREATE INDEX idx_objects_pod ON objects(pod_id);
CREATE INDEX idx_objects_status ON objects(status);

-- ============================================
-- 3. GAMIFICATION TABLES
-- ============================================

-- Activity definitions: Define trackable activities
CREATE TABLE IF NOT EXISTS activity_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Activity categorization
  category TEXT CHECK (category IN ('sourcing', 'screening', 'submission', 'communication', 'lead_gen', 'training', 'quality')),
  
  -- Point configuration
  base_points INTEGER NOT NULL DEFAULT 1,
  max_daily_points INTEGER, -- Daily cap per activity
  
  -- Tracking configuration
  tracking_method TEXT CHECK (tracking_method IN ('manual', 'automatic', 'api', 'verification_required')),
  verification_rules JSONB DEFAULT '{}'::jsonb,
  
  -- UI configuration
  icon TEXT,
  color TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  requires_evidence BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_definitions_category ON activity_definitions(category);
CREATE INDEX idx_activity_definitions_active ON activity_definitions(is_active);

-- ============================================

-- User activities: Track all user activities for gamification
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_definition_id UUID NOT NULL REFERENCES activity_definitions(id),
  
  -- Activity details
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity INTEGER DEFAULT 1,
  points_earned INTEGER NOT NULL,
  
  -- Context
  pod_id UUID REFERENCES pods(id),
  related_object_id UUID, -- Can reference any object
  related_object_type TEXT,
  
  -- Evidence/verification
  evidence_data JSONB DEFAULT '{}'::jsonb,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Quality score
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, activity_date DESC);
CREATE INDEX idx_user_activities_pod_date ON user_activities(pod_id, activity_date DESC);
CREATE INDEX idx_user_activities_definition ON user_activities(activity_definition_id);

-- ============================================

-- Achievements: Badges and milestones
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Achievement type
  type TEXT CHECK (type IN ('badge', 'milestone', 'streak', 'level', 'special')),
  category TEXT CHECK (category IN ('performance', 'quality', 'teamwork', 'innovation', 'growth')),
  
  -- Requirements
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Rewards
  points_value INTEGER DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb, -- Additional benefits
  
  -- UI
  icon_url TEXT,
  badge_color TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_secret BOOLEAN DEFAULT FALSE, -- Hidden until earned
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_achievements_category ON achievements(category);

-- ============================================

-- User achievements: Earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  
  -- Earning details
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress_data JSONB DEFAULT '{}'::jsonb,
  
  -- Display settings
  is_featured BOOLEAN DEFAULT FALSE, -- Show on profile
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- ============================================

-- Performance targets: Individual and team targets
CREATE TABLE IF NOT EXISTS performance_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target scope
  target_type TEXT CHECK (target_type IN ('user', 'pod', 'company')) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  pod_id UUID REFERENCES pods(id),
  
  -- Target details
  metric_name TEXT NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  
  -- Period
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'sprint', 'monthly', 'quarterly', 'annual')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'active', 'achieved', 'missed')) DEFAULT 'active',
  achievement_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Rewards
  points_for_achievement INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(target_type, COALESCE(user_id, pod_id), metric_name, period_start)
);

CREATE INDEX idx_performance_targets_user ON performance_targets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_performance_targets_pod ON performance_targets(pod_id) WHERE pod_id IS NOT NULL;
CREATE INDEX idx_performance_targets_period ON performance_targets(period_start, period_end);
CREATE INDEX idx_performance_targets_status ON performance_targets(status);

-- ============================================

-- Peer feedback: 360-degree feedback system
CREATE TABLE IF NOT EXISTS peer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Feedback participants
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Feedback period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Ratings (1-5 scale)
  technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
  reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),
  innovation INTEGER CHECK (innovation >= 1 AND innovation <= 5),
  
  -- Overall
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Comments
  strengths TEXT,
  areas_for_improvement TEXT,
  general_comments TEXT,
  
  -- Anonymous option
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'submitted', 'acknowledged')) DEFAULT 'draft',
  
  -- Metadata
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(from_user_id, to_user_id, period_start)
);

CREATE INDEX idx_peer_feedback_to_user ON peer_feedback(to_user_id);
CREATE INDEX idx_peer_feedback_from_user ON peer_feedback(from_user_id);
CREATE INDEX idx_peer_feedback_period ON peer_feedback(period_start, period_end);

-- ============================================
-- 4. ENHANCED SOURCING & COMMUNICATION TABLES
-- ============================================

-- Resume database: Internal ATS
CREATE TABLE IF NOT EXISTS resume_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Professional info
  current_title TEXT,
  years_experience DECIMAL(3,1),
  skills TEXT[],
  
  -- Resume data
  resume_text TEXT, -- Full text for search
  resume_url TEXT, -- Storage URL
  parsed_data JSONB DEFAULT '{}'::jsonb, -- Structured data from parsing
  
  -- AI embeddings for semantic search
  embedding vector(1536), -- OpenAI embeddings
  
  -- Source tracking
  source TEXT CHECK (source IN ('internal_db', 'linkedin', 'dice', 'indeed', 'referral', 'direct', 'other')),
  source_id TEXT, -- External ID
  
  -- Quality scoring
  completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
  relevance_scores JSONB DEFAULT '{}'::jsonb, -- Scores for different roles
  
  -- Status
  status TEXT CHECK (status IN ('active', 'placed', 'not_interested', 'blacklisted')) DEFAULT 'active',
  
  -- Metadata
  added_by UUID REFERENCES auth.users(id),
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resume_database_email ON resume_database(email);
CREATE INDEX idx_resume_database_phone ON resume_database(phone);
CREATE INDEX idx_resume_database_skills ON resume_database USING GIN(skills);
CREATE INDEX idx_resume_database_status ON resume_database(status);
CREATE INDEX idx_resume_database_embedding ON resume_database USING ivfflat (embedding vector_cosine_ops);

-- ============================================

-- Sourcing sessions: Track sourcing activities
CREATE TABLE IF NOT EXISTS sourcing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  job_id UUID REFERENCES jobs(id),
  jd_assignment_id UUID REFERENCES jd_assignments(id),
  
  -- Session details
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  
  -- Sourcing targets
  target_resumes INTEGER DEFAULT 30,
  resumes_found INTEGER DEFAULT 0,
  
  -- Source breakdown
  resumes_from_internal INTEGER DEFAULT 0,
  resumes_from_linkedin INTEGER DEFAULT 0,
  resumes_from_dice INTEGER DEFAULT 0,
  resumes_from_indeed INTEGER DEFAULT 0,
  resumes_from_other INTEGER DEFAULT 0,
  
  -- Quality metrics
  resumes_qualified INTEGER DEFAULT 0,
  resumes_submitted INTEGER DEFAULT 0,
  
  -- AI assistance
  ai_suggestions_used INTEGER DEFAULT 0,
  ai_generated_searches TEXT[],
  
  -- Status
  status TEXT CHECK (status IN ('in_progress', 'completed', 'paused')) DEFAULT 'in_progress',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sourcing_sessions_user_date ON sourcing_sessions(user_id, session_date DESC);
CREATE INDEX idx_sourcing_sessions_job ON sourcing_sessions(job_id);
CREATE INDEX idx_sourcing_sessions_assignment ON sourcing_sessions(jd_assignment_id);

-- ============================================

-- Communication templates: Email and message templates
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('candidate_outreach', 'client_communication', 'status_update', 'follow_up', 'mass_mail')),
  
  -- Template content
  subject TEXT,
  body TEXT NOT NULL,
  
  -- Variables supported
  variables TEXT[], -- e.g., ['candidate_name', 'job_title', 'company_name']
  
  -- AI enhancement
  ai_enhanced BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB DEFAULT '{}'::jsonb,
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  success_rate DECIMAL(5,2), -- Based on response rates
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT FALSE,
  pod_id UUID REFERENCES pods(id),
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communication_templates_category ON communication_templates(category);
CREATE INDEX idx_communication_templates_public ON communication_templates(is_public);
CREATE INDEX idx_communication_templates_pod ON communication_templates(pod_id);

-- ============================================
-- 5. PERFORMANCE & ANALYTICS TABLES
-- ============================================

-- Production metrics: Real-time production line tracking
CREATE TABLE IF NOT EXISTS production_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric scope
  metric_type TEXT CHECK (metric_type IN ('user', 'pod', 'pipeline')) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  pod_id UUID REFERENCES pods(id),
  
  -- Time window
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Pipeline metrics
  objects_in_queue INTEGER DEFAULT 0,
  objects_in_progress INTEGER DEFAULT 0,
  objects_completed_today INTEGER DEFAULT 0,
  
  -- Velocity metrics
  avg_cycle_time_hours DECIMAL(10,2),
  throughput_per_hour DECIMAL(10,2),
  
  -- Quality metrics
  quality_score DECIMAL(5,2),
  error_rate DECIMAL(5,2),
  rework_rate DECIMAL(5,2),
  
  -- Bottlenecks
  current_bottleneck TEXT,
  bottleneck_impact_score DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_metrics_user_time ON production_metrics(user_id, timestamp DESC);
CREATE INDEX idx_production_metrics_pod_time ON production_metrics(pod_id, timestamp DESC);
CREATE INDEX idx_production_metrics_type ON production_metrics(metric_type);

-- ============================================

-- Leaderboards: Cached leaderboard data
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Leaderboard type
  leaderboard_type TEXT CHECK (leaderboard_type IN ('daily', 'weekly', 'sprint', 'monthly', 'all_time')) NOT NULL,
  category TEXT CHECK (category IN ('overall', 'sourcing', 'screening', 'placements', 'quality', 'teamwork')),
  
  -- Scope
  pod_id UUID REFERENCES pods(id), -- NULL for company-wide
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Leaderboard data (JSON array of rankings)
  rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Cache control
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(leaderboard_type, category, COALESCE(pod_id, '00000000-0000-0000-0000-000000000000'::uuid), period_start)
);

CREATE INDEX idx_leaderboards_type_category ON leaderboards(leaderboard_type, category);
CREATE INDEX idx_leaderboards_pod ON leaderboards(pod_id);
CREATE INDEX idx_leaderboards_expires ON leaderboards(expires_at);

-- ============================================
-- 6. AI INTEGRATION TABLES
-- ============================================

-- AI job matches: Store AI-generated candidate matches
CREATE TABLE IF NOT EXISTS ai_job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  resume_id UUID NOT NULL REFERENCES resume_database(id),
  
  -- Match scoring
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  skills_match_score DECIMAL(5,2),
  experience_match_score DECIMAL(5,2),
  education_match_score DECIMAL(5,2),
  
  -- Match explanation
  match_reasons JSONB DEFAULT '[]'::jsonb,
  missing_qualifications JSONB DEFAULT '[]'::jsonb,
  
  -- AI metadata
  model_version TEXT,
  confidence_score DECIMAL(5,2),
  
  -- Human validation
  validated_by UUID REFERENCES auth.users(id),
  validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validation_notes TEXT,
  
  -- Usage
  times_viewed INTEGER DEFAULT 0,
  submitted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, resume_id)
);

CREATE INDEX idx_ai_job_matches_job ON ai_job_matches(job_id);
CREATE INDEX idx_ai_job_matches_score ON ai_job_matches(overall_score DESC);
CREATE INDEX idx_ai_job_matches_status ON ai_job_matches(validation_status);

-- ============================================
-- 7. VENDOR NETWORK TABLES
-- ============================================

-- Vendor companies: External recruiting partners
CREATE TABLE IF NOT EXISTS vendor_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Company details
  company_size TEXT CHECK (company_size IN ('small', 'medium', 'large')),
  specializations TEXT[],
  
  -- Relationship
  relationship_status TEXT CHECK (relationship_status IN ('active', 'inactive', 'blacklisted')) DEFAULT 'active',
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')) DEFAULT 'bronze',
  
  -- Performance metrics
  total_submissions INTEGER DEFAULT 0,
  total_placements INTEGER DEFAULT 0,
  placement_rate DECIMAL(5,2),
  avg_quality_score DECIMAL(5,2),
  
  -- Contract details
  commission_rate DECIMAL(5,2),
  payment_terms TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_companies_status ON vendor_companies(relationship_status);
CREATE INDEX idx_vendor_companies_tier ON vendor_companies(tier);

-- ============================================
-- VIEWS
-- ============================================

-- Production line view: Real-time workflow status
CREATE OR REPLACE VIEW production_line_view AS
SELECT
  wi.id,
  wi.name,
  wi.current_stage,
  wi.status,
  wi.completion_percentage,
  wi.is_overdue,
  p.name as pod_name,
  up.first_name || ' ' || up.last_name as owner_name,
  EXTRACT(EPOCH FROM (NOW() - wi.started_at))/3600 as hours_in_progress,
  wi.sla_deadline,
  CASE 
    WHEN wi.sla_deadline < NOW() THEN 'overdue'
    WHEN wi.sla_deadline < NOW() + INTERVAL '1 hour' THEN 'at_risk'
    ELSE 'on_track'
  END as sla_status
FROM workflow_instances wi
LEFT JOIN pods p ON wi.pod_id = p.id
LEFT JOIN user_profiles up ON wi.owner_id = up.id
WHERE wi.status = 'active'
ORDER BY wi.is_overdue DESC, wi.sla_deadline ASC;

-- ============================================

-- Gamification dashboard view
CREATE OR REPLACE VIEW gamification_dashboard AS
SELECT
  up.id as user_id,
  up.first_name,
  up.last_name,
  COALESCE(SUM(ua.points_earned), 0) as total_points_today,
  COUNT(DISTINCT uach.achievement_id) as total_achievements,
  COALESCE(AVG(pf.overall_rating), 0) as peer_rating
FROM user_profiles up
LEFT JOIN user_activities ua ON up.id = ua.user_id AND ua.activity_date = CURRENT_DATE
LEFT JOIN user_achievements uach ON up.id = uach.user_id
LEFT JOIN peer_feedback pf ON up.id = pf.to_user_id AND pf.status = 'submitted'
GROUP BY up.id, up.first_name, up.last_name
ORDER BY total_points_today DESC;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_companies ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (keeping it simple for brevity - expand as needed)
CREATE POLICY "authenticated_read" ON workflow_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON workflow_instances FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON activity_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON leaderboards FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON object_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read" ON vendor_companies FOR SELECT TO authenticated USING (true);

-- User-specific policies
CREATE POLICY "users_own_data" ON user_activities FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON sourcing_sessions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_own_data" ON performance_targets FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "users_own_feedback" ON peer_feedback FOR ALL TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update workflow instance completion percentage
CREATE OR REPLACE FUNCTION update_workflow_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workflow_instances
  SET 
    stages_completed = stages_completed + 1,
    completion_percentage = ROUND((stages_completed + 1)::NUMERIC / total_stages * 100)
  WHERE id = NEW.instance_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_completion_trigger
  AFTER INSERT ON workflow_stage_history
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_completion();

-- Auto-update leaderboard expiry
CREATE OR REPLACE FUNCTION set_leaderboard_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = CASE NEW.leaderboard_type
    WHEN 'daily' THEN NEW.calculated_at + INTERVAL '1 hour'
    WHEN 'weekly' THEN NEW.calculated_at + INTERVAL '6 hours'
    WHEN 'sprint' THEN NEW.calculated_at + INTERVAL '12 hours'
    WHEN 'monthly' THEN NEW.calculated_at + INTERVAL '24 hours'
    ELSE NEW.calculated_at + INTERVAL '7 days'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leaderboard_expiry_trigger
  BEFORE INSERT ON leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION set_leaderboard_expiry();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- SEED DATA: Default Workflow Templates
-- ============================================

INSERT INTO workflow_templates (name, description, category, stages, transitions, designer_data, is_active, is_system)
VALUES 
-- Standard Recruiting Workflow
(
  'Standard Recruiting Process',
  'Default workflow for processing job requirements from client to placement',
  'recruiting',
  '[
    {"id": "start", "name": "Job Received", "type": "start", "description": "New job requirement received from client"},
    {"id": "assign", "name": "Assign to Pod", "type": "task", "assignee_role": "manager", "sla_hours": 1},
    {"id": "source", "name": "Source Candidates", "type": "task", "assignee_role": "sourcer", "sla_hours": 24},
    {"id": "screen", "name": "Screen Candidates", "type": "task", "assignee_role": "screener", "sla_hours": 48},
    {"id": "review", "name": "Review & Submit", "type": "review", "assignee_role": "account_manager", "sla_hours": 4},
    {"id": "client_feedback", "name": "Client Feedback", "type": "wait", "sla_hours": 72},
    {"id": "interview", "name": "Interview Coordination", "type": "task", "assignee_role": "account_manager"},
    {"id": "offer", "name": "Offer Management", "type": "task", "assignee_role": "account_manager"},
    {"id": "placement", "name": "Placement Complete", "type": "end"}
  ]'::jsonb,
  '[
    {"id": "t1", "source": "start", "target": "assign"},
    {"id": "t2", "source": "assign", "target": "source"},
    {"id": "t3", "source": "source", "target": "screen"},
    {"id": "t4", "source": "screen", "target": "review"},
    {"id": "t5", "source": "review", "target": "client_feedback"},
    {"id": "t6", "source": "client_feedback", "target": "interview", "label": "Selected"},
    {"id": "t7", "source": "client_feedback", "target": "source", "label": "Rejected"},
    {"id": "t8", "source": "interview", "target": "offer", "label": "Passed"},
    {"id": "t9", "source": "interview", "target": "source", "label": "Failed"},
    {"id": "t10", "source": "offer", "target": "placement", "label": "Accepted"},
    {"id": "t11", "source": "offer", "target": "source", "label": "Declined"}
  ]'::jsonb,
  '{
    "nodePositions": {
      "start": {"x": 100, "y": 200},
      "assign": {"x": 250, "y": 200},
      "source": {"x": 400, "y": 200},
      "screen": {"x": 550, "y": 200},
      "review": {"x": 700, "y": 200},
      "client_feedback": {"x": 850, "y": 200},
      "interview": {"x": 1000, "y": 150},
      "offer": {"x": 1150, "y": 150},
      "placement": {"x": 1300, "y": 200}
    }
  }'::jsonb,
  true,
  true
),
-- Bench Sales Workflow
(
  'Bench Candidate Marketing',
  'Process for marketing bench candidates to potential opportunities',
  'bench_sales',
  '[
    {"id": "start", "name": "Candidate Available", "type": "start"},
    {"id": "profile_update", "name": "Update Profile", "type": "task", "assignee_role": "screener", "sla_hours": 2},
    {"id": "market_research", "name": "Market Research", "type": "task", "assignee_role": "sourcer", "sla_hours": 8},
    {"id": "job_matching", "name": "Match to Jobs", "type": "task", "assignee_role": "screener", "sla_hours": 24},
    {"id": "submission", "name": "Submit to Clients", "type": "task", "assignee_role": "account_manager", "sla_hours": 4},
    {"id": "followup", "name": "Follow Up", "type": "notification", "sla_hours": 48},
    {"id": "interview", "name": "Interview Process", "type": "task", "assignee_role": "account_manager"},
    {"id": "placement", "name": "Placement Success", "type": "end"}
  ]'::jsonb,
  '[
    {"id": "t1", "source": "start", "target": "profile_update"},
    {"id": "t2", "source": "profile_update", "target": "market_research"},
    {"id": "t3", "source": "market_research", "target": "job_matching"},
    {"id": "t4", "source": "job_matching", "target": "submission"},
    {"id": "t5", "source": "submission", "target": "followup"},
    {"id": "t6", "source": "followup", "target": "interview", "label": "Response"},
    {"id": "t7", "source": "followup", "target": "job_matching", "label": "No Response"},
    {"id": "t8", "source": "interview", "target": "placement", "label": "Selected"},
    {"id": "t9", "source": "interview", "target": "job_matching", "label": "Not Selected"}
  ]'::jsonb,
  '{
    "nodePositions": {
      "start": {"x": 100, "y": 200},
      "profile_update": {"x": 250, "y": 200},
      "market_research": {"x": 400, "y": 200},
      "job_matching": {"x": 550, "y": 200},
      "submission": {"x": 700, "y": 200},
      "followup": {"x": 850, "y": 200},
      "interview": {"x": 1000, "y": 150},
      "placement": {"x": 1150, "y": 150}
    }
  }'::jsonb,
  true,
  true
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Trikala Workflow Platform Schema Created!';
  RAISE NOTICE '📊 Created new tables:';
  RAISE NOTICE '   - Workflow Engine (3 tables)';
  RAISE NOTICE '   - Object Management (2 tables)';
  RAISE NOTICE '   - Gamification System (7 tables)';
  RAISE NOTICE '   - Sourcing & Communication (3 tables)';
  RAISE NOTICE '   - Performance Analytics (3 tables)';
  RAISE NOTICE '   - AI Integration (1 table)';
  RAISE NOTICE '   - Vendor Network (1 table)';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '🎯 Added 2 default workflow templates';
  RAISE NOTICE '🚀 Ready for revolutionary workflow orchestration!';
END $$;
