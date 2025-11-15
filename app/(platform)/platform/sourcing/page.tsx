"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Upload,
  Database,
  Linkedin,
  Globe,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Copy,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
interface SourcingSession {
  id: string;
  job_id: string;
  job?: {
    title: string;
    client?: {
      company_name: string;
    };
  };
  session_date: string;
  target_resumes: number;
  resumes_found: number;
  resumes_from_internal: number;
  resumes_from_linkedin: number;
  resumes_from_dice: number;
  resumes_from_indeed: number;
  resumes_qualified: number;
  status: string;
}
interface Resume {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_title: string;
  years_experience: number;
  skills: string[];
  source: string;
  completeness_score: number;
  status: string;
  added_by: string;
  created_at: string;
}
export default function SourcingHubPage() {
  const { supabase, user } = useSupabase();
  const [sessions, setSessions] = useState<SourcingSession[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeSession, setActiveSession] = useState<SourcingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [quotaProgress, setQuotaProgress] = useState({
    total: 0,
    internal: 0,
    linkedin: 0,
    dice: 0,
    indeed: 0,
    other: 0,
  });
  useEffect(() => {
    fetchSessions();
    fetchResumes();
    fetchJobs();
  }, []);
  useEffect(() => {
    if (activeSession) {
      calculateQuotaProgress(activeSession);
    }
  }, [activeSession]);
  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sourcing_sessions')
        .select(`
          *,
          job:jobs(
            title,
            client:clients(company_name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setSessions(data || []);
      // Set active session to the most recent in-progress session
      const inProgressSession = data?.find(s => s.status === 'in_progress');
      if (inProgressSession) {
        setActiveSession(inProgressSession);
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const fetchResumes = async () => {
    try {
      let query = supabase
        .from('resume_database')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      }
  };
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      }
  };
  const startNewSession = async () => {
    if (!selectedJobId) {
      alert('Please select a job');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('sourcing_sessions')
        .insert([{
          user_id: user?.id,
          job_id: selectedJobId,
          session_date: new Date().toISOString().split('T')[0],
          target_resumes: 30, // Default target
          resumes_found: 0,
          resumes_from_internal: 0,
          resumes_from_linkedin: 0,
          resumes_from_dice: 0,
          resumes_from_indeed: 0,
          resumes_from_other: 0,
          resumes_qualified: 0,
          status: 'in_progress',
        }])
        .select(`
          *,
          job:jobs(
            title,
            client:clients(company_name)
          )
        `)
        .single();
      if (error) throw error;
      setSessions([data, ...sessions]);
      setActiveSession(data);
      setShowNewSessionDialog(false);
      setSelectedJobId('');
    } catch (error) {
      }
  };
  const updateSessionProgress = async (sessionId: string, source: string) => {
    if (!activeSession) return;
    const updates: any = {
      resumes_found: activeSession.resumes_found + 1,
    };
    // Update source-specific count
    switch (source) {
      case 'internal_db':
        updates.resumes_from_internal = activeSession.resumes_from_internal + 1;
        break;
      case 'linkedin':
        updates.resumes_from_linkedin = activeSession.resumes_from_linkedin + 1;
        break;
      case 'dice':
        updates.resumes_from_dice = activeSession.resumes_from_dice + 1;
        break;
      case 'indeed':
        updates.resumes_from_indeed = activeSession.resumes_from_indeed + 1;
        break;
      default:
        updates.resumes_from_other = (activeSession.resumes_from_other || 0) + 1;
    }
    try {
      const { data, error } = await supabase
        .from('sourcing_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      setActiveSession({ ...activeSession, ...updates });
      // Update sessions list
      setSessions(sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    } catch (error) {
      }
  };
  const completeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sourcing_sessions')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId);
      if (error) throw error;
      setActiveSession(null);
      await fetchSessions();
    } catch (error) {
      }
  };
  const calculateQuotaProgress = (session: SourcingSession) => {
    const target = session.target_resumes || 30;
    const internalTarget = Math.floor(target * 0.5); // 50% from internal DB
    const linkedinTarget = Math.floor(target * 0.25); // 25% from LinkedIn
    const otherTarget = Math.floor(target * 0.25); // 25% from other sources
    setQuotaProgress({
      total: (session.resumes_found / target) * 100,
      internal: (session.resumes_from_internal / internalTarget) * 100,
      linkedin: (session.resumes_from_linkedin / linkedinTarget) * 100,
      dice: session.resumes_from_dice || 0,
      indeed: session.resumes_from_indeed || 0,
      other: 0,
    });
  };
  const checkForDuplicates = (email: string, phone: string): boolean => {
    return resumes.some(r => r.email === email || r.phone === phone);
  };
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'internal_db':
        return Database;
      case 'linkedin':
        return Linkedin;
      case 'dice':
      case 'indeed':
      case 'monster':
        return Globe;
      default:
        return Users;
    }
  };
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'internal_db':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'dice':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'indeed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = 
      resume.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.current_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sourcing Hub</h2>
          <p className="text-muted-foreground">
            Multi-source candidate aggregation with quota tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Target className="mr-2 h-4 w-4" />
                New Sourcing Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Sourcing Session</DialogTitle>
                <DialogDescription>
                  Begin a new sourcing session for a job requisition
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="job">Select Job</Label>
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger id="job">
                      <SelectValue placeholder="Choose a job to source for" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={startNewSession}>Start Session</Button>
              </div>
            </DialogContent>
          </Dialog>
          {activeSession && (
            <Button variant="outline" onClick={() => completeSession(activeSession.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Session
            </Button>
          )}
        </div>
      </div>
      {/* Active Session Card */}
      {activeSession && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Active Sourcing Session</CardTitle>
                <CardDescription>
                  {activeSession.job?.title} - {activeSession.job?.client?.company_name}
                </CardDescription>
              </div>
              <Badge variant="default">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">
                    {activeSession.resumes_found} / {activeSession.target_resumes} resumes
                  </span>
                </div>
                <Progress value={quotaProgress.total} className="h-2" />
              </div>
              {/* Source Breakdown */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Internal DB</span>
                    <span>{activeSession.resumes_from_internal} / 15</span>
                  </div>
                  <Progress value={quotaProgress.internal} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">LinkedIn</span>
                    <span>{activeSession.resumes_from_linkedin} / 7</span>
                  </div>
                  <Progress value={quotaProgress.linkedin} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Other Sources</span>
                    <span>{activeSession.resumes_from_dice + activeSession.resumes_from_indeed} / 8</span>
                  </div>
                  <Progress 
                    value={((activeSession.resumes_from_dice + activeSession.resumes_from_indeed) / 8) * 100} 
                    className="h-1" 
                  />
                </div>
              </div>
              {/* Quick Stats */}
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Qualified: </span>
                  <span className="font-medium">{activeSession.resumes_qualified}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Suggestions: </span>
                  <span className="font-medium">5 available</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duplicates Detected: </span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Sourcing Tools */}
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database">Internal DB</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="jobboards">Job Boards</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        {/* Internal Database Tab */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Resume Database</CardTitle>
                  <CardDescription>
                    Search and select candidates from internal database
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="internal_db">Internal DB</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="dice">Dice</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Results Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResumes.slice(0, 10).map((resume) => {
                      const Icon = getSourceIcon(resume.source);
                      const isDuplicate = checkForDuplicates(resume.email, resume.phone);
                      return (
                        <TableRow key={resume.id}>
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {resume.first_name} {resume.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{resume.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{resume.current_title}</TableCell>
                          <TableCell>{resume.years_experience} years</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {resume.skills?.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {resume.skills?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{resume.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Icon className="h-4 w-4" />
                              <Badge className={getSourceColor(resume.source) + ' text-xs'}>
                                {resume.source.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Progress value={resume.completeness_score} className="w-12 h-1" />
                              <span className="text-xs">{resume.completeness_score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {isDuplicate && (
                                <Badge variant="destructive" className="text-xs">
                                  Duplicate
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (activeSession) {
                                    updateSessionProgress(activeSession.id, resume.source);
                                  }
                                }}
                                disabled={!activeSession || isDuplicate}
                              >
                                Add
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* LinkedIn Tab */}
        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Search</CardTitle>
              <CardDescription>
                Search and import profiles from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Boolean Search Query</Label>
                  <Textarea 
                    placeholder='("Java Developer" OR "Software Engineer") AND (Spring OR "Spring Boot") AND (AWS OR Azure)'
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Search LinkedIn
                  </Button>
                  <Button variant="outline">
                    Generate Search Query
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  LinkedIn integration will display search results here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Job Boards Tab */}
        <TabsContent value="jobboards">
          <Card>
            <CardHeader>
              <CardTitle>Job Board Aggregator</CardTitle>
              <CardDescription>
                Search across multiple job boards simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Dice</CardTitle>
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Tech professionals</p>
                    <Button className="w-full mt-2" size="sm">Search Dice</Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Indeed</CardTitle>
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">All industries</p>
                    <Button className="w-full mt-2" size="sm">Search Indeed</Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Monster</CardTitle>
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Global talent</p>
                    <Button className="w-full mt-2" size="sm">Search Monster</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Resume Upload</CardTitle>
              <CardDescription>
                Upload multiple resumes at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Drag and drop resume files here</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button className="mt-2" variant="outline">
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDF, DOC, DOCX files (max 10MB each)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sourcing History</CardTitle>
              <CardDescription>
                View past sourcing sessions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Resumes Found</TableHead>
                    <TableHead>Sources</TableHead>
                    <TableHead>Qualified</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.session_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{session.job?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.job?.client?.company_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.resumes_found} / {session.target_resumes}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>Internal: {session.resumes_from_internal}</div>
                          <div>LinkedIn: {session.resumes_from_linkedin}</div>
                          <div>Others: {session.resumes_from_dice + session.resumes_from_indeed}</div>
                        </div>
                      </TableCell>
                      <TableCell>{session.resumes_qualified}</TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'completed' ? 'success' : 'default'}>
                          {session.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
