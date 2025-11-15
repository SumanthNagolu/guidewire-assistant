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
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import PipelineColumn from './PipelineColumn';
import ApplicationCard from './ApplicationCard';
import { createClient } from '@/lib/supabase/client';

interface Application {
  id: string;
  stage: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    skills: string[];
    current_title: string | null;
    location: string | null;
  };
  job: {
    id: string;
    title: string;
    clients?: { name: string } | null;
  };
  status: string;
  applied_date: string;
  notes: string | null;
}

interface PipelineBoardProps {
  applications: Application[];
  userId: string;
  userRole: string;
}

const STAGES = [
  { id: 'sourced', label: 'Sourced', color: 'bg-wisdom-gray-100' },
  { id: 'submitted', label: 'Submitted', color: 'bg-sky-blue-100' },
  { id: 'phone_screen', label: 'Phone Screen', color: 'bg-innovation-orange-100' },
  { id: 'interview', label: 'Interview', color: 'bg-trust-blue-100' },
  { id: 'offer', label: 'Offer', color: 'bg-success-green-100' },
  { id: 'placed', label: 'Placed', color: 'bg-success-green-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100' },
];

export default function PipelineBoard({ applications, userId, userRole }: PipelineBoardProps) {
  const supabase = createClient() as any; // Type cast for CRM tables
  const [items, setItems] = useState(applications);
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

  // Group applications by stage
  const applicationsByStage = useMemo(() => {
    const grouped: Record<string, Application[]> = {};
    STAGES.forEach(stage => {
      grouped[stage.id] = items.filter(app => app.stage === stage.id);
    });
    return grouped;
  }, [items]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active item
    const activeItem = items.find(item => item.id === activeId);
    if (!activeItem) return;

    // Determine the new stage
    let newStage = activeItem.stage;

    // If dragging over a stage container
    if (STAGES.some(s => s.id === overId)) {
      newStage = overId;
    } else {
      // If dragging over another application card
      const overItem = items.find(item => item.id === overId);
      if (overItem) {
        newStage = overItem.stage;
      }
    }

    // Update local state optimistically
    if (activeItem.stage !== newStage) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === activeId ? { ...item, stage: newStage } : item
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeItem = items.find(item => item.id === activeId);

    if (!activeItem) return;

    // Update in database
    setLoading(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          stage: activeItem.stage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeId);

      if (error) {
                // Revert on error
        setItems(applications);
      }
    } catch (err) {
            setItems(applications);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <PipelineColumn
            key={stage.id}
            id={stage.id}
            label={stage.label}
            color={stage.color}
            applications={applicationsByStage[stage.id] || []}
            loading={loading}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 opacity-80">
            <ApplicationCard application={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

