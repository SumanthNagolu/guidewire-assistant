'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import OpportunityColumn from './OpportunityColumn';
import OpportunityCard from './OpportunityCard';
import { createClient } from '@/lib/supabase/client';

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

interface OpportunitiesBoardProps {
  opportunities: Opportunity[];
  userId: string;
  userRole: string;
}

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-wisdom-gray-100' },
  { id: 'qualified', label: 'Qualified', color: 'bg-sky-blue-100' },
  { id: 'proposal', label: 'Proposal', color: 'bg-innovation-orange-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-trust-blue-100' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-success-green-200' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100' },
];

export default function OpportunitiesBoard({ opportunities, userId, userRole }: OpportunitiesBoardProps) {
  const supabase = createClient() as any; // Type cast for CRM tables
  const [items, setItems] = useState(opportunities);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group opportunities by stage
  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {};
    STAGES.forEach(stage => {
      grouped[stage.id] = items.filter(opp => opp.stage === stage.id);
    });
    return grouped;
  }, [items]);

  // Calculate stage values
  const stageValues = useMemo(() => {
    const values: Record<string, { count: number; value: number; weighted: number }> = {};
    STAGES.forEach(stage => {
      const opps = opportunitiesByStage[stage.id] || [];
      values[stage.id] = {
        count: opps.length,
        value: opps.reduce((sum, opp) => sum + (opp.value || 0), 0),
        weighted: opps.reduce((sum, opp) => sum + (opp.value || 0) * (opp.probability / 100), 0),
      };
    });
    return values;
  }, [opportunitiesByStage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return;

    let newStage = activeItem.stage;

    if (STAGES.some(s => s.id === overId)) {
      newStage = overId;
    } else {
      const overItem = items.find(item => item.id === overId);
      if (overItem) {
        newStage = overItem.stage;
      }
    }

    if (activeItem.stage !== newStage) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === activeId ? { ...item, stage: newStage } : item
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;

    setActiveId(null);

    if (!active) return;

    const activeId = active.id as string;
    const activeItem = items.find(item => item.id === activeId);

    if (!activeItem) return;

    // Update in database
    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          stage: activeItem.stage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeId);

      if (error) {
                setItems(opportunities);
      }
    } catch (err) {
            setItems(opportunities);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return (
    <>
      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {STAGES.map(stage => (
          <div key={stage.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-wisdom-gray-600 mb-1">{stage.label}</div>
            <div className="text-2xl font-heading font-bold text-trust-blue-900">
              {stageValues[stage.id]?.count || 0}
            </div>
            <div className="text-xs text-success-green-600 font-medium mt-1">
              ${((stageValues[stage.id]?.weighted || 0) / 1000).toFixed(0)}K weighted
            </div>
          </div>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <OpportunityColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              color={stage.color}
              opportunities={opportunitiesByStage[stage.id] || []}
              stageValue={stageValues[stage.id]}
              loading={loading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="rotate-3 opacity-80">
              <OpportunityCard opportunity={activeItem} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

