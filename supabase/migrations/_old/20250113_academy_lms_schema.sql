-- Academy LMS Enhanced Schema
-- This migration adds gamification, AI features, and enterprise capabilities

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- ============================================================================
-- LEARNING SYSTEM ENHANCEMENTS
-- ============================================================================

-- Learning Paths: AI-generated personalized curriculum
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ai_generated BOOLEAN DEFAULT true,
  target_role VARCHAR(255), -- e.g., "Senior Developer", "Architect"
  estimated_hours INTEGER,
  topics_sequence UUID[], -- Ordered array of topic IDs
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_status ON learning_paths(status);

-- Learning Blocks: Modular content within topics
CREATE TABLE IF NOT EXISTS learning_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  block_type VARCHAR(20) NOT NULL CHECK (block_type IN ('theory', 'demo', 'practice', 'project')),
  position INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Rich content structure
  duration_minutes INTEGER,
  ai_enhanced BOOLEAN DEFAULT false,
  required_for_completion BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, position)
);

CREATE INDEX idx_learning_blocks_topic ON learning_blocks(topic_id);
CREATE INDEX idx_learning_blocks_type ON learning_blocks(block_type);

-- Learning Block Completions
CREATE TABLE IF NOT EXISTS learning_block_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_block_id UUID NOT NULL REFERENCES learning_blocks(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  score NUMERIC(5,2), -- For practice/project blocks
  attempts INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, learning_block_id)
);

CREATE INDEX idx_block_completions_user ON learning_block_completions(user_id);
CREATE INDEX idx_block_completions_block ON learning_block_completions(learning_block_id);

-- ============================================================================
-- GAMIFICATION SYSTEM
-- ============================================================================

-- User Levels and XP
CREATE TABLE IF NOT EXISTS user_levels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
  current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  level_progress NUMERIC(5,2) DEFAULT 0, -- Percentage to next level
  skill_points INTEGER DEFAULT 0 CHECK (skill_points >= 0),
  skill_points_spent INTEGER DEFAULT 0 CHECK (skill_points_spent >= 0),
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP Transactions Log
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL,
  reason_detail TEXT,
  reference_type VARCHAR(50), -- 'topic', 'quiz', 'achievement', etc.
  reference_id UUID, -- ID of related entity
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX idx_xp_transactions_reason ON xp_transactions(reason);

-- Achievements Definition
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'learning', 'social', 'mastery', 'special'
  icon_url TEXT,
  badge_color VARCHAR(20),
  xp_reward INTEGER DEFAULT 0,
  skill_points_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL, -- Complex requirement definitions
  is_secret BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_sort ON achievements(sort_order);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress NUMERIC(5,2) DEFAULT 100, -- For progressive achievements
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'all-time', 'product'
  period_start DATE,
  period_end DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  rank INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(leaderboard_type, period_start, user_id)
);

CREATE INDEX idx_leaderboard_type_period ON leaderboard_entries(leaderboard_type, period_start DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries(user_id);

-- Skill Trees
CREATE TABLE IF NOT EXISTS skill_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_tree_id UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES skill_tree_nodes(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  skill_points_cost INTEGER DEFAULT 1,
  benefits JSONB DEFAULT '{}', -- Unlocks, bonuses, etc.
  position_x INTEGER,
  position_y INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skill_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_node_id)
);

-- ============================================================================
-- AI FEATURES
-- ============================================================================

-- AI Learning Path Generations
CREATE TABLE IF NOT EXISTS ai_path_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  user_context JSONB NOT NULL, -- Resume, goals, experience level
  ai_model VARCHAR(50) NOT NULL,
  prompt_template TEXT,
  generated_content JSONB NOT NULL,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_path_user ON ai_path_generations(user_id, created_at DESC);

