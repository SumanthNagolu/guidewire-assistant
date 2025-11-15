# Admin Portal - Quick Reference Guide

**Last Updated**: 2025-11-14  
**Version**: 1.0  
**Purpose**: Fast lookup for epic commands, story IDs, and implementation order

---

## Quick Start

```bash
# 1. Read master guide
open documentation/admin/00-IMPLEMENTATION-GUIDE.md

# 2. Start with Epic 1
/admin-01-authentication

# 3. Follow sequentially through all 15 epics
# 4. Test after each epic
# 5. Deploy when complete
```

---

## Epic Quick Index

| # | Epic Name | Command | Stories | Days | Status |
|---|-----------|---------|---------|------|--------|
| 1 | Authentication | `/admin-01-authentication` | 12 | 3-4 | ⏳ Not Started |
| 2 | Dashboard | `/admin-02-dashboard` | 15 | 4-5 | ⏳ Not Started |
| 3 | User Management | `/admin-03-user-management` | 18 | 5-6 | ⏳ Not Started |
| 4 | Permissions & Audit | `/admin-04-permissions` | 14 | 4-5 | ⏳ Not Started |
| 5 | Training Content | `/admin-05-training` | 16 | 5-6 | ⏳ Not Started |
| 6 | Blog Management | `/admin-06-blog` | 22 | 6-7 | ⏳ Not Started |
| 7 | Resource Management | `/admin-07-resources` | 18 | 5-6 | ⏳ Not Started |
| 8 | Job Management | `/admin-08-jobs` | 20 | 6-7 | ⏳ Not Started |
| 9 | Talent Management | `/admin-09-talent` | 17 | 5-6 | ⏳ Not Started |
| 10 | Banner Management | `/admin-10-banners` | 15 | 4-5 | ⏳ Not Started |
| 11 | Media Library | `/admin-11-media` | 19 | 6-7 | ⏳ Not Started |
| 12 | Course Management | `/admin-12-courses` | 16 | 5-6 | ⏳ Not Started |
| 13 | Analytics Dashboard | `/admin-13-analytics` | 14 | 5-6 | ⏳ Not Started |
| 14 | Platform Setup | `/admin-14-setup` | 10 | 3-4 | ⏳ Not Started |
| 15 | Content Upload | `/admin-15-upload` | 12 | 4-5 | ⏳ Not Started |

**Total**: 238 user stories, ~75-90 days (sequential)

---

## Recommended Execution Order

### Critical Path (Must be Sequential)
1. Epic 1 (Authentication) - Foundation
2. Epic 14 (Platform Setup) - Infrastructure  
3. Epic 11 (Media Library) - Needed by content epics
4. Epic 2 (Dashboard) - Overview
5. Epic 3 (User Management) - User operations
6. Epic 4 (Permissions) - Security layer

### Content Epics (Can be Parallel After Critical Path)
7. Epic 5 (Training) + Epic 6 (Blog) + Epic 7 (Resources) + Epic 10 (Banners)

### Business Operations (Sequential Within Group)
8. Epic 8 (Jobs) → Epic 9 (Talent)

### Learning Platform
9. Epic 12 (Courses) → Epic 15 (Content Upload)

### Intelligence
10. Epic 13 (Analytics)

---

## File Structure Reference

### Documentation Files
```
documentation/admin/
├── 00-IMPLEMENTATION-GUIDE.md      ← Master guide
├── 01-EPIC-Authentication.md       ← Epic 1 specs
├── 02-EPIC-Dashboard.md            ← Epic 2 specs
├── ...                             ← Epic 3-15 specs
├── TESTING-CHECKLIST.md            ← QA tests
├── CURSOR-COMMANDS.md              ← Command reference
└── QUICK-REFERENCE.md              ← This file
```

### Implementation Files (Will Be Created)
```
app/admin/
├── layout.tsx                      ✅ Exists
├── page.tsx                        ✅ Exists (enhance)
├── login/page.tsx                  ❌ Create (Epic 1)
├── users/                          ❌ Create (Epic 3)
├── permissions/page.tsx            ✅ Exists (enhance)
├── blog/                           ✅ Exists (enhance)
├── resources/                      ✅ Exists (enhance)
├── banners/                        ✅ Exists (enhance)
├── media/page.tsx                  ✅ Exists (enhance)
├── courses/                        ✅ Exists (enhance)
├── analytics/page.tsx              ✅ Exists (enhance)
└── training-content/               ✅ Exists (enhance)

components/admin/
├── AdminSidebar.tsx                ✅ Exists
├── AdminHeader.tsx                 ✅ Exists
├── CEODashboard.tsx                ✅ Exists (enhance)
├── auth/                           ❌ Create (Epic 1)
├── users/                          ❌ Create (Epic 3)
├── permissions/                    ✅ Exists (enhance)
├── blog/                           ✅ Exists (enhance)
├── resources/                      ✅ Exists (enhance)
├── banners/                        ✅ Exists (enhance)
├── media/                          ✅ Exists (enhance)
├── courses/                        ✅ Exists (enhance)
└── analytics/                      ✅ Exists (enhance)
```

---

## Story ID Naming Convention

```
{EPIC-PREFIX}-{NUMBER}

Examples:
AUTH-001    (Epic 1: Authentication, Story 1)
DASH-015    (Epic 2: Dashboard, Story 15)
USER-008    (Epic 3: User Management, Story 8)
BLOG-022    (Epic 6: Blog, Story 22)
```

---

## Database Tables Reference

