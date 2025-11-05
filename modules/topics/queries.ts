import { createClient } from '@/lib/supabase/server';

export type Topic = {
  id: string;
  product_id: string;
  position: number;
  title: string;
  description: string | null;
  prerequisites: string[];
  duration_minutes: number;
  content: {
    video_url?: string;
    slides_url?: string;
    notes?: string;
    learning_objectives?: string[];
  };
  published: boolean;
  created_at: string;
  products: {
    code: string;
    name: string;
  };
};

export type TopicWithProgress = Topic & {
  completion?: {
    id: string;
    completion_percentage: number;
    completed_at: string | null;
    time_spent_seconds: number;
  } | null;
  is_locked: boolean;
  prerequisites_met: boolean;
};

export async function getTopicsByProduct(
  productCode?: string,
  userId?: string
): Promise<TopicWithProgress[]> {
  const supabase = await createClient();

  type TopicData = {
    id: string;
    product_id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    position: number;
    prerequisites: string[];
    content: {
      video_url?: string;
      slides_url?: string;
      notes?: string;
      learning_objectives?: string[];
    };
    published: boolean;
    created_at: string;
    products: { code: string; name: string };
  };

  let query = supabase
    .from('topics')
    .select(`
      *,
      products!inner(code, name)
    `)
    .eq('published', true)
    .order('position', { ascending: true });

  if (productCode) {
    query = query.eq('products.code', productCode);
  }

  const { data, error } = await query;
  const topics = data as TopicData[] | null;

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  if (!topics || !userId) {
    return (topics || []).map((topic) => ({
      ...topic,
      is_locked: true,
      prerequisites_met: false,
      completion: null,
    }));
  }

  // Get user's completions
  type Completion = {
    id: string;
    topic_id: string;
    user_id: string;
    completion_percentage: number;
    completed_at: string | null;
    time_spent_seconds: number;
  };

  const { data: completions } = await supabase
    .from('topic_completions')
    .select('*')
    .eq('user_id', userId)
    .returns<Completion[]>();

  const completionMap = new Map(
    completions?.map((c) => [c.topic_id, c]) || []
  );

  // Check prerequisites for each topic
  const topicsWithProgress: TopicWithProgress[] = await Promise.all(
    topics.map(async (topic) => {
      const completion = completionMap.get(topic.id);
      
      // Check if prerequisites are met
      const { data: prerequisitesMet } = await (supabase.rpc as any)(
        'check_prerequisites',
        {
          p_user_id: userId,
          p_topic_id: topic.id,
        }
      );

      return {
        ...topic,
        completion: completion || null,
        prerequisites_met: prerequisitesMet ?? false,
        is_locked: !prerequisitesMet && !completion?.completed_at,
      };
    })
  );

  return topicsWithProgress;
}

export async function getTopicById(
  topicId: string,
  userId?: string
): Promise<TopicWithProgress | null> {
  const supabase = await createClient();

  const { data: topic, error } = await supabase
    .from('topics')
    .select(`
      *,
      products!inner(code, name)
    `)
    .eq('id', topicId)
    .eq('published', true)
    .single();

  if (error || !topic) {
    console.error('Error fetching topic:', error);
    return null;
  }

  if (!userId) {
    return {
      ...topic,
      is_locked: true,
      prerequisites_met: false,
      completion: null,
    };
  }

  // Get user's completion for this topic
  const { data: completion } = await supabase
    .from('topic_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single();

  // Check if prerequisites are met
  const { data: prerequisitesMet } = await supabase.rpc(
    'check_prerequisites',
    {
      p_user_id: userId,
      p_topic_id: topicId,
    }
  );

  return {
    ...topic,
    completion: completion || null,
    prerequisites_met: prerequisitesMet ?? false,
    is_locked: !prerequisitesMet && !completion?.completed_at,
  };
}

export async function getNextTopic(
  userId: string,
  productId: string
): Promise<Topic | null> {
  const supabase = await createClient();

  const { data: nextTopicId } = await supabase.rpc('get_next_topic', {
    p_user_id: userId,
    p_product_id: productId,
  });

  if (!nextTopicId) {
    return null;
  }

  const { data: topic } = await supabase
    .from('topics')
    .select(`
      *,
      products!inner(code, name)
    `)
    .eq('id', nextTopicId)
    .single();

  return topic;
}

