# CMS Database Migration Instructions

## How to Run the CMS Migration

Since we can't run migrations locally without Docker, you need to run this migration directly in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy the entire contents of `run-cms-migration.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

## What This Migration Creates

### Core Tables:
- **media_assets** - Central media library for all uploads
- **blog_posts** - Blog articles with SEO, drafts, and versioning
- **blog_post_versions** - Revision history for blog posts
- **resources** - Downloadable content (whitepapers, guides, etc.)
- **banners** - Promotional banners with scheduling and analytics
- **cms_pages** - Dynamic page content management
- **resource_downloads** - Track resource download analytics
- **banner_analytics** - Track banner impressions and clicks
- **cms_audit_log** - Audit trail for all CMS actions

### Key Features:
- Full-text search on blog posts
- Version control for blog posts
- Banner A/B testing support
- Resource download tracking with lead capture
- Comprehensive audit logging
- Row-level security policies
- Performance-optimized indexes

## After Running the Migration

1. Verify all tables were created successfully
2. Check that no errors occurred
3. The migration script handles existing objects gracefully
4. Initial folder structure for media library is created automatically

## Troubleshooting

If you encounter any errors:
- The script uses IF NOT EXISTS clauses to avoid conflicts
- All policies check for existence before creation
- You can run the script multiple times safely

## Next Steps

After the migration is complete, we'll build:
1. Rich text editor with markdown support
2. Media library interface
3. Blog management CRUD
4. Banner management system
5. Resource hub interface


