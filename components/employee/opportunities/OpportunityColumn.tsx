'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import OpportunityCard from './OpportunityCard';

interface Opportunity {
  id: string;
  stage: string;
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

interface OpportunityColumnProps {
  id: string;
  label: string;
  color: string;
  opportunities: Opportunity[];
  stageValue: { count: number; value: number; weighted: number };
  loading: boolean;
}

export default function OpportunityColumn({ 
  id, 
  label, 
  color, 
  opportunities, 
  stageValue,
  loading 
}: OpportunityColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div
        className={`rounded-lg border-2 ${
          isOver ? 'border-trust-blue bg-trust-blue-50' : 'border-gray-200 bg-white'
        } transition-colors`}
      >
        {/* Column Header */}
        <div className={`px-4 py-3 ${color} border-b border-gray-200 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-trust-blue-900">
                {label}
              </h3>
              <div className="text-xs text-trust-blue-700 mt-1">
                {formatValue(stageValue.value)} total
              </div>
            </div>
            <span className="px-2 py-1 bg-white text-trust-blue-900 text-xs font-semibold rounded-full">
              {opportunities.length}
            </span>
          </div>
        </div>

        {/* Column Content */}
        <div
          ref={setNodeRef}
          className="p-3 space-y-3 min-h-[500px] max-h-[calc(100vh-360px)] overflow-y-auto"
        >
          <SortableContext
            items={opportunities.map(opp => opp.id)}
            strategy={verticalListSortingStrategy}
          >
            {opportunities.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-wisdom-gray-400 text-sm">
                Drop opportunities here
              </div>
            ) : (
              opportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

