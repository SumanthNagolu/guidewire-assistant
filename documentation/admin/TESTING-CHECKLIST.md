# Admin Portal - Complete Testing Checklist

**Document Purpose**: QA verification checklist for all 15 epics  
**Usage**: Test each epic after implementation  
**Test Credentials**: `admin@intimeesolutions.com` | `test12345`

---

## Epic 1: Authentication & Access Control

### Functional Tests
- [ ] LOGIN-001: Can access login page at `/admin/login`
- [ ] LOGIN-002: Email field validates format
- [ ] LOGIN-003: Password field validates minimum length
- [ ] LOGIN-004: Submit button disabled when form invalid
- [ ] LOGIN-005: Successful login redirects to `/admin`
- [ ] LOGIN-006: Failed login shows error message
- [ ] LOGIN-007: Loading state appears during authentication
- [ ] LOGIN-008: Already logged-in admin redirected from login page
- [ ] LOGIN-009: Non-admin user blocked from `/admin` routes
- [ ] LOGIN-010: Student user redirected to `/academy`
- [ ] LOGIN-011: Logout button works and clears session
- [ ] LOGIN-012: Session persists across page refresh

### Security Tests
- [ ] SEC-001: Cannot bypass authentication via direct URL
- [ ] SEC-002: Cannot access admin with student credentials
- [ ] SEC-003: Session expires after timeout
- [ ] SEC-004: Logout clears all cookies
- [ ] SEC-005: RedirectTo parameter validated (no open redirect)

### Accessibility Tests
- [ ] A11Y-001: Can navigate login form with keyboard only
- [ ] A11Y-002: Form fields have proper labels
- [ ] A11Y-003: Error messages announced to screen readers
- [ ] A11Y-004: Focus visible on all interactive elements

---

## Epic 2: CEO Dashboard

### Functional Tests
- [ ] DASH-001: Dashboard loads at `/admin` for admin user
- [ ] DASH-002: Hero banner displays correctly
- [ ] DASH-003: Monthly revenue KPI calculates accurately
- [ ] DASH-004: Active placements count correct
- [ ] DASH-005: Pipeline value sums all opportunities
- [ ] DASH-006: Active pods count matches database
- [ ] DASH-007: Pod performance table renders all columns
- [ ] DASH-008: Pod name and type display correctly
- [ ] DASH-009: Placements progress indicators accurate
- [ ] DASH-010: Health score badges color-coded correctly
- [ ] DASH-011: View Details links navigate to pod pages
- [ ] DASH-012: Critical alerts display when present
- [ ] DASH-013: Empty alerts state shows celebration message
- [ ] DASH-014: Cross-pollination section shows with data
- [ ] DASH-015: Growth trajectory calculations accurate
- [ ] DASH-016: Dashboard auto-refreshes every 60 seconds
- [ ] DASH-017: Manual refresh button works
- [ ] DASH-018: Loading skeletons display on initial load
- [ ] DASH-019: Error boundary catches render errors
- [ ] DASH-020: Mobile responsive layout works

### Performance Tests
- [ ] PERF-001: Dashboard loads in < 2 seconds
- [ ] PERF-002: All queries execute in parallel
- [ ] PERF-003: Lighthouse performance score > 90
- [ ] PERF-004: No memory leaks on auto-refresh

---

## Epic 3: User Management

### Functional Tests
- [ ] USER-001: User directory page loads at `/admin/users`
- [ ] USER-002: Stats cards show correct counts
- [ ] USER-003: Search finds users by name
- [ ] USER-004: Search finds users by email
- [ ] USER-005: Role filter works for all roles
- [ ] USER-006: Filters combine with search
- [ ] USER-007: Table view shows all columns
- [ ] USER-008: Grid view displays cards correctly
- [ ] USER-009: View toggle persists preference
- [ ] USER-010: User avatars display initials
- [ ] USER-011: Role badges color-coded correctly
- [ ] USER-012: Edit role dialog opens
- [ ] USER-013: Role can be changed successfully
- [ ] USER-014: Role change creates audit log
- [ ] USER-015: Bulk selection works (select all, individual)
- [ ] USER-016: Bulk actions menu appears with selection
- [ ] USER-017: Export users to CSV works
- [ ] USER-018: Invite user wizard completes
- [ ] USER-019: User activity indicators correct
- [ ] USER-020: Sorting works for all columns
- [ ] USER-021: Pagination works (if > 50 users)
- [ ] USER-022: Deactivation prevents login

