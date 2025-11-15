import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentTransformer } from '@/modules/content/content-transformer.service'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for content processing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    const body = await request.json()
    const { type, filePath, topicId, options } = body
    if (!type || !filePath || !topicId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    const transformer = new ContentTransformer()
    let result
    switch (type) {
      case 'presentation':
        result = await transformer.transformPresentation(filePath, {
          topicId,
          enhanceWithAI: options?.enhanceWithAI,
          splitIntoBlocks: options?.splitIntoBlocks ?? true,
        })
        break
      case 'video':
        result = await transformer.processVideoContent(filePath, {
          generateTranscript: options?.generateTranscript,
          extractKeyframes: options?.extractKeyframes,
          addChapters: options?.addChapters,
        })
        break
      case 'quiz':
        result = await transformer.transformQuizContent(body.quizData, {
          randomizeQuestions: options?.randomizeQuestions,
          addExplanations: options?.addExplanations,
          difficulty: options?.difficulty,
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
    }
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    // Get transformation jobs status
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    let query = supabase
      .from('content_transformations')
      .select('*')
      .order('created_at', { ascending: false })
    if (topicId) {
      query = query.eq('topic_id', topicId)
    }
    const { data, error } = await query
    if (error) {
      throw error
    }
    return NextResponse.json({
      transformations: data || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
