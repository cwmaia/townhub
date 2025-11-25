import { Card } from '@/components/ui/card';

interface Activity {
  id: string;
  icon: React.ReactNode;
  title: string;
  timestamp: string;
}

interface ActivityTimelineCompactProps {
  activities: Activity[];
}

export function ActivityTimelineCompact({ activities }: ActivityTimelineCompactProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
        <button className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
          View all →
        </button>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-2 py-1.5 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
            >
              {/* Small icon */}
              <div className="w-6 h-6 flex items-center justify-center text-slate-400 shrink-0">
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500">{activity.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
