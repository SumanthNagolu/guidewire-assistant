'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Calendar, 
  Eye, 
  Settings,
  Image as ImageIcon,
  Tag,
  X
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaSelector from '@/components/admin/MediaSelector';
import AIAssistantWidget from '@/components/admin/AIAssistantWidget';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featured_image_id?: string;
  featured_image_url?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  scheduled_for?: Date | null;
  enable_comments: boolean;
}

interface BlogEditorProps {
  postId?: string;
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

export default function BlogEditor({ postId }: BlogEditorProps) {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Technology',
    tags: [],
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    enable_comments: true
  });
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Load existing post if editing
  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          featured_image:featured_image_id(
            id,
            file_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      setPost({
        ...data,
        featured_image_url: data.featured_image?.file_url,
        scheduled_for: data.scheduled_for ? new Date(data.scheduled_for) : null
      });
    } catch (error) {
            toast.error('Failed to load blog post');
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }, []);

  // Auto-generate slug when title changes (only for new posts)
  useEffect(() => {
    if (!postId && post.title) {
      setPost(prev => ({ ...prev, slug: generateSlug(post.title) }));
    }
  }, [post.title, postId, generateSlug]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (!post.meta_title && post.title) {
      setPost(prev => ({ ...prev, meta_title: post.title }));
    }
  }, [post.title, post.meta_title]);

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!post.tags.includes(tagInput.trim())) {
        setPost(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  // Handle keyword addition
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!post.meta_keywords.includes(keywordInput.trim())) {
        setPost(prev => ({ ...prev, meta_keywords: [...prev.meta_keywords, keywordInput.trim()] }));
      }
      setKeywordInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Remove keyword
  const removeKeyword = (keywordToRemove: string) => {
    setPost(prev => ({ ...prev, meta_keywords: prev.meta_keywords.filter(kw => kw !== keywordToRemove) }));
  };

  // Handle save
  const handleSave = async (publish: boolean = false) => {
    if (!post.title || !post.slug || !post.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const saveData: any = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        status: publish ? 'published' : post.status,
        featured_image_id: post.featured_image_id,
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || post.excerpt,
        meta_keywords: post.meta_keywords,
        scheduled_for: post.scheduled_for?.toISOString() || null,
        enable_comments: post.enable_comments
      };

      if (publish && !postId) {
        saveData.published_at = new Date().toISOString();
      }

      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = post.content.split(/\s+/).length;
      saveData.read_time_minutes = Math.ceil(wordCount / 200);

      if (postId) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(saveData)
          .eq('id', postId);

        if (error) throw error;

        // Log the update
        await supabase.rpc('log_cms_action', {
          p_action: publish ? 'publish' : 'update',
          p_entity_type: 'blog_post',
          p_entity_id: postId,
          p_entity_title: post.title
        });

        toast.success(publish ? 'Blog post published!' : 'Blog post saved!');
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(saveData)
          .select()
          .single();

        if (error) throw error;

        // Log the creation
        await supabase.rpc('log_cms_action', {
          p_action: 'create',
          p_entity_type: 'blog_post',
          p_entity_id: data.id,
          p_entity_title: post.title
        });

        toast.success(publish ? 'Blog post published!' : 'Blog post created!');
        router.push(`/admin/blog/${data.id}/edit`);
      }
    } catch (error: any) {
            if (error.code === '23505' && error.constraint === 'blog_posts_slug_key') {
        toast.error('A blog post with this slug already exists');
      } else {
        toast.error('Failed to save blog post');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href="/admin/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {postId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <AIAssistantWidget
            contentType="blog"
            onContentGenerated={(content) => setPost({ ...post, content })}
            onSEOGenerated={(seo) => setPost({
              ...post,
              meta_title: seo.metaTitle,
              meta_description: seo.metaDescription,
              meta_keywords: seo.keywords
            })}
            currentContent={post.content}
            currentTitle={post.title}
          />
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
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
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
                    value={post.title}
                    onChange={(e) => setPost({ ...post, title: e.target.value })}
                    placeholder="Enter post title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={post.slug}
                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                    placeholder="post-url-slug"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={post.category}
                    onValueChange={(value) => setPost({ ...post, category: value })}
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
                    {post.tags.map(tag => (
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={post.content}
                onChange={(content) => setPost({ ...post, content })}
                placeholder="Write your blog post content..."
                height="500px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
              <CardDescription>
                Select a featured image for your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.featured_image_url ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={post.featured_image_url}
                    alt="Featured image"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setPost({ ...post, featured_image_id: undefined, featured_image_url: undefined })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => setShowMediaSelector(true)}
                  className="w-full max-w-md h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to select featured image</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={post.meta_title}
                  onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
                  placeholder="Page title for search results..."
                />
                <p className="text-xs text-gray-500">
                  {post.meta_title.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={post.meta_description}
                  onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                  placeholder="Description for search results..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  {post.meta_description.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Meta Keywords</Label>
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Press Enter to add keywords..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.meta_keywords.map(keyword => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comments">Enable Comments</Label>
                  <p className="text-sm text-gray-500">Allow readers to comment on this post</p>
                </div>
                <Switch
                  id="comments"
                  checked={post.enable_comments}
                  onCheckedChange={(checked) => setPost({ ...post, enable_comments: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Publication Status</Label>
                <Select
                  value={post.status}
                  onValueChange={(value: any) => setPost({ ...post, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {post.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label>Schedule Publication</Label>
                  <DateTimePicker
                    value={post.scheduled_for}
                    onChange={(date) => setPost({ ...post, scheduled_for: date })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <MediaSelector
          onSelect={(media) => {
            setPost({ 
              ...post, 
              featured_image_id: media.id, 
              featured_image_url: media.file_url 
            });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
        />
      )}
    </div>
  );
}
