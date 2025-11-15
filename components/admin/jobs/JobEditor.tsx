'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Send,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import RichTextEditor from '@/components/admin/RichTextEditor';
import AIAssistantWidget from '@/components/admin/AIAssistantWidget';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Job {
  id?: string;
  title: string;
  description: string;
  requirements: string[];
  nice_to_have: string[];
  client_id?: string;
  location: string;
  remote_policy: 'remote' | 'hybrid' | 'onsite';
  rate_type: 'hourly' | 'annual';
  rate_min?: number;
  rate_max?: number;
  employment_type: 'contract' | 'contract_to_hire' | 'direct_placement' | 'temporary';
  duration_months?: number;
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'cancelled';
  priority: 'hot' | 'warm' | 'cold';
  openings: number;
  target_fill_date?: Date | null;
  tags: string[];
  notes: string;
}

interface JobEditorProps {
  jobId?: string;
}

interface Client {
  id: string;
  company_name: string;
}

const jobTemplates = [
  {
    id: '1',
    name: 'Senior Software Engineer Template',
    title: 'Senior Software Engineer',
    description: `We are seeking an experienced Software Engineer to join our dynamic team. The ideal candidate will have a strong background in software development and a passion for building scalable, high-quality solutions.

**Responsibilities:**
- Design, develop, and maintain software applications
- Collaborate with cross-functional teams to define and implement new features
- Write clean, maintainable, and efficient code
- Participate in code reviews and provide constructive feedback
- Troubleshoot and debug applications

**What We Offer:**
- Competitive compensation
- Flexible work arrangements
- Professional development opportunities
- Collaborative team environment`,
    requirements: [
      '5+ years of professional software development experience',
      'Strong proficiency in JavaScript/TypeScript and modern frameworks',
      'Experience with cloud platforms (AWS, Azure, or GCP)',
      'Solid understanding of software design patterns and principles',
      'Excellent problem-solving and communication skills'
    ],
    nice_to_have: [
      'Experience with microservices architecture',
      'Knowledge of DevOps practices and CI/CD',
      'Contribution to open-source projects',
      'Experience with Agile/Scrum methodologies'
    ],
    employment_type: 'contract',
    rate_type: 'hourly',
    remote_policy: 'hybrid'
  },
  {
    id: '2',
    name: 'Project Manager Template',
    title: 'Project Manager',
    description: `We are looking for an experienced Project Manager to lead and coordinate projects from inception to completion. The ideal candidate will have a proven track record of delivering projects on time and within budget.

**Responsibilities:**
- Plan, execute, and close projects according to strict deadlines
- Define project scope, goals, and deliverables
- Manage project budget and resource allocation
- Communicate project status to stakeholders
- Identify and mitigate project risks

**What We Offer:**
- Competitive salary and benefits
- Remote work options
- Professional certification support
- Dynamic work environment`,
    requirements: [
      'PMP certification preferred',
      '5+ years of project management experience',
      'Experience with Agile and Waterfall methodologies',
      'Strong leadership and team management skills',
      'Excellent verbal and written communication'
    ],
    nice_to_have: [
      'Experience in IT project management',
      'Knowledge of project management software (Jira, MS Project)',
      'Six Sigma certification',
      'MBA or relevant advanced degree'
    ],
    employment_type: 'direct_placement',
    rate_type: 'annual',
    remote_policy: 'remote'
  }
];

