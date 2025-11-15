'use client';

import React, { useState, useMemo } from 'react';
import { 
  Shield,
  Users,
  Search,
  Filter,
  Edit2,
  Eye,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title: string | null;
  changes: any;
  user_id: string;
  user_email: string | null;
  ip_address: string | null;
  created_at: string;
}

interface PermissionManagementProps {
  initialUsers: User[];
  initialAuditLogs: AuditLog[];
}

const roles = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200', permissions: 'Full access to all features' },
  { value: 'recruiter', label: 'Recruiter', color: 'bg-blue-100 text-blue-700 border-blue-200', permissions: 'Manage jobs, candidates, placements' },
  { value: 'sales', label: 'Sales', color: 'bg-green-100 text-green-700 border-green-200', permissions: 'Manage clients, opportunities' },
  { value: 'account_manager', label: 'Account Manager', color: 'bg-purple-100 text-purple-700 border-purple-200', permissions: 'Manage client accounts, placements' },
  { value: 'operations', label: 'Operations', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', permissions: 'View all, manage timesheets' },
  { value: 'employee', label: 'Employee', color: 'bg-gray-100 text-gray-700 border-gray-200', permissions: 'Limited access to employee portal' },
  { value: 'student', label: 'Student', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', permissions: 'Access to academy only' }
];

const actionIcons: Record<string, any> = {
  create: CheckCircle,
  update: Edit2,
  delete: XCircle,
  publish: Eye,
  archive: FileText
};

const actionColors: Record<string, string> = {
  create: 'text-green-600',
  update: 'text-blue-600',
  delete: 'text-red-600',
  publish: 'text-purple-600',
  archive: 'text-gray-600'
};

export default function PermissionManagement({ initialUsers, initialAuditLogs }: PermissionManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditEntityFilter, setAuditEntityFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  const supabase = useMemo(() => createClient(), []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.entity_title?.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(auditSearchTerm.toLowerCase());
      
      const matchesAction = auditActionFilter === 'all' || log.action === auditActionFilter;
      const matchesEntity = auditEntityFilter === 'all' || log.entity_type === auditEntityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [auditLogs, auditSearchTerm, auditActionFilter, auditEntityFilter]);

  // Get role statistics
  const roleStats = useMemo(() => {
    return roles.map(role => ({
      ...role,
      count: users.filter(u => u.role === role.value).length
    }));
  }, [users]);

  // Get audit statistics
  const auditStats = useMemo(() => {
    const last24h = auditLogs.filter(log => {
      const logDate = new Date(log.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return logDate > dayAgo;
    }).length;

    const creates = auditLogs.filter(log => log.action === 'create').length;
    const updates = auditLogs.filter(log => log.action === 'update').length;
    const deletes = auditLogs.filter(log => log.action === 'delete').length;

    return { last24h, creates, updates, deletes };
  }, [auditLogs]);

  // Handle role update
  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', editingUser.id);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, role: newRole } : u
      ));
      
      setEditingUser(null);
      setNewRole('');
      toast.success('User role updated successfully');
    } catch (error) {
            toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return roles.find(r => r.value === roleValue) || roles[5]; // Default to employee
  };

  return (
    <Tabs defaultValue="roles" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="audit">Audit Log</TabsTrigger>
      </TabsList>

      {/* Roles & Permissions Tab */}
      <TabsContent value="roles" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Definitions</CardTitle>
            <CardDescription>
              Overview of all roles and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleStats.map((role) => (
                <div key={role.value} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className={role.color}>
                          {role.label}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {role.count} {role.count === 1 ? 'user' : 'users'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{role.permissions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Feature</th>
                    <th className="text-center p-3 font-medium">Admin</th>
                    <th className="text-center p-3 font-medium">Recruiter</th>
                    <th className="text-center p-3 font-medium">Sales</th>
                    <th className="text-center p-3 font-medium">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Blog Management</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Job Posting</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Talent Management</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Course Builder</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">Analytics Dashboard</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                    <td className="text-center p-3"><Eye className="w-5 h-5 text-blue-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3">User Permissions</td>
                    <td className="text-center p-3"><CheckCircle className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                    <td className="text-center p-3"><XCircle className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Full Access
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-blue-600" />
                Read Only
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-gray-300" />
                No Access
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* User Management Tab */}
      <TabsContent value="users" className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          {roleStats.slice(0, 3).map(role => (
            <Card key={role.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{role.label}s</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{role.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                            {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : 'No name'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Audit Log Tab */}
      <TabsContent value="audit" className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.last24h}</div>
              <p className="text-xs text-muted-foreground">actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creates</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.creates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Updates</CardTitle>
              <Edit2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.updates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deletes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.deletes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search audit logs..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={auditEntityFilter} onValueChange={setAuditEntityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Track all admin actions for security and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredAuditLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No audit logs found</p>
              ) : (
                filteredAuditLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action] || Activity;
                  const actionColor = actionColors[log.action] || 'text-gray-600';

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className={`mt-1 ${actionColor}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {log.action}
                          </Badge>
                          <Badge variant="outline">
                            {log.entity_type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.entity_title || `Unnamed ${log.entity_type}`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for this user
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">User</p>
                <p className="text-gray-600">
                  {editingUser.first_name && editingUser.last_name 
                    ? `${editingUser.first_name} ${editingUser.last_name}`
                    : editingUser.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newRole && (
                  <p className="text-xs text-gray-600">
                    {getRoleInfo(newRole).permissions}
                  </p>
                )}
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-900">
                    Changing a user's role will immediately affect their access permissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={loading || !newRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Action</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedLog.action}
                    </Badge>
                    <Badge variant="outline">
                      {selectedLog.entity_type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Entity</p>
                  <p className="text-sm">{selectedLog.entity_title || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">User</p>
                  <p className="text-sm">{selectedLog.user_email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Timestamp</p>
                  <p className="text-sm">
                    {format(new Date(selectedLog.created_at), 'PPpp')}
                  </p>
                </div>

                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">IP Address</p>
                    <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}

                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Changes</p>
                    <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}


