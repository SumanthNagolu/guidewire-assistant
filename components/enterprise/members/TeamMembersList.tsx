'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { trpc } from '@/lib/trpc/client'
import { Search, UserPlus, Mail, MoreVertical, Shield, Users, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TeamMembersListProps {
  organizationId: string
  userRole: string
  organizationSeats: {
    purchased: number
    used: number
  }
}

export function TeamMembersList({ organizationId, userRole, organizationSeats }: TeamMembersListProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'learner' | 'manager' | 'admin'>('learner')

  const { data: membersData, isLoading, refetch } = trpc.enterprise.getMembers.useQuery({
    organizationId,
    search,
    role: roleFilter as any,
    limit: 50,
  })

  const inviteMutation = trpc.enterprise.inviteMembers.useMutation({
    onSuccess: () => {
      toast({
        title: 'Invitation sent',
        description: 'The invitation has been sent successfully.',
      })
      setInviteDialogOpen(false)
      setInviteEmail('')
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const removeMemberMutation = trpc.enterprise.removeMember.useMutation({
    onSuccess: () => {
      toast({
        title: 'Member removed',
        description: 'The member has been removed from the organization.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove member',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const updateRoleMutation = trpc.enterprise.updateMemberRole.useMutation({
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'The member\'s role has been updated successfully.',
      })
      refetch()
    },
    onError: (error) => {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const canManageMembers = ['admin', 'owner'].includes(userRole)

  const handleInvite = () => {
    inviteMutation.mutate({
      organizationId,
      invitations: [{
        email: inviteEmail,
        role: inviteRole,
      }],
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="h-4 w-4 text-purple-600" />
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'manager':
        return <Users className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string): any => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Seat Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Seat Usage</CardTitle>
          <CardDescription>
            Your organization's current seat allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {organizationSeats.used} / {organizationSeats.purchased}
              </p>
              <p className="text-sm text-muted-foreground">
                {organizationSeats.purchased - organizationSeats.used} seats available
              </p>
            </div>
            {canManageMembers && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(value) => setInviteRole(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="learner">Learner</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail || inviteMutation.isPending}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="learner">Learners</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="owner">Owners</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading members...
              </div>
            ) : membersData?.members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members found
              </div>
            ) : (
              membersData?.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback>
                        {member.user?.first_name?.[0]}
                        {member.user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user?.first_name} {member.user?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Level {member.user?.level || 1} • {member.user?.total_xp || 0} XP
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canManageMembers && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const newRole = member.role === 'learner' ? 'manager' : 
                                          member.role === 'manager' ? 'admin' : 'learner'
                            updateRoleMutation.mutate({
                              organizationId,
                              memberId: member.id,
                              role: newRole as any,
                            })
                          }}
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this member?')) {
                              removeMemberMutation.mutate({
                                organizationId,
                                memberId: member.id,
                              })
                            }
                          }}
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Pagination info */}
          {membersData && membersData.total > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-6">
              Showing {membersData.members.length} of {membersData.total} members
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


