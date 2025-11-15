# 🎬 Real-Time Browser Automation Test

## Quick Start (2 minutes)

### Step 1: Start Everything

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Capture Agent
cd productivity-capture
npm run dev

# Terminal 3: Run Browser Test
node test-browser-realtime.js
```

### Step 2: Choose Testing Mode

When prompted, select:
- **Option 1**: Recruiter workflow (LinkedIn → Email)
- **Option 2**: Developer workflow (GitHub → Stack Overflow)
- **Option 3**: Sales workflow (CRM → Email)
- **Option 4**: Manual mode (you control browser)
- **Option 5**: Run all workflows

## What Happens During Testing

### Automated Workflows (Options 1-3)

The system will:
1. Navigate to real websites (LinkedIn, GitHub, etc.)
2. Capture screenshots every 2 seconds during activity
3. Detect idle periods (coffee breaks)
4. Process with AI to generate human summaries
5. Show results in dashboard

### Manual Testing (Option 4)

1. Browse normally in your browser
2. Screenshots captured every 30 seconds automatically
3. Press Enter to trigger batch processing
4. Type "exit" to stop

## Live Monitoring

### Watch in Real-Time:

1. **Terminal Output**:
```
[1/10] 🌐 Opening LinkedIn
   URL: https://www.linkedin.com
[2/10] ⏱️ Browsing LinkedIn profiles (5s)
..... Done
[3/10] ☕ Coffee break (idle time) (10s)
.......... Done
```

2. **Dashboard** (http://localhost:3000/productivity/ai-dashboard):
- Click "AI Summaries" tab
- Watch summaries update in real-time
- See human-like descriptions appear

## Browser Extension Alternative

If you prefer using a browser extension:

### Using Playwright (Headful Mode)

```bash
# Install Playwright
npm install -g playwright
npx playwright install chromium

# Run with visible browser
HEADLESS=false node test-browser-realtime.js
```

This will open a real Chrome window you can watch!

## Expected Results

### 15-Minute Summary:
> "John spent 8 minutes on LinkedIn reviewing 5 software engineer profiles from the Bay Area. He sent 3 connection requests with personalized messages. Switched to Gmail at 2:45 PM to compose interview invitations. Took a 5-minute coffee break before returning to schedule interviews in Google Calendar."

### 30-Minute Summary:
> "Productive recruitment session focused on senior React developers. John sourced 12 candidates from LinkedIn, sent 8 connection requests, and scheduled 3 interviews for next week. He spent 10 minutes updating the candidate tracking spreadsheet and 5 minutes posting a new job on Indeed. Total active time: 22 minutes with one coffee break."

### Daily Summary:
> "Highly focused day with 6 hours of active recruitment work. John reviewed 47 profiles, shortlisted 15 candidates, conducted 2 phone screens, and scheduled 5 on-site interviews. Most productive period was 10-11:30 AM during LinkedIn sourcing. Took regular breaks totaling 45 minutes throughout the day. Successfully filled 2 positions and moved 3 candidates to final rounds."

## Manual Browser Control

For full control, I can navigate the browser for you:

```javascript
// I'll control the browser and you watch
// Just tell me what workflow to simulate!
```

Would you like me to:
1. Run the automated test with simulated browser activity?
2. Set up Playwright for real browser control you can watch?
3. Start the manual mode where you browse and we capture?

## Verification Checklist

✅ Screenshots captured every 30 seconds
✅ Idle detection working (breaks noted)
✅ Human-like summaries generated
✅ All time windows populated
✅ Dashboard updates in real-time

---

**Ready to see it in action? Just run:**

```bash
node test-browser-realtime.js
```

Then select option 1-5 and watch the magic happen! 🚀
