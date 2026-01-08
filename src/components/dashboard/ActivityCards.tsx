import { AlertTriangle, Calendar } from 'lucide-react';
import { Client, PIPELINE_STAGES } from '@/types/database';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { StageBadge } from '@/components/ui/stage-badge';
import { format } from 'date-fns';

interface ActivityCardsProps {
  leadsNeedingAction: Client[];
  recentLeads: Client[];
  onLeadClick: (client: Client) => void;
}

export function ActivityCards({ leadsNeedingAction, recentLeads, onLeadClick }: ActivityCardsProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm dd-MM-yy');
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Action Required */}
      <div className="bg-card/90 rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-secondary to-blue-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-amber flex items-center justify-center text-primary-foreground">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">Action Required</p>
            <p className="text-xs text-muted-foreground">Leads needing attention</p>
          </div>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {leadsNeedingAction.slice(0, 5).map((lead) => {
            const stage = PIPELINE_STAGES[lead.stage];
            const issue = !lead.cashcalc_complete 
              ? 'CashCalc pending' 
              : !lead.typeform_complete 
                ? 'Risk profiler pending' 
                : 'Signature pending';

            return (
              <li
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <AvatarInitials name={lead.full_name} gradient={stage.gradient} size="sm" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{lead.full_name}</p>
                    <p className="text-xs text-muted-foreground">{issue}</p>
                  </div>
                </div>
                <StageBadge stage={lead.stage} showDot={false} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-card/90 rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-secondary to-blue-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center text-primary-foreground">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">Recent Activity</p>
            <p className="text-xs text-muted-foreground">Latest updates</p>
          </div>
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {recentLeads.slice(0, 3).map((lead) => {
            const stage = PIPELINE_STAGES[lead.stage];
            return (
              <li
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 last:border-0 cursor-pointer transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <AvatarInitials name={lead.full_name} gradient={stage.gradient} size="sm" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{lead.full_name}</p>
                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTimestamp(lead.updated_at)}
                </span>
              </li>
            );
          })}
          {recentLeads.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              No recent activity
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
