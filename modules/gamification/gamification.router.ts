import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/trpc'
import { TRPCError } from '@trpc/server'
import {
  getUserLevel,
  getUserAchievements,
  getLeaderboard,
  awardAchievement,
  getAvailableAchievements,
  getUserXPHistory,
  getSkillTree,
  unlockSkillNode
} from './gamification.service'

export const gamificationRouter = router({
  // Get user's current level and XP
  getUserLevel: protectedProcedure
    .query(async ({ ctx }) => {
      const levelData = await getUserLevel(ctx.supabase, ctx.user.id)
      return levelData
    }),

  // Get user's achievements
  getUserAchievements: protectedProcedure
    .input(z.object({
      category: z.enum(['learning', 'social', 'mastery', 'special', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const achievements = await getUserAchievements(
        ctx.supabase,
        ctx.user.id,
        input.category,
        input.limit
      )
      return achievements
    }),

  // Get available achievements
  getAvailableAchievements: protectedProcedure
    .query(async ({ ctx }) => {
      const achievements = await getAvailableAchievements(ctx.supabase, ctx.user.id)
      return achievements
    }),

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({
      type: z.enum(['weekly', 'monthly', 'all-time', 'product']).default('weekly'),
      productId: z.string().optional(),
      limit: z.number().min(10).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const leaderboard = await getLeaderboard(
        ctx.supabase,
        input.type,
        input.limit,
        input.productId
      )
      return leaderboard
    }),

  // Get user's XP history
  getXPHistory: protectedProcedure
    .input(z.object({
      days: z.number().min(7).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const history = await getUserXPHistory(ctx.supabase, ctx.user.id, input.days)
      return history
    }),

  // Get skill tree for a product
  getSkillTree: protectedProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const skillTree = await getSkillTree(ctx.supabase, ctx.user.id, input.productId)
      return skillTree
    }),

  // Unlock a skill node
  unlockSkillNode: protectedProcedure
    .input(z.object({
      nodeId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await unlockSkillNode(ctx.supabase, ctx.user.id, input.nodeId)
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to unlock skill node',
        })
      }
      
      return result
    }),

  // Check and award achievements (called after significant actions)
  checkAchievements: protectedProcedure
    .mutation(async ({ ctx }) => {
      // This is called by the system after completing actions
      const { error } = await ctx.supabase.rpc('check_achievements', {
        p_user_id: ctx.user.id,
      })
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check achievements',
        })
      }
      
      return { success: true }
    }),

  // Get gamification stats overview
  getGamificationStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [levelData, achievements, recentXP] = await Promise.all([
        getUserLevel(ctx.supabase, ctx.user.id),
        getUserAchievements(ctx.supabase, ctx.user.id, 'all', 1000),
        getUserXPHistory(ctx.supabase, ctx.user.id, 7),
      ])
      
      const totalAchievements = achievements.filter(a => a.unlocked).length
      const weeklyXP = recentXP.reduce((sum, day) => sum + day.xp_earned, 0)
      
      return {
        level: levelData.current_level,
        totalXP: levelData.total_xp,
        currentXP: levelData.current_xp,
        levelProgress: levelData.level_progress,
        nextLevelXP: levelData.xp_for_next_level,
        totalAchievements,
        weeklyXP,
        streak: levelData.streak_days,
        skillPoints: levelData.skill_points,
        skillPointsSpent: levelData.skill_points_spent,
      }
    }),

  // Get user's rank
  getUserRank: protectedProcedure
    .input(z.object({
      type: z.enum(['weekly', 'monthly', 'all-time']).default('weekly'),
    }))
    .query(async ({ ctx, input }) => {
      const leaderboard = await getLeaderboard(ctx.supabase, input.type, 1000)
      const userRank = leaderboard.entries.findIndex(entry => entry.user_id === ctx.user.id) + 1
      const totalPlayers = leaderboard.total
      
      return {
        rank: userRank || null,
        totalPlayers,
        percentile: userRank ? Math.round((1 - userRank / totalPlayers) * 100) : null,
      }
    }),

  // Claim daily bonus
  claimDailyBonus: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Check if already claimed today
      const today = new Date().toISOString().split('T')[0]
      const { data: todaysClaim } = await ctx.supabase
        .from('xp_transactions')
        .select('id')
        .eq('user_id', ctx.user.id)
        .eq('reason', 'daily_login')
        .gte('created_at', today)
        .single()
      
      if (todaysClaim) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Daily bonus already claimed',
        })
      }
      
      // Award daily bonus
      await ctx.supabase.rpc('award_xp', {
        p_user_id: ctx.user.id,
        p_amount: 20,
        p_reason: 'daily_login',
        p_reason_detail: 'Daily login bonus',
      })
      
      return { success: true, xpAwarded: 20 }
    }),
})


