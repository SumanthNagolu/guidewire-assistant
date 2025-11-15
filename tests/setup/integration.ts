import { beforeAll, afterAll, beforeEach } from 'vitest'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Test database URL from GitHub Actions or local
const TEST_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
const TEST_SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
const TEST_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const testSupabase = createClient<Database>(
  TEST_SUPABASE_URL,
  TEST_SUPABASE_ANON_KEY
)

// Setup test database
beforeAll(async () => {
  console.log('Setting up test database...')
  
  // Run migrations
  try {
    execSync('npm run db:migrate', { stdio: 'inherit' })
  } catch (error) {
    console.error('Failed to run migrations:', error)
    throw error
  }
})

// Clean up database between tests
beforeEach(async () => {
  // Clean up test data (preserve schema)
  const tablesToClean = [
    'user_achievements',
    'achievements',
    'leaderboard_entries',
    'xp_transactions',
    'user_skill_unlocks',
    'skill_tree_nodes',
    'skill_trees',
    'user_levels',
    'learning_block_completions',
    'learning_blocks',
    'learning_paths',
    'ai_mentorship_sessions',
    'ai_project_plans',
    'ai_path_generations',
    'content_embeddings',
    'user_subscriptions',
    'subscription_plans',
    'team_learning_goals',
    'organization_invitations',
    'organization_members',
    'organizations',
    'user_quiz_attempts',
    'quiz_options',
    'quiz_questions',
    'quizzes',
    'user_progress',
    'topics',
    'products',
    'user_profiles',
    'certificates',
  ]

  for (const table of tablesToClean) {
    try {
      await testSupabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    } catch (error) {
      // Table might not exist yet
    }
  }
})

// Cleanup after all tests
afterAll(async () => {
  console.log('Cleaning up test database...')
})

// Test utilities
export async function createTestUser(email = 'test@example.com') {
  const { data: authData, error: authError } = await testSupabase.auth.signUp({
    email,
    password: 'testpassword123',
  })

  if (authError) throw authError

  const userId = authData.user!.id

  // Create user profile
  const { error: profileError } = await testSupabase
    .from('user_profiles')
    .insert({
      id: userId,
      first_name: 'Test',
      last_name: 'User',
      email,
      role: 'student',
      onboarding_completed: true,
    })

  if (profileError) throw profileError

  return { userId, email }
}

export async function createTestOrganization(ownerId: string) {
  const { data, error } = await testSupabase
    .from('organizations')
    .insert({
      name: 'Test Organization',
      slug: 'test-org',
      owner_id: ownerId,
      subscription_plan_id: 'enterprise',
      settings: {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createTestProduct() {
  const { data, error } = await testSupabase
    .from('products')
    .insert({
      name: 'Test Product',
      description: 'Test product for integration tests',
      slug: 'test-product',
      icon: '📚',
      is_active: true,
      sort_order: 1,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createTestTopic(productId: string) {
  const { data, error } = await testSupabase
    .from('topics')
    .insert({
      product_id: productId,
      title: 'Test Topic',
      description: 'Test topic for integration tests',
      slug: 'test-topic',
      duration_minutes: 30,
      difficulty_level: 'beginner',
      is_active: true,
      sort_order: 1,
      content: {
        theory: 'Test theory content',
        examples: ['Example 1', 'Example 2'],
      },
    })
    .select()
    .single()

  if (error) throw error
  return data
}


