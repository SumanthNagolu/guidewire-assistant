'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Image as ImageIcon,
  Lock,
  Unlock,
  Plus,
  X,
  Tag,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import MediaSelector from '@/components/admin/MediaSelector';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface Resource {
  id?: string;
  title: string;
  slug: string;
  description: string;
  resource_type: 'whitepaper' | 'case_study' | 'guide' | 'ebook' | 'template' | 'webinar' | 'other';
  file_id?: string;
  file_size_display?: string;
  page_count?: number;
  thumbnail_id?: string;
  category: string;
  tags: string[];
  industry: string[];
  is_gated: boolean;
  required_fields: string[];
  meta_title: string;
  meta_description: string;
  status: 'draft' | 'published' | 'archived';
}

interface ResourceEditorProps {
  resourceId?: string;
}

const resourceTypes = [
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'guide', label: 'Guide' },
  { value: 'ebook', label: 'E-book' },
  { value: 'template', label: 'Template' },
  { value: 'webinar', label: 'Webinar Recording' },
  { value: 'other', label: 'Other' }
];

const categories = [
  'Technology',
  'Best Practices',
  'Industry Insights',
  'Implementation',
  'Strategy',
  'Training',
  'Compliance'
];

const industries = [
  'Insurance',
  'Banking',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Technology',
  'Government',
  'Education'
];

const gatingFields = [
  { value: 'email', label: 'Email (Always Required)', disabled: true },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'company', label: 'Company' },
  { value: 'job_title', label: 'Job Title' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'country', label: 'Country' }
];

