# 🧠 RAG Implementation: Train AI on Guidewire Content

This guide explains how to make the AI Mentor and Interview Simulator **Guidewire experts** by training them on your custom training content using RAG (Retrieval Augmented Generation).

---

## 🎯 Goal

Transform the AI from a general assistant into a **Guidewire training expert** that:
- Answers questions using YOUR training materials
- References specific lessons and slide numbers
- Provides consistent, curriculum-aligned guidance
- Gets smarter as you add more content

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONTENT INGESTION                                        │
│                                                              │
│  data/                                                       │
│  ├── CC/                                                     │
│  │   ├── CC-01-001.pptx  ──────┐                           │
│  │   ├── CC-01-001-demo.mp4    │                           │
│  │   └── CC-01-001-assignment.pdf                          │
│                                  │                           │
│                    Extract Text  ▼                           │
│                           ┌──────────────┐                   │
│                           │ Text Chunks  │                   │
│                           │  (Slides)    │                   │
│                           └──────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. VECTORIZATION                                             │
│                                                              │
│  OpenAI Embeddings API                                       │
│  (text-embedding-3-small)                                    │
│                                                              │
│  "Configure BillingCenter..."  ───►  [0.23, -0.45, 0.67...] │
│                                       (1536 dimensions)       │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. STORAGE (PostgreSQL + pgvector)                          │
│                                                              │
│  CREATE TABLE lesson_chunks (                                │
│    id UUID PRIMARY KEY,                                      │
│    topic_code TEXT,                                          │
│    slide_number INT,                                         │
│    content TEXT,                                             │
│    embedding VECTOR(1536),  ← pgvector extension            │
│    metadata JSONB                                            │
│  );                                                          │
│                                                              │
│  CREATE INDEX ON lesson_chunks                               │
│  USING ivfflat (embedding vector_cosine_ops);                │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. QUERY TIME (User asks question)                          │
│                                                              │
│  User: "How do I configure payment plans in BC?"            │
│         │                                                    │
│         ▼                                                    │
│  1. Convert to embedding                                     │
│  2. Search similar chunks (cosine similarity)                │
│  3. Retrieve top 3-5 relevant lessons                        │
│  4. Inject into AI prompt                                    │
│  5. AI answers with context                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

### 1. Enable pgvector in Supabase

Run in **Supabase SQL Editor**:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it's installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. Install Required Packages

```bash
npm install openai langchain @langchain/openai @pinecone-database/pinecone
npm install python-pptx PyPDF2  # For Python content extraction
```

---

## 🗄️ Database Schema

### Create Tables for Content Storage

```sql
-- Store lesson chunks with embeddings
CREATE TABLE lesson_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  topic_code TEXT NOT NULL,
  chunk_type TEXT CHECK (chunk_type IN ('slide', 'text', 'transcript')),
  chunk_number INT,  -- Slide number or page number
  title TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX lesson_chunks_embedding_idx 
ON lesson_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for filtering by topic
CREATE INDEX lesson_chunks_topic_idx ON lesson_chunks(topic_id);
CREATE INDEX lesson_chunks_code_idx ON lesson_chunks(topic_code);

-- Function to search similar content
CREATE OR REPLACE FUNCTION search_similar_lessons(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_topic_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  topic_code TEXT,
  chunk_number INT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.topic_code,
    lc.chunk_number,
    lc.title,
    lc.content,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM lesson_chunks lc
  WHERE 
    (filter_topic_code IS NULL OR lc.topic_code = filter_topic_code)
    AND 1 - (lc.embedding <=> query_embedding) > match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 🔧 Implementation: Content Extraction

### Step 1: Extract Text from PPTs

Create `scripts/extract-content.py`:

```python
"""
Extract text content from PPTs and PDFs in data/ folder
Save to JSON for ingestion into database
"""

import os
import json
from pathlib import Path
from pptx import Presentation
import PyPDF2

def extract_ppt_slides(ppt_path):
    """Extract text from each slide"""
    prs = Presentation(ppt_path)
    slides = []
    
    for idx, slide in enumerate(prs.slides, start=1):
        slide_text = []
        
        # Extract text from all shapes
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text = shape.text.strip()
                if text:
                    slide_text.append(text)
        
        if slide_text:
            slides.append({
                'number': idx,
                'content': '\n'.join(slide_text),
                'raw_text': ' '.join(slide_text)
            })
    
    return slides

