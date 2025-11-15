"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Search, Filter, Play, FileText, Users } from 'lucide-react';
interface Job {
  id: string;
  title: string;
  client_id: string;
  client?: {
    company_name: string;
  };
  location: string;
  type: string;
  status: string;
  experience_required: string;
  salary_range: string;
  skills_required: any[];
  posted_date: string;
  created_at: string;
  workflow_instances?: any[];
  applications_count?: number;
}
export default function JobsPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    client_id: '',
    location: '',
    type: 'full_time',
    experience_required: '',
    salary_range: '',
    skills_required: '',
    description: '',
  });
  useEffect(() => {
    fetchJobs();
    fetchClients();
  }, [statusFilter, typeFilter]);
  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:clients(company_name),
          workflow_instances(id, status),
          applications:jd_assignments(count)
        `)
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .eq('status', 'active')
        .order('company_name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      }
  };
  const createJob = async () => {
    try {
      const skillsArray = newJob.skills_required
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          ...newJob,
          skills_required: skillsArray,
          status: 'active',
          posted_date: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) throw error;
      await fetchJobs();
      setShowCreateDialog(false);
      setNewJob({
        title: '',
        client_id: '',
        location: '',
        type: 'full_time',
        experience_required: '',
        salary_range: '',
        skills_required: '',
        description: '',
      });
    } catch (error) {
      }
  };
  const startWorkflow = (jobId: string, jobTitle: string) => {
    router.push(`/platform/workflows/start?type=job&jobId=${jobId}&name=${encodeURIComponent(jobTitle)}`);
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
      default:
        return 'outline';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contract':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'contract_to_hire':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'part_time':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills_required?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          <h2 className="text-3xl font-bold tracking-tight">Job Management</h2>
          <p className="text-muted-foreground">
            Manage job requisitions and track their lifecycle
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job requisition to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Senior Java Developer"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <Select
                  value={newJob.client_id}
                  onValueChange={(value) => setNewJob({ ...newJob, client_id: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., New York, NY (Remote)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newJob.type}
                  onValueChange={(value) => setNewJob({ ...newJob, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="contract_to_hire">Contract to Hire</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience" className="text-right">
                  Experience
                </Label>
                <Input
                  id="experience"
                  value={newJob.experience_required}
                  onChange={(e) => setNewJob({ ...newJob, experience_required: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., 5-8 years"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary" className="text-right">
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., $120k - $150k"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">
                  Skills
                </Label>
                <Input
                  id="skills"
                  value={newJob.skills_required}
                  onChange={(e) => setNewJob({ ...newJob, skills_required: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Java, Spring Boot, AWS (comma-separated)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createJob}>Create Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, clients, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="contract_to_hire">Contract to Hire</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Requisitions</CardTitle>
          <CardDescription>
            Click on a job to view details or start a workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No jobs found</p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflows</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => router.push(`/platform/jobs/${job.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {job.skills_required.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills_required.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.skills_required.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{job.client?.company_name || 'Unknown'}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(job.type)}>
                        {job.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.experience_required}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{job.workflow_instances?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{job.applications_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startWorkflow(job.id, job.title)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Workflow
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
