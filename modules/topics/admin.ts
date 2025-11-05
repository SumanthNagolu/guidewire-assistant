import { randomUUID } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type IngestionTopic = {
  id?: string;
  product_code: string;
  position: number;
  title: string;
  description?: string;
  duration_minutes?: number;
  prerequisites?: string[];
  content?: {
    video_url?: string;
    slides_url?: string;
    notes?: string;
    learning_objectives?: string[];
  };
  published?: boolean;
};

export type BulkUpsertResult = {
  success: boolean;
  count?: number;
  errors?: string[];
};

const normalizeStringArray = (values?: string[]): string[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);
};

const sanitizeContent = (content: IngestionTopic['content'] = {}) => {
  const learningObjectives = normalizeStringArray(content.learning_objectives);

  return {
    ...('video_url' in content && content.video_url
      ? { video_url: content.video_url }
      : {}),
    ...('slides_url' in content && content.slides_url
      ? { slides_url: content.slides_url }
      : {}),
    ...('notes' in content && content.notes ? { notes: content.notes } : {}),
    ...(learningObjectives.length > 0
      ? { learning_objectives: learningObjectives }
      : {}),
  };
};

export async function bulkUpsertTopics(
  client: SupabaseClient<Database>,
  topics: IngestionTopic[]
): Promise<BulkUpsertResult> {
  if (!topics.length) {
    return {
      success: false,
      errors: ['No topics provided for ingestion.'],
    };
  }

  const errors: string[] = [];
  const assignedIds = new Map<IngestionTopic, string>();
  const positionTracker = new Map<string, Set<number>>();

  for (const topic of topics) {
    const id = topic.id?.trim() || randomUUID();
    assignedIds.set(topic, id);

    if (!topic.product_code?.trim()) {
      errors.push(`Topic "${topic.title ?? 'Unknown'}" is missing product_code.`);
    }

    if (!topic.title?.trim()) {
      errors.push(`Topic with position ${topic.position} is missing a title.`);
    }

    if (typeof topic.position !== 'number' || Number.isNaN(topic.position)) {
      errors.push(`Topic "${topic.title ?? id}" has an invalid position.`);
      continue;
    }

    const key = topic.product_code?.trim() ?? 'unknown';
    const positions = positionTracker.get(key) ?? new Set<number>();
    if (positions.has(topic.position)) {
      errors.push(
        `Duplicate position ${topic.position} detected for product ${key}.`
      );
    }
    positions.add(topic.position);
    positionTracker.set(key, positions);
  }

  if (errors.length) {
    return { success: false, errors };
  }

  type Product = { id: string; code: string };

  const { data: products, error: productsError } = await client
    .from('products')
    .select('id, code')
    .returns<Product[]>();

  if (productsError || !products?.length) {
    return {
      success: false,
      errors: ['Failed to load products from database.'],
    };
  }

  const productMap = new Map<string, string>();
  for (const product of products) {
    productMap.set(product.code, product.id);
  }

  type ExistingTopic = { id: string };

  const { data: existingTopics, error: existingError } = await client
    .from('topics')
    .select('id')
    .returns<ExistingTopic[]>();

  if (existingError) {
    return {
      success: false,
      errors: ['Failed to load existing topics for validation.'],
    };
  }

  const existingIds = new Set(existingTopics?.map((topic) => topic.id) ?? []);
  const incomingIds = new Set(Array.from(assignedIds.values()));

  const sanitizedTopics = topics.map((topic) => {
    const assignedId = assignedIds.get(topic)!;
    const productCode = topic.product_code.trim();
    const productId = productMap.get(productCode);

    if (!productId) {
      errors.push(`Unknown product_code "${productCode}" for topic "${topic.title}".`);
    }

    const prerequisites = normalizeStringArray(topic.prerequisites);
    const missingPrerequisites = prerequisites.filter(
      (prereq) => !existingIds.has(prereq) && !incomingIds.has(prereq)
    );

    if (missingPrerequisites.length) {
      errors.push(
        `Topic "${topic.title}" references missing prerequisites: ${missingPrerequisites.join(', ')}.`
      );
    }

    return {
      id: assignedId,
      product_id: productId ?? null,
      position: topic.position,
      title: topic.title.trim(),
      description: topic.description?.trim() ?? null,
      duration_minutes: topic.duration_minutes ?? 0,
      prerequisites,
      content: sanitizeContent(topic.content),
      published: topic.published ?? true,
    };
  });

  if (errors.length) {
    return { success: false, errors };
  }

  const { error: upsertError, data } = await (client
    .from('topics') as any)
    .upsert(sanitizedTopics, { onConflict: 'id' })
    .select('id');

  if (upsertError) {
    return {
      success: false,
      errors: [upsertError.message],
    };
  }

  return {
    success: true,
    count: data?.length ?? sanitizedTopics.length,
  };
}

