import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TownStats {
  id: string;
  name: string;
  users: number;
  places: number;
  events: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  status: 'active' | 'pending' | 'inactive';
}

interface TownPerformanceProps {
  towns?: TownStats[];
}

export function TownPerformance({ towns }: TownPerformanceProps) {
  const defaultTowns: TownStats[] = [
    {
      id: '1',
      name: 'Stykkishólmur',
      users: 342,
      places: 42,
      events: 28,
      trend: 'up',
      trendValue: '+12%',
      status: 'active',
    },
    {
      id: '2',
      name: 'Akureyri',
      users: 1248,
      places: 156,
      events: 87,
      trend: 'up',
      trendValue: '+18%',
      status: 'active',
    },
    {
      id: '3',
      name: 'Reykjavík',
      users: 5432,
      places: 324,
      events: 156,
      trend: 'up',
      trendValue: '+8%',
      status: 'active',
    },
    {
      id: '4',
      name: 'Ísafjörður',
      users: 156,
      places: 28,
      events: 12,
      trend: 'down',
      trendValue: '-3%',
      status: 'active',
    },
  ];

  const displayTowns = towns || defaultTowns;

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
            Town Performance
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
            <div className="col-span-2">Town</div>
            <div className="text-center">Users</div>
            <div className="text-center">Content</div>
            <div className="text-right">Trend</div>
          </div>

          {/* Data Rows */}
          {displayTowns.map((town) => (
            <div
              key={town.id}
              className="grid grid-cols-5 gap-2 items-center py-2 hover:bg-slate-50
                         px-2 rounded-lg transition-colors cursor-pointer"
            >
              {/* Town Name + Status */}
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {town.name}
                  </p>
                  <Badge className={`${statusColors[town.status]} text-xs mt-1`}>
                    {town.status}
                  </Badge>
                </div>
              </div>

              {/* Users */}
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">
                  {town.users.toLocaleString()}
                </p>
              </div>

              {/* Content (Places + Events) */}
              <div className="text-center">
                <p className="text-xs text-slate-600">
                  {town.places}P • {town.events}E
                </p>
              </div>

              {/* Trend */}
              <div className="text-right flex items-center justify-end gap-1">
                {town.trend === 'up' && (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                )}
                {town.trend === 'down' && (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-semibold ${
                  town.trend === 'up' ? 'text-green-600' :
                  town.trend === 'down' ? 'text-red-600' :
                  'text-slate-500'
                }`}>
                  {town.trendValue}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{displayTowns.length} active towns</span>
            <span>
              {displayTowns.reduce((sum, t) => sum + t.users, 0).toLocaleString()} total users
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
