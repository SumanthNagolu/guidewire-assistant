import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, FileText, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient() as any; // Type cast for CRM tables
  const { id } = await params;
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/employee/login');
  }
  // Get candidate
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error || !candidate) {
    notFound();
  }
  // Get user profile to check permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  // Check if user has access (admins see all, recruiters see their own)
  if (profile?.role === 'recruiter' && candidate.owner_id !== user.id) {
    redirect('/employee/candidates');
  }
  // Format status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      placed: 'bg-trust-blue-100 text-trust-blue-700 border-trust-blue-200',
      inactive: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      do_not_contact: 'bg-red-100 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };
  const formatAvailability = (availability: string | null) => {
    if (!availability) return 'Not specified';
    const labels = {
      immediate: 'Immediate',
      within_2_weeks: 'Within 2 Weeks',
      within_1_month: 'Within 1 Month',
      not_available: 'Not Available',
    };
    return labels[availability as keyof typeof labels] || availability;
  };
  const formatWorkAuth = (workAuth: string | null) => {
    if (!workAuth) return 'Not specified';
    const labels = {
      us_citizen: 'US Citizen',
      green_card: 'Green Card',
      h1b: 'H1B',
      opt: 'OPT',
      ead: 'EAD',
      requires_sponsorship: 'Requires Sponsorship',
    };
    return labels[workAuth as keyof typeof labels] || workAuth;
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/employee/candidates"
                className="text-wisdom-gray-600 hover:text-trust-blue"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-trust-blue-100 flex items-center justify-center">
                  <span className="text-trust-blue-600 font-bold text-2xl">
                    {candidate.first_name[0]}{candidate.last_name[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  {candidate.current_title && (
                    <p className="text-wisdom-gray-600 mt-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {candidate.current_title}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Link href={`/employee/candidates/${candidate.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Candidate
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-3 text-wisdom-gray-700 hover:text-trust-blue"
                >
                  <Mail className="w-5 h-5 text-wisdom-gray-400" />
                  <span>{candidate.email}</span>
                </a>
                {candidate.phone && (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="flex items-center gap-3 text-wisdom-gray-700 hover:text-trust-blue"
                  >
                    <Phone className="w-5 h-5 text-wisdom-gray-400" />
                    <span>{candidate.phone}</span>
                  </a>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-3 text-wisdom-gray-700">
                    <MapPin className="w-5 h-5 text-wisdom-gray-400" />
                    <span>{candidate.location}</span>
                  </div>
                )}
              </div>
              {(candidate.linkedin_url || candidate.portfolio_url) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-trust-blue hover:underline text-sm"
                      >
                        LinkedIn Profile →
                      </a>
                    )}
                    {candidate.portfolio_url && (
                      <a
                        href={candidate.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-trust-blue hover:underline text-sm"
                      >
                        Portfolio →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Status & Availability */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                Status & Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-2">Status</div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(candidate.status)}`}>
                    {candidate.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-1">Availability</div>
                  <div className="text-trust-blue-900 font-medium">{formatAvailability(candidate.availability)}</div>
                </div>
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-1">Work Authorization</div>
                  <div className="text-trust-blue-900 font-medium">{formatWorkAuth(candidate.work_authorization)}</div>
                </div>
              </div>
            </div>
            {/* Compensation */}
            {(candidate.desired_rate_min || candidate.desired_rate_max) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Desired Rate
                </h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success-green-500" />
                  <span className="text-2xl font-heading font-bold text-trust-blue-900">
                    ${candidate.desired_rate_min}-${candidate.desired_rate_max}
                  </span>
                  <span className="text-wisdom-gray-600">/hour</span>
                </div>
              </div>
            )}
            {/* Rating */}
            {candidate.overall_rating && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Overall Rating
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-heading font-bold text-trust-blue-900">{candidate.overall_rating}</span>
                  <span className="text-wisdom-gray-600">/5</span>
                  <div className="text-2xl text-innovation-orange-500">
                    {'★'.repeat(candidate.overall_rating)}
                    <span className="text-wisdom-gray-300">{'★'.repeat(5 - candidate.overall_rating)}</span>
                  </div>
                </div>
                {(candidate.technical_rating || candidate.communication_rating) && (
                  <div className="mt-4 space-y-2 text-sm">
                    {candidate.technical_rating && (
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray-600">Technical:</span>
                        <span className="font-medium">{candidate.technical_rating}/5</span>
                      </div>
                    )}
                    {candidate.communication_rating && (
                      <div className="flex justify-between">
                        <span className="text-wisdom-gray-600">Communication:</span>
                        <span className="font-medium">{candidate.communication_rating}/5</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Right Column - Professional Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            {candidate.years_of_experience && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Experience
                </h3>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-trust-blue-500" />
                  <span className="text-xl font-medium text-trust-blue-900">
                    {candidate.years_of_experience} years
                  </span>
                  <span className="text-wisdom-gray-600">of professional experience</span>
                </div>
              </div>
            )}
            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string, index: number) => (
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
            {/* Certifications */}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
                  Certifications
                </h3>
                <div className="space-y-2">
                  {candidate.certifications.map((cert: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-success-green-500" />
                      <span className="text-wisdom-gray-900">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Notes */}
            {candidate.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h3>
                <div className="text-wisdom-gray-700 whitespace-pre-wrap">
                  {candidate.notes}
                </div>
              </div>
            )}
            {/* Metadata */}
            <div className="bg-gray-100 rounded-lg p-4 text-xs text-wisdom-gray-600">
              <div className="flex items-center justify-between">
                <span>Added: {new Date(candidate.created_at).toLocaleDateString()}</span>
                <span>Last updated: {new Date(candidate.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
