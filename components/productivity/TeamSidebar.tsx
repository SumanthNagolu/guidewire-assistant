'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Circle, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'idle' | 'offline';
  industry_role: string | null;
}

interface Team {
  id: string;
  name: string;
  code: string;
  members: TeamMember[];
}

interface TeamSidebarProps {
  isAdmin: boolean;
  currentUserId: string;
}

export default function TeamSidebar({ isAdmin, currentUserId }: TeamSidebarProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  useEffect(() => {
    const userParam = searchParams.get('user');
    if (userParam) {
      setSelectedUserId(userParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    loadTeams();
    
    // Realtime subscription
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'productivity_presence'
        },
        () => {
          loadTeams(); // Reload on any presence change
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  async function loadTeams() {
    try {
      setLoading(true);
      
      // Load all users (fallback if teams aren't set up yet)
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, industry_role')
        .in('role', ['admin', 'employee', 'recruiter', 'sales', 'operations'])
        .order('first_name', { ascending: true });
      
      if (!allUsers || allUsers.length === 0) {
        setLoading(false);
        return;
      }
      
      // Check status for each user
      const usersWithStatus = await Promise.all(
        allUsers.map(async (user) => {
          const status = await checkUserStatus(user.id);
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            email: user.email,
            status,
            industry_role: user.industry_role
          };
        })
      );
      
      // Try to load teams
      const { data: teamsData } = await supabase
        .from('productivity_teams')
        .select('*')
        .order('name');
      
      if (teamsData && teamsData.length > 0) {
        // Load team members
        const { data: teamMembersData } = await supabase
          .from('productivity_team_members')
          .select('team_id, user_id');
        
        const teamMembersMap = new Map<string, string[]>();
        teamMembersData?.forEach(tm => {
          if (!teamMembersMap.has(tm.team_id)) {
            teamMembersMap.set(tm.team_id, []);
          }
          teamMembersMap.get(tm.team_id)!.push(tm.user_id);
        });
        
        // Build teams with members
        const transformedTeams: Team[] = teamsData.map(team => {
          const memberIds = teamMembersMap.get(team.id) || [];
          const members = usersWithStatus.filter(u => memberIds.includes(u.id));
          
          return {
            id: team.id,
            name: team.name,
            code: team.team_code,
            members: sortMembers(members)
          };
        });
        
        setTeams(transformedTeams);
        
        // Auto-expand teams with active members
        const teamsWithActive = transformedTeams
          .filter(t => t.members.some(m => m.status === 'active'))
          .map(t => t.id);
        setExpandedTeams(new Set(teamsWithActive));
      } else {
        // No teams yet - create single "All Users" group
        setTeams([{
          id: 'all-users',
          name: 'All Users',
          code: 'ALL',
          members: sortMembers(usersWithStatus)
        }]);
        setExpandedTeams(new Set(['all-users']));
      }
    } catch (error) {
          } finally {
      setLoading(false);
    }
  }
  
  function sortMembers(members: TeamMember[]): TeamMember[] {
    return members.sort((a, b) => {
      // Sort by status (active first) then by name
      if (a.status !== b.status) {
        const statusOrder = { active: 0, idle: 1, offline: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name);
    });
  }
  
  async function checkUserStatus(userId: string): Promise<'active' | 'idle' | 'offline'> {
    try {
      const { data } = await supabase
        .from('productivity_presence')
        .select('current_status, status_updated_at')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (!data) return 'offline';
      
      const lastUpdate = new Date(data.status_updated_at);
      const minutesAgo = (Date.now() - lastUpdate.getTime()) / 60000;
      
      if (minutesAgo > 15) return 'offline';
      if (minutesAgo > 5) return 'idle';
      return data.current_status as any;
    } catch {
      return 'offline';
    }
  }
  
  function toggleTeam(teamId: string) {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  }
  
  function selectUser(userId: string) {
    setSelectedUserId(userId);
    router.push(`/productivity/ai-dashboard?user=${userId}`);
  }
  
  const statusColors = {
    active: 'text-green-500',
    idle: 'text-yellow-500',
    offline: 'text-gray-400'
  };
  
  const roleIcons: Record<string, string> = {
    bench_resource: '📚',
    sales_executive: '💼',
    recruiter: '🎯',
    active_consultant: '💻',
    operations: '⚙️',
    admin: '👑'
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-2">
      {/* Current User */}
      {!isAdmin && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">My Dashboard</span>
          </div>
        </div>
      )}
      
      {/* Teams */}
      {teams.map((team) => (
        <div key={team.id} className="space-y-1">
          {/* Team Header */}
          <button
            onClick={() => toggleTeam(team.id)}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            {expandedTeams.has(team.id) ? (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            )}
            <span className="font-semibold text-gray-900 flex-1 text-left">{team.name}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {team.members.filter(m => m.status === 'active').length}/{team.members.length}
            </span>
          </button>
          
          {/* Team Members */}
          {expandedTeams.has(team.id) && (
            <div className="ml-6 space-y-1">
              {team.members.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No members yet</p>
              ) : (
                team.members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => selectUser(member.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                      selectedUserId === member.id
                        ? "bg-blue-100 border border-blue-300 shadow-sm"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Circle className={cn("w-2 h-2 fill-current", statusColors[member.status])} />
                    <span className="text-sm">{roleIcons[member.industry_role || 'operations'] || '👤'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {member.industry_role?.replace('_', ' ') || 'Employee'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* Quick Stats */}
      <div className="mt-6 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Team Stats</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current text-green-500" />
              Active
            </span>
            <span className="font-semibold text-green-700">
              {teams.reduce((acc, t) => acc + t.members.filter(m => m.status === 'active').length, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current text-yellow-500" />
              Idle
            </span>
            <span className="font-semibold text-yellow-700">
              {teams.reduce((acc, t) => acc + t.members.filter(m => m.status === 'idle').length, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current text-gray-400" />
              Offline
            </span>
            <span className="font-semibold text-gray-600">
              {teams.reduce((acc, t) => acc + t.members.filter(m => m.status === 'offline').length, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



