import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  iconGradient: string;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ icon: Icon, iconGradient, value, label, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-card/90 rounded-2xl p-5 border border-border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lift">
      <div className="flex justify-between items-start mb-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground", iconGradient)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-lg",
            trendUp 
              ? "bg-emerald-100 text-emerald-600" 
              : "bg-red-100 text-red-600"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
