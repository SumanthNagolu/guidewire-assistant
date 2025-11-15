import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { createClient } from '@/lib/supabase/server'

export async function createContext(opts: FetchCreateContextFnOptions) {
  const supabase = await createClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const user = session?.user ?? null
  
  return {
    headers: opts.req.headers,
    supabase,
    session,
    user,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>