---

## Epic 4: Permissions & Audit

### Functional Tests
- [ ] PERM-001: Permissions page has 3 tabs
- [ ] PERM-002: Roles & Permissions tab displays role cards
- [ ] PERM-003: Permission matrix shows all features/roles
- [ ] PERM-004: User Management tab lists all users
- [ ] PERM-005: Audit Log tab shows recent activity
- [ ] PERM-006: Audit log filters by action type
- [ ] PERM-007: Audit log filters by entity type
- [ ] PERM-008: Audit log search works
- [ ] PERM-009: Audit log detail dialog shows full info
- [ ] PERM-010: Audit stats calculate correctly
- [ ] PERM-011: Permission check functions work
- [ ] PERM-012: Audit logs created for all CMS actions
- [ ] PERM-013: IP addresses captured
- [ ] PERM-014: Real-time audit updates work
- [ ] PERM-015: Export audit logs works

### Security Tests
- [ ] SEC-010: All admin actions logged
- [ ] SEC-011: Audit logs immutable
- [ ] SEC-012: User attribution correct
- [ ] SEC-013: Changes JSON populated
- [ ] SEC-014: Cannot access other role's features

---

## Epic 5: Training Content

### Functional Tests
- [ ] TRAIN-001: Topics page loads with all products
- [ ] TRAIN-002: Bulk upload accepts JSON
- [ ] TRAIN-003: Topics grouped by product
- [ ] TRAIN-004: Topic cards display all info
- [ ] TRAIN-005: Topic editor loads existing data
- [ ] TRAIN-006: Can save topic changes
- [ ] TRAIN-007: Prerequisites selector works
- [ ] TRAIN-008: Learning objectives add/remove works
- [ ] TRAIN-009: Content URLs save correctly
- [ ] TRAIN-010: Topic search filters correctly
- [ ] TRAIN-011: Topic reordering updates positions
- [ ] TRAIN-012: Topic duplication creates copy
- [ ] TRAIN-013: Topic deletion works with warnings
- [ ] TRAIN-014: Statistics calculate accurately
- [ ] TRAIN-015: Status management functional
- [ ] TRAIN-016: Analytics display correctly

---

## Epic 6: Blog Management

### Functional Tests
- [ ] BLOG-001: Blog list page shows all posts
- [ ] BLOG-002: Stats cards accurate
- [ ] BLOG-003: Filter by status works
- [ ] BLOG-004: Search finds posts
- [ ] BLOG-005: New post editor loads
- [ ] BLOG-006: Title field auto-focuses
- [ ] BLOG-007: Slug auto-generates from title
- [ ] BLOG-008: Can manually edit slug
- [ ] BLOG-009: Featured image selector opens
- [ ] BLOG-010: Category dropdown works
- [ ] BLOG-011: Rich text editor renders
- [ ] BLOG-012: Editor toolbar buttons work
- [ ] BLOG-013: Markdown preview renders correctly
- [ ] BLOG-014: SEO tab fields save
- [ ] BLOG-015: Character counters accurate
- [ ] BLOG-016: SEO preview displays correctly
- [ ] BLOG-017: Settings tab configures post
- [ ] BLOG-018: Auto-save works every 30 seconds
- [ ] BLOG-019: Manual save (Ctrl+S) works
- [ ] BLOG-020: Save draft stores correctly
- [ ] BLOG-021: Publish validation shows checklist
- [ ] BLOG-022: Published post appears on public site
- [ ] BLOG-023: Schedule post works with date/time
- [ ] BLOG-024: Post preview opens in new tab
- [ ] BLOG-025: Post duplication works
- [ ] BLOG-026: Post archiving works
- [ ] BLOG-027: Version history shows changes

