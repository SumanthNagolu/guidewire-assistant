# Current Sprint - Living Focus Document

*This file is THE SINGLE SOURCE of what we're building RIGHT NOW*

## Sprint: 4 - Assessments & Interview Readiness (Dec 3, 2025 → Dec 16, 2025)
**Vision Check**: "Every feature must help students get JOBS, not just certificates"
**Status**: 🚀 ACTIVE – Building mastery validation & hiring simulations

---

## 🎯 Sprint Goal
Launch assessment and interview capabilities so learners can prove mastery and rehearse hiring conversations while we capture actionable readiness signals.

## 📋 Sprint Backlog

### IN PROGRESS
- QA & testing plan for assessments (unit tests + manual script)
- Document admin workflows for quiz authoring & interview templates

### COMPLETED ✅
- [x] Drafted quiz engine spec (schema, authoring UX, scoring rules)
- [x] Implemented quiz engine (admin tooling, learner attempt flow, scoring, analytics)
- [x] Delivered interview simulator v1 with streaming AI prompts, evaluation, and summary report
- [x] Added readiness analytics dashboards (quiz performance + interview readiness)

### POST-SPRINT WATCHLIST
- Quiz engine (multiple choice, attempt history)
- Interview simulator (scenario scoring)
- Payment/subscription integration
- Advanced analytics dashboards

---

## 🔗 Context Chain for This Sprint
```
VISION: "Students must get jobs"
  ↓
MASTER ROADMAP: "Sprint 3 – Content Expansion & Onboarding"
  ↓
THIS SPRINT: "Validate mastery & simulate interviews with actionable insights"
  ↓
CURRENT TASK: "Lock assessment requirements & prepare engineering breakdown"
```

---

## 📊 Sprint Targets
- **Velocity**: 6 committed backlog items
- **Assessments**: Quiz engine MVP with authoring + randomized attempts live for first product track
- **Interview Simulator**: AI-driven mock interview delivering structured feedback & readiness score
- **Insights**: Dashboard surfaces assessment outcomes (pass rate, readiness index, attempt history)
- **Quality**: Learner satisfaction ≥4/5 on new assessment experience; interview simulator NPS ≥40

---

## 🎨 Current Working Context

### What's Open in Editor
- `/project-docs/03_MASTER_PLAN.md` – Sprint ladder + assessment scope
- `/project-docs/06_CURRENT_SPRINT.md` – This document
- `/project-docs/99_CHANGELOG.md` – Session log

### Current Branch
`main` (pre-deployment)

### Last Session
Session 006 (Sprint 3 wrap) – December 2, 2025

### Next Task
Finalize Sprint 4 acceptance criteria and break work into engineering tasks (quiz engine, interview simulator, dashboard updates).

### Terminal Commands
```bash
# Content tooling & verification
npm run lint
npm run build
npm run dev
```

---

## 🧭 Decision Log (Sprint 3 Focus)

### Why launch assessments now?
- Learners need proof of mastery to convert into interviews—quizzes/interviews close that loop.
- Assessment data unlocks readiness analytics and helps mentors tailor guidance.

### Why pair quizzes with interview simulator?
- Quizzes validate knowledge; interview sims validate communication and scenario handling.
- Shared infrastructure (question banks, scoring, feedback) keeps engineering efficient.

---

## 🔄 Session Updates

### Session 002 Kickoff – Nov 4, 2025 – 1 hour (Planning)
**Completed**:
- ✅ Drafted Sprint 2 roadmap and backlog
- ✅ Identified production hardening gaps (mentor API, env docs)
- ✅ Defined beta launch success metrics

**Next Session Focus**:
- [ ] Standardize mentor API response + logging
- [ ] Update deployment docs with environment variable canonical names
- [ ] Prepare topic seeding playbook

**Vision Alignment Check**:
Does today's work help students get jobs? **YES**
- Deployment unlocks real learners and job-ready feedback loops.
- Ensures mentor guidance remains cost-effective and reliable in production.

---

### Session 006 Wrap – Dec 2, 2025 – 2 hours
**Completed**:
- ✅ Added admin import actions (`Load 50 ClaimCenter Topics`) with sample dataset wiring
- ✅ Verified onboarding experience updates (dashboard checklist, persona cues, topics CTA)
- ✅ Updated runbook/README to document seeding workflow and sprint closure

**Next Session Focus**:
- [ ] Draft Sprint 4 backlog (quiz engine, interview simulator, assessment analytics)

**Vision Alignment Check**:
Does today's work help students get jobs? **YES**
- Seeded curriculum plus guided onboarding ensures learners hit Topic #1 inside 24h.
- Sequential nudges keep students progressing toward interview-ready mastery.

---

## 🔄 Session Update Template
```markdown
### Session [NUMBER] - [DATE] - [HOURS]
**Completed**:
- ✅ [Feature/task]

**Next Session Focus**:
- [ ] [Next priority]

**Vision Alignment Check**:
Does today's work help students get jobs? YES/NO - Why:
```