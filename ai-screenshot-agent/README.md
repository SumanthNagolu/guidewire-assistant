# 🤖 AI Screenshot Agent - Simplified

**Pure AI-powered productivity monitoring - No keystroke tracking, just intelligent screenshot analysis!**

## Overview

This is a clean, simple agent that:
- 📸 Captures screenshots every 30 seconds (configurable)
- 🤖 Sends directly to Claude AI for analysis
- 📊 No keystroke/mouse tracking - pure AI intelligence
- ✨ Generates work summaries automatically
- 🎯 Tracks productivity through visual analysis only

## Installation

```bash
cd ai-screenshot-agent
npm install
```

## Configuration

Copy `config.example` to create your config file:

```bash
cp config.example .env
```

Edit `.env`:

```env
API_URL=http://localhost:3000
USER_EMAIL=admin@intimesolutions.com
SCREENSHOT_INTERVAL=30000
SCREENSHOT_QUALITY=50
```

## Usage

### Start the Agent

```bash
npm start
```

### What You'll See

```
🚀 AI Screenshot Agent Starting...
   📍 API URL: http://localhost:3000
   👤 User: admin@intimesolutions.com
   ⏱️  Interval: 30 seconds
   🎨 Quality: 50

📸 Capturing screenshot...
✅ Screenshot saved: screenshot_1234567890.jpg
📤 Sending to AI analysis (App: Chrome)...
✅ AI Analysis Complete!
   📊 Application: Chrome
   📈 Category: documentation
   💯 Productivity: 85
   📝 Activity: Reading technical documentation on React...
   ✨ Work summary generated!
```

## How It Works

1. **Capture:** Agent captures screenshot of primary screen
2. **Analyze:** Sends to Claude Opus Vision AI for analysis
3. **Understand:** AI determines:
   - What application you're using
   - What activity you're doing
   - Productivity score (0-100)
   - Work category (coding, documentation, meeting, etc.)
4. **Summarize:** Every 5 minutes, generates natural language summary
5. **Display:** Dashboard shows results in real-time

## Features

- ✅ **No Invasive Tracking** - Only screenshots, no keylogging
- ✅ **AI-Powered** - Claude Opus Vision understands context
- ✅ **Role-Specific** - Different prompts for Bench, Sales, Recruiting
- ✅ **Auto-Summaries** - Natural language work descriptions
- ✅ **Real-time** - Dashboard updates every 30 seconds
- ✅ **Lightweight** - Minimal system resources
- ✅ **Privacy-Focused** - Local screenshots, encrypted transmission

## System Requirements

- Node.js 18+
- macOS, Windows, or Linux
- Active internet connection
- Running Next.js server at API_URL

## Architecture

```
Agent (30s)
    ↓
Capture Screenshot
    ↓
Get Active App
    ↓
Send to API (/api/productivity/ai-analyze)
    ↓
Claude Opus Vision Analysis
    ↓
Store in Database
    ↓
Dashboard Updates (Real-time)
```

## Troubleshooting

### "Failed to capture screenshot"
- Check screen recording permissions (macOS)
- Try adjusting SCREENSHOT_QUALITY

### "AI Analysis Error"
- Verify API_URL is correct
- Ensure Next.js server is running
- Check ANTHROPIC_API_KEY in main app's .env.local

### "Connection refused"
- Start Next.js dev server: `npm run dev`
- Verify server is running on correct port

## Stopping the Agent

Press `Ctrl+C` or `Cmd+C` in the terminal

## Multi-Monitor Support

Currently captures primary screen only (screen 0). This is a known limitation of the screenshot-desktop library on macOS.

**Future Enhancement:** Loop through screens 0, 1, 2 to capture all monitors

## Cost Per Employee

**30-second intervals:**
- Screenshots/day: 2,880
- Cost with Claude Opus: ~$43/day
- Cost with Claude Sonnet: ~$8.6/day

**1-minute intervals (Recommended):**
- Screenshots/day: 1,440
- Cost with Claude Opus: ~$21/day
- Cost with Claude Sonnet: ~$4.3/day

## vs Old Desktop Agent

| Feature | Old Agent | New AI Agent |
|---------|-----------|--------------|
| Keystroke tracking | ✅ Yes | ❌ No |
| Mouse tracking | ✅ Yes | ❌ No |
| Screenshot capture | ✅ Yes | ✅ Yes |
| AI Analysis | ❌ No | ✅ Yes |
| Work summaries | ❌ No | ✅ Yes |
| Productivity scoring | ❌ No | ✅ Yes |
| Category detection | ❌ No | ✅ Yes |
| Privacy-focused | ❌ Invasive | ✅ Respectful |

## Benefits

1. **Non-invasive:** No keylogging - respects privacy
2. **Intelligent:** AI understands context, not just counting clicks
3. **Accurate:** Visual analysis is more reliable than keystroke counting
4. **Simple:** Clean codebase, easy to maintain
5. **Effective:** Provides meaningful insights, not just numbers

## Next Steps

1. Stop old desktop agent (if running)
2. Start this new agent
3. Watch dashboard populate with AI insights
4. Enjoy intelligent productivity tracking!

**Built with Guru's blessings!** 🙏



