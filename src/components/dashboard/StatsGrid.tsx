import { Users, FolderOpen, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

interface StatsGridProps {
  leadsCount: number;
  clientsCount: number;
  actionRequiredCount: number;
}

export function StatsGrid({ leadsCount, clientsCount, actionRequiredCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={Users}
        iconGradient="bg-gradient-blue"
        value={leadsCount}
        label="Active Leads"
        trend="+3 this week"
        trendUp
      />
      <StatCard
        icon={FolderOpen}
        iconGradient="bg-gradient-primary"
        value={clientsCount}
        label="Active Clients"
        trend="+2 this month"
        trendUp
      />
      <StatCard
        icon={AlertTriangle}
        iconGradient="bg-gradient-amber"
        value={actionRequiredCount}
        label="Action Required"
      />
      <StatCard
        icon={TrendingUp}
        iconGradient="bg-gradient-purple"
        value="78%"
        label="Conversion Rate"
      />
    </div>
  );
}