### Content Tests
- [ ] CONTENT-001: Bold text formats correctly
- [ ] CONTENT-002: Italic text formats correctly
- [ ] CONTENT-003: Lists (bullets, numbered) work
- [ ] CONTENT-004: Links insert correctly
- [ ] CONTENT-005: Images insert correctly
- [ ] CONTENT-006: Code blocks syntax highlight
- [ ] CONTENT-007: Blockquotes format correctly

### SEO Tests
- [ ] SEO-001: Meta title under 60 chars gets green indicator
- [ ] SEO-002: Meta description 150-160 chars gets green indicator
- [ ] SEO-003: Focus keyword saves correctly
- [ ] SEO-004: Keywords tags work
- [ ] SEO-005: Google preview renders correctly

---

## Epic 7: Resource Management

### Functional Tests
- [ ] RES-001: Resources list page loads
- [ ] RES-002: Stats cards accurate
- [ ] RES-003: Grid view displays resources
- [ ] RES-004: List view shows table
- [ ] RES-005: Resource editor form works
- [ ] RES-006: File upload accepts PDFs
- [ ] RES-007: Thumbnail upload works
- [ ] RES-008: Resource type icons display
- [ ] RES-009: Category selection works
- [ ] RES-010: Gating toggle works
- [ ] RES-011: Required fields selector functional
- [ ] RES-012: Save draft stores correctly
- [ ] RES-013: Publish makes resource live
- [ ] RES-014: Download tracking increments
- [ ] RES-015: Analytics show download trends
- [ ] RES-016: PDF preview generates
- [ ] RES-017: Resource search works
- [ ] RES-018: Resource filters work

### Lead Capture Tests
- [ ] LEAD-001: Gated resource shows form on public page
- [ ] LEAD-002: Form requires selected fields
- [ ] LEAD-003: Submission stores lead
- [ ] LEAD-004: Download link sent after submission
- [ ] LEAD-005: Lead appears in database

---

## Epic 8: Job Management

### Functional Tests
- [ ] JOB-001: Jobs list page loads
- [ ] JOB-002: Create new job opens editor
- [ ] JOB-003: Job details tab saves correctly
- [ ] JOB-004: Requirements tab add/remove works
- [ ] JOB-005: Compensation calculations accurate
- [ ] JOB-006: Settings tab configures job
- [ ] JOB-007: High rate triggers approval workflow
- [ ] JOB-008: Hot priority triggers approval
- [ ] JOB-009: Draft saves without publishing
- [ ] JOB-010: Publish makes job live
- [ ] JOB-011: Job appears on public job board
- [ ] JOB-012: Applications tracked correctly
- [ ] JOB-013: Job search works
- [ ] JOB-014: Job filters functional
- [ ] JOB-015: Job duplication works
- [ ] JOB-016: Job archiving works
- [ ] JOB-017: Job analytics display
- [ ] JOB-018: Approval workflow routes correctly
- [ ] JOB-019: Bulk import works
- [ ] JOB-020: Job export works

---

## Epic 9: Talent Management

### Functional Tests
- [ ] TAL-001: Talent directory loads
- [ ] TAL-002: Advanced search works (skills, location, rate)
- [ ] TAL-003: Candidate profile view shows all data
- [ ] TAL-004: Candidate editor saves correctly
- [ ] TAL-005: Skills management add/remove works
- [ ] TAL-006: Availability status updates
- [ ] TAL-007: Resume upload stores file
- [ ] TAL-008: Rating system works
- [ ] TAL-009: Placement history displays
- [ ] TAL-010: Notes/comments save
- [ ] TAL-011: Job matching suggests candidates
- [ ] TAL-012: Grid/list toggle works
- [ ] TAL-013: Bulk operations functional
- [ ] TAL-014: Candidate export works
- [ ] TAL-015: Candidate import works
- [ ] TAL-016: Favorites/tags functional
- [ ] TAL-017: Communication log tracks interactions

