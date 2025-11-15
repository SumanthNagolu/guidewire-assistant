import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, TrendingUp, Plus, BarChart3, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Training Management | HR Portal',
  description: 'Manage employee training and development',
};

export default async function TrainingDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get training stats
  const { data: stats } = await supabase
    .rpc('get_training_stats')
    .single();

  // Get active courses
  const { data: activeCourses } = await supabase
    .from('training_courses')
    .select(`
      *,
      training_assignments(count)
    `)
    .eq('is_active', true)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get courses with completion stats
  const coursesWithStats = await Promise.all(
    (activeCourses || []).map(async (course) => {
      const { count: assignedCount } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      const { count: completedCount } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)
        .eq('status', 'Completed');

      return {
        ...course,
        assigned_count: assignedCount || 0,
        completed_count: completedCount || 0,
      };
    })
  );

  // Get expiring certifications
  const { data: expiringCerts } = await supabase
    .from('certifications')
    .select(`
      *,
      employees(first_name, last_name, employee_id)
    `)
    .eq('status', 'Active')
    .gte('expiry_date', new Date().toISOString().split('T')[0])
    .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('expiry_date')
    .limit(10);

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
          <h1 className="text-2xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee training courses and track development
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/hr/training/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/hr/training/reports">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - TC-TRAIN-002 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-3xl font-bold text-indigo-600">{stats?.active_courses || 0}</p>
              </div>
              <BookOpen className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Training</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.employees_in_training || 0}</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-600">{stats?.certifications_expiring || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats?.compliance_rate || 0}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link href="/hr/training/courses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
        <Link href="/hr/training/assign">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Assign Training
          </Button>
        </Link>
        <Link href="/hr/training/certificates">
          <Button variant="outline">
            <Award className="h-4 w-4 mr-2" />
            Manage Certificates
          </Button>
        </Link>
      </div>

      {/* Active Courses Table - TC-TRAIN-003 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Training Courses ({coursesWithStats.length})</CardTitle>
            <Link href="/hr/training/courses">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {coursesWithStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Course Name</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Assigned</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Completed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Completion %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursesWithStats.map((course) => {
                    const completionPct = course.assigned_count > 0 
                      ? Math.round((course.completed_count / course.assigned_count) * 100)
                      : 0;

                    return (
                      <tr key={course.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{course.course_name}</p>
                            <p className="text-sm text-gray-500">
                              {course.category} • {course.duration_hours}h
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={course.course_type === 'Mandatory' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                          }>
                            {course.course_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-medium">{course.assigned_count}</td>
                        <td className="py-3 px-4 text-center font-medium">{course.completed_count}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{completionPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link href={`/hr/training/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No training courses created yet</p>
              <Link href="/hr/training/courses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Course
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Certifications Alert */}
      {expiringCerts && expiringCerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-900">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                Certifications Expiring Soon ({expiringCerts.length})
              </CardTitle>
              <Link href="/hr/training/certificates">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {cert.employees.first_name} {cert.employees.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {cert.certificate_name} • Expires: {formatDate(cert.expiry_date)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Renew
                  </Button>
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
            <Link href="/hr/training/progress" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <TrendingUp className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Track Progress</h4>
                <p className="text-sm text-gray-600 mt-1">Monitor employee training completion</p>
              </div>
            </Link>
            <Link href="/hr/training/reports" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Training Reports</h4>
                <p className="text-sm text-gray-600 mt-1">View analytics and compliance</p>
              </div>
            </Link>
            <Link href="/hr/training/certificates" className="block">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Award className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Certificates</h4>
                <p className="text-sm text-gray-600 mt-1">Manage employee certifications</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

