# 🚀 Quick Start - Fix AI Mentor in 3 Steps

## Why AI Mentor Isn't Responding

The **OPENAI_API_KEY environment variable is missing from Vercel**. I cannot add it for you because I don't have access to your accounts.

---

## ✅ Step 1: Add OpenAI Key to Vercel (3 minutes)

### Get API Key

1. Open: https://platform.openai.com/api-keys
2. Click **"+ Create new secret key"**
3. Name: `guidewire-training`
4. **Copy the key** (starts with `sk-proj-` or `sk-`)

### Add to Vercel

**Go to:** https://vercel.com/sumanthnagolu/guidewire-assistant/settings/environment-variables

**Click:** "Add New"

**Fill in:**
- Name: `OPENAI_API_KEY`
- Value: (paste your key)
- Environments: ✅ **Check all 3 boxes** (Production, Preview, Development)

**Click:** "Save"

### Trigger Redeploy

**Option A - Via Dashboard:**
1. Go to: https://vercel.com/sumanthnagolu/guidewire-assistant/deployments
2. Click `...` menu on latest deployment
3. Click **"Redeploy"**
4. Click **"Redeploy"** again

**Option B - Via Terminal:**
```bash
cd "/Users/sumanthrajkumarnagolu/Projects/guidewire-training platform"
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

Wait ~2 minutes for deployment to complete.

---

## ✅ Step 2: Verify API Key Works

After deployment, go to:
```
https://guidewire-assistant.vercel.app/api/debug/env
```

**Expected Result:**
```json
{
  "success": true,
  "environment": {
    "openai": {
      "configured": true,
      "prefix": "sk-proj..."
    }
  }
}
```

**If it shows `"configured": false`:**
- The key wasn't saved correctly
- Repeat Step 1, making sure to check all 3 environment boxes

---

## ✅ Step 3: Run SQL Setup (One-Click)

After Vercel redeploys, go to:
```
https://guidewire-assistant.vercel.app/admin/setup
```

**Click the buttons:**
1. **"Run Setup"** for Storage Bucket
2. **"Run Setup"** for Interview Templates

Done! ✅

---

## 🧪 Test Everything

### Test AI Mentor
1. Go to: https://guidewire-assistant.vercel.app/ai-mentor
2. Type: "What is ClaimCenter?"
3. Should get a response in 2-3 seconds

### Test Interview Simulator
1. Go to: https://guidewire-assistant.vercel.app/assessments/interview
2. Select a template
3. Click "Start Interview"
4. Should get first question

---

## 🆘 If Still Not Working

### Check #1: Is the API Key Valid?

Test in terminal:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

Should return a list of models. If error, your key is invalid.

### Check #2: Vercel Logs

1. Go to: https://vercel.com/sumanthnagolu/guidewire-assistant/logs
2. Search for: `OPENAI_API_KEY`
3. If you see "not configured", the key didn't save

### Check #3: Browser Console

1. Open AI Mentor page
2. Press F12
3. Try to send a message
4. Check Console and Network tabs for errors

---

## Why I Can't Do This For You

| What | Why I Can't |
|------|-------------|
| Add OpenAI Key to Vercel | Requires your Vercel login |
| Get OpenAI API Key | Requires your OpenAI account |
| Access Your Supabase | Requires your Supabase credentials |

**But** - I created a **one-click admin UI** at `/admin/setup` so you don't have to manually run SQL!

---

## Total Time Required

- Get OpenAI key: **1 minute**
- Add to Vercel: **1 minute**
- Redeploy: **2 minutes** (automatic)
- Run SQL setup: **30 seconds** (one-click)

**Total: ~5 minutes** ⏱️

---

## Cost Info

**OpenAI Pricing (GPT-4o-mini):**
- $0.15 per 1 million tokens
- 100 messages ≈ $0.03
- New accounts get $5 free credit
- **Testing is basically free!**

---

## What Happens After Setup

✅ AI Mentor responds with Socratic guidance  
✅ Interview Simulator works  
✅ Content can be uploaded to storage  
✅ All features fully operational  

---

**Questions?** Let me know what step you're stuck on!

