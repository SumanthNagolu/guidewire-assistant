# Trikala Delivery Plan - Revenue-First Approach

> *Ship website immediately, add features incrementally, generate revenue fast*

---

## Phase Priorities (Revenue-Driven)

```
1. PUBLIC WEBSITE (Week 1-2)     → Get visible, start marketing
2. ACADEMY PORTAL (Week 3-6)     → Start training, generate revenue
3. GUIDEWIRE PROGRAM (Week 7-10) → Core product, main revenue
4. EMPLOYEE PORTAL (Later)       → Internal tools, no rush
```

---

## PHASE 1: Public Website (2 Weeks) - IMMEDIATE

### Goal
Professional public website with all static pages, forms, and communication channels. Generate leads immediately.

### Sitemap & Subdomains

**Main Domain:** `intimesolutions.com`

**Subdomains:**
- `academy.intimesolutions.com` - Training portal (Phase 2)
- `jobs.intimesolutions.com` - Job board (Phase 3)
- `talent.intimesolutions.com` - Talent acquisition (Phase 3)
- `portal.intimesolutions.com` - Employee portal (Phase 4)

### Static Pages (Main Site)

**Homepage:**
- Hero: "Get Job-Ready in Guidewire - Not Just Certified"
- Value proposition
- Course overview
- Success stories
- CTA: "Start Your Journey"

**About Us:**
- Company story
- Mission: Jobs, not certificates
- Team (you + trainers)
- Why we're different

**Training Programs:**
- Guidewire ClaimCenter
- Guidewire PolicyCenter
- Guidewire BillingCenter
- Course structure
- Prerequisites explained
- Pricing
- CTA: "Enroll Now"

**How It Works:**
- Sequential learning explained
- 250-topic framework
- Profile-based training
- Live interview prep
- Job placement support

**Success Stories:**
- Student testimonials
- Job placements
- Salary improvements
- Before/after stories

**Pricing:**
- Clear pricing table
- Payment plans
- Money-back guarantee
- CTA: "Get Started"

**FAQ:**
- Common questions
- Prerequisites
- Duration
- Support
- Job guarantee details

**Blog:**
- Guidewire tips
- Interview prep
- Industry insights
- SEO content

**Contact:**
- Contact form
- Email: info@intimesolutions.com
- Phone
- Social media links
- Office location (if any)

### Forms & Integrations

**Contact Form:**
- Name, Email, Phone, Message
- Sends to your email
- Auto-reply confirmation

**Course Inquiry Form:**
- Name, Email, Phone
- Course interest
- Experience level
- Best time to call
- Sends to sales pipeline

**Enrollment Form:**
- Basic info
- Course selection
- Payment integration (Stripe/PayPal)
- Sends to academy portal (Phase 2)

**Newsletter Signup:**
- Email only
- Integrates with email marketing tool

### Tech Stack (Week 1-2)

**Framework:** Next.js 15 (App Router) ✅  
**Styling:** Tailwind + shadcn/ui ✅  
**Forms:** React Hook Form + Zod validation  
**Email:** SendGrid or Resend  
**Analytics:** Google Analytics + Plausible  
**Hosting:** Vercel (deploy immediately)

### Week 1 Tasks
- [ ] Design homepage (Brahma persona)
- [ ] Create all page layouts
- [ ] Setup email integration
- [ ] Build contact/inquiry forms
- [ ] Setup analytics

### Week 2 Tasks
- [ ] Content writing for all pages
- [ ] SEO optimization
- [ ] Mobile responsiveness
- [ ] Form testing
- [ ] Deploy to production

**Deliverable:** Live website accepting inquiries

---

## PHASE 2: Academy Portal (4 Weeks) - REVENUE START

### Goal
Functional training platform where students can enroll, access courses, track progress, and complete Guidewire training.

### Core Features

**Authentication:**
- Email/password signup
- Google OAuth
- Email verification
- Password reset

**Student Dashboard:**
- Course progress overview
- Current topic
- Next topics (locked if prerequisites not met)
- Completion percentage
- Certificates earned

**Course Structure:**
- ClaimCenter (250 topics organized hierarchically)
- Sequential topic unlocking
- Prerequisites enforced
- Progress tracking
- Completion marks

**Topic Page:**
- Theory content
- Hands-on exercises
- Quiz (must pass to proceed)
- Next topic preview (locked)
- "Mark Complete" button (requires quiz pass)

**Quiz System:**
- Multiple choice questions
- 80% pass rate
- Unlimited retakes
- Explanations for wrong answers
- Progress saved

**Certificate Generation:**
- Auto-generate on course completion
- PDF download
- Verification code
- Share on LinkedIn

**Payment Integration:**
- Stripe checkout
- Course purchase
- Subscription (if offering)
- Payment history

### Database (Supabase)

**Tables:**
- users (profiles, auth)
- courses (ClaimCenter, etc.)
- topics (250 topics with prerequisites)
- user_progress (enrollment, completion tracking)
- quizzes (questions, answers)
- user_quiz_attempts (tracking attempts)
- certificates (issued certificates)

