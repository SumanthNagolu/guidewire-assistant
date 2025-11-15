'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Quote, Heading1, Heading2, Heading3, Eye, Edit, Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  onImageUpload?: (url: string, alt: string) => void;
}

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...', 
  height = '400px',
  onImageUpload 
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Convert markdown to HTML for preview
  const markdownToHtml = useCallback((markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-6 list-disc">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 list-decimal">$1</li>');

    // Wrap lists
    html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>');
    html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-2">$&</ol>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 rounded p-4 my-2 overflow-x-auto"><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-3">');
    html = '<p class="mb-3">' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-3"><\/p>/g, '');

    return html;
  }, []);

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Wrap selected text
  const wrapSelection = useCallback((before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${before}${selectedText || 'text'}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    
    onChange(newValue);
    
    // Reset selection
    setTimeout(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + (selectedText.length || 4);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => wrapSelection('**') },
    { icon: Italic, label: 'Italic', action: () => wrapSelection('*') },
    { icon: Heading1, label: 'Heading 1', action: () => insertAtCursor('# ') },
    { icon: Heading2, label: 'Heading 2', action: () => insertAtCursor('## ') },
    { icon: Heading3, label: 'Heading 3', action: () => insertAtCursor('### ') },
    { icon: List, label: 'Bullet List', action: () => insertAtCursor('- ') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('1. ') },
    { icon: Quote, label: 'Quote', action: () => insertAtCursor('> ') },
    { icon: Code, label: 'Code', action: () => wrapSelection('`') },
    { icon: Link, label: 'Link', action: () => wrapSelection('[', '](url)') },
    { icon: Image, label: 'Image', action: () => setShowImageDialog(true) },
  ];

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `blog-images/${timestamp}.${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      // Save to media_assets table
      const { data: mediaAsset, error: dbError } = await supabase
        .from('media_assets')
        .insert({
          filename: data.path,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_url: publicUrl,
          folder_path: '/blog-images',
          alt_text: imageAlt || file.name
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to uploaded images
      setUploadedImages(prev => [...prev, {
        id: mediaAsset.id,
        url: publicUrl,
        filename: file.name,
        size: file.size
      }]);

      return publicUrl;
    } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image dialog submission
  const handleImageSubmit = async () => {
    if (!imageUrl && !fileInputRef.current?.files?.[0]) {
      toast.error('Please provide an image URL or upload a file');
      return;
    }

    let finalUrl = imageUrl;

    // If file is selected, upload it first
    if (fileInputRef.current?.files?.[0]) {
      const uploadedUrl = await handleImageUpload(fileInputRef.current.files[0]);
      if (!uploadedUrl) return;
      finalUrl = uploadedUrl;
    }

    // Insert image markdown
    const imageMarkdown = `![${imageAlt}](${finalUrl})`;
    insertAtCursor(imageMarkdown);

    // Notify parent component
    if (onImageUpload) {
      onImageUpload(finalUrl, imageAlt);
    }

    // Reset and close dialog
    setImageUrl('');
    setImageAlt('');
    setShowImageDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {toolbarActions.map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              onClick={action}
              className="h-8 w-8 p-0"
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'edit' | 'preview')}>
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Editor/Preview */}
      <div style={{ height }}>
        {mode === 'edit' ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full resize-none border-0 focus:ring-0 font-mono text-sm"
            style={{ minHeight: height }}
          />
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none overflow-y-auto h-full"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        )}
      </div>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add an image by URL or upload a file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={uploadingImage}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-file">Upload Image</Label>
              <Input
                ref={fileInputRef}
                id="image-file"
                type="file"
                accept="image/*"
                disabled={uploadingImage}
              />
              <p className="text-xs text-gray-500">
                Max size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text (Optional)</Label>
              <Input
                id="image-alt"
                placeholder="Describe the image..."
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                disabled={uploadingImage}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl('');
                setImageAlt('');
              }}
              disabled={uploadingImage}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImageSubmit}
              disabled={uploadingImage || (!imageUrl && !fileInputRef.current?.files?.[0])}
            >
              {uploadingImage ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Insert Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


