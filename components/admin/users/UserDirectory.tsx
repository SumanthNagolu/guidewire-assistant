'use client';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Edit, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
  region?: string;
  stream?: string;
  location?: string;
  job_title?: string;
  created_at: string;
  team_id?: string;
  teams?: { name: string } | null;
};

type Team = {
  id: string;
  name: string;
};

type Props = {
  initialUsers: User[];
  teams: Team[];
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  recruiter: 'bg-blue-100 text-blue-800',
  sales: 'bg-green-100 text-green-800',
  account_manager: 'bg-yellow-100 text-yellow-800',
  operations: 'bg-orange-100 text-orange-800',
  hr: 'bg-pink-100 text-pink-800',
  employee: 'bg-gray-100 text-gray-800',
  student: 'bg-indigo-100 text-indigo-800',
  candidate: 'bg-emerald-100 text-emerald-800',
  client: 'bg-rose-100 text-rose-800',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  recruiter: 'Recruiter',
  sales: 'Sales',
  account_manager: 'Account Manager',
  operations: 'Operations',
  hr: 'HR',
  employee: 'Employee',
  student: 'Student',
  candidate: 'Candidate',
  client: 'Client',
};

export default function UserDirectory({ initialUsers, teams }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Team filter
      const matchesTeam =
        teamFilter === 'all' || user.team_id === teamFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesTeam && matchesStatus;
    });
  }, [initialUsers, searchQuery, roleFilter, teamFilter, statusFilter]);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Role', 'Team', 'Phone', 'Status', 'Region', 'Location'];
    const rows = filteredUsers.map((user) => [
      user.full_name || '',
      user.email,
      ROLE_LABELS[user.role] || user.role,
      user.teams?.name || '',
      user.phone || '',
      user.is_active ? 'Active' : 'Inactive',
      user.region || '',
      user.location || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Users exported successfully');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="account_manager">Account Manager</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>

        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {initialUsers.length} users
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{user.full_name || 'N/A'}</div>
                      {user.job_title && (
                        <div className="text-xs text-gray-500">{user.job_title}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.teams?.name || (
                      <span className="text-gray-400 text-sm">No team</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.location || user.region || (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600 border-gray-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Welcome Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

