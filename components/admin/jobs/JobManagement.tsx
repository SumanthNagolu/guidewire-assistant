'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Copy,
  Download,
  Upload,
  FileSpreadsheet,
  Save,
  MoreVertical,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Job {
  id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  client_id: string | null;
  location: string | null;
  remote_policy: 'remote' | 'hybrid' | 'onsite';
  rate_type: 'hourly' | 'annual';
  rate_min: number | null;
  rate_max: number | null;
  employment_type: 'contract' | 'contract_to_hire' | 'direct_placement' | 'temporary';
  duration_months: number | null;
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled';
  priority: 'hot' | 'warm' | 'cold';
  openings: number;
  filled: number;
  posted_date: string | null;
  target_fill_date: string | null;
  filled_date: string | null;
  owner_id: string | null;
  client_contact_id: string | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  client?: {
    id: string;
    company_name: string;
  };
  owner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  applications?: { count: number }[];
}

interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  requirements: string[];
  employment_type: string;
  rate_type: string;
}

interface JobManagementProps {
  initialJobs: Job[];
}

const jobTemplates: JobTemplate[] = [
  {
    id: '1',
    name: 'Senior Software Engineer Template',
    title: 'Senior Software Engineer',
    description: 'We are seeking an experienced software engineer...',
    requirements: ['5+ years experience', 'Strong coding skills', 'Team leadership'],
    employment_type: 'contract',
    rate_type: 'hourly'
  },
  {
    id: '2',
    name: 'Project Manager Template',
    title: 'Project Manager',
    description: 'Looking for an experienced project manager...',
    requirements: ['PMP certification', 'Agile/Scrum experience', '3+ years PM experience'],
    employment_type: 'direct_placement',
    rate_type: 'annual'
  }
];

