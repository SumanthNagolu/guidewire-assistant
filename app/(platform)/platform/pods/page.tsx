"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Plus, Users, Target, TrendingUp, AlertCircle } from 'lucide-react';
interface Pod {
  id: string;
  name: string;
  type: 'recruiting' | 'bench_sales' | 'talent_acquisition';
  status: 'active' | 'inactive' | 'on_hold';
  manager_id: string;
  manager?: {
    first_name: string;
    last_name: string;
  };
  member_count?: number;
  current_sprint_progress?: number;
  target_placements_per_sprint: number;
  target_interviews_per_sprint: number;
  target_submissions_per_sprint: number;
}
export default function PodsPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPod, setNewPod] = useState({
    name: '',
    type: 'recruiting' as Pod['type'],
    manager_id: '',
  });
  useEffect(() => {
    fetchPods();
  }, []);
  const fetchPods = async () => {
    try {
      const { data, error } = await supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!manager_id(first_name, last_name),
          pod_members(count)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPods(data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const createPod = async () => {
    try {
      const { data, error } = await supabase
        .from('pods')
        .insert([newPod])
        .select()
        .single();
      if (error) throw error;
      setPods([data, ...pods]);
      setShowCreateDialog(false);
      setNewPod({ name: '', type: 'recruiting', manager_id: '' });
    } catch (error) {
      }
  };
  const getPodTypeColor = (type: Pod['type']) => {
    switch (type) {
      case 'recruiting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'bench_sales':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'talent_acquisition':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };
  const getStatusColor = (status: Pod['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'on_hold':
        return 'destructive';
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
          <h2 className="text-3xl font-bold tracking-tight">Pod Management</h2>
          <p className="text-muted-foreground">
            Manage your teams and their performance
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Pod
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pod</DialogTitle>
              <DialogDescription>
                Set up a new pod for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPod.name}
                  onChange={(e) => setNewPod({ ...newPod, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Alpha Recruiting Pod"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newPod.type}
                  onValueChange={(value) => setNewPod({ ...newPod, type: value as Pod['type'] })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruiting">Recruiting</SelectItem>
                    <SelectItem value="bench_sales">Bench Sales</SelectItem>
                    <SelectItem value="talent_acquisition">Talent Acquisition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createPod}>Create Pod</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Pod Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pods</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pods.length}</div>
            <p className="text-xs text-muted-foreground">
              {pods.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last sprint
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Pods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pods</CardTitle>
          <CardDescription>
            Click on a pod to view details and manage members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Sprint Targets</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pods.map((pod) => (
                <TableRow 
                  key={pod.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => router.push(`/platform/pods/${pod.id}`)}
                >
                  <TableCell className="font-medium">{pod.name}</TableCell>
                  <TableCell>
                    <Badge className={getPodTypeColor(pod.type)}>
                      {pod.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(pod.status)}>
                      {pod.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pod.manager ? 
                      `${pod.manager.first_name} ${pod.manager.last_name}` : 
                      'Unassigned'
                    }
                  </TableCell>
                  <TableCell>{pod.member_count || 0}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>Placements: {pod.target_placements_per_sprint}</div>
                      <div>Interviews: {pod.target_interviews_per_sprint}</div>
                      <div>Submissions: {pod.target_submissions_per_sprint}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={pod.current_sprint_progress || 0} className="w-16" />
                      <span className="text-xs text-muted-foreground">
                        {pod.current_sprint_progress || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
