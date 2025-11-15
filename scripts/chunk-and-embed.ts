#!/usr/bin/env tsx
/**
 * GUIDEWIRE GURU - CHUNKING & EMBEDDING SCRIPT
 * ============================================
 * Processes extracted JSON files, chunks content, generates embeddings,
 * and uploads to Supabase knowledge_chunks table.
 *
 * Usage:
 *   npx tsx scripts/chunk-and-embed.ts <extracted_dir>
 *
 * Example:
 *   npx tsx scripts/chunk-and-embed.ts ./extracted-knowledge
 *
 * Requirements:
 *   - OPENAI_API_KEY in environment
 *   - NEXT_PUBLIC_SUPABASE_URL in environment
 *   - SUPABASE_SERVICE_ROLE_KEY in environment
 */

import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// ================================================================
// CONFIGURATION
// ================================================================

const CHUNK_SIZE = 1500; // Max characters per chunk
const CHUNK_OVERLAP = 200; // Overlap between chunks (for context)
const BATCH_SIZE = 10; // Process N files at a time
const RATE_LIMIT_DELAY = 100; // ms between API calls

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ================================================================
// TYPES
// ================================================================

interface ExtractedFile {
  file_name: string;
  file_path: string;
  source_type: string;
  product: string;
  difficulty?: string;
  content: string;
  word_count: number;
  extracted_at: string;
}

interface Chunk {
  content: string;
  source_file: string;
  source_type: string;
  product: string;
  difficulty?: string;
  topic?: string;
  chunk_index: number;
  total_chunks: number;
}

// ================================================================
// CHUNKING FUNCTIONS
// ================================================================

