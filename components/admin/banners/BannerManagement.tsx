'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  Pause,
  Play,
  Copy,
  BarChart3,
  Clock,
  MousePointerClick,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Banner {
  id: string;
  name: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_url: string | null;
  background_image_id: string | null;
  background_color: string | null;
  text_color: string | null;
  overlay_opacity: number;
  placement: string;
  specific_pages: string[] | null;
  display_order: number;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  target_audience: string[] | null;
  impression_count: number;
  click_count: number;
  ctr: number;
  variant_name: string | null;
  experiment_id: string | null;
  status: 'draft' | 'active' | 'paused' | 'expired';
  created_at: string;
  background_image?: {
    id: string;
    file_url: string;
    alt_text: string | null;
  };
}

interface BannerManagementProps {
  initialBanners: Banner[];
}

const placements = [
  { value: 'home_hero', label: 'Homepage Hero' },
  { value: 'home_banner', label: 'Homepage Banner' },
  { value: 'all_pages_top', label: 'All Pages - Top' },
  { value: 'all_pages_bottom', label: 'All Pages - Bottom' },
  { value: 'specific_pages', label: 'Specific Pages' }
];

export default function BannerManagement({ initialBanners }: BannerManagementProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Filter banners
  const filteredBanners = useMemo(() => {
    return banners.filter(banner => {
      const matchesSearch = 
        banner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || banner.status === statusFilter;
      const matchesPlacement = placementFilter === 'all' || banner.placement === placementFilter;

      return matchesSearch && matchesStatus && matchesPlacement;
    });
  }, [banners, searchTerm, statusFilter, placementFilter]);

  // Get statistics
  const stats = useMemo(() => {
    const active = banners.filter(b => b.status === 'active').length;
    const totalImpressions = banners.reduce((sum, b) => sum + b.impression_count, 0);
    const totalClicks = banners.reduce((sum, b) => sum + b.click_count, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      total: banners.length,
      active,
      totalImpressions,
      totalClicks,
      avgCtr
    };
  }, [banners]);

  // Handle banner deletion
  const handleDelete = async (bannerId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      setBanners(banners.filter(b => b.id !== bannerId));
      toast.success('Banner deleted successfully');
    } catch (error) {
            toast.error('Failed to delete banner');
    } finally {
      setLoading(false);
      setDeleteBannerId(null);
    }
  };

  // Toggle banner status
  const toggleBannerStatus = async (banner: Banner) => {
    setLoading(true);
    try {
      const newStatus = banner.is_active ? 'paused' : 'active';
      const { error } = await supabase
        .from('banners')
        .update({ 
          is_active: !banner.is_active,
          status: newStatus
        })
        .eq('id', banner.id);

      if (error) throw error;

      setBanners(banners.map(b => 
        b.id === banner.id 
          ? { ...b, is_active: !b.is_active, status: newStatus }
          : b
      ));
      
      toast.success(`Banner ${!banner.is_active ? 'activated' : 'paused'}`);
    } catch (error) {
            toast.error('Failed to update banner status');
    } finally {
      setLoading(false);
    }
  };

  // Duplicate banner
  const duplicateBanner = async (banner: Banner) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          ...banner,
          id: undefined,
          name: `${banner.name} (Copy)`,
          status: 'draft',
          is_active: false,
          impression_count: 0,
          click_count: 0,
          created_at: undefined,
          updated_at: undefined
        })
        .select()
        .single();

      if (error) throw error;

      setBanners([data, ...banners]);
      toast.success('Banner duplicated successfully');
    } catch (error) {
            toast.error('Failed to duplicate banner');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: Banner['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get placement label
  const getPlacementLabel = (placement: string) => {
    return placements.find(p => p.value === placement)?.label || placement;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImpressions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalClicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCtr.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Placements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Placements</SelectItem>
              {placements.map(placement => (
                <SelectItem key={placement.value} value={placement.value}>
                  {placement.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/admin/banners/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Banner
            </Link>
          </Button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {filteredBanners.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No banners found</h3>
              <p className="text-gray-500 mb-4">
                Create your first banner to start promoting content
              </p>
              <Button asChild>
                <Link href="/admin/banners/new">
                  Create First Banner
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBanners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="flex">
                {/* Preview */}
                <div 
                  className="w-64 h-32 relative flex-shrink-0"
                  style={{
                    backgroundColor: banner.background_color || '#f3f4f6',
                    backgroundImage: banner.background_image?.file_url 
                      ? `url(${banner.background_image.file_url})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {banner.overlay_opacity > 0 && (
                    <div 
                      className="absolute inset-0 bg-black"
                      style={{ opacity: banner.overlay_opacity }}
                    />
                  )}
                  <div 
                    className="relative z-10 p-4 flex flex-col justify-center h-full"
                    style={{ color: banner.text_color || '#000000' }}
                  >
                    <h4 className="font-bold text-sm line-clamp-1">{banner.title}</h4>
                    {banner.subtitle && (
                      <p className="text-xs opacity-90 line-clamp-1">{banner.subtitle}</p>
                    )}
                    {banner.cta_text && (
                      <span className="text-xs mt-2 inline-block px-2 py-1 bg-white/20 rounded">
                        {banner.cta_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{banner.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(banner.status)}
                        >
                          {banner.status}
                        </Badge>
                        {banner.variant_name && (
                          <Badge variant="outline">
                            {banner.variant_name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {getPlacementLabel(banner.placement)}
                        </div>
                        {banner.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(banner.start_date), 'MMM d, yyyy')}
                            {banner.end_date && ` - ${format(new Date(banner.end_date), 'MMM d, yyyy')}`}
                          </div>
                        )}
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-500">Impressions</p>
                          <p className="text-sm font-semibold">
                            {banner.impression_count.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="text-sm font-semibold">
                            {banner.click_count.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">CTR</p>
                          <p className="text-sm font-semibold">
                            {banner.ctr.toFixed(2)}%
                          </p>
                        </div>
                        {banner.ctr > 0 && (
                          <div className="flex-1 max-w-xs">
                            <Progress value={banner.ctr} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBannerStatus(banner)}
                        disabled={loading}
                      >
                        {banner.is_active ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/banners/${banner.id}/edit`}>
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/banners/${banner.id}/analytics`}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateBanner(banner)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteBannerId(banner.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBannerId} onOpenChange={() => setDeleteBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteBannerId && handleDelete(deleteBannerId)}
              disabled={loading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


