# 🎯 End-to-End Test Guide - Unified Productivity System

## Quick Test (5 minutes)

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Run quick test
node test-productivity-flow.js

# Terminal 3: Test role scenarios
node test-scenarios.js
```

## Complete End-to-End Test

### Step 1: Database Setup (2 minutes)

1. Open Supabase SQL Editor
2. Run migrations:

```sql
-- Backup existing data (optional)
\i database/backup-productivity-data.sql

-- Create new schema
\i database/unified-productivity-schema.sql
```

### Step 2: Start the System (1 minute)

#### Terminal 1 - Next.js App:
```bash
npm run dev
# Should see: ✓ Ready at http://localhost:3000
```

#### Terminal 2 - Capture Agent:
```bash
cd productivity-capture
npm install
npm run dev

# Should see:
# ╔════════════════════════════════════════════╗
# ║     INTIME PRODUCTIVITY CAPTURE AGENT      ║
# ║         Lightweight & Efficient            ║
# ╚════════════════════════════════════════════╝
# ✅ Agent started - capturing every 30 seconds
```

### Step 3: Generate Test Data (3 minutes)

Run automated test scenarios:

```bash
node test-scenarios.js

# This will:
# 1. Simulate 10 screenshots for Recruiter role
# 2. Simulate 10 screenshots for Developer role  
# 3. Simulate 10 screenshots for Sales role
# 4. Trigger batch processing for each
# 5. Verify context summaries
```

Expected output:
```
🧪 TESTING: RECRUITER SCENARIO
📸 Simulating 10 screenshots...
✅✅✅✅😴✅✅✅✅✅
🔄 Triggering batch processing...
✅ Batch processing completed
📊 Verifying context summaries...
✅ 15min: "Sarah reviewed 3 LinkedIn profiles..."
✅ 30min: "Productive recruitment session..."
✅ 1hr: "Sourced 8 candidates, scheduled 2 interviews..."

✅ ALL SCENARIOS PASSED!
```

### Step 4: Verify in Dashboard (2 minutes)

1. Open: http://localhost:3000/productivity/ai-dashboard
2. Click the **"AI Summaries"** tab (first tab)
3. You should see:

#### 15-Minute Summary Example:
> "John spent 10 minutes developing the payment integration feature in VS Code. He fixed 2 bugs related to async handling and committed the changes to the feature branch. The last 5 minutes were spent reviewing a pull request from a teammate about the authentication module."

#### 30-Minute Summary Example:
> "This half-hour was primarily focused on backend development and code review. John completed the payment service implementation, wrote comprehensive unit tests achieving 85% coverage, and participated in code review discussions. He took a quick 3-minute coffee break around 2:45 PM before returning to documentation work."

#### Daily Summary Example:
> "Today was highly productive with 6 hours of focused development work. John delivered the complete payment integration system, resolved 8 bugs including 3 critical issues, and helped onboard the new team member Sarah. He attended 2 meetings (daily standup and architecture review) totaling 45 minutes. Most productive period was 10-11:30 AM when he completed the core payment logic. Took regular breaks totaling 45 minutes throughout the day."

### Step 5: Manual Testing (5 minutes)

#### A. Test Idle Detection:
1. Stop moving mouse for 2+ minutes
2. Check dashboard - should show "took a break" in summaries

#### B. Test Real-time Updates:
1. Keep capture agent running
2. Switch between different applications
3. After 10 screenshots, click "Process Screenshots Now"
4. Summaries should update within seconds

#### C. Test Different Time Windows:
1. Click different time window buttons (15min, 30min, 1hr, etc.)
2. Each should show appropriate level of detail:
   - 15min: Immediate, specific activities
   - 1hr: Broader work blocks
   - 1day: Full day overview

### Step 6: Performance Verification

Check these metrics in the dashboard:

✅ **Screenshot Capture**: Every 30 seconds  
✅ **Batch Processing**: Every 5 minutes or manual  
✅ **Cost Savings**: 70% (shown in response)  
✅ **Idle Detection**: Working (hash comparison)  
✅ **Context Preservation**: Each window builds on previous  

## Test Scenarios by Role

### Recruiter Flow:
```javascript
// Simulated activities:
LinkedIn → Review profiles → Send invites → 
Email → Schedule interviews → Break → 
Indeed → Post job → Update tracker
```

**Expected Summary:**
> "Jennifer screened 15 software engineer profiles on LinkedIn, sent connection requests to 8 promising candidates, and successfully scheduled 3 interviews for next week. She posted a new senior developer position on Indeed and updated the candidate tracking spreadsheet."

### Developer Flow:
```javascript
// Simulated activities:
VS Code → Write code → Run tests → 
Stack Overflow → Debug → GitHub PR → 
Break → Team meeting → API testing → Documentation
```

**Expected Summary:**
> "Alex worked on the payment integration feature, writing comprehensive unit tests and achieving 92% code coverage. After debugging an async issue found on Stack Overflow, he submitted a pull request and participated in the team standup. The afternoon was spent testing the API endpoints and updating documentation."

### Sales Executive Flow:
```javascript
// Simulated activities:
Salesforce → Update opportunity → Email client → 
PowerPoint → Edit proposal → Teams call → 
Break → LinkedIn research → CRM update → Follow-up
```

**Expected Summary:**
> "Mark progressed the ABC Corp opportunity to negotiation stage, updated the proposal with new pricing, and had a successful 30-minute call with the decision maker. He researched competitor offerings and sent follow-up emails to 3 prospects. The deal value increased from $50k to $65k."

## Validation Checklist

### ✅ Core Functionality:
- [ ] Screenshots captured every 30 seconds
- [ ] Idle detection working (same screen = idle)
- [ ] Batch processing triggers automatically or manually
- [ ] All 9 context windows generated

### ✅ Human-Like Summaries:
- [ ] Natural language (not robotic)
- [ ] Specific details (app names, counts, times)
- [ ] Smooth transitions between activities
- [ ] Idle time described naturally ("took a coffee break")

### ✅ Dashboard Features:
- [ ] AI Summaries tab shows all windows
- [ ] Click to switch between time windows
- [ ] Active/Idle time breakdown shown
- [ ] Process button triggers batch
- [ ] Real-time updates work

### ✅ Performance:
- [ ] Capture agent uses <100MB RAM
- [ ] API responds in <2 seconds
- [ ] Dashboard loads quickly
- [ ] No errors in console

## Troubleshooting

### Issue: "No summaries available"
**Solution:**
1. Wait for 10+ screenshots to accumulate
2. Click "Process Screenshots Now" button
3. Check API logs for errors

### Issue: "User not found"
**Solution:**
1. Ensure test users exist in database
2. Check email format in .env file
3. Verify Supabase connection

### Issue: "Idle not detected"
**Solution:**
1. Screenshots must have identical content
2. Check hash calculation in capture agent
3. Verify screen_hash field is populated

## 🎉 Success Criteria

You've reached the finish line when:

1. ✅ All test scenarios pass
2. ✅ Dashboard shows human-readable summaries
3. ✅ Different roles show appropriate activities
4. ✅ Time windows have hierarchical detail
5. ✅ Idle detection works correctly
6. ✅ Cost savings of 70% achieved

## Final Validation

Run the complete test suite:
```bash
# Comprehensive test
node test-productivity-flow.js && node test-scenarios.js

# Should see:
# ✅ Capture endpoint working!
# ✅ Batch processing endpoint working!
# ✅ Context API working!
# ✅ Dashboard is accessible!
# 🎉 ALL SCENARIOS PASSED!
```

**Congratulations! The unified productivity system is fully operational!** 🚀
