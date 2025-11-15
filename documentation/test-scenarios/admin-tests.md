# Admin Workflow - Test Scenarios

> **Test User:** `admin@intimeesolutions.com` | Password: `test12345`  
> **Test Environment:** Development/Staging  
> **Last Updated:** January 2025

---

## 📋 Test Scenarios Overview

This document contains comprehensive test scenarios for the Admin workflow. Each scenario includes:
- **Test ID:** Unique identifier
- **Test Name:** Descriptive name
- **Priority:** High, Medium, or Low
- **Prerequisites:** What needs to be set up before testing
- **Test Steps:** Detailed step-by-step instructions
- **Expected Results:** What should happen
- **Actual Results:** (To be filled during testing)
- **Status:** Pass/Fail/Blocked

---

## 🔐 Authentication & Access Control Tests

### Test ADM-001: Admin Login

**Priority:** High  
**Prerequisites:** Admin user exists with `role='admin'`

**Test Steps:**
1. Navigate to `/admin`
2. Should redirect to `/login` if not authenticated
3. Enter admin email: `admin@intimeesolutions.com`
4. Enter password: `test12345`
5. Click "Sign In"

**Expected Results:**
- ✅ Redirects to `/admin` dashboard after login
- ✅ Admin sidebar visible
- ✅ CEO Dashboard displays
- ✅ No access denied errors

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-002: Non-Admin Access Denied

**Priority:** High  
**Prerequisites:** Non-admin user exists (e.g., student user)

**Test Steps:**
1. Logout if logged in as admin
2. Login as non-admin user (e.g., `student.amy@intimeesolutions.com`)
3. Navigate to `/admin` directly

**Expected Results:**
- ✅ Redirects to appropriate portal (`/academy` for students)
- ✅ Access denied message (if shown)
- ✅ Cannot access admin routes

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-003: Session Persistence

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Login as admin
2. Navigate to `/admin`
3. Refresh page (F5)
4. Navigate to different admin routes
5. Close browser tab
6. Reopen browser and navigate to `/admin`

**Expected Results:**
- ✅ Session persists on refresh
- ✅ Can navigate between routes without re-login
- ✅ Session expires appropriately (if configured)
- ✅ Re-login required after session expiry

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 👥 User Management Tests

### Test ADM-004: View All Users

**Priority:** High  
**Prerequisites:** Admin logged in, multiple users exist

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "User Management" tab
3. View user list

**Expected Results:**
- ✅ All users displayed
- ✅ User details visible (name, email, role, created date)
- ✅ Users sorted by creation date (newest first)
- ✅ Pagination works (if many users)

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-005: Search Users

**Priority:** Medium  
**Prerequisites:** Admin logged in, multiple users exist

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "User Management" tab
3. Enter search term in search box (e.g., "student")
4. Verify results filtered

**Expected Results:**
- ✅ Search filters users by name or email
- ✅ Results update in real-time
- ✅ Clear search resets list
- ✅ Case-insensitive search

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-006: Filter Users by Role

**Priority:** Medium  
**Prerequisites:** Admin logged in, users with different roles exist

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "User Management" tab
3. Select role filter (e.g., "student")
4. Verify filtered results

**Expected Results:**
- ✅ Only users with selected role displayed
- ✅ Filter dropdown shows all roles
- ✅ Clear filter resets list
- ✅ Filter persists during navigation

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-007: Update User Role

**Priority:** High  
**Prerequisites:** Admin logged in, test user exists

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "User Management" tab
3. Find a test user (e.g., student user)
4. Click "Edit" button
5. Select new role from dropdown (e.g., change "student" to "recruiter")
6. Click "Save" or "Update"
7. Verify role change saved
8. Check audit log

**Expected Results:**
- ✅ Role update dialog opens
- ✅ Role dropdown shows all available roles
- ✅ Role change saved successfully
- ✅ User list reflects new role
- ✅ Audit log entry created with:
  - Action: "update"
  - Entity type: "user"
  - Old role and new role
  - Admin user ID
  - Timestamp

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-008: View Role Statistics

