'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ClientsFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialTier: string;
  initialIndustry: string;
}

export default function ClientsFilters({
  initialSearch,
  initialStatus,
  initialTier,
  initialIndustry,
}: ClientsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [tier, setTier] = useState(initialTier);
  const [industry, setIndustry] = useState(initialIndustry);
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString());
    
    if (search) params.set('search', search);
    else params.delete('search');
    
    if (status !== 'all') params.set('status', status);
    else params.delete('status');
    
    if (tier !== 'all') params.set('tier', tier);
    else params.delete('tier');
    
    if (industry !== 'all') params.set('industry', industry);
    else params.delete('industry');
    
    params.delete('page');
    router.push(`/employee/clients?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setTier('all');
    setIndustry('all');
    router.push('/employee/clients');
  };

  const hasActiveFilters = search || status !== 'all' || tier !== 'all' || industry !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wisdom-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, industry, or website..."
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
              {[search, status !== 'all', tier !== 'all', industry !== 'all'].filter(Boolean).length}
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
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Insurance">Insurance</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

