import MediaLibrary from '@/components/admin/media/MediaLibrary';
import { createClient } from '@/lib/supabase/server';
export default async function MediaLibraryPage() {
  const supabase = await createClient();
  // Fetch initial media assets
  const { data: mediaAssets } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Media Library
        </h1>
        <p className="text-gray-500 mt-1">
          Manage all your images, videos, and documents in one place
        </p>
      </div>
      <MediaLibrary initialAssets={mediaAssets || []} />
    </div>
  );
}
