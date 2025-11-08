import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import SetupActions from '@/components/features/admin/SetupActions';

export default async function AdminSetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Check what's already set up
  const checks = {
    storageBucket: false,
    interviewTemplates: false,
    quizzes: false,
  };

  // Check storage bucket (requires admin client)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);
  
  const { data: buckets } = await adminClient.storage.listBuckets();
  checks.storageBucket = buckets?.some((b) => b.id === 'guidewire-assistant-training-content') || false;

  // Check interview templates
  const { count: templateCount } = await supabase
    .from('interview_templates')
    .select('*', { count: 'exact', head: true });
  checks.interviewTemplates = (templateCount || 0) > 0;

  // Check quizzes
  const { count: quizCount } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true });
  checks.quizzes = (quizCount || 0) > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Platform Setup</h1>
        <p className="text-muted-foreground mt-2">
          One-click setup for database and storage
        </p>
      </header>

      <SetupActions initialChecks={checks} />
    </div>
  );
}

