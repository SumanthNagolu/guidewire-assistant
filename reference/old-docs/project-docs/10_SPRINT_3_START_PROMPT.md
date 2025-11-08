# Sprint 3 - Content Expansion & Onboarding

**Use this prompt to spin up any AI agent (or a new Cursor session) for Sprint 3.**

---

## 🎯 Context Recovery

We're continuing the Guidewire Training Platform after Sprint 2 deployment prep. Sprint 3 aims to ship Guided ClaimCenter learning so beta students achieve their first success fast.

### Current Baseline
- Sprint 2 wrapped: mentor API hardened, deployment runbook ready, rate limits enforced.
- Sprint 3 is ACTIVE in `project-docs/06_CURRENT_SPRINT.md` with backlog + metrics.
- We must seed a meaningful ClaimCenter curriculum (50 topics) and upgrade onboarding flows.

### Must-Review Docs
1. `project-docs/01_VISION.md` – jobs-first guiding principles
2. `project-docs/06_CURRENT_SPRINT.md` – Sprint 3 backlog, metrics, decision log
3. `project-docs/07_REVIEW_NOTES.md` – Sprint 3 risks + action log
4. `project-docs/SPRINT_2_RUNBOOK.md` – ingestion workflow tips & deployment ops
5. `project-docs/05_PROMPTS.md` – reusable prompts (see “Content Ingestion Sprint Prompt”)
6. `project-docs/99_CHANGELOG.md` – Session history (Session 004 kickoff)

---

## 🚀 Sprint 3 Objectives
**Goal:** Beta learners finish Topic 1 within 24 hours and average 10 topics by leveraging fresh ClaimCenter content plus guided onboarding.

### Key Deliverables
1. **Content ingestion tooling** – Admin workflow or script that imports CSV/JSON using snake_case keys (`video_url`, `slides_url`, `learning_objectives`) with audit logging.
2. **Curriculum seeding** – First 50 ClaimCenter topics inserted with validated prerequisite chains and QA sign-off.
3. **Onboarding experience** – Persona reminders, first-topic checklist, contextual tips inside topic page/dashboard.
4. **Engagement nudges** – Supabase Edge Function (or scheduled job) emailing opt-in learners when stalled, respecting RLS.
5. **Activation analytics** – Dashboard/report surfacing time-to-first-completion and topics-per-learner.

### Success Metrics
- ≥70% of new beta learners complete Topic 1 within 24h of onboarding.
- Active beta learners average ≥10 topics completed during sprint window.
- Onboarding satisfaction ≥4/5 (survey). Collect at least 5 responses.
- Reminder workflow logs opt-in/out events and sends <3 emails per learner/week.

---

## 🗺️ Working Plan (Suggested Phases)

### Phase 1 – Tooling & Schema (Day 1-2)
- Update/import scripts to output snake_case JSON.
- Extend admin UI (or script) to batch insert with validation + dry run mode.
- Update `SPRINT_2_RUNBOOK.md` ingest section if steps change.

### Phase 2 – Content Curations & QA (Day 3-5)
- Load first 50 topics; run QA checklist (media renders, objectives, durations, prerequisites).
- Capture batch IDs, counts, and QA reviewers in changelog.

### Phase 3 – Onboarding Experience (Day 4-6)
- Enhance `/profile-setup`, dashboard, and topic pages with guidance, checklists, progress nudges.
- Instrument analytics events for onboarding flow.

### Phase 4 – Engagement & Metrics (Day 6-7)
- Build reminder Edge Function (RLS-safe) + opt-in management.
- Publish activation dashboard; define weekly review cadence.

### Phase 5 – Review & Adjust (Day 7+)
- Collect beta feedback, iterate on content gaps, update backlog for Sprint 4.

---

## ✅ Checklist Before Coding
- [ ] Read vision + sprint docs listed above
- [ ] Confirm access to content source assets (videos/slides)
- [ ] Align with admin on QA checklist & acceptance criteria
- [ ] Ensure Supabase service role key is configured locally (for scripted imports)
- [ ] Verify reminder emails comply with opt-in/opt-out policy

---

## 🧩 Prompts & Utilities
- Use `@project-docs/05_PROMPTS.md` → “Content Ingestion Sprint Prompt”.
- Leverage `project-docs/SPRINT_2_RUNBOOK.md` ingestion tips + SQL patterns.
- For analytics dashboard, reference `modules/topics/queries.ts` and existing materialized views.

---

## 📈 End-of-Sprint Review Template
When closing Sprint 3, capture:
- Content coverage (topics seeded vs. goal) + QA notes
- Onboarding funnel metrics (signup → Topic 1 completion time)
- Reminder workflow outcomes (emails sent, opt-outs)
- Beta learner feedback summary + next backlog entries

---

### Ready to Start?
Prompt idea:
```
Kicking off Sprint 3 – Content Expansion & Onboarding.

Context chain:
@project-docs/01_VISION.md
@project-docs/06_CURRENT_SPRINT.md
@project-docs/07_REVIEW_NOTES.md
@project-docs/SPRINT_2_RUNBOOK.md

First task: design the content ingestion tooling (snake_case payloads + audit logging).
List files to touch and outline the proposed approach.
```

Let’s ship learner-first content that gets students job-ready faster! 🚀

