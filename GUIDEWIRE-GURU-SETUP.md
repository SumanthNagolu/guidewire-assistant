# 🧙‍♂️ THE GUIDEWIRE GURU - SETUP GUIDE

Complete guide to setting up and using The Guidewire Guru AI companion.

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [File Organization](#file-organization)
4. [Knowledge Base Ingestion](#knowledge-base-ingestion)
5. [Testing](#testing)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 PREREQUISITES

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# OpenAI (for embeddings and GPT-4o)
OPENAI_API_KEY=sk-...

# Anthropic (for Claude 3.5 Sonnet refinement)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Required Python Packages

```bash
pip3 install python-pptx PyPDF2 python-docx
```

### Required Node Packages

```bash
npm install @anthropic-ai/sdk
```

---

## 🗄️ DATABASE SETUP

### Step 1: Run Migration

Run the SQL migration to create the knowledge base tables:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Navigate to SQL Editor
# 3. Copy contents of supabase/migrations/20250110_guidewire_guru_schema.sql
# 4. Execute

# Option 2: Via CLI (if you have Supabase CLI)
supabase db push
```

### Step 2: Verify Tables

Check that these tables were created:
- `knowledge_chunks`
- `companion_conversations`
- `companion_messages`

### Step 3: Test Vector Search

Run this in SQL Editor to confirm pgvector is working:

```sql
SELECT * FROM knowledge_chunks LIMIT 5;
SELECT match_knowledge_chunks(
  query_embedding := '[0.1, 0.2, ...]'::vector(1536),
  match_count := 5
);
```

---

## 📁 FILE ORGANIZATION

### Recommended Structure

Organize your knowledge base files in this structure:

```
/guidewire-knowledge/
├── guidewire-docs/
│   ├── ClaimCenter/
│   │   ├── CC-Architecture.pptx
│   │   ├── CC-Configuration-Guide.pdf
│   │   ├── CC-GOSU-Best-Practices.docx
│   │   └── ...
│   ├── PolicyCenter/
│   │   ├── PC-Data-Model.pdf
│   │   ├── PC-Integration-Patterns.pptx
│   │   └── ...
│   ├── BillingCenter/
│   │   └── ...
│   ├── ProducerEngage/
│   │   └── ...
│   ├── CustomerEngage/
│   │   └── ...
│   └── General/
│       ├── Guidewire-Certification-Study-Guide.pdf
│       └── ...
├── resumes/
│   ├── Senior-ClaimCenter-Developer.docx
│   ├── PolicyCenter-Architect.pdf
│   ├── Guidewire-BA-Resume.docx
│   └── ... (1000s of resumes)
├── code-examples/
│   ├── custom-pcf-examples/
│   ├── gosu-utilities/
│   ├── integration-code/
│   └── ...
├── interview-questions/
│   ├── ClaimCenter-Interview-Q&A.pdf
│   ├── PolicyCenter-Technical-Questions.docx
│   ├── Guidewire-Architect-Interview-Bank.pdf
│   └── ...
└── project-samples/
    ├── Student-Project-ClaimCenter.docx
    ├── Capstone-Project-PolicyCenter.pdf
    └── ...
```

### File Naming Conventions

**✅ GOOD:**
- `CC-01-Introduction-to-ClaimCenter.pptx`
- `PC-Data-Model-Deep-Dive.pdf`
- `Senior-ClaimCenter-Developer-5-Years.docx`
- `Interview-Questions-PolicyCenter-Advanced.pdf`

**❌ AVOID:**
- `untitled.pptx`
- `document (1).pdf`
- `New Microsoft Word Document.docx`

**Why?** The file name is used to extract topic metadata and improve search relevance.

### Supported File Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| PowerPoint | `.pptx` | Training slides, presentations |
| PDF | `.pdf` | Documentation, spec sheets |
| Word | `.docx` | Resumes, project docs |
| Text | `.txt`, `.md` | Notes, plain text docs |
| Code | `.java`, `.js`, `.py`, `.gosu` | Code examples |

---

## 🚀 KNOWLEDGE BASE INGESTION

### Option 1: One-Command Ingestion (Easiest)

```bash
# Make script executable
chmod +x scripts/ingest-all.sh

# Run complete ingestion
./scripts/ingest-all.sh /path/to/guidewire-knowledge
```

**What it does:**
1. Extracts text from all files (PDF, PPT, DOCX, etc.)
2. Chunks content into 1500-character segments
3. Generates embeddings using OpenAI
4. Uploads to Supabase

**Expected time:** ~2-3 hours for 1000 documents

### Option 2: Step-by-Step Ingestion

#### Step 1: Extract Content

```bash
python3 scripts/extract-content.py /path/to/guidewire-knowledge ./extracted-knowledge
```

**Output:** JSON files in `./extracted-knowledge/`

#### Step 2: Chunk & Embed

```bash
npx tsx scripts/chunk-and-embed.ts ./extracted-knowledge
```

**Output:** Chunks uploaded to Supabase `knowledge_chunks` table

### Monitoring Progress

Watch the console output:

```
🚀 GUIDEWIRE GURU - EMBEDDING PIPELINE
=====================================

📁 Source directory: ./extracted-knowledge
🔑 OpenAI API Key: sk-proj-AB...
🗄️  Supabase URL: https://xyz.supabase.co

📊 Found 1500 files to process

--- Batch 1/150 ---

📄 Processing: CC-01-Introduction.json
   Type: guidewire_doc | Product: ClaimCenter
   Created 8 chunks
   Generating embeddings...
   Uploading to database...
   ✅ Uploaded 8/8 chunks
```

### Verification

Check the ingestion results:

```sql
-- Total chunks
SELECT COUNT(*) FROM knowledge_chunks;

-- By source type
SELECT source_type, COUNT(*) 
FROM knowledge_chunks 
GROUP BY source_type;

-- By product
SELECT product, COUNT(*) 
FROM knowledge_chunks 
GROUP BY product;

-- Sample search
SELECT content, source_file, product
FROM knowledge_chunks
WHERE content ILIKE '%ClaimCenter%'
LIMIT 5;
```

---

## 🧪 TESTING

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Access The Guidewire Guru

1. Navigate to: `http://localhost:3000`
2. Sign in as admin (`sumanth@intimesolutions.com`)
3. Click **"Companions"** in the navbar
4. Select **"The Guidewire Guru"**

### Step 4: Test All Capabilities

#### 1️⃣ Resume Generation

**Mode:** Resume Generation  
**Test Prompt:**
```
Write a resume for a senior ClaimCenter developer with 7 years of experience.
Background: Started as a Java developer, moved to Guidewire 5 years ago.
Worked on 3 major implementations including ClaimCenter 10 upgrade.
Expert in PCFs, GOSU, and integrations.
```

**Expected:** Professional resume with real Guidewire terminology

---

#### 2️⃣ Project Documentation

**Mode:** Project Docs  
**Test Prompt:**
```
Create a student project document for a ClaimCenter FNOL customization.
The project should include custom PCFs, GOSU code for validation,
and integration with external mapping service.
```

**Expected:** Complete project doc with code snippets

---

#### 3️⃣ Q&A Assistant

**Mode:** Q&A Assistant  
**Test Prompt:**
```
Explain how PCF configuration works in ClaimCenter.
Include examples of common PCFs and when to use them.
```

**Expected:** Detailed technical explanation with examples

---

#### 4️⃣ Code Debugging

**Mode:** Code Debugging  
**Test Prompt:**
```
Debug this GOSU code:

var claim = ClaimFinder.findByClaimNumber(claimNumber)
var exposure = claim.Exposures.first()
exposure.ClaimAmount = newAmount

I'm getting a null pointer exception.
```

**Expected:** Root cause analysis + fix

---

#### 5️⃣ Interview Prep

**Mode:** Interview Prep  
**Test Prompt:**
```
Prepare me for a senior Guidewire architect interview.
Ask me 5 tough technical questions one by one.
```

**Expected:** Realistic interview questions with follow-ups

---

#### 6️⃣ Personal Assistant

**Mode:** Personal Assistant  
**Test Prompt:**
```
I need to prepare a proposal for a ClaimCenter implementation.
What should I include? Give me an outline.
```

**Expected:** Organized outline with practical advice

---

## 📖 USAGE

### Basic Workflow

1. **Select Mode:** Choose capability from sidebar
2. **Ask Question:** Type your query
3. **Review Answer:** Check response and sources
4. **Follow Up:** Continue conversation for refinement

### Tips for Best Results

#### ✅ DO:
- Be specific in your questions
- Provide context (years of experience, product, version)
- Ask follow-up questions for clarification
- Use the correct mode for your task

#### ❌ DON'T:
- Ask vague questions ("Tell me about Guidewire")
- Mix multiple topics in one question
- Expect code to run without review
- Share sensitive client information

### Conversation Management

- **New Conversation:** Click "+" button
- **Switch Conversations:** Click on history item
- **Delete Conversation:** Hover and click trash icon

---

## 🐛 TROUBLESHOOTING

### Issue: "Unauthorized" Error

**Cause:** Not logged in as admin  
**Fix:** Sign in as `sumanth@intimesolutions.com`

---

### Issue: "No knowledge chunks found"

**Cause:** Knowledge base not ingested  
**Fix:** Run `./scripts/ingest-all.sh`

---

### Issue: Embeddings taking too long

**Cause:** Rate limiting or large dataset  
**Fix:**
- Check OpenAI API rate limits
- Process in smaller batches
- Use `BATCH_SIZE=5` in `chunk-and-embed.ts`

---

### Issue: Poor answer quality

**Possible Causes:**
1. Not enough relevant documents in knowledge base
2. Question too vague
3. Wrong capability mode selected

**Fixes:**
1. Add more source documents
2. Rephrase question with more context
3. Switch to appropriate mode

---

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Cause:** Missing dependency  
**Fix:** 
```bash
npm install @anthropic-ai/sdk
```

---

## 💰 COST ESTIMATES

### One-Time Ingestion Costs

| Items | Cost |
|-------|------|
| 10,000 chunks × $0.00013/1K tokens | ~$1.30 |
| **TOTAL ONE-TIME** | **$1.30** |

### Monthly Usage Costs

Assuming 1000 queries/month:

| Service | Cost |
|---------|------|
| GPT-4o (1000 queries × $0.015) | $15.00 |
| Claude 3.5 Sonnet (1000 × $0.015) | $15.00 |
| Embeddings (negligible) | $0.10 |
| Supabase Storage (5GB) | $5.00 |
| **TOTAL MONTHLY** | **$35.10** |

---

## 🎯 NEXT STEPS

### Phase 1 ✅ (Current)
- [x] Basic chat interface
- [x] 6 capabilities
- [x] Knowledge base ingestion
- [x] Multi-model orchestration

### Phase 2 🚧 (Future)
- [ ] Voice-to-text input
- [ ] Real-time Zoom integration
- [ ] Fine-tuned model for Guidewire
- [ ] Advanced resume templates
- [ ] Interview recording & analysis

### Phase 3 💡 (Ideas)
- [ ] Multi-user access
- [ ] Team knowledge sharing
- [ ] Custom agent training
- [ ] API access for integrations

---

## 📞 SUPPORT

**Issues?** Check:
1. Environment variables are set
2. Database migration completed
3. Knowledge base ingested
4. Dependencies installed

**Still stuck?** Check console logs for detailed error messages.

---

## 🎉 YOU'RE READY!

The Guidewire Guru is now set up and ready to help you with:
- ✅ Resume writing
- ✅ Project documentation
- ✅ Technical Q&A
- ✅ Code debugging
- ✅ Interview preparation
- ✅ Personal assistance

**Start chatting:** `http://localhost:3000/companions/guidewire-guru`

---

**Built with ❤️ by InTime eSolutions**

