import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Bell, Calendar, TrendingUp } from 'lucide-react';

interface SalesMetric {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
}

interface RevenueSalesProps {
  revenue?: string;
  notificationsPurchased?: number;
  eventsSold?: number;
  subscriptionRevenue?: string;
}

export function RevenueSales({
  revenue = 'ISK 240K',
  notificationsPurchased = 1248,
  eventsSold = 342,
  subscriptionRevenue = 'ISK 180K',
}: RevenueSalesProps) {
  const metrics: SalesMetric[] = [
    {
      label: 'Monthly Revenue',
      value: revenue,
      trend: '+18%',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Notifications Sold',
      value: notificationsPurchased.toLocaleString(),
      trend: '+24%',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      label: 'Featured Events',
      value: eventsSold,
      trend: '+12%',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: 'Subscriptions',
      value: subscriptionRevenue,
      trend: '+8%',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Revenue & Sales
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            This Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 hover:bg-slate-50
                       px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center
                              justify-center text-blue-600">
                {metric.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-sm font-bold text-slate-900">{metric.value}</p>
              </div>
            </div>
            {metric.trend && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold">
                {metric.trend}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
