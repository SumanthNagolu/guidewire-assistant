'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Calendar, DollarSign, AlertCircle, User, Briefcase, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Placement {
  id: string;
  start_date: string;
  end_date: string | null;
  bill_rate: number | null;
  pay_rate: number | null;
  status: string;
  contract_type: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    clients?: { name: string } | null;
  };
  recruiter: {
    id: string;
    full_name: string;
  } | null;
}

interface PlacementsTableProps {
  placements: Placement[];
  currentPage: number;
  totalPages: number;
  userRole: string;
}

export default function PlacementsTable({ placements, currentPage, totalPages, userRole }: PlacementsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      ended: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      on_notice: 'bg-innovation-orange-100 text-innovation-orange-700 border-innovation-orange-200',
      extended: 'bg-trust-blue-100 text-trust-blue-700 border-trust-blue-200',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatContractType = (type: string) => {
    const labels = {
      w2: 'W2',
      c2c: 'C2C',
      '1099': '1099',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/employee/placements?${params.toString()}`);
  };

  if (!placements || placements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-wisdom-gray-400 mb-4">
          <Briefcase className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-trust-blue-900 mb-2">No placements found</h3>
        <p className="text-wisdom-gray-600 mb-6">
          Try adjusting your search or filters, or add a new placement to get started.
        </p>
        <Link href="/employee/placements/new" className="btn-primary">
          Add Your First Placement
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
                Job & Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Rates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {placements.map((placement) => {
              const daysRemaining = getDaysRemaining(placement.end_date);
              const isEndingSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
              
              return (
                <tr key={placement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-trust-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-trust-blue-600" />
                      </div>
                      <div>
                        <Link
                          href={`/employee/candidates/${placement.candidate.id}`}
                          className="text-sm font-medium text-trust-blue-900 hover:text-trust-blue-700"
                        >
                          {placement.candidate.first_name} {placement.candidate.last_name}
                        </Link>
                        <div className="text-xs text-wisdom-gray-500">{placement.candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/employee/jobs/${placement.job.id}`}
                        className="text-sm font-medium text-trust-blue-900 hover:text-trust-blue-700"
                      >
                        {placement.job.title}
                      </Link>
                      {placement.job.clients?.name && (
                        <div className="text-xs text-wisdom-gray-500 flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {placement.job.clients.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-sky-blue-50 text-sky-blue-700 text-xs font-medium rounded border border-sky-blue-200">
                      {formatContractType(placement.contract_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-wisdom-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(placement.start_date).toLocaleDateString()}</span>
                      </div>
                      {placement.end_date && (
                        <>
                          <div className="text-xs text-wisdom-gray-500 mt-1">
                            to {new Date(placement.end_date).toLocaleDateString()}
                          </div>
                          {isEndingSoon && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-innovation-orange-700">
                              <AlertCircle className="w-3 h-3" />
                              <span>{daysRemaining} days left</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      {placement.bill_rate && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-success-green-500" />
                          <span className="font-medium text-success-green-700">${placement.bill_rate}/hr</span>
                          <span className="text-xs text-wisdom-gray-500">bill</span>
                        </div>
                      )}
                      {placement.pay_rate && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-trust-blue-500" />
                          <span className="font-medium text-trust-blue-700">${placement.pay_rate}/hr</span>
                          <span className="text-xs text-wisdom-gray-500">pay</span>
                        </div>
                      )}
                      {placement.bill_rate && placement.pay_rate && (
                        <div className="text-xs text-wisdom-gray-600 pt-1 border-t border-gray-100">
                          Margin: ${placement.bill_rate - placement.pay_rate}/hr
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(placement.status)}`}>
                      {placement.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/employee/placements/${placement.id}`}
                      className="text-trust-blue hover:text-trust-blue-700"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
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

