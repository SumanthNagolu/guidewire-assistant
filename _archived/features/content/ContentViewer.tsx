'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFViewer from './PDFViewer';
import VideoPlayer from './VideoPlayer';
import PPTXViewer from './PPTXViewer';
import { FileText, Video, Presentation, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ContentFileType = 'slides' | 'assignment' | 'demo';

interface ContentFile {
  id: string;
  type: ContentFileType;
  filename: string;
  title: string;
}

interface ContentViewerProps {
  productCode: string;
  topicCode: string;
  content: {
    slides?: string | null;
    demos?: string[] | null;
    assignment?: string | null;
  };
}

/**
 * Smart content viewer that displays slides, demos, and assignments
 * Supports Supabase Storage files and legacy external URLs
 */
export default function ContentViewer({ productCode, topicCode, content }: ContentViewerProps) {
  const files: ContentFile[] = [];

  // Slides
  if (content.slides) {
    files.push({
      id: 'slides-0',
      type: 'slides',
      filename: content.slides,
      title: 'Lesson Slides',
    });
  }

  // Demos (videos)
  if (content.demos && content.demos.length > 0) {
    content.demos.forEach((demo, index) => {
      files.push({
        id: `demo-${index}`,
        type: 'demo',
        filename: demo,
        title: content.demos!.length > 1 ? `Demo ${index + 1}` : 'Demo',
      });
    });
  }

  // Assignment
  if (content.assignment) {
    files.push({
      id: 'assignment-0',
      type: 'assignment',
      filename: content.assignment,
      title: 'Assignment & Solution',
    });
  }

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

  if (files.length === 1) {
    return renderFile(files[0], productCode, topicCode);
  }

  const defaultTab = files[0]?.id ?? 'content-0';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${files.length}, minmax(0, 1fr))` }}
      >
        {files.map((file) => (
          <TabsTrigger key={file.id} value={file.id} className="flex items-center gap-2">
            {getFileIcon(file.type)}
            {file.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {files.map((file) => (
        <TabsContent key={file.id} value={file.id} className="mt-6">
          {renderFile(file, productCode, topicCode)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function renderFile(file: ContentFile, productCode: string, topicCode: string) {
  const isExternal = /^https?:\/\//i.test(file.filename);

  if (isExternal) {
    return <ExternalContent file={file} />;
  }

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
            Unsupported file type: {extension || 'unknown'}
          </p>
          <p className="text-xs text-yellow-700 mt-2">Filename: {file.filename}</p>
        </div>
      );
  }
}

function ExternalContent({ file }: { file: ContentFile }) {
  const isYouTube = /youtu\.?be/.test(file.filename);
  const isLoom = /loom\.com/.test(file.filename);
  const isPdf = file.filename.toLowerCase().endsWith('.pdf');

  if (isYouTube) {
    const embedUrl = convertYouTubeToEmbed(file.filename);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {file.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoom) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {file.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe src={file.filename} className="w-full h-full" allowFullScreen />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPdf) {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {file.title}
          </CardTitle>
          <Button size="sm" variant="outline" asChild>
            <a href={file.filename} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3 w-3" />
              Open PDF
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <iframe
            src={`${file.filename}#view=FitH`}
            className="w-full h-[800px] rounded-lg border border-gray-200"
            title={file.title}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          {file.title}
        </CardTitle>
        <Button size="sm" variant="outline" asChild>
          <a href={file.filename} target="_blank" rel="noopener noreferrer">
            Open Link
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          This content opens in a new tab.
        </p>
      </CardContent>
    </Card>
  );
}

function convertYouTubeToEmbed(url: string): string {
  const videoId = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getFileIcon(type: ContentFileType) {
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