-- AI Project Plans
CREATE TABLE IF NOT EXISTS ai_project_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_block_id UUID REFERENCES learning_blocks(id),
  assignment_template JSONB NOT NULL,
  user_context JSONB NOT NULL, -- Experience, resume data
  generated_plan JSONB NOT NULL, -- Complete project specification
  complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
  technologies TEXT[],
  estimated_hours INTEGER,
  ai_model VARCHAR(50) NOT NULL,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_projects_user ON ai_project_plans(user_id, created_at DESC);

-- AI Mentorship Sessions
CREATE TABLE IF NOT EXISTS ai_mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  conversation_id UUID NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]', -- Array of {role, content, timestamp}
  context JSONB DEFAULT '{}', -- Current topic, recent progress, etc.
  total_tokens_used INTEGER DEFAULT 0,
  ai_model VARCHAR(50) NOT NULL,
  session_rating INTEGER CHECK (session_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_user ON ai_mentorship_sessions(user_id, created_at DESC);
CREATE INDEX idx_ai_sessions_conversation ON ai_mentorship_sessions(conversation_id);

-- AI Content Embeddings (for semantic search)
CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL, -- 'topic', 'block', 'document'
  content_id UUID NOT NULL,
  content_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding size
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_content ON content_embeddings(content_type, content_id);
CREATE INDEX idx_embeddings_vector ON content_embeddings USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- ENTERPRISE FEATURES
-- ============================================================================

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  subscription_tier VARCHAR(50) NOT NULL CHECK (subscription_tier IN ('team', 'business', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled')),
  trial_ends_at TIMESTAMPTZ,
  seats_purchased INTEGER NOT NULL CHECK (seats_purchased > 0),
  seats_used INTEGER DEFAULT 0,
  custom_branding JSONB DEFAULT '{}',
  sso_config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain);

-- Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'manager', 'admin', 'owner')),
  department VARCHAR(255),
  employee_id VARCHAR(255),
  assigned_paths UUID[],
  settings JSONB DEFAULT '{}',
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- Organization Invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX idx_org_invitations_email ON organization_invitations(email);

-- Team Learning Goals
CREATE TABLE IF NOT EXISTS team_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_completion_date DATE,
  required_topics UUID[],
  required_achievements UUID[],
  assigned_members UUID[],
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'canceled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_goals_org ON team_learning_goals(organization_id);
CREATE INDEX idx_team_goals_status ON team_learning_goals(status);

-- ============================================================================
-- PAYMENT & SUBSCRIPTION
-- ============================================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('b2c', 'b2b')),
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL,
  limits JSONB DEFAULT '{}',
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL))
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_org ON user_subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to calculate XP required for next level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Exponential growth formula: 100 * level^1.5
  RETURN FLOOR(100 * POWER(level, 1.5));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  xp_for_current_level INTEGER;
  xp_for_next_level INTEGER;
BEGIN
  -- Calculate new level based on total XP
  new_level := 1;
  WHILE calculate_xp_for_level(new_level + 1) <= NEW.total_xp LOOP
    new_level := new_level + 1;
  END LOOP;
  
  -- Update level and calculate progress
  NEW.current_level := new_level;
  xp_for_current_level := calculate_xp_for_level(new_level);
  xp_for_next_level := calculate_xp_for_level(new_level + 1);
  NEW.level_progress := ((NEW.total_xp - xp_for_current_level)::NUMERIC / (xp_for_next_level - xp_for_current_level)::NUMERIC) * 100;
  
  -- Award skill points for leveling up
  IF OLD.current_level < NEW.current_level THEN
    NEW.skill_points := NEW.skill_points + (NEW.current_level - OLD.current_level);
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_level_trigger
BEFORE UPDATE OF total_xp ON user_levels
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason VARCHAR(50),
  p_reason_detail TEXT DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_xp INTEGER;
  v_total_xp INTEGER;
BEGIN
  -- Insert XP transaction
  INSERT INTO xp_transactions (user_id, amount, reason, reason_detail, reference_type, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_reason_detail, p_reference_type, p_reference_id);
  
  -- Update user level
  INSERT INTO user_levels (user_id, current_xp, total_xp)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET current_xp = user_levels.current_xp + p_amount,
      total_xp = user_levels.total_xp + p_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  achievement RECORD;
  qualified BOOLEAN;
