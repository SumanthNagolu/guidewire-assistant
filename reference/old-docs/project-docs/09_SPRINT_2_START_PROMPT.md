# Sprint 2 - Deployment & Launch *(Archived)*

> **Note:** Sprint 2 has wrapped. For Sprint 3 kickoff use `project-docs/10_SPRINT_3_START_PROMPT.md`.

**Use this prompt to start the next session with any AI agent (or continue in a new chat):**

---

## 🎯 Context Recovery

I'm continuing development on the **Guidewire Training Platform** - an AI-powered training system that scales proven 1:1 methodology to unlimited students.

### What's Already Built (Sprint 1 - COMPLETE ✅)

**Session 001 delivered a production-ready MVP:**

1. **Complete Tech Stack**
   - Next.js 15 + TypeScript + Tailwind CSS
   - Supabase (PostgreSQL with RLS)
   - OpenAI GPT-4o-mini with streaming
   - shadcn/ui (14 components)
   - Vercel AI SDK

2. **Core Features (100% Complete)**
   - ✅ Authentication (email + Google OAuth)
   - ✅ Database schema (8 tables with RLS policies)
   - ✅ Sequential topic learning with prerequisite locks
   - ✅ Video-based content delivery (YouTube/Loom)
   - ✅ Progress tracking dashboard
   - ✅ AI Mentor with Socratic method
   - ✅ Admin panel for topic management
   - ✅ All critical bugs fixed

3. **Project Stats**
   - 45 TypeScript files
   - 4,738 lines of code
   - 10 clean git commits
   - Zero linting errors
   - ~6-7 hours invested (ahead of 20-28h target)

### Critical Documentation to Review

**MUST READ before starting:**
1. `project-docs/01_VISION.md` - Core mission: Students get JOBS, not just certificates
2. `project-docs/99_CHANGELOG.md` - Complete Session 001 log
3. `project-docs/06_CURRENT_SPRINT.md` - Sprint 1 completion status
4. `instructions.md` - Development patterns and architecture
5. `.cursorrules` - Code standards and rules
6. `database/SETUP.md` - Supabase setup instructions
7. `DEPLOYMENT.md` - Vercel deployment guide
8. `SESSION_001_SUMMARY.md` - Detailed session summary
9. `project-docs/SPRINT_2_RUNBOOK.md` - Ops runbook (env, seeding, beta monitoring)

---

## 🚀 Sprint 2 Goal: Deploy to Production

**Objective:** Take the MVP from local development to live production with initial content.

### Sprint 2 Tasks (Estimated: 4-6 hours)

#### Phase 1: Environment Setup (1 hour)
1. **Create Supabase Project** (15 min)
   - Sign up at supabase.com
   - Create new project
   - Run `database/schema.sql` in SQL Editor
   - Verify all tables, policies, and functions created
   - Get project URL and API keys

2. **Get OpenAI API Key** (5 min)
   - Sign up at platform.openai.com
   - Create API key with GPT-4o-mini access
   - Set up billing (will be charged on usage)

3. **Configure Environment Variables** (10 min)
   - Copy `.env.example` to `.env.local`
   - Add all Supabase keys
   - Add OpenAI API key
   - Set NEXT_PUBLIC_APP_URL

4. **Test Locally** (30 min)
   - Run `npm install` (if needed)
   - Run `npm run dev`
   - Test complete user flow:
     - Sign up → Profile setup → Topics → AI mentor
   - Verify database connections
   - Check AI responses stream correctly

#### Phase 2: Production Deployment (1 hour)
1. **Deploy to Vercel** (20 min)
   - Push to GitHub (already done)
   - Connect repository to Vercel
   - Add environment variables in Vercel dashboard
   - Trigger deployment
   - Verify build succeeds

2. **Update OAuth Redirects** (10 min)
   - In Supabase: Add Vercel URL to redirect URLs
   - In Google Cloud Console: Add Vercel URL (if using Google OAuth)
   - Update NEXT_PUBLIC_APP_URL environment variable

3. **Production Testing** (30 min)
   - Test auth flow in production
   - Verify topics load correctly
   - Test AI mentor with actual OpenAI calls
   - Check database writes work
   - Monitor for errors in Vercel logs

#### Phase 3: Content Upload (2-4 hours)
1. **Create Admin User** (5 min)
   - Sign up through the app
   - Run SQL to make yourself admin:
     ```sql
     UPDATE user_profiles 
     SET role = 'admin' 
     WHERE email = 'your-email@example.com';
     ```

2. **Add Initial Topics** (2-4 hours)
   - Start with 5-10 ClaimCenter topics for testing
   - For each topic:
     - Title, description, duration
     - Learning objectives
     - YouTube/Loom video URL
     - Slides URL (Google Slides, PDF)
     - Prerequisites (topic IDs)
     - Set published = true
   - Use admin panel or direct SQL INSERT

3. **Verify Sequential Locking** (15 min)
   - Create test user account
   - Verify Topic 1 is unlocked
   - Verify Topic 2 is locked (if has prerequisites)
   - Complete Topic 1
   - Verify Topic 2 unlocks

#### Phase 4: Beta Testing (ongoing)
1. **Invite 3-5 Beta Users** (30 min)
   - Friends, colleagues, or test accounts
   - Send them login URL
   - Give them specific tasks to test