export default function ResourceEditor({ resourceId }: ResourceEditorProps) {
  const [resource, setResource] = useState<Resource>({
    title: '',
    slug: '',
    description: '',
    resource_type: 'whitepaper',
    category: 'Technology',
    tags: [],
    industry: [],
    is_gated: false,
    required_fields: ['email'],
    meta_title: '',
    meta_description: '',
    status: 'draft'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Load existing resource if editing
  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  const loadResource = async () => {
    if (!resourceId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq('id', resourceId)
        .single();

      if (error) throw error;

      setResource({
        ...data,
        tags: data.tags || [],
        industry: data.industry || [],
        required_fields: data.required_fields || ['email']
      });

      if (data.file) {
        setFileUrl(data.file.file_url);
        setFileName(data.file.original_filename);
        setFileSize(data.file.file_size);
      }

      if (data.thumbnail?.file_url) {
        setThumbnailUrl(data.thumbnail.file_url);
      }
    } catch (error) {
            toast.error('Failed to load resource');
      router.push('/admin/resources');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Auto-generate slug when title changes (only for new resources)
  useEffect(() => {
    if (!resourceId && resource.title) {
      setResource(prev => ({ ...prev, slug: generateSlug(resource.title) }));
    }
  }, [resource.title, resourceId]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (!resource.meta_title && resource.title) {
      setResource(prev => ({ ...prev, meta_title: resource.title }));
    }
  }, [resource.title, resource.meta_title]);

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!resource.tags.includes(tagInput.trim())) {
        setResource(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setResource(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setResource(prev => ({
      ...prev,
      industry: prev.industry.includes(industry)
        ? prev.industry.filter(i => i !== industry)
        : [...prev.industry, industry]
    }));
  };

  // Toggle required field
  const toggleRequiredField = (field: string) => {
    if (field === 'email') return; // Email is always required
    
    setResource(prev => ({
      ...prev,
      required_fields: prev.required_fields.includes(field)
        ? prev.required_fields.filter(f => f !== field)
        : [...prev.required_fields, field]
    }));
  };

  // Handle save
  const handleSave = async (publish: boolean = false) => {
    if (!resource.title || !resource.slug || !resource.file_id) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    setSaving(true);
    try {
      const saveData: any = {
        title: resource.title,
        slug: resource.slug,
        description: resource.description,
        resource_type: resource.resource_type,
        file_id: resource.file_id,
        file_size_display: formatBytes(fileSize),
        page_count: resource.page_count || null,
        thumbnail_id: resource.thumbnail_id || null,
        category: resource.category,
        tags: resource.tags,
        industry: resource.industry,
        is_gated: resource.is_gated,
        required_fields: resource.is_gated ? resource.required_fields : null,
        meta_title: resource.meta_title || resource.title,
        meta_description: resource.meta_description || resource.description,
        status: publish ? 'published' : resource.status
      };

      if (publish && !resourceId) {
        saveData.published_at = new Date().toISOString();
      }

      if (resourceId) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update(saveData)
          .eq('id', resourceId);

        if (error) throw error;

        // Log the update
        await supabase.rpc('log_cms_action', {
          p_action: publish ? 'publish' : 'update',
          p_entity_type: 'resource',
          p_entity_id: resourceId,
          p_entity_title: resource.title
        });

        toast.success(publish ? 'Resource published!' : 'Resource saved!');
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from('resources')
          .insert(saveData)
          .select()
          .single();

        if (error) throw error;

        // Log the creation
        await supabase.rpc('log_cms_action', {
          p_action: 'create',
          p_entity_type: 'resource',
          p_entity_id: data.id,
          p_entity_title: resource.title
        });

        toast.success(publish ? 'Resource published!' : 'Resource created!');
        router.push(`/admin/resources/${data.id}/edit`);
      }
    } catch (error: any) {
            if (error.code === '23505' && error.constraint === 'resources_slug_key') {
        toast.error('A resource with this slug already exists');
      } else {
        toast.error('Failed to save resource');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/resources">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {resourceId ? 'Edit Resource' : 'Add New Resource'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={resource.title}
                    onChange={(e) => setResource({ ...resource, title: e.target.value })}
                    placeholder="Resource title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={resource.slug}
                    onChange={(e) => setResource({ ...resource, slug: e.target.value })}
                    placeholder="resource-url-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={resource.description}
                  onChange={(e) => setResource({ ...resource, description: e.target.value })}
                  placeholder="Brief description of the resource..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Resource Type</Label>
                  <Select
                    value={resource.resource_type}
                    onValueChange={(value: any) => setResource({ ...resource, resource_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={resource.category}
                    onValueChange={(value) => setResource({ ...resource, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pages">Page Count (Optional)</Label>
                <Input
                  id="pages"
                  type="number"
                  value={resource.page_count || ''}
                  onChange={(e) => setResource({ ...resource, page_count: parseInt(e.target.value) || undefined })}
                  placeholder="Number of pages"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Resource File *</CardTitle>
              <CardDescription>
                Upload the main resource file (PDF, DOC, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => setShowFileSelector(true)}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
              >
                {fileUrl ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-green-600" />
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-gray-500">{formatBytes(fileSize)}</p>
                    <Button variant="outline" size="sm">
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">Click to select file</p>
                    <p className="text-sm text-gray-500">PDF, DOC, DOCX, PPT, XLS</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail Image</CardTitle>
              <CardDescription>
                Cover image for the resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => setShowThumbnailSelector(true)}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              >
                {thumbnailUrl ? (
                  <div className="space-y-2">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full max-w-xs mx-auto rounded"
                    />
                    <Button variant="outline" size="sm">
                      Change Thumbnail
                    </Button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to select thumbnail</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={resource.meta_title}
                  onChange={(e) => setResource({ ...resource, meta_title: e.target.value })}
                  placeholder="SEO title..."
                />
                <p className="text-xs text-gray-500">
                  {resource.meta_title.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={resource.meta_description}
                  onChange={(e) => setResource({ ...resource, meta_description: e.target.value })}
                  placeholder="SEO description..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {resource.meta_description.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Tags & Industries */}
          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press Enter to add tags..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {resource.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Industries</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {industries.map(industry => (
                    <label
                      key={industry}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={resource.industry.includes(industry)}
                        onCheckedChange={() => toggleIndustry(industry)}
                      />
                      {industry}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gating Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="gated">Gate Content</Label>
                  <p className="text-sm text-gray-500">
                    Require form submission
                  </p>
                </div>
                <Switch
                  id="gated"
                  checked={resource.is_gated}
                  onCheckedChange={(checked) => setResource({ ...resource, is_gated: checked })}
                />
              </div>

              {resource.is_gated && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>Required Fields</Label>
                  <div className="space-y-2">
                    {gatingFields.map(field => (
                      <label
                        key={field.value}
                        className={`flex items-center gap-2 ${field.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <Checkbox
                          checked={resource.required_fields.includes(field.value)}
                          onCheckedChange={() => toggleRequiredField(field.value)}
                          disabled={field.disabled}
                        />
                        {field.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={resource.status === 'published' ? 'default' : 'secondary'}>
                    {resource.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">
                    {resourceTypes.find(t => t.value === resource.resource_type)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lead Capture</span>
                  {resource.is_gated ? (
                    <Lock className="w-4 h-4 text-green-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                {resource.tags.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tags</span>
                    <span className="font-medium">{resource.tags.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Selectors */}
      {showFileSelector && (
        <MediaSelector
          onSelect={(media) => {
            setResource({
              ...resource,
              file_id: media.id
            });
            setFileUrl(media.file_url);
            setFileName(media.filename);
            // Note: We'd need to store file size in media_assets table or fetch it separately
            setShowFileSelector(false);
          }}
          onClose={() => setShowFileSelector(false)}
          filterType="all"
        />
      )}

      {showThumbnailSelector && (
        <MediaSelector
          onSelect={(media) => {
            setResource({
              ...resource,
              thumbnail_id: media.id
            });
            setThumbnailUrl(media.file_url);
            setShowThumbnailSelector(false);
          }}
          onClose={() => setShowThumbnailSelector(false)}
          filterType="images"
        />
      )}
    </div>
  );
}


