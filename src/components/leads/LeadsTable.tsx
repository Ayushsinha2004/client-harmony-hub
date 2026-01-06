import { Check, Clock } from 'lucide-react';
import { Client, PIPELINE_STAGES } from '@/types/database';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { StageBadge } from '@/components/ui/stage-badge';
import { Button } from '@/components/ui/button';

interface LeadsTableProps {
  leads: Client[];
  onLeadClick: (client: Client) => void;
}

export function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  return (
    <div className="bg-card/90 rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-secondary to-blue-50/50">
        <h2 className="text-base font-semibold text-foreground">All Leads</h2>
        <div className="flex gap-2.5">
          <button className="px-3.5 py-2 rounded-lg border border-primary bg-emerald-50 text-primary text-[13px] font-medium">
            All ({leads.length})
          </button>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary/50">
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Name
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Advisor
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Stage
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Products
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Data Status
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const stage = PIPELINE_STAGES[lead.stage];
            const dataComplete = lead.cashcalc_complete && lead.typeform_complete && lead.docs_received >= lead.docs_required;

            return (
              <tr
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={lead.full_name} gradient={stage.gradient} size="sm" />
                    <div>
                      <div className="font-semibold text-foreground text-sm">{lead.full_name}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {lead.advisor?.full_name || 'Unassigned'}
                </td>
                <td className="px-4 py-3.5">
                  <StageBadge stage={lead.stage} />
                </td>
                <td className="px-4 py-3.5 text-sm text-foreground">
                  {lead.products.slice(0, 2).join(', ')}
                  {lead.products.length > 2 && ` +${lead.products.length - 2}`}
                </td>
                <td className="px-4 py-3.5">
                  {dataComplete ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-600 text-[10px] font-bold">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeadClick(lead);
                    }}
                    className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90"
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
