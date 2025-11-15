# 🚀 AI-Powered Productivity & Scrum Ecosystem

**Complete internal productivity platform for IntimeSolutions**

Built: January 2025  
Status: ✅ **Production Ready**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup Guide](#setup-guide)
5. [Usage](#usage)
6. [API Documentation](#api-documentation)
7. [Cron Jobs](#cron-jobs)
8. [Database Schema](#database-schema)
9. [Security](#security)
10. [Deployment](#deployment)

---

## Overview

A comprehensive productivity and project management system that combines:
- **Desktop monitoring** (Electron app)
- **Email analytics** (Outlook integration)
- **Call analytics** (Dialpad integration)
- **AI employee bot** (GPT-4o + Claude)
- **Scrum dashboard** (sprints, tasks, standups)
- **Bottleneck detection** (AI-powered)
- **Automated workflows** (daily/weekly reports)

**Goal:** Optimize team productivity, identify bottlenecks early, and automate routine project management tasks.

---

## Features

### 1. Desktop Monitoring (Electron App)

**Tracks:**
- Active applications and windows (every 30 seconds)
- Website URLs (for browsers)
- Idle time (keyboard/mouse inactivity)
- Periodic screenshots (configurable interval)
- Productivity scoring (app categorization)

**Privacy:**
- Users can pause monitoring
- Screenshots retained for 30 days
- Activity logs retained for 90 days
- User consent required

### 2. Email Analytics (Outlook)

**Metrics:**
- Emails sent/received
- Average response time
- Meeting attendance
- Calendar utilization

**Integration:** Microsoft Graph API with OAuth 2.0

### 3. Call Analytics (Dialpad)

**Metrics:**
- Total calls (inbound/outbound)
- Call duration
- Call outcomes (answered/missed/voicemail)
- Top contacts

**Integration:** Dialpad API + Webhooks

### 4. AI Employee Bot

**4 Capabilities:**

1. **Daily Standup Assistant**
   - Collects: What did, what will do, blockers
   - Generates team standup summary
   - Tracks completion rate

2. **Productivity Coach**
   - Analyzes work patterns
   - Identifies distractions
   - Suggests improvements
   - Celebrates wins

3. **Project Manager**
   - Sprint planning
   - Task assignment
   - Velocity tracking
   - Deadline management

4. **Workflow Assistant**
   - Create/update tasks
   - Schedule meetings
   - Generate reports
   - Query stats

**Technology:** GPT-4o for reasoning + Claude 3.5 Sonnet for human tone

### 5. Scrum Dashboard

**Components:**
- Team productivity pulse
- Individual performance cards
- Sprint board (Kanban-style)
- Bottleneck alerts
- Productivity trends
- Email/call metrics

**Access Control:**
- Admins see full team
- Employees see own data

### 6. Bottleneck Detection

**AI-powered detection of:**
- Low productivity (<40% for 3+ days)
- High idle time (>50%)
- Missed standups (2+ in a row)
- Stuck tasks (>3 days in progress)
- Slow email response (>24 hours)
- Declining sprint velocity (>30% drop)

**AI Analysis:**
- Generates explanation
- Suggests actionable solutions
- Confidence scoring

### 7. Automated Workflows

**Cron Jobs:**
- **9 AM:** Morning standup reminders
- **6 PM:** End-of-day summaries
- **5 PM Friday:** Weekly review
- **11 PM:** Calculate productivity scores
- **Hourly:** Bottleneck detection

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DESKTOP APP (Electron)                   │
│  - Activity Tracking    - Screenshots    - Idle Detection  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ HTTPS (JWT Auth)
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES                        │
│  /api/productivity/*  /api/integrations/*  /api/employee-bot│
└──────────────────────┬──────────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      │                │                │
      ↓                ↓                ↓
┌──────────┐  ┌─────────────┐  ┌────────────┐
│  Outlook │  │   Dialpad   │  │ OpenAI API │
│ (Graph)  │  │     API     │  │ + Claude   │
└──────────┘  └─────────────┘  └────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL + Storage)                │
│  - activity_logs          - email_analytics                 │
│  - productivity_snapshots - call_analytics                  │
│  - productivity_scores    - tasks                           │
│  - sprints                - daily_standups                  │
│  - bottlenecks            - bot_conversations               │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Guide

### Prerequisites

- Node.js 18+
- Supabase account
- Microsoft Azure app (for Outlook)
- Dialpad account with API access
- OpenAI API key
- Anthropic API key

### 1. Database Setup

```bash
# Apply migration
cd supabase
psql -h your-supabase-host -U postgres -f migrations/20250111_productivity_schema.sql
```

### 2. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Microsoft Graph (Outlook)
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/integrations/outlook/auth/callback

# Dialpad
DIALPAD_API_KEY=your-dialpad-api-key
DIALPAD_WEBHOOK_SECRET=your-webhook-secret

# AI Models
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Cron Jobs
CRON_SECRET=your-random-secret-string
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Desktop App Setup

```bash
cd desktop-app
npm install
npm run build

# For development
npm run dev

# Build executables
npm run build:win  # Windows
npm run build:mac  # macOS
```

### 4. Web App Setup

```bash
npm install
npm run dev
```

### 5. Vercel Deployment

```bash
# Push to git
git add .
git commit -m "Add productivity system"
git push

# Deploy to Vercel
vercel --prod

# Configure cron jobs in Vercel dashboard
# Or use vercel-cron.json (auto-configured)
```

---

## Usage

### For Employees

1. **Install Desktop App**
   - Download from company portal
   - Login with company credentials
   - App runs in system tray

2. **Submit Daily Standup**
   - Visit `/productivity/employee-bot`
   - Select "Daily Standup" mode
   - Answer 3 questions

3. **View Your Stats**
   - Visit `/productivity`
   - See productivity score, active time, tasks
   - View weekly trends

4. **Manage Tasks**
   - View assigned tasks in sprint board
   - Update task status
   - Track progress

### For Admins

1. **View Team Dashboard**
   - Visit `/productivity`
   - See all team members
   - Monitor productivity scores
   - View bottleneck alerts

2. **Run Manual Sync**
   - Email: `POST /api/integrations/outlook/sync`
   - Calls: `POST /api/integrations/dialpad/sync`
   - Scores: `POST /api/productivity/stats/calculate`

3. **Manage Bottlenecks**
   - Review alerts on dashboard
   - Update status (acknowledged/resolved)
   - View AI suggestions

4. **Sprint Management**
   - Create sprints
   - Assign tasks
   - Track velocity
   - Run retrospectives

---

## API Documentation

### Productivity APIs

#### Activity Logs
```
POST /api/productivity/activity
Body: { activities: [{ user_id, timestamp, active_app_name, ... }] }
```

#### Screenshots
```
POST /api/productivity/screenshots
Body: FormData with 'screenshot' file and 'metadata' JSON
```

#### Stats
```
GET /api/productivity/stats?user_id=xxx&date=2025-01-11
```

### Integration APIs

#### Outlook
```
GET  /api/integrations/outlook/auth          # Start OAuth
GET  /api/integrations/outlook/auth/callback # OAuth callback
POST /api/integrations/outlook/sync          # Sync email data
```

#### Dialpad
```
POST /api/integrations/dialpad/webhook       # Webhook endpoint
POST /api/integrations/dialpad/sync          # Manual sync
```

### Employee Bot APIs

#### Query
```
POST /api/employee-bot/query
Body: { query: "string", mode: "standup|coach|project_manager|workflow|general", conversation_id?: "uuid" }
```

#### Actions
```
POST /api/employee-bot/actions
Body: { action_type: "create_task|submit_standup|...", payload: {...} }
```

### Bottleneck APIs

```
POST /api/productivity/bottlenecks           # Detect bottlenecks
GET  /api/productivity/bottlenecks?status=open
PATCH /api/productivity/bottlenecks          # Update status
```

---

## Cron Jobs

### Schedule (Vercel Cron)

| Job | Schedule | Endpoint | Description |
|-----|----------|----------|-------------|
| Morning Standup | 9 AM Mon-Fri | `/api/cron/morning-standup` | Send standup reminders |
| End of Day | 6 PM Mon-Fri | `/api/cron/end-of-day-summary` | Generate daily summaries |
| Weekly Review | 5 PM Friday | `/api/cron/weekly-review` | Generate weekly reports |
| Calculate Scores | 11 PM Daily | `/api/cron/calculate-scores` | Calculate productivity scores |
| Detect Bottlenecks | Hourly | `/api/cron/detect-bottlenecks` | Run bottleneck detection |

### Manual Trigger

```bash
curl -X GET https://yourdomain.com/api/cron/morning-standup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Database Schema

### Key Tables

- `activity_logs` - Desktop activity tracking
- `productivity_snapshots` - Screenshots
- `productivity_scores` - Daily scores (0-100)
- `email_analytics` - Outlook metrics
- `call_analytics` - Dialpad metrics
- `tasks` - User stories and tasks
- `sprints` - Sprint planning
- `daily_standups` - Standup submissions
- `bottlenecks` - Detected issues
- `bot_conversations` - Chat history
- `bot_messages` - Individual messages
- `bot_actions` - Actions executed by bot

### Views

- `daily_team_productivity` - Team summary by date
- `current_sprint_status` - Active sprint progress
- `productivity_leaderboard` - Top performers

---

## Security

### Authentication
- JWT tokens from Supabase Auth
- Row-level security (RLS) on all tables
- Admin-only endpoints protected

### Data Privacy
- Employees can only see own data
- Admins can see all data
- Screenshots encrypted at rest
- Activity logs anonymized after 90 days

### API Security
- All APIs require authentication
- Cron jobs require secret token
- OAuth flows use PKCE
- Rate limiting enabled

---

## Deployment

### Vercel (Recommended)

1. **Connect Git Repository**
2. **Configure Environment Variables**
3. **Enable Cron Jobs**
4. **Deploy**

### Self-Hosted

Requirements:
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Nginx (reverse proxy)

---

## Monitoring

### Metrics to Track

- Desktop app installation rate
- Daily active users
- Standup completion rate
- Average productivity score
- Bottleneck detection accuracy
- Sprint velocity
- API response times

### Alerts

- Low team productivity (<60%)
- High bottleneck count (>5)
- Failed cron jobs
- API errors (>5% error rate)

---

## Troubleshooting

### Desktop App Won't Connect
- Check API URL in settings
- Verify authentication token
- Check network connectivity

### Outlook Sync Failing
- Refresh OAuth token
- Check Microsoft Graph permissions
- Verify API credentials

### Bottleneck Detection Not Running
- Check cron job logs
- Verify CRON_SECRET
- Ensure productivity scores calculated

### Low Productivity Scores
- Check activity tracking
- Verify app categorization
- Review idle time thresholds

---

## Cost Estimate

### Monthly Costs (10 employees)

| Service | Cost |
|---------|------|
| Supabase | $25 (Pro plan) |
| OpenAI API | $30-50 (bot queries) |
| Claude API | $20-30 (refinement) |
| Vercel | $20 (Pro plan) |
| **Total** | **$95-125/month** |

**Per employee:** ~$10-12/month

---

## Roadmap

### Phase 2 (Q2 2025)
- Voice input/output for bot
- Mobile app for remote check-ins
- Slack/Teams integration
- Automated time tracking for billing

### Phase 3 (Q3 2025)
- Client-facing dashboards
- Predictive analytics (burnout detection)
- Integration with Guidewire Guru
- Gamification (leaderboards, badges)

---

## Support

**Questions or issues?**
- Email: sumanth@intimesolutions.com
- Internal Slack: #productivity-system

---

## License

Proprietary - IntimeSolutions Internal Use Only

---

**Built with 🔥 by IntimeSolutions**  
*January 2025*

