import { Client, PIPELINE_STAGES } from '@/types/database';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  lead: Client;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, lead: Client) => void;
  onDragEnd: () => void;
  onClick: (client: Client) => void;
}

export function KanbanCard({ lead, isDragging, onDragStart, onDragEnd, onClick }: KanbanCardProps) {
  const stage = PIPELINE_STAGES[lead.stage];
  const needsData = !lead.cashcalc_complete || !lead.typeform_complete;
  const needsDocs = lead.docs_received < lead.docs_required;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(lead)}
      className={cn(
        "bg-card rounded-xl p-3.5 border border-border mb-2.5 cursor-grab select-none transition-all duration-200 hover:shadow-lift hover:border-primary",
        isDragging && "kanban-card dragging"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <AvatarInitials name={lead.full_name} gradient={stage.gradient} size="sm" />
        <div>
          <div className="text-sm font-semibold text-foreground">{lead.full_name}</div>
          <div className="text-xs text-muted-foreground">
            {lead.advisor?.full_name || 'Unassigned'}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-secondary/50 rounded-lg p-2.5 text-xs">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">Products</span>
          <span className="text-foreground font-semibold">
            {lead.products.slice(0, 2).join(', ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Documents</span>
          <span className="text-foreground font-semibold">
            {lead.docs_received}/{lead.docs_required}
          </span>
        </div>
      </div>

      {/* Alert Badges */}
      {(needsData || needsDocs) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {!lead.cashcalc_complete && lead.stage !== 'new_booking' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
              CashCalc
            </span>
          )}
          {!lead.typeform_complete && lead.stage !== 'new_booking' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
              Risk Profiler
            </span>
          )}
          {needsDocs && lead.docs_required > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold">
              Docs
            </span>
          )}
        </div>
      )}
    </div>
  );
}
