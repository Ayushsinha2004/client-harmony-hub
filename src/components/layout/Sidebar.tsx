import { Home, Users, Kanban, FolderOpen, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Page = 'home' | 'leads' | 'pipeline' | 'clients';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  leadsCount: number;
  clientsCount: number;
  actionRequiredCount: number;
}

export function Sidebar({ 
  activePage, 
  onNavigate, 
  leadsCount, 
  clientsCount, 
  actionRequiredCount 
}: SidebarProps) {
  const { toast } = useToast();

  const handleSync = () => {
    toast({
      title: 'Sync Complete',
      description: 'All systems synchronized',
    });
  };

  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'leads' as Page, label: 'Leads', icon: Users, badge: leadsCount, badgeType: 'danger' },
    { id: 'pipeline' as Page, label: 'Pipeline', icon: Kanban, badge: actionRequiredCount > 0 ? actionRequiredCount : undefined, badgeType: 'danger' },
    { id: 'clients' as Page, label: 'Clients', icon: FolderOpen, badge: clientsCount, badgeType: 'success' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-card/98 border-r border-border z-50 shadow-soft">
      {/* Logo */}
      <div className="p-5 border-b border-border/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-primary">
          FP
        </div>
        <div className="font-bold text-lg text-foreground">
          FPMS <span className="text-primary">Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-none text-sm font-semibold cursor-pointer transition-smooth mb-1 text-left",
                isActive
                  ? "bg-gradient-primary text-primary-foreground shadow-primary"
                  : "bg-transparent text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-primary-foreground/25 text-primary-foreground"
                      : item.badgeType === 'success'
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-border my-4" />

        {/* Quick Actions */}
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3.5 mb-2">
          Quick Actions
        </p>
        <button
          onClick={handleSync}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-none bg-transparent text-muted-foreground text-sm font-semibold cursor-pointer transition-smooth hover:bg-secondary"
        >
          <RefreshCw className="w-5 h-5" />
          Sync Systems
        </button>
      </nav>
    </aside>
  );
}
