import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Bell, BarChart3 } from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      icon: <PlusCircle className="w-6 h-6" />,
      label: 'Create Place',
      href: '#create-place',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Create Event',
      href: '#create-event',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      label: 'Send Alert',
      href: '/admin/notifications',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'View Analytics',
      href: '#analytics',
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {displayActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-slate-50 hover:border-slate-400
                         transition-colors"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href}>
                  <div className="text-slate-600">{action.icon}</div>
                  <span className="text-sm font-medium text-slate-900">{action.label}</span>
                </a>
              ) : (
                <>
                  <div className="text-slate-600">{action.icon}</div>
                  <span className="text-sm font-medium text-slate-900">{action.label}</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
