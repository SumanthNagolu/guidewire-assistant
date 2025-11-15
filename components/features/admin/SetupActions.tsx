'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SetupActionsProps {
  initialChecks: {
    storageBucket: boolean;
    interviewTemplates: boolean;
    quizzes: boolean;
  };
}

export default function SetupActions({ initialChecks }: SetupActionsProps) {
  const [checks, setChecks] = useState(initialChecks);
  const [loading, setLoading] = useState<string | null>(null);

  const runSetup = async (action: string) => {
    setLoading(action);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Setup failed');
      }

      toast.success(result.message || 'Setup completed successfully');

      // Update checks
      if (action === 'storage-bucket') {
        setChecks((prev) => ({ ...prev, storageBucket: true }));
      } else if (action === 'interview-templates') {
        setChecks((prev) => ({ ...prev, interviewTemplates: true }));
      }
    } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Setup failed');
    } finally {
      setLoading(null);
    }
  };

  const setupItems = [
    {
      id: 'storage-bucket',
      title: 'Storage Bucket',
      description: 'Create course-content bucket for slides, videos, and assignments',
      status: checks.storageBucket,
      action: () => runSetup('storage-bucket'),
      sqlFile: 'CREATE-STORAGE-BUCKET.sql',
    },
    {
      id: 'interview-templates',
      title: 'Interview Templates',
      description: 'Import 5 interview templates (Junior/Mid/Senior)',
      status: checks.interviewTemplates,
      action: () => runSetup('interview-templates'),
      sqlFile: 'INSERT-INTERVIEW-TEMPLATES-FIXED.sql',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Status</CardTitle>
          <CardDescription>Current state of platform setup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              {checks.storageBucket ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">Storage Bucket</p>
                <Badge variant={checks.storageBucket ? 'default' : 'secondary'} className="mt-1">
                  {checks.storageBucket ? 'Configured' : 'Not Set Up'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {checks.interviewTemplates ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">Interview Templates</p>
                <Badge variant={checks.interviewTemplates ? 'default' : 'secondary'} className="mt-1">
                  {checks.interviewTemplates ? 'Imported' : 'Not Imported'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {checks.quizzes ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="text-sm font-medium">Quizzes</p>
                <Badge variant={checks.quizzes ? 'default' : 'secondary'} className="mt-1">
                  {checks.quizzes ? 'Available' : 'Manual Import'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {setupItems.map((item) => (
          <Card key={item.id} className={item.status ? 'border-green-200 bg-green-50' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {item.status ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-2">{item.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">SQL Script:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  database/{item.sqlFile}
                </code>
              </div>

              {item.status ? (
                <Button variant="outline" disabled className="w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Already Configured
                </Button>
              ) : (
                <Button
                  onClick={item.action}
                  disabled={loading !== null}
                  className="w-full"
                >
                  {loading === item.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Setup...
                    </>
                  ) : (
                    <>Run Setup</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            • <strong>Storage Bucket:</strong> Required before uploading content files
          </p>
          <p>
            • <strong>Interview Templates:</strong> Needed for Interview Simulator to work
          </p>
          <p>
            • <strong>One-Click:</strong> All SQL scripts run automatically with proper error handling
          </p>
          <p>
            • <strong>Idempotent:</strong> Safe to run multiple times (won&apos;t duplicate data)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

