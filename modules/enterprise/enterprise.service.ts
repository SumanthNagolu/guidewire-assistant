import { SupabaseClient } from '@supabase/supabase-js'
import type { Organization, OrganizationMember } from '@/types/academy-lms'

export async function getOrganization(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<Organization | null> {
  // Check if user is member of organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['manager', 'admin', 'owner'].includes(member.role)) {
    return null
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  return organization
}

export async function getOrganizationMembers(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  options: {
    limit: number
    offset: number
    search?: string
    role?: string
  }
): Promise<{
  members: OrganizationMember[]
  total: number
}> {
  // Check permissions
  const { data: requesterMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!requesterMember) {
    return { members: [], total: 0 }
  }

  // Build query
  let query = supabase
    .from('organization_members')
    .select(`
      *,
      users!inner(
        id,
        email,
        raw_user_meta_data,
        created_at
      ),
      user_profiles!inner(
        first_name,
        last_name,
        avatar_url
      ),
      user_levels!left(
        current_level,
        total_xp
      )
    `, { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filters
  if (options.role && options.role !== 'all') {
    query = query.eq('role', options.role)
  }

  if (options.search) {
    query = query.or(
      `user_profiles.first_name.ilike.%${options.search}%,` +
      `user_profiles.last_name.ilike.%${options.search}%,` +
      `users.email.ilike.%${options.search}%`
    )
  }

  // Apply pagination
  query = query
    .range(options.offset, options.offset + options.limit - 1)
    .order('joined_at', { ascending: false })

  const { data, count, error } = await query

  if (error) {
        return { members: [], total: 0 }
  }

  // Format member data
  const members = (data || []).map(member => ({
    ...member,
    user: {
      id: member.users.id,
      email: member.users.email,
      first_name: member.user_profiles.first_name,
      last_name: member.user_profiles.last_name,
      avatar_url: member.user_profiles.avatar_url,
      level: member.user_levels?.current_level || 1,
      total_xp: member.user_levels?.total_xp || 0,
    },
  }))

  return {
    members,
    total: count || 0,
  }
}

export async function inviteMembers(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  invitations: Array<{
    email: string
    role: 'learner' | 'manager' | 'admin'
    department?: string
  }>
): Promise<{ success: boolean; error?: string; sent: number }> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['admin', 'owner'].includes(member.role)) {
    return { success: false, error: 'Insufficient permissions', sent: 0 }
  }

  // Check seat availability
  const { data: org } = await supabase
    .from('organizations')
    .select('seats_purchased, seats_used')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return { success: false, error: 'Organization not found', sent: 0 }
  }

  const availableSeats = org.seats_purchased - org.seats_used
  if (invitations.length > availableSeats) {
    return { success: false, error: `Only ${availableSeats} seats available`, sent: 0 }
  }

  // Create invitations
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const invitationData = invitations.map(inv => ({
    organization_id: organizationId,
    email: inv.email.toLowerCase(),
    role: inv.role,
    invited_by: userId,
    expires_at: expiresAt.toISOString(),
  }))

  const { error } = await supabase
    .from('organization_invitations')
    .upsert(invitationData, {
      onConflict: 'organization_id,email',
    })

  if (error) {
    return { success: false, error: 'Failed to create invitations', sent: 0 }
  }

  // Send invitation emails (in production, use email service)
  // await sendInvitationEmails(invitations, org)

  return { success: true, sent: invitations.length }
}

export async function removeMembers(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  memberIds: string[]
): Promise<{ success: boolean; error?: string }> {
  // Check permissions
  const { data: requesterMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!requesterMember || !['admin', 'owner'].includes(requesterMember.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Can't remove owners
  const { data: membersToRemove } = await supabase
    .from('organization_members')
    .select('role, user_id')
    .eq('organization_id', organizationId)
    .in('id', memberIds)

  const hasOwner = membersToRemove?.some(m => m.role === 'owner')
  if (hasOwner) {
    return { success: false, error: 'Cannot remove organization owner' }
  }

  // Remove members
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .in('id', memberIds)

  if (error) {
    return { success: false, error: 'Failed to remove members' }
  }

  return { success: true }
}

export async function updateMemberRole(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  memberId: string,
  newRole: 'learner' | 'manager' | 'admin'
): Promise<{ success: boolean; error?: string }> {
  // Check permissions
  const { data: requesterMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!requesterMember || !['admin', 'owner'].includes(requesterMember.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Can't change owner role
  const { data: targetMember } = await supabase
    .from('organization_members')
    .select('role')
    .eq('id', memberId)
    .single()

  if (targetMember?.role === 'owner') {
    return { success: false, error: 'Cannot change owner role' }
  }

  // Update role
  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('organization_id', organizationId)

  if (error) {
    return { success: false, error: 'Failed to update role' }
  }

  return { success: true }
}

export async function getTeamProgress(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  timeframe: 'week' | 'month' | 'quarter' | 'year'
): Promise<any> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['manager', 'admin', 'owner'].includes(member.role)) {
    return null
  }

  // Calculate date range
  const now = new Date()
  const startDate = new Date()
  
  switch (timeframe) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  // Get team members
  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', organizationId)

  const memberIds = members?.map(m => m.user_id) || []

  // Get completion statistics
  const { data: completions } = await supabase
    .from('topic_completions')
    .select('user_id, completed_at')
    .in('user_id', memberIds)
    .gte('completed_at', startDate.toISOString())
    .not('completed_at', 'is', null)

  // Get XP statistics
  const { data: xpTransactions } = await supabase
    .from('xp_transactions')
    .select('user_id, amount')
    .in('user_id', memberIds)
    .gte('created_at', startDate.toISOString())

  // Calculate statistics
  const activeUsers = new Set(completions?.map(c => c.user_id) || [])
  const totalXP = xpTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
  const avgXPPerUser = memberIds.length > 0 ? totalXP / memberIds.length : 0

  // Get top performers
  const userXPMap = new Map<string, number>()
  xpTransactions?.forEach(t => {
    userXPMap.set(t.user_id, (userXPMap.get(t.user_id) || 0) + t.amount)
  })
  
  const topPerformers = Array.from(userXPMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, xp]) => ({ userId, xp }))

  return {
    overview: {
      totalMembers: memberIds.length,
      activeMembers: activeUsers.size,
      activityRate: memberIds.length > 0 
        ? Math.round((activeUsers.size / memberIds.length) * 100)
        : 0,
      totalCompletions: completions?.length || 0,
      totalXP,
      avgXPPerUser: Math.round(avgXPPerUser),
    },
    topPerformers,
    timeframe,
    dateRange: {
      start: startDate.toISOString(),
      end: now.toISOString(),
    },
  }
}