---

## Epic 10: Banner Management

### Functional Tests
- [ ] BAN-001: Banners list page loads
- [ ] BAN-002: Banner editor form works
- [ ] BAN-003: Image upload accepts files
- [ ] BAN-004: Placement selector works
- [ ] BAN-005: Scheduling date/time works
- [ ] BAN-006: Device targeting configures
- [ ] BAN-007: Preview shows banner mockup
- [ ] BAN-008: Active/paused toggle works
- [ ] BAN-009: Banner displays on configured pages
- [ ] BAN-010: Impressions track correctly
- [ ] BAN-011: Clicks track correctly
- [ ] BAN-012: CTR calculates accurately
- [ ] BAN-013: A/B testing splits traffic
- [ ] BAN-014: Priority/order determines display
- [ ] BAN-015: Analytics show performance

---

## Epic 11: Media Library

### Functional Tests
- [ ] MED-001: Media library page loads
- [ ] MED-002: Drag-and-drop upload works
- [ ] MED-003: Multi-file upload works
- [ ] MED-004: Progress bars display per file
- [ ] MED-005: Images auto-optimize
- [ ] MED-006: Folders can be created
- [ ] MED-007: Files can be moved to folders
- [ ] MED-008: Breadcrumb navigation works
- [ ] MED-009: Grid view displays thumbnails
- [ ] MED-010: List view shows metadata
- [ ] MED-011: Media selector dialog opens
- [ ] MED-012: Media search works
- [ ] MED-013: Filter by type works
- [ ] MED-014: Bulk selection works
- [ ] MED-015: Bulk delete works
- [ ] MED-016: Alt text can be edited
- [ ] MED-017: Usage tracking shows where used
- [ ] MED-018: Duplicate detection works
- [ ] MED-019: File size limits enforced

### Integration Tests
- [ ] INT-001: Featured image selector works in blog editor
- [ ] INT-002: File selector works in resource editor
- [ ] INT-003: Image insert works in rich text editor
- [ ] INT-004: Banner image selector works

---

## Epic 12: Course Management

### Functional Tests
- [ ] COURSE-001: Courses list page loads
- [ ] COURSE-002: Course builder interface works
- [ ] COURSE-003: Can drag topics into course
- [ ] COURSE-004: Topic sequence can be reordered
- [ ] COURSE-005: Course metadata saves
- [ ] COURSE-006: Prerequisites configure correctly
- [ ] COURSE-007: Duration calculates automatically
- [ ] COURSE-008: Course preview works
- [ ] COURSE-009: Publish makes course available
- [ ] COURSE-010: Enrollment tracking works
- [ ] COURSE-011: Progress analytics display
- [ ] COURSE-012: Duplication works
- [ ] COURSE-013: Version management works
- [ ] COURSE-014: Templates save/load
- [ ] COURSE-015: Certificate configuration works
- [ ] COURSE-016: Recommendations display

---

## Epic 13: Analytics Dashboard

### Functional Tests
- [ ] ANAL-001: Analytics page loads at `/admin/analytics`
- [ ] ANAL-002: Date range selector works
- [ ] ANAL-003: User growth chart renders
- [ ] ANAL-004: Revenue trends chart displays
- [ ] ANAL-005: Jobs by status chart accurate
- [ ] ANAL-006: Blog performance metrics calculate
- [ ] ANAL-007: Resource download analytics display
- [ ] ANAL-008: Candidate pipeline funnel shows
- [ ] ANAL-009: Placement success rate calculates
- [ ] ANAL-010: Cross-sell metrics display
- [ ] ANAL-011: Pod comparison chart works
- [ ] ANAL-012: CSV export downloads
- [ ] ANAL-013: PDF export generates
- [ ] ANAL-014: Real-time updates functional