def extract_pdf_pages(pdf_path):
    """Extract text from PDF pages"""
    pages = []
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        
        for idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text().strip()
            if text:
                pages.append({
                    'number': idx,
                    'content': text
                })
    
    return pages

def process_topic_folder(topic_path):
    """Process all files in a topic folder"""
    topic_code = topic_path.name
    content = {
        'topic_code': topic_code,
        'slides': [],
        'assignment_pages': [],
        'demo_urls': []
    }
    
    for file in topic_path.iterdir():
        if file.suffix == '.pptx':
            print(f"  Extracting {file.name}...")
            content['slides'] = extract_ppt_slides(file)
        
        elif file.suffix == '.pdf' and 'assignment' in file.name.lower():
            print(f"  Extracting {file.name}...")
            content['assignment_pages'] = extract_pdf_pages(file)
        
        elif file.suffix in ['.mp4', '.mov']:
            # Store demo file reference
            content['demo_urls'].append(str(file.relative_to(Path('data'))))
    
    return content

def main():
    data_dir = Path('data')
    output_dir = Path('content/extracted')
    output_dir.mkdir(exist_ok=True, parents=True)
    
    # Process each product folder
    for product_folder in data_dir.iterdir():
        if not product_folder.is_dir():
            continue
        
        print(f"\nProcessing {product_folder.name}...")
        
        for topic_folder in product_folder.iterdir():
            if not topic_folder.is_dir():
                continue
            
            print(f"  Topic: {topic_folder.name}")
            content = process_topic_folder(topic_folder)
            
            # Save to JSON
            output_file = output_dir / f"{topic_folder.name}.json"
            with open(output_file, 'w') as f:
                json.dump(content, f, indent=2)
            
            print(f"    Saved {len(content['slides'])} slides, "
                  f"{len(content['assignment_pages'])} assignment pages")
    
    print("\n✅ Content extraction complete!")
    print(f"📁 Output: {output_dir}")

if __name__ == '__main__':
    main()
```

Run it:
```bash
python scripts/extract-content.py
```

---

## 🔢 Implementation: Generate Embeddings

Create `scripts/generate-embeddings.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  return response.data[0].embedding;
}

async function processExtractedContent() {
  const extractedDir = path.join(process.cwd(), 'content/extracted');
  const files = await fs.readdir(extractedDir);
  
  let totalChunks = 0;
  let processedFiles = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const topicCode = file.replace('.json', '');
    console.log(`\nProcessing ${topicCode}...`);
    
    const content = JSON.parse(
      await fs.readFile(path.join(extractedDir, file), 'utf-8')
    );
    
    // Get topic_id from database
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('code', topicCode)
      .single();
    
    if (!topic) {
      console.warn(`  ⚠️  Topic ${topicCode} not found in database, skipping`);
      continue;
    }
    
    // Process each slide
    for (const slide of content.slides) {
      const embedding = await generateEmbedding(slide.content);
      
      const { error } = await supabase.from('lesson_chunks').insert({
        topic_id: topic.id,
        topic_code: topicCode,
        chunk_type: 'slide',
        chunk_number: slide.number,
        title: slide.content.split('\n')[0], // First line as title
        content: slide.content,
        embedding,
        metadata: {
          word_count: slide.content.split(/\s+/).length,
        },
      });
      
      if (error) {
        console.error(`  ❌ Error inserting slide ${slide.number}:`, error);
      } else {
        totalChunks++;
      }
    }
    
    // Process assignment pages
    for (const page of content.assignment_pages || []) {
      const embedding = await generateEmbedding(page.content);
      
      await supabase.from('lesson_chunks').insert({
        topic_id: topic.id,
        topic_code: topicCode,
        chunk_type: 'text',
        chunk_number: page.number,
        title: `Assignment - Page ${page.number}`,
        content: page.content,
        embedding,
      });
      
      totalChunks++;
    }
    
    processedFiles++;
    console.log(`  ✅ Processed ${content.slides.length} slides, ${content.assignment_pages?.length || 0} assignment pages`);
    
    // Rate limiting: OpenAI has ~3000 RPM limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Complete!`);
  console.log(`  📊 Processed ${processedFiles} topics`);
  console.log(`  📦 Generated ${totalChunks} embeddings`);
}

