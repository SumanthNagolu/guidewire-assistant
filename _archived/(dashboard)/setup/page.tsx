import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import SetupActions from '@/components/features/admin/SetupActions';

export default async function SetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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
  
  const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
  console.log('[Setup] Available buckets:', buckets?.map(b => b.id));
  console.log('[Setup] Buckets error:', bucketsError);
  checks.storageBucket = buckets?.some((b) => b.id === 'guidewire-assistant-training-content') || false;
  console.log('[Setup] Storage bucket check result:', checks.storageBucket);

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

