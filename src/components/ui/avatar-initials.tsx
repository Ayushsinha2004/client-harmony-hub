import { cn } from '@/lib/utils';

interface AvatarInitialsProps {
  name: string;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarInitials({ 
  name, 
  gradient = 'bg-gradient-primary', 
  size = 'md',
  className 
}: AvatarInitialsProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center text-primary-foreground font-bold",
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
