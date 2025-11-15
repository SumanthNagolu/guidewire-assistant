import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Plus, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Performance Management | HR Portal',
  description: 'Manage employee performance reviews and goals',
};

export default async function PerformanceDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get current employee
  const { data: employee } = await supabase
    .from('employees')
    .select('id, hr_roles(permissions)')
    .eq('user_id', user.id)
    .single();

  const isManager = employee?.hr_roles?.permissions?.approve_team_timesheets || 
                    employee?.hr_roles?.permissions?.admin;

  // Get all pending reviews for this manager
  const { data: pendingReviews } = await supabase
    .from('performance_reviews')
    .select(`
      *,
      employees!performance_reviews_employee_id_fkey(id, first_name, last_name, employee_id, departments(name)),
      performance_review_cycles(name, review_type, due_date)
    `)
    .eq('reviewer_id', employee?.id)
    .in('status', ['Draft', 'InReview'])
    .order('created_at', { ascending: false });

  // Get completed reviews
  const { data: completedReviews } = await supabase
    .from('performance_reviews')
    .select(`
      *,
      employees!performance_reviews_employee_id_fkey(first_name, last_name, employee_id),
      performance_review_cycles(name, review_type)
    `)
    .eq('reviewer_id', employee?.id)
    .eq('status', 'Completed')
    .order('completed_at', { ascending: false })
    .limit(10);

  // Calculate stats
  const now = new Date();
  const overdue = pendingReviews?.filter(r => 
    new Date(r.performance_review_cycles?.due_date || '') < now
  ).length || 0;
  
  const upcoming = pendingReviews?.filter(r => {
    const dueDate = new Date(r.performance_review_cycles?.due_date || '');
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  }).length || 0;

  const completed = completedReviews?.length || 0;

  const getStatusBadge = (review: any) => {
    const dueDate = new Date(review.performance_review_cycles?.due_date || '');
    const isOverdue = dueDate < now;

    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue!</Badge>;
    } else if (review.status === 'Draft') {
      return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>;
    } else if (review.status === 'InReview') {
      return <Badge className="bg-yellow-100 text-yellow-800">In Review</Badge>;
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">
            Conduct performance reviews and track employee goals
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/performance/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - TC-PERF-001 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdue}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming (7 days)</p>
                <p className="text-3xl font-bold text-yellow-600">{upcoming}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link href="/hr/performance/reviews/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Review
          </Button>
        </Link>
        <Link href="/hr/performance/reports">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </Link>
      </div>

      {/* Pending Reviews Table - TC-PERF-002 */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews (Action Required)</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews && pendingReviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Due Date</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {review.employees.first_name} {review.employees.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {review.employees.employee_id} • {review.employees.departments?.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {review.performance_review_cycles?.review_type}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {review.performance_review_cycles?.name}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(review.performance_review_cycles?.due_date)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(review)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/hr/performance/reviews/${review.id}`}>
                          <Button size="sm">
                            {review.status === 'Draft' ? 'Start' : 'Continue'}
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
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No pending reviews</p>
              <p className="text-sm text-gray-400">
                All reviews are up to date
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Reviews */}
      {completedReviews && completedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reviews</CardTitle>
              <Link href="/hr/performance/history">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedReviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-medium">
                      {review.employees.first_name} {review.employees.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {review.performance_review_cycles?.name} • {review.performance_review_cycles?.review_type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {review.overall_rating}/5
                      </p>
                    </div>
                    <Link href={`/hr/performance/reviews/${review.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/hr/performance/goals" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Team Goals</h4>
                <p className="text-sm text-gray-600 mt-1">Track team goals and progress</p>
              </div>
            </Link>
            <Link href="/hr/performance/reports" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Reports</h4>
                <p className="text-sm text-gray-600 mt-1">View performance analytics</p>
              </div>
            </Link>
            <Link href="/hr/performance/settings" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Settings className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Configure</h4>
                <p className="text-sm text-gray-600 mt-1">Manage competencies & cycles</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

