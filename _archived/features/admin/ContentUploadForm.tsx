'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileText, Video, Presentation, CheckCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  code: string;
  name: string;
}

interface Topic {
  id: string;
  code: string;
  title: string;
  product_id: string;
}

interface Props {
  products: Product[];
  topics: Topic[];
}

type FileType = 'slides' | 'demo' | 'assignment';

interface UploadFile {
  file: File;
  type: FileType;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ContentUploadForm({ products, topics }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const filteredTopics = selectedProduct
    ? topics.filter((t) => t.product_id === selectedProduct)
    : topics;

  const selectedTopicData = topics.find((t) => t.id === selectedTopic);

  const handleFileAdd = (fileList: FileList | null, type: FileType) => {
    if (!fileList) return;

    const newFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      file,
      type,
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedProduct || !selectedTopic || files.length === 0) {
      toast.error('Please select product, topic, and add files');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const topic = topics.find((t) => t.id === selectedTopic);

    if (!product || !topic) {
      toast.error('Invalid product or topic selection');
      return;
    }

    setUploading(true);

    const supabase = createClient();

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const uploadFile = files[i];

        // Update status to uploading
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
          )
        );

        try {
          // Construct storage path: {PRODUCT_CODE}/{TOPIC_CODE}/{filename}
          const storagePath = `${product.code}/${topic.code}/${uploadFile.file.name}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('guidewire-assistant-training-content')
            .upload(storagePath, uploadFile.file, {
              upsert: true, // Overwrite if exists
              cacheControl: '3600',
            });

          if (uploadError) {
            throw uploadError;
          }

          // Simulate progress (Supabase doesn't provide real-time progress)
          for (let progress = 0; progress <= 100; progress += 20) {
            setFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, progress } : f))
            );
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Update database with content path
          const contentField = uploadFile.type === 'slides'
            ? 'slides'
            : uploadFile.type === 'demo'
            ? 'demos'
            : 'assignment';

          // Get current content
          const { data: currentTopic } = await supabase
            .from('topics')
            .select('content')
            .eq('id', topic.id)
            .single();

          const currentContent = (currentTopic?.content as any) || {};

          // Update content field
          let updatedContent;
          if (contentField === 'demos') {
            // Append to demos array
            const currentDemos = currentContent.demos || [];
            updatedContent = {
              ...currentContent,
              demos: [...currentDemos, uploadFile.file.name],
            };
          } else {
            // Single file fields
            updatedContent = {
              ...currentContent,
              [contentField]: uploadFile.file.name,
            };
          }

          // Update topic
          const { error: updateError } = await supabase
            .from('topics')
            .update({ content: updatedContent })
            .eq('id', topic.id);

          if (updateError) {
            throw updateError;
          }

          // Mark as success
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
            )
          );

          toast.success(`Uploaded: ${uploadFile.file.name}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Upload failed';

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: 'error' as const, error: message }
                : f
            )
          );

          toast.error(`Failed to upload ${uploadFile.file.name}: ${message}`);
        }
      }

      toast.success('Upload complete!');

      // Clear successful uploads
      setFiles((prev) => prev.filter((f) => f.status === 'error'));
    } catch (error) {
      toast.error('Upload process failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Content Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product & Topic Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              disabled={!selectedProduct}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {filteredTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.code} - {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedTopicData && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-900">Upload Destination:</p>
            <p className="text-gray-600 font-mono text-xs mt-1">
              {products.find((p) => p.id === selectedProduct)?.code}/{selectedTopicData.code}
              /[filename]
            </p>
          </div>
        )}

        {/* File Upload Sections */}
        <div className="space-y-4">
          {/* Slides */}
          <div>
            <Label htmlFor="slides" className="flex items-center gap-2 mb-2">
              <Presentation className="h-4 w-4 text-blue-600" />
              Slides (PPT/PPTX)
            </Label>
            <Input
              id="slides"
              type="file"
              accept=".ppt,.pptx"
              onChange={(e) => handleFileAdd(e.target.files, 'slides')}
              disabled={!selectedTopic || uploading}
            />
          </div>

          {/* Videos */}
          <div>
            <Label htmlFor="videos" className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-purple-600" />
              Demo Videos (MP4, MOV, etc.)
            </Label>
            <Input
              id="videos"
              type="file"
              accept=".mp4,.mov,.avi,.webm"
              multiple
              onChange={(e) => handleFileAdd(e.target.files, 'demo')}
              disabled={!selectedTopic || uploading}
            />
          </div>

          {/* Assignments */}
          <div>
            <Label htmlFor="assignment" className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              Assignment & Solution (PDF)
            </Label>
            <Input
              id="assignment"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileAdd(e.target.files, 'assignment')}
              disabled={!selectedTopic || uploading}
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Files to Upload ({files.length})</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3 bg-white"
                >
                  <div className="flex-shrink-0">
                    {uploadFile.type === 'slides' && (
                      <Presentation className="h-5 w-5 text-blue-600" />
                    )}
                    {uploadFile.type === 'demo' && (
                      <Video className="h-5 w-5 text-purple-600" />
                    )}
                    {uploadFile.type === 'assignment' && (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB • {uploadFile.type}
                    </p>

                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1 mt-2" />
                    )}

                    {uploadFile.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {uploadFile.status === 'pending' && !uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || !selectedTopic}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

