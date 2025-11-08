# Guidewire Training Platform – Master Roadmap

## Mission & Guardrails
- Vision: every feature accelerates students into Guidewire roles, not just certificates.
- Architecture: modular monolith in Next.js 15, Supabase backend with universal RLS, Vercel AI SDK streaming, GPT-4o-mini first.
- Delivery cadence: focused 1- to 2-week sprints scoped to 4-6 high-impact outcomes with measurable learner value.
- Budget ceiling: $600 for first six months; track AI token usage and Supabase tier upgrades per sprint.

## Sprint Ladder

### Sprint 1 – Foundation Setup ✅ (Complete)
- Objectives: project scaffolding, Supabase schema with RLS, auth flows, sequential topics, AI mentor MVP, admin shell.
- Output: production-ready codebase with docs (`instructions.md`, `.cursorrules`, deployment guides) and zero lint debt.
- Metrics hit: 11/11 backlog items, 6-7 hrs, $0 spend, AI mentor streaming verified locally.

### Sprint 2 – Deployment & Launch 🚀 (Complete)
- Outcomes:
  - Mentor API hardened with standardized responses, daily rate limits, and token usage logging.
  - Environment documentation unified (`env.example`, `DEPLOYMENT.md`) plus operational `SPRINT_2_RUNBOOK.md` for admin promotion, content seeding, and beta monitoring.
  - Vercel/Supabase deployment path defined; beta guardrails (quota headers, cost queries) ready for execution.
- Next steps: execute runbook to seed first topics, invite beta learners, and capture feedback during Sprint 3.

### Sprint 3 – Content Expansion & Onboarding 🎓 (Active)
- Focus: populate rich ClaimCenter content and ensure new learners complete their first topic within 24 hours.
- Deliverables:
  - Content ingestion tooling + workflows to load 50 priority ClaimCenter topics (videos, slides, objectives, prerequisites) with snake_case JSON payloads.
  - Enhanced onboarding journey: profile guidance, first-topic walkthrough, contextual progress nudges in dashboard/topic views.
  - Engagement nudges (Supabase Edge Function or cron) for stalled learners with opt-in email reminders and RLS-safe queries.
- Success metrics: ≥70% of new beta learners finish Topic 1 in <24h, average 10 topics completed per active beta learner, baseline content quality reviews captured.

### Sprint 4 – Assessments & Interview Readiness 🧠
- Focus: validate mastery and simulate hiring conversations.
- Deliverables:
  - Quiz engine with Zod-validated question authoring, randomized attempts, API responses in standard shape.
  - AI interview simulator leveraging mentor infra with scenario prompts, scoring rubric, and post-interview report.
  - Progress dashboard upgrades highlighting assessment results and interview readiness indicators.
- Metrics: quiz completion rate >60%, interview simulator NPS ≥40.

### Sprint 5 – Monetization & Analytics 💼
- Focus: convert beta to revenue and improve platform insight.
- Deliverables:
  - Stripe subscription integration (server-side checkout, Supabase webhook, access gating).
  - Admin analytics (topic completion funnels, AI usage spend, churn indicators) via materialized views.
  - Cost guardrails: automated alerts when AI/token spend exceeds 80% monthly budget.
- Metrics: first paying cohorts onboarded, dashboard adoption by admins weekly.

### Sprint 6 – Scale & Quality Assurance 🛡️
- Focus: harden platform for broader rollout.
- Deliverables:
  - Automated test suite coverage on critical flows (auth, prerequisites, mentor, payments) with CI integration.
  - Performance tuning (bundle size audits, Supabase indices, caching strategy) to sustain 1k users.
  - Accessibility and mobile responsiveness audit with remediation plan.
- Metrics: Lighthouse perf >85 mobile, error budget <1%, test coverage thresholds defined (target ≥60% critical paths).

## Cross-Sprint Streams
- **Content Quality**: treat learner satisfaction as continuous; collect feedback each sprint and feed into topic revisions.
- **AI Ethics & Guardrails**: uphold Socratic approach, track mentor drift, enforce per-user query caps.
- **Operations**: maintain `99_CHANGELOG.md`, update `06_CURRENT_SPRINT.md` each sprint, and append review insights in `07_REVIEW_NOTES.md`.

## Tracking & Governance
- Metrics dashboard: maintain KPIs (completion rate, AI spend, activation, retention) updated per sprint review.
- Sprint ceremonies: start with vision alignment check, end with review/retro captured in `07_REVIEW_NOTES.md`.
- Decision log: document architectural or vendor changes immediately to avoid context drift.

