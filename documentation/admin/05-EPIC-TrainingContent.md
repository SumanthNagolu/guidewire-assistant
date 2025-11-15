# EPIC 5: Training Content Management

**Epic ID**: ADMIN-EPIC-05  
**Epic Name**: Training Topics & Content  
**Priority**: P1 (High)  
**Estimated Stories**: 16  
**Estimated Effort**: 5-6 days  
**Command**: `/admin-05-training`

---

## Epic Overview

### Goal
Complete training topic management system allowing admins to create, organize, and manage learning content across all Guidewire products.

### Business Value
- Structured learning content organization
- Sequential learning enforcement
- Multi-product course support
- Content reusability and management
- Student progress tracking foundation

### Technical Scope
- Topic CRUD operations
- Product-based organization (ClaimCenter, PolicyCenter, etc.)
- Prerequisites management
- Difficulty level classification
- Duration tracking
- Learning objectives
- Position/sequencing
- Bulk topic upload
- Topic content attachment

### Dependencies
- Epic 1 (Authentication) completed
- `topics` table created with all fields
- `products` reference data exists

---

## User Stories

### Story TRAIN-001: Topic List Page Layout

**As a**: Admin  
**I want**: Organized view of all training topics  
**So that**: I can manage learning content effectively

#### Acceptance Criteria
- [ ] Page renders at `/admin/training-content/topics`
- [ ] Page title: "Topic Management"
- [ ] Subtitle: "Manage topics across all Guidewire products"
- [ ] [+ Add Topic] button (currently disabled, future)
- [ ] Topics grouped by product
- [ ] Each product section collapsible
- [ ] Topic count shown per product
- [ ] Bulk upload section at top

#### Technical Implementation

**Files to Modify**:
```
app/admin/training-content/topics/page.tsx (enhance existing)
components/admin/training/TopicManagement.tsx (create)
```

