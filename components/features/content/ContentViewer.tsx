'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFViewer from './PDFViewer';
import VideoPlayer from './VideoPlayer';
import PPTXViewer from './PPTXViewer';
import { FileText, Video, Presentation } from 'lucide-react';

interface ContentFile {
  type: 'slides' | 'assignment' | 'demo';
  filename: string;
  title: string;
}

interface ContentViewerProps {
  productCode: string;
  topicCode: string;
  content: {
    slides?: string | null; // Path to PPTX file
    demos?: string[] | null; // Array of video filenames
    assignment?: string | null; // Path to PDF assignment+solution
  };
}

/**
 * Smart content viewer that displays slides, demos, and assignments
 * Automatically detects file types and renders appropriate viewer
 */
export default function ContentViewer({ productCode, topicCode, content }: ContentViewerProps) {
  const files: ContentFile[] = [];

  // Process slides (PPTX)
  if (content.slides) {
    files.push({
      type: 'slides',
      filename: content.slides,
      title: 'Lesson Slides',
    });
  }

  // Process demos (videos)
  if (content.demos && content.demos.length > 0) {
    content.demos.forEach((demo, index) => {
      files.push({
        type: 'demo',
        filename: demo,
        title: content.demos!.length > 1 ? `Demo ${index + 1}` : 'Demo',
      });
    });
  }

  // Process assignment (PDF)
  if (content.assignment) {
    files.push({
      type: 'assignment',
      filename: content.assignment,
      title: 'Assignment & Solution',
    });
  }

  // If no content, show empty state
  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
        <p className="text-sm text-gray-600">
          Content for this topic is being prepared and will be available soon.
        </p>
      </div>
    );
  }

  // Single file - render directly without tabs
  if (files.length === 1) {
    const file = files[0];
    return renderFile(file, productCode, topicCode);
  }

  // Multiple files - use tabs
  const defaultTab = files[0].type;

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${files.length}, minmax(0, 1fr))` }}>
        {files.map((file, index) => (
          <TabsTrigger key={index} value={file.type + index} className="flex items-center gap-2">
            {getFileIcon(file.type)}
            {file.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {files.map((file, index) => (
        <TabsContent key={index} value={file.type + index} className="mt-6">
          {renderFile(file, productCode, topicCode)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function renderFile(file: ContentFile, productCode: string, topicCode: string) {
  const extension = file.filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return (
        <PDFViewer
          productCode={productCode}
          topicCode={topicCode}
          filename={file.filename}
          title={file.title}
        />
      );

    case 'ppt':
    case 'pptx':
      return (
        <PPTXViewer
          productCode={productCode}
          topicCode={topicCode}
          filename={file.filename}
          title={file.title}
        />
      );

    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return (
        <VideoPlayer
          productCode={productCode}
          topicCode={topicCode}
          filename={file.filename}
          title={file.title}
        />
      );

    default:
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <FileText className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
          <p className="text-sm text-yellow-800">
            Unsupported file type: {extension}
          </p>
        </div>
      );
  }
}

function getFileIcon(type: string) {
  switch (type) {
    case 'slides':
      return <Presentation className="h-4 w-4" />;
    case 'demo':
      return <Video className="h-4 w-4" />;
    case 'assignment':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

