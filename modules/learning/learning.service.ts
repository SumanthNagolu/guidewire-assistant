import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Topic = Database['public']['Tables']['topics']['Row'] & {
  products?: Database['public']['Tables']['products']['Row']
  completion?: {
    completed_at: string | null
    completion_percentage: number
  }
  is_locked?: boolean
}

export async function getTopicsByProduct(
  supabase: SupabaseClient,
  userId: string,
  productId?: string
) {
  let query = supabase
    .from('topics')
    .select(`
      *,
      products!inner(name, code),
      topic_completions!left(
        completed_at,
        completion_percentage
      )
    `)
    .eq('published', true)
    .eq('topic_completions.user_id', userId)
    .order('position')

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data: topics, error } = await query

  if (error || !topics) {
    return []
  }

  // Check prerequisites and determine locked status
  const topicsWithLockStatus = await Promise.all(
    topics.map(async (topic) => {
      const prerequisites = topic.prerequisites as string[] || []
      let isLocked = false

      if (prerequisites.length > 0) {
        // Check if all prerequisites are completed
        const { data: prereqCompletions } = await supabase
          .from('topic_completions')
          .select('topic_id, completed_at')
          .eq('user_id', userId)
          .in('topic_id', prerequisites)
          .not('completed_at', 'is', null)

        const completedPrereqs = new Set(
          prereqCompletions?.map(c => c.topic_id) || []
        )
        
        isLocked = !prerequisites.every(prereq => completedPrereqs.has(prereq))
      }

      return {
        ...topic,
        completion: topic.topic_completions?.[0] || null,
        is_locked: isLocked,
      }
    })
  )

  return topicsWithLockStatus
}

export async function getTopicById(
  supabase: SupabaseClient,
  topicId: string
) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      products(name, code)
    `)
    .eq('id', topicId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function getTopicWithProgress(
  supabase: SupabaseClient,
  userId: string,
  topicId: string
) {
  const { data: topic, error } = await supabase
    .from('topics')
    .select(`
      *,
      products(name, code),
      topic_completions!left(
        started_at,
        completed_at,
        completion_percentage,
        time_spent_seconds,
        notes
      ),
      learning_blocks(
        *,
        learning_block_completions!left(
          completed_at,
          score,
          time_spent_seconds
        )
      )
    `)
    .eq('id', topicId)
    .eq('topic_completions.user_id', userId)
    .eq('learning_blocks.learning_block_completions.user_id', userId)
    .single()

  if (error || !topic) {
    return null
  }

  // Check prerequisites
  const prerequisites = topic.prerequisites as string[] || []
  let isLocked = false

  if (prerequisites.length > 0) {
    const { data: prereqCompletions } = await supabase
      .from('topic_completions')
      .select('topic_id')
      .eq('user_id', userId)
      .in('topic_id', prerequisites)
      .not('completed_at', 'is', null)

    const completedPrereqs = new Set(
      prereqCompletions?.map(c => c.topic_id) || []
    )
    
    isLocked = !prerequisites.every(prereq => completedPrereqs.has(prereq))
  }

  return {
    ...topic,
    is_locked: isLocked,
    completion: topic.topic_completions?.[0] || null,
  }
}

export async function startTopic(
  supabase: SupabaseClient,
  userId: string,
  topicId: string
) {
  // Check if topic is locked
  const topic = await getTopicWithProgress(supabase, userId, topicId)
  
  if (!topic) {
    return { success: false, error: 'Topic not found' }
  }
  
  if (topic.is_locked) {
    return { success: false, error: 'Topic is locked. Complete prerequisites first.' }
  }

  // Create or update topic completion record
  const { error } = await supabase
    .from('topic_completions')
    .upsert({
      user_id: userId,
      topic_id: topicId,
      started_at: new Date().toISOString(),
      completion_percentage: 0,
    })

  if (error) {
    return { success: false, error: 'Failed to start topic' }
  }

  return { success: true }
}

export async function completeTopic(
  supabase: SupabaseClient,
  userId: string,
  topicId: string,
  timeSpentSeconds: number,
  score?: number
) {
  // Verify all required learning blocks are completed
  const { data: blocks } = await supabase
    .from('learning_blocks')
    .select(`
      id,
      required_for_completion,
      learning_block_completions!left(completed_at)
    `)
    .eq('topic_id', topicId)
    .eq('required_for_completion', true)
    .eq('learning_block_completions.user_id', userId)

  const incompleteBlocks = blocks?.filter(
    block => !block.learning_block_completions?.[0]?.completed_at
  ) || []

  if (incompleteBlocks.length > 0) {
    return { 
      success: false, 
      error: 'Complete all required learning blocks first' 
    }
  }

  // Update topic completion
  const { error: updateError } = await supabase
    .from('topic_completions')
    .update({
      completed_at: new Date().toISOString(),
      completion_percentage: 100,
      time_spent_seconds: timeSpentSeconds,
    })
    .eq('user_id', userId)
    .eq('topic_id', topicId)

  if (updateError) {
    return { success: false, error: 'Failed to complete topic' }
  }

  // Award XP for topic completion
  await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_amount: 50,
    p_reason: 'topic_completion',
    p_reference_type: 'topic',
    p_reference_id: topicId,
  })

  // Check for achievements
  await supabase.rpc('check_achievements', {
    p_user_id: userId,
  })

  // Update streak
  await updateStreak(supabase, userId)

  return { success: true }
}

export async function getLearningPath(
  supabase: SupabaseClient,
  userId: string,
  productId?: string
) {
  // First check if user has an AI-generated path
  let query = supabase
    .from('learning_paths')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (productId) {
    // Filter paths that include topics from this product
    const { data: topics } = await supabase
      .from('topics')
      .select('id')
      .eq('product_id', productId)

    const topicIds = topics?.map(t => t.id) || []
    query = query.contains('topics_sequence', topicIds)
  }

  const { data: path } = await query.single()

  if (path) {
    return path
  }

  // If no custom path, return default sequential path
  const topics = await getTopicsByProduct(supabase, userId, productId)
  
  return {
    id: 'default',
    name: 'Sequential Learning Path',
    description: 'Complete topics in order',
    topics_sequence: topics.map(t => t.id),
    ai_generated: false,
  }
}

async function updateStreak(
  supabase: SupabaseClient,
  userId: string
) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: userLevel } = await supabase
    .from('user_levels')
    .select('last_activity_date, streak_days')
    .eq('user_id', userId)
    .single()

  if (!userLevel) {
    // Create initial record
    await supabase
      .from('user_levels')
      .insert({
        user_id: userId,
        last_activity_date: today,
        streak_days: 1,
      })
    return
  }

  const lastActivity = userLevel.last_activity_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = userLevel.streak_days

  if (lastActivity === yesterdayStr) {
    // Extend streak
    newStreak += 1
  } else if (lastActivity !== today) {
    // Reset streak
    newStreak = 1
  }

  await supabase
    .from('user_levels')
    .update({
      last_activity_date: today,
      streak_days: newStreak,
    })
    .eq('user_id', userId)

  // Award streak bonuses
  if (newStreak === 7) {
    await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_amount: 200,
      p_reason: 'weekly_streak',
    })
  }
}


