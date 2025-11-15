#!/usr/bin/env node

/**
 * ============================================================================
 * FINAL CLEANUP & QUALITY ASSURANCE
 * ============================================================================
 * 
 * This script performs final cleanup for production readiness:
 * 1. Removes console.log statements from production code
 * 2. Removes TODO/FIXME/HACK comments
 * 3. Checks TypeScript type safety
 * 4. Generates final quality report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Track results
const results = {
  consoleLogs: { removed: 0, kept: 0, files: [] },
  todos: { removed: 0, kept: 0, files: [] },
  typeErrors: [],
  filesProcessed: 0
};

// Directories to process
const SRC_DIRS = [
  'app',
  'components',
  'lib',
  'modules',
  'hooks'
];

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'productivity-capture/node_modules',
  'desktop-agent/node_modules',
  'ai-screenshot-agent/node_modules'
];

// Files to keep console.logs (development/test files)
const KEEP_CONSOLE_PATTERNS = [
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /test\/.*\.ts$/,
  /scripts\/.*\.ts$/,
  /scripts\/.*\.js$/,
  /__tests__\//,
];

// Files to keep TODOs (documentation)
const KEEP_TODO_PATTERNS = [
  /\.md$/,
  /README/,
  /CHANGELOG/,
  /docs\//,
];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         FINAL CLEANUP & QUALITY ASSURANCE                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

/**
 * Check if file should be processed
 */
function shouldProcess(filePath) {
  // Check skip patterns
  for (const skipDir of SKIP_DIRS) {
    if (filePath.includes(skipDir)) return false;
  }
  return filePath.match(/\.(ts|tsx|js|jsx)$/);
}

/**
 * Remove console.log statements
 */
function removeConsoleLogs(content, filePath) {
  // Check if we should keep console.logs in this file
  const shouldKeep = KEEP_CONSOLE_PATTERNS.some(pattern => pattern.test(filePath));
  
  if (shouldKeep) {
    const matches = (content.match(/console\.(log|error|warn|info|debug)\(/g) || []).length;
    if (matches > 0) {
      results.consoleLogs.kept += matches;
    }
    return content;
  }
  
  const originalContent = content;
  
  // Remove console.log statements (handle multiline)
  content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\n?/g, '');
  content = content.replace(/console\.(log|error|warn|info|debug)\([^;]*\);?\n?/g, '');
  
  // Count removals
  const removed = (originalContent.match(/console\.(log|error|warn|info|debug)\(/g) || []).length -
                  (content.match(/console\.(log|error|warn|info|debug)\(/g) || []).length;
  
  if (removed > 0) {
    results.consoleLogs.removed += removed;
    results.consoleLogs.files.push(filePath);
  }
  
  return content;
}

/**
 * Remove TODO comments
 */
function removeTodos(content, filePath) {
  // Check if we should keep TODOs in this file
  const shouldKeep = KEEP_TODO_PATTERNS.some(pattern => pattern.test(filePath));
  
  if (shouldKeep) {
    const matches = (content.match(/\/\/\s*(TODO|FIXME|HACK):/g) || []).length;
    if (matches > 0) {
      results.todos.kept += matches;
    }
    return content;
  }
  
  const originalContent = content;
  
  // Remove TODO/FIXME/HACK comments
  content = content.replace(/\/\/\s*(TODO|FIXME|HACK):.*\n?/g, '');
  content = content.replace(/\/\*\s*(TODO|FIXME|HACK):.*?\*\/\n?/gs, '');
  
  // Count removals
  const removed = (originalContent.match(/\/\/\s*(TODO|FIXME|HACK):/g) || []).length -
                  (content.match(/\/\/\s*(TODO|FIXME|HACK):/g) || []).length;
  
  if (removed > 0) {
    results.todos.removed += removed;
    results.todos.files.push(filePath);
  }
  
  return content;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  if (!shouldProcess(filePath)) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply transformations
    content = removeConsoleLogs(content, filePath);
    content = removeTodos(content, filePath);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      results.filesProcessed++;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other ignored dirs
      if (!SKIP_DIRS.some(skip => fullPath.includes(skip))) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

/**
 * Check TypeScript errors
 */
function checkTypeScript() {
  console.log('🔍 Checking TypeScript type safety...\n');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ No TypeScript errors found!\n');
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const lines = output.split('\n').filter(line => line.trim());
    
    // Parse errors
    const errorCount = lines.filter(line => line.includes('error TS')).length;
    
    if (errorCount > 0) {
      console.log(`⚠️  Found ${errorCount} TypeScript errors\n`);
      results.typeErrors = lines.slice(0, 20); // First 20 errors
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   CLEANUP REPORT                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Console.log Statements:');
  console.log(`   ✅ Removed: ${results.consoleLogs.removed}`);
  console.log(`   ⚠️  Kept (test/dev files): ${results.consoleLogs.kept}`);
  if (results.consoleLogs.files.length > 0) {
    console.log(`   📁 Files cleaned: ${results.consoleLogs.files.length}`);
  }
  console.log('');
  
  console.log('📝 TODO Comments:');
  console.log(`   ✅ Removed: ${results.todos.removed}`);
  console.log(`   ⚠️  Kept (docs): ${results.todos.kept}`);
  if (results.todos.files.length > 0) {
    console.log(`   📁 Files cleaned: ${results.todos.files.length}`);
  }
  console.log('');
  
  console.log('📦 Files Processed:', results.filesProcessed);
  console.log('');
  
  console.log('🔍 TypeScript Check:');
  if (results.typeErrors.length === 0) {
    console.log('   ✅ No errors found');
  } else {
    console.log(`   ⚠️  ${results.typeErrors.length} errors found`);
    console.log('   📄 Run "npm run type-check" for details');
  }
  console.log('');
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      consoleLogs: {
        removed: results.consoleLogs.removed,
        kept: results.consoleLogs.kept
      },
      todos: {
        removed: results.todos.removed,
        kept: results.todos.kept
      },
      filesProcessed: results.filesProcessed,
      typeErrors: results.typeErrors.length
    },
    details: {
      consoleLogsFiles: results.consoleLogs.files.slice(0, 50),
      todosFiles: results.todos.files.slice(0, 50),
      typeErrors: results.typeErrors
    }
  };
  
  fs.writeFileSync(
    'CLEANUP_REPORT.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Detailed report saved to: CLEANUP_REPORT.json\n');
  
  // Final status
  const allClean = results.consoleLogs.removed === 0 && 
                   results.todos.removed === 0 && 
                   results.typeErrors.length === 0;
  
  if (allClean && results.filesProcessed === 0) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ CODE IS ALREADY CLEAN! ✅                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } else if (results.typeErrors.length === 0) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ CLEANUP COMPLETE! ✅                            ║');
    console.log('║            Production Ready                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } else {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      ⚠️  CLEANUP COMPLETE WITH WARNINGS ⚠️                 ║');
    console.log('║      Fix TypeScript errors before deploying                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting cleanup process...\n');
  console.log('📂 Processing directories:', SRC_DIRS.join(', '));
  console.log('⏭️  Skipping:', SKIP_DIRS.slice(0, 5).join(', '), '...\n');
  
  // Process each source directory
  for (const dir of SRC_DIRS) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Processing ${dir}/...`);
      processDirectory(fullPath);
    }
  }
  
  console.log('');
  
  // Check TypeScript
  checkTypeScript();
  
  // Generate report
  generateReport();
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

