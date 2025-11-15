'use client';
import { useState } from 'react';
import { FileText, Download, Copy, Check, Loader2, Sparkles, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
export default function ProjectGeneratorPage() {
  const [projectName, setProjectName] = useState('');
  const [product, setProduct] = useState<'ClaimCenter' | 'PolicyCenter' | 'BillingCenter'>('ClaimCenter');
  const [industry, setIndustry] = useState('');
  const [scope, setScope] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [challenges, setChallenges] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const generateDocumentation = async () => {
    if (!projectName || !scope) {
      toast.error('Please fill in project name and scope');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/companions/project-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          product,
          industry,
          scope,
          technologies,
          challenges
        }),
      });
      if (!response.ok) throw new Error('Failed to generate documentation');
      const result = await response.json();
      setGeneratedDoc(result.documentation);
      toast.success('Project documentation generated!');
    } catch (error) {
      toast.error('Failed to generate documentation');
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    toast.success('Documentation copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadDoc = () => {
    const blob = new Blob([generatedDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_Project_Doc.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Documentation downloaded!');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FolderOpen className="w-10 h-10 text-blue-600" />
            Project Documentation Generator
          </h1>
          <p className="text-gray-600">Generate comprehensive project documentation for Guidewire implementations</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Provide basic information about the project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Claims Processing Automation"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Guidewire Product *</Label>
                  <Select value={product} onValueChange={(v: any) => setProduct(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ClaimCenter">ClaimCenter</SelectItem>
                      <SelectItem value="PolicyCenter">PolicyCenter</SelectItem>
                      <SelectItem value="BillingCenter">BillingCenter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Industry/Domain</Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Property & Casualty Insurance"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Project Scope *</Label>
                  <Textarea
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="Describe what the project aimed to achieve, key objectives, business problems solved..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label>Technologies & Tools</Label>
                  <Textarea
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g., GOSU, PCF, REST APIs, Guidewire Studio, JIRA, Git, Jenkins, Java 11, Oracle DB..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Key Challenges & Solutions</Label>
                  <Textarea
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Describe major technical challenges faced and how they were resolved..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={generateDocumentation}
              disabled={loading || !projectName || !scope}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Documentation...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Project Documentation
                </>
              )}
            </Button>
          </div>
          {/* Generated Documentation Preview */}
          <div>
            <Card className="sticky top-6 max-h-[800px] overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Documentation</CardTitle>
                  {generatedDoc && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadDoc}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {!generatedDoc ? (
                  <div className="text-center py-20 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Fill in the details and click Generate</p>
                    <p className="text-sm mt-2">Your documentation will appear here</p>
                  </div>
                ) : (
                  <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                    <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Examples Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Documentation Includes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Project Overview</h4>
                <p className="text-sm text-blue-700">Business context, objectives, and stakeholders</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🏗️ Architecture</h4>
                <p className="text-sm text-purple-700">System design, data models, and integrations</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">⚙️ Implementation</h4>
                <p className="text-sm text-green-700">Technical details, code examples, configurations</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">🔧 Customizations</h4>
                <p className="text-sm text-yellow-700">PCFs, GOSU enhancements, workflows</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Challenges</h4>
                <p className="text-sm text-red-700">Problems faced and solutions implemented</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">📊 Results</h4>
                <p className="text-sm text-indigo-700">Metrics, achievements, and learnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
