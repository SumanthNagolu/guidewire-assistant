"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Play,
  Edit,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Target,
  Clock,
  CheckCircle,
} from 'lucide-react';
interface JobDetails {
  id: string;
  title: string;
  client_id: string;
  client?: {
    company_name: string;
    website: string;
    industry: string;
  };
  location: string;
  type: string;
  status: string;
  experience_required: string;
  salary_range: string;
  skills_required: string[];
  description: string;
  posted_date: string;
  created_at: string;
}
interface JobAssignment {
  id: string;
  status: string;
  priority: string;
  resumes_sourced: number;
  target_resumes: number;
  candidates_screened: number;
  candidates_submitted: number;
  pod?: {
    name: string;
  };
  sourcer?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  screener?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  account_manager?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}
interface JobApplication {
  id: string;
  candidate: {
    first_name: string;
    last_name: string;
    email: string;
    current_title: string;
  };
  status: string;
  submitted_at: string;
}
export default function JobDetailPage() {
  const { id } = useParams();
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchJobDetails();
    fetchAssignments();
    fetchApplications();
    fetchWorkflows();
  }, [id]);
  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(company_name, website, industry)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setJob(data);
    } catch (error) {
      }
  };
  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('jd_assignments')
        .select(`
          *,
          pod:pods(name),
          sourcer:user_profiles!sourcer_id(first_name, last_name, avatar_url),
          screener:user_profiles!screener_id(first_name, last_name, avatar_url),
          account_manager:user_profiles!account_manager_id(first_name, last_name, avatar_url)
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      }
  };
  const fetchApplications = async () => {
    // For now, we'll simulate this data
    // In a real implementation, this would fetch from an applications table
    setApplications([]);
  };
  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:workflow_templates(name, category)
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const startWorkflow = () => {
    if (job) {
      router.push(`/platform/workflows/start?type=job&jobId=${job.id}&name=${encodeURIComponent(job.title)}`);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on_hold':
        return 'secondary';
      case 'filled':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'assigned':
      case 'sourcing':
        return 'default';
      case 'screening':
        return 'secondary';
      case 'submitted':
        return 'success';
      case 'completed':
        return 'success';
      default:
        return 'outline';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };
  if (loading || !job) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const totalProgress = assignments.reduce((acc, assignment) => {
    const progress = assignment.target_resumes > 0 
      ? (assignment.resumes_sourced / assignment.target_resumes) * 100 
      : 0;
    return acc + progress;
  }, 0) / (assignments.length || 1);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
              <Badge variant={getStatusColor(job.status)}>
                {job.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {job.client?.company_name}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {new Date(job.posted_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={startWorkflow}>
            <Play className="mr-2 h-4 w-4" />
            Start Workflow
          </Button>
          <Button variant="outline" onClick={() => router.push(`/platform/jobs/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
        </div>
      </div>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Required</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.experience_required}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.salary_range}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
            <Progress value={totalProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="mt-1">{job.description || 'No description provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Job Type</h4>
                  <p className="mt-1">{job.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Required Skills</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                  <p className="mt-1">{job.client?.company_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
                  <p className="mt-1">{job.client?.industry || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                  <p className="mt-1">
                    {job.client?.website ? (
                      <a
                        href={job.client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {job.client.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Pod Assignments</CardTitle>
              <CardDescription>
                Teams working on this job requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No assignments yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={startWorkflow}
                  >
                    Start First Assignment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">{assignment.pod?.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                              <Badge variant={getPriorityColor(assignment.priority)}>
                                {assignment.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/platform/assignments/${assignment.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                        {/* Team Members */}
                        <div className="space-y-2 mb-4">
                          {assignment.account_manager && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={assignment.account_manager.avatar_url} />
                                <AvatarFallback>
                                  {assignment.account_manager.first_name[0]}
                                  {assignment.account_manager.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <span className="font-medium">Account Manager:</span>{' '}
                                {assignment.account_manager.first_name} {assignment.account_manager.last_name}
                              </div>
                            </div>
                          )}
                          {assignment.sourcer && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={assignment.sourcer.avatar_url} />
                                <AvatarFallback>
                                  {assignment.sourcer.first_name[0]}
                                  {assignment.sourcer.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <span className="font-medium">Sourcer:</span>{' '}
                                {assignment.sourcer.first_name} {assignment.sourcer.last_name}
                              </div>
                            </div>
                          )}
                          {assignment.screener && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={assignment.screener.avatar_url} />
                                <AvatarFallback>
                                  {assignment.screener.first_name[0]}
                                  {assignment.screener.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <span className="font-medium">Screener:</span>{' '}
                                {assignment.screener.first_name} {assignment.screener.last_name}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Progress Metrics */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Resumes Sourced</span>
                              <span>{assignment.resumes_sourced} / {assignment.target_resumes}</span>
                            </div>
                            <Progress 
                              value={(assignment.resumes_sourced / assignment.target_resumes) * 100} 
                              className="h-2"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Screened</span>
                              <p className="font-medium">{assignment.candidates_screened}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qualified</span>
                              <p className="font-medium">
                                {assignment.candidates_submitted}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Submitted</span>
                              <p className="font-medium">{assignment.candidates_submitted}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Instances</CardTitle>
              <CardDescription>
                Active and completed workflows for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>No workflows started yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={startWorkflow}
                  >
                    Start First Workflow
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.map((workflow) => (
                      <TableRow
                        key={workflow.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => router.push(`/platform/workflows/instances/${workflow.id}`)}
                      >
                        <TableCell>{workflow.name}</TableCell>
                        <TableCell>{workflow.template?.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={workflow.completion_percentage} className="w-16" />
                            <span className="text-sm">{workflow.completion_percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(workflow.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Applications</CardTitle>
              <CardDescription>
                Candidates submitted for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Applications tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent activity and updates for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Activity timeline coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