**Priority:** Low  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "Roles & Permissions" tab
3. View role statistics

**Expected Results:**
- ✅ All roles displayed with user counts
- ✅ Role descriptions visible
- ✅ Permission matrix shown
- ✅ Color coding for different roles

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 📝 Content Management Tests

### Test ADM-009: Create Blog Post

**Priority:** High  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/blog`
2. Click "New Post" or "Create Post"
3. Fill in:
   - Title: "Test Blog Post"
   - Slug: "test-blog-post"
   - Excerpt: "This is a test excerpt"
   - Content: "Test content with formatting"
   - Featured image: Upload test image
   - Category: Select category
   - Tags: Add tags
4. Save as draft
5. Verify post appears in list as draft
6. Edit post and publish
7. Verify post status changed to published

**Expected Results:**
- ✅ Blog post form loads
- ✅ All fields save correctly
- ✅ Image uploads successfully
- ✅ Draft saved
- ✅ Post appears in list
- ✅ Can edit and publish
- ✅ Published post appears on public site

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-010: Edit Blog Post

**Priority:** High  
**Prerequisites:** Admin logged in, blog post exists

**Test Steps:**
1. Navigate to `/admin/blog`
2. Click on existing blog post
3. Update title, content, or image
4. Save changes
5. Verify changes reflected

**Expected Results:**
- ✅ Post loads in edit mode
- ✅ Changes save successfully
- ✅ Updated content visible
- ✅ Audit log entry created

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-011: Delete Blog Post

**Priority:** Medium  
**Prerequisites:** Admin logged in, blog post exists

**Test Steps:**
1. Navigate to `/admin/blog`
2. Find test blog post
3. Click delete/trash icon
4. Confirm deletion
5. Verify post removed from list
6. Check audit log

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Post deleted successfully
- ✅ Post removed from list
- ✅ Audit log entry created
- ✅ Post no longer visible on public site

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-012: Create Resource

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/resources`
2. Click "New Resource" or "Create Resource"
3. Fill in:
   - Title: "Test Resource"
   - Description: "Test description"
   - File: Upload PDF or DOCX file
   - Category: Select category
   - Visibility: Set visibility
4. Save resource
5. Verify resource appears in list

**Expected Results:**
- ✅ Resource form loads
- ✅ File uploads successfully
- ✅ Resource saved
- ✅ Resource appears in list
- ✅ Resource available for download (if public)

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-013: Manage Banners

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/banners`
2. Click "New Banner"
3. Upload banner image
4. Set:
   - Title
   - Link URL
   - Display dates (start/end)
   - Priority/order
   - Status (active/inactive)
5. Save banner
6. Verify banner appears in list
7. Verify banner displays on homepage (if active)

**Expected Results:**
- ✅ Banner form loads
- ✅ Image uploads successfully
- ✅ Banner saved
- ✅ Banner appears in list
- ✅ Active banners display on homepage
- ✅ Scheduling works correctly

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 🎓 Training Content Tests

### Test ADM-014: Create Training Topic

**Priority:** High  
**Prerequisites:** Admin logged in, product/course exists

**Test Steps:**
1. Navigate to `/admin/training-content/topics`
2. Click "Create Topic" or "New Topic"
3. Fill in:
   - Topic title
   - Product (ClaimCenter, PolicyCenter, etc.)
   - Description
   - Prerequisites
   - Learning objectives
4. Save topic
5. Verify topic appears in list

**Expected Results:**
- ✅ Topic form loads
- ✅ Product dropdown populated
- ✅ Topic saved successfully
- ✅ Topic appears in topics list
- ✅ Topic accessible to students (if published)

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-015: Edit Training Topic

**Priority:** High  
**Prerequisites:** Admin logged in, topic exists

**Test Steps:**
1. Navigate to `/admin/training-content/topics`
2. Click on existing topic
3. Update title, description, or content
4. Add learning blocks
5. Save changes
6. Verify changes reflected

**Expected Results:**
- ✅ Topic loads in edit mode
- ✅ Changes save successfully
- ✅ Learning blocks added
- ✅ Updated content visible
- ✅ Students see updated content

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-016: Upload Training Content

**Priority:** High  
**Prerequisites:** Admin logged in, topic exists

**Test Steps:**
1. Navigate to `/admin/training-content/content-upload`
2. Select topic from dropdown
3. Upload slides (PDF)
4. Upload demo video
5. Add assignment/exercise
6. Save uploads
7. Verify content linked to topic

**Expected Results:**
- ✅ Content upload form loads
- ✅ Topic selection works
- ✅ Files upload successfully
- ✅ Content stored in Supabase Storage
- ✅ Content accessible in topic view
- ✅ Students can download/view content

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-017: View Training Analytics

**Priority:** Medium  
**Prerequisites:** Admin logged in, students enrolled

**Test Steps:**
1. Navigate to `/admin/training-content/analytics`
2. View student progress metrics
3. View completion trends
4. View AI usage statistics
5. Filter by date range
6. Filter by product/course

**Expected Results:**
- ✅ Analytics dashboard loads
- ✅ Metrics displayed correctly
- ✅ Charts render properly
- ✅ Filters work
- ✅ Data accurate
- ✅ Export functionality works (if available)

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 📊 Analytics Tests

### Test ADM-018: View Business Analytics

**Priority:** High  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/analytics`
2. View revenue metrics
3. View placement statistics
4. View user growth
5. Filter by date range
6. Export report (if available)

