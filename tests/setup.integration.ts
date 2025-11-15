import { beforeAll, afterAll, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
const SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

export const testSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Setup test database
beforeAll(async () => {
  console.log('Setting up test database...')
  
  try {
    // Run migrations on test database
    execSync(`DATABASE_URL="${TEST_DATABASE_URL}" npm run db:migrate`, {
      stdio: 'inherit',
    })
    
    // Seed test data if needed
    await seedTestData()
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
})

// Cleanup after each test
afterEach(async () => {
  // Clean up test data but keep schema
  await cleanupTestData()
})

// Teardown
afterAll(async () => {
  console.log('Cleaning up test database...')
  // Optional: drop test schema
})

async function seedTestData() {
  // Create test organization
  const { data: org } = await testSupabase
    .from('organizations')
    .insert({
      name: 'Test Organization',
      slug: 'test-org',
      subscription_tier: 'team',
      seats_purchased: 10,
      seats_used: 0,
    })
    .select()
    .single()

  // Create test users
  const testUsers = [
    { email: 'admin@test.com', role: 'admin' },
    { email: 'manager@test.com', role: 'manager' },
    { email: 'learner@test.com', role: 'learner' },
  ]

  for (const testUser of testUsers) {
    const { data: authUser } = await testSupabase.auth.admin.createUser({
      email: testUser.email,
      password: 'test123456',
      email_confirm: true,
    })

    if (authUser?.user) {
      // Create user profile
      await testSupabase.from('user_profiles').insert({
        id: authUser.user.id,
        email: testUser.email,
        first_name: testUser.role.charAt(0).toUpperCase() + testUser.role.slice(1),
        last_name: 'User',
        role: testUser.role === 'admin' ? 'admin' : 'user',
      })

      // Add to organization
      if (org) {
        await testSupabase.from('organization_members').insert({
          organization_id: org.id,
          user_id: authUser.user.id,
          role: testUser.role as any,
        })
      }
    }
  }

  // Create test products and topics
  const { data: product } = await testSupabase
    .from('products')
    .insert({
      name: 'Test Product',
      code: 'TEST',
      description: 'Test product for integration tests',
    })
    .select()
    .single()

  if (product) {
    // Create test topics
    const topics = Array.from({ length: 5 }, (_, i) => ({
      product_id: product.id,
      title: `Test Topic ${i + 1}`,
      description: `Description for test topic ${i + 1}`,
      position: i + 1,
      duration_minutes: 30,
      published: true,
      prerequisites: i > 0 ? [topics[i - 1]?.id].filter(Boolean) : [],
    }))

    await testSupabase.from('topics').insert(topics)
  }

  // Create test achievements
  await testSupabase.from('achievements').insert([
    {
      code: 'test_first_steps',
      name: 'Test First Steps',
      description: 'Complete your first test topic',
      category: 'learning',
      xp_reward: 50,
      requirements: { type: 'topic_completion', count: 1 },
    },
    {
      code: 'test_speed_learner',
      name: 'Test Speed Learner',
      description: 'Complete 3 topics in tests',
      category: 'learning',
      xp_reward: 100,
      requirements: { type: 'topic_completion', count: 3 },
    },
  ])
}

async function cleanupTestData() {
  // Delete in reverse order of dependencies
  const tables = [
    'xp_transactions',
    'user_achievements',
    'topic_completions',
    'learning_block_completions',
    'learning_blocks',
    'topics',
    'products',
    'organization_members',
    'organizations',
    'user_profiles',
    'achievements',
  ]

  for (const table of tables) {
    try {
      await testSupabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    } catch (error) {
      console.warn(`Failed to clean ${table}:`, error)
    }
  }

  // Clean up auth users
  const { data: users } = await testSupabase.auth.admin.listUsers()
  if (users?.users) {
    for (const user of users.users) {
      if (user.email?.includes('@test.com')) {
        await testSupabase.auth.admin.deleteUser(user.id)
      }
    }
  }
}

// Export helper functions for tests
export const testHelpers = {
  createTestUser: async (email: string, role: string = 'learner') => {
    const { data } = await testSupabase.auth.admin.createUser({
      email,
      password: 'test123456',
      email_confirm: true,
    })
    
    if (data?.user) {
      await testSupabase.from('user_profiles').insert({
        id: data.user.id,
        email,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      })
    }
    
    return data?.user
  },
  
  getTestOrganization: async () => {
    const { data } = await testSupabase
      .from('organizations')
      .select('*')
      .eq('slug', 'test-org')
      .single()
    
    return data
  },
  
  getTestProduct: async () => {
    const { data } = await testSupabase
      .from('products')
      .select('*')
      .eq('code', 'TEST')
      .single()
    
    return data
  },
}


