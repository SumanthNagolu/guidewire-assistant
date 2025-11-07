/**
 * Bulk Content Upload Script
 * 
 * Uploads all content files from the `data/` directory to Supabase Storage
 * 
 * Usage:
 *   npx tsx scripts/upload-content.ts
 * 
 * Structure Expected:
 *   data/
 *     CC/
 *       cc-01-001/
 *         slides.pdf
 *         demo.mp4
 *         assignment.pdf
 *       cc-01-002/
 *         ...
 *     PC/
 *       pc-01-001/
 *         ...
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UploadStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

const stats: UploadStats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Upload a single file to Supabase Storage
 */
async function uploadFile(localPath: string, storagePath: string): Promise<boolean> {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const fileSizeKB = (fileBuffer.length / 1024).toFixed(2);

    console.log(`   📤 Uploading ${storagePath} (${fileSizeKB} KB)...`);

    const { data, error } = await supabase.storage
      .from('guidewire-assistant-training-content')
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(localPath),
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`   ✅ Uploaded: ${data.path}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 Starting bulk content upload...\n');

  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data directory not found: ${dataDir}`);
    console.error('   Please ensure your content is in the "data/" folder.');
    process.exit(1);
  }

  // Get all files
  const allFiles = getAllFiles(dataDir);
  stats.total = allFiles.length;

  console.log(`📂 Found ${stats.total} files to upload\n`);

  // Upload each file
  for (const localPath of allFiles) {
    // Convert local path to storage path
    // Example: data/CC/cc-01-001/slides.pdf -> CC/cc-01-001/slides.pdf
    const relativePath = path.relative(dataDir, localPath);
    const storagePath = relativePath.replace(/\\/g, '/'); // Normalize path separators

    // Skip hidden files and metadata
    if (storagePath.startsWith('.') || storagePath.includes('/.')) {
      console.log(`   ⏭️  Skipping hidden file: ${storagePath}`);
      stats.skipped++;
      continue;
    }

    console.log(`\n📁 Processing: ${storagePath}`);

    const success = await uploadFile(localPath, storagePath);
    if (success) {
      stats.success++;
    } else {
      stats.failed++;
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary:');
  console.log('='.repeat(60));
  console.log(`   Total Files:    ${stats.total}`);
  console.log(`   ✅ Successful:  ${stats.success}`);
  console.log(`   ❌ Failed:      ${stats.failed}`);
  console.log(`   ⏭️  Skipped:     ${stats.skipped}`);
  console.log('='.repeat(60));

  if (stats.failed > 0) {
    console.log('\n⚠️  Some files failed to upload. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All files uploaded successfully!');
    console.log('   You can now update your topics to reference these files.\n');
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

