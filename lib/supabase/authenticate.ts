import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL and service role key must be set in environment variables.');
}

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { error: 'Missing or invalid Authorization header' } as const;
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return { error: 'Missing bearer token' } as const;
  }

  const authClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data?.user) {
    return { error: error?.message ?? 'Invalid token' } as const;
  }

  return {
    supabase: authClient,
    user: data.user,
    token,
  } as const;
}


