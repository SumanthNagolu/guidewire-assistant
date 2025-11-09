'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, MapPin, Briefcase, DollarSign, Calendar, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  remote_policy: string;
  employment_type: string;
  rate_type: string;
  rate_min: number | null;
  rate_max: number | null;
  duration_months: number | null;
  status: string;
  priority: string;
  openings: number;
  filled: number;
  posted_date: string | null;
  target_fill_date: string | null;
  client: { id: string; name: string } | null;
  created_at: string;
}

interface JobsTableProps {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
  userRole: string;
}

export default function JobsTable({ jobs, currentPage, totalPages, userRole }: JobsTableProps) {
  const router = useRouter();

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
      hot: '🔥 Hot',
      warm: 'Warm',
      cold: 'Cold',
    };
    return { badge: badges[priority as keyof typeof badges], label: labels[priority as keyof typeof labels] };
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/employee/jobs?${params.toString()}`);
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-wisdom-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-trust-blue-900 mb-2">No jobs found</h3>
        <p className="text-wisdom-gray-600 mb-6">
          Try adjusting your search or filters, or add a new job requisition to get started.
        </p>
        <Link href="/employee/jobs/new" className="btn-primary">
          Add Your First Job
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
                Job Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Openings
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => {
              const priorityStyle = getPriorityBadge(job.priority);
              return (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/employee/jobs/${job.id}`}
                        className="text-sm font-medium text-trust-blue-900 hover:text-trust-blue-700"
                      >
                        {job.title}
                      </Link>
                      <div className="text-sm text-wisdom-gray-500 flex items-center gap-3 mt-1">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {formatRemotePolicy(job.remote_policy)}
                        </span>
                      </div>
                      {job.target_fill_date && (
                        <div className="text-xs text-wisdom-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Target: {new Date(job.target_fill_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {job.client ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-trust-blue-500" />
                        <span className="text-sm text-trust-blue-900 font-medium">
                          {job.client.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-wisdom-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${priorityStyle.badge}`}>
                      {priorityStyle.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-trust-blue-900 font-medium">
                        {formatEmploymentType(job.employment_type)}
                      </div>
                      {job.duration_months && (
                        <div className="text-wisdom-gray-500 text-xs">
                          {job.duration_months} months
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {job.rate_min && job.rate_max ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-success-green-500" />
                        <span className="font-medium text-trust-blue-900">
                          ${job.rate_min}-${job.rate_max}
                        </span>
                        <span className="text-wisdom-gray-500 text-xs">
                          /{job.rate_type === 'hourly' ? 'hr' : 'yr'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-wisdom-gray-400">Not specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-trust-blue-900">
                        {job.filled}/{job.openings}
                      </div>
                      <div className="text-wisdom-gray-500 text-xs">filled</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/employee/jobs/${job.id}`}
                        className="text-trust-blue hover:text-trust-blue-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/employee/jobs/${job.id}/edit`}
                        className="text-wisdom-gray-600 hover:text-trust-blue"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
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

