import { useState } from 'react';
import { Client, PIPELINE_STAGES, PipelineStage } from '@/types/database';
import { KanbanColumn } from './KanbanColumn';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  leads: Client[];
  onLeadClick: (client: Client) => void;
  onStageChange: (clientId: string, newStage: PipelineStage) => Promise<boolean>;
}

export function KanbanBoard({ leads, onLeadClick, onStageChange }: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Client | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStage | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, lead: Client) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: PipelineStage) => {
    e.preventDefault();
    setDragOverColumn(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, stageKey: PipelineStage) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== stageKey) {
      await onStageChange(draggedLead.id, stageKey);
    }
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const stages = Object.keys(PIPELINE_STAGES) as PipelineStage[];

  return (
    <div>
      <p className="text-[13px] text-muted-foreground mb-4">
        💡 Drag and drop cards to move between stages
      </p>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stageKey) => {
          const stageLeads = leads.filter(l => l.stage === stageKey);
          
          return (
            <KanbanColumn
              key={stageKey}
              stage={stageKey}
              leads={stageLeads}
              isDragOver={dragOverColumn === stageKey}
              draggedLead={draggedLead}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, stageKey)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stageKey)}
              onLeadClick={onLeadClick}
            />
          );
        })}
      </div>
    </div>
  );
}
