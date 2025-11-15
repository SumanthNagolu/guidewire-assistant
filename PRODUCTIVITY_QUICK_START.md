# 🚀 Productivity System - Quick Start Guide

## ⚡ Start Capturing in 2 Minutes

### Step 1: Navigate to Agent
```bash
cd productivity-capture
```

### Step 2: Start Agent
```bash
npm start
```

### Step 3: Verify It's Working
```bash
# You should see:
✅ Productivity capture agent started
✅ Capturing screenshot every 30 seconds
✅ Uploading to: https://your-app.vercel.app
```

That's it! The agent is now running.

---

## 🛑 Stop Capturing

```bash
# Press Ctrl+C to stop
```

---

## ⚙️ Configuration

Edit `productivity-capture/.env`:

```env
# Your Next.js app URL
API_URL=https://your-app.vercel.app

# User email/ID
USER_ID=your.email@company.com

# Capture every X seconds (default: 30)
CAPTURE_INTERVAL=30

# JPEG quality 1-100 (default: 60)
SCREENSHOT_QUALITY=60
```

---

## 📊 View Your Productivity

1. Go to your app: `https://your-app.vercel.app`
2. Navigate to `/dashboard/productivity`
3. See your:
   - Activity timeline
   - Time tracking
   - AI-generated summaries
   - App usage stats

---

## 🔒 Privacy

- **No local storage** - Nothing saved on your computer
- **User-controlled** - You can delete all data anytime
- **Encrypted** - All transmission via HTTPS
- **Private** - Only you see your data (RLS enforced)

---

## 💡 Tips

### Adjust Frequency
- **More frequent** (15s): Better detail, more data
- **Less frequent** (60s): Lower overhead, less data

### Quality Settings
- **High quality** (80-90): Better AI analysis, larger files
- **Low quality** (40-50): Faster uploads, smaller files
- **Balanced** (60): Recommended default

### Use Cases
- **Time tracking** - Prove hours worked
- **Productivity analysis** - See where time goes
- **Project documentation** - Automatic work log
- **Team transparency** - Share progress
- **Remote work** - Show engagement

---

## 🚀 Run in Background (macOS)

### Option 1: Use Terminal in Background
```bash
cd productivity-capture
nohup npm start > capture.log 2>&1 &
```

### Option 2: Use PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
cd productivity-capture
pm2 start npm --name "productivity-capture" -- start

# Save configuration
pm2 save

# Set to run on startup
pm2 startup
```

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs productivity-capture # View logs
pm2 stop productivity-capture # Stop
pm2 restart productivity-capture # Restart
pm2 delete productivity-capture # Remove
```

---

## 🐛 Troubleshooting

### Agent won't start
```bash
# Reinstall dependencies
cd productivity-capture
npm install

# Rebuild
npm run build

# Try again
npm start
```

### No screenshots appearing
1. Check permissions (macOS: System Preferences → Privacy → Screen Recording)
2. Verify API_URL is correct
3. Check you're logged into the app
4. Review capture.log for errors

### High CPU usage
- Increase CAPTURE_INTERVAL (e.g., 60 seconds)
- Lower SCREENSHOT_QUALITY (e.g., 40)
- Check for other resource-heavy apps

---

## 📈 What Gets Captured

✅ **Screenshot** - Visual of your screen  
✅ **Timestamp** - When it was taken  
✅ **Active window** - What app you're using  
✅ **Window title** - Document/page name  
✅ **Idle detection** - Screen not changing  

❌ **NOT captured:**
- Keystrokes
- Mouse movements
- Clipboard data
- Files on your computer
- Personal documents
- Passwords

---

## 🎯 Next Steps

1. **Start the agent** - Get 1 day of data
2. **Review dashboard** - See your productivity insights
3. **Adjust settings** - Fine-tune to your needs
4. **Roll out** - Deploy to team if satisfied

---

**Questions?** Check the full documentation: `/productivity-capture/README.md`

---

✅ **READY TO GO!** Start tracking productivity now! 🚀

