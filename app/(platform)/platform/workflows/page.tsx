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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Plus, Workflow, Settings, Copy, Trash2, Search } from 'lucide-react';
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  is_system: boolean;
  version: number;
  stages: any[];
  created_at: string;
  created_by: string;
  creator?: {
    first_name: string;
    last_name: string;
  };
}
export default function WorkflowsPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  useEffect(() => {
    fetchWorkflowTemplates();
  }, []);
  const fetchWorkflowTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(`
          *,
          creator:user_profiles!created_by(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      recruiting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      bench_sales: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      training: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sales: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      talent_acquisition: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || colors.custom;
  };
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const duplicateTemplate = async (template: WorkflowTemplate) => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert([{
          ...template,
          id: undefined,
          name: `${template.name} (Copy)`,
          is_system: false,
          created_by: user?.id,
          created_at: undefined,
          updated_at: undefined,
        }])
        .select()
        .single();
      if (error) throw error;
      await fetchWorkflowTemplates();
    } catch (error) {
      }
  };
  const deleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow template?')) {
      try {
        const { error } = await supabase
          .from('workflow_templates')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setTemplates(templates.filter(t => t.id !== id));
      } catch (error) {
        }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflow Templates</h2>
          <p className="text-muted-foreground">
            Create and manage workflow templates for your organization
          </p>
        </div>
        <Button onClick={() => router.push('/platform/workflows/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
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
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Click on a template to view or edit it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No workflow templates found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/platform/workflows/new')}
              >
                Create your first template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stages</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow
                    key={template.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => router.push(`/platform/workflows/${template.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.stages?.length || 0}</TableCell>
                    <TableCell>v{template.version}</TableCell>
                    <TableCell>
                      {template.is_system ? (
                        <Badge variant="secondary">System</Badge>
                      ) : template.creator ? (
                        `${template.creator.first_name} ${template.creator.last_name}`
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateTemplate(template)}
                          title="Duplicate template"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!template.is_system && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTemplate(template.id)}
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Start a new workflow instance from a template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-6 space-y-2"
              onClick={() => router.push('/platform/workflows/start?type=job')}
            >
              <Workflow className="h-8 w-8 text-blue-600" />
              <span className="font-medium">New Job Workflow</span>
              <span className="text-sm text-muted-foreground">Start recruiting process</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-6 space-y-2"
              onClick={() => router.push('/platform/workflows/start?type=candidate')}
            >
              <Workflow className="h-8 w-8 text-green-600" />
              <span className="font-medium">New Candidate Workflow</span>
              <span className="text-sm text-muted-foreground">Process bench candidate</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-6 space-y-2"
              onClick={() => router.push('/platform/workflows/start?type=training')}
            >
              <Workflow className="h-8 w-8 text-purple-600" />
              <span className="font-medium">New Training Workflow</span>
              <span className="text-sm text-muted-foreground">Onboard new hire</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
