import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Ticket, CheckCircle, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help & Support | Employee Portal',
  description: 'Get help with HR-related questions',
};

export default async function EmployeeSupportPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get employee
  const { data: employee } = await supabase
    .from('employees')
    .select('id, employee_id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!employee) {
    redirect('/hr/dashboard');
  }

  // Get all tickets for this employee
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false });

  const openTickets = tickets?.filter(t => t.status !== 'Closed' && t.status !== 'Cancelled') || [];
  const resolvedTickets = tickets?.filter(t => t.status === 'Resolved') || [];
  const closedTickets = tickets?.filter(t => t.status === 'Closed') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Assigned':
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-1">
            Submit tickets for HR assistance and track your requests
          </p>
        </div>
        <Link href="/hr/self-service/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards - TC-SUP-001 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-amber-600">{openTickets.length}</p>
              </div>
              <Ticket className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedTickets.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{tickets?.length || 0}</p>
              </div>
              <Clock className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>My Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets && tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ticket #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Subject</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Category</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Priority</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Created</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{ticket.ticket_number}</td>
                      <td className="py-3 px-4 font-medium">{ticket.subject}</td>
                      <td className="py-3 px-4 text-center text-sm">{ticket.category}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={
                          ticket.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/hr/self-service/support/tickets/${ticket.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No support tickets yet</p>
              <Link href="/hr/self-service/support/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Base Quick Links */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-900">
            <BookOpen className="h-5 w-5 mr-2" />
            Common Topics (Knowledge Base)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'How to apply for leave',
              'How to submit expense claims',
              'How to update personal information',
              'How to view pay stubs',
              'How to request documents',
              'How to update bank details',
            ].map((topic) => (
              <Link key={topic} href="#" className="block">
                <div className="p-3 bg-white border border-indigo-200 rounded-lg hover:shadow-md transition-shadow">
                  <p className="text-sm text-indigo-900">• {topic}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/hr/self-service/support/kb">
              <Button variant="outline" size="sm">
                Browse All Articles
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

