# Admin Portal - Production Deployment Guide

**Version**: 1.0  
**Last Updated**: 2025-11-14  
**Target**: Production deployment of complete admin portal

---

## Pre-Deployment Checklist

### Code Quality
- [x] All 15 epics implemented
- [x] TypeScript strict mode passing
- [x] ESLint no errors
- [ ] Remove all console.log statements
- [ ] Remove all TODO comments
- [ ] Code review complete

### Database
- [ ] All migrations run successfully
- [ ] RLS policies verified
- [ ] Indexes created for performance
- [ ] Audit logging triggers active
- [ ] Test data cleaned up

### Environment Variables
```bash
# Required variables
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=https://intimesolutions.com

# Optional
RESEND_API_KEY=xxx (for emails)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (Google Analytics)
```

### Storage Configuration
- [ ] `training-content` bucket created
- [ ] `media` bucket created
- [ ] Storage policies configured
- [ ] CDN enabled (if using)

---

## Deployment Steps

### Step 1: Build Verification
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Lint check
npm run lint

# Build for production
npm run build

# Verify build succeeded
ls -la .next/
```

### Step 2: Database Setup
```bash
# Run migrations
npx supabase db push

# Verify tables
npx supabase db inspect

# Seed initial data (if needed)
npx supabase db seed
```

### Step 3: Environment Configuration
```bash
# Set production environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Verify variables
vercel env ls
```

### Step 4: Deploy to Staging
```bash
# Deploy to preview
vercel --prod=false

# Get preview URL
# Test all features on preview deployment
```

### Step 5: Smoke Testing on Staging
- [ ] Admin login works
- [ ] Dashboard loads with data
- [ ] Can create blog post
- [ ] Can upload resource
- [ ] Can create job
- [ ] All navigation works
- [ ] No console errors
- [ ] Mobile responsive

### Step 6: Deploy to Production
```bash
# Deploy to production
vercel --prod

# Verify deployment
vercel inspect <deployment-url>
```

---

## Post-Deployment Verification

### Immediate Checks (First 15 Minutes)
- [ ] Admin login accessible
- [ ] Dashboard loads
- [ ] No 500 errors in logs
- [ ] Database connections working
- [ ] Storage uploads working
- [ ] Email sending working

### First Hour Monitoring
- [ ] Check error rates (should be < 1%)
- [ ] Monitor performance metrics
- [ ] Verify all admin features working
- [ ] Check analytics tracking
- [ ] Monitor database query performance

### First 24 Hours
- [ ] Review error logs
- [ ] Check performance trends
- [ ] Monitor user activity
- [ ] Verify backups running
- [ ] Check storage usage

---

## Rollback Plan

If critical issues arise:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force

# Verify rollback successful
vercel ls
```

---

## Monitoring Setup

### Error Tracking
Configure Sentry or similar:
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
Use Vercel Analytics (built-in) or Google Analytics.

### Uptime Monitoring
- Configure uptime monitoring (e.g., Uptime Robot)
- Monitor `/admin` endpoint
- Alert on downtime

---

## Maintenance Schedule

### Daily
- Review error logs
- Check performance metrics
- Monitor storage usage

### Weekly
- Review audit logs
- Check for security updates
- Update dependencies (if needed)

### Monthly
- Performance audit
- Security audit
- Backup verification
- Cost review

---

## Support Contacts

- **Technical Issues**: Check documentation first
- **Database Issues**: Review Supabase dashboard
- **Deployment Issues**: Check Vercel logs
- **Security Issues**: Immediate escalation

---

**Deployment Status**: ⏳ Ready for staging deployment  
**Approval Required**: Yes (final sign-off needed)

