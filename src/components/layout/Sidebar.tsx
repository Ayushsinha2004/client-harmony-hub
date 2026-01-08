import { Home, Users, Kanban, FolderOpen, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  leadsCount: number;
  clientsCount: number;
  actionRequiredCount: number;
}

export function Sidebar({
  leadsCount,
  clientsCount,
  actionRequiredCount
}: SidebarProps) {
  const { toast } = useToast();
  const location = useLocation();

  const handleSync = () => {
    toast({
      title: 'Sync Complete',
      description: 'All systems synchronized',
    });
  };

  const navItems = [
    { id: 'home', path: '/home', label: 'Home', icon: Home },
    { id: 'leads', path: '/leads', label: 'Leads', icon: Users, badge: leadsCount, badgeType: 'danger' },
    { id: 'pipeline', path: '/pipeline', label: 'Pipeline', icon: Kanban, badge: actionRequiredCount > 0 ? actionRequiredCount : undefined, badgeType: 'danger' },
    { id: 'clients', path: '/clients', label: 'Clients', icon: FolderOpen, badge: clientsCount, badgeType: 'success' },
  ];

  const isPathActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) return true;
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-card/98 border-r border-border z-50 shadow-soft">
      {/* Logo */}
      <div className="p-5 border-b border-border/50 flex items-center justify-center">
        <img
          src="https://images.squarespace-cdn.com/content/v1/66d99eb292ba360244af5ddd/9729ebf5-26f6-4db6-ba2f-76914bb0adf4/FPM.png?format=1500w"
          alt="FPM Logo"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-none text-sm font-semibold cursor-pointer transition-smooth mb-1 text-left no-underline",
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
            </Link>
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