BEGIN
  -- Loop through all unearned achievements
  FOR achievement IN 
    SELECT a.* FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = p_user_id
    WHERE ua.id IS NULL AND NOT a.is_secret
  LOOP
    -- Check if user qualifies (simplified - actual logic would be more complex)
    qualified := FALSE;
    
    -- Example: Check for "first_topic" achievement
    IF achievement.code = 'first_topic' THEN
      SELECT EXISTS (
        SELECT 1 FROM topic_completions 
        WHERE user_id = p_user_id AND completed_at IS NOT NULL
      ) INTO qualified;
    END IF;
    
    -- Award achievement if qualified
    IF qualified THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, achievement.id);
      
      -- Award XP for achievement
      IF achievement.xp_reward > 0 THEN
        PERFORM award_xp(p_user_id, achievement.xp_reward, 'achievement', achievement.name, 'achievement', achievement.id);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update organization seat usage
CREATE OR REPLACE FUNCTION update_organization_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations 
    SET seats_used = seats_used + 1
    WHERE id = NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations 
    SET seats_used = seats_used - 1
    WHERE id = OLD.organization_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_seats_trigger
AFTER INSERT OR DELETE ON organization_members
FOR EACH ROW
EXECUTE FUNCTION update_organization_seats();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_block_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_path_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_project_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Learning Paths Policies
CREATE POLICY "Users can view their own learning paths" ON learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning paths" ON learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths" ON learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- Learning Blocks Policies (public read for enrolled users)
CREATE POLICY "Users can view learning blocks for enrolled topics" ON learning_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM topic_completions tc
      WHERE tc.topic_id = learning_blocks.topic_id
      AND tc.user_id = auth.uid()
    )
  );

-- User Levels Policies
CREATE POLICY "Users can view their own level" ON user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view leaderboard data" ON user_levels
  FOR SELECT USING (true); -- Limited columns should be exposed via view

-- Achievements Policies
CREATE POLICY "Public can view achievements" ON achievements
  FOR SELECT USING (NOT is_secret OR EXISTS (
    SELECT 1 FROM user_achievements ua 
    WHERE ua.achievement_id = achievements.id 
    AND ua.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Organization Policies
CREATE POLICY "Organization members can view their org" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update their org" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert achievement definitions
INSERT INTO achievements (code, name, description, category, xp_reward, requirements) VALUES
  ('first_steps', '🚀 First Steps', 'Complete your first topic', 'learning', 50, '{"type": "topic_completion", "count": 1}'),
  ('speed_learner', '⚡ Speed Learner', 'Complete 5 topics in one day', 'learning', 200, '{"type": "daily_topics", "count": 5}'),
  ('perfectionist', '🎯 Perfectionist', 'Score 100% on 5 quizzes in a row', 'mastery', 300, '{"type": "perfect_quizzes", "count": 5}'),
  ('knowledge_seeker', '🧠 Knowledge Seeker', 'Read all additional resources in 10 topics', 'learning', 150, '{"type": "resources_read", "count": 10}'),
  ('helping_hand', '👥 Helping Hand', 'Answer 10 community questions', 'social', 100, '{"type": "community_answers", "count": 10}'),
  ('streak_week', '🔥 Week Warrior', 'Maintain a 7-day learning streak', 'learning', 250, '{"type": "streak", "days": 7}'),
  ('domain_expert', '🏆 Domain Expert', 'Complete all topics in a product', 'mastery', 1000, '{"type": "product_completion", "count": 1}')
ON CONFLICT (code) DO NOTHING;

-- Insert skill trees (example for ClaimCenter)
INSERT INTO skill_trees (name, description) VALUES
  ('ClaimCenter Mastery', 'Master all aspects of ClaimCenter configuration and development')
ON CONFLICT DO NOTHING;


