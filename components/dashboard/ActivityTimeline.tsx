import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface Activity {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error';
}

interface ActivityTimelineProps {
  activities: Activity[];
  title?: string;
  showViewAll?: boolean;
}

const statusColors = {
  success: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
};

export function ActivityTimeline({
  activities,
  title = 'Recent Activity',
  showViewAll = true,
}: ActivityTimelineProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-slate-200 transition-colors">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <Badge className={statusColors[activity.status]} variant="outline">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
