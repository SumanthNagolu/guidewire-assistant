"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { WorkflowDesigner } from '@/components/platform/workflow-designer';
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
import { ArrowLeft, Save } from 'lucide-react';
export default function NewWorkflowPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    category: 'recruiting',
    stages: [],
    transitions: [],
    designer_data: {},
  });
  const handleSave = async () => {
    if (!template.name) {
      alert('Please provide a name for the workflow template');
      return;
    }
    if (template.stages.length === 0) {
      alert('Please add at least one stage to the workflow');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert([{
          ...template,
          created_by: user?.id,
          is_active: true,
          is_system: false,
          version: 1,
        }])
        .select()
        .single();
      if (error) throw error;
      router.push(`/platform/workflows/${data.id}`);
    } catch (error) {
      alert('Failed to create workflow template');
    } finally {
      setLoading(false);
    }
  };
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
            <h2 className="text-3xl font-bold tracking-tight">Create Workflow Template</h2>
            <p className="text-muted-foreground">
              Design a new workflow template for your organization
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Basic information about the workflow template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="e.g., Standard Recruiting Process"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                placeholder="Describe the purpose and process of this workflow"
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
          </CardContent>
        </Card>
        {/* Workflow Designer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workflow Designer</CardTitle>
            <CardDescription>
              Drag and drop stages to design your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowDesigner
              stages={template.stages}
              transitions={template.transitions}
              designerData={template.designer_data}
              onChange={(stages, transitions, designerData) => {
                setTemplate({
                  ...template,
                  stages,
                  transitions,
                  designer_data: designerData,
                });
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
