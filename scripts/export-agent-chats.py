#!/usr/bin/env python3

import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime
import re

# Paths
HOME = os.path.expanduser("~")
DB_PATH = os.path.join(HOME, "Library/Application Support/Cursor/User/globalStorage/state.vscdb")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../docs/cursor-agent-history")

def sanitize_filename(text, max_length=50):
    """Create a safe filename from text"""
    text = re.sub(r'[^a-zA-Z0-9_-]', '_', text)
    return text[:max_length]

def extract_text_content(data, max_depth=3, current_depth=0):
    """Recursively extract text content from nested data structures"""
    texts = []
    
    if current_depth > max_depth:
        return texts
    
    if isinstance(data, dict):
        for key, value in data.items():
            if key in ['text', 'content', 'message', 'query', 'response']:
                if isinstance(value, str) and len(value) > 10:
                    texts.append((key, value))
            else:
                texts.extend(extract_text_content(value, max_depth, current_depth + 1))
    elif isinstance(data, list):
        for item in data:
            texts.extend(extract_text_content(item, max_depth, current_depth + 1))
    
    return texts

def export_chats():
    print(f"Opening database: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all bubble IDs
    cursor.execute("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'bubbleId:%'")
    bubbles = cursor.fetchall()
    
    print(f"Found {len(bubbles)} agent conversations")
    
    exported = 0
    errors = []
    
    for key, value_blob in bubbles:
        try:
            # Parse JSON data
            data = json.loads(value_blob)
            
            # Extract bubble ID from key
            parts = key.split(':')
            bubble_id = parts[-1] if len(parts) > 2 else 'unknown'
            
            # Start markdown content
            markdown = f"# Agent Conversation\n\n"
            markdown += f"**Bubble ID:** {bubble_id}\n"
            markdown += f"**Full Key:** {key}\n"
            markdown += f"**Exported:** {datetime.now().isoformat()}\n\n"
            markdown += "---\n\n"
            
            # Extract any text content
            text_contents = extract_text_content(data)
            
            if text_contents:
                markdown += "## Conversation Content\n\n"
                for label, content in text_contents:
                    markdown += f"### {label.title()}\n\n"
                    markdown += f"{content}\n\n"
                    markdown += "---\n\n"
            
            # Add raw data section
            markdown += "## Raw Data Structure\n\n"
            markdown += "```json\n"
            markdown += json.dumps(data, indent=2, ensure_ascii=False)
            markdown += "\n```\n"
            
            # Save file
            filename = f"{sanitize_filename(bubble_id)}_{exported:04d}.md"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(markdown)
            
            exported += 1
            
            if exported % 100 == 0:
                print(f"Exported {exported}/{len(bubbles)}...")
        
        except Exception as err:
            errors.append(f"Error processing {key}: {str(err)}")
    
    conn.close()
    
    print(f"\n✅ Exported {exported} conversations to {OUTPUT_DIR}")
    
    if errors:
        print(f"\n⚠️  {len(errors)} errors occurred:")
        for error in errors[:10]:
            print(f"  - {error}")
    
    # Create index file
    index_content = f"""# Cursor Agent Chat History Export

**Exported:** {datetime.now().isoformat()}
**Total Conversations:** {exported}
**Database:** {DB_PATH}

All your agent conversations have been exported to individual markdown files in this directory.

## Files

Each file is named with the format: `<bubble_id>_<number>.md`

## Notes

- Each file represents one agent conversation (bubble)
- Files contain both extracted content and raw JSON data
- This is a complete backup of your chat history from Cursor's global storage
- You can search these files with any text editor or grep

## How to Use

1. Use your IDE's search feature to find specific conversations
2. Each file has a unique bubble ID for reference
3. The raw JSON data is included for complete context
"""
    
    readme_path = os.path.join(OUTPUT_DIR, "README.md")
    with open(readme_path, 'w') as f:
        f.write(index_content)
    
    print(f"\n📝 Created index file: {readme_path}")
    print(f"\n🎉 All done! Check {OUTPUT_DIR}")

if __name__ == "__main__":
    try:
        export_chats()
    except Exception as err:
        print(f"❌ Fatal error: {err}")
        import traceback
        traceback.print_exc()
        exit(1)


