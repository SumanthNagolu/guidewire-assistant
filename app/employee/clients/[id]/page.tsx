import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, Edit, Mail, Phone, Globe, MapPin, Building2, DollarSign, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/employee/login');
  }

  // Get client with contacts and jobs
  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      contacts:contacts(count),
      jobs:jobs(count)
    `)
    .eq('id', params.id)
    .is('deleted_at', null)
    .single();

  if (error || !client) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-success-green-100 text-success-green-700 border-success-green-200',
      inactive: 'bg-wisdom-gray-100 text-wisdom-gray-700 border-wisdom-gray-200',
      prospect: 'bg-sky-blue-100 text-sky-blue-700 border-sky-blue-200',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return '';
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
    return { badge: badges[tier as keyof typeof badges], label: labels[tier as keyof typeof labels] };
  };

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return null;
    if (revenue >= 1000000000) return `$${(revenue / 1000000000).toFixed(1)}B`;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}M`;
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(1)}K`;
    return `$${revenue}`;
  };

  const tierStyle = client.tier ? getTierBadge(client.tier) : null;
  const contactCount = client.contacts?.[0]?.count || 0;
  const jobCount = client.jobs?.[0]?.count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/clients" className="text-wisdom-gray-600 hover:text-trust-blue">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-trust-blue-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-trust-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-trust-blue-900">{client.name}</h1>
                  {client.industry && <p className="text-wisdom-gray-600 mt-1">{client.industry}</p>}
                </div>
              </div>
            </div>
            <Link href={`/employee/clients/${client.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Client
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Tier */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">Status & Tier</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-2">Status</div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                {tierStyle && (
                  <div>
                    <div className="text-sm text-wisdom-gray-600 mb-2">Client Tier</div>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${tierStyle.badge}`}>
                      {tierStyle.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-wisdom-gray-700 hover:text-trust-blue">
                    <Mail className="w-5 h-5 text-wisdom-gray-400" />
                    <span>{client.email}</span>
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-3 text-wisdom-gray-700 hover:text-trust-blue">
                    <Phone className="w-5 h-5 text-wisdom-gray-400" />
                    <span>{client.phone}</span>
                  </a>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-wisdom-gray-700 hover:text-trust-blue">
                    <Globe className="w-5 h-5 text-wisdom-gray-400" />
                    <span>Visit Website</span>
                  </a>
                )}
                {client.address && (
                  <div className="flex items-start gap-3 text-wisdom-gray-700">
                    <MapPin className="w-5 h-5 text-wisdom-gray-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-1">Contacts</div>
                  <div className="text-2xl font-bold text-trust-blue-900">{contactCount}</div>
                </div>
                <div>
                  <div className="text-sm text-wisdom-gray-600 mb-1">Active Jobs</div>
                  <div className="text-2xl font-bold text-trust-blue-900">{jobCount}</div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            {(client.annual_revenue || client.employee_count) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">Company Details</h3>
                <div className="space-y-4">
                  {client.annual_revenue && (
                    <div>
                      <div className="text-sm text-wisdom-gray-600 mb-1">Annual Revenue</div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-success-green-500" />
                        <span className="text-xl font-bold text-success-green-700">{formatRevenue(client.annual_revenue)}</span>
                      </div>
                    </div>
                  )}
                  {client.employee_count && (
                    <div>
                      <div className="text-sm text-wisdom-gray-600 mb-1">Employees</div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-trust-blue-500" />
                        <span className="text-xl font-bold text-trust-blue-900">{client.employee_count}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notes */}
            {client.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Internal Notes
                </h3>
                <div className="text-wisdom-gray-700 whitespace-pre-wrap">{client.notes}</div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-100 rounded-lg p-4 text-xs text-wisdom-gray-600">
              <div className="flex items-center justify-between">
                <span>Created: {new Date(client.created_at).toLocaleDateString()}</span>
                <span>Last updated: {new Date(client.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

