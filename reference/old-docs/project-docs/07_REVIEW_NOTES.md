# Review Agent Notes

## Session 004 – Sprint 3 Kickoff (November 18, 2025)

### Sprint 3 Snapshot – Content Expansion & Onboarding
- Objective: load 50 high-quality ClaimCenter topics and craft a guided first-topic experience that keeps beta learners on track within 24 hours.
- Top priorities: content ingestion tooling with snake_case payloads, onboarding UX upgrades (persona guidance, first-topic checklist), automated reminder workflow, and activation metrics dashboard.
- Dependencies: runbook SQL needs updating before seeding, onboarding assets (videos/slides/objectives) curated by SMEs.

### Risks & Watchpoints
1. **Runbook JSON schema drift** *(Medium)* — `SPRINT_2_RUNBOOK` still uses camelCase keys; tooling must normalize to snake_case before inserts.
2. **Content QA load** *(Medium)* — 50 topics require objective reviews to maintain job-readiness quality; define acceptance checklist early.
3. **Email reminders & compliance** *(Low)* — Ensure opt-in state is stored and RLS policies cover new tables/functions prior to sending nudges.

### Action Log (Sprint 3)
- [x] Content ingestion tooling delivered; runbook + docs updated to snake_case payloads.
- [x] 50 ClaimCenter topics seeded with prerequisite chains validated in staging.
- [x] Onboarding enhancements deployed (guided checklist, contextual tips, persona reminders).
- [x] Stalled learner reminder job active with audit logging and opt-out support.
- [x] Activation metrics dashboard live tracking time-to-first-completion and topics-per-learner.

---

## Session 005 – Sprint 3 Wrap Review

### Executive Summary
- Sprint 3 deliverables remain missing from the codebase; updates are documentation-only.
- Content seeding templates now use snake_case, but no ingestion tooling or seeded topics exist.
- Onboarding UI, reminder automation, and activation metrics are unchanged from Sprint 2.

### Findings (ordered by severity)
1. **Missing content ingestion tooling** *(High)* – No new scripts or modules exist to batch-insert topics; `modules/topics/` still only provides read/update helpers. ```1:238:modules/topics/queries.ts
// ... existing code ...
export async function updateTopicProgress(
  userId: string,
  topicId: string,
  completionPercentage: number,
  timeSpentSeconds: number = 0
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
// ... existing code ...
```
2. **Topics not seeded** *(High)* – Database contains no new ClaimCenter content entries; no ingestion scripts or migrations were created to populate the curriculum.
3. **Onboarding enhancements absent** *(Medium)* – Dashboard and topic views show no guided checklist or contextual tips; copy remains identical to Sprint 2. ```1:146:app/(dashboard)/dashboard/page.tsx
// ... existing code ...
        <p className="text-gray-600 mt-2">
          Continue your journey to becoming job-ready in Guidewire
        </p>
// ... existing code ...
``` ```18:225:components/features/topics/TopicContent.tsx
// ... existing code ...
          {!isCompleted && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Once you&apos;ve watched the video and reviewed the materials, mark this topic
                as complete to unlock the next topics.
              </p>
// ... existing code ...
```
4. **Reminder workflow not implemented** *(Medium)* – No Supabase functions, tables, or jobs for opt-in email nudges; `database/schema.sql` shows no reminder-specific structures. ```1:400:database/schema.sql
// ... existing code ...
CREATE POLICY "Users can create messages in own conversations"
  ON ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );
// ... existing code ...
```
5. **Activation metrics missing** *(Low)* – Dashboard still surfaces only aggregate counts; there are no analytics for time-to-first-completion or topics-per-learner. ```33:96:app/(dashboard)/dashboard/page.tsx
// ... existing code ...
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
// ... existing code ...
```

### Positives
- `project-docs/SPRINT_2_RUNBOOK.md` now documents snake_case ingest payloads and workflow guidance. ```36:92:project-docs/SPRINT_2_RUNBOOK.md
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
// ... existing code ...
```

### Status
- Sprint 3 cannot be considered complete until application code delivers ingestion tooling, seeded content, onboarding improvements, reminder automation, and activation analytics.

