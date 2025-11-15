"use client";

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Node,
  Edge,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  MarkerType,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
  Send,
  Settings,
  Trash2,
} from 'lucide-react';

interface WorkflowStage {
  id: string;
  name: string;
  type: string;
  description?: string;
  assignee_role?: string;
  sla_hours?: number;
  actions?: any[];
  conditions?: any[];
}

interface WorkflowTransition {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface WorkflowDesignerProps {
  stages: WorkflowStage[];
  transitions: WorkflowTransition[];
  designerData: any;
  onChange: (stages: WorkflowStage[], transitions: WorkflowTransition[], designerData: any) => void;
  readOnly?: boolean;
}

const stageTypes = [
  { id: 'start', label: 'Start', icon: Play, color: '#10b981' },
  { id: 'task', label: 'Task', icon: CheckCircle, color: '#3b82f6' },
  { id: 'review', label: 'Review', icon: UserCheck, color: '#f59e0b' },
  { id: 'document', label: 'Document', icon: FileText, color: '#8b5cf6' },
  { id: 'wait', label: 'Wait', icon: Clock, color: '#6b7280' },
  { id: 'notification', label: 'Notification', icon: Send, color: '#06b6d4' },
  { id: 'end', label: 'End', icon: CheckCircle, color: '#ef4444' },
];

const nodeTypes = {
  workflowStage: ({ data, selected }: any) => {
    const StageIcon = stageTypes.find(t => t.id === data.type)?.icon || Settings;
    const color = stageTypes.find(t => t.id === data.type)?.color || '#6b7280';
    
    return (
      <div
        className={`px-4 py-3 rounded-lg border-2 bg-white dark:bg-gray-800 cursor-move ${
          selected ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
        }`}
        style={{ minWidth: '150px' }}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            <StageIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{data.name}</div>
            {data.assignee_role && (
              <div className="text-xs text-muted-foreground">{data.assignee_role}</div>
            )}
          </div>
        </div>
        {data.sla_hours && (
          <div className="text-xs text-muted-foreground mt-1">
            SLA: {data.sla_hours}h
          </div>
        )}
      </div>
    );
  },
};

const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
};

export function WorkflowDesigner({
  stages: initialStages,
  transitions: initialTransitions,
  designerData: initialDesignerData,
  onChange,
  readOnly = false,
}: WorkflowDesignerProps) {
  const [nodes, setNodes] = useState<Node[]>(() => 
    initialStages.map((stage, index) => ({
      id: stage.id,
      type: 'workflowStage',
      position: initialDesignerData?.nodePositions?.[stage.id] || { x: 100 + index * 200, y: 100 },
      data: stage,
    }))
  );

  const [edges, setEdges] = useState<Edge[]>(() =>
    initialTransitions.map(transition => ({
      id: transition.id,
      source: transition.source,
      target: transition.target,
      label: transition.label,
      animated: true,
    }))
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showStagePanel, setShowStagePanel] = useState(false);
  const [editingStage, setEditingStage] = useState<WorkflowStage | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (readOnly) return;
      
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      
      // Update designer data with new positions
      const nodePositions = updatedNodes.reduce((acc, node) => ({
        ...acc,
        [node.id]: node.position,
      }), {});
      
      const stages = updatedNodes.map(node => node.data as WorkflowStage);
      const transitions = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      }));
      
      onChange(stages, transitions, { nodePositions });
    },
    [nodes, edges, onChange, readOnly]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (readOnly) return;
      
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      
      const stages = nodes.map(node => node.data as WorkflowStage);
      const transitions = updatedEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      }));
      
      onChange(stages, transitions, { nodePositions: {} });
    },
    [edges, nodes, onChange, readOnly]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly || !params.source || !params.target) return;
      
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: true,
      } as Edge;
      
      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      
      const stages = nodes.map(node => node.data as WorkflowStage);
      const transitions = updatedEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      }));
      
      onChange(stages, transitions, { nodePositions: {} });
    },
    [edges, nodes, onChange, readOnly]
  );

  const addStage = (type: string) => {
    const stageType = stageTypes.find(t => t.id === type);
    if (!stageType) return;
    
    const newStage: WorkflowStage = {
      id: `stage_${Date.now()}`,
      name: `New ${stageType.label}`,
      type,
    };
    
    const newNode: Node = {
      id: newStage.id,
      type: 'workflowStage',
      position: { x: 100 + nodes.length * 150, y: 100 },
      data: newStage,
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    const stages = updatedNodes.map(node => node.data as WorkflowStage);
    const transitions = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));
    
    onChange(stages, transitions, { nodePositions: {} });
  };

  const updateStage = (stageId: string, updates: Partial<WorkflowStage>) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === stageId) {
        return {
          ...node,
          data: { ...node.data, ...updates },
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    
    const stages = updatedNodes.map(node => node.data as WorkflowStage);
    const transitions = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));
    
    onChange(stages, transitions, { nodePositions: {} });
    setEditingStage(null);
  };

  const deleteStage = (stageId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== stageId);
    const updatedEdges = edges.filter(edge => edge.source !== stageId && edge.target !== stageId);
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    
    const stages = updatedNodes.map(node => node.data as WorkflowStage);
    const transitions = updatedEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
    }));
    
    onChange(stages, transitions, { nodePositions: {} });
    setEditingStage(null);
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (!readOnly) {
      setSelectedNode(node);
      setEditingStage(node.data as WorkflowStage);
    }
  };

  return (
    <ReactFlowProvider>
      <div className="h-[600px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          
          {!readOnly && (
            <Panel position="top-left">
              <Card className="p-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStagePanel(!showStagePanel)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stage
                </Button>
                
                {showStagePanel && (
                  <div className="mt-2 space-y-1">
                    {stageTypes.map((type) => (
                      <Button
                        key={type.id}
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          addStage(type.id);
                          setShowStagePanel(false);
                        }}
                      >
                        <type.icon className="mr-2 h-4 w-4" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            </Panel>
          )}
        </ReactFlow>

        {/* Stage Editor Sheet */}
        <Sheet open={!!editingStage} onOpenChange={(open) => !open && setEditingStage(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Stage</SheetTitle>
              <SheetDescription>
                Configure the properties of this workflow stage
              </SheetDescription>
            </SheetHeader>
            
            {editingStage && (
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="stage-name">Name</Label>
                  <Input
                    id="stage-name"
                    value={editingStage.name}
                    onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage-description">Description</Label>
                  <Textarea
                    id="stage-description"
                    value={editingStage.description || ''}
                    onChange={(e) => setEditingStage({ ...editingStage, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {editingStage.type === 'task' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="assignee-role">Assignee Role</Label>
                      <Select
                        value={editingStage.assignee_role || ''}
                        onValueChange={(value) => setEditingStage({ ...editingStage, assignee_role: value })}
                      >
                        <SelectTrigger id="assignee-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="account_manager">Account Manager</SelectItem>
                          <SelectItem value="screener">Screener</SelectItem>
                          <SelectItem value="sourcer">Sourcer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sla-hours">SLA (hours)</Label>
                      <Input
                        id="sla-hours"
                        type="number"
                        value={editingStage.sla_hours || ''}
                        onChange={(e) => setEditingStage({ 
                          ...editingStage, 
                          sla_hours: parseInt(e.target.value) || undefined 
                        })}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => updateStage(editingStage.id, editingStage)}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this stage?')) {
                        deleteStage(editingStage.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </ReactFlowProvider>
  );
}

