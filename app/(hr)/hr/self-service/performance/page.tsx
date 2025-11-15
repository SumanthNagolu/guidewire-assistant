import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Target, FileText, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Performance | Employee Portal',
  description: 'View your performance reviews and track goals',
};

export default async function EmployeePerformancePage() {
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

  // Get employee review stats using helper function
  const { data: stats } = await supabase
    .rpc('get_employee_review_stats', { p_employee_id: employee.id })
    .single();

  // Get active goals
  const { data: activeGoals } = await supabase
    .from('performance_goals')
    .select('*')
    .eq('employee_id', employee.id)
    .in('status', ['NotStarted', 'InProgress'])
    .is('active_to', null)
    .order('target_date');

  // Get recent completed goals
  const { data: completedGoals } = await supabase
    .from('performance_goals')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('status', 'Achieved')
    .order('achieved_date', { ascending: false })
    .limit(5);

  // Get review history
  const { data: reviews } = await supabase
    .from('performance_reviews')
    .select(`
      *,
      performance_review_cycles(name, review_type),
      employees!performance_reviews_reviewer_id_fkey(first_name, last_name)
    `)
    .eq('employee_id', employee.id)
    .order('completed_at', { ascending: false })
    .limit(10);

  // Get pending acknowledgment reviews
  const { data: pendingReviews } = await supabase
    .from('performance_reviews')
    .select(`
      *,
      performance_review_cycles(name, review_type)
    `)
    .eq('employee_id', employee.id)
    .eq('status', 'SubmittedToEmployee')
    .order('submitted_to_employee_at', { ascending: false });

  // Calculate goal progress
  const totalGoals = (activeGoals?.length || 0) + (completedGoals?.length || 0);
  const achievedGoals = completedGoals?.length || 0;
  const goalProgressPct = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  // Get next review date (estimate based on last review)
  let nextReviewDate = 'TBD';
  if (stats?.last_review_date) {
    const lastDate = new Date(stats.last_review_date);
    // Assume quarterly reviews (add 3 months)
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);
    nextReviewDate = nextDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'Improving') return '📈';
    if (trend === 'Declining') return '📉';
    if (trend === 'Stable') return '➡️';
    return '🆕';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-1">
          Track your performance reviews and goals
        </p>
      </div>

      {/* Pending Action Alert - TC-PERF-020 */}
      {pendingReviews && pendingReviews.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  Action Required: {pendingReviews.length} Performance Review(s) Pending Your Acknowledgment
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Your manager has completed your review. Please review and acknowledge.
                </p>
                <div className="mt-3 space-y-2">
                  {pendingReviews.map(review => (
                    <Link
                      key={review.id}
                      href={`/hr/self-service/performance/reviews/${review.id}/acknowledge`}
                    >
                      <Button size="sm" variant="outline" className="border-amber-600 text-amber-900">
                        Review {review.performance_review_cycles?.name} →
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - TC-PERF-014, TC-PERF-032 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Rating</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats?.last_review_rating?.toFixed(1) || 'N/A'}
                  </p>
                  {stats?.last_review_rating && <p className="text-gray-500">/5</p>}
                </div>
                {stats?.trend && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getTrendIcon(stats.trend)} {stats.trend}
                  </p>
                )}
              </div>
              <Star className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Goal Progress</p>
                <p className="text-3xl font-bold text-green-600">{goalProgressPct}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {achievedGoals}/{totalGoals} goals achieved
                </p>
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Review</p>
                <p className="text-lg font-bold text-purple-600">{nextReviewDate}</p>
                <p className="text-xs text-gray-500 mt-1">Estimated date</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button className="py-4 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600">
            Current Goals
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Review History
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
            Feedback
          </button>
        </nav>
      </div>

      {/* Current Goals Tab - TC-PERF-015, TC-PERF-016 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Goals ({activeGoals?.length || 0})</CardTitle>
            <p className="text-sm text-gray-500">
              Overall Progress: {activeGoals?.length || 0} active goals
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {activeGoals && activeGoals.length > 0 ? (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                        {goal.weight && <span>Weight: {goal.weight}%</span>}
                        {goal.category && <Badge variant="outline">{goal.category}</Badge>}
                      </div>
                    </div>
                    <Badge 
                      className={
                        goal.status === 'InProgress' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {goal.status === 'NotStarted' ? 'Not Started' : 'In Progress'}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {goal.progress_notes && (
                    <p className="text-sm text-gray-600 italic">
                      Last update: {goal.progress_notes}
                    </p>
                  )}

                  {goal.last_progress_update_at && (
                    <p className="text-xs text-gray-500">
                      Updated {new Date(goal.last_progress_update_at).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Link href={`/hr/self-service/performance/goals/${goal.id}/update`}>
                      <Button size="sm" variant="outline">
                        Update Progress
                      </Button>
                    </Link>
                    <Link href={`/hr/self-service/performance/goals/${goal.id}`}>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No active goals</p>
              <p className="text-sm text-gray-400">
                Goals will be set during your performance review
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals && completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">✓ {goal.title}</p>
                    <p className="text-sm text-gray-500">
                      Achieved on {new Date(goal.achieved_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {goal.achievement_percentage || 100}% Achieved
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review History - TC-PERF-017, TC-PERF-018 */}
      <Card>
        <CardHeader>
          <CardTitle>Review History ({reviews?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">
                          {review.performance_review_cycles?.name}
                        </h4>
                        <Badge variant="outline">
                          {review.performance_review_cycles?.review_type}
                        </Badge>
                        {review.status === 'Completed' && (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">
                            {review.completed_at 
                              ? new Date(review.completed_at).toLocaleDateString()
                              : new Date(review.submitted_to_employee_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <p className="font-bold text-lg text-indigo-600">
                            {review.overall_rating}/5
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reviewer</p>
                          <p className="font-medium">
                            {review.employees?.first_name} {review.employees?.last_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link href={`/hr/self-service/performance/reviews/${review.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" disabled>
                        <Download className="h-3 w-3 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No review history</p>
              <p className="text-sm text-gray-400">
                Your performance reviews will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Trend */}
      {stats && stats.total_reviews >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Overall Trend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTrendIcon(stats.trend)} {stats.trend}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.average_rating.toFixed(2)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 About Your Performance</h3>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Track your goal progress regularly to stay on target</li>
            <li>Update progress notes to document your achievements</li>
            <li>Review your performance history to see your growth</li>
            <li>Pending reviews require your acknowledgment within 7 days</li>
            <li>Contact your manager if you have questions about your review</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

