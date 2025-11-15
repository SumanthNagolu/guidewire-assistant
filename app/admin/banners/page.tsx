import { createClient } from '@/lib/supabase/server';
import BannerManagement from '@/components/admin/banners/BannerManagement';
export default async function BannersPage() {
  const supabase = await createClient();
  // Fetch banners with analytics
  const { data: banners } = await supabase
    .from('banners')
    .select(`
      *,
      background_image:background_image_id(
        id,
        file_url,
        alt_text
      )
    `)
    .order('created_at', { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Banner Management
        </h1>
        <p className="text-gray-500 mt-1">
          Create and manage promotional banners across your website
        </p>
      </div>
      <BannerManagement initialBanners={banners || []} />
    </div>
  );
}
