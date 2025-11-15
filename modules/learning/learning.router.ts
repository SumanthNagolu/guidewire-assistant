import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { 
  getTopicsByProduct, 
  getTopicById, 
  startTopic, 
  completeTopic,
  getLearningPath,
  getTopicWithProgress
} from './learning.service'

export const learningRouter = router({
  // Get all topics for a product with progress
  getTopics: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const topics = await getTopicsByProduct(
        ctx.supabase,
        ctx.user.id,
        input.productId
      )
      return topics
    }),

  // Get single topic with progress and learning blocks
  getTopic: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const topic = await getTopicWithProgress(
        ctx.supabase,
        ctx.user.id,
        input
      )
      
      if (!topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Topic not found',
        })
      }
      
      return topic
    }),

  // Start a topic
  startTopic: protectedProcedure
    .input(z.object({
      topicId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await startTopic(
        ctx.supabase,
        ctx.user.id,
        input.topicId
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to start topic',
        })
      }
      
      return result
    }),

  // Complete a topic
  completeTopic: protectedProcedure
    .input(z.object({
      topicId: z.string(),
      timeSpentSeconds: z.number().min(0),
      score: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await completeTopic(
        ctx.supabase,
        ctx.user.id,
        input.topicId,
        input.timeSpentSeconds,
        input.score
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to complete topic',
        })
      }
      
      return result
    }),

  // Get user's learning path
  getLearningPath: protectedProcedure
    .input(z.object({
      productId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const path = await getLearningPath(
        ctx.supabase,
        ctx.user.id,
        input.productId
      )
      return path
    }),

  // Get next recommended topic
  getNextTopic: protectedProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { data: nextTopicId } = await ctx.supabase
        .rpc('get_next_topic', {
          p_user_id: ctx.user.id,
          p_product_id: input.productId,
        })
      
      if (!nextTopicId) {
        return null
      }
      
      return getTopicById(ctx.supabase, nextTopicId)
    }),

  // Get learning statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [
        { count: totalCompleted },
        { count: totalTopics },
        { data: streakData },
        { data: recentActivity }
      ] = await Promise.all([
        ctx.supabase
          .from('topic_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id)
          .not('completed_at', 'is', null),
        
        ctx.supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('published', true),
        
        ctx.supabase
          .from('user_levels')
          .select('streak_days, last_activity_date')
          .eq('user_id', ctx.user.id)
          .single(),
        
        ctx.supabase
          .from('topic_completions')
          .select('completed_at')
          .eq('user_id', ctx.user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(30)
      ])
      
      return {
        totalCompleted: totalCompleted || 0,
        totalTopics: totalTopics || 0,
        completionPercentage: totalTopics 
          ? Math.round((totalCompleted || 0) / totalTopics * 100)
          : 0,
        currentStreak: streakData?.streak_days || 0,
        lastActivityDate: streakData?.last_activity_date,
        recentCompletions: recentActivity || []
      }
    }),

  // Get learning blocks for a topic
  getLearningBlocks: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data: blocks, error } = await ctx.supabase
        .from('learning_blocks')
        .select(`
          *,
          learning_block_completions!left (
            completed_at,
            score,
            time_spent_seconds
          )
        `)
        .eq('topic_id', input)
        .eq('learning_block_completions.user_id', ctx.user.id)
        .order('position')
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch learning blocks',
        })
      }
      
      return blocks || []
    }),

  // Start a learning block
  startLearningBlock: protectedProcedure
    .input(z.object({
      blockId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('learning_block_completions')
        .upsert({
          user_id: ctx.user.id,
          learning_block_id: input.blockId,
          started_at: new Date().toISOString(),
        })
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start learning block',
        })
      }
      
      return { success: true }
    }),

  // Complete a learning block
  completeLearningBlock: protectedProcedure
    .input(z.object({
      blockId: z.string(),
      timeSpentSeconds: z.number().min(0),
      score: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('learning_block_completions')
        .update({
          completed_at: new Date().toISOString(),
          time_spent_seconds: input.timeSpentSeconds,
          score: input.score,
        })
        .eq('user_id', ctx.user.id)
        .eq('learning_block_id', input.blockId)
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete learning block',
        })
      }
      
      // Award XP based on block type
      const { data: block } = await ctx.supabase
        .from('learning_blocks')
        .select('block_type')
        .eq('id', input.blockId)
        .single()
      
      if (block) {
        const xpRewards = {
          theory: 10,
          demo: 15,
          practice: 25,
          project: 100,
        }
        
        const xpAmount = xpRewards[block.block_type as keyof typeof xpRewards] || 10
        
        await ctx.supabase.rpc('award_xp', {
          p_user_id: ctx.user.id,
          p_amount: xpAmount,
          p_reason: `complete_${block.block_type}`,
          p_reference_type: 'learning_block',
          p_reference_id: input.blockId,
        })
      }
      
      return { success: true }
    }),
})


