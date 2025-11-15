#!/usr/bin/env node

/**
 * ============================================================================
 * SAFE CODE CLEANUP - Comment Out console.logs, Remove TODOs
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            SAFE CODE CLEANUP - FIX BROKEN FILES            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Files with TS errors to fix
const filesToFix = [
  'lib/ai/productivity/summary-service.ts',
  'lib/email/service.ts',
  'lib/monitoring/performance.ts',
  'lib/workflows/engine.ts',
  'modules/auth/actions.ts',
  'modules/crm/job-handler.ts',
  'lib/ai/unified-service.ts',
];

let fixed = 0;

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${file} (doesn't exist)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalLength = content.length;
    
    // Fix broken console.log remnants - remove orphaned closing parens and strings
    // This happens when cleanup removes "console.log(" but leaves the closing part
    content = content.replace(/^\s*\);?\s*$/gm, '');
    content = content.replace(/^\s*['"]\);?\s*$/gm, '');
    content = content.replace(/^\s*\+\s*['"'][^'"]*['"]\);?\s*$/gm, '');
    
    // Remove lines that are just string concatenation fragments  
    content = content.replace(/^\s*\+\s*['"]/gm, '');
    
    // Clean up multiple blank lines (3+ blank lines to 2)
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
      fixed++;
    } else {
      console.log(`   No changes needed for ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n✅ Fixed ${fixed} file(s)\n`);

// Check TypeScript again
console.log('🔍 Checking TypeScript after fixes...\n');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ No TypeScript errors!\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            ✅ ALL ERRORS FIXED! ✅                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
} catch (error) {
  const output = error.stdout?.toString() || error.stderr?.toString() || '';
  const lines = output.split('\n').filter(line => line.trim());
  const errorCount = lines.filter(line => line.includes('error TS')).length;
  
  if (errorCount > 0) {
    console.log(`⚠️  Still ${errorCount} TypeScript errors remaining\n`);
    console.log('First 10 errors:');
    lines.slice(0, 10).forEach(line => console.log(`  ${line}`));
    console.log('\n💡 These may need manual fixes\n');
  }
}

