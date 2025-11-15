'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Palette,
  Target,
  Calendar,
  Monitor,
  Smartphone,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import MediaSelector from '@/components/admin/MediaSelector';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Banner {
  id?: string;
  name: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  background_image_id?: string;
  background_color: string;
  text_color: string;
  overlay_opacity: number;
  placement: string;
  specific_pages: string[];
  display_order: number;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  start_date?: Date | null;
  end_date?: Date | null;
  is_active: boolean;
  target_audience: string[];
  status: 'draft' | 'active' | 'paused' | 'expired';
  variant_name: string;
  experiment_id: string;
}

interface BannerEditorProps {
  bannerId?: string;
}

const placements = [
  { value: 'home_hero', label: 'Homepage Hero' },
  { value: 'home_banner', label: 'Homepage Banner' },
  { value: 'all_pages_top', label: 'All Pages - Top' },
  { value: 'all_pages_bottom', label: 'All Pages - Bottom' },
  { value: 'specific_pages', label: 'Specific Pages' }
];

const audiences = [
  { value: 'new_visitors', label: 'New Visitors' },
  { value: 'returning_visitors', label: 'Returning Visitors' },
  { value: 'logged_in_users', label: 'Logged In Users' },
  { value: 'anonymous_users', label: 'Anonymous Users' }
];

