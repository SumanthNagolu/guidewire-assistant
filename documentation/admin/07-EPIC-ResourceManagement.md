# EPIC 7: Resource Management

**Epic ID**: ADMIN-EPIC-07  
**Epic Name**: Downloadable Resources Library  
**Priority**: P1 (High - Lead Generation)  
**Estimated Stories**: 18  
**Estimated Effort**: 5-6 days  
**Command**: `/admin-07-resources`

---

## Epic Overview

### Goal
Complete resource management system for whitepapers, guides, ebooks, and other downloadable content with lead capture (gating) capabilities.

### Business Value
- Lead generation through gated content
- Professional resource library for visitors
- Download tracking and analytics
- SEO benefits from quality content
- Thought leadership positioning

### Technical Scope
- Resource CRUD operations
- File upload and management
- Gating system with form requirements
- Download tracking
- View count analytics
- Category and tag organization
- SEO metadata
- PDF preview generation
- Resource recommendations

### Dependencies
- Epic 1 (Authentication) completed
- Epic 11 (Media Library) for file storage
- `resources` table created
- Lead capture system

---

## User Stories

### Story RES-001: Resource List Page

**As a**: Admin  
**I want**: Overview of all downloadable resources  
**So that**: I can manage the resource library

#### Acceptance Criteria
- [ ] Page renders at `/admin/resources`
- [ ] Stats cards: Total, Published, Downloads, Gated Resources
- [ ] Filter by: Type, Category, Status
- [ ] Search by title/description
- [ ] Grid and list view toggle
- [ ] [+ New Resource] button
- [ ] Actions menu per resource

#### Technical Implementation

**Files to Modify**:
```
app/admin/resources/page.tsx (enhance existing)
components/admin/resources/ResourceManagement.tsx (enhance existing)
```

**Page Structure**:
```typescript
export default async function ResourcesPage() {
  const supabase = await createClient();
  
  const { data: resources } = await supabase
    .from('resources')
    .select(`
      *,
      file:media_assets!file_id(*),
      thumbnail:media_assets!thumbnail_id(*)
    `)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-gray-500 mt-1">Manage downloadable resources</p>
        </div>
        <Button asChild>
          <Link href="/admin/resources/new">
            <Plus className="mr-2 h-4 w-4" />
            New Resource
          </Link>
        </Button>
      </div>
      
      <ResourceManagement initialResources={resources || []} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Page loads correctly
- [ ] Stats calculate accurately
- [ ] Filters work
- [ ] Search functional
- [ ] Views toggle
- [ ] New resource button works

---

### Story RES-002: Resource Type Classification

**As a**: Admin  
**I want**: Categorize resources by type  
**So that**: Users can find relevant content

#### Acceptance Criteria
- [ ] Type dropdown in editor: Whitepaper, Case Study, Guide, Ebook, Template, Webinar, Other
- [ ] Each type has unique icon
- [ ] Type shown in resource cards/list
- [ ] Filter by type works
- [ ] Type affects display styling
- [ ] Type validation required

#### Technical Implementation

**Type Config**:
```typescript
const resourceTypes = {
  whitepaper: {
    label: 'Whitepaper',
    icon: FileText,
    color: 'blue',
  },
  case_study: {
    label: 'Case Study',
    icon: BookOpen,
    color: 'purple',
  },
  guide: {
    label: 'Guide',
    icon: FileCheck,
    color: 'green',
  },
  ebook: {
    label: 'Ebook',
    icon: Book,
    color: 'orange',
  },
  template: {
    label: 'Template',
    icon: FileCode,
    color: 'teal',
  },
  webinar: {
    label: 'Webinar',
    icon: Video,
    color: 'red',
  },
  other: {
    label: 'Other',
    icon: File,
    color: 'gray',
  },
};

