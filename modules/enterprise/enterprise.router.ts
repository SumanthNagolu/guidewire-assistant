import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/trpc'
import { TRPCError } from '@trpc/server'
import {
  getOrganization,
  getOrganizationMembers,
  inviteMembers,
  removeMembers,
  updateMemberRole,
  getTeamProgress,
  getTeamAnalytics,
  createTeamGoal,
  updateOrganizationSettings,
  getOrganizationUsageStats
} from './enterprise.service'

export const enterpriseRouter = router({
  // Get current user's organization
  getMyOrganization: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: membership } = await ctx.supabase
        .from('organization_members')
        .select(`
          *,
          organizations(*)
        `)
        .eq('user_id', ctx.user.id)
        .single()

      if (!membership || !membership.organizations) {
        return null
      }

      return {
        organization: membership.organizations,
        membership: {
          role: membership.role,
          joined_at: membership.joined_at,
        },
      }
    }),

  // Get organization details (admin/manager only)
  getOrganization: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const organization = await getOrganization(ctx.supabase, ctx.user.id, input)
      
      if (!organization) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }
      
      return organization
    }),

  // Get organization members
  getMembers: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().default(0),
      search: z.string().optional(),
      role: z.enum(['learner', 'manager', 'admin', 'owner', 'all']).default('all'),
    }))
    .query(async ({ ctx, input }) => {
      const members = await getOrganizationMembers(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        input
      )
      
      return members
    }),

  // Invite members to organization
  inviteMembers: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      invitations: z.array(z.object({
        email: z.string().email(),
        role: z.enum(['learner', 'manager', 'admin']),
        department: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await inviteMembers(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        input.invitations
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to invite members',
        })
      }
      
      return result
    }),

  // Remove member from organization
  removeMember: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      memberId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await removeMembers(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        [input.memberId]
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to remove member',
        })
      }
      
      return result
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      memberId: z.string(),
      role: z.enum(['learner', 'manager', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await updateMemberRole(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        input.memberId,
        input.role
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to update role',
        })
      }
      
      return result
    }),

  // Get team progress overview
  getTeamProgress: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    }))
    .query(async ({ ctx, input }) => {
      const progress = await getTeamProgress(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        input.timeframe
      )
      
      return progress
    }),

  // Get detailed team analytics
  getTeamAnalytics: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      groupBy: z.enum(['department', 'role', 'course']).default('department'),
    }))
    .query(async ({ ctx, input }) => {
      const analytics = await getTeamAnalytics(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        {
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          groupBy: input.groupBy,
        }
      )
      
      return analytics
    }),

  // Create team learning goal
  createTeamGoal: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      name: z.string().min(3).max(100),
      description: z.string().optional(),
      targetCompletionDate: z.string(),
      requiredTopics: z.array(z.string()),
      assignedMembers: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await createTeamGoal(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        {
          name: input.name,
          description: input.description,
          target_completion_date: input.targetCompletionDate,
          required_topics: input.requiredTopics,
          assigned_members: input.assignedMembers || [],
          created_by: ctx.user.id,
        }
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to create goal',
        })
      }
      
      return result
    }),

  // Update organization settings
  updateOrganizationSettings: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      settings: z.object({
        customBranding: z.object({
          primaryColor: z.string().optional(),
          logoUrl: z.string().url().optional(),
        }).optional(),
        learningSettings: z.object({
          allowSelfEnrollment: z.boolean().optional(),
          requireManagerApproval: z.boolean().optional(),
          defaultLearningPaths: z.array(z.string()).optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await updateOrganizationSettings(
        ctx.supabase,
        ctx.user.id,
        input.organizationId,
        input.settings
      )
      
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to update settings',
        })
      }
      
      return result
    }),

  // Get organization usage statistics
  getUsageStats: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const stats = await getOrganizationUsageStats(
        ctx.supabase,
        ctx.user.id,
        input
      )
      
      return stats
    }),

  // Get pending invitations
  getPendingInvitations: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Check permissions
      const { data: member } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', input)
        .eq('user_id', ctx.user.id)
        .single()

      if (!member || !['admin', 'owner'].includes(member.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        })
      }

      const { data: invitations } = await ctx.supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', input)
        .is('accepted_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      return invitations || []
    }),

  // Cancel invitation
  cancelInvitation: protectedProcedure
    .input(z.object({
      organizationId: z.string(),
      invitationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      const { data: member } = await ctx.supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', input.organizationId)
        .eq('user_id', ctx.user.id)
        .single()

      if (!member || !['admin', 'owner'].includes(member.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        })
      }

      const { error } = await ctx.supabase
        .from('organization_invitations')
        .delete()
        .eq('id', input.invitationId)
        .eq('organization_id', input.organizationId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel invitation',
        })
      }

      return { success: true }
    }),
})


