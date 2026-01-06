import { PIPELINE_STAGES, PipelineStage } from '@/types/database';

interface PipelineStatsProps {
  counts: Record<PipelineStage, number>;
  onStageClick: () => void;
}

export function PipelineStats({ counts, onStageClick }: PipelineStatsProps) {
  return (
    <div className="grid grid-cols-6 gap-3 mb-6">
      {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stageKey) => {
        const stage = PIPELINE_STAGES[stageKey];
        return (
          <div
            key={stageKey}
            onClick={onStageClick}
            className="bg-card/80 rounded-xl p-4 border border-border text-center cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-soft"
            style={{ borderLeftWidth: '3px', borderLeftColor: stage.color }}
          >
            <div 
              className="text-2xl font-bold"
              style={{ color: stage.color }}
            >
              {counts[stageKey]}
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground mt-1">
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