function chunkBySentences(text: string, maxSize: number, overlap: number): string[] {
  // Split by sentences (improved regex)
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let overlapText = '';

  for (const sentence of sentences) {
    const sentenceTrimmed = sentence.trim();
    
    if (!sentenceTrimmed) continue;

    // Check if adding this sentence would exceed max size
    if ((currentChunk + sentenceTrimmed).length > maxSize && currentChunk) {
      // Save current chunk
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      overlapText = words.slice(-Math.floor(overlap / 6)).join(' '); // ~6 chars per word
      currentChunk = overlapText + ' ' + sentenceTrimmed;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentenceTrimmed;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

function extractTopic(content: string, fileName: string): string {
  // Try to extract topic from first line or filename
  const firstLine = content.split('\n')[0].trim();
  
  // If first line looks like a heading (short, possibly has ===)
  if (firstLine.length < 100 && !firstLine.includes('.')) {
    return firstLine.replace(/^[=#\s]+/, '').trim();
  }
  
  // Fall back to filename
  return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}

function createChunks(extracted: ExtractedFile): Chunk[] {
  const { content, source_type, product, difficulty, file_name } = extracted;
  
  // Split content into chunks
  const textChunks = chunkBySentences(content, CHUNK_SIZE, CHUNK_OVERLAP);
  const topic = extractTopic(content, file_name);
  
  // Create chunk objects
  return textChunks.map((chunkText, index) => ({
    content: chunkText,
    source_file: file_name,
    source_type,
    product,
    difficulty: difficulty || undefined,
    topic,
    chunk_index: index,
    total_chunks: textChunks.length
  }));
}

// ================================================================
// EMBEDDING FUNCTIONS
// ================================================================

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1536 // Explicit dimension
    });
    
    return response.data[0].embedding;
  } catch (error: any) {
    console.error(`  ✗ Embedding error: ${error.message}`);
    throw error;
  }
}

async function generateEmbeddingsWithRetry(
  chunks: Chunk[],
  maxRetries = 3
): Promise<Array<{ chunk: Chunk; embedding: number[] }>> {
  const results: Array<{ chunk: Chunk; embedding: number[] }> = [];
  
  for (const chunk of chunks) {
    let retries = 0;
    let success = false;
    
    while (retries < maxRetries && !success) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        results.push({ chunk, embedding });
        success = true;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      } catch (error: any) {
        retries++;
        if (retries >= maxRetries) {
          console.error(`  ✗ Failed after ${maxRetries} retries: ${chunk.source_file} (chunk ${chunk.chunk_index})`);
          throw error;
        }
        console.log(`  ⚠️  Retry ${retries}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }
  
  return results;
}

// ================================================================
// DATABASE FUNCTIONS
// ================================================================

async function uploadChunksToSupabase(
  chunksWithEmbeddings: Array<{ chunk: Chunk; embedding: number[] }>
): Promise<number> {
  let successCount = 0;
  
  for (const { chunk, embedding } of chunksWithEmbeddings) {
    const { error } = await supabase.from('knowledge_chunks').insert({
      content: chunk.content,
      embedding: JSON.stringify(embedding),
      source_file: chunk.source_file,
      source_type: chunk.source_type,
      product: chunk.product,
      difficulty: chunk.difficulty,
      topic: chunk.topic,
      chunk_index: chunk.chunk_index,
      total_chunks: chunk.total_chunks
    });
    
    if (error) {
      console.error(`  ✗ Database error: ${error.message}`);
    } else {
      successCount++;
    }
  }
  
  return successCount;
}

// ================================================================
// MAIN PROCESSING
// ================================================================

async function processFile(filePath: string): Promise<number> {
  try {
    // Read extracted JSON
    const content = await fs.readFile(filePath, 'utf-8');
    const extracted: ExtractedFile = JSON.parse(content);
    
    console.log(`\n📄 Processing: ${extracted.file_name}`);
    console.log(`   Type: ${extracted.source_type} | Product: ${extracted.product}`);
    
    // Create chunks
    const chunks = createChunks(extracted);
    console.log(`   Created ${chunks.length} chunks`);
    
    // Generate embeddings
    console.log(`   Generating embeddings...`);
    const chunksWithEmbeddings = await generateEmbeddingsWithRetry(chunks);
    
    // Upload to Supabase
    console.log(`   Uploading to database...`);
    const uploaded = await uploadChunksToSupabase(chunksWithEmbeddings);
    
    console.log(`   ✅ Uploaded ${uploaded}/${chunks.length} chunks`);
    return uploaded;
    
  } catch (error: any) {
    console.error(`   ❌ Failed to process file: ${error.message}`);
    return 0;
  }
}

async function processDirectory(extractedDir: string) {
  console.log('\n🚀 GUIDEWIRE GURU - EMBEDDING PIPELINE');
  console.log('=====================================\n');
  
  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment');
    process.exit(1);
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Supabase credentials not found in environment');
    process.exit(1);
  }
  
  console.log(`📁 Source directory: ${extractedDir}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);
  console.log(`🗄️  Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
  
  // Get all JSON files
  const files = await fs.readdir(extractedDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.error('❌ No JSON files found in directory');
    process.exit(1);
  }
  
  console.log(`📊 Found ${jsonFiles.length} files to process\n`);
  
  // Process files in batches
  let totalChunks = 0;
  let totalFiles = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
    const batch = jsonFiles.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jsonFiles.length / BATCH_SIZE)} ---`);
    
    const results = await Promise.all(
      batch.map(file => processFile(path.join(extractedDir, file)))
    );
    
    totalChunks += results.reduce((sum, count) => sum + count, 0);
    totalFiles += results.filter(count => count > 0).length;
  }
  
  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 EMBEDDING COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Total files processed:  ${totalFiles}/${jsonFiles.length}`);
  console.log(`Total chunks created:   ${totalChunks}`);
  console.log(`Time taken:             ${duration}s`);
  console.log(`Average per file:       ${(parseFloat(duration) / jsonFiles.length).toFixed(2)}s`);
  console.log('='.repeat(60));
  console.log('\n✅ Knowledge base ready for The Guidewire Guru!\n');
}

// ================================================================
// ENTRY POINT
// ================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/chunk-and-embed.ts <extracted_dir>');
    console.error('Example: npx tsx scripts/chunk-and-embed.ts ./extracted-knowledge');
    process.exit(1);
  }
  
  const extractedDir = args[0];
  
  try {
    await fs.access(extractedDir);
  } catch {
    console.error(`❌ Error: Directory '${extractedDir}' does not exist`);
    process.exit(1);
  }
  
  await processDirectory(extractedDir);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

