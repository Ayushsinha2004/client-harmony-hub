import { Client } from '@/types/database';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { format } from 'date-fns';

interface ClientsGridProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
}

export function ClientsGrid({ clients, onClientClick }: ClientsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {clients.map((client) => {
        const isReviewDue = client.review_due_date && new Date(client.review_due_date) <= new Date();
        
        return (
          <div
            key={client.id}
            onClick={() => onClientClick(client)}
            className="bg-card/90 rounded-2xl p-5 border border-border cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lift hover:border-primary"
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-3.5">
              <AvatarInitials name={client.full_name} gradient="bg-gradient-primary" size="lg" />
              <div>
                <div className="text-base font-semibold text-foreground">{client.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  Client since {client.client_since 
                    ? format(new Date(client.client_since), 'MMM yyyy')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {client.products.map((product, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-secondary rounded-md text-[11px] font-semibold text-muted-foreground"
                >
                  {product}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3.5 border-t border-border/50">
              <span className={`text-xs ${isReviewDue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {client.review_due_date 
                  ? `Review: ${format(new Date(client.review_due_date), 'dd MMM yyyy')}`
                  : 'No review scheduled'
                }
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                Active
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
