'use client';
import { useState } from 'react';
import { FileText, Download, Copy, Check, Loader2, Sparkles, Building, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
interface Experience {
  clientName: string;
  role: string;
  startDate: string;
  endDate: string;
  technologies?: string;
}
export default function ResumeBuilderPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [product, setProduct] = useState<'ClaimCenter' | 'PolicyCenter' | 'BillingCenter' | 'Multiple'>('ClaimCenter');
  const [experiences, setExperiences] = useState<Experience[]>([{
    clientName: '',
    role: '',
    startDate: '',
    endDate: '',
    technologies: ''
  }]);
  const [additionalSkills, setAdditionalSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'ats' | 'detailed' | 'executive'>('ats');
  const addExperience = () => {
    setExperiences([...experiences, {
      clientName: '',
      role: '',
      startDate: '',
      endDate: '',
      technologies: ''
    }]);
  };
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };
  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };
  const generateResume = async () => {
    if (!name || experiences.some(exp => !exp.clientName || !exp.role)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/companions/resume-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo: { name, email, phone, location },
          level,
          product,
          experiences,
          additionalSkills,
          certifications,
          format
        }),
      });
      if (!response.ok) throw new Error('Failed to generate resume');
      const result = await response.json();
      setGeneratedResume(result.resume);
      toast.success('Resume generated successfully!');
    } catch (error) {
      toast.error('Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    toast.success('Resume copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadResume = () => {
    const blob = new Blob([generatedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-purple-600" />
            Guidewire Resume Generator
          </h1>
          <p className="text-gray-600">Generate ATS-optimized resumes based on your timeline and experience</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Experience Level</Label>
                  <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (6+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Primary Product</Label>
                  <Select value={product} onValueChange={(v: any) => setProduct(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ClaimCenter">ClaimCenter</SelectItem>
                      <SelectItem value="PolicyCenter">PolicyCenter</SelectItem>
                      <SelectItem value="BillingCenter">BillingCenter</SelectItem>
                      <SelectItem value="Multiple">Multiple Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resume Format</Label>
                  <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ats">ATS-Optimized</SelectItem>
                      <SelectItem value="detailed">Detailed Technical</SelectItem>
                      <SelectItem value="executive">Executive Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Work Experience *</CardTitle>
                  <Button variant="outline" size="sm" onClick={addExperience}>
                    + Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Position {idx + 1}</span>
                      {experiences.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(idx)}
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Client Name *</Label>
                      <Input
                        value={exp.clientName}
                        onChange={(e) => updateExperience(idx, 'clientName', e.target.value)}
                        placeholder="Acme Insurance Corp"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role *</Label>
                      <Input
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                        placeholder="Senior Guidewire Developer"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Technologies (Optional)</Label>
                      <Input
                        value={exp.technologies || ''}
                        onChange={(e) => updateExperience(idx, 'technologies', e.target.value)}
                        placeholder="GOSU, PCF, REST APIs, Java"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Additional Skills</Label>
                  <Textarea
                    value={additionalSkills}
                    onChange={(e) => setAdditionalSkills(e.target.value)}
                    placeholder="e.g., Agile, JIRA, Git, SQL, etc."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Certifications</Label>
                  <Textarea
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g., Guidewire ClaimCenter Certified Developer"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={generateResume}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Resume
                </>
              )}
            </Button>
          </div>
          {/* Generated Resume Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Resume</CardTitle>
                  {generatedResume && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResume}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!generatedResume ? (
                  <div className="text-center py-20 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Fill in the details and click Generate</p>
                    <p className="text-sm mt-2">Your resume will appear here</p>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-white p-6 rounded border">
                      {generatedResume}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
