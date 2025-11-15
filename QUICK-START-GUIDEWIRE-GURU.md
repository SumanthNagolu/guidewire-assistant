# 🚀 QUICK START - THE GUIDEWIRE GURU

**Get up and running in 5 steps!**

---

## ⚡ PREREQUISITES

You need:
- OpenAI API Key (https://platform.openai.com/api-keys)
- Anthropic API Key (https://console.anthropic.com/)
- Your Guidewire knowledge base (PDFs, PPTs, DOCX, code files)

---

## 📝 STEP 1: INSTALL DEPENDENCIES

```bash
# Node dependencies
npm install

# Python dependencies
pip3 install python-pptx PyPDF2 python-docx
```

---

## 🔑 STEP 2: ADD API KEYS

Edit `.env.local`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🗄️ STEP 3: RUN DATABASE MIGRATION

**Option A: Supabase Dashboard**
1. Go to https://supabase.com/dashboard → SQL Editor
2. Copy/paste `supabase/migrations/20250110_guidewire_guru_schema.sql`
3. Click "Run"

**Option B: CLI**
```bash
supabase db push
```

---

## 📁 STEP 4: INGEST YOUR KNOWLEDGE BASE

```bash
# Organize your files first
mkdir -p ~/guidewire-knowledge/guidewire-docs
mkdir -p ~/guidewire-knowledge/resumes
mkdir -p ~/guidewire-knowledge/code-examples
mkdir -p ~/guidewire-knowledge/interview-questions

# Copy your files to these folders

# Run ingestion (takes 2-3 hours for 1000 files)
./scripts/ingest-all.sh ~/guidewire-knowledge
```

**Expected output:**
```
📊 Found 1500 files to process
✅ Uploaded 12,543 chunks
🎉 Knowledge base ready!
```

---

## 🎯 STEP 5: TEST IT!

```bash
# Start server
npm run dev

# Open browser
# http://localhost:3000

# Sign in as: sumanth@intimesolutions.com
# Click: Companions → The Guidewire Guru
# Try: "Explain how PCF configuration works in ClaimCenter"
```

---

## 🧪 QUICK TESTS

### Test 1: Q&A
**Mode:** Q&A Assistant  
**Prompt:** "Explain the ClaimCenter data model"

### Test 2: Resume
**Mode:** Resume Generation  
**Prompt:** "Write a resume for a 5-year ClaimCenter developer"

### Test 3: Debugging
**Mode:** Code Debugging  
**Prompt:** "Debug this: `var claim = null; claim.ClaimNumber`"

---

## 📊 VERIFY INGESTION

```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM knowledge_chunks;
-- Should return: thousands of rows

SELECT product, COUNT(*) 
FROM knowledge_chunks 
GROUP BY product;
-- Should show: ClaimCenter, PolicyCenter, etc.
```

---

## 🐛 TROUBLESHOOTING

| Issue | Fix |
|-------|-----|
| "Module not found" | Run `npm install` |
| "Unauthorized" | Sign in as admin email |
| "No chunks found" | Run knowledge base ingestion |
| Ingestion slow | Normal for 1000+ files (2-3 hours) |

---

## 📚 FULL DOCUMENTATION

For detailed info, see:
- `GUIDEWIRE-GURU-SETUP.md` - Complete setup guide
- `GUIDEWIRE-GURU-IMPLEMENTATION-SUMMARY.md` - Technical details

---

## ✅ CHECKLIST

- [ ] Installed npm dependencies
- [ ] Installed Python packages
- [ ] Added API keys to `.env.local`
- [ ] Ran database migration
- [ ] Organized knowledge base files
- [ ] Ran ingestion script
- [ ] Started dev server
- [ ] Tested all 6 capabilities

---

**That's it! You're ready to use The Guidewire Guru! 🎉**

