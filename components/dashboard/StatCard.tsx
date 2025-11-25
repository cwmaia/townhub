import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
}

const variantStyles = {
  blue: {
    container: 'bg-blue-100',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  green: {
    container: 'bg-green-100',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  yellow: {
    container: 'bg-yellow-100',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  red: {
    container: 'bg-red-100',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  purple: {
    container: 'bg-purple-100',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  slate: {
    container: 'bg-slate-100',
    icon: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export function StatCard({
  icon,
  value,
  label,
  trend,
  subtitle,
  variant = 'blue',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header: Icon + Trend Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            styles.container
          )}>
            <div className={cn('w-5 h-5', styles.icon)}>
              {icon}
            </div>
          </div>
          {trend && (
            <Badge className={cn('font-semibold text-xs', styles.badge)}>
              {trend.direction === 'up' && '↑ '}
              {trend.direction === 'down' && '↓ '}
              {trend.value}
            </Badge>
          )}
        </div>

        {/* Main Metric */}
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>

        {/* Subtitle/Context */}
        {subtitle && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            {trend?.direction === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trend?.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
            <span>{subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
