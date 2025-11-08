'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoPlayerProps {
  productCode: string;
  topicCode: string;
  filename: string;
  title?: string;
}

export default function VideoPlayer({ productCode, topicCode, filename, title }: VideoPlayerProps) {
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
          throw new Error(data.error || 'Failed to load video');
        }

        setSignedUrl(data.data.signedUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load video';
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
            <Video className="h-5 w-5" />
            {title || 'Video Demo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading video...</p>
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
            <Video className="h-5 w-5" />
            {title || 'Video Demo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 mb-3">{error || 'Failed to load video'}</p>
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
            <Video className="h-5 w-5" />
            {title || 'Video Demo'}
          </CardTitle>
          <a href={signedUrl} download className="inline-flex items-center">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3 w-3" />
              Download
            </Button>
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <video
            src={signedUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Tip: Watch at 1.25x speed to save time, then slow down for complex sections.
        </p>
      </CardContent>
    </Card>
  );
}

