import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Mail, Calendar, Star, MapPin, Briefcase, 
  DollarSign, Clock, MessageSquare, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Candidate Profile | Recruitment',
};

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Get application with candidate details - TC-REC-014
  const { data: application } = await supabase
    .from('applications')
    .select(`
      *,
      candidates(*),
      job_postings(job_title, job_number, department_id, departments(name))
    `)
    .eq('id', id)
    .single();

  if (!application) {
    redirect('/hr/recruitment');
  }

  const candidate = application.candidates;
  const job = application.job_postings;

  // Get application timeline
  const { data: timeline } = await supabase
    .from('application_activities')
    .select(`
      *,
      employees(first_name, last_name)
    `)
    .eq('application_id', id)
    .order('created_at', { ascending: false });

  // Get interviews for this application
  const { data: interviews } = await supabase
    .from('recruitment_interviews')
    .select('*')
    .eq('application_id', id)
    .order('scheduled_date', { ascending: false });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Screening': return 'bg-yellow-100 text-yellow-800';
      case 'Interview': return 'bg-purple-100 text-purple-800';
      case 'Offer': return 'bg-green-100 text-green-800';
      case 'Hired': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/recruitment">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {candidate.first_name} {candidate.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Applied for {job.job_title} • {formatDate(application.application_date)}
            </p>
          </div>
        </div>
        <Badge className={getStageColor(application.current_stage)}>
          {application.current_stage}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${candidate.email}`} className="text-indigo-600 hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                  </div>
                  {candidate.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium mt-1">{candidate.phone}</p>
                    </div>
                  )}
                  {candidate.location && (
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{candidate.location}</span>
                      </div>
                    </div>
                  )}
                  {candidate.linkedin_url && (
                    <div>
                      <p className="text-sm text-gray-500">LinkedIn</p>
                      <a 
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline mt-1 inline-block"
                      >
                        View Profile →
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {candidate.current_company && (
                    <div>
                      <p className="text-sm text-gray-500">Current Company</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{candidate.current_company}</span>
                      </div>
                      {candidate.current_title && (
                        <p className="text-sm text-gray-600 ml-6">{candidate.current_title}</p>
                      )}
                    </div>
                  )}
                  {candidate.total_experience_years && (
                    <div>
                      <p className="text-sm text-gray-500">Total Experience</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{candidate.total_experience_years} years</span>
                      </div>
                    </div>
                  )}
                  {candidate.expected_salary && (
                    <div>
                      <p className="text-sm text-gray-500">Expected Salary</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          ${candidate.expected_salary.toLocaleString()} {candidate.salary_currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  )}
                  {candidate.availability_date && (
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-medium mt-1">{formatDate(candidate.availability_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume/Documents - TC-REC-014 */}
          <Card>
            <CardHeader>
              <CardTitle>Resume & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {application.resume_url ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-indigo-100 rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">Resume.pdf</p>
                        <p className="text-sm text-gray-500">Uploaded {formatDate(application.application_date)}</p>
                      </div>
                    </div>
                    <a href={application.resume_url} download target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </a>
                  </div>

                  {/* Resume Viewer (iframe or text) */}
                  <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-500">Resume preview would appear here</p>
                    {/* In production: PDF viewer or parsed text */}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No resume uploaded</p>
              )}

              {application.cover_letter && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{application.cover_letter}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview History */}
          {interviews && interviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{interview.interview_type}</h4>
                        <Badge variant="outline">{interview.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(interview.scheduled_date)} • {interview.duration_minutes} min
                      </p>
                      {interview.overall_rating && (
                        <div className="mt-2 flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{interview.overall_rating}/5</span>
                        </div>
                      )}
                      {interview.overall_feedback && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{interview.overall_feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions - TC-REC-016, TC-REC-017 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" size="sm">
                Move to Next Stage
              </Button>
              <Link href={`/hr/recruitment/interviews/schedule?application=${id}`}>
                <Button className="w-full" variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </Link>
              <Button className="w-full" variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {application.resume_url && (
                <a href={application.resume_url} download target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </a>
              )}
              <Button className="w-full" variant="outline" size="sm">
                <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Reject Candidate</span>
              </Button>
            </CardContent>
          </Card>

          {/* Rating - TC-REC-016 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Candidate Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating}>
                    <Star
                      className={`h-8 w-8 ${
                        rating <= (application.recruiter_rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {application.recruiter_rating || 'Not rated'}/5
              </p>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Application #</p>
                <p className="font-mono font-medium">{application.application_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Applied For</p>
                <p className="font-medium">{job.job_title}</p>
                <p className="text-xs text-gray-600">{job.departments?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Application Date</p>
                <p className="font-medium">{formatDate(application.application_date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Source</p>
                <Badge variant="outline">{application.source || 'Direct'}</Badge>
              </div>
              <div>
                <p className="text-gray-500">Current Stage</p>
                <Badge className={getStageColor(application.current_stage)}>
                  {application.current_stage}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline - TC-REC-017 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline && timeline.length > 0 ? (
                  timeline.map((activity) => (
                    <div key={activity.id} className="flex space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(activity.created_at)}
                          {activity.employees && (
                            <span> • {activity.employees.first_name} {activity.employees.last_name}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No activity yet</p>
                )}

                {/* Add Note Button */}
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Job Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Job Title</p>
                <Link href={`/hr/recruitment/jobs/${job.id}`}>
                  <p className="font-medium text-indigo-600 hover:underline">{job.job_title}</p>
                </Link>
              </div>
              <div>
                <p className="text-gray-500">Job Number</p>
                <p className="font-mono font-medium">{job.job_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{job.departments?.name || 'N/A'}</p>
              </div>
              <div className="pt-3 border-t">
                <Link href={`/hr/recruitment/jobs/${job.id}/pipeline`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Pipeline
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

