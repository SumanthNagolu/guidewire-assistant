'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  FileText,
  BookOpen,
  FileCheck,
  Users,
  Lock,
  Unlock,
  BarChart3,
  TrendingUp,
  Calendar,
  Tag
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
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatBytes } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  resource_type: 'whitepaper' | 'case_study' | 'guide' | 'ebook' | 'template' | 'webinar' | 'other';
  file_id: string;
  file_size_display: string | null;
  page_count: number | null;
  thumbnail_id: string | null;
  category: string;
  tags: string[];
  industry: string[] | null;
  is_gated: boolean;
  required_fields: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  download_count: number;
  view_count: number;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  file?: {
    id: string;
    file_url: string;
    file_size: number;
    original_filename: string;
  };
  thumbnail?: {
    id: string;
    file_url: string;
  };
}

interface ResourceManagementProps {
  initialResources: Resource[];
}

const resourceTypes = [
  { value: 'whitepaper', label: 'Whitepaper', icon: FileText },
  { value: 'case_study', label: 'Case Study', icon: FileCheck },
  { value: 'guide', label: 'Guide', icon: BookOpen },
  { value: 'ebook', label: 'E-book', icon: BookOpen },
  { value: 'template', label: 'Template', icon: FileText },
  { value: 'webinar', label: 'Webinar', icon: Users },
  { value: 'other', label: 'Other', icon: FileText }
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

export default function ResourceManagement({ initialResources }: ResourceManagementProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || resource.resource_type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [resources, searchTerm, typeFilter, categoryFilter, statusFilter]);

  // Get statistics
  const stats = useMemo(() => {
    const published = resources.filter(r => r.status === 'published').length;
    const totalDownloads = resources.reduce((sum, r) => sum + r.download_count, 0);
    const totalViews = resources.reduce((sum, r) => sum + r.view_count, 0);
    const gatedResources = resources.filter(r => r.is_gated).length;

    return {
      total: resources.length,
      published,
      totalDownloads,
      totalViews,
      gatedResources
    };
  }, [resources]);

  // Handle resource deletion
  const handleDelete = async (resourceId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      setResources(resources.filter(r => r.id !== resourceId));
      toast.success('Resource deleted successfully');
    } catch (error) {
            toast.error('Failed to delete resource');
    } finally {
      setLoading(false);
      setDeleteResourceId(null);
    }
  };

  // Toggle resource status
  const toggleResourceStatus = async (resource: Resource) => {
    setLoading(true);
    try {
      const newStatus = resource.status === 'published' ? 'draft' : 'published';
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'published' && !resource.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('resources')
        .update(updateData)
        .eq('id', resource.id);

      if (error) throw error;

      setResources(resources.map(r => 
        r.id === resource.id 
          ? { ...r, status: newStatus, published_at: updateData.published_at || r.published_at }
          : r
      ));
      
      toast.success(`Resource ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch (error) {
            toast.error('Failed to update resource status');
    } finally {
      setLoading(false);
    }
  };

  // Get resource type icon
  const getResourceIcon = (type: string) => {
    const resourceType = resourceTypes.find(t => t.value === type);
    return resourceType?.icon || FileText;
  };

  // Get resource type label
  const getResourceLabel = (type: string) => {
    const resourceType = resourceTypes.find(t => t.value === type);
    return resourceType?.label || type;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDownloads.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews > 0 
                ? ((stats.totalDownloads / stats.totalViews) * 100).toFixed(1)
                : '0'
              }%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gated Content</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gatedResources}</div>
            <p className="text-xs text-muted-foreground">
              Lead capture enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {resourceTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/admin/resources/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Link>
          </Button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500 mb-4">
                Add your first resource to start building your content library
              </p>
              <Button asChild>
                <Link href="/admin/resources/new">
                  Add First Resource
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => {
            const Icon = getResourceIcon(resource.resource_type);
            
            return (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                {resource.thumbnail?.file_url ? (
                  <div className="h-48 bg-gray-100 relative">
                    <img
                      src={resource.thumbnail.file_url}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-white/90">
                        {getResourceLabel(resource.resource_type)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    {resource.is_gated ? (
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {resource.download_count} downloads
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {resource.view_count} views
                    </div>
                    {resource.file_size_display && (
                      <div>{resource.file_size_display}</div>
                    )}
                  </div>

                  {/* Tags */}
                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge 
                      variant="secondary"
                      className={
                        resource.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {resource.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/resources/${resource.id}/edit`}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/resources/${resource.id}/analytics`}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => resource.file?.file_url && window.open(resource.file.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => toggleResourceStatus(resource)}
                        >
                          {resource.status === 'published' ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteResourceId(resource.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResourceId} onOpenChange={() => setDeleteResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteResourceId && handleDelete(deleteResourceId)}
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


