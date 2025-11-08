'use server';

import { revalidatePath } from 'next/cache';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { bulkUpsertTopics, type IngestionTopic } from '@/modules/topics/admin';

type ImportState = {
  success: boolean;
  message?: string;
  error?: string;
  count?: number;
};

const initialState: ImportState = {
  success: false,
};

type AdminContext =
  | { success: true; adminClient: ReturnType<typeof createAdminClient> }
  | { success: false; error: string };

const ensureAdminContext = async (): Promise<AdminContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized: Please sign in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profileError || !profile || profile.role !== 'admin') {
    return { success: false, error: 'Only admins can import topics.' };
  }

  return { success: true, adminClient: createAdminClient() };
};

const parseTopics = (payload: string): IngestionTopic[] => {
  const data = JSON.parse(payload);

  if (!Array.isArray(data)) {
    throw new Error('JSON payload must be an array of topics.');
  }

  return data as IngestionTopic[];
};

const importTopics = async (topics: IngestionTopic[]): Promise<ImportState> => {
  const context = await ensureAdminContext();

  if (!context.success) {
    return { success: false, error: context.error };
  }

  const result = await bulkUpsertTopics(context.adminClient, topics);

  if (!result.success) {
    return {
      success: false,
      error: result.errors?.join('\n') ?? 'Failed to import topics.',
    };
  }

  revalidatePath('/admin/topics');

  return {
    success: true,
    count: result.count,
    message: `Imported ${result.count ?? topics.length} topics successfully.`,
  };
};

export async function importTopicsAction(
  _: ImportState = initialState,
  formData: FormData
): Promise<ImportState> {
  try {
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'Please select a JSON file to upload.' };
    }

    const payload = await file.text();
    let topics: IngestionTopic[];

    try {
      topics = parseTopics(payload);
    } catch (error) {
      const details =
        error instanceof Error ? error.message : 'Unable to parse file contents.';
      return {
        success: false,
        error: `Invalid JSON file. ${details}`,
      };
    }

    return importTopics(topics);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error occurred.';
    return { success: false, error: message };
  }
}

export { initialState as importTopicsInitialState };

export const importSampleTopicsAction = async (): Promise<ImportState> => {
  try {
    const samplePath = path.resolve(process.cwd(), 'data/claimcenter-topics.json');
    
    // Check if file exists first
    try {
      await readFile(samplePath, 'utf8');
    } catch (fileError) {
      console.error('[importSampleTopics] File not found:', samplePath);
      return {
        success: false,
        error: 'Sample file not found. Topics have been migrated to the database. Use the database to manage topics or upload a custom JSON file.',
      };
    }
    
    const payload = await readFile(samplePath, 'utf8');
    const topics = parseTopics(payload);
    return importTopics(topics);
  } catch (error) {
    console.error('[importSampleTopics] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to load sample dataset.';
    return { success: false, error: message };
  }
};
