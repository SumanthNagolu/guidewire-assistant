#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('app/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**']
});

let totalRemoved = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Remove console.log, console.error, console.warn, console.debug statements
    // This regex handles multi-line console statements
    content = content.replace(/console\.(log|error|warn|debug)\s*\([^)]*\)[,;]?\s*/g, '');
    
    // Also remove console statements that span multiple lines
    content = content.replace(/console\.(log|error|warn|debug)\s*\(\s*[\s\S]*?\)[,;]?\s*/g, (match) => {
      // Only remove if parentheses are balanced
      let openCount = 0;
      for (let i = 0; i < match.length; i++) {
        if (match[i] === '(') openCount++;
        if (match[i] === ')') openCount--;
        if (openCount === 0 && match[i] === ')') {
          totalRemoved++;
          return '';
        }
      }
      return match; // Don't remove if parentheses aren't balanced
    });
    
    // Remove empty lines left by console removal
    content = content.replace(/^\s*[\r\n]/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`✓ Cleaned ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

console.log(`\n✅ Removed ${totalRemoved} console statements`);
