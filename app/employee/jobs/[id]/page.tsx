import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, Edit, MapPin, Briefcase, Calendar, DollarSign, FileText, Building2, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient() as any; // Type cast for CRM tables
  const { id } = await params;
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/employee/login');
  }
  // Get job with client details
  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      client:clients(id, name, industry, website),
      client_contact:contacts(id, first_name, last_name, email, phone)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !job) {
    notFound();
  }
  // Get user profile to check permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  // Check if user has access
  if (profile?.role === 'recruiter' && job.owner_id !== user.id) {
    redirect('/employee/jobs');
  }
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      open: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      on_hold: 'bg-innovation-orange-100 text-innovation-orange-700 border-innovation-orange-200',
      filled: 'bg-trust-blue-100 text-trust-blue-700 border-trust-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };
  const getPriorityBadge = (priority: string) => {
    const badges = {
      hot: 'bg-red-100 text-red-700 border-red-200',
      warm: 'bg-orange-100 text-orange-700 border-orange-200',
      cold: 'bg-sky-blue-100 text-sky-blue-700 border-sky-blue-200',
    };
    const labels = {
      hot: '🔥 Hot Priority',
      warm: 'Warm Priority',
      cold: 'Cold Priority',
    };
    return {
      badge: badges[priority as keyof typeof badges],
      label: labels[priority as keyof typeof labels],
    };
  };
  const formatEmploymentType = (type: string) => {
    const labels = {
      contract: 'Contract',
      contract_to_hire: 'Contract-to-Hire',
      direct_placement: 'Direct Placement',
      temporary: 'Temporary',
    };
    return labels[type as keyof typeof labels] || type;
  };
  const formatRemotePolicy = (policy: string) => {
    const labels = {
      remote: '🏠 Remote',
      hybrid: '🏢 Hybrid',
      onsite: '🏢 Onsite',
    };
    return labels[policy as keyof typeof labels] || policy;
  };
  const priorityStyle = getPriorityBadge(job.priority);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/employee/jobs"
                className="text-wisdom-gray-600 hover:text-trust-blue"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                  {job.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  {job.location && (
                    <span className="text-wisdom-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="text-wisdom-gray-600">
                    {formatRemotePolicy(job.remote_policy)}
                  </span>
                  <span className="text-wisdom-gray-600">
                    {formatEmploymentType(job.employment_type)}
                  </span>
                </div>
              </div>
            </div>
            <Link href={`/employee/jobs/${job.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Key Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                Job Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-2">Current Status</div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-2">Priority</div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${priorityStyle.badge}`}>
                    {priorityStyle.label}
                  </span>
                </div>
              </div>
            </div>
            {/* Openings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Openings
              </h3>
              <div className="text-center">
                <div className="text-4xl font-heading font-bold text-trust-blue-900">
                  {job.filled}/{job.openings}
                </div>
                <div className="text-wisdom-gray-600 mt-2">
                  {job.openings - job.filled} still needed
                </div>
                {job.openings > 1 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-success-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(job.filled / job.openings) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Compensation */}
            {(job.rate_min || job.rate_max) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Rate Range
                </h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success-green-500" />
                  <span className="text-2xl font-heading font-bold text-trust-blue-900">
                    ${job.rate_min}-${job.rate_max}
                  </span>
                  <span className="text-wisdom-gray-600">
                    /{job.rate_type === 'hourly' ? 'hour' : 'year'}
                  </span>
                </div>
                {job.duration_months && (
                  <div className="mt-3 text-sm text-wisdom-gray-600">
                    Duration: {job.duration_months} months
                  </div>
                )}
              </div>
            )}
            {/* Timeline */}
            {job.target_fill_date && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Fill Date
                </h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-trust-blue-500" />
                  <span className="text-trust-blue-900 font-medium">
                    {new Date(job.target_fill_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {job.posted_date && (
                  <div className="mt-3 text-sm text-wisdom-gray-600">
                    Posted: {new Date(job.posted_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
            {/* Client */}
            {job.client && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Client
                </h3>
                <div>
                  <div className="font-medium text-trust-blue-900">{job.client.name}</div>
                  {job.client.industry && (
                    <div className="text-sm text-wisdom-gray-600 mt-1">{job.client.industry}</div>
                  )}
                  {job.client.website && (
                    <a
                      href={job.client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-trust-blue hover:underline mt-2 inline-block"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Right Column - Description & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Job Description
                </h3>
                <div className="text-wisdom-gray-700 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            )}
            {/* Required Skills */}
            {job.required_skills && job.required_skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-sky-blue-50 text-sky-blue-700 text-sm font-medium rounded-lg border border-sky-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Nice-to-Have Skills */}
            {job.nice_to_have_skills && job.nice_to_have_skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Nice-to-Have Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.nice_to_have_skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-wisdom-gray-50 text-wisdom-gray-700 text-sm font-medium rounded-lg border border-wisdom-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Internal Notes */}
            {job.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Internal Notes
                </h3>
                <div className="text-wisdom-gray-700 whitespace-pre-wrap">
                  {job.notes}
                </div>
              </div>
            )}
            {/* Metadata */}
            <div className="bg-gray-100 rounded-lg p-4 text-xs text-wisdom-gray-600">
              <div className="flex items-center justify-between">
                <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                <span>Last updated: {new Date(job.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
