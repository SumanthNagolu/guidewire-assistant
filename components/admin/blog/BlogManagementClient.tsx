'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock,
  ChevronDown,
  Tag,
  User,
  MoreVertical,
  Archive,
  FileText,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  view_count: number;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  author: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface BlogManagementClientProps {
  initialPosts: BlogPost[];
}

const categories = [
  'Industry Insights',
  'Technology',
  'Career Development',
  'Best Practices',
  'Case Studies',
  'Company News',
  'Immigration',
  'Consulting'
];

export default function BlogManagementClient({ initialPosts }: BlogManagementClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  // Handle post deletion
  const handleDelete = async (postId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Blog post deleted successfully');
    } catch (error) {
            toast.error('Failed to delete blog post');
    } finally {
      setLoading(false);
      setDeletePostId(null);
    }
  };

  // Handle status change
  const handleStatusChange = async (postId: string, newStatus: BlogPost['status']) => {
    setLoading(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'published' && !posts.find(p => p.id === postId)?.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, status: newStatus, published_at: updateData.published_at || p.published_at }
          : p
      ));
      
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'updated'} successfully`);
    } catch (error) {
            toast.error('Failed to update post status');
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <>
      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search posts by title or tags..."
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
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
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

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first blog post to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button asChild>
                <Link href="/admin/blog/new">
                  Create First Post
                </Link>
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and Status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(post.status)} shrink-0`}
                    >
                      {post.status}
                    </Badge>
                  </div>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author 
                        ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || post.author.email
                        : 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {post.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count.toLocaleString()} views
                    </div>
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Published {formatDate(post.published_at)}
                      </div>
                    )}
                    {post.scheduled_for && post.status === 'scheduled' && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Scheduled for {formatDate(post.scheduled_for)}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-full border border-pink-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-600 hover:text-pink-600"
                  >
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/blog/${post.id}/edit`}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      
                      {post.status === 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(post.id, 'published')}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      
                      {post.status === 'published' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(post.id, 'draft')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(post.id, 'archived')}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeletePostId(post.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletePostId && handleDelete(deletePostId)}
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


