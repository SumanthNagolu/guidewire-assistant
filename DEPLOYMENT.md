# Deployment Guide

This guide covers deploying the Guidewire Training Platform to production.

## Architecture

- **Frontend & API**: Vercel (Next.js)
- **Database & Auth**: Supabase
- **AI**: OpenAI GPT-4o-mini
- **Domain**: Your custom domain (optional)

## Prerequisites

- ✅ Supabase project set up (see `database/SETUP.md`)
- ✅ GitHub repository created
- ✅ OpenAI API key (https://platform.openai.com)
- ✅ Vercel account (https://vercel.com)

## Step 1: Prepare Environment Variables

Create a file with all your environment variables:

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here

# OpenAI (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_key_here

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/guidewire-training.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (leave default)
   - Output Directory: (leave default)

4. Add Environment Variables:
   - Paste all variables from Step 1
   - Click "Deploy"

5. Wait for deployment (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

## Step 4: Update OAuth Redirect URLs

### In Supabase:
1. Go to Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

### For Google OAuth:
1. Go to Google Cloud Console
2. Update OAuth 2.0 Client:
   - Add `https://your-project-ref.supabase.co/auth/v1/callback`
   - Add `https://your-app.vercel.app` to authorized origins

## Step 5: Update App URL Environment Variable

1. In Vercel dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy: Settings → Deployments → Redeploy

## Step 6: Verify Deployment

Test these critical flows:

### Authentication
- [ ] Sign up with email
- [ ] Email verification works
- [ ] Login works
- [ ] Google OAuth works (if configured)
- [ ] Profile setup completes

### Core Features
- [ ] Dashboard loads
- [ ] Topics list displays
- [ ] Topic detail page works
- [ ] Video player loads
- [ ] Progress tracking updates
- [ ] AI mentor responds

### Admin Features
- [ ] Admin can access /admin
- [ ] Topic management works
- [ ] Non-admins are blocked

## Step 7: Add Custom Domain (Optional)

1. In Vercel: Settings → Domains
2. Add your domain: `training.yourdomain.com`
3. Update DNS records as instructed by Vercel
4. Wait for DNS propagation (5-60 minutes)
5. Update environment variable `NEXT_PUBLIC_APP_URL`
6. Update OAuth redirect URLs in Supabase and Google

## Performance Optimization

### Enable Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In return statement
<Analytics />
```

### Enable Speed Insights
```bash
npm install @vercel/speed-insights
```

Add to `app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

// In return statement
<SpeedInsights />
```

## Monitoring & Maintenance

### Vercel Dashboard
- **Deployments**: View deployment history and logs
- **Analytics**: Track page views and user behavior
- **Speed Insights**: Monitor Core Web Vitals
- **Logs**: Real-time function logs

### Supabase Dashboard
- **Database**: Monitor query performance
- **Auth**: Track user signups and logins
- **Storage**: Check file usage
- **API**: Monitor API calls

### Cost Monitoring

**Vercel (Hobby Plan - Free)**
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Upgrade to Pro ($20/month) for:
  - More bandwidth
  - Team features
  - Advanced analytics

**Supabase**
- Free tier: 500MB database, 1GB file storage, 2GB bandwidth
- Pro ($25/month): 8GB database, 100GB file storage, 250GB bandwidth

**OpenAI**
- GPT-4o-mini: $0.15/M input tokens, $0.60/M output tokens
- Estimated: $10-50/month for 100-500 active users

## Troubleshooting

### Build Fails
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run lint
```

### Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Database Connection Issues
- Verify Supabase URL is correct
- Check API keys are not expired
- Ensure RLS policies allow access

### OAuth Not Working
- Verify callback URLs are correct
- Check that OAuth is enabled in Supabase
- Ensure credentials are correct

## Production Checklist

Before launching to users:

- [ ] All environment variables set correctly
- [ ] Database migrations completed
- [ ] At least one admin user created
- [ ] Sample topics added
- [ ] All OAuth redirects configured
- [ ] Custom domain set up (if using)
- [ ] Analytics enabled
- [ ] Error tracking set up
- [ ] Backup strategy in place
- [ ] Cost monitoring configured
- [ ] Performance tested under load
- [ ] Mobile responsiveness verified
- [ ] Security headers configured

## Scaling Considerations

### When you reach 1,000+ users:

**Database**
- Upgrade Supabase to Pro plan
- Enable connection pooling
- Add database indexes for slow queries
- Consider read replicas

**AI Costs**
- Implement aggressive prompt caching
- Add rate limiting per user
- Monitor token usage closely
- Consider response caching for common questions

**Infrastructure**
- Upgrade Vercel to Pro
- Enable edge caching
- Add CDN for static assets
- Consider dedicated AI edge functions

## CI/CD Pipeline (Optional)

Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}}
```

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI Docs**: https://platform.openai.com/docs

## Post-Deployment

1. **Test Everything**: Go through full user flow
2. **Monitor Costs**: Check Supabase and OpenAI usage daily
3. **Gather Feedback**: Have a few beta users test
4. **Iterate**: Fix bugs and improve UX
5. **Scale**: Add more topics and features

🎉 **Congratulations! Your platform is live!**

Next steps:
- Add 50+ topics via admin panel
- Invite beta users
- Monitor usage and costs
- Iterate based on feedback

