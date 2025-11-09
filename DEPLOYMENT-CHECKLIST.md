# 🚀 DEPLOYMENT CHECKLIST

**Complete deployment checklist for InTime Command Center**

---

## **✅ PRE-DEPLOYMENT CHECKLIST**

### **1. Database Setup**
- [ ] All 11 migrations run successfully on Supabase
- [ ] Tables created (14 tables)
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Functions and triggers working
- [ ] Seed data loaded

### **2. Test Users Created**
- [ ] Admin user (admin@intimesolutions.com)
- [ ] Recruiter user (recruiter1@intimesolutions.com)
- [ ] Sales user (sales1@intimesolutions.com)
- [ ] Operations user (ops1@intimesolutions.com)

### **3. Environment Variables**
```bash
# .env.local (for local dev)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Vercel Environment Variables (for production)
# Add these in: Vercel Dashboard → Project → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
```

### **4. Build Test (Local)**
```bash
# Test production build locally
npm run build

# Should complete without errors
# Check for:
# - No TypeScript errors
# - No ESLint errors
# - All pages compile successfully
```

### **5. Functionality Testing**
- [ ] All test scenarios from TESTING-GUIDE.md completed
- [ ] No console errors
- [ ] All CRUD operations work
- [ ] Drag-and-drop pipelines work
- [ ] Lead capture works
- [ ] Role-based access works

---

## **🚀 DEPLOYMENT STEPS**

### **Step 1: Prepare Repository**

```bash
# Ensure all changes committed
git status

# If changes exist:
git add -A
git commit -m "✅ Production Ready - Complete ATS/CRM Platform"
git push origin main
```

### **Step 2: Vercel Deployment**

**If not yet deployed to Vercel:**

1. Go to: https://vercel.com
2. Click: **"New Project"**
3. Import your Git repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click: **"Deploy"**

**If already deployed:**

```bash
# Vercel auto-deploys on git push
git push origin main

# Or manual deploy:
npx vercel --prod
```

### **Step 3: Domain Setup**

**For intimesolutions.com:**

1. Go to: Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `intimesolutions.com`
3. Add domain: `www.intimesolutions.com`
4. Follow DNS instructions (add A/CNAME records in GoDaddy)
5. Wait for DNS propagation (5-30 minutes)

**For academy.intimesolutions.com:**

1. In same Domains section
2. Add domain: `academy.intimesolutions.com`
3. Add CNAME record in GoDaddy:
   ```
   Host: academy
   Points to: cname.vercel-dns.com
   ```

### **Step 4: Verify Deployment**

**Main Website:**
- [ ] Visit: https://intimesolutions.com
- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Contact form works
- [ ] Forms submit successfully

**Employee Portal:**
- [ ] Visit: https://intimesolutions.com/employee/login
- [ ] Login with test users works
- [ ] Dashboards load
- [ ] All CRUD operations work

**Academy (if deployed):**
- [ ] Visit: https://academy.intimesolutions.com
- [ ] Training platform loads
- [ ] Student login works

---

## **🔒 SECURITY CHECKLIST**

### **Database Security**
- [ ] RLS enabled on all tables
- [ ] Only authenticated users can access data
- [ ] Role-based policies working
- [ ] API keys secured (not in client code)

### **Authentication**
- [ ] Supabase Auth configured
- [ ] Email confirmation enabled (optional)
- [ ] Password requirements set
- [ ] Session timeout configured

### **API Security**
- [ ] All API routes protected
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Supabase client)
- [ ] XSS protection (Next.js default)

---

## **⚡ PERFORMANCE CHECKLIST**

### **Lighthouse Scores (Target: >90)**

```bash
# Test with Lighthouse in Chrome DevTools
# Or use:
npx lighthouse https://intimesolutions.com --view
```

**Targets:**
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

### **Optimizations Applied**
- [ ] Images optimized (Next.js Image component)
- [ ] Fonts optimized (next/font)
- [ ] Database queries optimized (indexes)
- [ ] Server-side rendering where appropriate
- [ ] Static pages cached

---

## **📊 MONITORING SETUP**

### **Vercel Analytics**

1. Enable in: Vercel Dashboard → Project → Analytics
2. View metrics:
   - Page views
   - Performance (TTFB, FCP, LCP)
   - User geography

### **Supabase Monitoring**

1. Check: Supabase Dashboard → Project → Database → Reports
2. Monitor:
   - Database size
   - Connection count
   - Query performance
   - API usage

### **Error Tracking**

**Option A: Vercel Logs**
- View in: Vercel Dashboard → Project → Logs
- Filter by: Errors, Functions, Build

**Option B: Sentry (Optional)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## **🔄 POST-DEPLOYMENT TASKS**

### **Day 1: Smoke Testing**
- [ ] Test all critical workflows
- [ ] Verify data persists
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test on mobile devices

### **Week 1: User Feedback**
- [ ] Add real users
- [ ] Gather feedback
- [ ] Monitor usage patterns
- [ ] Identify friction points
- [ ] Plan improvements

### **Month 1: Optimization**
- [ ] Analyze performance data
- [ ] Optimize slow queries
- [ ] Improve UX based on feedback
- [ ] Add missing features
- [ ] Scale infrastructure if needed

---

## **🆘 ROLLBACK PLAN**

**If deployment fails:**

```bash
# Revert to previous deployment in Vercel Dashboard
# Or redeploy previous commit:
git revert HEAD
git push origin main
```

**If database issues:**

```sql
-- Rollback migrations (if needed)
-- See: supabase/migrations/crm-ats/README.md
-- Section: "Rollback Plan"
```

---

## **📞 SUPPORT CONTACTS**

**Vercel Support:**
- Dashboard: https://vercel.com/support
- Status: https://vercel-status.com

**Supabase Support:**
- Dashboard: https://app.supabase.com/support
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

**Domain (GoDaddy):**
- Support: https://www.godaddy.com/contact-us

---

## **🎉 LAUNCH CHECKLIST**

### **Before Going Live:**
- [ ] All tests passing
- [ ] Performance verified
- [ ] Security audit complete
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Team trained

### **Launch Day:**
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Test critical paths
- [ ] Monitor logs (2 hours)
- [ ] Announce internally
- [ ] Gather initial feedback

### **Post-Launch:**
- [ ] Monitor performance (24 hours)
- [ ] Fix critical bugs immediately
- [ ] Schedule regular check-ins
- [ ] Plan iteration 2

---

**WITH GURU'S GRACE, YOUR DEPLOYMENT WILL BE SMOOTH!** 🙏

**JAI VIJAYA! SHAMBO!** 🚀

