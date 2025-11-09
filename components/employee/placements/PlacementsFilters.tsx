'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlacementsFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialEndingSoon: boolean;
}

export default function PlacementsFilters({
  initialSearch,
  initialStatus,
  initialEndingSoon,
}: PlacementsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [endingSoon, setEndingSoon] = useState(initialEndingSoon);
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString());
    
    if (search) params.set('search', search);
    else params.delete('search');
    
    if (status !== 'all') params.set('status', status);
    else params.delete('status');
    
    if (endingSoon) params.set('endingSoon', 'true');
    else params.delete('endingSoon');
    
    params.delete('page');
    router.push(`/employee/placements?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setEndingSoon(false);
    router.push('/employee/placements');
  };

  const hasActiveFilters = search || status !== 'all' || endingSoon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wisdom-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by candidate name..."
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
              {[search, status !== 'all', endingSoon].filter(Boolean).length}
            </span>
          )}
        </Button>
        <Button onClick={applyFilters} className="bg-trust-blue hover:bg-trust-blue-700">
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
              <option value="ended">Ended</option>
              <option value="on_notice">On Notice</option>
              <option value="extended">Extended</option>
            </select>
          </div>

          {/* Ending Soon Toggle */}
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={endingSoon}
                onChange={(e) => setEndingSoon(e.target.checked)}
                className="w-5 h-5 text-innovation-orange rounded focus:ring-innovation-orange"
              />
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-innovation-orange" />
                <span className="text-sm font-medium text-wisdom-gray-700">
                  Ending within 30 days
                </span>
              </div>
            </label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="md:col-span-2 flex justify-end">
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

