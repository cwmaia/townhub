# DESIGNER TASK: Super Admin Components for Quick Actions Space

## OBJECTIVE
Add Super Admin specific components below Quick Actions to fill the empty space with relevant business metrics and town performance data.

## CONTEXT
- Current dashboard works well for Town Admin
- Super Admin needs different metrics focused on platform business
- Empty space below Quick Actions panel (right column)
- User wants: Sales figures, notifications purchased, events sold, town performance

## YOUR TASK

### Component 1: Revenue & Sales Card

**Purpose:** Show platform business metrics for Super Admin

**Create:** `/Users/carlosmaia/townhub/components/dashboard/RevenueSales.tsx`

```tsx
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
          <CardTitle className="text-base font-semibold text-slate-900">
            Revenue & Sales
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            This Month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
```

**Visual Design:**
- Compact rows with icon + label + value + trend
- Green trend badges for positive growth
- Hover effect on rows
- Small icons (w-4 h-4) for density
- Tight spacing (py-2, gap-2)

---

### Component 2: Town Performance Table

**Purpose:** Show multi-town performance comparison for Super Admin

**Create:** `/Users/carlosmaia/townhub/components/dashboard/TownPerformance.tsx`

```tsx
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
          <CardTitle className="text-base font-semibold text-slate-900">
            Town Performance
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
            View All
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
```

**Visual Design:**
- Compact table with 5 columns
- Town name + status badge
- User count prominent
- Content count compact (42P • 28E format)
- Trend with icon + percentage
- Hover effect on rows
- Summary footer with totals
- Dense spacing for information density

---

### Step 3: Integrate into Dashboard

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx`

Add imports:
```tsx
import { RevenueSales } from '@/components/dashboard/RevenueSales';
import { TownPerformance } from '@/components/dashboard/TownPerformance';
```

Update the right column (where Quick Actions is) to add the new components below:

```tsx
{/* Right Column: Quick Actions + Super Admin Metrics */}
<div className="space-y-4">
  {/* Quick Actions */}
  <QuickActions />

  {/* Super Admin Only: Revenue & Sales */}
  {userRole === 'SUPER_ADMIN' && (
    <RevenueSales
      revenue="ISK 240K"
      notificationsPurchased={1248}
      eventsSold={342}
      subscriptionRevenue="ISK 180K"
    />
  )}

  {/* Super Admin Only: Town Performance */}
  {userRole === 'SUPER_ADMIN' && (
    <TownPerformance />
  )}
</div>
```

**Note:** For now, you can show these for all users to demonstrate. Later we'll add proper role checking.

---

## LAYOUT STRUCTURE

**Desktop (1024px+):**
```
┌──────────────────────────────────┬──────────────┐
│ Stats Grid (4 columns)           │              │
├──────────────────────────────────┤              │
│                                  │ Quick Actions│
│ Activity Timeline (70%)          │              │
│                                  ├──────────────┤
│                                  │ Revenue &    │
│                                  │ Sales        │
│                                  ├──────────────┤
│                                  │ Town         │
│                                  │ Performance  │
└──────────────────────────────────┴──────────────┘
```

**Spacing:**
- Between components: `space-y-4` (16px)
- Inside cards: Compact (py-2, gap-2)
- Grid gaps: `gap-4` (16px)

---

## ACCEPTANCE CRITERIA

**Components:**
- ✅ RevenueSales component created
- ✅ TownPerformance component created
- ✅ Both components TypeScript typed
- ✅ Both use shadcn/ui base components

**Visual Quality:**
- ✅ Compact, Grafana-style density
- ✅ Hover effects on rows
- ✅ Status badges color-coded
- ✅ Trend indicators with icons
- ✅ Readable at small sizes
- ✅ Professional appearance

**Functionality:**
- ✅ Revenue shows 4 key metrics
- ✅ Town Performance shows multi-town comparison
- ✅ Both fit in right column
- ✅ No wasted space
- ✅ Responsive on mobile (stack)

**Integration:**
- ✅ Components display below Quick Actions
- ✅ Right column now fully utilized
- ✅ Everything still fits above fold
- ✅ Layout remains balanced

---

## DATA REQUIREMENTS

**For RevenueSales:**
```typescript
interface RevenueData {
  monthlyRevenue: number;        // Total revenue this month
  notificationsPurchased: number; // Count of notifications sold
  eventsSold: number;            // Count of featured events sold
  subscriptionRevenue: number;   // Recurring subscription revenue
}
```

**For TownPerformance:**
```typescript
interface TownData {
  towns: Array<{
    id: string;
    name: string;
    users: number;
    places: number;
    events: number;
    growthRate: number;  // Percentage
    status: 'active' | 'pending' | 'inactive';
  }>;
}
```

---

## TIME ESTIMATE

- RevenueSales component: 20 minutes
- TownPerformance component: 30 minutes
- Integration: 10 minutes
- Testing: 10 minutes

**Total: ~70 minutes**

---

## TESTING

1. Navigate to http://localhost:3000/en/admin
2. Scroll to right column
3. Verify Quick Actions panel
4. Verify Revenue & Sales card below it
5. Verify Town Performance table below that
6. Check all hover effects
7. Verify responsive behavior (mobile stacks)
8. Verify text is readable
9. Verify no layout breaks

---

Begin implementation. This will complete the Super Admin dashboard with relevant business metrics and multi-town oversight! 📊💰
