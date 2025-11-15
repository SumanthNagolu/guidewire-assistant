# EPIC 6: Blog Management System

**Epic ID**: ADMIN-EPIC-06  
**Epic Name**: Blog Content Management System  
**Priority**: P1 (High - Public Website)  
**Estimated Stories**: 22  
**Estimated Effort**: 6-7 days  
**Command**: `/admin-06-blog`

---

## Epic Overview

### Goal
Complete blog management system with rich text editor, SEO optimization, scheduling, and publishing workflow for public website content.

### Business Value
- Professional blog for SEO and thought leadership
- Easy content creation for non-technical users
- SEO optimization for organic traffic
- Content scheduling for consistent publishing
- Analytics to track performance

### Technical Scope
- Rich text editor with formatting
- SEO metadata fields (meta title, description, keywords)
- Featured image management
- Category and tag system
- Draft/scheduled/published states
- Version control
- Preview functionality
- Slug generation
- Social media preview

### Dependencies
- Epic 1 (Authentication) completed
- Epic 11 (Media Library) for featured images
- `blog_posts` table created
- `cms_audit_log` for change tracking

---

## User Stories

### Story BLOG-001: Blog List Page

**As a**: Admin  
**I want**: Overview of all blog posts  
**So that**: I can manage content effectively

#### Acceptance Criteria
- [ ] Page renders at `/admin/blog`
- [ ] Stats cards: Total Posts, Published, Drafts, Total Views
- [ ] Filter by status: All, Published, Draft, Scheduled, Archived
- [ ] Filter by category
- [ ] Search by title/content
- [ ] Table view with: Title, Category, Status, Views, Published Date
- [ ] [+ New Post] button top-right
- [ ] Actions menu per post: Edit, Preview, Duplicate, Delete

#### Technical Implementation

**Files to Modify**:
```
app/admin/blog/page.tsx (enhance existing)
components/admin/blog/BlogManagementClient.tsx (enhance existing)
```

**Component Structure**:
```typescript
export default async function BlogPage() {
  const supabase = await createClient();
  
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      tags,
      status,
      view_count,
      published_at,
      created_at,
      featured_image:media_assets!featured_image_id(id, file_url)
    `)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Create and manage blog content</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      <BlogManagementClient initialPosts={posts || []} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Page loads correctly
- [ ] Stats display accurately
- [ ] Filters work
- [ ] Search functional
- [ ] Table renders
- [ ] New post button works

---

### Story BLOG-002: Blog Post Editor - Content Tab

**As a**: Content creator  
**I want**: Rich text editor with formatting options  
**So that**: I can create engaging blog content

#### Acceptance Criteria
- [ ] Page at `/admin/blog/new` and `/admin/blog/[id]/edit`
- [ ] 3 tabs: Content, SEO, Settings
- [ ] Content tab has: Title, Slug, Featured Image, Category, Excerpt, Content
- [ ] Rich text editor with toolbar
- [ ] Toolbar buttons: Bold, Italic, Underline, Headings, Lists, Links, Images, Code
- [ ] Auto-save every 30 seconds
- [ ] Character/word count
- [ ] Preview mode toggle

#### Technical Implementation

**Files to Modify**:
```
app/admin/blog/new/page.tsx (enhance existing)
app/admin/blog/[id]/edit/page.tsx (enhance existing)
components/admin/blog/BlogEditor.tsx (enhance existing)
```

