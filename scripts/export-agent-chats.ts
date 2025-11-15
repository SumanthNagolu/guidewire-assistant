#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(
  process.env.HOME!,
  'Library/Application Support/Cursor/User/globalStorage/state.vscdb'
);

const OUTPUT_DIR = path.join(__dirname, '../docs/cursor-agent-history');

interface BubbleData {
  bubbleId?: string;
  messages?: Array<{
    type?: string;
    text?: string;
    role?: string;
    content?: string;
    timestamp?: number;
  }>;
  [key: string]: any;
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
}

function extractChats() {
  console.log('Opening database:', DB_PATH);
  
  const db = new Database(DB_PATH, { readonly: true });
  
  // Get all bubble IDs
  const bubbles = db.prepare(
    "SELECT key, value FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'"
  ).all();
  
  console.log(`Found ${bubbles.length} agent conversations`);
  
  let exported = 0;
  const errors: string[] = [];
  
  for (const bubble of bubbles) {
    try {
      const data: BubbleData = JSON.parse(bubble.value as string);
      const bubbleId = bubble.key.split(':').slice(2).join(':') || data.bubbleId || 'unknown';
      
      // Try to extract meaningful content
      let markdown = `# Agent Conversation\n\n`;
      markdown += `**Bubble ID:** ${bubbleId}\n`;
      markdown += `**Key:** ${bubble.key}\n\n`;
      markdown += `---\n\n`;
      
      // Extract messages if they exist
      if (data.messages && Array.isArray(data.messages)) {
        for (const msg of data.messages) {
          const role = msg.role || msg.type || 'unknown';
          const content = msg.text || msg.content || '';
          const timestamp = msg.timestamp ? new Date(msg.timestamp).toISOString() : '';
          
          if (content) {
            markdown += `## ${role.toUpperCase()}${timestamp ? ` (${timestamp})` : ''}\n\n`;
            markdown += `${content}\n\n`;
            markdown += `---\n\n`;
          }
        }
      }
      
      // If no messages found, dump the raw data
      if (markdown.split('---').length <= 3) {
        markdown += `## Raw Data\n\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(data, null, 2);
        markdown += '\n```\n';
      }
      
      const filename = `${sanitizeFilename(bubbleId)}_${Date.now()}.md`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, markdown);
      exported++;
      
      if (exported % 100 === 0) {
        console.log(`Exported ${exported}/${bubbles.length}...`);
      }
    } catch (err) {
      errors.push(`Error processing ${bubble.key}: ${err}`);
    }
  }
  
  db.close();
  
  console.log(`\n✅ Exported ${exported} conversations to ${OUTPUT_DIR}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors occurred:`);
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
  }
  
  // Create index file
  const indexContent = `# Cursor Agent Chat History Export\n\n` +
    `**Exported:** ${new Date().toISOString()}\n` +
    `**Total Conversations:** ${exported}\n\n` +
    `All your agent conversations have been exported to individual markdown files in this directory.\n\n` +
    `## Notes\n\n` +
    `- Each file represents one agent conversation\n` +
    `- Files are named by their bubble ID\n` +
    `- This is a backup of your chat history from the old workspace\n`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), indexContent);
  console.log(`\n📝 Created index file: README.md`);
}

try {
  extractChats();
} catch (err) {
  console.error('Fatal error:', err);
  process.exit(1);
}


