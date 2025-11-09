'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Mail, Phone, MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  years_of_experience: number | null;
  skills: string[];
  status: string;
  availability: string | null;
  work_authorization: string | null;
  desired_rate_min: number | null;
  desired_rate_max: number | null;
  overall_rating: number | null;
  created_at: string;
}

interface CandidatesTableProps {
  candidates: Candidate[];
  currentPage: number;
  totalPages: number;
  userRole: string;
}

export default function CandidatesTable({ candidates, currentPage, totalPages, userRole }: CandidatesTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      placed: 'bg-trust-blue-100 text-trust-blue-700 border-trust-blue-200',
      inactive: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      do_not_contact: 'bg-red-100 text-red-700 border-red-200',
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getAvailabilityBadge = (availability: string | null) => {
    if (!availability) return null;
    
    const badges = {
      immediate: 'bg-success-green-100 text-success-green-700',
      within_2_weeks: 'bg-sky-blue-100 text-sky-blue-700',
      within_1_month: 'bg-innovation-orange-100 text-innovation-orange-700',
      not_available: 'bg-wisdom-gray-100 text-wisdom-gray-700',
    };
    
    const labels = {
      immediate: 'Immediate',
      within_2_weeks: '2 Weeks',
      within_1_month: '1 Month',
      not_available: 'Not Available',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[availability as keyof typeof badges]}`}>
        {labels[availability as keyof typeof labels]}
      </span>
    );
  };

  const formatWorkAuth = (workAuth: string | null) => {
    if (!workAuth) return '-';
    const labels = {
      us_citizen: 'US Citizen',
      green_card: 'Green Card',
      h1b: 'H1B',
      opt: 'OPT',
      ead: 'EAD',
      requires_sponsorship: 'Needs Sponsorship',
    };
    return labels[workAuth as keyof typeof labels] || workAuth;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/employee/candidates?${params.toString()}`);
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-wisdom-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-trust-blue-900 mb-2">No candidates found</h3>
        <p className="text-wisdom-gray-600 mb-6">
          Try adjusting your search or filters, or add a new candidate to get started.
        </p>
        <Link href="/employee/candidates/new" className="btn-primary">
          Add Your First Candidate
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Work Auth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-trust-blue-100 flex items-center justify-center">
                      <span className="text-trust-blue-600 font-medium text-sm">
                        {candidate.first_name[0]}{candidate.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/employee/candidates/${candidate.id}`}
                        className="text-sm font-medium text-trust-blue-900 hover:text-trust-blue-700"
                      >
                        {candidate.first_name} {candidate.last_name}
                      </Link>
                      <div className="text-sm text-wisdom-gray-500 flex items-center gap-3 mt-1">
                        {candidate.current_title && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {candidate.current_title}
                          </span>
                        )}
                        {candidate.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {candidate.location}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-wisdom-gray-400 flex items-center gap-3 mt-1">
                        {candidate.email && (
                          <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-trust-blue">
                            <Mail className="w-3 h-3" />
                            {candidate.email}
                          </a>
                        )}
                        {candidate.phone && (
                          <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-trust-blue">
                            <Phone className="w-3 h-3" />
                            {candidate.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(candidate.status)}`}>
                    {candidate.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {candidate.skills && candidate.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-sky-blue-50 text-sky-blue-700 text-xs rounded border border-sky-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills && candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-wisdom-gray-50 text-wisdom-gray-600 text-xs rounded border border-wisdom-gray-200">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getAvailabilityBadge(candidate.availability)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-wisdom-gray-900">
                  {formatWorkAuth(candidate.work_authorization)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-wisdom-gray-900">
                  {candidate.desired_rate_min && candidate.desired_rate_max ? (
                    <span className="font-medium">
                      ${candidate.desired_rate_min}-${candidate.desired_rate_max}/hr
                    </span>
                  ) : (
                    <span className="text-wisdom-gray-400">Not specified</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {candidate.overall_rating ? (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-trust-blue-900">{candidate.overall_rating}</span>
                      <span className="text-xs text-wisdom-gray-500 ml-1">/5</span>
                      <div className="ml-2">
                        {'★'.repeat(candidate.overall_rating)}
                        <span className="text-wisdom-gray-300">{'★'.repeat(5 - candidate.overall_rating)}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-wisdom-gray-400 text-sm">Not rated</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/employee/candidates/${candidate.id}`}
                      className="text-trust-blue hover:text-trust-blue-700"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/employee/candidates/${candidate.id}/edit`}
                      className="text-wisdom-gray-600 hover:text-trust-blue"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-wisdom-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

