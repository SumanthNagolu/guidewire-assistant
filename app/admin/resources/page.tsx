import { createClient } from '@/lib/supabase/server';
import ResourceManagement from '@/components/admin/resources/ResourceManagement';
export default async function ResourcesPage() {
  const supabase = await createClient();
  // Fetch resources with file and thumbnail info
  const { data: resources } = await supabase
    .from('resources')
    .select(`
      *,
      file:file_id(
        id,
        file_url,
        file_size,
        original_filename
      ),
      thumbnail:thumbnail_id(
        id,
        file_url
      )
    `)
    .order('created_at', { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Resource Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage whitepapers, case studies, guides, and other downloadable content
        </p>
      </div>
      <ResourceManagement initialResources={resources || []} />
    </div>
  );
}
