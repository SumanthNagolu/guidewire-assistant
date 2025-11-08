# Sadhguru Rules - Routing & Quality Gates

> *Simplified from "Gatekeeper" to "Routing Engine" - Like Apache Camel for AI Agents*

---

## Purpose

This is NOT an approval blocker. This is a **routing rulebook** that AI agents follow automatically, like Apache Camel routes messages. No manual approvals, just smart routing and quality checks.

---

## Core Rules (Non-Negotiable)

### 1. Good Karma Rule
**Before shipping to users:**
- ✅ Does it help students get jobs?
- ✅ Is it secure and safe?
- ✅ Is it fair and accessible?

**Auto-pass if:** All yes  
**Flag for review if:** Any no  
**Owner decides:** CEO reviews flagged items

---

### 2. Quality Gates (Automated)

**Code Quality:**
- ✅ TypeScript strict mode
- ✅ No linter errors
- ✅ Functions under 20 lines
- ✅ Tests passing
- ✅ No API keys in client code

**Auto-pass if:** All checks green  
**Block deploy if:** Any check fails  
**No human approval needed**

---

### 3. Sequential Learning Rule (SACRED)

**For training content only:**
- ✅ Prerequisites defined
- ✅ Prerequisite enforcement working
- ✅ Cannot skip topics

**Auto-pass if:** System enforces prerequisites  
**Flag if:** Bypass mechanisms exist  
**CEO decides:** Override cases

---

## Routing Rules (Like Apache Camel)

### Request Type Detection
```
IF request.type == "vision" 
   → ROUTE TO: CEO + Saraswati
   
IF request.type == "architecture"
   → ROUTE TO: Krishna (Architect)
   
IF request.type == "implement"
   → ROUTE TO: Shiva (Developer)
   
IF request.type == "test"
   → ROUTE TO: Vishnu (QA)
   
IF request.type == "ethical_concern"
   → FLAG FOR: CEO review
   
ELSE
   → ROUTE TO: Best matching persona
```

### Batch Operations (ALLOWED)
```
CREATE multiple files in batch
AUTO-GENERATE metadata from git
UPDATE history once per feature (not per file)
```

### No Manual Approvals For
- Documentation updates
- Bug fixes
- Test additions
- Refactoring (if tests pass)
- UI improvements

### Flag for CEO Review Only
- Architecture changes
- Security implementations
- Pricing changes
- Major feature additions
- Breaking changes

---

## Quality Checks (Automated)

### Pre-Commit Checks
```bash
✅ Linter passes
✅ Tests pass
✅ No console.errors
✅ No TODO comments in production code
✅ RLS policies exist for new tables
```

### Pre-Deploy Checks
```bash
✅ All features tested
✅ No broken links
✅ Performance benchmarks met
✅ Security scan passed
✅ Accessibility check passed
```

**Auto-deploy if:** All green  
**Block if:** Any red  
**No human approval needed**

---

## Discovery Phase (Simplified)

### OLD: 2000 questions (exhausting)
### NEW: Ask until clarity

**Process:**
1. Saraswati asks key questions
2. CEO answers
3. Continue until CEO says "I'm clear"
4. Target: 200-300 questions (not fixed)
5. Document insights
6. Move to implementation

**No fixed number, just clarity**

---

## Metadata (Simplified)

### OLD: Manual update for every file
### NEW: Auto-generated from git

**Process:**
```bash
git commit -m "feat: Add user authentication"
→ Auto-generates metadata
→ Updates PROJECT-HISTORY.md
→ No manual work needed
```

**Manual updates only for:**
- Major milestones
- Architecture decisions
- Strategic pivots

---

## Philosophy (Optional)

**Tatvas are mental models, not requirements:**
- Use when helpful for thinking
- Skip when they slow you down
- No need to document tatva alignment for every file

**Personas are prompts, not entities:**
- Load persona context when needed
- Don't expect persistent personality
- Focus on task, not character

---

## Success Metrics

**Not this:**
- ❌ All metadata up to date
- ❌ All files approved
- ❌ 2000 questions asked

**This:**
- ✅ Features shipped per week
- ✅ Tests passing
- ✅ Students getting jobs
- ✅ Revenue growing
- ✅ System actually used (not abandoned)

---

## Emergency Override

**CEO can override ANY rule with:**
- Clear reasoning
- Documented in history
- Learning from outcome

**No philosophical debate required**

---

**Version:** 2.0 (Practical)  
**Updated:** 2025-11-08  
**Status:** Rulebook (not gatekeeper)

