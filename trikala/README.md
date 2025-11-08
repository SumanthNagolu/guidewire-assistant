# Trikala Project - Directory Structure

> *"Trikala" (त्रिकाल) means "three times" - past, present, future. A timeless approach to building software with AI-powered wisdom.*

---

## Quick Navigation

**Start Here:**
- `00-SADHGURU-GATEKEEPER.md` - Read this first (rulebook)
- `01-TATVA-VALUES.md` - Philosophical foundation
- `02-ROLE-TATVA-MAP.md` - Complete role mapping
- `PROJECT-HISTORY.md` - Everything we've done

**For Development:**
- `/personas/` - All AI persona definitions
- `/workflows/` - SDLC process workflows
- `/artifacts/` - All project deliverables

---

## Directory Structure

```
/trikala/
├── 00-SADHGURU-GATEKEEPER.md          # Core rulebook (read first!)
├── 01-TATVA-VALUES.md                  # Philosophical foundation
├── 02-ROLE-TATVA-MAP.md                # Complete role-tatva mapping
├── PROJECT-HISTORY.md                  # Living project chronicle
├── README.md                           # This file
│
├── .metadata/                          # Verification tracking
│   ├── metadata-template.json         # JSON schema
│   ├── README.md                      # Metadata system guide
│   └── *.meta.json                    # Metadata for each file
│
├── /personas/                          # AI Persona Definitions
│   ├── /00-philosophical/             # Governance personas
│   │   └── sadhguru-gatekeeper.md     # The Gatekeeper
│   │
│   ├── /01-strategic/                 # Executive personas
│   │   ├── ceo-sumanth.md            # CEO (will move from existing)
│   │   ├── cpo-lakshmi-krishna.md    # Chief Product Officer
│   │   └── cto-krishna-yama.md       # Chief Technology Officer
│   │
│   ├── /02-discovery/                 # Discovery phase
│   │   ├── vision-extractor-saraswati.md
│   │   └── product-owner-krishna.md
│   │
│   ├── /03-planning/                  # Planning phase
│   │   ├── business-analyst-maya.md
│   │   ├── program-manager-ganesha.md
│   │   └── scrum-master-sukhkarta.md
│   │
│   ├── /04-design/                    # Design phase
│   │   ├── enterprise-architect-arjun.md
│   │   ├── solution-architect-brahma-arjun.md
│   │   ├── uiux-designer-chitrakar.md
│   │   └── database-architect-dharani.md
│   │
│   ├── /05-development/               # Development phase
│   │   ├── lead-developer-shiva.md
│   │   ├── frontend-dev-hanuman.md
│   │   ├── backend-dev-hanuman.md
│   │   └── database-dev-vishnu.md
│   │
│   └── /06-testing/                   # Testing & operations
│       ├── qa-lead-vishnu-guru.md
│       ├── test-engineer-rakshak.md
│       ├── security-engineer-yama.md
│       ├── devops-engineer-vishnu-ganesha.md
│       ├── release-manager-moksha-data.md
│       ├── support-engineer-seva-karta.md
│       └── sre-sthira-rakshak.md
│
├── /artifacts/                         # All Project Outputs
│   ├── /vision/                       # Vision documents
│   │   ├── vision-v1.md
│   │   ├── stakeholder-analysis.md
│   │   └── success-criteria.md
│   │
│   ├── /requirements/                 # Requirements docs
│   │   ├── prd/                       # Product requirements
│   │   ├── brd/                       # Business requirements
│   │   ├── frs/                       # Functional requirements
│   │   └── user-stories/              # User stories
│   │
│   ├── /architecture/                 # Architecture docs
│   │   ├── hld/                       # High-level design
│   │   ├── lld/                       # Low-level design
│   │   ├── drd/                       # Database design
│   │   └── api-specs/                 # API specifications
│   │
│   ├── /code/                         # Code artifacts
│   │   ├── prototypes/
│   │   └── poc/
│   │
│   └── /tests/                        # Test artifacts
│       ├── test-plans/
│       ├── test-cases/
│       └── test-reports/
│
├── /workflows/                         # SDLC Process Workflows
│   ├── 01-discovery-workflow.md
│   ├── 02-requirements-workflow.md
│   ├── 03-design-workflow.md
│   ├── 04-development-workflow.md
│   ├── 05-testing-workflow.md
│   └── orchestration-rules.md
│
└── /existing-work/                     # Organized existing files
    ├── /frameworks/                   # AI board frameworks
    ├── /discovery/                    # Discovery artifacts
    ├── /reference/                    # Reference docs
    └── /archive/                      # Old files
```

