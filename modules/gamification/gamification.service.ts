import { SupabaseClient } from '@supabase/supabase-js'
import type { 
  UserLevel, 
  Achievement, 
  UserAchievement, 
  LeaderboardEntry 
} from '@/types/academy-lms'

export async function getUserLevel(
  supabase: SupabaseClient,
  userId: string
): Promise<UserLevel & { xp_for_next_level: number }> {
  // Get or create user level data
  let { data: userLevel, error } = await supabase
    .from('user_levels')
    .select('*')
    .eq('user_id', userId)
    .single()

  // If user doesn't have level data, create it
  if (!userLevel || error?.code === 'PGRST116') {
    const { data: newLevel } = await supabase
      .from('user_levels')
      .insert({
        user_id: userId,
        current_level: 1,
        current_xp: 0,
        total_xp: 0,
        level_progress: 0,
        skill_points: 0,
        skill_points_spent: 0,
        streak_days: 0,
      })
      .select()
      .single()
    
    userLevel = newLevel
  }

  if (!userLevel) {
    throw new Error('Failed to get user level')
  }

  // Calculate XP needed for next level
  const xpForNextLevel = calculateXPForLevel(userLevel.current_level + 1)

  return {
    ...userLevel,
    xp_for_next_level: xpForNextLevel,
  }
}

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string,
  category: string = 'all',
  limit: number = 50
): Promise<(Achievement & { unlocked: boolean; unlocked_at?: string })[]> {
  // Get all achievements
  let achievementsQuery = supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!left(
        unlocked_at
      )
    `)
    .order('sort_order')
    .limit(limit)

  if (category !== 'all') {
    achievementsQuery = achievementsQuery.eq('category', category)
  }

  const { data: achievements, error } = await achievementsQuery

  if (error || !achievements) {
    return []
  }

  // Get user's unlocked achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', userId)

  const unlockedMap = new Map(
    userAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []
  )

  // Combine achievement data with unlock status
  return achievements.map(achievement => ({
    ...achievement,
    unlocked: unlockedMap.has(achievement.id),
    unlocked_at: unlockedMap.get(achievement.id),
    user_achievements: undefined, // Remove joined data
  }))
}

export async function getAvailableAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<Achievement[]> {
  // Get achievements the user hasn't unlocked yet
  const { data: unlockedIds } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const unlockedIdList = unlockedIds?.map(ua => ua.achievement_id) || []

  let query = supabase
    .from('achievements')
    .select('*')
    .eq('is_secret', false)
    .order('sort_order')

  if (unlockedIdList.length > 0) {
    query = query.not('id', 'in', `(${unlockedIdList.join(',')})`)
  }

  const { data: achievements } = await query

  return achievements || []
}

export async function getLeaderboard(
  supabase: SupabaseClient,
  type: 'weekly' | 'monthly' | 'all-time' | 'product',
  limit: number = 20,
  productId?: string
): Promise<{
  entries: Array<LeaderboardEntry & { user: any }>
  total: number
  period?: { start: string; end: string }
}> {
  const now = new Date()
  let periodStart: Date | null = null
  let periodEnd: Date | null = null

  switch (type) {
    case 'weekly':
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - now.getDay()) // Start of week
      periodStart.setHours(0, 0, 0, 0)
      periodEnd = new Date(periodStart)
      periodEnd.setDate(periodStart.getDate() + 6) // End of week
      periodEnd.setHours(23, 59, 59, 999)
      break
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      periodEnd.setHours(23, 59, 59, 999)
      break
  }

  // For current period, calculate from XP transactions
  if (type !== 'all-time') {
    const { data: xpData, error } = await supabase
      .from('xp_transactions')
      .select(`
        user_id,
        amount,
        users!inner(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .gte('created_at', periodStart!.toISOString())
      .lte('created_at', periodEnd!.toISOString())

    if (error || !xpData) {
      return { entries: [], total: 0 }
    }

    // Aggregate XP by user
    const userXPMap = new Map<string, { xp: number; user: any }>()
    xpData.forEach(transaction => {
      const current = userXPMap.get(transaction.user_id) || {
        xp: 0,
        user: transaction.users,
      }
      current.xp += transaction.amount
      userXPMap.set(transaction.user_id, current)
    })

    // Convert to array and sort
    const entries = Array.from(userXPMap.entries())
      .map(([userId, data]) => ({
        id: crypto.randomUUID(),
        leaderboard_type: type,
        period_start: periodStart?.toISOString().split('T')[0] || null,
        period_end: periodEnd?.toISOString().split('T')[0] || null,
        user_id: userId,
        score: data.xp,
        rank: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        user: data.user,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, limit)

    return {
      entries,
      total: userXPMap.size,
      period: periodStart && periodEnd ? {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      } : undefined,
    }
  }

  // For all-time, use total XP from user_levels
  const { data: allTimeData, count } = await supabase
    .from('user_levels')
    .select(`
      user_id,
      total_xp,
      users!inner(
        first_name,
        last_name,
        avatar_url
      )
    `, { count: 'exact' })
    .order('total_xp', { ascending: false })
    .limit(limit)

  const entries = (allTimeData || []).map((entry, index) => ({
    id: crypto.randomUUID(),
    leaderboard_type: type,
    period_start: null,
    period_end: null,
    user_id: entry.user_id,
    score: entry.total_xp,
    rank: index + 1,
    metadata: {},
    created_at: new Date().toISOString(),
    user: entry.users,
  }))

  return {
    entries,
    total: count || 0,
  }
}

export async function getUserXPHistory(
  supabase: SupabaseClient,
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; xp_earned: number; transactions: any[] }>> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data: transactions, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })

  if (error || !transactions) {
    return []
  }

  // Group by date
  const xpByDate = new Map<string, { xp: number; transactions: any[] }>()

  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0]
    const current = xpByDate.get(date) || { xp: 0, transactions: [] }
    current.xp += transaction.amount
    current.transactions.push(transaction)
    xpByDate.set(date, current)
  })

  // Fill in missing dates with 0 XP
  const history = []
  const currentDate = new Date(startDate)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayData = xpByDate.get(dateStr) || { xp: 0, transactions: [] }
    history.push({
      date: dateStr,
      xp_earned: dayData.xp,
      transactions: dayData.transactions,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return history
}

export async function awardAchievement(
  supabase: SupabaseClient,
  userId: string,
  achievementCode: string
): Promise<{ success: boolean; achievement?: Achievement; xpAwarded?: number }> {
  // Get achievement details
  const { data: achievement, error: achievementError } = await supabase
    .from('achievements')
    .select('*')
    .eq('code', achievementCode)
    .single()

  if (achievementError || !achievement) {
    return { success: false }
  }

  // Check if already unlocked
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievement.id)
    .single()

  if (existing) {
    return { success: false } // Already unlocked
  }

  // Award achievement
  const { error: insertError } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievement.id,
      unlocked_at: new Date().toISOString(),
    })

  if (insertError) {
    return { success: false }
  }

  // Award XP if applicable
  if (achievement.xp_reward > 0) {
    await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_amount: achievement.xp_reward,
      p_reason: 'achievement',
      p_reason_detail: `Unlocked ${achievement.name}`,
      p_reference_type: 'achievement',
      p_reference_id: achievement.id,
    })
  }

  // Award skill points if applicable
  if (achievement.skill_points_reward > 0) {
    await supabase
      .from('user_levels')
      .update({
        skill_points: supabase.raw(`skill_points + ${achievement.skill_points_reward}`),
      })
      .eq('user_id', userId)
  }

  return {
    success: true,
    achievement,
    xpAwarded: achievement.xp_reward,
  }
}

