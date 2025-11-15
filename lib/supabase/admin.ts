import { createClient } from '@/lib/supabase/server';

// Admin client with service role
export async function createAdminClient() {
  return createClient();
}