**Page Structure**:
```typescript
export default async function TopicsPage() {
  const supabase = await createClient();
  
  // Fetch all topics grouped by product
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('product_code')
    .order('position');
  
  // Group by product
  const topicsByProduct = topics?.reduce((acc, topic) => {
    const product = topic.product_code;
    if (!acc[product]) acc[product] = [];
    acc[product].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topic Management</h1>
          <p className="text-gray-500 mt-1">
            Manage topics across all Guidewire products
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>
      
      <BulkUploadSection />
      
      {Object.entries(topicsByProduct || {}).map(([product, topics]) => (
        <ProductTopicsSection key={product} product={product} topics={topics} />
      ))}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Page loads correctly
- [ ] Topics grouped properly
- [ ] Layout responsive
- [ ] Add button shows (disabled)

---

### Story TRAIN-002: Bulk Topic Upload Component

**As a**: Admin  
**I want**: Upload multiple topics from JSON file  
**So that**: I can populate content efficiently

#### Acceptance Criteria
- [ ] File input accepts .json files
- [ ] JSON schema example displayed
- [ ] Validation of uploaded JSON structure
- [ ] Preview of topics before import
- [ ] Duplicate detection (by title or position)
- [ ] Progress bar during upload
- [ ] Success count shown
- [ ] Failed uploads reported with reasons
- [ ] Created topics appear in lists immediately

#### Technical Implementation

**Component**:
```typescript
function BulkTopicUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Topic[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate structure
      const validated = validateTopicsJSON(json);
      setPreview(validated);
      setFile(file);
    } catch (err) {
      toast.error('Invalid JSON file');
    }
  };
  
  const handleUpload = async () => {
    if (!preview) return;
    
    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('topics')
        .insert(preview)
        .select();
      
      if (error) throw error;
      
      toast.success(`Uploaded ${data.length} topics successfully`);
      router.refresh();
      setFile(null);
      setPreview(null);
    } catch (err) {
      toast.error('Failed to upload topics');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Topics</CardTitle>
        <CardDescription>
          Import ClaimCenter topics from JSON or seed via CLI for large batches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
          />
        </div>
        
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Ready to upload {preview.length} topics
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              {preview.slice(0, 5).map((topic, i) => (
                <li key={i}>• {topic.title}</li>
              ))}
              {preview.length > 5 && <li>... and {preview.length - 5} more</li>}
            </ul>
            <Button className="mt-4" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Topics'}
            </Button>
          </div>
        )}
        
        <details>
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            View JSON Schema Example
          </summary>
          <pre className="mt-2 bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
            {JSON.stringify({
              product_code: "CC",
              position: 1,
              title: "Topic title",
              description: "Summary",
              duration_minutes: 30,
              difficulty: "beginner",
              prerequisites: ["topic-id"],
              learning_objectives: ["Objective 1", "Objective 2"]
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] File selection works
- [ ] JSON validation works
- [ ] Preview displays
- [ ] Upload creates topics
- [ ] Error handling works
- [ ] Schema example helpful

---

### Story TRAIN-003: Product Topics Section

**As a**: Admin  
**I want**: Topics organized by product  
**So that**: I can manage product-specific content

#### Acceptance Criteria
- [ ] Section per product (CC, PC, BC, etc.)
- [ ] Product header with count badge
- [ ] Topics listed in position order
- [ ] Each topic shows: Position, Title, Duration, Difficulty
- [ ] Edit button per topic
- [ ] Expand/collapse functionality
- [ ] Empty state if no topics for product

#### Technical Implementation

**Component**:
```typescript
function ProductTopicsSection({ product, topics }: { product: string; topics: Topic[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const productNames = {
    CC: 'ClaimCenter',
    PC: 'PolicyCenter',
    BC: 'BillingCenter',
    CM: 'ContactManager',
  };
  
  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            {productNames[product]} Topics
            <Badge variant="secondary">{topics.length}</Badge>
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {topics.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No topics yet for {productNames[product]}
            </p>
          ) : (
            topics.map(topic => <TopicCard key={topic.id} topic={topic} />)
          )}
        </CardContent>
      )}
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Sections render per product
- [ ] Collapse/expand works
- [ ] Topic count correct
- [ ] Empty state shows
- [ ] Responsive layout

---

### Story TRAIN-004: Topic Card Component

**As a**: Admin  
**I want**: Visual card for each topic  
**So that**: I can see topic details at a glance

#### Acceptance Criteria
- [ ] Card shows position number and title
- [ ] Card shows duration (XX minutes)
- [ ] Card shows difficulty badge (color-coded)
- [ ] Card shows description (truncated to 2 lines)
- [ ] Card shows prerequisite count if any
- [ ] Edit button in top-right
- [ ] Hover effect on card
- [ ] Click opens topic detail view

#### Technical Implementation

**Component**:
```typescript
function TopicCard({ topic }: { topic: Topic }) {
  const difficultyConfig = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 flex-1">
          {topic.position}. {topic.title}
        </h3>
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/admin/training-content/topics/${topic.id}`}>
            <Edit2 className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {topic.duration_minutes} min
        </span>
        <Badge className={difficultyConfig[topic.difficulty]}>
          {topic.difficulty}
        </Badge>
        <span className="text-gray-500">Position: {topic.position}</span>
      </div>
      
      {topic.description && (
        <p className="text-sm text-gray-700 line-clamp-2">
          {topic.description}
        </p>
      )}
      
      {topic.prerequisites && topic.prerequisites.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          {topic.prerequisites.length} prerequisite{topic.prerequisites.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Card renders correctly
- [ ] All data displays
- [ ] Edit button works
- [ ] Hover effects work
- [ ] Difficulty colors correct
- [ ] Prerequisites show

---

### Story TRAIN-005: Topic Detail/Edit Page

**As a**: Admin  
**I want**: Full topic editor  
**So that**: I can modify all topic properties

#### Acceptance Criteria
- [ ] Page renders at `/admin/training-content/topics/[id]`
- [ ] All topic fields editable
- [ ] Fields: Title, Product, Description, Duration, Difficulty, Position, Prerequisites
- [ ] Learning objectives editor (add/remove)
- [ ] Content URLs (video, slides)
- [ ] Save button updates topic
- [ ] Cancel returns to list
- [ ] Validation on all fields
- [ ] Success toast on save

#### Technical Implementation

**Files to Enhance**:
```
app/admin/training-content/topics/[id]/page.tsx (enhance existing)
components/admin/training/TopicEditor.tsx (create)
```

**Form Structure**:
```typescript
function TopicEditor({ topic }: { topic: Topic }) {
  const [formData, setFormData] = useState(topic);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('topics')
        .update(formData)
        .eq('id', topic.id);
      
      if (error) throw error;
      
      toast.success('Topic updated successfully');
      router.push('/admin/training-content/topics');
    } catch (err) {
      toast.error('Failed to update topic');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Product</label>
              <Select
                value={formData.product_code}
                onValueChange={(v) => setFormData({ ...formData, product_code: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">ClaimCenter</SelectItem>
                  <SelectItem value="PC">PolicyCenter</SelectItem>
                  <SelectItem value="BC">BillingCenter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Position</label>
              <Input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>
          
          {/* More fields... */}
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/training-content/topics">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
```

#### Testing Checklist
- [ ] Form loads with data
- [ ] All fields editable
- [ ] Validation works
- [ ] Save updates topic
- [ ] Cancel works
- [ ] Error handling works

---

### Story TRAIN-006: Prerequisites Selector

**As a**: Admin  
**I want**: Select prerequisite topics  
**So that**: I can enforce learning sequences

#### Acceptance Criteria
- [ ] Multi-select dropdown for prerequisites
- [ ] Shows only topics from same product
- [ ] Selected topics shown as removable chips
- [ ] Can add/remove prerequisites
- [ ] Visual indication of prerequisite chain
- [ ] Prevents circular dependencies
- [ ] Updates topic.prerequisites array

#### Technical Implementation

**Component**:
```typescript
function PrerequisitesSelector({ 
  productCode, 
  currentTopicId,
  selectedIds,
  onChange 
}: PrerequisitesSelectorProps) {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  
  useEffect(() => {
    async function loadTopics() {
      const supabase = createClient();
      const { data } = await supabase
        .from('topics')
        .select('id, title, position')
        .eq('product_code', productCode)
        .neq('id', currentTopicId)
        .order('position');
      
      setAvailableTopics(data || []);
    }
    loadTopics();
  }, [productCode, currentTopicId]);
  
  const addPrerequisite = (topicId: string) => {
    if (!selectedIds.includes(topicId)) {
      onChange([...selectedIds, topicId]);
    }
  };
  
  const removePrerequisite = (topicId: string) => {
    onChange(selectedIds.filter(id => id !== topicId));
  };
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Prerequisites</label>
      
      <Select onValueChange={addPrerequisite}>
        <SelectTrigger>
          <SelectValue placeholder="Add prerequisite..." />
        </SelectTrigger>
        <SelectContent>
          {availableTopics
            .filter(t => !selectedIds.includes(t.id))
            .map(topic => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.position}. {topic.title}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
      
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map(id => {
            const topic = availableTopics.find(t => t.id === id);
            return topic ? (
              <Badge key={id} variant="secondary" className="gap-2">
                {topic.title}
                <button
                  onClick={() => removePrerequisite(id)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Dropdown loads topics
- [ ] Can add prerequisites
- [ ] Can remove prerequisites
- [ ] Same product topics only
- [ ] Updates parent state
- [ ] Circular dependency prevented

---

### Story TRAIN-007: Learning Objectives Editor

**As a**: Curriculum designer  
**I want**: Add/edit learning objectives for each topic  
**So that**: Students know what they'll learn

#### Acceptance Criteria
- [ ] List of current learning objectives
- [ ] Add objective input field
- [ ] [Add] button to add new objective
- [ ] Remove button (X) on each objective
- [ ] Reorder objectives (drag-and-drop or arrows)
- [ ] Minimum 1 objective required
- [ ] Maximum 10 objectives
- [ ] Auto-numbered (1, 2, 3...)
- [ ] Validates non-empty text

#### Technical Implementation

**Component**:
```typescript
function LearningObjectivesEditor({ 
  objectives, 
  onChange 
}: { objectives: string[]; onChange: (obj: string[]) => void }) {
  const [newObjective, setNewObjective] = useState('');
  
  const addObjective = () => {
    if (newObjective.trim() && objectives.length < 10) {
      onChange([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };
  
  const removeObjective = (index: number) => {
    onChange(objectives.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Learning Objectives *</label>
      
      <div className="flex gap-2">
        <Input
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          placeholder="Enter learning objective..."
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
        />
        <Button type="button" onClick={addObjective} disabled={!newObjective.trim() || objectives.length >= 10}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {objectives.map((objective, index) => (
          <div key={index} className="flex items-start gap-3 border border-gray-200 rounded p-3">
            <span className="font-medium text-gray-600">{index + 1}.</span>
            <p className="flex-1 text-sm text-gray-900">{objective}</p>
            <button
              type="button"
              onClick={() => removeObjective(index)}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500">
        {objectives.length}/10 objectives
      </p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Can add objectives
- [ ] Can remove objectives
- [ ] Numbering correct
- [ ] Validation works
- [ ] Max limit enforced
- [ ] Empty prevention works

---

### Story TRAIN-008: Topic Content URLs Management

**As a**: Admin  
**I want**: Manage video and slide URLs for each topic  
**So that**: Students can access learning materials

#### Acceptance Criteria
- [ ] Video URL input field
- [ ] Slides URL input field
- [ ] Assignment URL input field
- [ ] URL validation (proper format)
- [ ] Preview button to test URL
- [ ] Support for YouTube, Vimeo, direct video links
- [ ] Support for PDF, Google Slides links
- [ ] Optional fields (not required)

#### Technical Implementation

**Component**:
```typescript
function ContentURLsSection({ content, onChange }: ContentURLsProps) {
  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Links</CardTitle>
        <CardDescription>
          Add links to video lectures, slides, and assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Video URL</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="url"
              value={content.video_url || ''}
              onChange={(e) => onChange({ ...content, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
            {content.video_url && validateURL(content.video_url) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(content.video_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Slides URL</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="url"
              value={content.slides_url || ''}
              onChange={(e) => onChange({ ...content, slides_url: e.target.value })}
              placeholder="https://example.com/slides.pdf"
            />
            {content.slides_url && validateURL(content.slides_url) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(content.slides_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Assignment URL</label>
          <div className="flex gap-2 mt-1">
            <Input
              type="url"
              value={content.assignment_url || ''}
              onChange={(e) => onChange({ ...content, assignment_url: e.target.value })}
              placeholder="https://example.com/assignment.pdf"
            />
            {content.assignment_url && validateURL(content.assignment_url) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(content.assignment_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] URL inputs work
- [ ] Validation functional
- [ ] Preview buttons work
- [ ] Optional fields work
- [ ] Saves correctly

---

### Story TRAIN-009: Topic Search and Filter

**As a**: Admin  
**I want**: Search topics across all products  
**So that**: I can find specific topics quickly

#### Acceptance Criteria
- [ ] Search input at top of page
- [ ] Searches: title, description
- [ ] Filter by product dropdown
- [ ] Filter by difficulty dropdown
- [ ] Filters combine with search
- [ ] Clear filters button
- [ ] Result count shown
- [ ] Highlights matching sections

#### Technical Implementation

**Component**:
```typescript
function TopicFilters({ topics, onFilter }: TopicFiltersProps) {
  const [search, setSearch] = useState('');
  const [product, setProduct] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  
  useEffect(() => {
    let filtered = topics;
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }
    
    if (product) {
      filtered = filtered.filter(t => t.product_code === product);
    }
    
    if (difficulty) {
      filtered = filtered.filter(t => t.difficulty === difficulty);
    }
    
    onFilter(filtered);
  }, [search, product, difficulty, topics]);
  
  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <Input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <Select value={product || 'all'} onValueChange={v => setProduct(v === 'all' ? null : v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Products" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          <SelectItem value="CC">ClaimCenter</SelectItem>
          <SelectItem value="PC">PolicyCenter</SelectItem>
          <SelectItem value="BC">BillingCenter</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={difficulty || 'all'} onValueChange={v => setDifficulty(v === 'all' ? null : v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Search works
- [ ] Filters work
- [ ] Combination works
- [ ] Clear filters works
- [ ] Performance good

---

### Story TRAIN-010: Topic Reordering

**As a**: Curriculum designer  
**I want**: Reorder topics within a product  
**So that**: Learning sequence is logical

#### Acceptance Criteria
- [ ] Drag-and-drop to reorder topics
- [ ] Visual placeholder while dragging
- [ ] Drop updates position
- [ ] Auto-renumbers all topics in sequence
- [ ] Saves new positions to database
- [ ] Optimistic UI updates
- [ ] Undo capability (within session)
- [ ] Works on desktop only (manual on mobile)

#### Technical Implementation

**Component** (using dnd-kit):
```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

function ReorderableTopicList({ topics, productCode }: ReorderableListProps) {
  const [items, setItems] = useState(topics);
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = items.findIndex(t => t.id === active.id);
    const newIndex = items.findIndex(t => t.id === over.id);
    
    const newOrder = arrayMove(items, oldIndex, newIndex);
    
    // Update positions
    const updates = newOrder.map((topic, index) => ({
      ...topic,
      position: index + 1,
    }));
    
    setItems(updates); // Optimistic update
    
    // Save to database
    const supabase = createClient();
    await Promise.all(
      updates.map(topic =>
        supabase
          .from('topics')
          .update({ position: topic.position })
          .eq('id', topic.id)
      )
    );
    
    toast.success('Topic order updated');
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {items.map(topic => (
          <SortableTopicCard key={topic.id} topic={topic} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

#### Testing Checklist
- [ ] Drag-and-drop works
- [ ] Positions update
- [ ] Database saves
- [ ] UI updates optimistically
- [ ] Error handling works

---

### Story TRAIN-011: Topic Duplication

**As a**: Admin  
**I want**: Duplicate existing topics  
**So that**: I can create similar content faster

#### Acceptance Criteria
- [ ] [Duplicate] button in topic actions menu
- [ ] Creates copy with "(Copy)" appended to title
- [ ] Increments position to end of list
- [ ] Copies all fields except ID and timestamps
- [ ] Opens editor for new topic
- [ ] Success toast confirms duplication
- [ ] Audit log created

#### Technical Implementation

**Action**:
```typescript
async function duplicateTopic(topicId: string) {
  const supabase = createClient();
  
  // Fetch original topic
  const { data: original } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single();
  
  if (!original) {
    toast.error('Topic not found');
    return;
  }
  
  // Get max position for product
  const { data: maxPos } = await supabase
    .from('topics')
    .select('position')
    .eq('product_code', original.product_code)
    .order('position', { ascending: false })
    .limit(1)
    .single();
  
  // Create duplicate
  const duplicate = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    position: (maxPos?.position || 0) + 1,
    created_at: undefined,
    updated_at: undefined,
  };
  
  const { data: newTopic, error } = await supabase
    .from('topics')
    .insert(duplicate)
    .select()
    .single();
  
  if (error) {
    toast.error('Failed to duplicate topic');
    return;
  }
  
  toast.success('Topic duplicated successfully');
  router.push(`/admin/training-content/topics/${newTopic.id}`);
}
```

#### Testing Checklist
- [ ] Duplication works
- [ ] Title appended correctly
- [ ] Position incremented
- [ ] All fields copied
- [ ] Navigation works
- [ ] Audit log created

---

### Story TRAIN-012: Topic Deletion

**As a**: Admin  
**I want**: Delete topics that are no longer needed  
**So that**: I can keep content library clean

#### Acceptance Criteria
- [ ] [Delete] button in topic actions
- [ ] Confirmation dialog before deletion
- [ ] Warning if topic is prerequisite for others
- [ ] Warning if topic in use by courses
- [ ] Cascade options for dependencies
- [ ] Soft delete (archived) vs hard delete
- [ ] Success toast confirms deletion
- [ ] Audit log entry created

#### Technical Implementation

**Delete Dialog**:
```typescript
function DeleteTopicDialog({ topic, open, onClose }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>([]);
  
  useEffect(() => {
    async function checkDependencies() {
      const supabase = createClient();
      
      // Check if prerequisite for other topics
      const { data } = await supabase
        .from('topics')
        .select('id, title')
        .contains('prerequisites', [topic.id]);
      
      setDependencies(data?.map(t => t.title) || []);
    }
    
    if (open) {
      checkDependencies();
    }
  }, [open, topic.id]);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      if (dependencies.length > 0) {
        // Remove from prerequisites first
        await supabase.rpc('remove_prerequisite', {
          topic_id_to_remove: topic.id
        });
      }
      
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topic.id);
      
      if (error) throw error;
      
      toast.success('Topic deleted successfully');
      router.refresh();
      onClose();
    } catch (err) {
      toast.error('Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{topic.title}"? This action cannot be undone.
            
            {dependencies.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-900 font-medium mb-2">
                  ⚠️ This topic is a prerequisite for:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {dependencies.map((title, i) => (
                    <li key={i}>• {title}</li>
                  ))}
                </ul>
                <p className="text-xs text-yellow-700 mt-2">
                  Deleting will remove it from their prerequisites.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Topic'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### Testing Checklist
- [ ] Delete works
- [ ] Confirmation required
- [ ] Dependencies checked
- [ ] Warning shown
- [ ] Cascade handled
- [ ] Audit log created

---

### Story TRAIN-013: Topic Statistics Dashboard

**As a**: Training manager  
**I want**: Overview of topic usage and engagement  
**So that**: I can identify popular and underutilized content

#### Acceptance Criteria
- [ ] Stats section showing: Total topics, By difficulty, By product
- [ ] Most viewed topics list
- [ ] Topics needing update (old content)
- [ ] Completion rate per topic (future)
- [ ] Average duration per difficulty level
- [ ] Visual charts (bar/pie)

#### Technical Implementation

**Component**:
```typescript
function TopicStatistics({ topics }: { topics: Topic[] }) {
  const stats = useMemo(() => {
    return {
      total: topics.length,
      byDifficulty: {
        beginner: topics.filter(t => t.difficulty === 'beginner').length,
        intermediate: topics.filter(t => t.difficulty === 'intermediate').length,
        advanced: topics.filter(t => t.difficulty === 'advanced').length,
      },
      byProduct: topics.reduce((acc, t) => {
        acc[t.product_code] = (acc[t.product_code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgDuration: {
        beginner: avg(topics.filter(t => t.difficulty === 'beginner').map(t => t.duration_minutes)),
        intermediate: avg(topics.filter(t => t.difficulty === 'intermediate').map(t => t.duration_minutes)),
        advanced: avg(topics.filter(t => t.difficulty === 'advanced').map(t => t.duration_minutes)),
      },
    };
  }, [topics]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>By Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Beginner</span>
            <span className="font-medium">{stats.byDifficulty.beginner}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Intermediate</span>
            <span className="font-medium">{stats.byDifficulty.intermediate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Advanced</span>
            <span className="font-medium">{stats.byDifficulty.advanced}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Avg Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Beginner</span>
            <span className="font-medium">{stats.avgDuration.beginner} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Intermediate</span>
            <span className="font-medium">{stats.avgDuration.intermediate} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Advanced</span>
            <span className="font-medium">{stats.avgDuration.advanced} min</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Stats calculate correctly
- [ ] All metrics display
- [ ] Updates with data
- [ ] Responsive layout

---

### Story TRAIN-014: Topic Status Management

**As a**: Admin  
**I want**: Mark topics as draft/published/archived  
**So that**: I can control topic visibility

#### Acceptance Criteria
- [ ] Status field in topic editor
- [ ] Options: draft, published, archived
- [ ] Draft topics not visible to students
- [ ] Published topics available in academy
- [ ] Archived topics hidden but preserved
- [ ] Status badge shown in topic list
- [ ] Quick status toggle in list view

#### Technical Implementation

**Status Field**:
```typescript
<div>
  <label className="text-sm font-medium">Status</label>
  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="draft">Draft</SelectItem>
      <SelectItem value="published">Published</SelectItem>
      <SelectItem value="archived">Archived</SelectItem>
    </SelectContent>
  </Select>
</div>

// Status badge in list
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
  };
  
  return <Badge className={config[status]}>{status}</Badge>;
}
```

#### Testing Checklist
- [ ] Status field works
- [ ] Badge displays correctly
- [ ] Visibility controlled
- [ ] Toggle works
- [ ] Saves properly

---

### Story TRAIN-015: Topic Analytics Integration

**As a**: Training manager  
**I want**: Track topic engagement metrics  
**So that**: I can improve content

#### Acceptance Criteria
- [ ] View count per topic
- [ ] Completion rate per topic
- [ ] Average time spent
- [ ] Student feedback ratings
- [ ] Difficulty accuracy (perceived vs set)
- [ ] Prerequisite effectiveness
- [ ] Display in topic detail view

#### Technical Implementation

**Analytics Component**:
```typescript
function TopicAnalytics({ topicId }: { topicId: string }) {
  const [analytics, setAnalytics] = useState<TopicAnalytics | null>(null);
  
  useEffect(() => {
    async function loadAnalytics() {
      const supabase = createClient();
      
      const [views, completions, time, ratings] = await Promise.all([
        supabase.from('topic_views').select('*', { count: 'exact' }).eq('topic_id', topicId),
        supabase.from('topic_completions').select('*', { count: 'exact' }).eq('topic_id', topicId),
        supabase.from('topic_time_spent').select('duration_seconds').eq('topic_id', topicId),
        supabase.from('topic_ratings').select('rating').eq('topic_id', topicId),
      ]);
      
      setAnalytics({
        views: views.count || 0,
        completions: completions.count || 0,
        avgTime: avg(time.data?.map(t => t.duration_seconds) || []),
        avgRating: avg(ratings.data?.map(r => r.rating) || []),
        completionRate: views.count ? (completions.count / views.count) * 100 : 0,
      });
    }
    
    loadAnalytics();
  }, [topicId]);
  
  if (!analytics) return <Skeleton className="h-32" />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Views</p>
            <p className="text-2xl font-bold">{analytics.views}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completions</p>
            <p className="text-2xl font-bold">{analytics.completions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-2xl font-bold">{analytics.avgRating.toFixed(1)}/5</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Analytics load correctly
- [ ] Calculations accurate
- [ ] Display formatted
- [ ] Updates with new data

---

### Story TRAIN-016: Topic Version History

**As a**: Admin  
**I want**: See edit history of each topic  
**So that**: I can track content changes

#### Acceptance Criteria
- [ ] Version history tab in topic detail
- [ ] Shows all edits with timestamps
- [ ] Shows who made each change
- [ ] Diff view of changes (before/after)
- [ ] Restore previous version capability
- [ ] Limit to last 20 versions
- [ ] Leverages audit log data

#### Technical Implementation

**Component**:
```typescript
function TopicVersionHistory({ topicId }: { topicId: string }) {
  const [versions, setVersions] = useState<AuditLogEntry[]>([]);
  
  useEffect(() => {
    async function loadVersions() {
      const supabase = createClient();
      const { data } = await supabase
        .from('cms_audit_log')
        .select('*')
        .eq('entity_type', 'topic')
        .eq('entity_id', topicId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setVersions(data || []);
    }
    loadVersions();
  }, [topicId]);
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Version History</h3>
      {versions.map(version => (
        <Card key={version.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge>{version.action}</Badge>
                <span className="text-sm text-gray-600">by {version.user_email}</span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(version.created_at), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            
            {version.changes && (
              <details className="mt-2">
                <summary className="text-sm text-blue-600 cursor-pointer">
                  View changes
                </summary>
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(version.changes, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Version history loads
- [ ] All changes shown
- [ ] Diff view works
- [ ] Timestamps correct
- [ ] User attribution correct

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 16 stories implemented
- [ ] Topic CRUD complete
- [ ] Bulk upload works
- [ ] Prerequisites functional
- [ ] Content organized by product
- [ ] Search and filter operational

### Data Requirements
- [ ] All topics have required fields
- [ ] Prerequisites validate
- [ ] Positions sequential
- [ ] No orphaned topics

### Quality Requirements
- [ ] TypeScript strict passing
- [ ] Tests comprehensive
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Accessibility compliant

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1 complete  
**Next Epic**: Epic 6 (Blog Management)