processExtractedContent().catch(console.error);
```

Run it:
```bash
npx tsx scripts/generate-embeddings.ts
```

---

## 🔍 Implementation: Search & Retrieve

Update `app/api/ai/mentor/route.ts` to use RAG:

```typescript
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchRelevantContent(
  question: string,
  topicId?: string
): Promise<string> {
  const supabase = await createClient();
  
  // 1. Generate embedding for the question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });
  const questionEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Search for similar content
  const { data: chunks } = await supabase.rpc('search_similar_lessons', {
    query_embedding: questionEmbedding,
    match_threshold: 0.7,
    match_count: 3,
    filter_topic_code: topicId ? undefined : null, // Filter by topic if provided
  });
  
  if (!chunks || chunks.length === 0) {
    return '';
  }
  
  // 3. Format context for the prompt
  return chunks
    .map((chunk: any, idx: number) => 
      `[Source ${idx + 1}: ${chunk.topic_code}, Slide ${chunk.chunk_number}]\n${chunk.content}`
    )
    .join('\n\n---\n\n');
}

export async function POST(req: Request) {
  // ... (existing auth and validation)
  
  const { message, topicId, conversationId } = parsed.data;
  
  // NEW: Search for relevant training content
  const trainingContext = await searchRelevantContent(message, topicId);
  
  // Build enhanced system prompt
  const systemPrompt = `You are an expert Guidewire trainer using the Socratic method.

${trainingContext ? `
RELEVANT TRAINING CONTENT:
${trainingContext}

Instructions:
- Use the training content above to inform your responses
- Reference specific lessons and slide numbers when applicable
- If the content directly answers the question, guide the student to discover it themselves
- If the content is incomplete, acknowledge it and guide based on general Guidewire knowledge
` : 'No specific training content found. Guide based on general Guidewire knowledge.'}

Socratic Method Rules:
1. Never give direct answers
2. Ask probing questions
3. Help students discover answers themselves
4. Provide hints and examples when needed
5. Encourage critical thinking

Current conversation context:
${conversationHistory}`;

  // Continue with existing streaming logic...
}
```

---

## 📊 Monitoring & Quality

### Track RAG Performance

```sql
-- Create table to track search quality
CREATE TABLE rag_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  question TEXT,
  chunks_found INT,
  avg_similarity FLOAT,
  chunks_used JSONB,
  user_feedback INT CHECK (user_feedback BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log each RAG query
INSERT INTO rag_metrics (user_id, question, chunks_found, avg_similarity, chunks_used)
VALUES (...);
```

### Quality Indicators

✅ **Good RAG Performance:**
- Similarity scores > 0.75
- 3-5 relevant chunks found
- Chunks from correct topic/lesson

⚠️ **Poor RAG Performance:**
- Similarity scores < 0.60
- No chunks found
- Chunks from unrelated topics

**Fix:** Add more training content, improve chunking strategy

---

## 🎯 Cost Estimation

### OpenAI Embeddings Cost

**Model:** `text-embedding-3-small`  
**Price:** $0.020 per 1M tokens

**Your content:**
- ~250 lessons × 30 slides/lesson = ~7,500 slides
- Average slide: ~150 words = ~200 tokens
- Total: 7,500 × 200 = **1.5M tokens**

**One-time embedding cost:** $0.03 ✅ (very cheap!)

**Query cost:** Each user question ~20 tokens × $0.020/1M = **negligible**

---

## 🚀 Deployment Checklist

- [ ] Enable pgvector in Supabase
- [ ] Run schema SQL (lesson_chunks table)
- [ ] Extract content from PPTs/PDFs
- [ ] Generate embeddings (run `generate-embeddings.ts`)
- [ ] Update AI Mentor API to use RAG
- [ ] Update Interview Simulator to use RAG
- [ ] Test with sample questions
- [ ] Monitor similarity scores
- [ ] Iterate and improve

---

## 🎓 Next: Advanced RAG Features

Once basic RAG works, add:

1. **Hybrid Search:** Combine vector search + keyword search
2. **Re-ranking:** Use a second model to re-rank results
3. **Chunking Strategies:** Experiment with chunk sizes
4. **Metadata Filtering:** Filter by product, experience level
5. **Feedback Loop:** Let users rate answer quality
6. **Caching:** Cache embeddings for common questions

---

## 📚 Resources

- [Supabase Vector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [LangChain RAG](https://js.langchain.com/docs/use_cases/question_answering/)

---

**Questions?** Check the troubleshooting section or ask in the AI Mentor! 🤖

