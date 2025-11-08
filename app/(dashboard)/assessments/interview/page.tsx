import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getActiveInterviewTemplates } from '@/modules/assessments/interviews';
import InterviewSimulator from '@/components/features/assessments/InterviewSimulator';
import type { Database } from '@/types/database';
import { InlineErrorBoundary } from '@/components/ErrorBoundary';

export default async function InterviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('preferred_product_id')
    .eq('id', user.id)
    .maybeSingle()
    .returns<Pick<Database['public']['Tables']['user_profiles']['Row'], 'preferred_product_id'>>();

  const templates = await getActiveInterviewTemplates(profile?.preferred_product_id ?? undefined);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Interview Simulator</h1>
        <p className="text-muted-foreground">
          Practice real interview questions, receive structured feedback, and build confidence before
          the real conversation.
        </p>
      </header>

      <InlineErrorBoundary>
        <InterviewSimulator templates={templates} />
      </InlineErrorBoundary>
    </div>
  );
}