### Data Accuracy Tests
- [ ] DATA-001: User count matches database
- [ ] DATA-002: Revenue calculations accurate
- [ ] DATA-003: Conversion rates correct
- [ ] DATA-004: Trends show correct direction
- [ ] DATA-005: Date filtering accurate

---

## Epic 14: Platform Setup

### Functional Tests
- [ ] SETUP-001: Setup page loads at `/admin/training-content/setup`
- [ ] SETUP-002: Storage bucket status shows
- [ ] SETUP-003: Can create storage bucket
- [ ] SETUP-004: Email config verification works
- [ ] SETUP-005: Database schema check works
- [ ] SETUP-006: RLS policies verified
- [ ] SETUP-007: Migration runner executes
- [ ] SETUP-008: Environment check shows status
- [ ] SETUP-009: API integration tests run
- [ ] SETUP-010: System status dashboard accurate

### System Tests
- [ ] SYS-001: Storage bucket accessible
- [ ] SYS-002: Files upload to bucket
- [ ] SYS-003: RLS policies enforce correctly
- [ ] SYS-004: All tables exist
- [ ] SYS-005: Email sends successfully

---

## Epic 15: Content Upload

### Functional Tests
- [ ] UPL-001: Upload page loads at `/admin/training-content/content-upload`
- [ ] UPL-002: Product selector works
- [ ] UPL-003: Topic selector filters by product
- [ ] UPL-004: File upload accepts PDFs
- [ ] UPL-005: File validation enforces types
- [ ] UPL-006: Size validation enforces limits
- [ ] UPL-007: Progress bars display per file
- [ ] UPL-008: Upload links files to topic
- [ ] UPL-009: Success confirmation shows
- [ ] UPL-010: Error handling shows failures
- [ ] UPL-011: Retry works for failed uploads
- [ ] UPL-012: Upload history shows past uploads

---

## Cross-Epic Integration Tests

### Navigation Flow
- [ ] NAV-001: Can navigate between all admin sections
- [ ] NAV-002: Sidebar active state correct
- [ ] NAV-003: Breadcrumb navigation works
- [ ] NAV-004: Back buttons return correctly
- [ ] NAV-005: All links functional

### Data Integrity
- [ ] DATA-010: Blog post shows featured image from media library
- [ ] DATA-011: Resource file downloads correctly
- [ ] DATA-012: Course contains correct topics
- [ ] DATA-013: Job shows applications
- [ ] DATA-014: Audit logs track all changes

### Real-time Features
- [ ] RT-001: Dashboard auto-refreshes
- [ ] RT-002: Audit logs update in real-time
- [ ] RT-003: Multiple admins don't conflict

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] A11Y-010: Can tab through all interactive elements
- [ ] A11Y-011: Focus indicators visible
- [ ] A11Y-012: No keyboard traps
- [ ] A11Y-013: Skip navigation link works
- [ ] A11Y-014: Modal dialogs trap focus correctly

### Screen Reader
- [ ] A11Y-020: All images have alt text
- [ ] A11Y-021: Form fields have labels
- [ ] A11Y-022: Buttons have descriptive text
- [ ] A11Y-023: Tables have proper headers
- [ ] A11Y-024: Dynamic content changes announced

### Color Contrast
- [ ] A11Y-030: Text meets 4.5:1 ratio
- [ ] A11Y-031: Large text meets 3:1 ratio
- [ ] A11Y-032: Interactive elements meet 3:1 ratio
- [ ] A11Y-033: Focus indicators meet contrast requirements

---

## Performance Testing

### Load Times
- [ ] PERF-010: Dashboard loads in < 2s
- [ ] PERF-011: Blog list loads in < 1.5s
- [ ] PERF-012: Media library loads in < 2s
- [ ] PERF-013: User directory loads in < 1.5s
- [ ] PERF-014: Analytics loads in < 3s