2. **Monitor & Gather Feedback**
   - Watch Vercel logs for errors
   - Monitor Supabase database activity
   - Check OpenAI API usage and costs
   - Collect user feedback

---

## 🔑 Key Commands

```bash
# Local Development
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Build for production
npm run lint            # Check code quality

# Deployment
git push origin main    # Trigger Vercel deployment

# Database (in Supabase SQL Editor)
# Run queries from database/schema.sql
# Make yourself admin:
UPDATE user_profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🎯 Success Criteria for Sprint 2

- [ ] Supabase project created and schema deployed
- [ ] OpenAI API key working with streaming responses
- [ ] App deployed to Vercel and accessible
- [ ] OAuth redirects configured correctly
- [ ] At least 5 topics uploaded with videos
- [ ] Sequential locking verified working
- [ ] Admin can access /admin panel
- [ ] 3-5 beta users invited and testing
- [ ] No critical errors in production
- [ ] Costs monitored (should be <$10 for beta)

---

## ⚠️ Known Issues & Considerations

1. **Authentication**
   - Google OAuth needs proper redirect URLs configured
   - Email verification emails must be customized in Supabase

2. **AI Mentor**
   - First API call may be slow (cold start)
   - Monitor token usage closely in Supabase
   - Set up billing alerts in OpenAI dashboard

3. **Content**
   - Videos must be public or unlisted (not private)
   - YouTube embeds work best
   - Loom videos require proper sharing settings

4. **Costs**
   - Supabase: Free tier sufficient for <100 users
   - OpenAI: ~$0.002 per mentor interaction
   - Vercel: Free tier sufficient for MVP

---

## 🚨 Critical Patterns to Maintain

From `project-docs/08_DEVELOPMENT_REVIEW_PROMPT.md`:

1. **Vision Alignment**
   - Every feature helps students get JOBS, not just certificates
   - Sequential learning is non-negotiable
   - Quality over speed

2. **Architecture**
   - Modular monolith (not microservices)
   - Server components by default, client only when needed
   - Row Level Security on all database tables

3. **Code Standards**
   - TypeScript strict mode always
   - Zod validation for all inputs
   - API responses: `{ success: boolean, data?: any, error?: string }`
   - Early returns for error handling
   - Functions under 20 lines when possible

4. **AI Integration**
   - GPT-4o-mini as primary model
   - Stream all responses
   - Socratic method (never give direct answers)
   - Context limit: 6 message pairs
   - Response limit: 500 tokens
   - Track token usage for cost monitoring

5. **Security**
   - Never expose API keys in client code
   - All secrets in environment variables
   - RLS policies on every table
   - Server-side prerequisite checking

---

## 📊 Expected Outcomes

**By end of Sprint 2:**
- ✅ Live production app on custom/Vercel domain
- ✅ 5-10 beta users actively testing
- ✅ 5-10 ClaimCenter topics available
- ✅ Real AI mentor conversations happening
- ✅ Feedback collected for iteration
- ✅ Cost monitoring in place (<$10/month for beta)

**Metrics to Track:**
- User signups
- Topics completed
- AI mentor usage
- Time spent per topic
- Completion rates
- User feedback/NPS

---

## 🎓 Next Steps After Sprint 2

1. **Content Expansion** - Add remaining 45 ClaimCenter topics
2. **Feature Polish** - Based on beta feedback
3. **Quiz System** - Build assessment functionality
4. **Payment Integration** - Add Stripe subscriptions
5. **Scale to 100 Users** - Monitor performance

---

## 💬 How to Start This Session

Copy and paste this to begin:

```
I'm starting Sprint 2 for the Guidewire Training Platform.

Context loaded:
- @project-docs/09_SPRINT_2_START_PROMPT.md (this file)
- @project-docs/99_CHANGELOG.md (Session 001 summary)
- @project-docs/01_VISION.md (mission & vision)
- @database/SETUP.md (Supabase instructions)
- @DEPLOYMENT.md (Vercel deployment guide)

Sprint 2 Goal: Deploy MVP to production with initial content

Current Status:
- Code: 100% complete and tested locally
- Environment: Need to setup Supabase + OpenAI
- Deployment: Ready for Vercel
- Content: 0 topics (need to add 5-10)

Let's start with Phase 1: Environment Setup.

First task: Create Supabase project and run schema.
Should I proceed, or do you want to review the codebase first?
```

---

## 🔗 Essential Links

- **Supabase**: https://supabase.com
- **OpenAI**: https://platform.openai.com
- **Vercel**: https://vercel.com
- **Project Repository**: [Your GitHub URL]

---

## ✅ Checklist Before Starting

- [ ] I've reviewed `project-docs/99_CHANGELOG.md`
- [ ] I've read `project-docs/01_VISION.md`
- [ ] I understand the architecture from `instructions.md`
- [ ] I have access to Supabase account
- [ ] I have access to OpenAI account
- [ ] I have access to Vercel account
- [ ] I have billing set up (OpenAI charges on usage)
- [ ] I'm ready to deploy to production!

---

**Remember**: This MVP is already production-ready. Sprint 2 is about deployment and validation, not building new features. Keep it simple, get it live, gather feedback! 🚀

---

*Last Updated: Session 001 - November 4, 2025*
*Sprint 1 Status: ✅ COMPLETE - All MVP features delivered*
*Ready for: Sprint 2 - Deployment & Launch*

