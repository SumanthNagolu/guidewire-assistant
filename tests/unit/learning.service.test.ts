import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LearningService } from '@/modules/learning/learning.service'
import { createMockUser, createMockTopic, createMockLearningBlock } from '@/tests/utils/test-utils'

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    limit: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn(),
}

describe('LearningService', () => {
  let service: LearningService
  const mockUser = createMockUser()
  const mockTopic = createMockTopic()
  const mockBlock = createMockLearningBlock()

  beforeEach(() => {
    vi.clearAllMocks()
    service = new LearningService(mockSupabase as any)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUser.id } },
      error: null,
    })
  })

  describe('getTopicsByProduct', () => {
    it('should fetch topics with user progress', async () => {
      const mockTopics = [mockTopic]
      const mockProgress = [{
        topic_id: mockTopic.id,
        status: 'completed',
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
      }]

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        }

        if (table === 'topics') {
          chain.select.mockReturnValue({
            ...chain,
            eq: vi.fn().mockResolvedValue({ data: mockTopics, error: null }),
          })
        } else if (table === 'user_progress') {
          chain.select.mockReturnValue({
            ...chain,
            eq: vi.fn().mockReturnValue({
              ...chain,
              in: vi.fn().mockResolvedValue({ data: mockProgress, error: null }),
            }),
          })
        }

        return chain
      })

      const result = await service.getTopicsByProduct(mockUser.id, 'test-product-id')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ...mockTopic,
        user_progress: {
          status: 'completed',
          progress_percentage: 100,
          completed_at: expect.any(String),
        },
      })
    })

    it('should handle topics with no progress', async () => {
      const mockTopics = [mockTopic]

      mockSupabase.from.mockImplementation((table: string) => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
        }

        if (table === 'topics') {
          chain.select.mockReturnValue({
            ...chain,
            eq: vi.fn().mockResolvedValue({ data: mockTopics, error: null }),
          })
        } else if (table === 'user_progress') {
          chain.select.mockReturnValue({
            ...chain,
            eq: vi.fn().mockReturnValue({
              ...chain,
              in: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          })
        }

        return chain
      })

      const result = await service.getTopicsByProduct(mockUser.id, 'test-product-id')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ...mockTopic,
        user_progress: null,
      })
    })
  })

  describe('checkPrerequisites', () => {
    it('should return true when all prerequisites are completed', async () => {
      const prerequisites = ['prereq-1', 'prereq-2']
      const completedTopics = [
        { topic_id: 'prereq-1', status: 'completed' },
        { topic_id: 'prereq-2', status: 'completed' },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: completedTopics, error: null }),
      })

      const result = await service.checkPrerequisites(mockUser.id, prerequisites)
      expect(result).toBe(true)
    })

    it('should return false when some prerequisites are not completed', async () => {
      const prerequisites = ['prereq-1', 'prereq-2']
      const completedTopics = [
        { topic_id: 'prereq-1', status: 'completed' },
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: completedTopics, error: null }),
      })

      const result = await service.checkPrerequisites(mockUser.id, prerequisites)
      expect(result).toBe(false)
    })

    it('should return true when there are no prerequisites', async () => {
      const result = await service.checkPrerequisites(mockUser.id, [])
      expect(result).toBe(true)
    })
  })

  describe('completeLearningBlock', () => {
    it('should complete a block and award XP', async () => {
      const blockId = 'test-block-id'
      const xpReward = 20

      // Mock getting the block
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockBlock, xp_reward: xpReward },
          error: null,
        }),
      })

      // Mock updating completion
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      // Mock awarding XP
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      await service.completeLearningBlock(mockUser.id, blockId)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', {
        p_user_id: mockUser.id,
        p_amount: xpReward,
        p_reason: 'block_completion',
        p_reference_id: blockId,
      })
    })

    it('should handle completion errors gracefully', async () => {
      const blockId = 'test-block-id'

      // Mock getting the block with error
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Block not found' },
        }),
      })

      await expect(
        service.completeLearningBlock(mockUser.id, blockId)
      ).rejects.toThrow('Block not found')
    })
  })

  describe('getLearningStats', () => {
    it('should calculate learning statistics correctly', async () => {
      const mockProgress = [
        { status: 'completed', progress_percentage: 100 },
        { status: 'in_progress', progress_percentage: 50 },
        { status: 'not_started', progress_percentage: 0 },
      ]

      const mockLevel = {
        current_level: 5,
        current_xp: 250,
        total_xp: 1250,
      }

      const mockStreak = 7

      // Mock topics count
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { count: 10 },
          error: null,
        }),
      })

      // Mock user progress
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockProgress,
          error: null,
        }),
      })

      // Mock user level
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLevel,
          error: null,
        }),
      })

      // Mock learning streak
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: Array(mockStreak).fill({
            created_at: new Date().toISOString(),
          }),
          error: null,
        }),
      })

      const stats = await service.getLearningStats(mockUser.id)

      expect(stats).toEqual({
        topics_completed: 1,
        overall_progress: 50, // (100 + 50 + 0) / 300
        current_level: 5,
        total_xp: 1250,
        learning_streak: 7,
      })
    })
  })
})


