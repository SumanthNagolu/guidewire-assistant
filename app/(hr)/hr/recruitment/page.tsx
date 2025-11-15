import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Calendar, FileText, Plus, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recruitment Management | HR Portal',
  description: 'Manage job postings and track candidates',
};

export default async function RecruitmentDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Check permissions
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(permissions)')
    .eq('user_id', user.id)
    .single();

  // Get recruitment stats using helper function
  const { data: stats } = await supabase
    .rpc('get_recruitment_stats')
    .single();

  // Get active job postings
  const { data: activeJobs } = await supabase
    .from('job_postings')
    .select(`
      *,
      departments(name)
    `)
    .eq('status', 'Active')
    .order('posted_date', { ascending: false })
    .limit(10);

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      *,
      candidates(first_name, last_name, email),
      job_postings(job_title)
    `)
    .eq('status', 'Active')
    .order('application_date', { ascending: false })
    .limit(10);

  // Get upcoming interviews this week
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { data: upcomingInterviews } = await supabase
    .from('recruitment_interviews')
    .select(`
      *,
      applications(
        candidates(first_name, last_name)
      )
    `)
    .in('status', ['Scheduled', 'Confirmed'])
    .gte('scheduled_date', startOfWeek.toISOString())
    .lt('scheduled_date', endOfWeek.toISOString())
    .order('scheduled_date')
    .limit(5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
          <p className="text-gray-600 mt-1">
            Manage job postings and track candidates through the hiring pipeline
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/recruitment/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/hr/recruitment/reports">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - TC-REC-002 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.active_jobs || 0}</p>
              </div>
              <Briefcase className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Applications</p>
                <p className="text-3xl font-bold text-green-600">{stats?.new_applications || 0}</p>
              </div>
              <FileText className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interviews (Week)</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.interviews_this_week || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Offers</p>
                <p className="text-3xl font-bold text-amber-600">{stats?.pending_offers || 0}</p>
              </div>
              <Users className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link href="/hr/recruitment/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </Link>
        <Link href="/hr/recruitment/candidates">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            View All Candidates
          </Button>
        </Link>
        <Link href="/hr/recruitment/pipeline">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Pipeline
          </Button>
        </Link>
      </div>

      {/* Active Job Postings - TC-REC-003 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Job Postings ({activeJobs?.length || 0})</CardTitle>
            <Link href="/hr/recruitment/jobs">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeJobs && activeJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Job Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Applications</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Deadline</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{job.job_title}</p>
                          <p className="text-sm text-gray-500">
                            {job.location} • {job.employment_type}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{job.departments?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-center font-medium">{job.applications_count}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-green-100 text-green-800">{job.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {job.application_deadline ? formatDate(job.application_deadline) : 'No deadline'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/hr/recruitment/jobs/${job.id}`}>
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
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No active job postings</p>
              <Link href="/hr/recruitment/jobs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications - TC-REC-013 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Recent Applications 
              {recentApplications && recentApplications.filter(a => a.current_stage === 'New').length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {recentApplications.filter(a => a.current_stage === 'New').length} New
                </Badge>
              )}
            </CardTitle>
            <Link href="/hr/recruitment/applications">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplications && recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {app.current_stage === 'New' && (
                        <Badge className="bg-green-100 text-green-800">🆕 New</Badge>
                      )}
                      <div>
                        <p className="font-medium">
                          {app.candidates?.first_name} {app.candidates?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {app.job_postings?.job_title}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Applied</p>
                      <p className="text-sm font-medium">
                        {formatDate(app.application_date)}
                      </p>
                    </div>
                    <Badge variant="outline">{app.current_stage}</Badge>
                    <Link href={`/hr/recruitment/applications/${app.id}`}>
                      <Button size="sm">
                        {app.current_stage === 'New' ? 'Review' : 'View'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No recent applications
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Interviews */}
      {upcomingInterviews && upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        {new Date(interview.scheduled_date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-indigo-600">
                        {new Date(interview.scheduled_date).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {interview.applications?.candidates?.first_name}{' '}
                        {interview.applications?.candidates?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{interview.interview_type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {interview.meeting_link && (
                      <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm">
                          Join Call
                        </Button>
                      </a>
                    )}
                    <Link href={`/hr/recruitment/interviews/${interview.id}`}>
                      <Button variant="outline" size="sm">
                        Details
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
            <Link href="/hr/recruitment/candidates/import" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Users className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Import Candidates</h4>
                <p className="text-sm text-gray-600 mt-1">Bulk import from CSV/LinkedIn</p>
              </div>
            </Link>
            <Link href="/hr/recruitment/pipeline" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Pipeline View</h4>
                <p className="text-sm text-gray-600 mt-1">Kanban board for all jobs</p>
              </div>
            </Link>
            <Link href="/hr/recruitment/reports" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Recruitment Reports</h4>
                <p className="text-sm text-gray-600 mt-1">Analytics and insights</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