### Lighthouse Scores
- [ ] PERF-020: Performance > 90
- [ ] PERF-021: Accessibility > 95
- [ ] PERF-022: Best Practices > 90
- [ ] PERF-023: SEO > 90

---

## Mobile Responsive Testing

### Devices to Test
- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13 (390px width)
- [ ] iPad (768px width)
- [ ] iPad Pro (1024px width)

### Mobile Tests
- [ ] MOB-001: Sidebar collapses to menu on mobile
- [ ] MOB-002: Tables scroll horizontally
- [ ] MOB-003: Grids stack vertically
- [ ] MOB-004: Touch targets min 44x44px
- [ ] MOB-005: Forms usable on mobile
- [ ] MOB-006: Modals fit screen
- [ ] MOB-007: Text readable (min 14px)

---

## Browser Compatibility

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Cross-browser Tests
- [ ] BROWSER-001: All features work in Chrome
- [ ] BROWSER-002: All features work in Firefox
- [ ] BROWSER-003: All features work in Safari
- [ ] BROWSER-004: All features work in Edge
- [ ] BROWSER-005: No console errors in any browser

---

## Security Testing

### Authentication
- [ ] SEC-020: Cannot access admin without login
- [ ] SEC-021: Session expires after timeout
- [ ] SEC-022: Logout clears session completely
- [ ] SEC-023: Cannot reuse old session tokens

### Authorization
- [ ] SEC-030: Non-admin redirected from admin portal
- [ ] SEC-031: Role permissions enforced server-side
- [ ] SEC-032: API routes check authentication
- [ ] SEC-033: Database RLS policies enforce access

### Data Security
- [ ] SEC-040: Sensitive data not exposed in client
- [ ] SEC-041: SQL injection prevented
- [ ] SEC-042: XSS attacks prevented
- [ ] SEC-043: CSRF protection active

---

## Regression Testing

After each epic implementation, verify:

- [ ] REG-001: Previous epics still work
- [ ] REG-002: No broken links
- [ ] REG-003: No console errors
- [ ] REG-004: No TypeScript errors
- [ ] REG-005: All tests still passing

---

## User Acceptance Testing

### Scenario 1: Daily Admin Routine
1. Login as admin
2. Check dashboard metrics
3. Review audit logs
4. Publish blog post
5. Respond to job applications
6. Upload new resource
7. Review analytics
8. Logout

**Expected**: All operations complete successfully in < 15 minutes

### Scenario 2: Content Publishing
1. Create blog post with images
2. Optimize for SEO
3. Schedule for future
4. Verify preview
5. Publish immediately

**Expected**: Post live on public site within 1 minute

### Scenario 3: Recruitment Workflow
1. Create job posting
2. Set as high priority (triggers approval)
3. Approve job
4. Job goes live
5. Review applications
6. Match candidates

**Expected**: Complete workflow functional

---

## Pre-Production Checklist

### Code Quality
- [ ] No console.log statements in production code
- [ ] No TODO comments
- [ ] No commented-out code
- [ ] TypeScript strict mode passing
- [ ] ESLint no errors
- [ ] Prettier formatted

### Documentation
- [ ] All epic documentation complete
- [ ] README updated
- [ ] API documentation current
- [ ] User guide available
- [ ] Troubleshooting guide complete

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Email configured
- [ ] Analytics tracking active
- [ ] Error monitoring active
- [ ] Backup system configured

---

## Post-Production Monitoring

### First 24 Hours
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Monitor user feedback
- [ ] Check security logs

### First Week
- [ ] Review analytics data
- [ ] Check audit logs
- [ ] Verify backups working
- [ ] Monitor storage usage
- [ ] Review support tickets

---

**Total Test Cases**: 250+  
**Critical Tests**: 50  
**Must Pass Before Production**: All Critical Tests

---

**Testing Status**: Ready for QA  
**Last Updated**: Auto-generated from epic documentation

