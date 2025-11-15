import BannerEditor from '@/components/admin/banners/BannerEditor';
export default async function EditBannerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <BannerEditor bannerId={id} />;
}