**Editor Component**:
```typescript
function BlogEditorContentTab({ post, onChange }: EditorTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          value={post.title}
          onChange={(e) => onChange({ ...post, title: e.target.value })}
          placeholder="Enter blog post title..."
          className="text-lg"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {post.title.length}/100 characters
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">Slug (URL)</label>
        <Input
          value={post.slug}
          onChange={(e) => onChange({ ...post, slug: e.target.value })}
          placeholder="auto-generated-from-title"
        />
        <p className="text-xs text-blue-600 mt-1">
          URL Preview: /blog/{post.slug}
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">Featured Image</label>
        <FeaturedImageSelector
          imageId={post.featured_image_id}
          onChange={(id) => onChange({ ...post, featured_image_id: id })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select
            value={post.category}
            onValueChange={(v) => onChange({ ...post, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="industry-insights">Industry Insights</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="career-development">Career Development</SelectItem>
              <SelectItem value="best-practices">Best Practices</SelectItem>
              <SelectItem value="case-studies">Case Studies</SelectItem>
              <SelectItem value="company-news">Company News</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Excerpt</label>
        <Textarea
          value={post.excerpt}
          onChange={(e) => onChange({ ...post, excerpt: e.target.value })}
          placeholder="Brief summary for preview and SEO..."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {post.excerpt.length}/500 characters (160 recommended for SEO)
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">Content *</label>
        <RichTextEditor
          content={post.content}
          onChange={(content) => onChange({ ...post, content })}
          placeholder="Write your blog post content here..."
        />
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] All fields render
- [ ] Title input works
- [ ] Slug auto-generates
- [ ] Category dropdown works
- [ ] Rich editor functional
- [ ] Character counts display

---

### Story BLOG-003: Rich Text Editor with Markdown

**As a**: Content creator  
**I want**: Markdown-based editor with preview  
**So that**: I can write formatted content easily

#### Acceptance Criteria
- [ ] Split view: Edit | Preview
- [ ] Markdown syntax highlighting in edit mode
- [ ] Live preview renders markdown
- [ ] Toolbar with quick actions
- [ ] Support: Headers, Bold, Italic, Lists, Links, Images, Code blocks, Quotes
- [ ] Image insert opens media selector
- [ ] Link insert shows dialog
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

#### Technical Implementation

**Component** (Using react-markdown + CodeMirror):
```typescript
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export default function RichTextEditor({ content, onChange }: EditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  
  const toolbar = [
    { icon: Bold, action: () => wrapSelection('**'), label: 'Bold', shortcut: 'Ctrl+B' },
    { icon: Italic, action: () => wrapSelection('*'), label: 'Italic', shortcut: 'Ctrl+I' },
    { icon: List, action: () => insertPrefix('- '), label: 'List' },
    { icon: Link2, action: () => showLinkDialog(), label: 'Link', shortcut: 'Ctrl+K' },
    { icon: Image, action: () => showImagePicker(), label: 'Image' },
    { icon: Code, action: () => wrapSelection('`'), label: 'Code' },
  ];
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
        {toolbar.map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
          >
            <btn.icon className="w-4 h-4 text-gray-600" />
          </button>
        ))}
        
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-sm rounded ${mode === 'edit' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-sm rounded ${mode === 'preview' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
          >
            Preview
          </button>
        </div>
      </div>
      
      {/* Editor/Preview */}
      {mode === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[400px] p-4 font-mono text-sm focus:outline-none resize-y"
          placeholder="Write your blog post content here..."
        />
      ) : (
        <div className="prose max-w-none p-4">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter language={match[1]} PreTag="div">
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-between text-xs text-gray-600">
        <span>Characters: {content.length}</span>
        <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
        <span>Reading time: {Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min</span>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Editor renders
- [ ] Markdown works
- [ ] Preview renders correctly
- [ ] Toolbar buttons functional
- [ ] Keyboard shortcuts work
- [ ] Character counts accurate

---

### Story BLOG-004: Auto-Save Functionality

**As a**: Content creator  
**I want**: Automatic saving of drafts  
**So that**: I don't lose work if browser crashes

#### Acceptance Criteria
- [ ] Auto-saves every 30 seconds
- [ ] Only saves if content changed
- [ ] Shows "Saving..." indicator
- [ ] Shows "Saved" with timestamp after save
- [ ] Manual save button available (Ctrl+S)
- [ ] Saves to draft status automatically
- [ ] Doesn't interfere with manual save/publish

#### Technical Implementation

**Auto-save Hook**:
```typescript
function useAutoSave(data: BlogPost, onSave: (data: BlogPost) => Promise<void>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dataRef = useRef(data);
  
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (JSON.stringify(dataRef.current) === JSON.stringify(data)) {
        return; // No changes
      }
      
      setIsSaving(true);
      try {
        await onSave(dataRef.current);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Keyboard shortcut (Ctrl/Cmd + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(dataRef.current);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return { lastSaved, isSaving };
}

// In BlogEditor component
const { lastSaved, isSaving } = useAutoSave(formData, handleSave);

// Display indicator
{isSaving ? (
  <span className="text-sm text-blue-600">Saving...</span>
) : lastSaved ? (
  <span className="text-sm text-green-600">
    Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
  </span>
) : null}
```

#### Testing Checklist
- [ ] Auto-save works
- [ ] Interval correct
- [ ] Only saves on changes
- [ ] Indicator updates
- [ ] Keyboard shortcut works
- [ ] Doesn't block UI

---

### Story BLOG-005: SEO Metadata Tab

**As a**: Content marketer  
**I want**: SEO optimization fields  
**So that**: Blog posts rank well in search

#### Acceptance Criteria
- [ ] SEO tab in blog editor
- [ ] Meta title field (max 60 chars)
- [ ] Meta description field (max 160 chars)
- [ ] Focus keyword field
- [ ] Additional keywords (tag input)
- [ ] Character counters with color coding
- [ ] SEO preview (how it appears in Google)
- [ ] Auto-fill from title/excerpt
- [ ] Validation warnings

#### Technical Implementation

**Component**:
```typescript
function SEOTab({ post, onChange }: SEOTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Engine Optimization</CardTitle>
          <CardDescription>
            Optimize your post for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Meta Title</label>
            <Input
              value={post.meta_title || post.title}
              onChange={(e) => onChange({ ...post, meta_title: e.target.value })}
              maxLength={60}
            />
            <CharacterCounter
              current={post.meta_title?.length || 0}
              max={60}
              optimal={{ min: 50, max: 60 }}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Meta Description</label>
            <Textarea
              value={post.meta_description || post.excerpt}
              onChange={(e) => onChange({ ...post, meta_description: e.target.value })}
              maxLength={160}
              rows={3}
            />
            <CharacterCounter
              current={post.meta_description?.length || 0}
              max={160}
              optimal={{ min: 150, max: 160 }}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Focus Keyword</label>
            <Input
              value={post.focus_keyword || ''}
              onChange={(e) => onChange({ ...post, focus_keyword: e.target.value })}
              placeholder="main keyword for this post"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Additional Keywords</label>
            <TagInput
              tags={post.meta_keywords || []}
              onChange={(keywords) => onChange({ ...post, meta_keywords: keywords })}
              placeholder="Add keyword..."
            />
          </div>
        </CardContent>
      </Card>
      
      <SEOPreview
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        url={`/blog/${post.slug}`}
      />
    </div>
  );
}

function SEOPreview({ title, description, url }: SEOPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Preview</CardTitle>
        <CardDescription>How your post appears in Google</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-gray-200 rounded p-4">
          <h3 className="text-blue-600 text-lg hover:underline cursor-pointer">
            {title}
          </h3>
          <p className="text-green-700 text-sm mt-1">
            https://intimesolutions.com{url}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] All SEO fields work
- [ ] Character counters accurate
- [ ] Color coding correct
- [ ] Preview renders correctly
- [ ] Auto-fill works
- [ ] Saves with post

---

### Story BLOG-006: Blog Post Settings Tab

**As a**: Admin  
**I want**: Configure post settings and scheduling  
**So that**: I control visibility and publishing

#### Acceptance Criteria
- [ ] Settings tab in blog editor
- [ ] Status radio buttons: Draft, Scheduled, Published, Archived
- [ ] Publish date/time picker (if scheduled)
- [ ] Tags input (multi-value)
- [ ] Author dropdown (override default)
- [ ] Enable comments checkbox
- [ ] SEO index checkbox (noindex option)
- [ ] Settings save with post

#### Technical Implementation

**Component**:
```typescript
function SettingsTab({ post, onChange }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <RadioGroup
              value={post.status}
              onValueChange={(v) => onChange({ ...post, status: v })}
            >
              <div className="space-y-2">
                <RadioGroupItem value="draft" label="Draft" description="Not visible to public" />
                <RadioGroupItem value="scheduled" label="Scheduled" description="Publish at specific time" />
                <RadioGroupItem value="published" label="Published" description="Live on website" />
                <RadioGroupItem value="archived" label="Archived" description="Hidden from public" />
              </div>
            </RadioGroup>
          </div>
          
          {post.status === 'scheduled' && (
            <div>
              <label className="text-sm font-medium">Publish Date & Time</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={post.scheduled_for?.split('T')[0] || ''}
                  onChange={(e) => onChange({ 
                    ...post, 
                    scheduled_for: `${e.target.value}T${post.scheduled_for?.split('T')[1] || '09:00:00'}` 
                  })}
                />
                <Input
                  type="time"
                  value={post.scheduled_for?.split('T')[1]?.slice(0, 5) || '09:00'}
                  onChange={(e) => onChange({ 
                    ...post, 
                    scheduled_for: `${post.scheduled_for?.split('T')[0]}T${e.target.value}:00` 
                  })}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium">Tags</label>
            <TagInput
              tags={post.tags || []}
              onChange={(tags) => onChange({ ...post, tags })}
              placeholder="Add tag..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use tags to categorize and improve discoverability
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="enable-comments"
              checked={post.enable_comments}
              onCheckedChange={(checked) => onChange({ ...post, enable_comments: checked })}
            />
            <label htmlFor="enable-comments" className="text-sm cursor-pointer">
              Enable comments on this post
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Status selection works
- [ ] Scheduled date picker works
- [ ] Tags input functional
- [ ] Checkboxes toggle
- [ ] All settings save

---

### Story BLOG-007: Slug Auto-Generation

**As a**: Content creator  
**I want**: Automatic URL slug from title  
**So that**: I don't have to manually create URLs

#### Acceptance Criteria
- [ ] Slug auto-generates when title changes (new posts)
- [ ] Slug can be manually edited
- [ ] Slug validation: lowercase, hyphens only, no special chars
- [ ] Duplicate slug detection
- [ ] Warning if slug changed on published post
- [ ] URL preview updates in real-time
- [ ] Slug saved with post

#### Technical Implementation

**Slug Generation**:
```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-+|-+$/g, ''); // Trim hyphens
}

function SlugField({ post, onChange, isNew }: SlugFieldProps) {
  const [isManual, setIsManual] = useState(!isNew);
  
  useEffect(() => {
    if (isNew && !isManual && post.title) {
      onChange({ ...post, slug: generateSlug(post.title) });
    }
  }, [post.title, isNew, isManual]);
  
  return (
    <div>
      <label className="text-sm font-medium">Slug (URL)</label>
      <div className="flex gap-2">
        <Input
          value={post.slug}
          onChange={(e) => {
            setIsManual(true);
            onChange({ ...post, slug: generateSlug(e.target.value) });
          }}
          placeholder="auto-generated-from-title"
        />
        {isManual && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsManual(false);
              onChange({ ...post, slug: generateSlug(post.title) });
            }}
          >
            Auto
          </Button>
        )}
      </div>
      <p className="text-xs text-blue-600 mt-1">
        URL: /blog/{post.slug}
      </p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Auto-generation works
- [ ] Manual edit works
- [ ] Validation enforced
- [ ] URL preview correct
- [ ] Duplicate detection works

---

### Story BLOG-008: Featured Image Selector

**As a**: Content creator  
**I want**: Select featured image from media library  
**So that**: Posts have attractive visuals

#### Acceptance Criteria
- [ ] Click placeholder opens media selector
- [ ] Media selector shows image library
- [ ] Can upload new image
- [ ] Selected image shows preview
- [ ] Image dimensions displayed
- [ ] Change image button
- [ ] Remove image button
- [ ] Recommended size shown (1200x630)
- [ ] Optimal aspect ratio enforced (16:9)

#### Technical Implementation

**Component**:
```typescript
function FeaturedImageSelector({ imageId, onChange }: ImageSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaAsset | null>(null);
  
  useEffect(() => {
    if (imageId) {
      loadImage(imageId);
    }
  }, [imageId]);
  
  return (
    <div>
      {selectedImage ? (
        <div className="space-y-2">
          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={selectedImage.file_url}
              alt="Featured image"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedImage.width}×{selectedImage.height} • {formatBytes(selectedImage.file_size)}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowSelector(true)}>
                Change
              </Button>
              <Button size="sm" variant="outline" onClick={() => onChange(null)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSelector(true)}
          className="w-full max-w-md aspect-video border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <div className="text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Select Featured Image</p>
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200×630px</p>
          </div>
        </button>
      )}
      
      <MediaSelectorDialog
        open={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={(image) => {
          onChange(image.id);
          setSelectedImage(image);
          setShowSelector(false);
        }}
        filter={{ type: 'image' }}
      />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Placeholder displays
- [ ] Selector opens
- [ ] Image selection works
- [ ] Preview shows
- [ ] Change/remove works
- [ ] Dimensions display

---

### Story BLOG-009: Save Draft Action

**As a**: Content creator  
**I want**: Save work-in-progress as draft  
**So that**: I can continue later

#### Acceptance Criteria
- [ ] [Save Draft] button in header
- [ ] Keyboard shortcut: Ctrl+S
- [ ] Validates required fields (title, content)
- [ ] Saves with status='draft'
- [ ] Shows loading state
- [ ] Success toast notification
- [ ] Stays on edit page (doesn't redirect)
- [ ] Updates URL if new post (adds ID)
- [ ] Audit log created

#### Technical Implementation

**Action**:
```typescript
async function saveDraft(post: BlogPost) {
  // Validation
  if (!post.title || !post.content) {
    toast.error('Title and content are required');
    return { success: false };
  }
  
  const supabase = createClient();
  
  try {
    if (post.id) {
      // Update existing
      const { error } = await supabase
        .from('blog_posts')
        .update({
          ...post,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);
      
      if (error) throw error;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          status: 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update URL with new ID
      window.history.replaceState(null, '', `/admin/blog/${data.id}/edit`);
      return { success: true, id: data.id };
    }
    
    toast.success('Draft saved');
    return { success: true };
  } catch (err) {
    toast.error('Failed to save draft');
    return { success: false };
  }
}
```

#### Testing Checklist
- [ ] Save works for new posts
- [ ] Save works for existing posts
- [ ] Validation enforced
- [ ] Loading state shows
- [ ] Toast appears
- [ ] URL updates
- [ ] Audit log created

---

### Story BLOG-010: Publish Post Action

**As a**: Content creator  
**I want**: Publish blog posts to make them live  
**So that**: Content appears on public website

#### Acceptance Criteria
- [ ] [Publish] button with dropdown
- [ ] Options: Publish Now, Schedule for Later
- [ ] Publish Now validates all recommended fields
- [ ] Shows checklist if missing recommended fields
- [ ] Option to publish anyway
- [ ] Sets status='published'
- [ ] Sets published_at timestamp
- [ ] Redirects to blog list
- [ ] Success toast notification
- [ ] Audit log created

#### Technical Implementation

**Publish Dialog**:
```typescript
function PublishDialog({ post, open, onClose }: PublishDialogProps) {
  const validationChecks = {
    title: !!post.title,
    content: !!post.content && post.content.length >= 300,
    excerpt: !!post.excerpt,
    featuredImage: !!post.featured_image_id,
    category: !!post.category,
    metaTitle: !!post.meta_title,
    metaDescription: !!post.meta_description,
  };
  
  const allRequired = validationChecks.title && validationChecks.content;
  const allRecommended = Object.values(validationChecks).every(Boolean);
  
  const handlePublish = async () => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', post.id);
    
    if (error) {
      toast.error('Failed to publish post');
      return;
    }
    
    toast.success('Blog post published!');
    router.push('/admin/blog');
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish Blog Post?</AlertDialogTitle>
          <AlertDialogDescription>
            {allRecommended ? (
              'This post is ready to publish. It will be visible on your website immediately.'
            ) : (
              'This post is missing some recommended fields. You can still publish, but it may not perform as well in search results.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 my-4">
          <ChecklistItem checked={validationChecks.title} label="Title" required />
          <ChecklistItem checked={validationChecks.content} label="Content (min 300 chars)" required />
          <ChecklistItem checked={validationChecks.excerpt} label="Excerpt" />
          <ChecklistItem checked={validationChecks.featuredImage} label="Featured image" />
          <ChecklistItem checked={validationChecks.category} label="Category" required />
          <ChecklistItem checked={validationChecks.metaTitle} label="Meta title" />
          <ChecklistItem checked={validationChecks.metaDescription} label="Meta description" />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePublish} disabled={!allRequired}>
            {allRecommended ? 'Publish' : 'Publish Anyway'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### Testing Checklist
- [ ] Validation works
- [ ] Checklist displays
- [ ] Publish updates status
- [ ] Timestamp set
- [ ] Redirect works
- [ ] Toast appears

---

## Additional Stories (BLOG-011 through BLOG-022)

Due to space constraints, here are the remaining 12 stories in summary:

- **BLOG-011**: Schedule Post for Future Publication
- **BLOG-012**: Blog Post Preview Functionality
- **BLOG-013**: Category Management
- **BLOG-014**: Tag Auto-complete System
- **BLOG-015**: Blog Post Duplication
- **BLOG-016**: Blog Post Archiving
- **BLOG-017**: Blog Post Analytics (Views, Engagement)
- **BLOG-018**: Related Posts Suggestion
- **BLOG-019**: Blog Post Export (PDF, Markdown)
- **BLOG-020**: Blog Post Version History
- **BLOG-021**: Blog Post Comments Moderation
- **BLOG-022**: Social Media Preview Cards

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 22 stories implemented
- [ ] Blog CRUD complete
- [ ] Rich editor fully functional
- [ ] SEO optimization working
- [ ] Publishing workflow complete
- [ ] Analytics tracking enabled

### Content Requirements
- [ ] Can create blog posts
- [ ] Can schedule posts
- [ ] Can preview before publish
- [ ] Can edit published posts
- [ ] Can archive old posts

### Quality Requirements
- [ ] TypeScript strict passing
- [ ] SEO best practices followed
- [ ] Accessibility compliant
- [ ] Mobile responsive
- [ ] Performance optimized

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1, Epic 11 (Media) complete  
**Next Epic**: Epic 7 (Resource Management)

