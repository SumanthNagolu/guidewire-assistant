'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Mail, Phone, Globe, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  tier: string | null;
  annual_revenue: number | null;
  employee_count: string | null;
  notes: string | null;
  created_at: string;
  contacts?: { count: number }[];
}

interface ClientsTableProps {
  clients: Client[];
  currentPage: number;
  totalPages: number;
  userRole: string;
}

export default function ClientsTable({ clients, currentPage, totalPages, userRole }: ClientsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      inactive: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      prospect: 'bg-sky-blue-100 text-sky-blue-700 border-sky-blue-200',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    
    const badges = {
      platinum: 'bg-purple-100 text-purple-700 border-purple-200',
      gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      silver: 'bg-gray-100 text-gray-700 border-gray-300',
      bronze: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    
    const labels = {
      platinum: '💎 Platinum',
      gold: '🥇 Gold',
      silver: '🥈 Silver',
      bronze: '🥉 Bronze',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[tier as keyof typeof badges]}`}>
        {labels[tier as keyof typeof labels]}
      </span>
    );
  };

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return '-';
    if (revenue >= 1000000000) return `$${(revenue / 1000000000).toFixed(1)}B`;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`;
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(1)}K`;
    return `$${revenue}`;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`/employee/clients?${params.toString()}`);
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-wisdom-gray-400 mb-4">
          <Building2 className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-trust-blue-900 mb-2">No clients found</h3>
        <p className="text-wisdom-gray-600 mb-6">
          Try adjusting your search or filters, or add a new client to get started.
        </p>
        <Link href="/employee/clients/new" className="btn-primary">
          Add Your First Client
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
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Contacts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-wisdom-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => {
              const contactCount = client.contacts?.[0]?.count || 0;
              return (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-trust-blue-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-trust-blue-600" />
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/employee/clients/${client.id}`}
                          className="text-sm font-medium text-trust-blue-900 hover:text-trust-blue-700"
                        >
                          {client.name}
                        </Link>
                        <div className="text-sm text-wisdom-gray-500 space-y-1 mt-1">
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-trust-blue">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </a>
                          )}
                          {client.phone && (
                            <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-trust-blue">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </a>
                          )}
                          {client.website && (
                            <a
                              href={client.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-trust-blue"
                            >
                              <Globe className="w-3 h-3" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-wisdom-gray-900">
                    {client.industry || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTierBadge(client.tier)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-wisdom-gray-400" />
                      <span className="text-sm font-medium text-trust-blue-900">{contactCount}</span>
                      <span className="text-xs text-wisdom-gray-500">contacts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {client.annual_revenue ? (
                      <span className="font-medium text-success-green-700">
                        {formatRevenue(client.annual_revenue)}
                      </span>
                    ) : (
                      <span className="text-wisdom-gray-400">Not specified</span>
                    )}
                    {client.employee_count && (
                      <div className="text-xs text-wisdom-gray-500 mt-1">
                        {client.employee_count} employees
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/employee/clients/${client.id}`}
                        className="text-trust-blue hover:text-trust-blue-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/employee/clients/${client.id}/edit`}
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

