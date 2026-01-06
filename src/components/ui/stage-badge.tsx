import { PIPELINE_STAGES, PipelineStage } from '@/types/database';
import { cn } from '@/lib/utils';

interface StageBadgeProps {
  stage: PipelineStage;
  showDot?: boolean;
  className?: string;
}

export function StageBadge({ stage, showDot = true, className }: StageBadgeProps) {
  const config = PIPELINE_STAGES[stage];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
        className
      )}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
