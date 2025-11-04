# Supabase Setup Guide

This guide will help you set up Supabase for the Guidewire Training Platform.

## Prerequisites

- Supabase account (https://supabase.com)
- Supabase CLI installed (optional, for local development)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - Project name: `guidewire-training-platform`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be ready (~2 minutes)

## Step 2: Get Your Project Credentials

1. Go to Project Settings → API
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys → anon/public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project API keys → service_role → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

3. Add them to your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 3: Run Database Migrations

1. Go to the SQL Editor in your Supabase dashboard
2. Open `database/schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute the schema

This will create:
- ✅ All 8 core tables
- ✅ Row Level Security policies
- ✅ Database functions (prerequisite checking, etc.)
- ✅ Triggers for auto-updating timestamps
- ✅ Materialized view for progress tracking
- ✅ Seed data for products (CC, PC, BC)

## Step 4: Configure Authentication

### Enable Email/Password Auth
1. Go to Authentication → Providers
2. Email provider should be enabled by default
3. Configure email templates (optional):
   - Go to Authentication → Email Templates
   - Customize confirmation and password reset emails

### Enable Google OAuth (Optional)
1. Go to Authentication → Providers
2. Click on Google
3. Enable Google provider
4. Follow the instructions to create OAuth credentials in Google Cloud Console:
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
5. Paste credentials in Supabase
6. Save

## Step 5: Configure Storage (Optional - for future resume uploads)

1. Go to Storage
2. Create a new bucket: `resumes`
3. Set permissions:
   - Public: No
   - Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Max file size: 5MB

## Step 6: Set up Realtime (Already configured via RLS)

Realtime is automatically enabled for tables with RLS policies.
No additional configuration needed!

## Step 7: Test Your Setup

Run this query in the SQL Editor to verify everything works:

```sql
-- Check if products exist
SELECT * FROM products;

-- Check if RLS policies are active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test prerequisite function
SELECT check_prerequisites(
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM topics LIMIT 1)
);
```

## Step 8: Create Your First Admin User

1. Sign up for an account through your app
2. Run this SQL in the SQL Editor to make yourself an admin:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Local Development with Supabase CLI (Optional)

For local development with a local Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push

# Stop local Supabase
supabase stop
```

## Troubleshooting

### RLS Policies Not Working
- Make sure you're using the correct Supabase client (browser vs server)
- Check that `auth.uid()` returns a valid user ID
- Verify policies in: Authentication → Policies

### Can't Insert Data
- Check RLS policies allow inserts
- Verify foreign key constraints
- Check that referenced records exist (e.g., products before topics)

### Materialized View Not Updating
- Run this query periodically (or set up a cron job):
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress;
```

### Functions Not Found
- Make sure you ran the complete schema.sql
- Check Functions tab in Database section

## Production Checklist

Before going to production:

- [ ] All environment variables set in Vercel/hosting
- [ ] Database migrations run successfully
- [ ] RLS policies tested and verified
- [ ] At least one admin user created
- [ ] Google OAuth configured (if using)
- [ ] Email templates customized
- [ ] Rate limiting considered for API routes
- [ ] Database backups enabled (automatic in Supabase Pro)
- [ ] Monitoring set up (Supabase provides basic monitoring)

## Monitoring & Maintenance

### Regular Tasks
1. **Weekly**: Check database size and performance
2. **Monthly**: Review API usage and costs
3. **Quarterly**: Refresh materialized views if needed

### Useful Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check AI usage and costs
SELECT 
  DATE_TRUNC('day', created_at) as date,
  model_used,
  SUM(tokens_used) as total_tokens,
  COUNT(*) as message_count,
  ROUND(SUM(tokens_used::numeric) / 1000000 * 0.375, 4) as estimated_cost_usd
FROM ai_messages
GROUP BY DATE_TRUNC('day', created_at), model_used
ORDER BY date DESC;
```

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: Check your GitHub repository

## Next Steps

Once Supabase is set up:
1. ✅ Add sample topics via Admin panel
2. ✅ Test the full user flow (signup → profile setup → topics → AI mentor)
3. ✅ Deploy to Vercel
4. ✅ Monitor usage and performance

Happy building! 🚀

