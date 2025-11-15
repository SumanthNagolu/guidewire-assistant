import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Users, CheckCircle, Clock, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support Management | HR Portal',
  description: 'Manage employee support tickets',
};

export default async function SupportDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get current employee
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Get support stats
  const { data: stats } = await supabase
    .rpc('get_support_stats', { p_agent_id: employee?.id })
    .single();

  // Get unassigned tickets
  const { data: unassignedTickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      employees!support_tickets_employee_id_fkey(first_name, last_name, employee_id)
    `)
    .eq('status', 'New')
    .order('created_at', { ascending: false })
    .limit(15);

  // Get my assigned tickets
  const { data: myTickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      employees!support_tickets_employee_id_fkey(first_name, last_name, employee_id)
    `)
    .eq('assigned_to', employee?.id)
    .in('status', ['Assigned', 'InProgress', 'Waiting'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAStatus = (ticket: any) => {
    if (!ticket.sla_resolution_due_at) return null;
    const now = new Date();
    const slaTime = new Date(ticket.sla_resolution_due_at);
    const hoursRemaining = (slaTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (ticket.sla_resolution_breached) {
      return { color: 'text-red-600', icon: '🔴', text: 'SLA Breached' };
    } else if (hoursRemaining < 1) {
      return { color: 'text-orange-600', icon: '🟠', text: `${Math.round(hoursRemaining * 60)}m left` };
    } else if (hoursRemaining < 4) {
      return { color: 'text-amber-600', icon: '🟡', text: `${Math.round(hoursRemaining)}h left` };
    } else {
      return { color: 'text-green-600', icon: '🟢', text: `${Math.round(hoursRemaining)}h left` };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee support tickets and queries
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/support/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/hr/support/reports">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - TC-SUP-010 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Tickets</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.my_tickets || 0}</p>
              </div>
              <Ticket className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-3xl font-bold text-amber-600">{stats?.unassigned_tickets || 0}</p>
              </div>
              <Users className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-3xl font-bold text-green-600">{stats?.resolved_today || 0}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.avg_resolution_hours || 0}h</p>
              </div>
              <Clock className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Tickets Queue - TC-SUP-011 */}
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Tickets (Team Queue)</CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedTickets && unassignedTickets.length > 0 ? (
            <div className="space-y-3">
              {unassignedTickets.map((ticket) => {
                const slaStatus = getSLAStatus(ticket);
                return (
                  <div 
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {slaStatus && (
                            <span className={slaStatus.color}>
                              {slaStatus.icon}
                            </span>
                          )}
                          <h4 className="font-semibold text-gray-900">
                            #{ticket.ticket_number} - {ticket.subject}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {ticket.employees.first_name} {ticket.employees.last_name} ({ticket.employees.employee_id})
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">{ticket.category}</span>
                          {slaStatus && (
                            <span className={`text-sm ${slaStatus.color}`}>
                              SLA: {slaStatus.text}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Link href={`/hr/support/tickets/${ticket.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <form action={`/api/support/tickets/${ticket.id}/assign`} method="POST">
                          <Button size="sm" type="submit">
                            Assign to Me
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No unassigned tickets in queue
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Assigned Tickets */}
      {myTickets && myTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Tickets ({myTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ticket #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Category</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Priority</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">SLA</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myTickets.map((ticket) => {
                    const slaStatus = getSLAStatus(ticket);
                    return (
                      <tr key={ticket.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{ticket.ticket_number}</td>
                        <td className="py-3 px-4 font-medium">{ticket.subject}</td>
                        <td className="py-3 px-4 text-sm">
                          {ticket.employees.first_name} {ticket.employees.last_name}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">{ticket.category}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{ticket.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {slaStatus && (
                            <span className={`text-sm ${slaStatus.color}`}>
                              {slaStatus.text}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/hr/support/tickets/${ticket.id}`}>
                            <Button variant="outline" size="sm">
                              Open
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

