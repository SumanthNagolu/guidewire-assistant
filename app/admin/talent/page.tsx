import { createClient } from '@/lib/supabase/server';
import TalentManagement from '@/components/admin/talent/TalentManagement';
export default async function AdminTalentPage() {
  const supabase = await createClient();
  // Fetch candidates from database
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
      *,
      recruiter:recruiter_id(
        id,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Talent Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your consultant bench and talent pool with AI-powered matching
        </p>
      </div>
      <TalentManagement initialCandidates={candidates || []} />
    </div>
  );
}