import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { 
  generateLearningPath,
  generateProjectPlan,
  chatWithMentor,
  enhanceContent,
  generateInterviewQuestions,
  analyzeResume,
  generateStudyPlan
} from './ai.service'

export const aiRouter = router({
  // Generate personalized learning path
  generateLearningPath: protectedProcedure
    .input(z.object({
      targetRole: z.string(),
      currentSkills: z.array(z.string()),
      experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
      availableHours: z.number().min(1).max(40),
      preferredPace: z.enum(['slow', 'moderate', 'fast']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const learningPath = await generateLearningPath(
          ctx.supabase,
          ctx.user.id,
          input
        )
        
        return learningPath
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate learning path',
        })
      }
    }),

  // Generate AI project plan
  generateProjectPlan: protectedProcedure
    .input(z.object({
      assignmentId: z.string(),
      resumeText: z.string().optional(),
      experienceLevel: z.enum(['junior', 'mid', 'senior']),
      technologies: z.array(z.string()),
      focusAreas: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const projectPlan = await generateProjectPlan(
          ctx.supabase,
          ctx.user.id,
          input
        )
        
        return projectPlan
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate project plan',
        })
      }
    }),

  // Chat with AI mentor
  askMentor: protectedProcedure
    .input(z.object({
      question: z.string().min(10).max(1000),
      topicId: z.string().optional(),
      conversationId: z.string().optional(),
      context: z.object({
        currentTopic: z.string().optional(),
        recentTopics: z.array(z.string()).optional(),
        skillLevel: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await chatWithMentor(
          ctx.supabase,
          ctx.user.id,
          input
        )
        
        return response
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get mentor response',
        })
      }
    }),

  // Get mentor conversation history
  getMentorConversations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      topicId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('ai_mentorship_sessions')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (input.topicId) {
        query = query.eq('topic_id', input.topicId)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conversations',
        })
      }

      return data || []
    }),

  // Enhance content with AI
  enhanceContent: protectedProcedure
    .input(z.object({
      content: z.string(),
      contentType: z.enum(['theory', 'explanation', 'summary']),
      options: z.object({
        addKeyPoints: z.boolean().default(true),
        addInterviewTips: z.boolean().default(true),
        addPracticalExamples: z.boolean().default(true),
        targetAudience: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const enhanced = await enhanceContent(input.content, input.contentType, input.options)
        return enhanced
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enhance content',
        })
      }
    }),

  // Generate interview questions
  generateInterviewQuestions: protectedProcedure
    .input(z.object({
      topicId: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      count: z.number().min(5).max(20).default(10),
      includeAnswers: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const questions = await generateInterviewQuestions(
          ctx.supabase,
          input.topicId,
          input.difficulty,
          input.count,
          input.includeAnswers
        )
        
        return questions
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate interview questions',
        })
      }
    }),

  // Analyze resume
  analyzeResume: protectedProcedure
    .input(z.object({
      resumeText: z.string(),
      targetRole: z.string().optional(),
      improvementAreas: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const analysis = await analyzeResume(
          input.resumeText,
          input.targetRole,
          input.improvementAreas
        )
        
        return analysis
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze resume',
        })
      }
    }),

  // Generate study plan
  generateStudyPlan: protectedProcedure
    .input(z.object({
      goal: z.string(),
      deadline: z.string(),
      currentKnowledge: z.array(z.string()),
      availableHoursPerWeek: z.number().min(1).max(40),
      preferredLearningStyle: z.enum(['visual', 'reading', 'hands-on', 'mixed']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const studyPlan = await generateStudyPlan(
          ctx.supabase,
          ctx.user.id,
          input
        )
        
        return studyPlan
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate study plan',
        })
      }
    }),

  // Get AI usage statistics
  getAIUsageStats: protectedProcedure
    .query(async ({ ctx }) => {
      const [pathGenerations, projectPlans, mentorSessions] = await Promise.all([
        ctx.supabase
          .from('ai_path_generations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id),
        ctx.supabase
          .from('ai_project_plans')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', ctx.user.id),
        ctx.supabase
          .from('ai_mentorship_sessions')
          .select('id, total_tokens_used')
          .eq('user_id', ctx.user.id),
      ])

      const totalTokens = mentorSessions.data?.reduce((sum, session) => 
        sum + (session.total_tokens_used || 0), 0
      ) || 0

      return {
        pathsGenerated: pathGenerations.count || 0,
        projectPlansCreated: projectPlans.count || 0,
        mentorConversations: mentorSessions.data?.length || 0,
        tokensUsed: totalTokens,
      }
    }),
})


