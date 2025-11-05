import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/features/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  type UserProfile = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    onboarding_completed: boolean;
    assumed_persona: string | null;
    preferred_product_id: string | null;
    created_at: string;
    updated_at: string;
  };

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single<UserProfile>();

  // Check if profile setup is complete
  if (!profile?.onboarding_completed) {
    redirect('/profile-setup');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