export async function getTeamAnalytics(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  options: {
    startDate: Date
    endDate: Date
    groupBy: 'department' | 'role' | 'course'
  }
): Promise<any> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['manager', 'admin', 'owner'].includes(member.role)) {
    return null
  }

  // Get organization members with details
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      department,
      topic_completions!inner(
        completed_at,
        topic_id,
        topics!inner(
          title,
          product_id,
          products!inner(name)
        )
      )
    `)
    .eq('organization_id', organizationId)
    .gte('topic_completions.completed_at', options.startDate.toISOString())
    .lte('topic_completions.completed_at', options.endDate.toISOString())

  if (!members) {
    return { data: [], groupBy: options.groupBy }
  }

  // Group data based on selection
  const grouped = new Map<string, any>()

  members.forEach(member => {
    let key: string
    
    switch (options.groupBy) {
      case 'department':
        key = member.department || 'Unassigned'
        break
      case 'role':
        key = member.role
        break
      case 'course':
        member.topic_completions.forEach((completion: any) => {
          const courseName = completion.topics.products.name
          if (!grouped.has(courseName)) {
            grouped.set(courseName, {
              name: courseName,
              completions: 0,
              uniqueUsers: new Set(),
            })
          }
          const group = grouped.get(courseName)!
          group.completions++
          group.uniqueUsers.add(member.user_id)
        })
        return
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: key,
        completions: 0,
        uniqueUsers: new Set(),
      })
    }
    
    const group = grouped.get(key)!
    group.completions += member.topic_completions.length
    group.uniqueUsers.add(member.user_id)
  })

  // Convert to array format
  const data = Array.from(grouped.entries()).map(([_, group]) => ({
    name: group.name,
    completions: group.completions,
    users: group.uniqueUsers.size,
  }))

  return {
    data,
    groupBy: options.groupBy,
    dateRange: {
      start: options.startDate.toISOString(),
      end: options.endDate.toISOString(),
    },
  }
}

export async function createTeamGoal(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  goal: any
): Promise<{ success: boolean; error?: string; goalId?: string }> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['manager', 'admin', 'owner'].includes(member.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  const { data: newGoal, error } = await supabase
    .from('team_learning_goals')
    .insert({
      organization_id: organizationId,
      ...goal,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Failed to create goal' }
  }

  return { success: true, goalId: newGoal.id }
}

export async function updateOrganizationSettings(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  settings: any
): Promise<{ success: boolean; error?: string }> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['admin', 'owner'].includes(member.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  const updates: any = {}
  
  if (settings.customBranding) {
    updates.custom_branding = settings.customBranding
  }
  
  if (settings.learningSettings) {
    updates.settings = settings.learningSettings
  }

  const { error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)

  if (error) {
    return { success: false, error: 'Failed to update settings' }
  }

  return { success: true }
}

export async function getOrganizationUsageStats(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<any> {
  // Check permissions
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (!member || !['admin', 'owner'].includes(member.role)) {
    return null
  }

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return null
  }

  // Get member statistics
  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id, role')
    .eq('organization_id', organizationId)

  const memberIds = members?.map(m => m.user_id) || []

  // Get completion statistics
  const { data: completions, count: totalCompletions } = await supabase
    .from('topic_completions')
    .select('*', { count: 'exact', head: true })
    .in('user_id', memberIds)
    .not('completed_at', 'is', null)

  // Get active users (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activeUsers } = await supabase
    .from('xp_transactions')
    .select('user_id')
    .in('user_id', memberIds)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || [])

  return {
    subscription: {
      tier: org.subscription_tier,
      status: org.subscription_status,
      seats: {
        purchased: org.seats_purchased,
        used: org.seats_used,
        available: org.seats_purchased - org.seats_used,
      },
    },
    usage: {
      totalMembers: memberIds.length,
      activeMembers: uniqueActiveUsers.size,
      activityRate: memberIds.length > 0
        ? Math.round((uniqueActiveUsers.size / memberIds.length) * 100)
        : 0,
      totalCompletions: totalCompletions || 0,
      avgCompletionsPerUser: memberIds.length > 0
        ? Math.round((totalCompletions || 0) / memberIds.length)
        : 0,
    },
    membersByRole: {
      learners: members?.filter(m => m.role === 'learner').length || 0,
      managers: members?.filter(m => m.role === 'manager').length || 0,
      admins: members?.filter(m => m.role === 'admin').length || 0,
      owners: members?.filter(m => m.role === 'owner').length || 0,
    },
  }
}