**Expected Results:**
- ✅ Analytics dashboard loads
- ✅ Metrics displayed
- ✅ Charts/graphs render
- ✅ Date filters work
- ✅ Data accurate
- ✅ Export works

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-019: View CEO Dashboard

**Priority:** High  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin` (dashboard)
2. View pod metrics
3. View revenue statistics
4. View cross-sell opportunities
5. View system alerts
6. Click on metrics for details

**Expected Results:**
- ✅ Dashboard loads
- ✅ Pod metrics displayed
- ✅ Revenue stats visible
- ✅ Alerts shown
- ✅ Navigation to details works
- ✅ Data refreshes correctly

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 🖼️ Media Library Tests

### Test ADM-020: Upload Media File

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/media`
2. Click "Upload" button
3. Select image file (JPG, PNG)
4. Add metadata:
   - Alt text
   - Description
   - Tags
5. Upload file
6. Verify file appears in library

**Expected Results:**
- ✅ Upload form loads
- ✅ File uploads successfully
- ✅ File stored in Supabase Storage
- ✅ File appears in media library
- ✅ Metadata saved
- ✅ File usable in content editors

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-021: Search Media Files

**Priority:** Low  
**Prerequisites:** Admin logged in, media files exist

**Test Steps:**
1. Navigate to `/admin/media`
2. Enter search term in search box
3. Verify filtered results
4. Filter by file type
5. Filter by date

**Expected Results:**
- ✅ Search filters files
- ✅ Type filter works
- ✅ Date filter works
- ✅ Results update correctly

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-022: Delete Media File

**Priority:** Low  
**Prerequisites:** Admin logged in, media file exists

**Test Steps:**
1. Navigate to `/admin/media`
2. Find test media file
3. Click delete/trash icon
4. Confirm deletion
5. Verify file removed
6. Check if file still referenced in content

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ File deleted successfully
- ✅ File removed from library
- ✅ Warning if file referenced in content

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 🔍 Audit Log Tests

### Test ADM-023: View Audit Log

**Priority:** High  
**Prerequisites:** Admin logged in, admin actions performed

**Test Steps:**
1. Perform several admin actions (create, update, delete)
2. Navigate to `/admin/permissions`
3. Click "Audit Log" tab
4. View audit entries
5. Verify entries show:
   - Action type
   - Entity type
   - User who performed action
   - IP address
   - Timestamp
   - Changes (before/after)

**Expected Results:**
- ✅ Audit log loads
- ✅ All actions logged
- ✅ Details visible
- ✅ IP addresses captured
- ✅ Timestamps accurate
- ✅ Changes tracked

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-024: Filter Audit Log

**Priority:** Medium  
**Prerequisites:** Admin logged in, audit entries exist

