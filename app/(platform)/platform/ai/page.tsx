"use client";
import { useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Brain,
  FileText,
  Mail,
  Search,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Download,
} from 'lucide-react';
export default function AIAssistantPage() {
  const { supabase, user } = useSupabase();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [emailType, setEmailType] = useState('candidate_outreach');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('resume-parser');
  const parseResume = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/platform/ai/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      } finally {
      setProcessing(false);
    }
  };
  const matchCandidates = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/platform/ai/match-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      } finally {
      setProcessing(false);
    }
  };
  const generateEmail = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/platform/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: emailContext, type: emailType }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      } finally {
      setProcessing(false);
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground">
          Leverage AI for resume parsing, candidate matching, and communication
        </p>
      </div>
      {/* AI Capabilities Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resume Parsing</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GPT-4</div>
            <p className="text-xs text-muted-foreground">
              Extract skills & experience
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semantic Matching</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Embeddings</div>
            <p className="text-xs text-muted-foreground">
              AI-powered job matching
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Generation</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Claude</div>
            <p className="text-xs text-muted-foreground">
              Professional templates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Context-aware assistance
            </p>
          </CardContent>
        </Card>
      </div>
      {/* AI Tools */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume-parser">Resume Parser</TabsTrigger>
          <TabsTrigger value="candidate-matcher">Candidate Matcher</TabsTrigger>
          <TabsTrigger value="email-generator">Email Generator</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        {/* Resume Parser Tab */}
        <TabsContent value="resume-parser">
          <Card>
            <CardHeader>
              <CardTitle>Resume Parser</CardTitle>
              <CardDescription>
                Extract structured data from resume text using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume Text</Label>
                <Textarea
                  id="resume"
                  placeholder="Paste resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={parseResume} disabled={processing || !resumeText}>
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Parse Resume
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
              {results && activeTab === 'resume-parser' && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold">Extracted Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={results.name || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={results.email || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={results.phone || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience</Label>
                      <Input value={results.experience || ''} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {results.skills?.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea value={results.summary || ''} readOnly rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy JSON
                    </Button>
                    <Button>
                      Save to Database
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Candidate Matcher Tab */}
        <TabsContent value="candidate-matcher">
          <Card>
            <CardHeader>
              <CardTitle>AI Candidate Matcher</CardTitle>
              <CardDescription>
                Find the best candidates for a job using semantic search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-desc">Job Description</Label>
                <Textarea
                  id="job-desc"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                />
              </div>
              <Button onClick={matchCandidates} disabled={processing || !jobDescription}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Matches
                  </>
                )}
              </Button>
              {results && activeTab === 'candidate-matcher' && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold">Top Matches</h4>
                  {results.matches?.map((match: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{match.name}</h5>
                            <p className="text-sm text-muted-foreground">{match.title}</p>
                          </div>
                          <Badge variant="default">
                            {match.score}% Match
                          </Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Skills: {match.matchingSkills.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">Missing: {match.missingSkills.join(', ')}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm">View Profile</Button>
                          <Button size="sm" variant="outline">Submit</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Email Generator Tab */}
        <TabsContent value="email-generator">
          <Card>
            <CardHeader>
              <CardTitle>AI Email Generator</CardTitle>
              <CardDescription>
                Generate professional emails for various scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-type">Email Type</Label>
                  <select
                    id="email-type"
                    className="w-full p-2 border rounded"
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                  >
                    <option value="candidate_outreach">Candidate Outreach</option>
                    <option value="client_communication">Client Communication</option>
                    <option value="status_update">Status Update</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="interview_schedule">Interview Schedule</option>
                    <option value="offer_letter">Offer Letter</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context</Label>
                <Textarea
                  id="context"
                  placeholder="Provide context for the email (e.g., candidate name, job title, company, specific details)..."
                  value={emailContext}
                  onChange={(e) => setEmailContext(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={generateEmail} disabled={processing || !emailContext}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Generate Email
                  </>
                )}
              </Button>
              {results && activeTab === 'email-generator' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input value={results.subject || ''} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea value={results.body || ''} readOnly rows={10} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copyToClipboard(results.body)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Email
                    </Button>
                    <Button>
                      Send Email
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Smart recommendations and pattern detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-base">Recommendation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Based on current market trends, consider focusing on cloud-native skills
                      (AWS, Kubernetes, Docker) for faster placements.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">Pattern Detected</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Candidates with 5-7 years experience have 40% higher placement rate
                      in your current job openings.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-base">Optimization Opportunity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Screening calls scheduled between 10 AM - 12 PM have 25% higher
                      connection rates. Consider adjusting your calling schedule.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
