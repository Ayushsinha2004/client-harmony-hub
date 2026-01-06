import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  subtitle: string;
  actionRequiredCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ 
  title, 
  subtitle, 
  actionRequiredCount = 0,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search leads & clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-72 pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-secondary transition-smooth">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {actionRequiredCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card" />
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm">
            FM
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Fiona McCarthy</p>
            <p className="text-xs text-muted-foreground">Financial Advisor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
