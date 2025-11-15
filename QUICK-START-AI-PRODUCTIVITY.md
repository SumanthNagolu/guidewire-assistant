# 🚀 Quick Start Guide - AI Productivity Dashboard

## Get Up and Running in 5 Minutes!

### Step 1: Get Your Anthropic API Key (2 minutes)

1. Go to: https://console.anthropic.com/
2. Sign up / Log in
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### Step 2: Add API Key (30 seconds)

Edit `.env.local` in your project root:

```bash
# Add this line (replace with your actual key)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Step 3: Run Database Migration (1 minute)

1. Open Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copy ALL contents from: `database/ai-productivity-complete-schema.sql`
3. Paste into SQL editor
4. Click "Run"
5. Wait for success message

### Step 4: Start the Server (30 seconds)

```bash
npm run dev
```

### Step 5: Access Dashboard (30 seconds)

Open browser: **http://localhost:3000/productivity/ai-dashboard**

**That's it!** 🎉

---

## What You'll See

### First Visit
- Team sidebar (showing "All Users" if teams aren't set up)
- Select your user (admin@intimesolutions.com)
- Empty dashboard (no data yet - that's normal!)

### After Desktop Agent Runs
- Screenshots will appear
- AI will analyze them automatically
- Work summaries will be generated
- Productivity scores will show
- Application usage will populate

---

## Testing Without Desktop Agent

You can test the AI analysis manually using curl:

```bash
# Replace with a real base64-encoded screenshot
curl -X POST http://localhost:3000/api/productivity/ai-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_IMAGE_HERE",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "userId": "YOUR_USER_ID",
    "application": "Chrome"
  }'
```

---

## Troubleshooting

### "ANTHROPIC_API_KEY is not configured"
→ Add the key to `.env.local` and restart `npm run dev`

### "User not found"
→ Make sure you have a user in `user_profiles` table

### "No teams showing"
→ Normal! The system creates an "All Users" fallback group

### Dashboard is empty
→ Normal until desktop agent captures screenshots or you manually test the API

---

## Next Steps

1. ✅ Dashboard is working
2. Set up teams (optional - see deployment guide)
3. Configure desktop agent
4. Watch AI magic happen! 🪄

---

**Need help?** Check `AI-PRODUCTIVITY-DEPLOYMENT-GUIDE.md` for detailed instructions.

**Ready to deploy?** See `AI-PRODUCTIVITY-COMPLETE.md` for full implementation details.

🙏 **Shambho!**



