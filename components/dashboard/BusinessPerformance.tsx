import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessStats {
  id: string;
  name: string;
  followers: number;
  places: number;
  events: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  status: 'active' | 'pending' | 'inactive';
}

interface BusinessPerformanceProps {
  businesses?: BusinessStats[];
}

export function BusinessPerformance({ businesses }: BusinessPerformanceProps) {
  const defaultBusinesses: BusinessStats[] = [
    {
      id: '1',
      name: 'Narfeyrarstofa',
      followers: 156,
      places: 1,
      events: 12,
      trend: 'up',
      trendValue: '+18%',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sjávarpakkhúsið',
      followers: 89,
      places: 1,
      events: 8,
      trend: 'up',
      trendValue: '+12%',
      status: 'active',
    },
    {
      id: '3',
      name: 'Stykkishólmur Swimming Pool',
      followers: 234,
      places: 1,
      events: 24,
      trend: 'up',
      trendValue: '+25%',
      status: 'active',
    },
    {
      id: '4',
      name: 'Bjarnarhöfn Shark Museum',
      followers: 67,
      places: 1,
      events: 4,
      trend: 'down',
      trendValue: '-5%',
      status: 'active',
    },
  ];

  const displayBusinesses = businesses || defaultBusinesses;

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Business Performance
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900 h-auto p-0">
            View All
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-2 text-xs font-medium text-slate-500
                          uppercase tracking-wide pb-2 border-b border-slate-100">
            <div className="col-span-2">Business</div>
            <div className="text-center">Followers</div>
            <div className="text-center">Content</div>
            <div className="text-right">Trend</div>
          </div>

          {/* Data Rows */}
          {displayBusinesses.map((business) => (
            <div
              key={business.id}
              className="grid grid-cols-5 gap-2 items-center py-2 hover:bg-slate-50
                         px-2 rounded-lg transition-colors cursor-pointer"
            >
              {/* Business Name + Status */}
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {business.name}
                  </p>
                  <Badge className={`${statusColors[business.status]} text-xs mt-1`}>
                    {business.status}
                  </Badge>
                </div>
              </div>

              {/* Followers */}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">
                  {business.followers.toLocaleString()}
                </p>
              </div>

              {/* Content (Places + Events) */}
              <div className="text-center">
                <p className="text-xs text-slate-600">
                  {business.places}P • {business.events}E
                </p>
              </div>

              {/* Trend */}
              <div className="text-right flex items-center justify-end gap-1">
                {business.trend === 'up' && (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                )}
                {business.trend === 'down' && (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-semibold ${
                  business.trend === 'up' ? 'text-green-600' :
                  business.trend === 'down' ? 'text-red-600' :
                  'text-slate-500'
                }`}>
                  {business.trendValue}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{displayBusinesses.length} active businesses</span>
            <span>
              {displayBusinesses.reduce((sum, b) => sum + b.followers, 0).toLocaleString()} total followers
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