export async function getSkillTree(
  supabase: SupabaseClient,
  userId: string,
  productId: string
): Promise<any> {
  // Get skill tree structure
  const { data: skillTree } = await supabase
    .from('skill_trees')
    .select(`
      *,
      skill_tree_nodes(
        *,
        user_skill_unlocks!left(
          unlocked_at
        )
      )
    `)
    .eq('product_id', productId)
    .single()

  if (!skillTree) {
    return null
  }

  // Get user's unlocked skills
  const { data: unlockedSkills } = await supabase
    .from('user_skill_unlocks')
    .select('skill_node_id')
    .eq('user_id', userId)

  const unlockedIds = new Set(unlockedSkills?.map(s => s.skill_node_id) || [])

  // Build tree structure with unlock status
  const nodes = skillTree.skill_tree_nodes.map((node: any) => ({
    ...node,
    unlocked: unlockedIds.has(node.id),
    user_skill_unlocks: undefined,
  }))

  return {
    ...skillTree,
    skill_tree_nodes: nodes,
  }
}

export async function unlockSkillNode(
  supabase: SupabaseClient,
  userId: string,
  nodeId: string
): Promise<{ success: boolean; error?: string }> {
  // Get node details
  const { data: node } = await supabase
    .from('skill_tree_nodes')
    .select('*, skill_trees(is_active)')
    .eq('id', nodeId)
    .single()

  if (!node || !node.skill_trees?.is_active) {
    return { success: false, error: 'Invalid skill node' }
  }

  // Check if already unlocked
  const { data: existing } = await supabase
    .from('user_skill_unlocks')
    .select('id')
    .eq('user_id', userId)
    .eq('skill_node_id', nodeId)
    .single()

  if (existing) {
    return { success: false, error: 'Already unlocked' }
  }

  // Check prerequisites (parent node)
  if (node.parent_node_id) {
    const { data: parentUnlock } = await supabase
      .from('user_skill_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('skill_node_id', node.parent_node_id)
      .single()

    if (!parentUnlock) {
      return { success: false, error: 'Prerequisites not met' }
    }
  }

  // Check skill points
  const { data: userLevel } = await supabase
    .from('user_levels')
    .select('skill_points, skill_points_spent')
    .eq('user_id', userId)
    .single()

  if (!userLevel) {
    return { success: false, error: 'User level not found' }
  }

  const availablePoints = userLevel.skill_points - userLevel.skill_points_spent

  if (availablePoints < node.skill_points_cost) {
    return { success: false, error: 'Insufficient skill points' }
  }

  // Unlock the skill
  const { error: unlockError } = await supabase
    .from('user_skill_unlocks')
    .insert({
      user_id: userId,
      skill_node_id: nodeId,
      unlocked_at: new Date().toISOString(),
    })

  if (unlockError) {
    return { success: false, error: 'Failed to unlock skill' }
  }

  // Update spent skill points
  await supabase
    .from('user_levels')
    .update({
      skill_points_spent: userLevel.skill_points_spent + node.skill_points_cost,
    })
    .eq('user_id', userId)

  return { success: true }
}

// Helper function (matches the one in database)
function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}


