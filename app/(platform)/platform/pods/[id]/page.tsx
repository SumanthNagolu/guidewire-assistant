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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Clock,
  Plus,
  UserPlus,
  Settings,
  BarChart,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
interface PodMember {
  id: string;
  user_id: string;
  role: 'manager' | 'account_manager' | 'screener' | 'sourcer';
  is_active: boolean;
  joined_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  daily_metrics?: {
    submissions_made: number;
    calls_made: number;
    interviews_scheduled: number;
  };
}
interface PodDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  target_placements_per_sprint: number;
  target_interviews_per_sprint: number;
  target_submissions_per_sprint: number;
  manager: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
interface PodMetrics {
  current_sprint_progress: number;
  total_submissions: number;
  total_interviews: number;
  total_placements: number;
  active_jobs: number;
  bottlenecks: number;
}
export default function PodDetailPage() {
  const { id } = useParams();
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [pod, setPod] = useState<PodDetails | null>(null);
  const [members, setMembers] = useState<PodMember[]>([]);
  const [metrics, setMetrics] = useState<PodMetrics>({
    current_sprint_progress: 0,
    total_submissions: 0,
    total_interviews: 0,
    total_placements: 0,
    active_jobs: 0,
    bottlenecks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('sourcer');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  useEffect(() => {
    fetchPodDetails();
    fetchPodMembers();
    fetchPodMetrics();
    fetchAvailableUsers();
  }, [id]);
  const fetchPodDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('pods')
        .select(`
          *,
          manager:user_profiles!manager_id(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      setPod(data);
    } catch (error) {
      }
  };
  const fetchPodMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('pod_members')
        .select(`
          *,
          user:user_profiles!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .eq('pod_id', id)
        .eq('is_active', true);
      if (error) throw error;
      // Fetch today's metrics for each member
      const membersWithMetrics = await Promise.all(
        (data || []).map(async (member) => {
          const { data: metricsData } = await supabase
            .from('daily_metrics')
            .select('submissions_made, calls_made, interviews_scheduled')
            .eq('user_id', member.user_id)
            .eq('metric_date', new Date().toISOString().split('T')[0])
            .single();
          return {
            ...member,
            daily_metrics: metricsData || {
              submissions_made: 0,
              calls_made: 0,
              interviews_scheduled: 0,
            }
          };
        })
      );
      setMembers(membersWithMetrics);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const fetchPodMetrics = async () => {
    try {
      // Fetch current sprint progress
      const { data: sprintData } = await supabase
        .from('jd_assignments')
        .select('*')
        .eq('pod_id', id)
        .gte('assigned_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
      const totalAssignments = sprintData?.length || 0;
      const completedAssignments = sprintData?.filter(a => a.status === 'completed').length || 0;
      const progress = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      // Fetch other metrics
      const { count: activeJobs } = await supabase
        .from('jd_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('pod_id', id)
        .in('status', ['assigned', 'sourcing', 'screening']);
      const { count: bottlenecks } = await supabase
        .from('bottleneck_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to_pod', id)
        .eq('status', 'open');
      setMetrics({
        current_sprint_progress: Math.round(progress),
        total_submissions: sprintData?.reduce((sum, a) => sum + (a.candidates_submitted || 0), 0) || 0,
        total_interviews: 12,         total_placements: 2,         active_jobs: activeJobs || 0,
        bottlenecks: bottlenecks || 0,
      });
    } catch (error) {
      }
  };
  const fetchAvailableUsers = async () => {
    try {
      // Fetch users who are not already in any pod
      const { data: existingMembers } = await supabase
        .from('pod_members')
        .select('user_id')
        .eq('is_active', true);
      const existingUserIds = existingMembers?.map(m => m.user_id) || [];
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, role')
        .in('role', ['recruiter', 'sourcer', 'screener', 'account_manager'])
        .not('id', 'in', `(${existingUserIds.join(',')})`)
        .order('first_name');
      setAvailableUsers(users || []);
    } catch (error) {
      }
  };
  const addMember = async () => {
    if (!selectedUserId || !selectedRole) return;
    try {
      const { error } = await supabase
        .from('pod_members')
        .insert([{
          pod_id: id,
          user_id: selectedUserId,
          role: selectedRole,
          is_active: true,
        }]);
      if (error) throw error;
      // Refresh members list
      fetchPodMembers();
      fetchAvailableUsers();
      setShowAddMemberDialog(false);
      setSelectedUserId('');
      setSelectedRole('sourcer');
    } catch (error) {
      }
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'account_manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'screener':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sourcer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pod?.name}</h2>
          <p className="text-muted-foreground mt-1">
            {pod?.description || `${pod?.type} pod managed by ${pod?.manager.first_name} ${pod?.manager.last_name}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/platform/pods/${id}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.current_sprint_progress}%</div>
            <Progress value={metrics.current_sprint_progress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_submissions}</div>
            <p className="text-xs text-muted-foreground">This sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_interviews}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_placements}</div>
            <p className="text-xs text-muted-foreground">This sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_jobs}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bottlenecks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>
      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your pod members and their roles
                  </CardDescription>
                </div>
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Select a user and assign their role in the pod
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="user" className="text-right">
                          User
                        </Label>
                        <Select
                          value={selectedUserId}
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account_manager">Account Manager</SelectItem>
                            <SelectItem value="screener">Screener</SelectItem>
                            <SelectItem value="sourcer">Sourcer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={addMember}>Add Member</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Today's Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatar_url} />
                            <AvatarFallback>
                              {member.user.first_name[0]}{member.user.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.first_name} {member.user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Submissions: {member.daily_metrics?.submissions_made || 0}</div>
                          <div>Calls: {member.daily_metrics?.calls_made || 0}</div>
                          <div>Interviews: {member.daily_metrics?.interviews_scheduled || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Track your pod's performance against targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Placements</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.total_placements} / {pod?.target_placements_per_sprint}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.total_placements / (pod?.target_placements_per_sprint || 1)) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Interviews</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.total_interviews} / {pod?.target_interviews_per_sprint}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.total_interviews / (pod?.target_interviews_per_sprint || 1)) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Submissions</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.total_submissions} / {pod?.target_submissions_per_sprint}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.total_submissions / (pod?.target_submissions_per_sprint || 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Assignments</CardTitle>
              <CardDescription>
                Jobs currently being worked on by your pod
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Job assignments will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Pod Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights for your pod
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
