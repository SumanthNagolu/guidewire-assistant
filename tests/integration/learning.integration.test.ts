import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { testSupabase, createTestUser, createTestProduct, createTestTopic } from '../setup/integration'
import { appRouter } from '@/lib/trpc/root'
import { createContext } from '@/lib/trpc/context'

describe('Learning API Integration', () => {
  let userId: string
  let productId: string
  let topicId: string
  let ctx: any

  beforeEach(async () => {
    // Create test data
    const user = await createTestUser('learning-test@example.com')
    userId = user.userId

    const product = await createTestProduct()
    productId = product.id

    const topic = await createTestTopic(productId)
    topicId = topic.id

    // Create context with authenticated user
    ctx = await createContext({
      headers: new Headers({
        authorization: `Bearer test-token`,
      }),
    } as any)
    
    // Mock the context to return our test user
    ctx.user = { id: userId }
    ctx.supabase = testSupabase
  })

  afterEach(async () => {
    // Cleanup is handled by the integration setup
  })

  describe('Topic Management', () => {
    it('should fetch topics with user progress', async () => {
      const caller = appRouter.createCaller(ctx)
      
      const topics = await caller.learning.getTopics({ productId })
      
      expect(topics).toBeDefined()
      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThan(0)
      expect(topics[0].id).toBe(topicId)
    })

    it('should start a topic and track progress', async () => {
      const caller = appRouter.createCaller(ctx)
      
      await caller.learning.startTopic({ topicId })
      
      // Verify progress was created
      const { data: progress } = await testSupabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single()
      
      expect(progress).toBeDefined()
      expect(progress.status).toBe('in_progress')
      expect(progress.progress_percentage).toBe(0)
    })

    it('should complete a topic and award XP', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Start the topic first
      await caller.learning.startTopic({ topicId })
      
      // Complete the topic
      await caller.learning.completeTopic({ topicId })
      
      // Verify completion
      const { data: progress } = await testSupabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single()
      
      expect(progress.status).toBe('completed')
      expect(progress.progress_percentage).toBe(100)
      expect(progress.completed_at).toBeDefined()
      
      // Verify XP was awarded
      const { data: xpTransaction } = await testSupabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('reason', 'topic_completion')
        .single()
      
      expect(xpTransaction).toBeDefined()
      expect(xpTransaction.amount).toBeGreaterThan(0)
    })

    it('should enforce sequential learning with prerequisites', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Create a second topic with the first as prerequisite
      const { data: advancedTopic } = await testSupabase
        .from('topics')
        .insert({
          product_id: productId,
          title: 'Advanced Topic',
          description: 'Requires basic topic',
          slug: 'advanced-topic',
          duration_minutes: 45,
          difficulty_level: 'advanced',
          prerequisites: [topicId],
          is_active: true,
          sort_order: 2,
        })
        .select()
        .single()
      
      // Try to start advanced topic without completing prerequisite
      await expect(
        caller.learning.startTopic({ topicId: advancedTopic.id })
      ).rejects.toThrow(/prerequisites/)
      
      // Complete prerequisite
      await caller.learning.startTopic({ topicId })
      await caller.learning.completeTopic({ topicId })
      
      // Now should be able to start advanced topic
      await expect(
        caller.learning.startTopic({ topicId: advancedTopic.id })
      ).resolves.toBeDefined()
    })
  })

  describe('Learning Blocks', () => {
    let blockId: string

    beforeEach(async () => {
      // Create a learning block for the topic
      const { data: block } = await testSupabase
        .from('learning_blocks')
        .insert({
          topic_id: topicId,
          title: 'Introduction',
          type: 'theory',
          content: {
            type: 'theory',
            markdown: '# Introduction\n\nWelcome to the course!',
            estimatedTime: 5,
          },
          order_index: 0,
          duration_minutes: 5,
          xp_reward: 10,
          is_required: true,
        })
        .select()
        .single()
      
      blockId = block.id
    })

    it('should fetch learning blocks for a topic', async () => {
      const caller = appRouter.createCaller(ctx)
      
      const blocks = await caller.learning.getLearningBlocks({ topicId })
      
      expect(blocks).toBeDefined()
      expect(Array.isArray(blocks)).toBe(true)
      expect(blocks.length).toBeGreaterThan(0)
      expect(blocks[0].id).toBe(blockId)
      expect(blocks[0].type).toBe('theory')
    })

    it('should track learning block completion', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Start the block
      await caller.learning.startLearningBlock({ blockId })
      
      // Complete the block
      const result = await caller.learning.completeLearningBlock({ 
        blockId,
        timeSpent: 300, // 5 minutes in seconds
      })
      
      expect(result.xpAwarded).toBe(10)
      
      // Verify completion was recorded
      const { data: completion } = await testSupabase
        .from('learning_block_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('block_id', blockId)
        .single()
      
      expect(completion).toBeDefined()
      expect(completion.completed).toBe(true)
      expect(completion.time_spent_seconds).toBe(300)
    })

    it('should update topic progress when blocks are completed', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Create multiple blocks
      const { data: block2 } = await testSupabase
        .from('learning_blocks')
        .insert({
          topic_id: topicId,
          title: 'Practice',
          type: 'practice',
          content: { type: 'practice' },
          order_index: 1,
          duration_minutes: 10,
          xp_reward: 20,
          is_required: true,
        })
        .select()
        .single()
      
      // Start topic
      await caller.learning.startTopic({ topicId })
      
      // Complete first block
      await caller.learning.startLearningBlock({ blockId })
      await caller.learning.completeLearningBlock({ blockId, timeSpent: 300 })
      
      // Check progress (should be 50% - 1 of 2 blocks)
      const topic1 = await caller.learning.getTopic({ topicId })
      expect(topic1.user_progress?.progress_percentage).toBe(50)
      
      // Complete second block
      await caller.learning.startLearningBlock({ blockId: block2.id })
      await caller.learning.completeLearningBlock({ blockId: block2.id, timeSpent: 600 })
      
      // Check progress (should be 100%)
      const topic2 = await caller.learning.getTopic({ topicId })
      expect(topic2.user_progress?.progress_percentage).toBe(100)
    })
  })

  describe('Learning Stats', () => {
    it('should calculate learning statistics correctly', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Create and complete multiple topics
      const topic2 = await createTestTopic(productId)
      
      await caller.learning.startTopic({ topicId })
      await caller.learning.completeTopic({ topicId })
      
      await caller.learning.startTopic({ topicId: topic2.id })
      
      // Get stats
      const stats = await caller.learning.getStats()
      
      expect(stats).toBeDefined()
      expect(stats.topics_completed).toBe(1)
      expect(stats.overall_progress).toBeGreaterThan(0)
      expect(stats.current_level).toBeGreaterThanOrEqual(1)
      expect(stats.total_xp).toBeGreaterThan(0)
    })

    it('should track learning streaks', async () => {
      const caller = appRouter.createCaller(ctx)
      
      // Complete activities on consecutive days
      await caller.learning.startTopic({ topicId })
      await caller.learning.completeTopic({ topicId })
      
      // Manually create XP transactions for previous days to simulate streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      await testSupabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount: 10,
          reason: 'daily_login',
          created_at: yesterday.toISOString(),
        })
      
      const stats = await caller.learning.getStats()
      expect(stats.learning_streak).toBeGreaterThanOrEqual(1)
    })
  })
})


