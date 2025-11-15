import { describe, it, expect, beforeAll } from 'vitest'
import { testSupabase, testHelpers } from '../setup.integration'

describe('Learning Flow Integration', () => {
  let testUser: any
  let testProduct: any
  let testTopics: any[]

  beforeAll(async () => {
    // Create test user
    testUser = await testHelpers.createTestUser('learner-flow@test.com')
    
    // Get test product
    testProduct = await testHelpers.getTestProduct()
    
    // Get test topics
    const { data: topics } = await testSupabase
      .from('topics')
      .select('*')
      .eq('product_id', testProduct.id)
      .order('position')
    
    testTopics = topics || []
  })

  describe('Topic Progression', () => {
    it('should enforce sequential unlocking', async () => {
      // Try to start second topic without completing first
      const { error: startError } = await testSupabase
        .from('topic_completions')
        .insert({
          user_id: testUser.id,
          topic_id: testTopics[1].id,
          started_at: new Date().toISOString(),
        })
      
      // This should fail due to RLS policies
      expect(startError).toBeDefined()
    })

    it('should allow starting first topic', async () => {
      const { data, error } = await testSupabase
        .from('topic_completions')
        .insert({
          user_id: testUser.id,
          topic_id: testTopics[0].id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.topic_id).toBe(testTopics[0].id)
    })

    it('should award XP on topic completion', async () => {
      // Complete the first topic
      const { error: completeError } = await testSupabase
        .from('topic_completions')
        .update({
          completed_at: new Date().toISOString(),
          completion_percentage: 100,
          time_spent_seconds: 1800,
        })
        .eq('user_id', testUser.id)
        .eq('topic_id', testTopics[0].id)
      
      expect(completeError).toBeNull()

      // Check XP was awarded
      const { data: xpTransaction } = await testSupabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('reason', 'topic_completion')
        .single()
      
      expect(xpTransaction).toBeDefined()
      expect(xpTransaction.amount).toBeGreaterThan(0)

      // Check user level was updated
      const { data: userLevel } = await testSupabase
        .from('user_levels')
        .select('*')
        .eq('user_id', testUser.id)
        .single()
      
      expect(userLevel).toBeDefined()
      expect(userLevel.total_xp).toBeGreaterThan(0)
    })

    it('should unlock next topic after completing prerequisite', async () => {
      // Now should be able to start second topic
      const { data, error } = await testSupabase
        .from('topic_completions')
        .insert({
          user_id: testUser.id,
          topic_id: testTopics[1].id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })

  describe('Achievement System', () => {
    it('should check and award achievements after actions', async () => {
      // Call check_achievements function
      const { error } = await testSupabase.rpc('check_achievements', {
        p_user_id: testUser.id,
      })
      
      expect(error).toBeNull()

      // Check if first steps achievement was awarded
      const { data: userAchievements } = await testSupabase
        .from('user_achievements')
        .select(`
          *,
          achievements(*)
        `)
        .eq('user_id', testUser.id)
      
      expect(userAchievements).toBeDefined()
      expect(userAchievements.length).toBeGreaterThan(0)
      
      const firstStepsAchievement = userAchievements.find(
        ua => ua.achievements.code === 'test_first_steps'
      )
      expect(firstStepsAchievement).toBeDefined()
    })
  })

  describe('Learning Analytics', () => {
    it('should track learning statistics correctly', async () => {
      // Get user statistics
      const { data: stats } = await testSupabase
        .from('topic_completions')
        .select('*', { count: 'exact' })
        .eq('user_id', testUser.id)
        .not('completed_at', 'is', null)
      
      expect(stats).toBeDefined()

      // Get XP history
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: xpHistory } = await testSupabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', testUser.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
      
      expect(xpHistory).toBeDefined()
      expect(xpHistory.length).toBeGreaterThan(0)
    })
  })

  describe('Streak Tracking', () => {
    it('should update learning streak on activity', async () => {
      // Check current streak
      const { data: userLevel } = await testSupabase
        .from('user_levels')
        .select('streak_days, last_activity_date')
        .eq('user_id', testUser.id)
        .single()
      
      expect(userLevel).toBeDefined()
      expect(userLevel.streak_days).toBeGreaterThan(0)
      expect(userLevel.last_activity_date).toBeDefined()
    })
  })
})


