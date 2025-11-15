# Admin Portal - Performance Optimization Guide

**Created**: 2025-11-14  
**Purpose**: Performance optimization strategies for admin portal  
**Target**: Lighthouse Score > 90, Load Time < 2s

---

## Current Performance Baseline

### Measured Metrics (Initial)
- Dashboard load time: ~1.5-2.5s
- Time to interactive: ~2-3s
- Bundle size: ~400KB (admin routes)
- Database queries: Parallel execution ✅
- Image optimization: Partially implemented

---

## Optimization Strategies

### 1. Code Splitting & Lazy Loading

#### Implement Dynamic Imports
```typescript
// Before
import BlogEditor from '@/components/admin/blog/BlogEditor';

// After
import dynamic from 'next/dynamic';

const BlogEditor = dynamic(
  () => import('@/components/admin/blog/BlogEditor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false, // Client-only component
  }
);
```

#### Pages to Lazy Load
- [ ] Blog Editor (rich text editor heavy)
- [ ] Resource Editor
- [ ] Job Editor
- [ ] Course Builder (drag-and-drop heavy)
- [ ] Analytics Charts (Recharts library)
- [ ] Media Library (image-heavy)

---

### 2. Database Query Optimization

#### Implement Request Caching
```typescript
// lib/cache/admin-cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedDashboardData = unstable_cache(
  async () => {
    const supabase = await createClient();
    // Fetch dashboard data
    return data;
  },
  ['admin-dashboard'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['admin-dashboard'],
  }
);

// Usage in page
const dashboardData = await getCachedDashboardData();
```

#### Add Database Indexes
```sql
-- Performance indexes for admin queries
CREATE INDEX CONCURRENTLY idx_blog_posts_status_published 
  ON blog_posts(status, published_at DESC) 
  WHERE status = 'published';

CREATE INDEX CONCURRENTLY idx_resources_status_created 
  ON resources(status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_jobs_status_created 
  ON jobs(status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_audit_log_created 
  ON cms_audit_log(created_at DESC);

CREATE INDEX CONCURRENTLY idx_audit_log_entity 
  ON cms_audit_log(entity_type, entity_id);
```

---

### 3. Pagination Implementation

#### Add Pagination to Large Lists
```typescript
// components/admin/PaginatedTable.tsx
export function usePagination<T>(items: T[], pageSize = 50) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    setPage: setCurrentPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
```

#### Apply to
- [ ] User Directory (if > 50 users)
- [ ] Blog Posts List (if > 50 posts)
- [ ] Resources List (if > 50 resources)
- [ ] Jobs List (if > 50 jobs)
- [ ] Audit Log (if > 100 entries)
- [ ] Media Library (if > 100 files)

---

### 4. Image Optimization

#### Use Next.js Image Component
```typescript
// Before
<img src={post.featured_image_url} alt={post.title} />

// After
import Image from 'next/image';

<Image
  src={post.featured_image_url}
  alt={post.title}
  width={1200}
  height={630}
  className="rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL={post.blur_data_url}
/>
```

#### Configure next.config.ts
```typescript
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
};
```

---

### 5. Bundle Size Reduction

#### Analyze Current Bundle
```bash
npm run build
npm run analyze
```

#### Optimization Techniques
- [ ] Remove unused dependencies
- [ ] Tree-shake large libraries
- [ ] Use lighter alternatives (lucide-react instead of react-icons)
- [ ] Externalize heavy dependencies
- [ ] Minimize vendor chunks

---

### 6. Loading States & Skeletons

#### Add Skeletons Everywhere
```typescript
// components/admin/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// Usage
<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>
```

---

### 7. Reduce Re-renders

#### Memoize Expensive Calculations
```typescript
// Before
function MyComponent({ data }) {
  const processed = expensiveCalculation(data);
  return <div>{processed}</div>;
}

// After
function MyComponent({ data }) {
  const processed = useMemo(
    () => expensiveCalculation(data),
    [data]
  );
  return <div>{processed}</div>;
}
```

#### Use React.memo for Pure Components
```typescript
const UserCard = React.memo(function UserCard({ user }: { user: User }) {
  return (
    <Card>{/* ... */}</Card>
  );
});
```

---

### 8. Debounce Search Inputs

```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  
  useEffect(() => {
    // Filter with debounced value
    performSearch(debouncedQuery);
  }, [debouncedQuery]);
  
  return <Input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

---

## Performance Targets

### Load Times
- Dashboard: < 2 seconds
- List pages: < 1.5 seconds
- Editor pages: < 2 seconds
- Media library: < 2.5 seconds

### Lighthouse Scores
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Monitoring & Measurement

### Tools to Use
- Vercel Analytics (built-in)
- Lighthouse CI
- Web Vitals reporting
- Bundle analyzer
- React DevTools Profiler

### Metrics to Track
- Page load times
- API response times
- Bundle sizes
- Memory usage
- Error rates

---

**Status**: Optimization strategies documented  
**Next**: Implement optimizations and measure improvements

