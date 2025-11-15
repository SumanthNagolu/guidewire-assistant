"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Play, Search } from 'lucide-react';
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  stages: any[];
}
export default function StartWorkflowPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const type = searchParams.get('type');
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [instanceData, setInstanceData] = useState({
    name: '',
    description: '',
    pod_id: '',
    job_id: '',
    candidate_id: '',
  });
  const [pods, setPods] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  useEffect(() => {
    fetchData();
  }, [type]);
  useEffect(() => {
    if (templateId) {
      setSelectedTemplate(templateId);
    }
  }, [templateId]);
  const fetchData = async () => {
    try {
      // Fetch workflow templates
      let templateQuery = supabase
        .from('workflow_templates')
        .select('id, name, description, category, stages')
        .eq('is_active', true);
      if (type) {
        const categoryMap: Record<string, string> = {
          job: 'recruiting',
          candidate: 'bench_sales',
          training: 'training',
        };
        if (categoryMap[type]) {
          templateQuery = templateQuery.eq('category', categoryMap[type]);
        }
      }
      const { data: templatesData } = await templateQuery;
      setTemplates(templatesData || []);
      // Fetch pods
      const { data: podsData } = await supabase
        .from('pods')
        .select('id, name, type')
        .eq('status', 'active');
      setPods(podsData || []);
      // Fetch jobs if needed
      if (type === 'job' || !type) {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id, title, client_id')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);
        setJobs(jobsData || []);
      }
      // Fetch candidates if needed  
      if (type === 'candidate' || !type) {
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('id, first_name, last_name, email')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);
        setCandidates(candidatesData || []);
      }
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const startWorkflow = async () => {
    if (!selectedTemplate) {
      alert('Please select a workflow template');
      return;
    }
    if (!instanceData.name) {
      alert('Please provide a name for the workflow instance');
      return;
    }
    if (!instanceData.pod_id) {
      alert('Please assign this workflow to a pod');
      return;
    }
    setStarting(true);
    try {
      // Get the selected template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');
      // Create workflow instance
      const { data, error } = await supabase
        .from('workflow_instances')
        .insert([{
          template_id: selectedTemplate,
          name: instanceData.name,
          instance_type: type || 'custom',
          current_stage: template.stages[0]?.id || 'start',
          status: 'active',
          pod_id: instanceData.pod_id,
          owner_id: user?.id,
          job_id: instanceData.job_id || null,
          candidate_id: instanceData.candidate_id || null,
          stages_completed: 0,
          total_stages: template.stages.length,
          completion_percentage: 0,
          context_data: {
            description: instanceData.description,
          },
        }])
        .select()
        .single();
      if (error) throw error;
      // Navigate to the instance page
      router.push(`/platform/workflows/instances/${data.id}`);
    } catch (error) {
      alert('Failed to start workflow');
    } finally {
      setStarting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
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
            <h2 className="text-3xl font-bold tracking-tight">Start New Workflow</h2>
            <p className="text-muted-foreground">
              Configure and launch a new workflow instance
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Template</CardTitle>
            <CardDescription>
              Choose a workflow template to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <p className="font-medium">{template.name}</p>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {template.stages.length} stages
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Instance Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configure Instance</CardTitle>
            <CardDescription>
              Set up the details for your new workflow instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Instance Name</Label>
              <Input
                id="name"
                value={instanceData.name}
                onChange={(e) => setInstanceData({ ...instanceData, name: e.target.value })}
                placeholder="e.g., Senior Java Developer - ABC Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={instanceData.description}
                onChange={(e) => setInstanceData({ ...instanceData, description: e.target.value })}
                placeholder="Additional notes about this workflow instance"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pod">Assign to Pod</Label>
              <Select
                value={instanceData.pod_id}
                onValueChange={(value) => setInstanceData({ ...instanceData, pod_id: value })}
              >
                <SelectTrigger id="pod">
                  <SelectValue placeholder="Select a pod" />
                </SelectTrigger>
                <SelectContent>
                  {pods.map((pod) => (
                    <SelectItem key={pod.id} value={pod.id}>
                      {pod.name} ({pod.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(type === 'job' || !type) && jobs.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="job">Link to Job (Optional)</Label>
                <Select
                  value={instanceData.job_id}
                  onValueChange={(value) => setInstanceData({ ...instanceData, job_id: value })}
                >
                  <SelectTrigger id="job">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(type === 'candidate' || !type) && candidates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="candidate">Link to Candidate (Optional)</Label>
                <Select
                  value={instanceData.candidate_id}
                  onValueChange={(value) => setInstanceData({ ...instanceData, candidate_id: value })}
                >
                  <SelectTrigger id="candidate">
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name} - {candidate.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="pt-4">
              <Button
                onClick={startWorkflow}
                disabled={starting || !selectedTemplate || !instanceData.name || !instanceData.pod_id}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                {starting ? 'Starting...' : 'Start Workflow'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
