'use client';

import { createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SupabaseContext = createContext<any>({});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const user = null; // Placeholder - in production this should come from auth state

  return (
    <SupabaseContext.Provider value={{ supabase, user }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  
  return context;
}

