# AI Features Troubleshooting Guide

## Issue: AI Mentor / Interview Simulator Not Responding

### Symptoms
- AI Mentor page loads but no response when sending messages
- Interview Simulator not starting or showing errors
- Browser console shows "AI service is not configured" or 503 error

### Root Cause
The `OPENAI_API_KEY` environment variable is not set in Vercel.

---

## Solution: Add OpenAI API Key to Vercel

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Name it: `guidewire-training-platform`
5. **Copy the key immediately** (you can't see it again!)
   - Format: `sk-proj-...` or `sk-...`

### Step 2: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `guidewire-assistant`
3. Go to **Settings** → **Environment Variables**
4. Click "Add New"
5. Fill in:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Paste your OpenAI API key (starts with `sk-`)
   - **Environments**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 3: Redeploy

**Option A: Trigger New Deployment (Recommended)**
```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin main
```

**Option B: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click `...` on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" (faster)
5. Click **Redeploy**

### Step 4: Verify

After deployment completes (~2 minutes):

1. **Check environment variable is loaded:**
   - Go to: `https://guidewire-assistant.vercel.app/api/debug/env`
   - Should show:
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

2. **Test AI Mentor:**
   - Go to `/ai-mentor`
   - Ask: "What is ClaimCenter?"
   - Should get a Socratic response within 2-3 seconds

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → **Logs**
   - Should NOT see: `[AI Mentor] OPENAI_API_KEY is not configured`

---

## Additional Checks

### Check 1: Verify API Key is Valid

Test your key locally:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

**Expected:** List of available models (gpt-4o-mini, gpt-4, etc.)
**If fails:** Your API key is invalid or revoked

### Check 2: Check OpenAI Account Credits

1. Go to [OpenAI Usage](https://platform.openai.com/usage)
2. Verify you have credits or a payment method
3. Check usage limits

**Cost Estimate:**
- GPT-4o-mini: ~$0.15 per 1M tokens
- 100 messages: ~$0.03
- Very cheap for testing!

### Check 3: Verify Environment Variables in Build Logs

1. Vercel Dashboard → **Deployments** → Select latest
2. Click **View Build Logs**
3. Search for: `OPENAI_API_KEY`
4. Should show: `[REDACTED]` (not the actual key)

---

## Common Errors and Fixes

### Error: "Rate limit exceeded"
**Cause:** Too many API requests  
**Fix:** 
- Check [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- Upgrade to Tier 1 ($5 spent) for higher limits
- Implement backoff/retry logic (already built-in)

### Error: "Insufficient credits"
**Cause:** No payment method or $0 balance  
**Fix:**
- Add payment method to OpenAI account
- Top up credits

### Error: "Invalid API key"
**Cause:** Key is wrong, revoked, or expired  
**Fix:**
- Generate a new API key
- Update Vercel environment variable
- Redeploy

### Error: "Model not available"
**Cause:** Your account doesn't have access to GPT-4o-mini  
**Fix:**
- Wait for API access (usually instant)
- Use gpt-3.5-turbo as fallback (update code)

### Error: Still not working after adding key
**Possible Causes:**
1. **Didn't redeploy** → Trigger new deployment
2. **Key has spaces** → Remove any whitespace from key
3. **Wrong environment** → Ensure key is in Production env
4. **Cache issue** → Clear browser cache and reload

---

## Testing AI Features Locally

### Setup Local Environment

1. **Create `.env.local` file:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=sk-your-openai-key
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Test AI Mentor:**
   - Go to: `http://localhost:3000/ai-mentor`
   - Ask a question
   - Check terminal logs for errors

---

## Monitoring AI Usage

### Check Token Usage in Database

```sql
-- Total tokens used per day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as messages,
  SUM(tokens_used) as total_tokens,
  ROUND((SUM(tokens_used)::numeric / 1000000) * 0.15, 4) as est_cost_usd
FROM ai_messages
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

### Check Rate Limits

```sql
-- Messages per user today
SELECT 
  u.email,
  COUNT(*) as messages_today
FROM ai_messages m
JOIN ai_conversations c ON m.conversation_id = c.id
JOIN auth.users u ON c.user_id = u.id
WHERE m.created_at >= CURRENT_DATE
GROUP BY u.email
ORDER BY messages_today DESC;
```

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env.local` (already in `.gitignore`)
   - Use Vercel environment variables

2. **Rotate keys regularly**
   - Generate new key every 90 days
   - Revoke old keys

3. **Monitor usage**
   - Set up OpenAI usage alerts
   - Check monthly spending

4. **Rate limiting**
   - Already implemented: 50 messages/user/day
   - Adjust in `modules/ai-mentor/queries.ts`

---

## Support

If you're still having issues:

1. **Check Vercel Logs:**
   - Vercel Dashboard → Logs → Real-time
   - Look for errors during API calls

2. **Check Browser Console:**
   - F12 → Console tab
   - Network tab → Filter by `/api/ai/`
   - Check request/response

3. **Check OpenAI Status:**
   - [OpenAI Status Page](https://status.openai.com/)

4. **Need Help?**
   - Check error messages in logs
   - Verify all environment variables are set
   - Test with a new API key

---

## Debug Endpoint

**⚠️ Security Warning:** Remove this endpoint in production!

**URL:** `/api/debug/env`

**Response:**
```json
{
  "success": true,
  "environment": {
    "openai": {
      "configured": true,
      "prefix": "sk-proj..."
    },
    "supabase": {
      "url": true,
      "anonKey": true,
      "serviceRole": true
    }
  }
}
```

This endpoint helps diagnose environment variable issues without exposing actual secrets.

