# Trikala Metadata System

## Purpose

This directory contains metadata files that track verification, ownership, dependencies, and quality for every file in the Trikala Project. This ensures complete traceability and accountability.

---

## Structure

For every project file, there is a corresponding metadata file:

```
/trikala/
├── 00-SADHGURU-GATEKEEPER.md
├── 01-TATVA-VALUES.md
└── .metadata/
    ├── metadata-template.json (schema)
    ├── 00-SADHGURU-GATEKEEPER.md.meta.json (metadata for gatekeeper)
    ├── 01-TATVA-VALUES.md.meta.json (metadata for tatva values)
    └── README.md (this file)
```

---

## Naming Convention

**Pattern:** `{original-filename}.meta.json`

**Examples:**
- `VISION.md` → `.metadata/VISION.md.meta.json`
- `persona-ceo-sumanth.md` → `.metadata/persona-ceo-sumanth.md.meta.json`
- `requirements.ts` → `.metadata/requirements.ts.meta.json`

---

## Required Fields

Every metadata file MUST include:
- `file`: Name of tracked file
- `created`: Creation date
- `phase`: SDLC phase
- `verified_by`: Array of AI model verifications
- `sadhguru_gate`: Gatekeeper approval status

---

## Verification Workflow

### Single Model Verification (Standard)

For most files:
1. Create file with primary AI model (e.g., Claude Sonnet 3.5)
2. Create metadata file
3. Mark as verified by that model
4. Get Sadhguru gate approval
5. Update PROJECT-HISTORY.md

### Multi-Model Verification (Critical Files)

For critical files (architecture, security, core business logic):
1. Create file with primary AI model
2. Submit to GPT-4/5 for review
3. Submit to Claude Opus 4 for review
4. Submit to Gemini 2.5 for review
5. Consolidate feedback
6. Update file based on all reviews
7. Update metadata with all verifications
8. Get Sadhguru gate approval
9. Get Sumanth's final approval
10. Update PROJECT-HISTORY.md

---

## Metadata Update Protocol

### When to Update Metadata

Update metadata file when:
- ✅ File is created (initial metadata)
- ✅ File content is modified
- ✅ New verification is performed
- ✅ Dependencies change
- ✅ Quality metrics change
- ✅ Phase transition occurs

### What to Update

On file modification:
```json
{
  "last_modified": "2025-11-08T14:30:00Z",
  "change_history": [
    {
      "date": "2025-11-08",
      "change_type": "updated",
      "description": "Added new tatva: Guru",
      "changed_by": "Sumanth + AI Assistant"
    }
  ]
}
```

On new verification:
```json
{
  "verified_by": [
    {
      "model": "claude-sonnet-3.5",
      "date": "2025-11-08",
      "status": "approved"
    },
    {
      "model": "gpt-5",
      "date": "2025-11-08",
      "status": "approved_with_notes",
      "notes": "Consider adding more examples"
    }
  ]
}
```

---

## Gatekeeper Approval Statuses

### approved
File meets all quality standards and aligns with principles.

### pending
File created but awaiting review.

### needs_revision
File has issues that must be addressed before approval.

### blocked
File violates core principles or standards. Cannot proceed.

---

## Tatva Assignment

Each file is owned by a primary tatva:

| Tatva | Typical File Types |
|-------|-------------------|
| Guru | Rulebooks, standards, reviews |
| Yukti | Architecture, strategy docs |
| Srishti | Design docs, UI specs |
| Jnana | Requirements, documentation |
| Sampada | Business cases, ROI analysis |
| Vighna-Nashana | Sprint plans, project docs |
| Samhara | Implementation code, refactors |
| Bhakti | Feature code, bug fixes |
| Sthiti | Tests, monitoring, operations |
| Dharma | Security, compliance, standards |

---

## Quality Metrics

### Completeness (0-100%)
- 0-25%: Skeleton/draft
- 26-50%: Basic structure
- 51-75%: Most content present
- 76-99%: Nearly complete
- 100%: Fully complete

### Clarity
- **excellent**: Clear, unambiguous, well-structured
- **good**: Generally clear with minor unclear points
- **needs_improvement**: Multiple unclear sections
- **unclear**: Requires major revision

### Technical Debt
- **none**: Clean, maintainable
- **low**: Minor improvements needed
- **medium**: Noticeable issues, needs refactoring
- **high**: Significant problems, major refactor needed

---

## Dependency Tracking

### Dependencies
Files this file requires to exist or function:

```json
{
  "dependencies": [
    "00-SADHGURU-GATEKEEPER.md",
    "01-TATVA-VALUES.md"
  ]
}
```

### Dependents
Files that depend on this file:

```json
{
  "dependents": [
    "persona-ceo-sumanth.md",
    "persona-architect-krishna.md"
  ]
}
```

---

## Example: Complete Metadata File

```json
{
  "file": "00-SADHGURU-GATEKEEPER.md",
  "created": "2025-11-08",
  "last_modified": "2025-11-08T10:00:00Z",
  "phase": "foundation",
  "tatva": "guru",
  "owner": "Sumanth (CEO)",
  "verified_by": [
    {
      "model": "claude-sonnet-3.5",
      "date": "2025-11-08",
      "status": "approved",
      "reviewer": "AI Assistant"
    }
  ],
  "sadhguru_gate": {
    "status": "approved",
    "principle_alignment": "all",
    "manual_review": true,
    "approval_date": "2025-11-08",
    "notes": "Foundation rulebook - approved by Sumanth"
  },
  "dependencies": [],
  "dependents": [
    "01-TATVA-VALUES.md",
    "02-ROLE-TATVA-MAP.md"
  ],
  "next_steps": [
    "Create persona files based on these rules",
    "Implement approval workflow"
  ],
  "quality_metrics": {
    "completeness": 100,
    "clarity": "excellent",
    "technical_debt": "none"
  },
  "version": "1.0",
  "change_history": [
    {
      "date": "2025-11-08",
      "change_type": "created",
      "description": "Initial creation of Sadhguru Gatekeeper rulebook",
      "changed_by": "Sumanth + AI Assistant"
    }
  ],
  "tags": ["foundation", "governance", "rules", "philosophical", "gatekeeper"]
}
```

---

## Automated vs Manual Updates

### Automated (AI can update)
- `last_modified` timestamp
- `verified_by` additions
- `change_history` entries
- Quality metric updates
- Tag additions

### Manual (Sumanth approval needed)
- `sadhguru_gate.status` changes to "approved"
- `phase` transitions
- Major dependency changes
- Owner reassignment

---

## Integration with PROJECT-HISTORY.md

Metadata and history serve different purposes:

**Metadata (.meta.json):**
- Machine-readable
- Structured data
- Verification tracking
- Quality metrics
- Dependencies

**History (PROJECT-HISTORY.md):**
- Human-readable
- Narrative format
- Context and reasoning
- Impact and results
- Lessons learned

**Both are required** - they complement each other.

---

## Maintenance

### Weekly Review
- Check all metadata files are present
- Verify no orphaned metadata
- Update quality metrics
- Review dependency accuracy

### Phase Transitions
- Update all file phases
- Verify all quality gates passed
- Update completion percentages
- Archive old phase metadata

---

## Tools (Future)

Planned automation tools:
- `check-metadata.ts`: Verify all files have metadata
- `validate-metadata.ts`: Validate JSON against schema
- `generate-report.ts`: Create metadata summary
- `update-dependencies.ts`: Auto-detect dependencies

---

**Document Version:** 1.0  
**Created:** 2025-11-08  
**Owner:** Trikala Foundation Team  
**Status:** Active