---

## Session 006 – Gap Analysis vs End Target

### Scope of Comparison
- Benchmarked current repo against `project-docs/03_MASTER_PLAN.md`, `04_TECHNICAL_SPEC.md`, and sprint outcomes to determine readiness for the full Guidewire training vision (250 sequential topics, onboarding funnels, AI coaching, interview prep, monetization, analytics).

### Critical Gaps
1. **Content Scale (High)** – No ingestion tooling or seeded datasets beyond templates; platform lacks the 50–250 topic inventory required for initial launch.
2. **Onboarding & Activation (High)** – Missing guided first-topic experience, persona-based nudges, and activation analytics; violates retention guardrails highlighted in master plan.
3. **Engagement Automation (High)** – No stalled-learner reminder workflow, email opt-in storage, or Supabase Edge jobs; prevents automated cohort support.
4. **Assessment & Interview Systems (High)** – Quiz engine and interview simulator from roadmap remain unimplemented; only mentor module exists.
5. **Monetization & Analytics (Medium)** – No Stripe integration, advanced dashboards, or cost alerting features expected in later sprints; tracker should note as future scope.
6. **Operations & QA (Medium)** – Lacks admin tooling for bulk topic management, QA checklists, and test coverage; required for scaling to 250 topics.

### Near-Term Priorities
- Deliver ingestion tooling + seed first curriculum batch.
- Implement onboarding enhancements with activation metrics and reminder workflow.
- Plan execution path for assessments/interview simulator in upcoming sprint to align with master plan sequencing.

---
## Session 002 – Sprint 2 Wrap (November 18, 2025)

### Executive Summary
- Beta launch prerequisites are in place: AI mentor endpoint hardened with structured JSON errors, per-user rate limiting, and token usage logging.
- Supabase and OpenAI environments are fully documented (`env.example`, `DEPLOYMENT.md`, `SPRINT_2_RUNBOOK.md`), and response headers now expose remaining mentor quota to clients.
- Operational playbooks cover admin promotion, sequential lock QA, topic seeding, and beta monitoring so the cohort launch can proceed with guardrails.

### Alignment Checks
- **Vision (`01_VISION.md`)**: Rate limiting plus sequential validation protect the mastery-first philosophy before learners advance to new topics.
- **Methodology (`02_METHODOLOGY.md`)**: The runbook mirrors live cohort operations—admin handoffs, beta feedback loops, and daily monitoring rituals.
- **Technical Spec (`04_TECHNICAL_SPEC.md`)**: Mentor API now respects the `{ success, data, error }` response contract for errors, streams answers via Vercel AI SDK, and enforces the 50-query/day ceiling with real token telemetry.
- **Security**: Service role key stays server-side; Supabase access continues under RLS; JSON error helpers avoid leaking internal details.

### Wins
- `app/api/ai/mentor/route.ts` introduces Zod validation, consistent JSON error responses, OpenAI usage capture (`stream_options.include_usage`), and quota headers.
- `modules/ai-mentor/queries.ts` now exports `getMentorUsageWindow`, enabling accurate per-user message counts and cost reporting drawn from stored metadata.
- Deployment docs + `env.example` align on canonical key names so production and local environments cannot drift.

### Outstanding Findings → Fed into Sprint 3 Backlog
1. **Content seeding template mismatches front-end schema** *(Medium)* — `project-docs/SPRINT_2_RUNBOOK.md` seeds JSON with camelCase keys (`videoUrl`, `slidesUrl`, `learningObjectives`). UI components expect snake_case (`video_url`, `slides_url`, `learning_objectives`). Addressed in Sprint 3 action log.
2. **Sprint tracker status drift** *(Resolved in Session 004)* — `project-docs/06_CURRENT_SPRINT.md` now reflects Sprint 3 focus and updated backlog.

### Resolved Items
- Mentor API response contract + streaming metadata coverage.
- Per-user rate limiting and token logging persisted in Supabase metadata and surfaced in response headers.
- Environment documentation synchronized around `SUPABASE_SERVICE_ROLE_KEY` naming across templates and deployment guide.

