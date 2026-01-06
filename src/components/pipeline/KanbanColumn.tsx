import { Client, PIPELINE_STAGES, PipelineStage } from '@/types/database';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Client[];
  isDragOver: boolean;
  draggedLead: Client | null;
  onDragStart: (e: React.DragEvent, lead: Client) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onLeadClick: (client: Client) => void;
}

export function KanbanColumn({
  stage,
  leads,
  isDragOver,
  draggedLead,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onLeadClick,
}: KanbanColumnProps) {
  const stageConfig = PIPELINE_STAGES[stage];

  return (
    <div
      className={cn(
        "min-w-[300px] max-w-[300px] rounded-2xl border border-border bg-card/50 flex flex-col transition-all duration-200",
        isDragOver && "kanban-column drag-over"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center justify-between border-b"
        style={{
          backgroundColor: `${stageConfig.color}15`,
          borderColor: `${stageConfig.color}30`,
        }}
      >
        <span className="text-[13px] font-bold" style={{ color: stageConfig.color }}>
          {stageConfig.label}
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${stageConfig.color}20`,
            color: stageConfig.color,
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 overflow-y-auto max-h-[600px] min-h-[100px]">
        {leads.map((lead) => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            isDragging={draggedLead?.id === lead.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onLeadClick}
          />
        ))}
        
        {leads.length === 0 && (
          <div className="text-center py-2 px-2 text-muted-foreground text-[11px] border border-dashed border-border rounded-lg mt-2">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
