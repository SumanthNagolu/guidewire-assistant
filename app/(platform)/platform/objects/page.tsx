"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Briefcase,
  Users,
  FileText,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
interface UnifiedObject {
  id: string;
  type: 'job' | 'candidate' | 'lead' | 'training';
  name: string;
  status: string;
  stage?: string;
  assigned_to?: string;
  assignee?: {
    first_name: string;
    last_name: string;
  };
  workflow?: {
    status: string;
    completion_percentage: number;
  };
  metadata: any;
  created_at: string;
  updated_at: string;
}
interface ObjectStats {
  total_objects: number;
  active_workflows: number;
  completed_today: number;
  bottlenecks: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}
export default function ObjectsPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [objects, setObjects] = useState<UnifiedObject[]>([]);
  const [stats, setStats] = useState<ObjectStats>({
    total_objects: 0,
    active_workflows: 0,
    completed_today: 0,
    bottlenecks: 0,
    by_type: {},
    by_status: {},
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  useEffect(() => {
    fetchObjects();
    fetchStats();
  }, [typeFilter, statusFilter]);
  const fetchObjects = async () => {
    try {
      // For now, we'll fetch jobs and candidates separately
      // In a full implementation, this would use the unified objects table
      const promises = [];
      // Fetch jobs
      if (typeFilter === 'all' || typeFilter === 'job') {
        promises.push(
          supabase
            .from('jobs')
            .select(`
              id,
              title,
              status,
              created_at,
              updated_at,
              workflow_instances!inner(
                status,
                completion_percentage
              )
            `)
            .order('created_at', { ascending: false })
            .limit(50)
        );
      }
      // Fetch candidates
      if (typeFilter === 'all' || typeFilter === 'candidate') {
        promises.push(
          supabase
            .from('candidates')
            .select(`
              id,
              first_name,
              last_name,
              status,
              created_at,
              updated_at
            `)
            .order('created_at', { ascending: false })
            .limit(50)
        );
      }
      const results = await Promise.all(promises);
      const allObjects: UnifiedObject[] = [];
      // Process jobs
      if (results[0]?.data) {
        results[0].data.forEach((job: any) => {
          allObjects.push({
            id: job.id,
            type: 'job',
            name: job.title,
            status: job.status,
            workflow: job.workflow_instances?.[0],
            metadata: job,
            created_at: job.created_at,
            updated_at: job.updated_at,
          });
        });
      }
      // Process candidates
      if (results[1]?.data) {
        results[1].data.forEach((candidate: any) => {
          allObjects.push({
            id: candidate.id,
            type: 'candidate',
            name: `${candidate.first_name} ${candidate.last_name}`,
            status: candidate.status,
            metadata: candidate,
            created_at: candidate.created_at,
            updated_at: candidate.updated_at,
          });
        });
      }
      setObjects(allObjects);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const fetchStats = async () => {
    try {
      // Fetch various stats
      const { count: activeWorkflows } = await supabase
        .from('workflow_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      const { count: completedToday } = await supabase
        .from('workflow_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date().toISOString().split('T')[0]);
      const { count: bottlenecks } = await supabase
        .from('bottleneck_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      setStats({
        total_objects: objects.length,
        active_workflows: activeWorkflows || 0,
        completed_today: completedToday || 0,
        bottlenecks: bottlenecks || 0,
        by_type: {
          job: objects.filter(o => o.type === 'job').length,
          candidate: objects.filter(o => o.type === 'candidate').length,
        },
        by_status: {
          active: objects.filter(o => o.status === 'active').length,
          completed: objects.filter(o => o.status === 'completed').length,
        },
      });
    } catch (error) {
      }
  };
  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'job':
        return Briefcase;
      case 'candidate':
        return Users;
      case 'lead':
        return Target;
      case 'training':
        return FileText;
      default:
        return FileText;
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'candidate':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'training':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
      case 'filled':
      case 'placed':
        return 'success';
      case 'on_hold':
      case 'paused':
        return 'secondary';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  const filteredObjects = objects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || obj.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'with_workflows' && obj.workflow) ||
                       (activeTab === 'without_workflows' && !obj.workflow);
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });
  const navigateToObject = (obj: UnifiedObject) => {
    switch (obj.type) {
      case 'job':
        router.push(`/platform/jobs/${obj.id}`);
        break;
      case 'candidate':
        router.push(`/platform/candidates/${obj.id}`);
        break;
      default:
        break;
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
          <h2 className="text-3xl font-bold tracking-tight">Object Lifecycle Management</h2>
          <p className="text-muted-foreground">
            Unified view of all objects and their workflows
          </p>
        </div>
        <Button onClick={() => router.push('/platform/objects/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Object
        </Button>
      </div>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Objects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_objects}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Object.entries(stats.by_type).map(([type, count]) => (
                <span key={type} className="mr-2">
                  {type}: {count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_workflows}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed_today}</div>
            <p className="text-xs text-muted-foreground">Workflows finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bottlenecks}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
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
                  placeholder="Search objects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="job">Jobs</SelectItem>
                <SelectItem value="candidate">Candidates</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Objects Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Objects</TabsTrigger>
          <TabsTrigger value="with_workflows">With Workflows</TabsTrigger>
          <TabsTrigger value="without_workflows">Without Workflows</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Objects</CardTitle>
              <CardDescription>
                Click on an object to view details and manage its lifecycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredObjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No objects found</p>
                  {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setTypeFilter('all');
                        setStatusFilter('all');
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
                      <TableHead>Object</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredObjects.map((obj) => {
                      const Icon = getObjectIcon(obj.type);
                      return (
                        <TableRow
                          key={obj.id}
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => navigateToObject(obj)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{obj.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(obj.type)}>
                              {obj.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(obj.status)}>
                              {obj.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {obj.workflow ? (
                              <Badge variant={getStatusColor(obj.workflow.status)}>
                                {obj.workflow.status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No workflow</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {obj.workflow ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${obj.workflow.completion_percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">
                                  {obj.workflow.completion_percentage}%
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(obj.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {!obj.workflow && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  router.push(`/platform/workflows/start?type=${obj.type}&${obj.type}Id=${obj.id}&name=${encodeURIComponent(obj.name)}`);
                                }}
                              >
                                Start Workflow
                              </Button>
                            )}
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
      </Tabs>
    </div>
  );
}
