import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getUserLevel, 
  getUserAchievements, 
  awardAchievement,
  getLeaderboard,
  calculateXPForLevel
} from '@/modules/gamification/gamification.service'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn(),
  })),
}))

describe('Gamification Service', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      })),
      rpc: vi.fn(),
    }
    vi.clearAllMocks()
  })

  describe('getUserLevel', () => {
    it('returns existing user level data', async () => {
      const mockUserLevel = {
        user_id: 'user-1',
        current_level: 5,
        current_xp: 250,
        total_xp: 750,
        level_progress: 50,
        skill_points: 5,
        skill_points_spent: 2,
        streak_days: 3,
      }

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      })

      const result = await getUserLevel(mockSupabase, 'user-1')

      expect(result).toMatchObject({
        ...mockUserLevel,
        xp_for_next_level: calculateXPForLevel(6),
      })
    })

    it('creates new user level if not exists', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      })

      const newUserLevel = {
        user_id: 'user-1',
        current_level: 1,
        current_xp: 0,
        total_xp: 0,
        level_progress: 0,
        skill_points: 0,
        skill_points_spent: 0,
        streak_days: 0,
      }

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: newUserLevel,
        error: null,
      })

      const result = await getUserLevel(mockSupabase, 'user-1')

      expect(result).toMatchObject({
        ...newUserLevel,
        xp_for_next_level: calculateXPForLevel(2),
      })
    })
  })

  describe('calculateXPForLevel', () => {
    it('calculates XP correctly for different levels', () => {
      expect(calculateXPForLevel(1)).toBe(100)
      expect(calculateXPForLevel(2)).toBe(282) // 100 * 2^1.5
      expect(calculateXPForLevel(5)).toBe(1118) // 100 * 5^1.5
      expect(calculateXPForLevel(10)).toBe(3162) // 100 * 10^1.5
    })
  })

  describe('getUserAchievements', () => {
    it('returns achievements with unlock status', async () => {
      const mockAchievements = [
        {
          id: 'ach-1',
          code: 'first_steps',
          name: 'First Steps',
          category: 'learning',
          xp_reward: 50,
        },
        {
          id: 'ach-2',
          code: 'speed_learner',
          name: 'Speed Learner',
          category: 'learning',
          xp_reward: 100,
        },
      ]

      const mockUserAchievements = [
        {
          achievement_id: 'ach-1',
          unlocked_at: '2024-01-15T10:00:00Z',
        },
      ]

      mockSupabase.from().select().order().limit.mockResolvedValueOnce({
        data: mockAchievements,
        error: null,
      })

      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: mockUserAchievements,
        error: null,
      })

      const result = await getUserAchievements(mockSupabase, 'user-1', 'all', 50)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        ...mockAchievements[0],
        unlocked: true,
        unlocked_at: '2024-01-15T10:00:00Z',
      })
      expect(result[1]).toMatchObject({
        ...mockAchievements[1],
        unlocked: false,
      })
    })
  })

  describe('awardAchievement', () => {
    it('awards achievement successfully', async () => {
      const mockAchievement = {
        id: 'ach-1',
        code: 'first_steps',
        name: 'First Steps',
        xp_reward: 50,
        skill_points_reward: 1,
      }

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockAchievement,
        error: null,
      })

      mockSupabase.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null, // Not already unlocked
        error: null,
      })

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabase.from().update().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await awardAchievement(mockSupabase, 'user-1', 'first_steps')

      expect(result).toEqual({
        success: true,
        achievement: mockAchievement,
        xpAwarded: 50,
      })
      expect(mockSupabase.rpc).toHaveBeenCalledWith('award_xp', expect.any(Object))
    })

    it('returns false if achievement already unlocked', async () => {
      const mockAchievement = {
        id: 'ach-1',
        code: 'first_steps',
        name: 'First Steps',
        xp_reward: 50,
      }

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockAchievement,
        error: null,
      })

      mockSupabase.from().select().eq().eq().single.mockResolvedValueOnce({
        data: { id: 'existing-unlock' }, // Already unlocked
        error: null,
      })

      const result = await awardAchievement(mockSupabase, 'user-1', 'first_steps')

      expect(result).toEqual({ success: false })
    })
  })

  describe('getLeaderboard', () => {
    it('returns weekly leaderboard data', async () => {
      const mockXPData = [
        {
          user_id: 'user-1',
          amount: 100,
          users: { first_name: 'John', last_name: 'Doe' },
        },
        {
          user_id: 'user-1',
          amount: 50,
          users: { first_name: 'John', last_name: 'Doe' },
        },
        {
          user_id: 'user-2',
          amount: 80,
          users: { first_name: 'Jane', last_name: 'Smith' },
        },
      ]

      mockSupabase.from().select().gte().lte.mockResolvedValueOnce({
        data: mockXPData,
        error: null,
      })

      const result = await getLeaderboard(mockSupabase, 'weekly', 20)

      expect(result.entries).toHaveLength(2)
      expect(result.entries[0]).toMatchObject({
        user_id: 'user-1',
        score: 150, // 100 + 50
        rank: 1,
      })
      expect(result.entries[1]).toMatchObject({
        user_id: 'user-2',
        score: 80,
        rank: 2,
      })
      expect(result.period).toBeDefined()
    })

    it('returns all-time leaderboard using total XP', async () => {
      const mockAllTimeData = [
        {
          user_id: 'user-1',
          total_xp: 5000,
          users: { first_name: 'John', last_name: 'Doe' },
        },
        {
          user_id: 'user-2',
          total_xp: 3000,
          users: { first_name: 'Jane', last_name: 'Smith' },
        },
      ]

      mockSupabase.from().select().order().limit.mockResolvedValueOnce({
        data: mockAllTimeData,
        count: 50,
        error: null,
      })

      const result = await getLeaderboard(mockSupabase, 'all-time', 20)

      expect(result.entries).toHaveLength(2)
      expect(result.entries[0]).toMatchObject({
        user_id: 'user-1',
        score: 5000,
        rank: 1,
      })
      expect(result.total).toBe(50)
    })
  })
})


