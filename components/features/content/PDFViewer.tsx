'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PDFViewerProps {
  productCode: string;
  topicCode: string;
  filename: string;
  title?: string;
}

export default function PDFViewer({ productCode, topicCode, filename, title }: PDFViewerProps) {
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
          throw new Error(data.error || 'Failed to load PDF');
        }

        setSignedUrl(data.data.signedUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load PDF';
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
            <FileText className="h-5 w-5" />
            {title || 'PDF Document'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading PDF...</p>
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
            <FileText className="h-5 w-5" />
            {title || 'PDF Document'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 mb-3">{error || 'Failed to load PDF'}</p>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title || 'PDF Document'}
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
                Open in New Tab
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
            src={`${signedUrl}#view=FitH`}
            className="w-full h-full rounded-lg border border-gray-200"
            title={title || 'PDF Document'}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: If the PDF doesn&apos;t load, try opening it in a new tab or downloading it.
        </p>
      </CardContent>
    </Card>
  );
}

