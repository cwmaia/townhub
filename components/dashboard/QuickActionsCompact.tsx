import { Card } from '@/components/ui/card';
import { PlusCircle, Calendar, Bell, BarChart3 } from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface QuickActionsCompactProps {
  actions?: QuickAction[];
}

export function QuickActionsCompact({ actions }: QuickActionsCompactProps) {
  const defaultActions: QuickAction[] = [
    {
      icon: <PlusCircle className="w-5 h-5" />,
      label: 'Place',
      href: '#create-place',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Event',
      href: '#create-event',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Alert',
      href: '/admin/notifications',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Analytics',
      href: '#analytics',
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-2">
        {displayActions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg
                       border border-slate-200 hover:border-slate-300
                       hover:bg-slate-50 transition-colors"
          >
            <div className="text-slate-600">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-slate-700">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
