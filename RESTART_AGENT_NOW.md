# 🔄 RESTART DESKTOP AGENT TO SEE DATA

## Current Status:
- ✅ Database tables created
- ✅ Agent code updated
- ✅ API configured for localhost
- ⏳ Need to restart agent

---

## Steps to See Data in Dashboard:

### 1. Stop Current Agent
In the terminal running the desktop agent:
```bash
Press Ctrl+C
```

### 2. Restart Agent
```bash
cd /Users/sumanthrajkumarnagolu/Projects/intime-esolutions/desktop-agent
npm start
```

### 3. Wait 1 Minute
The agent will:
- Track activity
- Sync to database every minute
- You'll see: "✅ Data synced successfully to database!"

### 4. Refresh Dashboard
Open: http://localhost:3000/productivity/insights

**Refresh the page** and you should see:
- Active time increasing
- Keystrokes counted
- Mouse movements tracked
- Applications listed

---

## What to Look For in Terminal:

**After restart, you should see:**
```
Activity tracking started (emitting every minute for testing)
Application tracking started
...wait 1 minute...
📊 SYNCING DATA: { mouseMovements: XX, keystrokes: XX ... }
✅ Data synced successfully to database!
✅ Activity session saved
```

**If you see that ✅, data is in the database!**

---

## Quick Checklist:

- [ ] Stop desktop agent (Ctrl+C)
- [ ] Restart: `npm start` in desktop-agent folder
- [ ] Wait 1 minute for first sync
- [ ] Look for "✅ Data synced successfully"
- [ ] Refresh http://localhost:3000/productivity/insights
- [ ] See data appear!

---

**The agent is ready - just restart it!** 🚀




