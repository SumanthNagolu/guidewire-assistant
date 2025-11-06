# Sprint 4 Plan – Assessments & Interview Readiness

## Mission Alignment
Empower learners to validate mastery and rehearse hiring conversations so they graduate from the onboarding tracks with proof of readiness. Every deliverable in this sprint must answer: *"Does this help a learner land the job faster?"*

## Outcomes & Acceptance Criteria

### 1. Quiz Engine MVP
- Authoring: Admins can create/update quizzes linked to topics/products using Zod-validated forms or JSON imports.
- Learner Experience: Quizzes load with skeleton states, support randomized question order, track timer (optional), and show progress per question.
- Scoring: Submission immediately calculates per-question correctness, aggregates score, marks pass/fail using configurable thresholds, and stores explanations.
- Persistence: All quiz metadata, attempts, and answer selections persist in Supabase with RLS so learners can only view their own attempts while admins can review aggregate performance.
- Resilience: Retry-friendly with optimistic UI for transient failures; prevents double submissions.

### 2. Interview Simulator v1
- Session Flow: Learners choose role focus (e.g., ClaimCenter configuration) and start a streamed AI interview with guided introductions, question cadence, and ability to request hints.
- Evaluation: Each answer is logged, evaluated against rubric dimensions (clarity, Guidewire specificity, communication, problem solving), and aggregated into a readiness score.
- Feedback: Post-interview report details strengths, growth areas, and recommended topics; exportable as PDF and stored for mentors.
- Data: Sessions, messages, and feedback stored with RLS; transcripts accessible to mentors/admins for follow-up.

### 3. Readiness Analytics
- Learner Dashboard: Surface upcoming/overdue quizzes, latest scores, interview readiness trend, and suggested next steps.
- Admin Dashboard: Display cohort-level KPIs—quiz participation, pass rate, interview readiness distribution, high-risk learners.
- Alerts: Optional reminder service integrates with existing learner reminder settings to nudge missing assessments.

### 4. Quality & Compliance
- All new routes/components lint clean, TypeScript strict compliant, and include loading/error states.
- Accessibility audit for quiz/interview flows (keyboard navigation, aria labels, contrast).
- Unit tests for critical logic (scoring, data mappers, prompt builders) and integration smoke tests for server actions.

## Backlog Breakdown
1. **Database & RLS**
   - Migrations for quiz/interview tables, enums, indices.
   - Helper SQL functions (e.g., compute readiness index) and policies for learners/admins.
2. **Quiz Authoring & Import**
   - Server actions + admin UI for CRUD and bulk JSON uploads.
   - Validation via shared Zod schemas.
3. **Learner Quiz Experience**
   - Dashboard entry point, attempt UI, results screen, storage of attempts.
4. **Interview Simulator**
   - Prompt templates, LLM routing, streaming handler, feedback summarizer.
   - UI for live interview and post-report.
5. **Analytics Integration**
   - Extend analytics module/views, add dashboard cards, optional reminders.
6. **QA & Documentation**
   - Tests, telemetry hooks, docs update (`SPRINT_2_RUNBOOK.md`, onboarding instructions).

## Sequencing & Milestones
1. **Day 1-2:** Finalize schema + migrations → run locally, update Supabase.
2. **Day 2-3:** Quiz authoring tooling + admin UI → seed placeholder quizzes.
3. **Day 3-4:** Learner quiz flow end-to-end (UI, server actions, scoring).
4. **Day 4-5:** Interview simulator backend (prompt, evaluation, storage) + UI shell.
5. **Day 5-6:** Analytics/dashboard integration, reminder hooks.
6. **Day 6:** QA, accessibility, documentation, handoff for stakeholder review.

## Dependencies / Questions
- Confirm initial quiz pool per product and passing thresholds.
- Define interview rubric weights and report format expectations.
- Decide whether reminder nudges should be automatic (cron) or manual triggers.
- Clarify PDF export styling requirements.

## Deliverables Checklist
- [ ] SQL migrations applied locally and in Supabase
- [ ] Shared Zod schemas for assessments
- [ ] Admin screens for quizzes/interview templates
- [ ] Learner quiz attempt flow & results page
- [ ] Interview simulator flow & post-report
- [ ] Analytics cards + readiness KPIs
- [ ] Tests & telemetry
- [ ] Documentation update + changelog entry

