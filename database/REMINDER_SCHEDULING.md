# Reminder Scheduling Setup Guide

This guide covers how to schedule automated execution of the stalled learner reminder system.

## Overview

The reminder system sends emails to learners who haven't completed any topics within the configured threshold (default: 48 hours).

**Endpoint:** `POST /api/reminders/cron`  
**Authentication:** Requires `REMINDER_CRON_SECRET` header  
**Recommended frequency:** Daily (once per day)

---

## Option 1: Vercel Cron (Recommended for Vercel Deployments)

If you're deploying on Vercel, use their built-in cron functionality.

### Setup Steps

1. **Create `vercel.json` in project root:**

```json
{
  "crons": [
    {
      "path": "/api/reminders/cron",
      "schedule": "0 10 * * *"
    }
  ]
}
```

**Schedule format:** Cron expression (UTC timezone)
- `0 10 * * *` = Daily at 10:00 AM UTC
- `0 */6 * * *` = Every 6 hours
- `0 9,17 * * *` = 9 AM and 5 PM UTC daily

2. **Set Environment Variable in Vercel Dashboard:**

Navigate to your project → **Settings** → **Environment Variables**:

```
REMINDER_CRON_SECRET=your-secure-random-string
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

3. **Deploy:**

```bash
git add vercel.json
git commit -m "Add reminder cron schedule"
git push
```

Vercel automatically configures the cron job on deployment.

4. **Verify:**

- Navigate to Vercel Dashboard → **Cron Jobs**
- Verify the job appears with correct schedule
- Check execution logs after first run

### Security Notes

- Vercel automatically injects the secret into requests
- No additional authentication headers needed
- The endpoint still validates `REMINDER_CRON_SECRET` for security

---

## Option 2: GitHub Actions (Platform-Agnostic)

Use GitHub Actions for scheduled execution, works with any hosting platform.

### Setup Steps

1. **Create `.github/workflows/reminder-cron.yml`:**

```yaml
name: Send Stalled Learner Reminders