### Created Tables
- `user_profiles` (Epic 1, 3)
- `cms_audit_log` (Epic 4)
- `topics` (Epic 5)
- `blog_posts` (Epic 6)
- `resources` (Epic 7)
- `jobs` (Epic 8)
- `candidates` (Epic 9)
- `banners` (Epic 10)
- `media_assets` (Epic 11)
- `learning_paths` (Epic 12)
- `resource_downloads` (Epic 7)
- `topic_completions` (Epic 5)

### Tables to Verify
- `pods` (Epic 2)
- `placements` (Epic 2, 8)
- `opportunities` (Epic 2, 8)
- `daily_metrics` (Epic 2)
- `alerts` (Epic 2)

---

## Common Commands While Implementing

### Check Status
```bash
# See what's implemented
ls -la app/admin/

# Check TypeScript errors
npm run type-check

# Run tests
npm run test

# Check linting
npm run lint
```

### During Development
```bash
# Start dev server
npm run dev

# Watch tests
npm run test:watch

# Check bundle size
npm run build
```

---

## Key Components to Reuse

### From Epic 11 (Media Library)
- `MediaSelector` - Used by Blog, Resources, Banners
- `MediaUpload` - Universal upload component
- `ImageOptimizer` - Auto-optimization

### From Epic 6 (Blog)
- `RichTextEditor` - Used by Blog, Jobs, Resources
- `SEOFields` - Used by Blog, Resources
- `TagInput` - Used across multiple epics

### From Epic 3 (User Management)
- `UserAvatar` - Used everywhere users displayed
- `RoleBadge` - Consistent role display
- `UserSelector` - Assign users to entities

### From Epic 4 (Permissions)
- `createAuditLog()` - Used across all epics
- `canAccess()` - Permission checking
- `hasWriteAccess()` - Write permission check

---

## Testing Commands

```bash
# Run all tests
npm run test

# Run specific epic tests
npm run test -- --grep "EPIC-01"

# Run E2E tests
npm run test:e2e

# Check coverage
npm run test:coverage
```

---

## Deployment Checklist

Before deploying admin portal:

### Pre-Deploy
- [ ] All 15 epics complete
- [ ] All 238 stories implemented
- [ ] Integration tests passing
- [ ] Performance optimized
- [ ] Accessibility audit complete
- [ ] Security audit complete
- [ ] Documentation complete

### Deployment
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Email configured
- [ ] Build succeeds
- [ ] Staging deployment successful
- [ ] Production deployment successful

### Post-Deploy
- [ ] Smoke tests pass
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features
- [ ] Monitor user feedback

---

## Support Resources

### Documentation
- Master Guide: `00-IMPLEMENTATION-GUIDE.md`
- Epic Specs: `01-EPIC-*.md` through `15-EPIC-*.md`
- Testing: `TESTING-CHECKLIST.md`
- Commands: `CURSOR-COMMANDS.md`
- Original Spec: `documentation/03-admin-workflow.md`

### Getting Help
1. Check epic documentation
2. Review similar implemented features
3. Check testing checklist
4. Review admin workflow doc
5. Check existing components

---

## Progress Tracking Template

Copy this to your notes and update after each epic:

```markdown
# Admin Portal Progress

## Week 1 (Foundation)
- [x] Epic 1: Authentication (12/12) ✅ 2025-11-15
- [x] Epic 2: Dashboard (15/15) ✅ 2025-11-16
- [x] Epic 3: User Management (18/18) ✅ 2025-11-18
- [ ] Epic 4: Permissions (0/14) ⏳ 

## Week 2 (Infrastructure + Content)
- [ ] Epic 14: Setup (0/10) ⏳
- [ ] Epic 11: Media (0/19) ⏳
- [ ] Epic 5: Training (0/16) ⏳
- [ ] Epic 6: Blog (0/22) ⏳

## Week 3 (Content Continued)
- [ ] Epic 7: Resources (0/18) ⏳
- [ ] Epic 10: Banners (0/15) ⏳

## Week 4 (Business Operations)
- [ ] Epic 8: Jobs (0/20) ⏳
- [ ] Epic 9: Talent (0/17) ⏳

## Week 5 (Learning Platform)
- [ ] Epic 12: Courses (0/16) ⏳
- [ ] Epic 15: Upload (0/12) ⏳

## Week 6 (Intelligence)
- [ ] Epic 13: Analytics (0/14) ⏳

## Final (Testing & Optimization)
- [ ] Integration Testing ⏳
- [ ] Performance Optimization ⏳
- [ ] Accessibility Audit ⏳
- [ ] Documentation Finalization ⏳

**Overall Progress**: 0/238 stories (0%)
```

---

## Time Estimates

### By Phase
- Phase 1 (Foundation): 16-20 days
- Phase 2 (Infrastructure): 9-11 days
- Phase 3 (Content): 15-18 days
- Phase 4 (Operations): 11-13 days
- Phase 5 (Learning): 9-11 days
- Phase 6 (Intelligence): 5-6 days
- Final (Testing/Optimization): 5-7 days

**Total Sequential**: 70-86 days (~14-17 weeks)

### With Parallel Development (3 developers)
- Weeks: 6-8 weeks
- Team A: Foundation + Setup
- Team B: Content Management
- Team C: Business Operations + Intelligence

---

## Success Metrics

### Code Quality
- TypeScript errors: 0
- ESLint warnings: 0
- Test coverage: > 80%
- Bundle size: < 500KB

### Performance
- Dashboard load: < 2s
- Page transitions: < 500ms
- Lighthouse score: > 90
- Core Web Vitals: All green

### Functionality
- All epics: 100% complete
- All stories: 100% implemented
- All tests: 100% passing
- All features: Working in production

---

**Ready to Start? Execute:**

```bash
/admin-01-authentication
```

Read Epic 1 docs first: `documentation/admin/01-EPIC-Authentication.md`

