'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface JobsFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialPriority: string;
  initialEmploymentType: string;
  initialRemotePolicy: string;
}

export default function JobsFilters({
  initialSearch,
  initialStatus,
  initialPriority,
  initialEmploymentType,
  initialRemotePolicy,
}: JobsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [employmentType, setEmploymentType] = useState(initialEmploymentType);
  const [remotePolicy, setRemotePolicy] = useState(initialRemotePolicy);
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    if (status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    if (priority !== 'all') {
      params.set('priority', priority);
    } else {
      params.delete('priority');
    }
    
    if (employmentType !== 'all') {
      params.set('employmentType', employmentType);
    } else {
      params.delete('employmentType');
    }
    
    if (remotePolicy !== 'all') {
      params.set('remotePolicy', remotePolicy);
    } else {
      params.delete('remotePolicy');
    }
    
    params.delete('page');
    
    router.push(`/employee/jobs?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setEmploymentType('all');
    setRemotePolicy('all');
    router.push('/employee/jobs');
  };

  const hasActiveFilters = search || status !== 'all' || priority !== 'all' || employmentType !== 'all' || remotePolicy !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wisdom-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by title, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-trust-blue text-white text-xs rounded-full">
              {[search, status !== 'all', priority !== 'all', employmentType !== 'all', remotePolicy !== 'all'].filter(Boolean).length}
            </span>
          )}
        </Button>
        <Button onClick={applyFilters} className="bg-trust-blue hover:bg-trust-blue-700">
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="on_hold">On Hold</option>
              <option value="filled">Filled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All Priorities</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Employment Type
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All Types</option>
              <option value="contract">Contract</option>
              <option value="contract_to_hire">Contract-to-Hire</option>
              <option value="direct_placement">Direct Placement</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          {/* Remote Policy Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Remote Policy
            </label>
            <select
              value={remotePolicy}
              onChange={(e) => setRemotePolicy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="md:col-span-4 flex justify-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

