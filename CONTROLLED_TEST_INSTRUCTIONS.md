# 🧪 Controlled Test Instructions

**Status**: Agent configured and ready for testing  
**Configuration**:
- Screenshots: Every 30 seconds
- Data sync: Every 60 seconds
- Tracking: Mouse clicks, keystrokes, scroll events (NOT movements)

---

## Test Setup Complete ✅

**Agent Status**: Running with proper click/scroll tracking
**Dashboard**: Running on http://localhost:3000/productivity/insights
**Database**: Old data should be cleared first

---

## Before Starting Test

1. **Clear old data in Supabase** (run this SQL):
```sql
DELETE FROM productivity_sessions 
WHERE user_id IN (SELECT id FROM user_profiles WHERE email = 'admin@intimesolutions.com')
AND start_time >= CURRENT_DATE;

DELETE FROM productivity_applications  
WHERE user_id IN (SELECT id FROM user_profiles WHERE email = 'admin@intimesolutions.com')
AND start_time >= CURRENT_DATE;

SELECT 'Sessions cleared: ' || COUNT(*) FROM productivity_sessions
WHERE user_id IN (SELECT id FROM user_profiles WHERE email = 'admin@intimesolutions.com');
```

2. **Refresh the dashboard** to confirm zeros

---

## Test Protocol

### Phase 1: Baseline (2 minutes)
**Your Actions**: Do NOTHING
- Don't touch keyboard
- Don't touch mouse
- Don't scroll

**Expected Results** (after 60s sync):
- Keystrokes: 0
- Mouse Clicks: 0
- Scroll Events: 0
- Active Time: 0
- Break Time: Should start counting after 5 minutes idle
- Status: "Idle" → "Break" (after 5 min)
- Screenshots: 4 images (every 30s)

### Phase 2: Controlled Input (2 minutes)
**Your Actions**: Perform EXACTLY
- **10 keyboard key presses** (count each key)
- **5 mouse button clicks** (left-click, count each)
- **3 scroll wheel movements** (trackpad/mouse wheel)

**Expected Results** (after 60s sync):
- Keystrokes: 10 ± 1
- Mouse Clicks: 5 ± 1
- Scroll Events: 3 ± 1
- Active Time: ~2 minutes
- Break Time: 0
- Status: "Active"
- Screenshots: 4 more images

### Phase 3: Extended Activity (5 minutes)
**Your Actions**: Normal work simulation
- Type a paragraph (estimate ~100 keys)
- Click around (estimate ~20 clicks)
- Scroll through a page (estimate ~10 scrolls)

**Expected Results** (after 60s sync):
- Keystrokes: ~100
- Mouse Clicks: ~20
- Scroll Events: ~10
- Active Time: ~5 minutes
- Status: "Active"

---

## What Each Metric Tracks

### ✅ Correct Tracking:
- **Keystrokes**: Physical keyboard button presses (any key)
- **Mouse Clicks**: Physical mouse button clicks (left/right/middle)
- **Scroll Events**: Physical scroll wheel/trackpad scroll gestures
- **Active Time**: Time when ANY input detected (key/click/scroll)
- **Break Time**: Time after 5+ minutes of no input
- **Screenshots**: All screens captured every 30 seconds

### ❌ NOT Tracked:
- Mouse cursor movements (hover, auto-tracking)
- System events
- Application auto-activity

---

## Verification Steps

After each phase:
1. Wait 60+ seconds for sync
2. Refresh dashboard
3. Verify numbers match your counted actions
4. Check screenshots are being captured
5. Verify application tracking (Cursor, Edge, etc.)

---

## Current Known Issues

1. **Active Window Tracking**: Errors due to Screen Recording permission
   - Won't affect keyboard/mouse/scroll tracking
   - Only affects getting application window titles
   - Can be fixed later with permission grant

2. **Multi-screen Screenshots**: Configured but needs Screen Recording permission
   - Will capture all screens once permission granted
   - Currently may only capture primary display

---

## Test Success Criteria

✅ **Pass**: Numbers match your counted actions (±10% margin)
✅ **Pass**: Break time only increases when truly idle (5+ min)
✅ **Pass**: Active time only counts when you're actually active
✅ **Pass**: Screenshots captured every 30 seconds

❌ **Fail**: Any metric that doesn't match reality

---

## Ready for Test?

**Current Agent Status**:
- ✅ Running with click/scroll tracking
- ✅ Configured for 30s screenshots
- ✅ Syncing every 60 seconds
- ✅ Logging to `/tmp/test-agent.log`

**Next Steps**:
1. Clear database (SQL above)
2. Refresh dashboard (confirm zeros)
3. Start Phase 1 test
4. Report results

---

Let me know when you're ready to start the test, and I'll monitor the logs to verify the system is counting correctly!



