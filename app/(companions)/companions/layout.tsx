import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export default async function CompanionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Admin-only check
  if (!user || user.email !== 'admin@intimesolutions.com') {
    redirect('/');
  }
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {children}
    </div>
  );
}
