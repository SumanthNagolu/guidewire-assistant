'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CandidatesFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialAvailability: string;
  initialWorkAuth: string;
}

export default function CandidatesFilters({
  initialSearch,
  initialStatus,
  initialAvailability,
  initialWorkAuth,
}: CandidatesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [availability, setAvailability] = useState(initialAvailability);
  const [workAuth, setWorkAuth] = useState(initialWorkAuth);
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
    
    if (availability !== 'all') {
      params.set('availability', availability);
    } else {
      params.delete('availability');
    }
    
    if (workAuth !== 'all') {
      params.set('workAuth', workAuth);
    } else {
      params.delete('workAuth');
    }
    
    params.delete('page'); // Reset to page 1 on filter change
    
    router.push(`/employee/candidates?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setAvailability('all');
    setWorkAuth('all');
    router.push('/employee/candidates');
  };

  const hasActiveFilters = search || status !== 'all' || availability !== 'all' || workAuth !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wisdom-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, email, title, or skills..."
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
              {[search, status !== 'all', availability !== 'all', workAuth !== 'all'].filter(Boolean).length}
            </span>
          )}
        </Button>
        <Button onClick={applyFilters} className="bg-trust-blue hover:bg-trust-blue-700">
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
              <option value="active">Active</option>
              <option value="placed">Placed</option>
              <option value="inactive">Inactive</option>
              <option value="do_not_contact">Do Not Contact</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All</option>
              <option value="immediate">Immediate</option>
              <option value="within_2_weeks">Within 2 Weeks</option>
              <option value="within_1_month">Within 1 Month</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>

          {/* Work Authorization Filter */}
          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Work Authorization
            </label>
            <select
              value={workAuth}
              onChange={(e) => setWorkAuth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All</option>
              <option value="us_citizen">US Citizen</option>
              <option value="green_card">Green Card</option>
              <option value="h1b">H1B</option>
              <option value="opt">OPT</option>
              <option value="ead">EAD</option>
              <option value="requires_sponsorship">Requires Sponsorship</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="md:col-span-3 flex justify-end">
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