---

## File Organization Philosophy

### Core Files (Root Level)
Files at root level are **foundation documents** that govern everything:
- Numbered files (00, 01, 02) are read in sequence
- Start with rulebook, then philosophy, then structure
- PROJECT-HISTORY.md chronicles every change

### Personas Directory
- Organized by **SDLC phase** for easy navigation
- Each persona file is self-contained
- Includes tatva essence, responsibilities, protocols
- One persona = one file

### Artifacts Directory
- Organized by **artifact type**
- Stores all project deliverables
- Versioned within directories
- Referenced by personas in their work

### Workflows Directory
- Process definitions
- Orchestration rules
- Persona handoff protocols
- Phase transition checklists

### Existing Work Directory
- Temporary home for files from main project
- Will be reviewed and moved one at a time
- Organized by category during migration

---

## Metadata System

Every significant file has a corresponding `.meta.json` file in `.metadata/` directory:
- Tracks verification status
- Records quality metrics
- Maps dependencies
- Logs change history
- See `.metadata/README.md` for details

---

## Navigation by Role

### If you're the CEO (Sumanth):
1. Read `00-SADHGURU-GATEKEEPER.md`
2. Review `PROJECT-HISTORY.md` for latest
3. Check `/personas/01-strategic/ceo-sumanth.md`
4. Review `/artifacts/vision/` for current vision

### If you're developing a feature:
1. Check `/workflows/` for process
2. Identify required personas
3. Follow persona protocols
4. Create artifacts in `/artifacts/`
5. Update PROJECT-HISTORY.md

### If you're reviewing work:
1. Check `.metadata/` for verification status
2. Review artifacts in `/artifacts/`
3. Consult Sadhguru Gatekeeper rules
4. Provide feedback per persona protocol

---

## Naming Conventions

### Files
- Foundation: `00-NAME.md` (numbered, uppercase)
- Personas: `role-name-tatva.md` (kebab-case)
- Artifacts: `document-type-v1.md` (versioned)
- Workflows: `01-phase-workflow.md` (numbered)

### Directories
- Lowercase with hyphens: `/my-directory/`
- Numbered by phase: `/01-strategic/`
- Descriptive names: `/requirements/`

---

## Key Principles

1. **One File at a Time**: Never bulk create/modify
2. **Metadata Always**: Every file has .meta.json
3. **History Always**: Every change logged in PROJECT-HISTORY.md
4. **Gatekeeper Review**: All significant changes approved
5. **Tatva Alignment**: Every file has tatva ownership
6. **User Awareness**: Sumanth knows everything happening

---

## Current Status

**Phase:** Foundation Setup  
**Files Created:** 8  
**Personas Defined:** 24 (mapped)  
**Personas Implemented:** 0 (to be created)  
**Next:** Create priority personas

---

## Getting Started

### For New Team Members
1. Read foundation docs (00, 01, 02)
2. Read PROJECT-HISTORY.md
3. Identify your persona
4. Read your persona file
5. Follow workflow for your phase

### For AI Assistants
1. Load Sadhguru Gatekeeper rules
2. Load appropriate persona
3. Check metadata for dependencies
4. Follow persona interaction protocol
5. Update metadata and history

---

## Contact

**Project Owner:** Sumanth (CEO)  
**Gatekeeper:** Sadhguru Persona  
**Created:** 2025-11-08  
**Status:** Active Foundation

---

**Last Updated:** 2025-11-08  
**Version:** 1.0

