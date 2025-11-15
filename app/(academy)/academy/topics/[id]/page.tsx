import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopicDetail } from '@/components/academy/topic-detail/TopicDetail'
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: topic } = await supabase
    .from('topics')
    .select('title, description')
    .eq('id', id)
    .single()
  if (!topic) {
    return {
      title: 'Topic Not Found',
    }
  }
  return {
    title: `${topic.title} | InTime Academy`,
    description: topic.description,
  }
}
export default async function TopicDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }
  // Check if topic exists and user has access
  const { data: topic } = await supabase
    .from('topics')
    .select('id')
    .eq('id', id)
    .single()
  if (!topic) {
    notFound()
  }
  return <TopicDetail topicId={id} />
}