function ResourceTypeIcon({ type }: { type: string }) {
  const config = resourceTypes[type] || resourceTypes.other;
  const Icon = config.icon;
  
  return (
    <div className={`w-12 h-12 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
      <Icon className={`w-6 h-6 text-${config.color}-600`} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] All types available
- [ ] Icons display correctly
- [ ] Colors correct
- [ ] Filter works
- [ ] Validation enforced

---

### Story RES-003: Resource Gating System

**As a**: Marketing manager  
**I want**: Require form submission before download  
**So that**: I can capture leads

#### Acceptance Criteria
- [ ] "Is Gated" toggle in resource editor
- [ ] Required fields selector (if gated)
- [ ] Options: Name, Email, Company, Phone, Job Title, Industry
- [ ] Gated badge shown in resource list
- [ ] Lock icon on gated resources
- [ ] Lead capture form on public page
- [ ] Submissions stored in database
- [ ] Submission email sent to admin

#### Technical Implementation

**Gating Component**:
```typescript
function ResourceGatingSettings({ resource, onChange }: GatingSettingsProps) {
  const availableFields = [
    { id: 'name', label: 'Full Name', description: 'First and last name' },
    { id: 'email', label: 'Email', description: 'Required for all gated resources' },
    { id: 'company', label: 'Company', description: 'Organization name' },
    { id: 'phone', label: 'Phone Number', description: 'Contact number' },
    { id: 'job_title', label: 'Job Title', description: 'Professional role' },
    { id: 'industry', label: 'Industry', description: 'Business sector' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Capture Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="is-gated"
            checked={resource.is_gated}
            onCheckedChange={(checked) => onChange({ ...resource, is_gated: checked })}
          />
          <label htmlFor="is-gated" className="text-sm cursor-pointer">
            Require form submission before download (Gated Resource)
          </label>
        </div>
        
        {resource.is_gated && (
          <div>
            <label className="text-sm font-medium">Required Fields</label>
            <p className="text-xs text-gray-500 mb-2">
              Select which fields users must provide
            </p>
            <div className="space-y-2">
              {availableFields.map(field => (
                <div key={field.id} className="flex items-start gap-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={resource.required_fields?.includes(field.id)}
                    onCheckedChange={(checked) => {
                      const current = resource.required_fields || [];
                      const updated = checked
                        ? [...current, field.id]
                        : current.filter(f => f !== field.id);
                      onChange({ ...resource, required_fields: updated });
                    }}
                    disabled={field.id === 'email'} // Email always required
                  />
                  <div>
                    <label htmlFor={`field-${field.id}`} className="text-sm cursor-pointer font-medium">
                      {field.label} {field.id === 'email' && '(Required)'}
                    </label>
                    <p className="text-xs text-gray-500">{field.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {resource.is_gated && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-900">
              ℹ️ Gated resources generate leads. All submissions will be captured in the Leads database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Toggle works
- [ ] Field selection works
- [ ] Email always required
- [ ] Saves correctly
- [ ] Badge displays
- [ ] Lead capture works

---

### Story RES-004: Download Tracking

**As a**: Marketing analytics  
**I want**: Track all resource downloads  
**So that**: I can measure content performance

#### Acceptance Criteria
- [ ] Download count increments on each download
- [ ] Track: user_id (if logged in), IP address, timestamp, resource_id
- [ ] View count separate from download count
- [ ] Unique downloads vs total downloads
- [ ] Download history per resource
- [ ] Export download data
- [ ] Analytics dashboard integration

#### Technical Implementation

**Download Tracking**:
```typescript
// app/api/resources/[id]/download/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Increment download count
  const { error: updateError } = await supabase
    .from('resources')
    .update({ download_count: supabase.rpc('increment') })
    .eq('id', params.id);
  
  // Log download
  await supabase.from('resource_downloads').insert({
    resource_id: params.id,
    user_id: user?.id,
    ip_address: request.headers.get('x-forwarded-for'),
    downloaded_at: new Date().toISOString(),
  });
  
  // Return file URL
  const { data: resource } = await supabase
    .from('resources')
    .select('file:media_assets!file_id(file_url)')
    .eq('id', params.id)
    .single();
  
  return NextResponse.json({ url: resource.file.file_url });
}
```

#### Testing Checklist
- [ ] Count increments
- [ ] Download logged
- [ ] User tracked if logged in
- [ ] IP captured
- [ ] Timestamp correct
- [ ] Analytics updated

---

### Story RES-005: Resource Grid View

**As a**: Admin  
**I want**: Visual grid of resources  
**So that**: I can browse content visually

#### Acceptance Criteria
- [ ] Grid layout (3-4 columns)
- [ ] Each card shows: Icon, Title, Type, Category, Stats
- [ ] Thumbnail preview if available
- [ ] Download count displayed
- [ ] View count displayed
- [ ] Gated badge if applicable
- [ ] Status badge (draft/published)
- [ ] Hover effects
- [ ] Actions dropdown

#### Technical Implementation

**Component**:
```typescript
function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resources.map(resource => (
        <Card key={resource.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            {resource.thumbnail ? (
              <div className="aspect-video rounded overflow-hidden mb-3">
                <Image
                  src={resource.thumbnail.file_url}
                  alt={resource.title}
                  width={300}
                  height={169}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 mb-3">
                <ResourceTypeIcon type={resource.resource_type} />
              </div>
            )}
            
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {resource.title}
            </h3>
            
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary">{resource.category}</Badge>
              {resource.is_gated && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Gated
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {resource.download_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {resource.view_count}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/admin/resources/${resource.id}/edit`}>
                  Edit
                </Link>
              </Button>
              <ResourceActionsMenu resource={resource} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Grid renders correctly
- [ ] Cards display all info
- [ ] Thumbnails load
- [ ] Icons show
- [ ] Badges correct
- [ ] Stats display
- [ ] Hover effects work
- [ ] Actions functional

---

### Story RES-006: Resource Editor Form

**As a**: Admin  
**I want**: Complete form to create/edit resources  
**So that**: I can add resources to library

#### Acceptance Criteria
- [ ] All resource fields editable
- [ ] File upload for primary resource
- [ ] Optional thumbnail upload
- [ ] Title, description, category fields
- [ ] Resource type dropdown
- [ ] Industry multi-select
- [ ] Tags input
- [ ] Gating configuration
- [ ] SEO metadata
- [ ] Save draft and publish options

#### Technical Implementation

**Component Structure**:
```typescript
function ResourceEditor({ resource }: { resource?: Resource }) {
  const [formData, setFormData] = useState(resource || getDefaultResource());
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      const data = {
        ...formData,
        status,
        slug: generateSlug(formData.title),
        published_at: status === 'published' ? new Date().toISOString() : null,
      };
      
      if (resource?.id) {
        await supabase.from('resources').update(data).eq('id', resource.id);
      } else {
        await supabase.from('resources').insert(data);
      }
      
      toast.success(`Resource ${status === 'published' ? 'published' : 'saved'}`);
      router.push('/admin/resources');
    } catch (err) {
      toast.error('Failed to save resource');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
          
          <Select
            label="Resource Type *"
            value={formData.resource_type}
            onValueChange={(v) => setFormData({ ...formData, resource_type: v })}
          >
            <SelectItem value="whitepaper">Whitepaper</SelectItem>
            <SelectItem value="case_study">Case Study</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="ebook">Ebook</SelectItem>
            <SelectItem value="template">Template</SelectItem>
          </Select>
          
          <FileUploadField
            label="Resource File *"
            value={formData.file_id}
            onChange={(id) => setFormData({ ...formData, file_id: id })}
            accept=".pdf,.doc,.docx"
            required
          />
        </CardContent>
      </Card>
      
      <ResourceGatingSettings
        resource={formData}
        onChange={setFormData}
      />
      
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/resources">Cancel</Link>
        </Button>
        <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={isLoading}>
          Save Draft
        </Button>
        <Button onClick={() => handleSubmit('published')} disabled={isLoading}>
          Publish
        </Button>
      </div>
    </form>
  );
}
```

#### Testing Checklist
- [ ] Form renders all fields
- [ ] File upload works
- [ ] Validation enforced
- [ ] Save draft works
- [ ] Publish works
- [ ] Redirect correct

---

### Story RES-007: PDF Preview Generation

**As a**: System  
**I want**: Auto-generate thumbnail from PDF first page  
**So that**: Resources have visual previews

#### Acceptance Criteria
- [ ] Thumbnail generated on PDF upload
- [ ] First page converted to image (PNG/JPG)
- [ ] Thumbnail saved to media library
- [ ] Thumbnail linked to resource
- [ ] Fallback icon if generation fails
- [ ] Progress indicator during generation
- [ ] Manual thumbnail upload option

#### Technical Implementation

**PDF Processing**:
```typescript
// app/api/resources/generate-thumbnail/route.ts
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: Request) {
  const { fileId } = await request.json();
  
  try {
    const supabase = await createClient();
    
    // Get PDF file
    const { data: file } = await supabase
      .from('media_assets')
      .select('file_url')
      .eq('id', fileId)
      .single();
    
    // Fetch PDF
    const response = await fetch(file.file_url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Load PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const firstPage = pdfDoc.getPage(0);
    
    // Render to image (simplified - actual implementation more complex)
    const { width, height } = firstPage.getSize();
    // ... rendering logic ...
    
    // Upload thumbnail
    const { data: thumbnail } = await supabase.storage
      .from('media')
      .upload(`thumbnails/${fileId}.png`, imageBuffer);
    
    return NextResponse.json({ thumbnailUrl: thumbnail.path });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 });
  }
}
```

#### Testing Checklist
- [ ] Thumbnail generates
- [ ] Quality acceptable
- [ ] Saves to media library
- [ ] Links to resource
- [ ] Fallback works
- [ ] Error handling works

---

### Story RES-008: Resource Download Analytics

**As a**: Admin  
**I want**: Detailed download analytics per resource  
**So that**: I can measure content effectiveness

#### Acceptance Criteria
- [ ] Analytics tab in resource detail view
- [ ] Chart showing downloads over time
- [ ] Breakdown by: Date, User type (logged in vs anonymous), Industry
- [ ] Top referrers (where downloads came from)
- [ ] Conversion rate (views to downloads)
- [ ] Export analytics data
- [ ] Date range filter

#### Technical Implementation

**Component**:
```typescript
function ResourceAnalytics({ resourceId }: { resourceId: string }) {
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  
  useEffect(() => {
    async function loadAnalytics() {
      const supabase = createClient();
      
      const { data } = await supabase
        .from('resource_downloads')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('downloaded_at', getDateRangeStart(dateRange));
      
      const processed = processAnalytics(data || []);
      setAnalytics(processed);
    }
    loadAnalytics();
  }, [resourceId, dateRange]);
  
  if (!analytics) return <Skeleton className="h-64" />;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resource Analytics</h3>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalDownloads}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Unique Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.uniqueDownloads}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.downloads} downloads / {analytics.views} views
            </p>
          </CardContent>
        </Card>
      </div>
      
      <DownloadChart data={analytics.chartData} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Analytics load correctly
- [ ] Charts render
- [ ] Date filters work
- [ ] Calculations accurate
- [ ] Export works

---

### Story RES-009 through RES-018 (Summary)

Additional stories for Resource Management:

- **RES-009**: Resource Category System
- **RES-010**: Industry Tags Multi-Select
- **RES-011**: Resource Status Workflow
- **RES-012**: Resource Preview/View
- **RES-013**: Resource Duplication
- **RES-014**: Resource Archiving
- **RES-015**: Resource Recommendations Engine
- **RES-016**: File Size and Page Count Display
- **RES-017**: Resource Version Management
- **RES-018**: Lead Export from Gated Resources

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 18 stories implemented
- [ ] Resource CRUD complete
- [ ] Gating system functional
- [ ] Download tracking working
- [ ] Analytics comprehensive

### Business Requirements
- [ ] Lead capture operational
- [ ] Download tracking accurate
- [ ] SEO optimized
- [ ] File management secure

### Quality Requirements
- [ ] TypeScript strict passing
- [ ] File upload secure
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Accessible

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1, Epic 11 (Media) complete  
**Next Epic**: Epic 8 (Job Management)

