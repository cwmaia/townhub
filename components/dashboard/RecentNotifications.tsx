import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, CheckCircle2, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  timestamp: string;
  recipients: number;
  deliveryRate: number;
  status: 'delivered' | 'sending' | 'scheduled';
}

interface RecentNotificationsProps {
  notifications?: Notification[];
}

export function RecentNotifications({ notifications }: RecentNotificationsProps) {
  const defaultNotifications: Notification[] = [
    {
      id: '1',
      title: 'Weather Advisory: Strong winds expected',
      timestamp: 'Nov 24, 2:30 PM',
      recipients: 342,
      deliveryRate: 98,
      status: 'delivered',
    },
    {
      id: '2',
      title: 'Harbor Market this Saturday',
      timestamp: 'Nov 23, 10:15 AM',
      recipients: 286,
      deliveryRate: 96,
      status: 'delivered',
    },
    {
      id: '3',
      title: 'Road closure: Main Street',
      timestamp: 'Nov 22, 4:45 PM',
      recipients: 342,
      deliveryRate: 99,
      status: 'delivered',
    },
    {
      id: '4',
      title: 'Community meeting reminder',
      timestamp: 'Nov 21, 9:00 AM',
      recipients: 156,
      deliveryRate: 94,
      status: 'delivered',
    },
    {
      id: '5',
      title: 'Festival ticket sales open',
      timestamp: 'Nov 20, 3:20 PM',
      recipients: 342,
      deliveryRate: 97,
      status: 'delivered',
    },
    {
      id: '6',
      title: 'Library hours update',
      timestamp: 'Nov 19, 11:30 AM',
      recipients: 234,
      deliveryRate: 95,
      status: 'delivered',
    },
  ];

  const displayNotifications = notifications || defaultNotifications;

  const statusColors = {
    delivered: 'text-green-600',
    sending: 'text-blue-600',
    scheduled: 'text-yellow-600',
  };

  const statusIcons = {
    delivered: <CheckCircle2 className="w-4 h-4" />,
    sending: <Clock className="w-4 h-4" />,
    scheduled: <Clock className="w-4 h-4" />,
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Notifications</h3>
        <button className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
          View all →
        </button>
      </div>

      <div className="space-y-2">
        {displayNotifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-2 py-1.5 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
          >
            {/* Icon */}
            <div className="w-6 h-6 flex items-center justify-center text-blue-500 shrink-0">
              <Bell className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {notification.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{notification.recipients}</span>
                </div>
                <span className="text-xs text-slate-400">•</span>
                <div className={`flex items-center gap-1 text-xs ${statusColors[notification.status]}`}>
                  {statusIcons[notification.status]}
                  <span>{notification.deliveryRate}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{notification.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