on:
  schedule:
    # Runs daily at 10:00 AM UTC
    - cron: '0 10 * * *'
  workflow_dispatch: # Allows manual triggering

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Reminder Endpoint
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/reminders/cron" \
            -H "x-cron-secret: ${{ secrets.REMINDER_CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -w "\nHTTP Status: %{http_code}\n"
```

2. **Add GitHub Secrets:**

Navigate to GitHub repo → **Settings** → **Secrets and variables** → **Actions**:

- `APP_URL`: Your production URL (e.g., `https://guidewire-training.vercel.app`)
- `REMINDER_CRON_SECRET`: Same secret configured in your app's environment

3. **Commit and Push:**

```bash
git add .github/workflows/reminder-cron.yml
git commit -m "Add GitHub Actions reminder cron"
git push
```

4. **Test Manually:**

- Navigate to **Actions** tab in GitHub
- Select "Send Stalled Learner Reminders"
- Click **Run workflow**

### Monitoring

- Check **Actions** tab for execution history
- Review logs for HTTP response codes
- Set up notifications for failed workflows

---

## Option 3: Supabase Edge Functions (Native Integration)

Use Supabase's pg_cron extension for database-native scheduling.

### Setup Steps

1. **Enable pg_cron in Supabase:**

Navigate to Supabase Dashboard → **Database** → **Extensions** → Enable `pg_cron`

2. **Create Edge Function:**

```bash
# Install Supabase CLI
npm install -g supabase

# Create function
supabase functions new send-reminders
```

3. **Write Function (`supabase/functions/send-reminders/index.ts`):**

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const APP_URL = Deno.env.get('APP_URL')!
const CRON_SECRET = Deno.env.get('REMINDER_CRON_SECRET')!

serve(async (req) => {
  try {
    const response = await fetch(`${APP_URL}/api/reminders/cron`, {
      method: 'POST',
      headers: {
        'x-cron-secret': CRON_SECRET,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. **Deploy Function:**

```bash
supabase functions deploy send-reminders
```

5. **Set Environment Variables:**

In Supabase Dashboard → **Edge Functions** → **send-reminders** → **Settings**:

```
APP_URL=https://your-app.vercel.app
REMINDER_CRON_SECRET=your-secret
```

6. **Schedule via pg_cron:**

In Supabase SQL Editor:

```sql
-- Schedule daily at 10:00 AM UTC
SELECT cron.schedule(
  'send-learner-reminders',
  '0 10 * * *',
  $$
    SELECT
      net.http_post(
        url := 'https://your-project-id.supabase.co/functions/v1/send-reminders',
        headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
      )
  $$
);
```

7. **Verify Schedule:**

```sql
SELECT * FROM cron.job;
```

### Monitoring

- Check Edge Function logs in Supabase Dashboard
- Query `cron.job_run_details` for execution history

---

## Option 4: External Cron Services

Use third-party cron services like:

- **EasyCron** (easycron.com)
- **Cron-job.org** (cron-job.org)
- **AWS EventBridge**
- **Google Cloud Scheduler**

### Setup Example (cron-job.org):

1. Sign up at cron-job.org
2. Create new cron job:
   - **URL:** `https://your-app.vercel.app/api/reminders/cron`
   - **Method:** POST
   - **Headers:** `x-cron-secret: your-secret`
   - **Schedule:** Daily at 10:00 AM
3. Enable and test

---

## Testing the Cron Endpoint

### Manual Test (Local)

```bash
# Start dev server
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/reminders/cron \
  -H "x-cron-secret: your-local-secret" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "summary": {
    "attempts": 5,
    "triggered": 2,
    "skipped": 3,
    "errors": []
  }
}
```

### Manual Test (Production)

```bash
curl -X POST https://your-app.vercel.app/api/reminders/cron \
  -H "x-cron-secret: your-production-secret" \
  -H "Content-Type: application/json"
```

### Verify Logs

Check `learner_reminder_logs` table in Supabase:

```sql
SELECT 
  user_id,
  reminder_type,
  delivered_at,
  notes
FROM learner_reminder_logs
ORDER BY delivered_at DESC
LIMIT 10;
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REMINDER_CRON_SECRET` | ✅ | - | Secret for authenticating cron requests |
| `REMINDER_THRESHOLD_HOURS` | ❌ | 48 | Hours of inactivity before reminder |
| `REMINDER_MIN_HOURS` | ❌ | 24 | Minimum hours between reminders |
| `RESEND_API_KEY` | ✅* | - | Resend API key for email delivery |
| `RESEND_FROM_EMAIL` | ✅* | - | Sender email address |

*Required in production for email delivery. In development, emails are logged to console.

### Cron Schedule Examples

| Expression | Description |
|------------|-------------|
| `0 10 * * *` | Daily at 10:00 AM UTC |
| `0 */6 * * *` | Every 6 hours |
| `0 9 * * 1-5` | Weekdays at 9:00 AM |
| `0 8,20 * * *` | Daily at 8 AM and 8 PM |

**Note:** All times are UTC. Convert to your timezone accordingly.

---

## Monitoring & Maintenance

### Key Metrics to Track

1. **Execution Success Rate**
   - Monitor HTTP response codes
   - Track error rates in logs

2. **Email Delivery Rate**
   - Query `learner_reminder_logs` for delivery status
   - Monitor Resend dashboard for bounces/failures

3. **User Engagement**
   - Track completion rates post-reminder
   - Measure time-to-return after reminder

### Alerts

Set up alerts for:

- Cron job failures (3+ consecutive failures)
- High email bounce rates (>5%)
- Unexpected spike in reminder volume

### Debugging

Check logs in order:

1. **Cron scheduler logs** (Vercel/GitHub Actions)
2. **Next.js API logs** (`/api/reminders/cron`)
3. **Email provider logs** (Resend dashboard)
4. **Database logs** (`learner_reminder_logs`)

---

## Recommendations

| Deployment Platform | Recommended Scheduler |
|---------------------|----------------------|
| Vercel | Vercel Cron |
| Railway/Render | GitHub Actions |
| AWS/GCP | Native scheduler (EventBridge/Cloud Scheduler) |
| Any | GitHub Actions (most portable) |

**Our choice:** Vercel Cron for simplicity and native integration.

---

**Related Files:**
- `app/api/reminders/cron/route.ts` - Cron endpoint
- `modules/reminders/service.ts` - Reminder logic
- `lib/email/service.ts` - Email delivery
- `env.example` - Environment variables

