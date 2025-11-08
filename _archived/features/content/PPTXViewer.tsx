'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Presentation, Download, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PPTXViewerProps {
  productCode: string;
  topicCode: string;
  filename: string;
  title?: string;
}

export default function PPTXViewer({ productCode, topicCode, filename, title }: PPTXViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSignedUrl() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/${productCode}/${topicCode}/${filename}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load presentation');
        }

        setSignedUrl(data.data.signedUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load presentation';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrl();
  }, [productCode, topicCode, filename]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            {title || 'Presentation Slides'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading slides...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !signedUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            {title || 'Presentation Slides'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Presentation className="h-12 w-12 mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 mb-3">{error || 'Failed to load slides'}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use Google Docs Viewer for PPTX files
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`;
  // Alternative: Microsoft Office Online Viewer
  // const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5" />
            {title || 'Presentation Slides'}
          </CardTitle>
          <div className="flex gap-2">
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                Open Original
              </Button>
            </a>
            <a href={signedUrl} download className="inline-flex items-center">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: '800px' }}>
          <iframe
            src={googleDocsViewerUrl}
            className="w-full h-full rounded-lg border border-gray-200"
            title={title || 'Presentation Slides'}
          />
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500">
            💡 Tip: If slides don&apos;t load, download the file or open it in a new tab.
          </p>
          <div className="flex gap-2 flex-wrap text-xs">
            <a
              href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Try Microsoft Viewer
            </a>
            <span className="text-gray-400">|</span>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open in PowerPoint Online
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