export default function JobEditor({ jobId }: JobEditorProps) {
  const [job, setJob] = useState<Job>({
    title: '',
    description: '',
    requirements: [],
    nice_to_have: [],
    location: '',
    remote_policy: 'hybrid',
    rate_type: 'hourly',
    employment_type: 'contract',
    status: 'draft',
    priority: 'warm',
    openings: 1,
    tags: [],
    notes: ''
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [niceToHaveInput, setNiceToHaveInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [needsApproval, setNeedsApproval] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const supabase = useMemo(() => createClient(), []);

  // Load template if specified
  useEffect(() => {
    if (templateId && !jobId) {
      const template = jobTemplates.find(t => t.id === templateId);
      if (template) {
        setJob(prev => ({
          ...prev,
          title: template.title,
          description: template.description,
          requirements: template.requirements,
          nice_to_have: template.nice_to_have,
          employment_type: template.employment_type as any,
          rate_type: template.rate_type as any,
          remote_policy: template.remote_policy as any
        }));
        toast.success('Template loaded successfully');
      }
    }
  }, [templateId, jobId]);

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  // Load existing job if editing
  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .order('company_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
          }
  };

  const loadJob = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      setJob({
        ...data,
        requirements: data.requirements || [],
        nice_to_have: data.nice_to_have || [],
        tags: data.tags || [],
        target_fill_date: data.target_fill_date ? new Date(data.target_fill_date) : null
      });
    } catch (error) {
            toast.error('Failed to load job');
      router.push('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  // Add requirement
  const addRequirement = () => {
    if (requirementInput.trim() && !job.requirements.includes(requirementInput.trim())) {
      setJob(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  // Add nice to have
  const addNiceToHave = () => {
    if (niceToHaveInput.trim() && !job.nice_to_have.includes(niceToHaveInput.trim())) {
      setJob(prev => ({
        ...prev,
        nice_to_have: [...prev.nice_to_have, niceToHaveInput.trim()]
      }));
      setNiceToHaveInput('');
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !job.tags.includes(tagInput.trim())) {
      setJob(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Calculate if approval is needed
  useEffect(() => {
    // Check if job requires approval based on business rules
    const requiresApproval = 
      (job.rate_type === 'hourly' && job.rate_max && job.rate_max > 150) ||
      (job.rate_type === 'annual' && job.rate_max && job.rate_max > 200000) ||
      job.priority === 'hot' ||
      job.openings > 5;
    
    setNeedsApproval(requiresApproval);
  }, [job]);

  // Handle save
  const handleSave = async (publish: boolean = false) => {
    if (!job.title || !job.description) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const saveData: any = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        nice_to_have: job.nice_to_have,
        client_id: job.client_id || null,
        location: job.location,
        remote_policy: job.remote_policy,
        rate_type: job.rate_type,
        rate_min: job.rate_min || null,
        rate_max: job.rate_max || null,
        employment_type: job.employment_type,
        duration_months: job.duration_months || null,
        status: publish ? 'open' : job.status,
        priority: job.priority,
        openings: job.openings,
        target_fill_date: job.target_fill_date?.toISOString() || null,
        tags: job.tags,
        notes: job.notes
      };

      if (publish && !jobId) {
        saveData.posted_date = new Date().toISOString();
      }

      if (jobId) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(saveData)
          .eq('id', jobId);

        if (error) throw error;

        toast.success(publish ? 'Job published!' : 'Job saved!');
      } else {
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert(saveData)
          .select()
          .single();

        if (error) throw error;

        toast.success(publish ? 'Job published!' : 'Job created!');
        router.push(`/admin/jobs/${data.id}/edit`);
      }
    } catch (error) {
            toast.error('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {jobId ? 'Edit Job' : 'Create New Job'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {needsApproval && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Requires Approval
            </Badge>
          )}
          <AIAssistantWidget
            contentType="job_description"
            onContentGenerated={(content) => setJob({ ...job, description: content })}
            currentContent={job.description}
            currentTitle={job.title}
          />
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-2" />
            {needsApproval ? 'Submit for Approval' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={job.title}
                  onChange={(e) => setJob({ ...job, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client Company</Label>
                  <Select
                    value={job.client_id}
                    onValueChange={(value) => setJob({ ...job, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Client</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type</Label>
                  <Select
                    value={job.employment_type}
                    onValueChange={(value: any) => setJob({ ...job, employment_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="contract_to_hire">Contract to Hire</SelectItem>
                      <SelectItem value="direct_placement">Direct Placement</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={job.location}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remote-policy">Remote Policy</Label>
                  <Select
                    value={job.remote_policy}
                    onValueChange={(value: any) => setJob({ ...job, remote_policy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {job.employment_type === 'contract' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Contract Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={job.duration_months || ''}
                    onChange={(e) => setJob({ ...job, duration_months: parseInt(e.target.value) || undefined })}
                    placeholder="e.g., 6"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Description *</CardTitle>
              <CardDescription>
                Provide a detailed description of the role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={job.description}
                onChange={(content) => setJob({ ...job, description: content })}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                height="400px"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Qualifications</CardTitle>
              <CardDescription>
                List the must-have skills and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span className="flex-1">{req}</span>
                    <button
                      onClick={() => setJob(prev => ({
                        ...prev,
                        requirements: prev.requirements.filter((_, i) => i !== idx)
                      }))}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nice to Have</CardTitle>
              <CardDescription>
                Additional qualifications that would be beneficial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={niceToHaveInput}
                  onChange={(e) => setNiceToHaveInput(e.target.value)}
                  placeholder="Add a nice-to-have..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceToHave())}
                />
                <Button onClick={addNiceToHave} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {job.nice_to_have.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-blue-50 p-2 rounded">
                    <Plus className="w-5 h-5 text-blue-600 mt-0.5" />
                    <span className="flex-1">{item}</span>
                    <button
                      onClick={() => setJob(prev => ({
                        ...prev,
                        nice_to_have: prev.nice_to_have.filter((_, i) => i !== idx)
                      }))}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compensation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-type">Rate Type</Label>
                <Select
                  value={job.rate_type}
                  onValueChange={(value: any) => setJob({ ...job, rate_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="annual">Annual Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate-min">
                    Minimum {job.rate_type === 'hourly' ? 'Rate' : 'Salary'}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="rate-min"
                      type="number"
                      value={job.rate_min || ''}
                      onChange={(e) => setJob({ ...job, rate_min: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-max">
                    Maximum {job.rate_type === 'hourly' ? 'Rate' : 'Salary'}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="rate-max"
                      type="number"
                      value={job.rate_max || ''}
                      onChange={(e) => setJob({ ...job, rate_max: parseInt(e.target.value) || undefined })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {needsApproval && job.rate_max && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-900">Approval Required</p>
                      <p className="text-orange-700 mt-1">
                        {job.rate_type === 'hourly' && job.rate_max > 150
                          ? 'Hourly rate exceeds $150/hr threshold'
                          : job.rate_type === 'annual' && job.rate_max > 200000
                          ? 'Annual salary exceeds $200k threshold'
                          : 'This job requires management approval'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={job.priority}
                    onValueChange={(value: any) => setJob({ ...job, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">Hot - Urgent</SelectItem>
                      <SelectItem value="warm">Warm - Normal</SelectItem>
                      <SelectItem value="cold">Cold - Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openings">Number of Openings</Label>
                  <Input
                    id="openings"
                    type="number"
                    value={job.openings}
                    onChange={(e) => setJob({ ...job, openings: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-date">Target Fill Date</Label>
                <DatePicker
                  value={job.target_fill_date}
                  onChange={(date) => setJob({ ...job, target_fill_date: date })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                      <button
                        onClick={() => setJob(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== idx)
                        }))}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={job.notes}
                  onChange={(e) => setJob({ ...job, notes: e.target.value })}
                  placeholder="Any additional notes or special instructions..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
