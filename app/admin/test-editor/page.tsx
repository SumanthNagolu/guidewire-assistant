'use client';
import { useState } from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function TestEditorPage() {
  const [content, setContent] = useState(`# Welcome to the Rich Text Editor
This is a **markdown-powered** editor with _live preview_ capabilities.
## Features
- **Bold** and *italic* text
- Headings (H1, H2, H3)
- [Links](https://example.com)
- \`Inline code\`
- Lists:
  - Bullet points
  - Nested items
  1. Numbered lists
  2. Also supported
### Code Blocks
\`\`\`javascript
function greet(name) {
  }
\`\`\`
> Blockquotes are also supported for highlighting important information.
### Image Support
You can insert images via URL or upload them directly!
`);
  const handleSave = () => {
    alert('Content saved! Check console for output.');
  };
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rich Text Editor Test</h1>
        <p className="text-gray-600 mt-2">Test the markdown editor with preview capabilities</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>
            Write in markdown on the left, see the preview on the right
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your content..."
            height="500px"
            onImageUpload={(url, alt) => {
              }}
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>
              Save Content
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Raw Markdown Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
