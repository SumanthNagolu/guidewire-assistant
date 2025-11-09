'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Building2, Calendar, DollarSign, TrendingUp, GripVertical } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  value: number | null;
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
  client: {
    id: string;
    name: string;
    industry: string | null;
    tier: string | null;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatValue = (value: number | null) => {
    if (!value) return 'TBD';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return null;
    const badges = {
      platinum: '💎',
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉',
    };
    return badges[tier as keyof typeof badges];
  };

  const weightedValue = opportunity.value ? (opportunity.value * opportunity.probability) / 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'ring-2 ring-trust-blue' : ''
      }`}
    >
      <div className="p-4">
        {/* Drag Handle */}
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-wisdom-gray-400 hover:text-trust-blue pt-1"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-3">
              <h4 className="font-medium text-trust-blue-900 text-sm mb-1 truncate">
                {opportunity.title}
              </h4>
              
              {/* Client */}
              <Link
                href={`/employee/clients/${opportunity.client.id}`}
                className="flex items-center gap-1 text-xs text-sky-blue-700 hover:underline"
              >
                <Building2 className="w-3 h-3" />
                <span className="truncate">{opportunity.client.name}</span>
                {getTierBadge(opportunity.client.tier) && (
                  <span className="ml-1">{getTierBadge(opportunity.client.tier)}</span>
                )}
              </Link>
            </div>

            {/* Value & Probability */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-wisdom-gray-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Deal Value
                </span>
                <span className="font-semibold text-trust-blue-900">
                  {formatValue(opportunity.value)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-wisdom-gray-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Probability
                </span>
                <span className="font-semibold text-success-green-700">
                  {opportunity.probability}%
                </span>
              </div>

              {/* Weighted Value */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-wisdom-gray-600">Weighted Value</span>
                  <span className="font-bold text-success-green-700">
                    {formatValue(weightedValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Close Date */}
            {opportunity.expected_close_date && (
              <div className="flex items-center gap-1 text-xs text-wisdom-gray-500 pt-3 border-t border-gray-100">
                <Calendar className="w-3 h-3" />
                <span>
                  Close: {new Date(opportunity.expected_close_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

