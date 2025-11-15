# Known Issues and Solutions

## Issue 1: ✅ Timezone - FIXED
**Problem:** Times showing in wrong timezone  
**Solution:** Updated to use local timezone with `toLocaleTimeString([], ...)` instead of 'en-US'

## Issue 2: Active Time Showing 0h 0m
**Problem:** Active time calculation not working  
**Root Cause:** Database trigger for calculating active minutes from AI analysis needs data

**Why It's Happening:**
- The trigger `calculate_active_minutes()` only runs when AI analysis records are inserted
- Without screenshot data and AI analysis, there's no trigger to update `total_active_minutes`
- The database is empty, so presence table has 0 active minutes

**Solution:** Will populate automatically once:
1. Database migration is run (creates the trigger)
2. Desktop agent sends screenshots
3. AI analyzes screenshots
4. Trigger automatically updates active time

**Temporary Workaround (Testing Only):**
You can manually set active time in Supabase to verify the display:
```sql
UPDATE productivity_presence
SET total_active_minutes = 120
WHERE user_id = 'your_user_id' 
  AND date = CURRENT_DATE;
```

## Issue 3: Multi-Monitor Screenshots
**Problem:** Only capturing one screen on macOS  
**Root Cause:** `screenshot-desktop` library limitation on macOS

**Current Behavior:**
- Captures primary screen (screen 0) only
- This is a library limitation, not a bug

**Solutions:**

### Option A: Accept Single Screen (Simplest)
- Most work happens on primary screen
- Still provides valuable insights
- No code changes needed

### Option B: Capture All Screens Separately (Recommended)
Update `desktop-agent/src/tracker/screenshots.ts`:

```typescript
private async captureAllScreens(): Promise<string[]> {
  try {
    const screenshots: string[] = [];
    
    // Capture screens 0, 1, 2 (up to 3 monitors)
    for (let screenId = 0; screenId < 3; screenId++) {
      try {
        const filename = `screenshot_screen${screenId}_${Date.now()}.jpg`;
        const filepath = path.join(this.storageDir, filename);

        const imgBuffer = await screenshot({
          format: 'jpg',
          quality: Math.max(10, Math.min(100, this.options.quality)),
          screen: screenId
        } as any);
        
        if (imgBuffer) {
          fs.writeFileSync(filepath, imgBuffer);
          screenshots.push(filepath);
        }
      } catch (e) {
        // Screen doesn't exist, stop trying
        break;
      }
    }
    
    return screenshots;
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return [];
  }
}
```

### Option C: Use Different Library (Future Enhancement)
- Research libraries that support multi-monitor on macOS
- Potential options: `node-screenshots`, native Node addons
- Requires testing and potentially more complex setup

**Recommendation:** Start with Option A, implement Option B if multi-monitor is critical

## Issue 4: Websites Not Showing
**Problem:** Website tracking component has no data  
**Root Cause:** Website tracking data isn't being captured yet

**Solution:**
Website tracking requires additional implementation:
1. Browser extension or system-level monitoring
2. Network monitoring in desktop agent
3. Active window title parsing

**Current Status:** Component is ready, data source needs to be added

**Quick Fix for Testing:**
Manually insert test data in Supabase:
```sql
INSERT INTO productivity_websites (user_id, domain, visited_at, duration_seconds)
VALUES 
  ('your_user_id', 'github.com', NOW(), 1800),
  ('your_user_id', 'stackoverflow.com', NOW(), 900);
```

## Issue 5: Work Summary Blank
**Problem:** AI summary not showing  
**Root Cause:** AI summary generation requires:
1. Screenshots to be captured
2. AI analysis to be performed
3. At least 5 minutes of data

**Why It's Blank:**
- No screenshots captured yet
- No AI analysis performed
- Summary generation triggered every 5 minutes after analysis

**Solution:**
1. Run database migration (creates tables)
2. Add ANTHROPIC_API_KEY to `.env.local`
3. Start desktop agent to capture screenshots
4. Wait 5-10 minutes for AI analysis and summary generation

**What Will Happen:**
- Desktop agent captures screenshot every 30 seconds
- Sends to `/api/productivity/ai-analyze`
- Claude Opus analyzes screenshot
- After 5 minutes, Claude Haiku generates summary
- Summary appears in dashboard

## Issue 6: Category Breakdown Empty
**Problem:** No category data showing  
**Root Cause:** Same as Issue 5 - needs AI analysis data

**Solution:** Same as Issue 5 - run migration, add API key, start agent

## Issue 7: Analytics Page Empty
**Status:** This is intentional - it's a placeholder

**Current State:**
Shows "Advanced analytics coming soon" message with icon

**Future Features:**
- Productivity trends over time
- Category distribution charts
- Application usage pie charts
- Time series graphs
- Comparison charts

**To Add Later:**
- Chart.js or Recharts integration
- Historical data analysis
- Custom date range filtering
- Export to PDF/Excel

## Summary of What Works Now:

✅ **Working:**
- Dashboard loads correctly
- Team sidebar (shows default teams)
- Time range selector
- Auto-refresh toggle
- Tab navigation
- Screenshot display (when data exists)
- Application tracking (Teams, Chrome, Cursor, etc.)
- Presence card (shows first/last seen)
- Beautiful UI with gradients

❌ **Needs Data (Will Work After Migration + Agent):**
- Active time calculation
- AI work summaries
- Category breakdown
- Screenshot gallery populated
- Productivity scores

⚠️ **Known Limitations:**
- Single screen capture on macOS (library limitation)
- Website tracking needs additional implementation
- Analytics page is placeholder

## Action Plan:

### Immediate (You):
1. Get Anthropic API key → https://console.anthropic.com/
2. Add to `.env.local`: `ANTHROPIC_API_KEY=your_key`
3. Run `database/ai-productivity-complete-schema.sql` in Supabase
4. Refresh dashboard

### Testing (5-10 minutes after migration):
1. Start desktop agent: `cd desktop-agent && npm start`
2. Let it run for 5-10 minutes
3. Refresh dashboard
4. You should see:
   - Screenshots appearing
   - Active time populating
   - AI summaries generating
   - Category breakdown filling
   - Productivity scores showing

### Future Enhancements:
1. Multi-monitor support (Option B above)
2. Website tracking implementation
3. Analytics charts
4. Advanced filtering
5. Export functionality

## Quick Test (No Migration Required):

If you want to see the UI working without waiting for real data, you can manually insert test data in Supabase SQL Editor:

```sql
-- Test Active Time
UPDATE productivity_presence
SET total_active_minutes = 120,
    first_seen_at = NOW() - INTERVAL '2 hours',
    last_seen_at = NOW(),
    current_status = 'active'
WHERE user_id = 'your_user_id' 
  AND date = CURRENT_DATE;

-- Test AI Summary
INSERT INTO productivity_work_summaries (
  user_id, summary_date, time_window,
  total_productive_minutes, ai_summary,
  category_breakdown, application_breakdown
) VALUES (
  'your_user_id', CURRENT_DATE, 'today',
  120,
  'Worked on React components in VS Code for 2 hours, reviewed documentation on Chrome, and responded to Teams messages.',
  '{"coding": 90, "documentation": 20, "communication": 10}'::jsonb,
  '{"VS Code": 90, "Chrome": 20, "Teams": 10}'::jsonb
);
```

**All issues are documented and have clear solutions!** 🎯