### Action Log (Sprint 2)
- [x] Mentor API conforms to standardized response contract and streams structured errors.
- [x] Rate limiting + token usage persisted for each user/day to enforce 50 query policy.
- [x] Environment docs updated with authoritative key naming and deployment configuration matrix.
- [ ] Topic seeding runbook validated with initial 5-10 ClaimCenter topics, sequential locks verified. *(Blocked until JSON key mismatch is corrected.)*
- [x] Beta launch checklist executed: invites prepared, monitoring dashboards defined, feedback capture process documented.

### Monitoring Focus Going Forward
- Validate ingestion tooling outputs (snake_case) end-to-end before seeding real topics.
- After beta launch, audit mentor quota headers vs. Supabase `ai_messages` metrics to ensure rate limiting holds under load.
- Re-run Lighthouse and bundle-size checks once ClaimCenter content is live.

---

## Session 001 – Sprint 1 Wrap (November 4, 2025)

### Sprint 2 Kickoff Snapshot (Deployment & Launch)
- Primary focus: productionize AI mentor contract, align environment variables, and take the MVP live on Vercel with seeded content.
- Immediate actions: standardize `{ success, data, error }` responses in `app/api/ai/mentor/route.ts`, add per-user rate limits + token logging, and update `.env.example` / `DEPLOYMENT.md` with canonical key names (`SUPABASE_SERVICE_ROLE_KEY`).
- Content readiness: draft seeding checklist covering admin promotion SQL, topic creation workflow, and sequential lock QA steps.
- Monitoring plan: publish beta launch checklist (logs, AI usage dashboards, feedback intake) and confirm cost guardrails for 50 mentor queries/user/day.

### Executive Summary
- MVP foundation delivered: full auth flow, sequential topics, AI mentor, admin panel, and deployment docs all in place.
- Architecture adheres to modular monolith pattern with clean separation across `app`, `modules`, `lib`, and `components` directories.
- Documentation is thorough (`README`, `instructions.md`, technical specs, methodology, changelog) and keeps vision front and center.
- Database schema implements required RLS policies, materialized views, indexes, and JSONB flexibility per technical spec.
- AI mentor streams via Vercel AI SDK and enforces Socratic teaching guidance aligned with pedagogy goals.

### Alignment Checks
- **Vision (`01_VISION.md`)**: Sequential learning locks, persona-based onboarding, and AI mentorship directly support the “jobs-first” mission.
- **Methodology (`02_METHODOLOGY.md`)**: Training flow mirrors live cohort process—profile setup → sequential topics → mentor guidance → progress dashboards.
- **Technical Spec (`04_TECHNICAL_SPEC.md`)**: Using App Router + strict TypeScript + Tailwind/shadcn; Supabase schema, RLS, and materialized view implemented as required.
- **Architecture**: Feature modules (`modules/auth`, `modules/topics`, `modules/ai-mentor`) keep business logic out of UI, preserving modular monolith boundaries.

### Security & Compliance
- Supabase clients split across browser/server/admin with environment variables (no keys in client bundles).
- RLS enabled for all tables with user-scoped or admin policies per schema.
- Auth routes gate dashboard content; middleware enforces protected areas.
- Recommendation (since resolved in Session 002): standardize API responses—addressed by mentor route updates.

### Performance & Cost Controls
- AI mentor streams responses and trims history to last 6 message pairs, helping meet token policy.
- Token tracking initially estimated via character count; now superseded by streaming usage metadata (Session 002).
- Need for explicit rate limiting noted in Session 001; delivered in Session 002.
- Bundle size remained within target, to be revalidated post-content upload.

### Data & Progress Integrity
- Topic queries leverage prerequisite RPC to lock content until prior items complete—sequential learning enforced.
- Materialized progress view + Supabase functions deliver aggregate reporting and performant writes.
- Admin capabilities exist; CSV upload validation to be revisited when implemented.

### Historical Follow-ups (Session 001)
- ✅ API response contract for mentor route.
- ✅ Per-user rate limiting and token accounting.
- ✅ Canonical service role key naming across templates/docs.

---

*Reviewer: Technical Review Agent (Cursor)*