**RLS Policies:**
- Users see only their data
- Public: Course catalog
- Authenticated: Enrolled courses
- Admin: Everything

### Week 3-4 Tasks
- [ ] Setup Supabase database
- [ ] Create all tables with RLS
- [ ] Build authentication system
- [ ] Student dashboard UI
- [ ] Course catalog page

### Week 5-6 Tasks
- [ ] Topic page with content
- [ ] Quiz system
- [ ] Progress tracking
- [ ] Certificate generation
- [ ] Stripe payment integration
- [ ] Deploy academy subdomain

**Deliverable:** Students can enroll, pay, and start training

---

## PHASE 3: Guidewire Program Content (4 Weeks) - MAIN REVENUE

### Goal
Complete ClaimCenter course content (250 topics), quizzes, exercises. This is the money-maker.

### Content Migration

**Existing Content:**
- You have data/Chapter folders
- You have quiz markdown files
- You have claimcenter-topics.json

**Migration Tasks:**
1. Parse existing content structure
2. Map to topic hierarchy
3. Create quizzes for each topic
4. Define prerequisites for each topic
5. Import to database
6. Review and edit for quality

### Week 7-8 Tasks
- [ ] Content audit (what you have)
- [ ] Gap analysis (what's missing)
- [ ] Topic hierarchy finalization
- [ ] Quiz creation for all topics
- [ ] Prerequisites mapping

### Week 9-10 Tasks
- [ ] Import all content to database
- [ ] Quality review (you + team)
- [ ] Test full learning path
- [ ] Fix any issues
- [ ] Launch full program

**Deliverable:** Complete ClaimCenter training program ready

---

## PHASE 4: Employee Portal (Later) - INTERNAL TOOLS

### Goal
Internal tools for managing team, tracking performance, bot logging, etc.

**Features:**
- Employee dashboard
- Voice logging bot
- Performance tracking
- Admin tools
- Reports

**Timeline:** After revenue is flowing from Academy

---

## Success Metrics by Phase

### Phase 1 (Website)
- ✅ Live website
- ✅ Contact forms working
- ✅ 10+ inquiries per week
- ✅ Analytics tracking

### Phase 2 (Academy)
- ✅ 10 paying students
- ✅ $5,000+ revenue
- ✅ 80%+ student satisfaction
- ✅ Working payment system

### Phase 3 (Full Program)
- ✅ 50 paying students
- ✅ $25,000+ revenue
- ✅ First job placements
- ✅ Student testimonials

### Phase 4 (Employee)
- ✅ Internal tools working
- ✅ Team using daily
- ✅ Performance tracking

---

## Immediate Next Steps (This Week)

**Day 1-2:**
1. Design homepage and key pages
2. Setup project structure
3. Install dependencies

**Day 3-4:**
4. Build all static pages
5. Setup forms and email
6. Add analytics

**Day 5-7:**
7. Content writing
8. SEO optimization
9. Testing
10. **DEPLOY TO PRODUCTION**

---

## Resource Allocation

**Week 1-2:** Focus 100% on public website  
**Week 3-6:** Focus 100% on academy portal  
**Week 7-10:** Focus 100% on content  
**Week 11+:** Revenue operations, marketing, scaling

---

## Tech Stack Summary

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form

**Backend:**
- Supabase (PostgreSQL + Auth + RLS)
- Edge Functions for API
- SendGrid/Resend for email

**Payments:**
- Stripe Checkout

**Hosting:**
- Vercel (website + academy)
- Supabase Cloud (database)

**Analytics:**
- Google Analytics
- Plausible

**Domain:**
- intimesolutions.com (main)
- academy.intimesolutions.com (training)

---

## Budget (Initial)

**Domain & Hosting:** $50/month (Vercel + domain)  
**Supabase:** $25/month (Pro plan)  
**Email:** $15/month (SendGrid)  
**Stripe:** 2.9% + $0.30 per transaction  
**Total:** ~$90/month + transaction fees

**Break-even:** 2-3 students at $500/course

---

## Revenue Projections

**Month 1-2:** $0 (building)  
**Month 3:** $2,500 (5 students @ $500)  
**Month 4:** $5,000 (10 students)  
**Month 5:** $10,000 (20 students)  
**Month 6:** $25,000 (50 students)  

**Year 1 Target:** 500 students = $250,000

---

## Risk Mitigation

**Risk:** Content not ready  
**Mitigation:** Start with Chapter 1-2, add incrementally

**Risk:** No students  
**Mitigation:** Marketing, SEO, LinkedIn outreach

**Risk:** Technical issues  
**Mitigation:** Use proven stack, test thoroughly

**Risk:** Competition  
**Mitigation:** Unique value: Sequential learning + job placement focus

---

## The Bottom Line

**Stop philosophizing. Start shipping.**

✅ Week 1-2: Website live  
✅ Week 3-6: Academy portal live  
✅ Week 7-10: Full program live  
✅ Week 11+: Scale and grow

**First dollar earned in Week 3. First job placement by Month 4.**

**Let's build! 🚀**

---

**Created:** 2025-11-08  
**Owner:** Sumanth (CEO)  
**Priority:** SHIP NOW

