const fs = require('fs');

// Read the file
const filePath = 'app/api/productivity/capture/route.ts';
const content = fs.readFileSync(filePath, 'utf8');

// Find and fix the problematic line
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (i === 58) { // Line 59 (0-indexed)
    console.log('Line 59:', JSON.stringify(lines[i]));
    // Replace with a proper template literal
    lines[i] = '    const filename = `${user.id}/${Date.now()}.jpg`;';
  }
}

// Write the fixed content back
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed!');
