# Academy LMS - Testing Guide

## 🎯 Current Status

**Dev Server:** ✅ Running on `http://localhost:3002`  
**Database:** ⚠️ Migration needed before testing Academy LMS features  
**Dependencies:** ✅ All installed  

---

## 🚀 Quick Start Testing

### 1. Test What's Working Now (No DB Migration Needed)

#### Homepage
```bash
curl http://localhost:3002
# OR visit in browser
open http://localhost:3002
```

#### Existing Features
- ✅ Homepage
- ✅ Productivity tracking (if DB has productivity tables)
- ✅ Interview prep (if DB has interview tables)
- ✅ Marketing pages

### 2. Run Database Migration (Required for Academy LMS)

**Before testing Academy LMS features, run:**

```bash
# Option A: Using Supabase CLI
supabase start
supabase db reset

# Option B: Manual SQL
psql -h localhost -p 54322 -U postgres -d postgres \\
  -f supabase/migrations/20250113_academy_lms_schema.sql

# Option C: Push to cloud
supabase db push
```

### 3. Test Academy LMS Features

Once database is migrated:

```bash
# Visit Academy Dashboard
open http://localhost:3002/academy

# Expected flow:
# 1. Redirects to login (if not authenticated)
# 2. After login, redirects to onboarding (if not completed)
# 3. Shows Academy Dashboard with learning stats
```

---

## 📋 Manual Testing Checklist

### Pre-Migration (Current State)
- [ ] Dev server starts without errors
- [ ] Homepage loads (`/`)
- [ ] Can navigate to other non-academy pages
- [ ] No console errors on homepage

### Post-Migration (Academy LMS)
- [ ] `/academy` loads without errors
- [ ] User can sign up/login
- [ ] Onboarding flow works
- [ ] Dashboard shows learning stats
- [ ] Can browse topics (`/academy/topics`)
- [ ] Can view topic details
- [ ] Can start learning blocks
- [ ] XP is awarded correctly
- [ ] Achievements unlock
- [ ] Leaderboard displays
- [ ] AI Mentor responds (`/academy/ai-mentor`)
- [ ] Enterprise dashboard loads (`/enterprise`)
- [ ] Team management works

---

## 🧪 Automated Testing

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit -- --coverage
```

**Expected Results:**
- ✅ Test setup and mocks load
- ⚠️ Some tests may fail due to DB schema differences
- ✅ Component rendering tests should pass
- ⚠️ Service tests need real DB for full pass

### Integration Tests
```bash
# Ensure database is running
supabase start

# Run integration tests
npm run test:integration
```

**Expected Results:**
- ⚠️ Tests will fail if DB migration not run
- ✅ API endpoint tests should work post-migration
- ✅ Database operations should succeed

### E2E Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

**Expected Results:**
- ⚠️ Will fail if DB not migrated
- ✅ User flows should work end-to-end
- ✅ Cross-browser testing available

---

## 🔍 Testing Specific Features

### 1. Learning Engine
```bash
# Manual test
open http://localhost:3002/academy/topics

# What to test:
- Topics display correctly
- Can start a topic
- Sequential unlocking works
- Prerequisites enforced
- Progress tracking updates
```

### 2. Gamification
```bash
# Test XP and achievements
open http://localhost:3002/academy/achievements

# What to test:
- XP is awarded for completions
- Achievements unlock correctly
- Leaderboard updates
- Level progression works
```

### 3. AI Features
```bash
# Test AI Mentor
open http://localhost:3002/academy/ai-mentor

# What to test:
- Can ask questions
- AI responds correctly
- Follow-up questions work
- Conversation history saves
```

### 4. Enterprise Features
```bash
# Test team management
open http://localhost:3002/enterprise

# What to test:
- Team dashboard loads
- Can invite members
- Analytics display
- Reports generate
```

---

## 🐛 Troubleshooting

### Issue: Dev server won't start
```bash
# Kill processes on port 3000/3002
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9

# Restart
npm run dev
```

### Issue: Database connection errors
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

### Issue: TypeScript errors
```bash
# Run type check
npm run type-check

# Most errors are due to missing DB tables
# Run migration first, then re-check
```

### Issue: Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Issue: Tests failing
```bash
# Clear test cache
rm -rf .vitest

# Ensure DB is migrated
supabase db reset

# Run tests again
npm run test
```

---

## 📊 Expected Test Results

### After All Fixes Applied

#### Unit Tests
```
✓ Component tests (30+ tests)
✓ Service tests (20+ tests)  
✓ Utility tests (10+ tests)
⚠️ Some mocked API tests may need adjustment

Expected: ~85% pass rate before DB migration
Expected: ~95% pass rate after DB migration
```

#### Integration Tests
```
✓ Learning API tests
✓ Gamification API tests
✓ Enterprise API tests
✓ AI service tests

Expected: 100% pass rate after DB migration
```

#### E2E Tests
```
✓ User onboarding flow
✓ Learning topic completion
✓ AI mentor interaction
✓ Team management
✓ Gamification features

Expected: 100% pass rate after full setup
```

---

## 🎬 Demo Flow (Complete Testing Scenario)

### 1. Setup
```bash
# Ensure everything is ready
supabase start
npm run dev
```

### 2. Create Test User
1. Visit `http://localhost:3002`
2. Click "Sign Up"
3. Enter test credentials
4. Verify email (if required)

### 3. Complete Onboarding
1. Fill in profile details
2. Select experience level
3. Choose learning goals
4. Complete setup

### 4. Test Learning Flow
1. Browse topics
2. Start a topic
3. Complete learning blocks (Theory, Demo, Practice)
4. Earn XP
5. Unlock achievements
6. Check leaderboard

### 5. Test AI Features
1. Go to AI Mentor
2. Ask a question
3. Get AI response
4. Generate learning path
5. Create project plan

### 6. Test Enterprise (if applicable)
1. Create organization
2. Invite team members
3. View team analytics
4. Set learning goals
5. Generate reports

---

## ✅ Success Criteria

### Minimal Viable Testing (MVP)
- [ ] Dev server runs
- [ ] Homepage loads
- [ ] Database migration runs
- [ ] Academy dashboard accessible
- [ ] Can complete one learning topic
- [ ] XP is awarded

### Full Feature Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance acceptable (Lighthouse > 90)

---

**Testing Status:** Ready for database migration  
**Next Action:** Run `supabase db push` or migrate manually  
**Estimated Testing Time:** 2-3 hours for full manual testing  

---

For questions or issues, check:
- `FIXES-APPLIED.md` - What has been fixed
- Dev server logs - Runtime errors
- Browser console - Client-side errors  
- Supabase logs - Database errors