export default function BannerEditor({ bannerId }: BannerEditorProps) {
  const [banner, setBanner] = useState<Banner>({
    name: '',
    title: '',
    subtitle: '',
    cta_text: '',
    cta_url: '',
    background_color: '#1e40af',
    text_color: '#ffffff',
    overlay_opacity: 0.5,
    placement: 'home_hero',
    specific_pages: [],
    display_order: 0,
    show_on_mobile: true,
    show_on_desktop: true,
    is_active: true,
    target_audience: [],
    status: 'draft',
    variant_name: '',
    experiment_id: ''
  });
  
  const [pageInput, setPageInput] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Load existing banner if editing
  useEffect(() => {
    if (bannerId) {
      loadBanner();
    }
  }, [bannerId]);

  const loadBanner = async () => {
    if (!bannerId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select(`
          *,
          background_image:background_image_id(
            id,
            file_url
          )
        `)
        .eq('id', bannerId)
        .single();

      if (error) throw error;

      setBanner({
        ...data,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
        specific_pages: data.specific_pages || []
      });

      if (data.background_image?.file_url) {
        setBackgroundImageUrl(data.background_image.file_url);
      }
    } catch (error) {
            toast.error('Failed to load banner');
      router.push('/admin/banners');
    } finally {
      setLoading(false);
    }
  };

  // Add page to specific pages list
  const addPage = () => {
    if (pageInput && !banner.specific_pages.includes(pageInput)) {
      setBanner(prev => ({
        ...prev,
        specific_pages: [...prev.specific_pages, pageInput]
      }));
      setPageInput('');
    }
  };

  // Remove page from list
  const removePage = (page: string) => {
    setBanner(prev => ({
      ...prev,
      specific_pages: prev.specific_pages.filter(p => p !== page)
    }));
  };

  // Toggle audience selection
  const toggleAudience = (audience: string) => {
    setBanner(prev => ({
      ...prev,
      target_audience: prev.target_audience.includes(audience)
        ? prev.target_audience.filter(a => a !== audience)
        : [...prev.target_audience, audience]
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!banner.name || !banner.title) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const saveData: any = {
        name: banner.name,
        title: banner.title,
        subtitle: banner.subtitle,
        cta_text: banner.cta_text,
        cta_url: banner.cta_url,
        background_image_id: banner.background_image_id,
        background_color: banner.background_color,
        text_color: banner.text_color,
        overlay_opacity: banner.overlay_opacity,
        placement: banner.placement,
        specific_pages: banner.placement === 'specific_pages' ? banner.specific_pages : null,
        display_order: banner.display_order,
        show_on_mobile: banner.show_on_mobile,
        show_on_desktop: banner.show_on_desktop,
        start_date: banner.start_date?.toISOString() || null,
        end_date: banner.end_date?.toISOString() || null,
        is_active: banner.is_active,
        target_audience: banner.target_audience,
        status: banner.is_active ? 'active' : banner.status,
        variant_name: banner.variant_name || null,
        experiment_id: banner.experiment_id || null
      };

      if (bannerId) {
        // Update existing banner
        const { error } = await supabase
          .from('banners')
          .update(saveData)
          .eq('id', bannerId);

        if (error) throw error;

        // Log the update
        await supabase.rpc('log_cms_action', {
          p_action: 'update',
          p_entity_type: 'banner',
          p_entity_id: bannerId,
          p_entity_title: banner.name
        });

        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        const { data, error } = await supabase
          .from('banners')
          .insert(saveData)
          .select()
          .single();

        if (error) throw error;

        // Log the creation
        await supabase.rpc('log_cms_action', {
          p_action: 'create',
          p_entity_type: 'banner',
          p_entity_id: data.id,
          p_entity_title: banner.name
        });

        toast.success('Banner created successfully');
        router.push('/admin/banners');
      }
    } catch (error) {
            toast.error('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Banners
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {bannerId ? 'Edit Banner' : 'Create New Banner'}
          </h1>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Banner'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Banner Name *</Label>
                <Input
                  id="name"
                  value={banner.name}
                  onChange={(e) => setBanner({ ...banner, name: e.target.value })}
                  placeholder="Internal name for this banner"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={banner.title}
                  onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                  placeholder="Main headline"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={banner.subtitle}
                  onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                  placeholder="Supporting text"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cta-text">CTA Text</Label>
                  <Input
                    id="cta-text"
                    value={banner.cta_text}
                    onChange={(e) => setBanner({ ...banner, cta_text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta-url">CTA URL</Label>
                  <Input
                    id="cta-url"
                    value={banner.cta_url}
                    onChange={(e) => setBanner({ ...banner, cta_url: e.target.value })}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design */}
          <Card>
            <CardHeader>
              <CardTitle>Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Background Image</Label>
                <div
                  onClick={() => setShowMediaSelector(true)}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                >
                  {backgroundImageUrl ? (
                    <img
                      src={backgroundImageUrl}
                      alt="Background"
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click to select image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={banner.background_color}
                      onChange={(e) => setBanner({ ...banner, background_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={banner.background_color}
                      onChange={(e) => setBanner({ ...banner, background_color: e.target.value })}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={banner.text_color}
                      onChange={(e) => setBanner({ ...banner, text_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={banner.text_color}
                      onChange={(e) => setBanner({ ...banner, text_color: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Overlay Opacity</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[banner.overlay_opacity]}
                    onValueChange={([value]) => setBanner({ ...banner, overlay_opacity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{(banner.overlay_opacity * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placement & Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Placement & Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <Select
                  value={banner.placement}
                  onValueChange={(value) => setBanner({ ...banner, placement: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {placements.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {banner.placement === 'specific_pages' && (
                <div className="space-y-2">
                  <Label>Specific Pages</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      placeholder="/products, /services"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPage())}
                    />
                    <Button type="button" onClick={addPage} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {banner.specific_pages.map(page => (
                      <Badge key={page} variant="secondary">
                        {page}
                        <button
                          onClick={() => removePage(page)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="space-y-2">
                  {audiences.map(audience => (
                    <label
                      key={audience.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={banner.target_audience.includes(audience.value)}
                        onChange={() => toggleAudience(audience.value)}
                        className="rounded"
                      />
                      {audience.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-order">Display Order</Label>
                <Input
                  id="display-order"
                  type="number"
                  value={banner.display_order}
                  onChange={(e) => setBanner({ ...banner, display_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">Lower numbers display first</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mobile">Show on Mobile</Label>
                    <p className="text-sm text-gray-500">Display banner on mobile devices</p>
                  </div>
                  <Switch
                    id="mobile"
                    checked={banner.show_on_mobile}
                    onCheckedChange={(checked) => setBanner({ ...banner, show_on_mobile: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="desktop">Show on Desktop</Label>
                    <p className="text-sm text-gray-500">Display banner on desktop devices</p>
                  </div>
                  <Switch
                    id="desktop"
                    checked={banner.show_on_desktop}
                    onCheckedChange={(checked) => setBanner({ ...banner, show_on_desktop: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Set when the banner should be displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DateTimePicker
                  value={banner.start_date}
                  onChange={(date) => setBanner({ ...banner, start_date: date })}
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <DateTimePicker
                  value={banner.end_date}
                  onChange={(date) => setBanner({ ...banner, end_date: date })}
                  placeholder="Select end date"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <p className="text-sm text-gray-500">Banner is currently active</p>
                </div>
                <Switch
                  id="active"
                  checked={banner.is_active}
                  onCheckedChange={(checked) => setBanner({ ...banner, is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>
                Optional: Set up variant testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="variant">Variant Name</Label>
                <Input
                  id="variant"
                  value={banner.variant_name}
                  onChange={(e) => setBanner({ ...banner, variant_name: e.target.value })}
                  placeholder="Variant A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiment">Experiment ID</Label>
                <Input
                  id="experiment"
                  value={banner.experiment_id}
                  onChange={(e) => setBanner({ ...banner, experiment_id: e.target.value })}
                  placeholder="exp-001"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your banner will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Monitor className="w-4 h-4" />
                  Desktop Preview
                </div>
                <div 
                  className="relative rounded-lg overflow-hidden h-48"
                  style={{
                    backgroundColor: banner.background_color,
                    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
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
                    className="relative z-10 p-8 flex flex-col justify-center h-full text-center"
                    style={{ color: banner.text_color }}
                  >
                    <h2 className="text-3xl font-bold mb-2">{banner.title || 'Banner Title'}</h2>
                    {banner.subtitle && (
                      <p className="text-lg opacity-90 mb-4">{banner.subtitle}</p>
                    )}
                    {banner.cta_text && (
                      <button 
                        className="mx-auto px-6 py-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-colors"
                        style={{ color: banner.text_color }}
                      >
                        {banner.cta_text}
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Smartphone className="w-4 h-4" />
                  Mobile Preview
                </div>
                <div 
                  className="relative rounded-lg overflow-hidden h-32 max-w-xs mx-auto"
                  style={{
                    backgroundColor: banner.background_color,
                    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
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
                    className="relative z-10 p-4 flex flex-col justify-center h-full text-center"
                    style={{ color: banner.text_color }}
                  >
                    <h3 className="text-lg font-bold mb-1">{banner.title || 'Banner Title'}</h3>
                    {banner.subtitle && (
                      <p className="text-sm opacity-90 line-clamp-1">{banner.subtitle}</p>
                    )}
                    {banner.cta_text && (
                      <button 
                        className="mx-auto mt-2 px-4 py-1 text-xs rounded-full bg-white/20 backdrop-blur"
                        style={{ color: banner.text_color }}
                      >
                        {banner.cta_text}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Placement</span>
                  <span className="font-medium">
                    {placements.find(p => p.value === banner.placement)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Device Support</span>
                  <div className="flex gap-2">
                    {banner.show_on_desktop && <Monitor className="w-4 h-4" />}
                    {banner.show_on_mobile && <Smartphone className="w-4 h-4" />}
                  </div>
                </div>
                {banner.target_audience.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Audience</span>
                    <span className="font-medium">{banner.target_audience.length} segments</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Selector */}
      {showMediaSelector && (
        <MediaSelector
          onSelect={(media) => {
            setBanner({
              ...banner,
              background_image_id: media.id
            });
            setBackgroundImageUrl(media.file_url);
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          filterType="images"
        />
      )}
    </div>
  );
}


