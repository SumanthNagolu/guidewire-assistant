// Academy LMS Type Definitions
// Auto-generated from database schema - do not edit manually

export interface LearningPath {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  ai_generated: boolean;
  target_role: string | null;
  estimated_hours: number | null;
  topics_sequence: string[];
  metadata: Record<string, any>;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LearningBlock {
  id: string;
  topic_id: string;
  block_type: 'theory' | 'demo' | 'practice' | 'project';
  position: number;
  title: string;
  description: string | null;
  content: LearningBlockContent;
  duration_minutes: number | null;
  ai_enhanced: boolean;
  required_for_completion: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningBlockContent {
  type: string;
  data: any;
  resources?: Resource[];
  interactive?: boolean;
  ai_notes?: string[];
}

export interface Resource {
  title: string;
  type: 'video' | 'document' | 'link' | 'code';
  url: string;
  duration?: number;
}

export interface LearningBlockCompletion {
  id: string;
  user_id: string;
  learning_block_id: string;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  score: number | null;
  attempts: number;
  metadata: Record<string, any>;
}

export interface UserLevel {
  user_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  level_progress: number;
  skill_points: number;
  skill_points_spent: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: XPReason;
  reason_detail: string | null;
  reference_type: string | null;
  reference_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type XPReason = 
  | 'topic_completion'
  | 'quiz_perfect'
  | 'achievement_unlock'
  | 'streak_bonus'
  | 'help_others'
  | 'first_completion'
  | 'speed_bonus';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: 'learning' | 'social' | 'mastery' | 'special';
  icon_url: string | null;
  badge_color: string | null;
  xp_reward: number;
  skill_points_reward: number;
  requirements: AchievementRequirement;
  is_secret: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementRequirement {
  type: string;
  count?: number;
  value?: any;
  conditions?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  metadata: Record<string, any>;
  achievement?: Achievement; // Joined data
}

export interface LeaderboardEntry {
  id: string;
  leaderboard_type: 'weekly' | 'monthly' | 'all-time' | 'product';
  period_start: string | null;
  period_end: string | null;
  user_id: string;
  score: number;
  rank: number | null;
  metadata: Record<string, any>;
  created_at: string;
  user?: { // Joined data
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface AIPathGeneration {
  id: string;
  user_id: string;
  learning_path_id: string | null;
  user_context: UserContext;
  ai_model: string;
  prompt_template: string | null;
  generated_content: GeneratedPath;
  feedback_rating: number | null;
  feedback_text: string | null;
  created_at: string;
}

export interface UserContext {
  resume_text?: string;
  experience_level: string;
  target_role: string;
  goals: string[];
  availability_hours_per_week: number;
}

export interface GeneratedPath {
  path_name: string;
  description: string;
  topics: Array<{
    topic_id: string;
    reason: string;
    estimated_hours: number;
  }>;
  milestones: Array<{
    week: number;
    goals: string[];
  }>;
}

export interface AIProjectPlan {
  id: string;
  user_id: string;
  learning_block_id: string | null;
  assignment_template: AssignmentTemplate;
  user_context: UserContext;
  generated_plan: GeneratedProject;
  complexity_level: 1 | 2 | 3 | 4 | 5;
  technologies: string[];
  estimated_hours: number | null;
  ai_model: string;
  feedback_rating: number | null;
  created_at: string;
}

export interface AssignmentTemplate {
  title: string;
  base_requirements: string[];
  technology_stack: string[];
  business_context: string;
}

export interface GeneratedProject {
  scenario: string;
  company_context: string;
  detailed_requirements: Requirement[];
  implementation_steps: ImplementationStep[];
  acceptance_criteria: string[];
  bonus_challenges: string[];
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'must' | 'should' | 'could';
  technical_details: string[];
}

export interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  code_snippet?: string;
  tips: string[];
  common_mistakes: string[];
}

export interface AIMentorshipSession {
  id: string;
  user_id: string;
  topic_id: string | null;
  conversation_id: string;
  messages: ChatMessage[];
  context: SessionContext;
  total_tokens_used: number;
  ai_model: string;
  session_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SessionContext {
  current_topic?: string;
  recent_completions?: string[];
  learning_goals?: string[];
  skill_level?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  subscription_tier: 'team' | 'business' | 'enterprise';
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string | null;
  seats_purchased: number;
  seats_used: number;
  custom_branding: CustomBranding;
  sso_config: SSOConfig;
  settings: OrganizationSettings;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomBranding {
  primary_color?: string;
  logo_url?: string;
  favicon_url?: string;
  custom_css?: string;
}

export interface SSOConfig {
  enabled: boolean;
  provider?: 'saml' | 'oauth' | 'azure_ad';
  config?: Record<string, any>;
}

export interface OrganizationSettings {
  allow_self_signup: boolean;
  default_learning_paths?: string[];
  completion_requirements?: Record<string, any>;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'learner' | 'manager' | 'admin' | 'owner';
  department: string | null;
  employee_id: string | null;
  assigned_paths: string[];
  settings: Record<string, any>;
  invited_at: string | null;
  joined_at: string;
  last_active_at: string | null;
  created_at: string;
  user?: { // Joined data
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface TeamLearningGoal {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  target_completion_date: string | null;
  required_topics: string[];
  required_achievements: string[];
  assigned_members: string[];
  progress_percentage: number;
  status: 'draft' | 'active' | 'completed' | 'canceled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  type: 'b2c' | 'b2b';
  price_monthly: number | null;
  price_yearly: number | null;
  features: PlanFeatures;
  limits: PlanLimits;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlanFeatures {
  courses: string[];
  ai_features: boolean;
  mentor_hours?: number;
  custom_paths: boolean;
  certificates: boolean;
  priority_support: boolean;
}

export interface PlanLimits {
  max_courses?: number;
  max_ai_queries?: number;
  max_projects?: number;
}

export interface UserSubscription {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  subscription_plan_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Gamification Helpers
export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNext: number;
  progress: number;
  title: string;
}

export function calculateLevelInfo(totalXP: number): LevelInfo {
  let level = 1;
  let xpRequired = 0;
  
  while (calculateXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  
  xpRequired = calculateXPForLevel(level);
  const xpForNext = calculateXPForLevel(level + 1);
  const progress = ((totalXP - xpRequired) / (xpForNext - xpRequired)) * 100;
  
  return {
    level,
    xpRequired,
    xpForNext,
    progress,
    title: getLevelTitle(level)
  };
}

export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevelTitle(level: number): string {
  if (level < 5) return 'Novice';
  if (level < 10) return 'Apprentice';
  if (level < 20) return 'Practitioner';
  if (level < 30) return 'Expert';
  if (level < 50) return 'Master';
  return 'Grandmaster';
}

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  learning: { name: 'Learning', icon: '📚', color: 'blue' },
  social: { name: 'Community', icon: '👥', color: 'green' },
  mastery: { name: 'Mastery', icon: '🏆', color: 'yellow' },
  special: { name: 'Special', icon: '⭐', color: 'purple' }
} as const;

// XP Reward Constants
export const XP_REWARDS = {
  complete_theory: 10,
  watch_demo: 15,
  complete_practice: 25,
  submit_project: 100,
  perfect_quiz: 50,
  help_peer: 25,
  daily_streak: 20,
  weekly_streak: 200
} as const;


