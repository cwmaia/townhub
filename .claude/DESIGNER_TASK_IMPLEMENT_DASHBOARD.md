# DESIGNER TASK: Implement Dashboard Components

## OBJECTIVE
Build the dashboard components and Town Admin dashboard view based on your design specifications.

## CONTEXT
- You created comprehensive designs in `/Users/carlosmaia/townhub/DASHBOARD_DESIGN_SPECS.md`
- Now implement those designs as working React components
- Start with Town Admin dashboard (most common use case)
- Build reusable component library first

## YOUR TASK

### Phase 1: Create Reusable Components (Priority: HIGH)

#### Step 1: Create StatCard Component

**Create:** `/Users/carlosmaia/townhub/components/dashboard/StatCard.tsx`

```tsx
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
      <CardContent className="p-6">
        {/* Header: Icon + Trend Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            styles.container
          )}>
            <div className={cn('w-6 h-6', styles.icon)}>
              {icon}
            </div>
          </div>
          {trend && (
            <Badge className={cn('font-semibold', styles.badge)}>
              {trend.direction === 'up' && '↑ '}
              {trend.direction === 'down' && '↓ '}
              {trend.value}
            </Badge>
          )}
        </div>

        {/* Main Metric */}
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-600 mt-1">{label}</p>

        {/* Subtitle/Context */}
        {subtitle && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {trend?.direction === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trend?.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
            <span>{subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

#### Step 2: Create Quick Action Panel Component

**Create:** `/Users/carlosmaia/townhub/components/dashboard/QuickActions.tsx`

```tsx
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
```

---

#### Step 3: Create Activity Timeline Component

**Create:** `/Users/carlosmaia/townhub/components/dashboard/ActivityTimeline.tsx`

```tsx
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
```

---

### Phase 2: Implement Town Admin Dashboard

#### Step 4: Update Admin Dashboard Page

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx`

Add imports at the top:
```tsx
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Users, MapPin, Calendar, Bell } from 'lucide-react';
```

Replace the current header section with:
```tsx
{/* Dashboard Header */}
<header className="space-y-1 mb-8">
  <p className="text-xs uppercase tracking-wide text-slate-400">Town overview</p>
  <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
  <p className="text-sm text-slate-500">
    Manage places and events for {town?.name ?? 'Stykkishólmur'}.
  </p>
</header>

{/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatCard
    icon={<Users className="w-6 h-6" />}
    value="342"
    label="Active Users"
    trend={{ value: '+12%', direction: 'up' }}
    subtitle="+28 this week"
    variant="blue"
  />
  <StatCard
    icon={<MapPin className="w-6 h-6" />}
    value={places.length}
    label="Places Listed"
    trend={{ value: '+5%', direction: 'up' }}
    subtitle={`${places.filter(p => p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} added this week`}
    variant="green"
  />
  <StatCard
    icon={<Calendar className="w-6 h-6" />}
    value={events.length}
    label="Upcoming Events"
    trend={{ value: '+8%', direction: 'up' }}
    subtitle="4 this week"
    variant="purple"
  />
  <StatCard
    icon={<Bell className="w-6 h-6" />}
    value="98%"
    label="Notification Reach"
    trend={{ value: '+2%', direction: 'up' }}
    subtitle="Great engagement"
    variant="slate"
  />
</div>

{/* Quick Actions */}
<div className="mb-8">
  <QuickActions />
</div>

{/* Recent Activity */}
<div className="mb-8">
  <ActivityTimeline
    activities={[
      {
        id: '1',
        icon: <MapPin className="w-5 h-5" />,
        title: 'New place added',
        description: 'Café Sjávarborg was added to restaurants',
        timestamp: '2 hours ago',
        status: 'success',
      },
      {
        id: '2',
        icon: <Calendar className="w-5 h-5" />,
        title: 'Event published',
        description: 'Harbor market scheduled for next Saturday',
        timestamp: '5 hours ago',
        status: 'success',
      },
      {
        id: '3',
        icon: <Users className="w-5 h-5" />,
        title: 'New RSVP',
        description: '12 people confirmed for Viking Festival',
        timestamp: '1 day ago',
      },
    ]}
  />
</div>
```

---

### Phase 3: Test and Polish

#### Testing Checklist:
1. Navigate to http://localhost:3000/en/admin
2. Verify stat cards display correctly
3. Check hover effects on stat cards (shadow-md)
4. Test quick action buttons
5. Verify activity timeline shows
6. Check responsive behavior (resize browser)
7. Verify all icons render
8. Check color variants are correct
9. Test on mobile width (< 768px)

#### Polish Items:
- Smooth transitions (200ms)
- Hover states working
- Typography hierarchy clear
- Spacing consistent
- No layout shifts

---

## ACCEPTANCE CRITERIA

**Components:**
- ✅ StatCard component created with 6 color variants
- ✅ QuickActions component created
- ✅ ActivityTimeline component created
- ✅ All components TypeScript typed
- ✅ All components use shadcn/ui base components

**Dashboard:**
- ✅ 4 stat cards showing key metrics
- ✅ Quick actions panel with 4 buttons
- ✅ Activity timeline with recent actions
- ✅ Responsive on mobile/tablet/desktop
- ✅ Hover effects work smoothly
- ✅ Brand color (#003580) used appropriately

**Quality:**
- ✅ Vercel/Linear quality level
- ✅ Professional appearance
- ✅ Clear visual hierarchy
- ✅ Scannable at a glance
- ✅ No console errors
- ✅ No TypeScript errors

---

## DELIVERABLES

1. Three new component files in `/components/dashboard/`
2. Updated admin dashboard page with new components
3. Working, visually polished dashboard
4. All hover states and transitions functional

---

## TIME ESTIMATE

- StatCard: 20 minutes
- QuickActions: 15 minutes
- ActivityTimeline: 20 minutes
- Dashboard integration: 20 minutes
- Testing and polish: 15 minutes

**Total: ~90 minutes**

---

Begin implementation now. Report back with:
1. Components created
2. Dashboard updated
3. Any issues encountered
4. Screenshots or description of result
