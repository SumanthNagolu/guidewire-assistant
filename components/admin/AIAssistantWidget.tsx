'use client';

import React, { useState } from 'react';
import { Sparkles, Send, X, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { generateContentWithAI, generateSEOTags } from '@/lib/admin/ai-helper';
import { toast } from 'sonner';

interface AIAssistantWidgetProps {
  contentType: 'blog' | 'job_description' | 'course_description' | 'email';
  onContentGenerated?: (content: string) => void;
  onSEOGenerated?: (seo: { metaTitle: string; metaDescription: string; keywords: string[] }) => void;
  currentContent?: string;
  currentTitle?: string;
}

export default function AIAssistantWidget({ 
  contentType, 
  onContentGenerated,
  onSEOGenerated,
  currentContent,
  currentTitle
}: AIAssistantWidgetProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'generate' | 'seo'>('generate');

  const handleGenerate = async () => {
    if (!prompt.trim() && mode === 'generate') {
      toast.error('Please describe what you want to create');
      return;
    }

    setGenerating(true);
    try {
      if (mode === 'generate') {
        const content = await generateContentWithAI({
          type: contentType,
          prompt,
          context: {}
        });
        setGeneratedContent(content);
        toast.success('Content generated successfully!');
      } else {
        // Generate SEO tags
        if (!currentContent || !currentTitle) {
          toast.error('Please save some content first');
          return;
        }

        const seo = await generateSEOTags(currentContent, currentTitle);
        if (onSEOGenerated) {
          onSEOGenerated(seo);
          setShowDialog(false);
          toast.success('SEO tags generated and applied!');
        }
      }
    } catch (error) {
            toast.error('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (onContentGenerated && generatedContent) {
      onContentGenerated(generatedContent);
      setShowDialog(false);
      setGeneratedContent('');
      setPrompt('');
      toast.success('Content applied!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const getPlaceholder = () => {
    switch (contentType) {
      case 'blog':
        return 'e.g., Write a blog post about the benefits of Guidewire training for insurance companies...';
      case 'job_description':
        return 'e.g., Senior Guidewire Developer with 5+ years experience in ClaimCenter...';
      case 'course_description':
        return 'e.g., A comprehensive course on Guidewire PolicyCenter for beginners...';
      case 'email':
        return 'e.g., Follow-up email for job candidates who haven\'t responded...';
      default:
        return 'Describe what you want to create...';
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'blog':
        return 'Blog Post';
      case 'job_description':
        return 'Job Description';
      case 'course_description':
        return 'Course Description';
      case 'email':
        return 'Email';
      default:
        return 'Content';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
      >
        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
        <span className="text-purple-900">AI Assistant</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Content Assistant
            </DialogTitle>
            <DialogDescription>
              Let AI help you create professional {getContentTypeLabel().toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'generate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('generate')}
              >
                Generate Content
              </Button>
              {(contentType === 'blog' || contentType === 'job_description') && currentContent && (
                <Button
                  variant={mode === 'seo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('seo')}
                >
                  Generate SEO Tags
                </Button>
              )}
            </div>

            {/* Input Section */}
            {mode === 'generate' && (
              <div className="space-y-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={getPlaceholder()}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Be specific about what you want. The more details, the better the result.
                </p>
              </div>
            )}

            {mode === 'seo' && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-900">
                    <p className="font-medium mb-1">AI will analyze your content and generate:</p>
                    <ul className="list-disc list-inside space-y-1 text-purple-700">
                      <li>Optimized meta title (60 characters)</li>
                      <li>Compelling meta description (160 characters)</li>
                      <li>Relevant keywords for SEO</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Templates */}
            {mode === 'generate' && contentType === 'blog' && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Templates:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setPrompt('Write a comprehensive guide about Guidewire ClaimCenter FNOL process for insurance professionals')}
                  >
                    Guidewire Guide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setPrompt('Write a blog post about the latest trends in IT staffing and talent acquisition for 2025')}
                  >
                    Industry Trends
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setPrompt('Write a case study about how a company successfully hired 10 developers in 30 days')}
                  >
                    Case Study
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setPrompt('Write a technical tutorial about integrating Guidewire with third-party systems')}
                  >
                    Technical Tutorial
                  </Button>
                </div>
              </div>
            )}

            {/* Generated Content Display */}
            {generatedContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Generated Content:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setGeneratedContent('');
                  setPrompt('');
                }}
              >
                Close
              </Button>
              
              {!generatedContent ? (
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleUseContent}>
                  <Check className="w-4 h-4 mr-2" />
                  Use This Content
                </Button>
              )}
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                  AI-generated content is a starting point. Always review and customize 
                  the output to match your brand voice and ensure accuracy.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


