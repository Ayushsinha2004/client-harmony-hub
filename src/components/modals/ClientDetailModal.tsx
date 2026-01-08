import { useState } from 'react';
import { X, FolderOpen, UserMinus, Check, Clock } from 'lucide-react';
import { Client, PIPELINE_STAGES } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onMarkAsLead: (clientId: string) => Promise<boolean>;
}

export function ClientDetailModal({
  client,
  onClose,
  onMarkAsLead,
}: ClientDetailModalProps) {
  const [saving, setSaving] = useState(false);

  const handleMarkAsLead = async () => {
    setSaving(true);
    const success = await onMarkAsLead(client.id);
    if (success) {
      onClose();
    }
    setSaving(false);
  };

  const checklistItems = [
    { label: 'CashCalc Complete', complete: client.cashcalc_complete },
    { label: 'Risk Profiler Complete', complete: client.typeform_complete },
    { label: `Documents (${client.docs_received}/${client.docs_required})`, complete: client.docs_received >= client.docs_required },
    { label: 'Discovery Call Done', complete: client.stage !== 'new_booking' },
  ];

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card rounded-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between text-primary-foreground bg-gradient-primary"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center font-bold text-lg">
              {client.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold">{client.full_name}</h2>
              <p className="text-sm opacity-85">
                Client since {client.client_since
                  ? format(new Date(client.client_since), 'MMM yyyy')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Contact Info */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Contact Information
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Email</p>
                <p className="text-sm font-semibold text-foreground">{client.email}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Phone</p>
                <p className="text-sm font-semibold text-foreground">{client.phone || 'Not provided'}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Advisor</p>
                <p className="text-sm font-semibold text-foreground">{client.advisor?.full_name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          {client.products && client.products.length > 0 && (
            <div className="px-6 py-5 border-b border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
                Products
              </h3>
              <div className="flex flex-wrap gap-2">
                {client.products.map((product, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium text-foreground"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Requirements Checklist
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {checklistItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-secondary/50 rounded-xl text-[13px]"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      item.complete
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    )}
                  >
                    {item.complete ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <span className={item.complete ? "text-emerald-600" : "text-amber-600"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Client Folder
              </Button>
              <Button
                variant="outline"
                onClick={handleMarkAsLead}
                disabled={saving}
                className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Mark as Lead
              </Button>
            </div>
          </div>

          {/* Review Date */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Review Information
            </h3>
            <div className="bg-secondary/50 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Next Review Date</p>
              <p className={cn(
                "text-sm font-semibold",
                client.review_due_date && new Date(client.review_due_date) <= new Date()
                  ? "text-destructive"
                  : "text-foreground"
              )}>
                {client.review_due_date
                  ? format(new Date(client.review_due_date), 'dd MMMM yyyy')
                  : 'No review scheduled'
                }
              </p>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
                Notes
              </h3>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{client.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
