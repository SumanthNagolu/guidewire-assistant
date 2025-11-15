"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { WorkflowDesigner } from '@/components/platform/workflow-designer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ArrowLeft,
  Save,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
} from 'lucide-react';
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_system: boolean;
  version: number;
  stages: any[];
  transitions: any[];
  designer_data: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  creator?: {
    first_name: string;
    last_name: string;
  };
}
interface WorkflowInstance {
  id: string;
  name: string;
  current_stage: string;
  status: string;
  completion_percentage: number;
  created_at: string;
  owner?: {
    first_name: string;
    last_name: string;
  };
}
export default function WorkflowDetailPage() {
  const { id } = useParams();
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    fetchWorkflowTemplate();
    fetchWorkflowInstances();
  }, [id]);
  const fetchWorkflowTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(`
          *,
          creator:user_profiles!created_by(first_name, last_name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setTemplate(data);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const fetchWorkflowInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          owner:user_profiles!owner_id(first_name, last_name)
        `)
        .eq('template_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      }
  };
  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .update({
          name: template.name,
          description: template.description,
          category: template.category,
          is_active: template.is_active,
          stages: template.stages,
          transitions: template.transitions,
          designer_data: template.designer_data,
          version: template.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id);
      if (error) throw error;
      setEditMode(false);
      await fetchWorkflowTemplate();
    } catch (error) {
      alert('Failed to save workflow template');
    } finally {
      setSaving(false);
    }
  };
  const startNewInstance = () => {
    router.push(`/platform/workflows/start?templateId=${id}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'paused':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Play;
      case 'completed':
        return CheckCircle;
      case 'failed':
        return AlertCircle;
      case 'paused':
        return Clock;
      default:
        return Clock;
    }
  };
  if (loading || !template) {
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
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{template.name}</h2>
              {template.is_system && (
                <Badge variant="secondary">System</Badge>
              )}
              <Badge variant={template.is_active ? 'default' : 'secondary'}>
                {template.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startNewInstance}>
            <Play className="mr-2 h-4 w-4" />
            Start New Instance
          </Button>
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  fetchWorkflowTemplate();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} disabled={template.is_system}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Template
            </Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="designer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Workflow Designer</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="instances">Recent Instances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Designer Tab */}
        <TabsContent value="designer">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Stages</CardTitle>
              <CardDescription>
                {editMode
                  ? 'Drag and drop to reorganize stages or click to edit'
                  : 'Visual representation of the workflow process'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowDesigner
                stages={template.stages}
                transitions={template.transitions}
                designerData={template.designer_data}
                onChange={(stages, transitions, designerData) => {
                  if (editMode) {
                    setTemplate({
                      ...template,
                      stages,
                      transitions,
                      designer_data: designerData,
                    });
                  }
                }}
                readOnly={!editMode}
              />
            </CardContent>
          </Card>
        </TabsContent>
        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Configuration and metadata for this workflow template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={template.category}
                      onValueChange={(value) => setTemplate({ ...template, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiting">Recruiting</SelectItem>
                        <SelectItem value="bench_sales">Bench Sales</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="talent_acquisition">Talent Acquisition</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={template.is_active}
                      onCheckedChange={(checked) => setTemplate({ ...template, is_active: checked })}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{template.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Version</Label>
                      <p className="font-medium">v{template.version}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created By</Label>
                      <p className="font-medium">
                        {template.creator
                          ? `${template.creator.first_name} ${template.creator.last_name}`
                          : 'System'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created At</Label>
                      <p className="font-medium">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Stages</Label>
                      <p className="font-medium">{template.stages.length}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total Transitions</Label>
                      <p className="font-medium">{template.transitions.length}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Instances Tab */}
        <TabsContent value="instances">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Instances</CardTitle>
              <CardDescription>
                Active and completed instances using this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No instances have been created yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={startNewInstance}
                  >
                    Start First Instance
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.map((instance) => {
                      const StatusIcon = getStatusIcon(instance.status);
                      return (
                        <TableRow
                          key={instance.id}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => router.push(`/platform/workflows/instances/${instance.id}`)}
                        >
                          <TableCell className="font-medium">{instance.name}</TableCell>
                          <TableCell>{instance.current_stage}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={getStatusColor(instance.status)}>
                                {instance.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{instance.completion_percentage}%</TableCell>
                          <TableCell>
                            {instance.owner
                              ? `${instance.owner.first_name} ${instance.owner.last_name}`
                              : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {new Date(instance.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Analytics dashboard coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
