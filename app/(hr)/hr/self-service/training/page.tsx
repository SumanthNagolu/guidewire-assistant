import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Award, Clock, CheckCircle, Play, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Training | Employee Portal',
  description: 'View and complete your training courses',
};

export default async function EmployeeTrainingPage() {
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

  // Get all training assignments
  const { data: assignments } = await supabase
    .from('training_assignments')
    .select(`
      *,
      training_courses(course_name, category, duration_hours, passing_score, course_type)
    `)
    .eq('employee_id', employee.id)
    .order('due_date', { ascending: true });

  // Categorize assignments
  const pending = assignments?.filter(a => a.status === 'Assigned') || [];
  const inProgress = assignments?.filter(a => a.status === 'InProgress') || [];
  const completed = assignments?.filter(a => a.status === 'Completed') || [];
  const overdue = assignments?.filter(a => a.status === 'Overdue') || [];

  // Get certifications
  const { data: certificates } = await supabase
    .from('certifications')
    .select('*')
    .eq('employee_id', employee.id)
    .order('issued_date', { ascending: false });

  const activeCerts = certificates?.filter(c => c.status === 'Active') || [];
  const expiredCerts = certificates?.filter(c => c.status === 'Expired') || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Training & Development</h1>
        <p className="text-gray-600 mt-1">
          Complete your training courses and track your certifications
        </p>
      </div>

      {/* Stats Cards - TC-TRAIN-014 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgress.length}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completed.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">
                  {overdue.length} Training Course{overdue.length > 1 ? 's' : ''} Overdue
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Please complete your mandatory training as soon as possible.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button className="py-4 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600">
            Assigned ({pending.length})
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            In Progress ({inProgress.length})
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            Completed ({completed.length})
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            Certificates ({activeCerts.length})
          </button>
        </nav>
      </div>

      {/* Assigned Training Tab - TC-TRAIN-015 */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Training</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map((assignment) => {
                const daysRemaining = getDaysRemaining(assignment.due_date);
                const isUrgent = daysRemaining !== null && daysRemaining <= 7;

                return (
                  <div 
                    key={assignment.id}
                    className={`border rounded-lg p-4 ${isUrgent ? 'border-amber-300 bg-amber-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {assignment.is_mandatory && (
                            <Badge className="bg-red-100 text-red-800">MANDATORY</Badge>
                          )}
                          <h4 className="font-semibold text-gray-900">
                            {assignment.training_courses?.course_name}
                          </h4>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>{assignment.training_courses?.category}</span>
                          <span>•</span>
                          <span>{assignment.training_courses?.duration_hours}h</span>
                          {assignment.training_courses?.passing_score && (
                            <>
                              <span>•</span>
                              <span>Passing: {assignment.training_courses.passing_score}%</span>
                            </>
                          )}
                        </div>
                        {assignment.due_date && (
                          <div className="mt-2 flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={isUrgent ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                              Due: {formatDate(assignment.due_date)}
                              {daysRemaining !== null && (
                                <span className="ml-2">
                                  ({daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue!'})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link href={`/hr/self-service/training/${assignment.id}/learn`}>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Start Training
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No pending training assignments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Training */}
      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completed.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-gray-900">
                        {assignment.training_courses?.course_name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Completed: {formatDate(assignment.completed_at)} 
                      {assignment.completion_score && (
                        <span className="ml-2">• Score: {assignment.completion_score}%</span>
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {assignment.certificate_url && (
                      <a href={assignment.certificate_url} download target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Certificate
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates - TC-TRAIN-023 */}
      {activeCerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Certificates ({activeCerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCerts.map((cert) => {
                const isExpiringSoon = cert.expiry_date && 
                  getDaysRemaining(cert.expiry_date) !== null && 
                  getDaysRemaining(cert.expiry_date)! <= 30;

                return (
                  <div 
                    key={cert.id}
                    className={`border rounded-lg p-4 ${isExpiringSoon ? 'border-amber-300 bg-amber-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-indigo-600" />
                          <h4 className="font-semibold text-gray-900">{cert.certificate_name}</h4>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Issued</p>
                            <p className="font-medium">{formatDate(cert.issued_date)}</p>
                          </div>
                          {cert.expiry_date && (
                            <div>
                              <p className="text-gray-500">Expires</p>
                              <p className={`font-medium ${isExpiringSoon ? 'text-amber-700' : ''}`}>
                                {formatDate(cert.expiry_date)}
                                {isExpiringSoon && (
                                  <span className="ml-2 text-amber-700">
                                    ({getDaysRemaining(cert.expiry_date)} days)
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {cert.certificate_number && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Certificate #</p>
                              <p className="font-mono font-medium text-sm">{cert.certificate_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {cert.certificate_url && (
                          <a href={cert.certificate_url} download target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </a>
                        )}
                        {isExpiringSoon && (
                          <Button size="sm" variant="outline" className="border-amber-600 text-amber-900">
                            Renew
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-indigo-900 mb-2">💡 About Training</h3>
          <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
            <li>Complete mandatory training by the due date to stay compliant</li>
            <li>Training modules must be completed in order</li>
            <li>You can pause and resume training at any time</li>
            <li>Certificates are automatically generated upon completion</li>
            <li>Keep track of certificate expiration dates and renew on time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

