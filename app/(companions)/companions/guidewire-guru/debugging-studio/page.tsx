'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebuggingStudioPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Guidewire Code Debugging Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Upload your Guidewire code for AI-powered debugging assistance.
          </p>
          <Button className="mt-4">Upload Code</Button>
        </CardContent>
      </Card>
    </div>
  );
}

