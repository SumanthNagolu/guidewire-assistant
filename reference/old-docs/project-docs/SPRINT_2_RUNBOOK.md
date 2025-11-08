# Sprint 2 Deployment Runbook

This runbook translates Sprint 2 goals into an executable checklist covering environment setup, admin operations, content seeding, and beta monitoring.

## 1. Environment Snapshot
- Reference `env.example` → copy to `.env.local` and populate values before running locally or deploying.
- Required secrets (canonical names):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_APP_URL` (update post-deploy)
- Follow `DEPLOYMENT.md` for Vercel + Supabase wiring. Add the same variables to Vercel project settings.

## 2. Admin Operations
### Promote Yourself to Admin
Run in Supabase SQL Editor after first login:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@domain.com';
```

### Verify Sequential Locks
1. Log in as admin, open Topics page.
2. Create a non-admin test user.
3. Confirm Topic 1 unlocked, Topic 2 locked.
4. Mark Topic 1 complete → Topic 2 unlocks.

### AI Mentor Guardrails
- Rate limit target: 50 user prompts/day (enforced in API).
- Headers returned per request: `X-RateLimit-Limit`, `X-RateLimit-Remaining`.
- Supabase `ai_messages` table stores per-message usage metadata (`metadata.usage`).

## 3. Content Seeding (5-10 ClaimCenter Topics)
Use the Admin UI for the fastest import, or leverage Supabase SQL for custom datasets.

### Admin UI (recommended)
1. Sign in as an admin and open `Admin → Topic Management`.
2. Click **Load 50 ClaimCenter Topics** to ingest the starter dataset from `data/claimcenter-topics.json`.
3. Refresh the page to confirm the ClaimCenter track lists 50 sequential topics.
4. (Optional) Upload your own JSON file with the **Upload & Import** form (schema snippet provided on the page).

### Manual SQL (custom payloads)
Use the Supabase SQL Editor for bespoke seeding. Sample SQL for the first two topics:
```sql
INSERT INTO topics (id, product_id, position, title, description, prerequisites, duration_minutes, content, published)
VALUES
  (
    uuid_generate_v4(),
    (SELECT id FROM products WHERE code = 'CC' LIMIT 1),
    1,
    'ClaimCenter Fundamentals',
    'Navigation, queues, and core entities overview.',
    '[]'::jsonb,
    25,
    jsonb_build_object(
      'video_url', 'https://www.youtube.com/watch?v=xxxxxxx',
      'slides_url', 'https://slides.company.com/claimcenter-fundamentals',
      'learning_objectives', jsonb_build_array(
        'Understand the adjuster workspace',
        'Identify key claim data structures'
      )
    ),
    true
  ),
  (
    uuid_generate_v4(),
    (SELECT id FROM products WHERE code = 'CC' LIMIT 1),
    2,
    'FNOL Intake Deep Dive',
    'Walk through first notice of loss, data capture, and validation rules.',
    jsonb_build_array('<<TOPIC_ID_OF_TOPIC_1>>'),
    30,
    jsonb_build_object(
      'video_url', 'https://www.youtube.com/watch?v=yyyyyyy',
      'slides_url', 'https://slides.company.com/fnol-intake',
      'learning_objectives', jsonb_build_array(
        'Capture claimant data accurately',
        'Configure validation rules for FNOL forms'
      )
    ),
    true
  );
```

Replace `<<TOPIC_ID_OF_TOPIC_1>>` with the ID generated from the first insert (copy from Supabase results). Repeat pattern for additional topics (position increments sequentially).

### Checklist
- [ ] Import the starter dataset (Admin UI button or CLI) and verify 50 topics exist.
- [ ] Confirm Topic #1 is unlocked (`prerequisites = []`).
- [ ] Confirm each subsequent topic references the prior topic ID.
- [ ] Spot check durations (20-40 minutes) and learning objectives per topic.
- [ ] Open Topic #1 in the app—verify video, slides, checklist, and mentor guidance render correctly.

### Ingestion Workflow Tips (Sprint 3)
1. **Normalize payloads** – ensure any CSV/JSON importer maps to snake_case keys shown above.
2. **Version content** – store source files (slides/video links) in shared drive with revision history.
3. **QA checklist** – confirm each topic includes: accurate prerequisites, estimated duration, learning objectives (≤3 bullet points), and published flag.
4. **Logging** – capture import batch IDs + timestamps in admin notes for auditability.

## 4. Beta Launch Checklist
### Pre-Launch
- [ ] Run `npm run lint` and `npm run build` locally.
- [ ] Smoke test: signup → profile setup → topic content → mentor prompt.
- [ ] Validate `X-RateLimit` headers and token logging in `ai_messages`.
- [ ] Configure Supabase Auth redirect URLs for Vercel domain.

### Invite Cohort (3-5 Users)
- [ ] Send invite email with onboarding instructions + expectations (<24h to first topic).
- [ ] Create unique test account per beta user for impersonation/troubleshooting.
- [ ] Share feedback form (Google Form or Typeform) for session notes.

### Monitoring
- Daily:
  - [ ] Supabase Dashboard → Auth (new signups) & Database (errors).
  - [ ] Vercel Logs (500s from `app/api/ai/mentor`).
  - [ ] AI spend: query `ai_messages` monthly totals.
- Session End:
  - [ ] Collect mentor feedback quality (ensure Socratic tone maintained).
  - [ ] Review sequential completion stats (should match prerequisite chain).

### Post-Session Retro
- [ ] Document beta feedback in `project-docs/99_CHANGELOG.md`.
- [ ] Update backlog in `06_CURRENT_SPRINT.md` with new findings.
- [ ] Decide next content batch scope (ClaimCenter topics 3-10, etc.).

## 5. Useful Queries
**Daily Mentor Usage per User (last 24h)**
```sql
SELECT c.user_id,
       COUNT(*) FILTER (WHERE m.role = 'user') AS prompts,
       SUM((m.metadata -> 'usage' ->> 'total_tokens')::integer) AS tokens
FROM ai_messages m
JOIN ai_conversations c ON c.id = m.conversation_id
WHERE m.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY c.user_id
ORDER BY prompts DESC;
```

**Recent Topic Completions**
```sql
SELECT tp.title,
       tc.user_id,
       tc.completed_at
FROM topic_completions tc
JOIN topics tp ON tp.id = tc.topic_id
ORDER BY tc.completed_at DESC
LIMIT 20;
```

Keep this runbook updated as Sprint 2 progresses—treat it as the ground truth for operations during the beta launch window.