export default function JobManagement({ initialJobs }: JobManagementProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [jobs, searchTerm, statusFilter, priorityFilter]);

  // Get statistics
  const stats = useMemo(() => {
    const open = jobs.filter(j => j.status === 'open').length;
    const totalOpenings = jobs.reduce((sum, j) => sum + (j.openings || 0), 0);
    const totalFilled = jobs.reduce((sum, j) => sum + (j.filled || 0), 0);
    const hotJobs = jobs.filter(j => j.priority === 'hot').length;

    return {
      total: jobs.length,
      open,
      totalOpenings,
      totalFilled,
      fillRate: totalOpenings > 0 ? (totalFilled / totalOpenings) * 100 : 0,
      hotJobs
    };
  }, [jobs]);

  // Toggle job selection
  const toggleJobSelection = (jobId: string) => {
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId);
    } else {
      newSelection.add(jobId);
    }
    setSelectedJobs(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  // Select all visible jobs
  const selectAllJobs = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
      setShowBulkActions(true);
    } else {
      setSelectedJobs(new Set());
      setShowBulkActions(false);
    }
  };

  // Handle job deletion
  const handleDelete = async (jobId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
            toast.error('Failed to delete job');
    } finally {
      setLoading(false);
      setDeleteJobId(null);
    }
  };

  // Bulk delete jobs
  const bulkDeleteJobs = async () => {
    if (!confirm(`Delete ${selectedJobs.size} selected jobs?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .in('id', Array.from(selectedJobs));

      if (error) throw error;

      setJobs(jobs.filter(j => !selectedJobs.has(j.id)));
      setSelectedJobs(new Set());
      setShowBulkActions(false);
      toast.success(`Deleted ${selectedJobs.size} jobs`);
    } catch (error) {
            toast.error('Failed to delete jobs');
    } finally {
      setLoading(false);
    }
  };

  // Bulk update job status
  const bulkUpdateStatus = async (status: Job['status']) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status })
        .in('id', Array.from(selectedJobs));

      if (error) throw error;

      setJobs(jobs.map(j => 
        selectedJobs.has(j.id) ? { ...j, status } : j
      ));
      toast.success(`Updated ${selectedJobs.size} jobs to ${status}`);
    } catch (error) {
            toast.error('Failed to update jobs');
    } finally {
      setLoading(false);
    }
  };

  // Duplicate job
  const duplicateJob = async (job: Job) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...job,
          id: undefined,
          title: `${job.title} (Copy)`,
          status: 'draft',
          posted_date: null,
          filled_date: null,
          filled: 0,
          created_at: undefined
        })
        .select()
        .single();

      if (error) throw error;

      setJobs([data, ...jobs]);
      toast.success('Job duplicated successfully');
      router.push(`/admin/jobs/${data.id}/edit`);
    } catch (error) {
            toast.error('Failed to duplicate job');
    } finally {
      setLoading(false);
    }
  };

  // Export jobs to CSV
  const exportJobs = () => {
    const selectedJobsArray = jobs.filter(j => selectedJobs.has(j.id));
    const dataToExport = selectedJobsArray.length > 0 ? selectedJobsArray : filteredJobs;

    const csv = [
      ['Title', 'Client', 'Location', 'Status', 'Priority', 'Openings', 'Filled', 'Posted Date'],
      ...dataToExport.map(job => [
        job.title,
        job.client?.company_name || '',
        job.location || '',
        job.status,
        job.priority,
        job.openings.toString(),
        job.filled.toString(),
        job.posted_date || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${dataToExport.length} jobs`);
  };

  // Import jobs from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In production, parse CSV and validate data
    toast.info('Import functionality coming soon');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create job from template
  const createFromTemplate = () => {
    const template = jobTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Navigate to job creation with template data
    router.push(`/admin/jobs/new?template=${selectedTemplate}`);
    setShowTemplateDialog(false);
  };

  // Get status color
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'filled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'hot':
        return 'text-red-600';
      case 'warm':
        return 'text-orange-600';
      case 'cold':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.open} open positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Openings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpenings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFilled} filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fillRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Jobs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hotJobs}</div>
            <p className="text-xs text-muted-foreground">
              Urgent priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/jobs/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Blank Job
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
                  <Copy className="w-4 h-4 mr-2" />
                  From Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={exportJobs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {selectedJobs.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedJobs(new Set());
                  setShowBulkActions(false);
                }}
              >
                Clear Selection
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => bulkUpdateStatus('open')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkUpdateStatus('on_hold')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Put On Hold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkUpdateStatus('cancelled')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Jobs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportJobs}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={bulkDeleteJobs}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 py-4 px-4">
                  <Checkbox
                    checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={(checked) => selectAllJobs(checked as boolean)}
                  />
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Job Details</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Compensation</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Progress</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <Checkbox
                      checked={selectedJobs.has(job.id)}
                      onCheckedChange={() => toggleJobSelection(job.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{job.title}</p>
                        <AlertCircle className={`w-4 h-4 ${getPriorityColor(job.priority)}`} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {job.employment_type.replace('_', ' ')}
                        </Badge>
                        {job.remote_policy && (
                          <Badge variant="outline" className="text-xs">
                            {job.remote_policy}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="w-4 h-4" />
                      {job.client?.company_name || 'No Client'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      {job.location || 'Not specified'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      {job.rate_min && job.rate_max ? (
                        <>
                          <div className="font-medium">
                            ${job.rate_min.toLocaleString()} - ${job.rate_max.toLocaleString()}
                          </div>
                          <div className="text-gray-500">{job.rate_type}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {job.filled}/{job.openings} filled
                        </span>
                      </div>
                      {job.applications && (
                        <div className="text-xs text-gray-500">
                          {job.applications[0]?.count || 0} applications
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(job.status)}
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/jobs/${job.id}/applications`}>
                              <Users className="w-4 h-4 mr-2" />
                              View Applications
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateJob(job)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => bulkUpdateStatus('on_hold')}>
                            <Clock className="w-4 h-4 mr-2" />
                            Put On Hold
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteJobId(job.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? All associated applications will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteJobId && handleDelete(deleteJobId)}
              disabled={loading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job from Template</DialogTitle>
            <DialogDescription>
              Select a template to start with pre-filled content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {jobTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">
                    {jobTemplates.find(t => t.id === selectedTemplate)?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    {jobTemplates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                  <div className="text-sm">
                    <strong>Requirements:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {jobTemplates.find(t => t.id === selectedTemplate)?.requirements.map((req, idx) => (
                        <li key={idx} className="text-gray-600">{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createFromTemplate} disabled={!selectedTemplate}>
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