**Test Steps:**
1. Navigate to `/admin/permissions`
2. Click "Audit Log" tab
3. Filter by action type (create, update, delete)
4. Filter by entity type (blog, resource, user)
5. Filter by user
6. Filter by date range

**Expected Results:**
- ✅ Filters work correctly
- ✅ Results update
- ✅ Multiple filters can be combined
- ✅ Clear filters resets list

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## ⚙️ System Setup Tests

### Test ADM-025: Storage Bucket Setup

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/training-content/setup`
2. Click "Setup Storage Bucket"
3. Verify bucket creation
4. Test content upload
5. Verify upload works

**Expected Results:**
- ✅ Setup tool loads
- ✅ Bucket created successfully
- ✅ Permissions configured
- ✅ Uploads work
- ✅ Error handling if bucket exists

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-026: Platform Configuration

**Priority:** Low  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/training-content/setup`
2. Review setup status
3. Verify database connections
4. Verify storage configuration
5. Test integrations

**Expected Results:**
- ✅ Setup status displayed
- ✅ Configuration visible
- ✅ All systems operational
- ✅ Error messages clear (if issues)

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 🎯 Job & Talent Management Tests

### Test ADM-027: Create Job Posting

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/jobs`
2. Click "New Job" or "Create Job"
3. Fill in job details:
   - Title
   - Company/client
   - Location
   - Job type
   - Description
   - Requirements
   - Salary range
4. Publish job
5. Verify job appears on public job board

**Expected Results:**
- ✅ Job form loads
- ✅ Job saved successfully
- ✅ Job appears in admin list
- ✅ Job visible on public site
- ✅ Applications tracked

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

### Test ADM-028: Manage Talent Database

**Priority:** Medium  
**Prerequisites:** Admin logged in

**Test Steps:**
1. Navigate to `/admin/talent`
2. View candidate database
3. Search by skills
4. Search by location
5. Filter by experience
6. Export data (if available)

**Expected Results:**
- ✅ Talent list loads
- ✅ Search works
- ✅ Filters functional
- ✅ Data exportable
- ✅ Candidate profiles viewable

**Actual Results:** _[To be filled during testing]_  
**Status:** ⏭️ Pending

---

## 📈 Test Execution Summary

### Test Statistics

| Status | Count | Percentage |
|--------|-------|------------|
| ⏭️ Pending | 28 | 100% |
| ✅ Pass | 0 | 0% |
| ❌ Fail | 0 | 0% |
| ⚠️ Blocked | 0 | 0% |

### Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Authentication & Access | 3 | ⏭️ Pending |
| User Management | 5 | ⏭️ Pending |
| Content Management | 5 | ⏭️ Pending |
| Training Content | 4 | ⏭️ Pending |
| Analytics | 2 | ⏭️ Pending |
| Media Library | 3 | ⏭️ Pending |
| Audit Log | 2 | ⏭️ Pending |
| System Setup | 2 | ⏭️ Pending |
| Job & Talent | 2 | ⏭️ Pending |

**Total Tests:** 28  
**Tests Executed:** 0  
**Tests Passed:** 0  
**Tests Failed:** 0

---

## 📝 Test Execution Notes

### Environment Setup

- **Test Environment:** Development/Staging
- **Test Database:** Separate test database recommended
- **Test Users:** Use provided test credentials
- **Browser:** Chrome/Firefox latest versions

### Pre-Testing Checklist

- [ ] Admin user created with `role='admin'`
- [ ] Test users created (student, recruiter, etc.)
- [ ] Test content created (blog posts, resources, topics)
- [ ] Storage bucket configured
- [ ] Database migrations run
- [ ] Environment variables configured

### Testing Best Practices

1. **Test in Order:** Follow test sequence for dependencies
2. **Document Results:** Fill in "Actual Results" for each test
3. **Capture Screenshots:** For failed tests
4. **Report Issues:** Log bugs with steps to reproduce
5. **Verify Fixes:** Re-test after fixes applied

---

**Last Updated:** January 2025  
**Next Review:** After test execution  
**Status:** ⏭️ Tests Documented, Execution Pending

