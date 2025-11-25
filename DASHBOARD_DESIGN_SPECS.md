# Dashboard Design Specifications

**Date:** November 24, 2025
**Purpose:** Transform generic admin dashboard into role-specific, visually rich views
**Target Quality:** Vercel, Linear, Stripe dashboard level
**Brand Color:** #003580 (Deep Blue)

---

## Executive Summary

**Current State:**
The admin dashboard is functional but generic - same view for all admin roles. It shows places, events, and basic counts, but lacks visual richness, data visualization, and role-specific insights.

**Target Outcome:**
Three distinct dashboard views tailored to each role:
1. **Super Admin** - Platform-wide management, multi-town oversight
2. **Town Admin** - Town-specific content management and engagement
3. **Business Admin** - Business performance, subscription, and growth

**Key Improvements:**
- Role-specific layouts and metrics
- Data visualization (charts, graphs, trends)
- Quick action panels for common tasks
- Activity feeds and timelines
- Visual stat cards with icons and trends
- Progress indicators and goal tracking
- Professional appearance matching Vercel/Linear quality

**Implementation Time:** 3-4 hours for full component library + all three dashboards

---

## Design Principles

### 1. Role-Specific Intelligence
- Show only relevant metrics for each role
- Surface actionable insights, not just data
- Prioritize information by importance to role

### 2. Visual Data Communication
- Numbers with context (trends, comparisons)
- Charts and graphs for patterns
- Color-coded status indicators
- Icons for quick recognition

### 3. Action-Oriented Design
- Quick action panels prominent
- Common tasks accessible
- Clear call-to-action buttons
- Reduce clicks to complete tasks

### 4. Scannable Layout
- F-pattern reading flow
- Grid-based structure
- Generous whitespace
- Clear section hierarchy

### 5. Premium Quality
- Smooth transitions
- Refined micro-interactions
- Professional color usage
- Consistent spacing and typography

---

## Reusable Component Library

### 1. Stat Card Component

**Purpose:** Display key metric with visual context

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    {/* Header: Icon + Trend Badge */}
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        <UsersIcon className="w-6 h-6 text-blue-600" />
      </div>
      <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">
        ↑ 12%
      </Badge>
    </div>

    {/* Main Metric */}
    <p className="text-3xl font-bold text-slate-900">1,234</p>
    <p className="text-sm font-medium text-slate-600 mt-1">Total Users</p>

    {/* Subtitle/Trend */}
    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
      <TrendingUpIcon className="w-3 h-3 text-green-600" />
      <span>+56 this week</span>
    </div>
  </CardContent>
</Card>
```

**Component Props:**
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;      // "+12%", "-5%"
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;    // "+56 this week"
  variant: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
}
```

**Color Variants:**

**Blue (Primary/Users):**
```tsx
bg-blue-100 text-blue-600        // Icon container
border-blue-200 text-blue-800    // Trend badge
```

**Green (Success/Revenue):**
```tsx
bg-green-100 text-green-600
border-green-200 text-green-800
```

**Yellow (Warning/Pending):**
```tsx
bg-yellow-100 text-yellow-600
border-yellow-200 text-yellow-800
```

**Red (Alert/Critical):**
```tsx
bg-red-100 text-red-600
border-red-200 text-red-800
```

**Purple (Premium/Featured):**
```tsx
bg-purple-100 text-purple-600
border-purple-200 text-purple-800
```

**Slate (Neutral/System):**
```tsx
bg-slate-100 text-slate-600
border-slate-200 text-slate-700
```

**Specifications:**
```css
/* Card */
border: 1px solid #e2e8f0
border-radius: 12px (rounded-xl)
padding: 24px (p-6)
shadow: 0 1px 3px rgba(0,0,0,0.1)
hover-shadow: 0 4px 6px rgba(0,0,0,0.07)
transition: box-shadow 200ms ease

/* Icon Container */
width: 48px (w-12)
height: 48px (h-12)
border-radius: 9999px (rounded-full)

/* Main Value */
font-size: 30px (text-3xl)
font-weight: 700 (font-bold)
color: #0f172a (slate-900)

/* Label */
font-size: 14px (text-sm)
font-weight: 500 (font-medium)
color: #475569 (slate-600)

/* Trend Badge */
font-size: 12px (text-xs)
font-weight: 600 (font-semibold)
padding: 4px 10px (px-2.5 py-1)
border-radius: 9999px (rounded-full)

/* Subtitle */
font-size: 12px (text-xs)
color: #64748b (slate-500)
```

---

### 2. Activity Timeline Component

**Purpose:** Show recent actions/events in chronological order

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-slate-800">
        Recent Activity
      </CardTitle>
      <Button variant="ghost" size="sm" className="text-slate-500">
        View All
      </Button>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <div className="divide-y divide-slate-100">
      {activities.map((activity) => (
        <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
          <div className="flex gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <ActivityIcon className="w-5 h-5 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {activity.title}
              </p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {activity.description}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {activity.timestamp}
              </p>
            </div>

            {/* Status Badge (optional) */}
            {activity.status && (
              <Badge variant="outline" className="shrink-0">
                {activity.status}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Component Props:**
```typescript
interface ActivityTimelineProps {
  activities: {
    id: string;
    icon: React.ReactNode;
    iconColor: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    title: string;
    description: string;
    timestamp: string;      // "2 hours ago", "Nov 24, 10:30 AM"
    status?: string;        // "Completed", "Pending", etc.
  }[];
  maxItems?: number;        // Default: 5
  showViewAll?: boolean;    // Default: true
}
```

**Specifications:**
```css
/* Activity Item */
padding: 16px (p-4)
hover-background: #f8fafc (hover:bg-slate-50)

/* Icon Container */
width: 40px (w-10)
height: 40px (h-10)
border-radius: 9999px (rounded-full)

/* Title */
font-size: 14px (text-sm)
font-weight: 500 (font-medium)
color: #0f172a (slate-900)

/* Description */
font-size: 12px (text-xs)
color: #64748b (slate-500)
line-clamp: 1

/* Timestamp */
font-size: 12px (text-xs)
color: #94a3b8 (slate-400)
```

---

### 3. Mini Chart Card Component

**Purpose:** Show metric with embedded sparkline/trend chart

**Visual Design (Line Chart):**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardContent className="p-6">
    <div className="flex items-start justify-between gap-4">
      {/* Left: Metric */}
      <div>
        <p className="text-sm font-medium text-slate-500">Total Views</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">12.4K</p>
        <div className="flex items-center gap-1 mt-2">
          <TrendingUpIcon className="w-3 h-3 text-green-600" />
          <p className="text-xs font-semibold text-green-600">+23%</p>
          <p className="text-xs text-slate-400">vs last month</p>
        </div>
      </div>

      {/* Right: Mini Chart */}
      <div className="w-24 h-16">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Sparkline */}
          <polyline
            points="0,40 15,38 30,32 45,35 60,28 75,20 90,15 100,10"
            fill="none"
            stroke="#003580"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Optional: Gradient fill under line */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#003580" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#003580" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="0,40 15,38 30,32 45,35 60,28 75,20 90,15 100,10 100,50 0,50"
            fill="url(#gradient)"
          />
        </svg>
      </div>
    </div>
  </CardContent>
</Card>
```

**Visual Design (Bar Chart):**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardContent className="p-6">
    <p className="text-sm font-medium text-slate-500">Content Breakdown</p>
    <div className="mt-4 space-y-3">
      {/* Places */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700">Places</span>
          <span className="text-xs font-bold text-slate-900">42</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: '70%' }}
          />
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700">Events</span>
          <span className="text-xs font-bold text-slate-900">28</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all"
            style={{ width: '45%' }}
          />
        </div>
      </div>

      {/* Businesses */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700">Businesses</span>
          <span className="text-xs font-bold text-slate-900">15</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: '25%' }}
          />
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Component Props:**
```typescript
interface MiniChartCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  chartType: 'line' | 'bar';
  chartData: number[] | { label: string; value: number; color: string }[];
  chartColor?: string;    // Default: #003580
}
```

---

### 4. Quick Action Panel Component

**Purpose:** Grid of common actions with icons

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-semibold text-slate-800">
      Quick Actions
    </CardTitle>
  </CardHeader>

  <CardContent className="p-4">
    <div className="grid grid-cols-2 gap-3">
      {/* Create Place */}
      <button
        className="flex flex-col items-center gap-2.5 p-4 rounded-xl
                   border border-slate-200 bg-white hover:bg-slate-50
                   hover:border-[#003580] transition-all
                   hover:shadow-sm active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <PlusCircleIcon className="w-6 h-6 text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Create Place</span>
      </button>

      {/* Create Event */}
      <button
        className="flex flex-col items-center gap-2.5 p-4 rounded-xl
                   border border-slate-200 bg-white hover:bg-slate-50
                   hover:border-[#003580] transition-all
                   hover:shadow-sm active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-purple-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Create Event</span>
      </button>

      {/* Send Notification */}
      <button
        className="flex flex-col items-center gap-2.5 p-4 rounded-xl
                   border border-slate-200 bg-white hover:bg-slate-50
                   hover:border-[#003580] transition-all
                   hover:shadow-sm active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
          <BellIcon className="w-6 h-6 text-yellow-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Send Alert</span>
      </button>

      {/* View Analytics */}
      <button
        className="flex flex-col items-center gap-2.5 p-4 rounded-xl
                   border border-slate-200 bg-white hover:bg-slate-50
                   hover:border-[#003580] transition-all
                   hover:shadow-sm active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <BarChartIcon className="w-6 h-6 text-green-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Analytics</span>
      </button>
    </div>
  </CardContent>
</Card>
```

**Component Props:**
```typescript
interface QuickActionProps {
  actions: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }[];
  columns?: 2 | 3 | 4;    // Default: 2
}
```

**Specifications:**
```css
/* Action Button */
padding: 16px (p-4)
border: 1px solid #e2e8f0
border-radius: 12px (rounded-xl)
background: #ffffff
hover-background: #f8fafc (slate-50)
hover-border: #003580
transition: all 200ms ease
hover-shadow: 0 1px 3px rgba(0,0,0,0.1)
active-scale: 0.98

/* Icon Container */
width: 48px (w-12)
height: 48px (h-12)
border-radius: 9999px (rounded-full)

/* Label */
font-size: 14px (text-sm)
font-weight: 600 (font-semibold)
color: #334155 (slate-700)
```

---

### 5. Progress Ring Component

**Purpose:** Circular progress indicator for completion/goal tracking

**Visual Design:**
```tsx
<div className="relative w-32 h-32">
  {/* SVG Ring */}
  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
    {/* Background Circle */}
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="8"
    />

    {/* Progress Circle */}
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="#003580"
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={`${2 * Math.PI * 42}`}
      strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.75)}`}
      className="transition-all duration-700 ease-out"
    />
  </svg>

  {/* Center Text */}
  <div className="absolute inset-0 flex items-center justify-center flex-col">
    <p className="text-2xl font-bold text-slate-900">75%</p>
    <p className="text-xs font-medium text-slate-500">Complete</p>
  </div>
</div>
```

**Component Props:**
```typescript
interface ProgressRingProps {
  value: number;          // 0-100
  label: string;
  color?: string;         // Default: #003580
  size?: 'sm' | 'md' | 'lg';  // 80px, 128px, 160px
}
```

**Size Variants:**
```tsx
// Small: w-20 h-20 (80px)
<div className="relative w-20 h-20">
  <p className="text-lg font-bold">75%</p>
  <p className="text-xs">Complete</p>
</div>

// Medium: w-32 h-32 (128px) - Default
<div className="relative w-32 h-32">
  <p className="text-2xl font-bold">75%</p>
  <p className="text-xs">Complete</p>
</div>

// Large: w-40 h-40 (160px)
<div className="relative w-40 h-40">
  <p className="text-3xl font-bold">75%</p>
  <p className="text-sm">Complete</p>
</div>
```

**Color Variants:**
```tsx
// Primary (Blue): #003580
stroke="#003580"

// Success (Green): #22c55e
stroke="#22c55e"

// Warning (Yellow): #f59e0b
stroke="#f59e0b"

// Danger (Red): #ef4444
stroke="#ef4444"
```

---

## Super Admin Dashboard

**Role:** Platform administrators managing multiple towns
**Focus:** System health, multi-town oversight, platform-wide metrics

### Layout Structure

**Grid Layout (Desktop):**
```
┌─────────────────────────────────────────────┐
│ Page Header + Role Badge                    │
├─────────────────────────────────────────────┤
│ Stat Card 1 │ Stat Card 2 │ Stat Card 3 │..│
│ (Towns)     │ (Users)     │ (Revenue)   │  │  (4 columns)
├─────────────┴─────────────┴─────────────┴──┤
│ Towns Overview Table/Grid              50% │
│ • Town name, users, content, status         │
│ • Quick actions per town                    │
│                                             │
│ System Health Panel                    50% │
│ • API status, DB status, Error rates        │
├─────────────────────────────────────────────┤
│ Recent Platform Activity (Timeline)    100%│
│ • All towns, user registrations, actions    │
└─────────────────────────────────────────────┘
```

**Responsive (Mobile):**
- Single column layout
- Stats: 2x2 grid
- Tables become stacked cards
- Scrollable sections

---

### Metrics & Components

#### 1. Stats Grid (Top Section)

**Total Towns:**
```tsx
<StatCard
  icon={<BuildingIcon />}
  value={8}
  label="Active Towns"
  trend={{ value: "+2", direction: "up" }}
  subtitle="Added this quarter"
  variant="blue"
/>
```

**Platform Users:**
```tsx
<StatCard
  icon={<UsersIcon />}
  value="1,234"
  label="Total Users"
  trend={{ value: "+12%", direction: "up" }}
  subtitle="+156 this month"
  variant="green"
/>
```

**Total Events:**
```tsx
<StatCard
  icon={<CalendarIcon />}
  value={342}
  label="Active Events"
  trend={{ value: "+8%", direction: "up" }}
  subtitle="Across all towns"
  variant="purple"
/>
```

**Platform Revenue (if applicable):**
```tsx
<StatCard
  icon={<DollarSignIcon />}
  value="ISK 240K"
  label="Monthly Revenue"
  trend={{ value: "+15%", direction: "up" }}
  subtitle="From subscriptions"
  variant="green"
/>
```

**System Health:**
```tsx
<StatCard
  icon={<ActivityIcon />}
  value="99.8%"
  label="System Uptime"
  trend={{ value: "Excellent", direction: "up" }}
  subtitle="Last 30 days"
  variant="green"
/>
```

---

#### 2. Towns Overview Grid

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-semibold text-slate-800">
      Towns Management
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Town
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Users
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Content
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Stykkishólmur</p>
              <p className="text-xs text-slate-500">stykkisholmur.townhub.is</p>
            </td>
            <td className="px-4 py-3">
              <p className="text-sm font-bold text-slate-900">342</p>
              <p className="text-xs text-green-600">↑ +23 this week</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">42 Places</Badge>
                <Badge variant="outline" className="text-xs">28 Events</Badge>
              </div>
            </td>
            <td className="px-4 py-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm">View</Button>
                <Button variant="ghost" size="sm">Settings</Button>
              </div>
            </td>
          </tr>
          {/* Repeat for other towns */}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>
```

---

#### 3. System Health Panel

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-slate-800">
        System Health
      </CardTitle>
      <Badge className="bg-green-100 text-green-800 border-green-200">
        All Systems Operational
      </Badge>
    </div>
  </CardHeader>

  <CardContent className="p-6">
    <div className="space-y-4">
      {/* API Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">API Services</p>
            <p className="text-xs text-slate-500">Response time: 124ms</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Healthy
        </Badge>
      </div>

      {/* Database */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <DatabaseIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Database</p>
            <p className="text-xs text-slate-500">Queries: ~2.3K/min</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Healthy
        </Badge>
      </div>

      {/* Background Jobs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ZapIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Background Jobs</p>
            <p className="text-xs text-slate-500">3 running, 0 failed</p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Running
        </Badge>
      </div>

      {/* Error Rate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <AlertTriangleIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Error Rate</p>
            <p className="text-xs text-slate-500">0.02% (Last hour)</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Low
        </Badge>
      </div>
    </div>
  </CardContent>
</Card>
```

---

#### 4. Platform Activity Timeline

**Visual Design:**
```tsx
<ActivityTimeline
  activities={[
    {
      id: "1",
      icon: <UserPlusIcon />,
      iconColor: "blue",
      title: "New user registered",
      description: "john@example.com joined Stykkishólmur",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      icon: <MapPinIcon />,
      iconColor: "green",
      title: "Place created",
      description: "Hotel Stykkishólmur added to Stykkishólmur",
      timestamp: "3 hours ago",
    },
    {
      id: "3",
      icon: <CalendarIcon />,
      iconColor: "purple",
      title: "Event published",
      description: "Midnight Sun Festival in Ólafsvík",
      timestamp: "5 hours ago",
    },
    {
      id: "4",
      icon: <BellIcon />,
      iconColor: "yellow",
      title: "Notification sent",
      description: "Weather alert to 342 users in Stykkishólmur",
      timestamp: "6 hours ago",
      status: "Delivered",
    },
    {
      id: "5",
      icon: <CreditCardIcon />,
      iconColor: "green",
      title: "Subscription upgraded",
      description: "OLÍS Gas Station → Premium tier",
      timestamp: "1 day ago",
    },
  ]}
  maxItems={10}
  showViewAll={true}
/>
```

---

### Complete Layout Example

```tsx
export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Platform Overview</p>
          <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all towns, users, and system health
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm font-semibold px-3 py-1">
          Super Admin
        </Badge>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Towns */}
        <StatCard {...} />

        {/* Users */}
        <StatCard {...} />

        {/* Events */}
        <StatCard {...} />

        {/* Revenue */}
        <StatCard {...} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Towns Overview */}
        <TownsOverviewTable />

        {/* System Health */}
        <SystemHealthPanel />
      </div>

      {/* Activity Timeline (Full Width) */}
      <ActivityTimeline />
    </div>
  );
}
```

---

## Town Admin Dashboard

**Role:** Administrators managing a specific town
**Focus:** Town content, engagement metrics, quick actions

### Layout Structure

**Grid Layout (Desktop):**
```
┌─────────────────────────────────────────────┐
│ Page Header + Town Context                  │
├─────────────────────────────────────────────┤
│ Stat Card 1 │ Stat Card 2 │ Stat Card 3 │..│
│ (Users)     │ (Places)    │ (Events)    │  │  (4 columns)
├─────────────┴─────────────┴─────────────┴──┤
│ Quick Actions Panel                    40% │
│ • Create Place/Event/Notification           │
│ • View Analytics                            │
│                                             │
│ Content Breakdown Chart                60% │
│ • Places by type (bar chart)                │
│ • Events timeline                           │
├─────────────────────────────────────────────┤
│ Recent Activity                        50% │
│ • Latest places, events, RSVPs              │
│                                             │
│ Engagement Metrics                     50% │
│ • Popular places/events                     │
│ • Notification stats                        │
└─────────────────────────────────────────────┘
```

---

### Metrics & Components

#### 1. Stats Grid (Top Section)

**Town Users:**
```tsx
<StatCard
  icon={<UsersIcon />}
  value={342}
  label="Active Users"
  trend={{ value: "+12%", direction: "up" }}
  subtitle="+23 this week"
  variant="blue"
/>
```

**Places Count:**
```tsx
<StatCard
  icon={<MapPinIcon />}
  value={42}
  label="Places Listed"
  trend={{ value: "+3", direction: "up" }}
  subtitle="5 pending review"
  variant="green"
/>
```

**Events Count:**
```tsx
<StatCard
  icon={<CalendarIcon />}
  value={28}
  label="Upcoming Events"
  trend={{ value: "+5", direction: "up" }}
  subtitle="Next 30 days"
  variant="purple"
/>
```

**Notification Reach:**
```tsx
<StatCard
  icon={<BellIcon />}
  value="98%"
  label="Notification Reach"
  trend={{ value: "+2%", direction: "up" }}
  subtitle="Last 7 days"
  variant="yellow"
/>
```

---

#### 2. Quick Actions Panel

```tsx
<QuickActionPanel
  actions={[
    {
      id: "create-place",
      icon: <PlusCircleIcon />,
      label: "Create Place",
      onClick: () => router.push("/admin/places/create"),
      color: "blue",
    },
    {
      id: "create-event",
      icon: <CalendarPlusIcon />,
      label: "Create Event",
      onClick: () => router.push("/admin/events/create"),
      color: "purple",
    },
    {
      id: "send-notification",
      icon: <BellIcon />,
      label: "Send Alert",
      onClick: () => router.push("/admin/notifications/send"),
      color: "yellow",
    },
    {
      id: "view-analytics",
      icon: <BarChartIcon />,
      label: "Analytics",
      onClick: () => router.push("/admin/analytics"),
      color: "green",
    },
  ]}
  columns={2}
/>
```

---

#### 3. Content Breakdown Chart

**Visual Design (Bar Chart):**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-semibold text-slate-800">
      Content Breakdown
    </CardTitle>
  </CardHeader>

  <CardContent className="p-6">
    <div className="space-y-4">
      {/* Lodging */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-slate-700">🏨 Lodging</span>
          </div>
          <span className="text-sm font-bold text-slate-900">18</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: '72%' }}
          />
        </div>
      </div>

      {/* Restaurants */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-slate-700">🍽️ Restaurants</span>
          </div>
          <span className="text-sm font-bold text-slate-900">12</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: '48%' }}
          />
        </div>
      </div>

      {/* Attractions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm font-medium text-slate-700">🎭 Attractions</span>
          </div>
          <span className="text-sm font-bold text-slate-900">8</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: '32%' }}
          />
        </div>
      </div>

      {/* Town Services */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-sm font-medium text-slate-700">🏛️ Town Services</span>
          </div>
          <span className="text-sm font-bold text-slate-900">4</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-500 rounded-full transition-all duration-500"
            style={{ width: '16%' }}
          />
        </div>
      </div>
    </div>

    {/* Total */}
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Total Places</span>
        <span className="text-xl font-bold text-slate-900">42</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

#### 4. Recent Activity (Town-Specific)

```tsx
<ActivityTimeline
  activities={[
    {
      id: "1",
      icon: <MapPinIcon />,
      iconColor: "green",
      title: "New place added",
      description: "Hotel Stykkishólmur (Lodging)",
      timestamp: "1 hour ago",
    },
    {
      id: "2",
      icon: <CalendarIcon />,
      iconColor: "purple",
      title: "Event published",
      description: "Midnight Sun Festival • 45 RSVPs",
      timestamp: "3 hours ago",
      status: "Featured",
    },
    {
      id: "3",
      icon: <UserCheckIcon />,
      iconColor: "blue",
      title: "New RSVP",
      description: "5 users RSVP'd to Harbor Market",
      timestamp: "5 hours ago",
    },
    {
      id: "4",
      icon: <EditIcon />,
      iconColor: "slate",
      title: "Place updated",
      description: "Norwegian House Museum (photos added)",
      timestamp: "1 day ago",
    },
  ]}
  maxItems={5}
/>
```

---

#### 5. Engagement Metrics

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-semibold text-slate-800">
      Popular Content
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0">
    <div className="divide-y divide-slate-100">
      {/* Most Viewed Place */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">🏨 Lodging</Badge>
              <p className="text-sm font-semibold text-slate-900">Hotel Stykkishólmur</p>
            </div>
            <p className="text-xs text-slate-500">Top performer this week</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">1.2K</p>
            <p className="text-xs text-slate-500">views</p>
          </div>
        </div>
      </div>

      {/* Top Event */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                Event
              </Badge>
              <p className="text-sm font-semibold text-slate-900">Midnight Sun Festival</p>
            </div>
            <p className="text-xs text-slate-500">45 RSVPs so far</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">45</p>
            <p className="text-xs text-slate-500">RSVPs</p>
          </div>
        </div>
      </div>

      {/* Notification Performance */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                Alert
              </Badge>
              <p className="text-sm font-semibold text-slate-900">Weather Advisory</p>
            </div>
            <p className="text-xs text-slate-500">Sent 2 days ago</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">98%</p>
            <p className="text-xs text-slate-500">delivery</p>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Business Admin Dashboard

**Role:** Business owners managing their listings
**Focus:** Performance metrics, event management, subscription

### Layout Structure

**Grid Layout (Desktop):**
```
┌─────────────────────────────────────────────┐
│ Business Profile Card (Hero)                │
│ • Logo, name, tier badge                    │
│ • Quick stats: Views, Events, Engagement    │
├─────────────────────────────────────────────┤
│ Stat Card 1 │ Stat Card 2 │ Stat Card 3 │..│
│ (Views)     │ (RSVPs)     │ (Clicks)    │  │  (3-4 columns)
├─────────────┴─────────────┴─────────────┴──┤
│ Performance Chart                      60% │
│ • Views over time (line chart)              │
│                                             │
│ Subscription Panel                     40% │
│ • Current tier                              │
│ • Features + Upgrade options                │
├─────────────────────────────────────────────┤
│ Your Events                            50% │
│ • Upcoming events list                      │
│ • RSVP counts, quick edit                   │
│                                             │
│ Recommendations                        50% │
│ • Growth suggestions                        │
│ • Profile completeness                      │
└─────────────────────────────────────────────┘
```

---

### Metrics & Components

#### 1. Business Profile Hero Card

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50">
  <CardContent className="p-8">
    <div className="flex items-start gap-6">
      {/* Logo */}
      <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
        {business.logoUrl ? (
          <Image src={business.logoUrl} alt={business.name} fill className="object-cover rounded-xl" />
        ) : (
          <BuildingIcon className="w-10 h-10 text-slate-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{business.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{business.type}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm font-semibold px-3 py-1">
            {business.subscriptionTier}
          </Badge>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-2xl font-bold text-slate-900">2.4K</p>
            <p className="text-xs text-slate-500">Total Views</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-purple-600">8</p>
            <p className="text-xs text-slate-500">Active Events</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-green-600">127</p>
            <p className="text-xs text-slate-500">Total RSVPs</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">Edit Profile</Button>
          <Button variant="outline" size="sm">View Public Page</Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

#### 2. Stats Grid

**Total Views:**
```tsx
<MiniChartCard
  label="Total Views"
  value="2.4K"
  trend={{ value: "+18%", direction: "up" }}
  chartType="line"
  chartData={[320, 380, 420, 390, 450, 480, 520]}
  chartColor="#003580"
/>
```

**Event RSVPs:**
```tsx
<StatCard
  icon={<UsersIcon />}
  value={127}
  label="Total RSVPs"
  trend={{ value: "+23%", direction: "up" }}
  subtitle="Across all events"
  variant="purple"
/>
```

**Notification Clicks:**
```tsx
<StatCard
  icon={<MousePointerClickIcon />}
  value="34%"
  label="Click-Through Rate"
  trend={{ value: "+5%", direction: "up" }}
  subtitle="Last 30 days"
  variant="green"
/>
```

---

#### 3. Subscription Panel

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-100">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-slate-800">
        Your Subscription
      </CardTitle>
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold">
        Premium
      </Badge>
    </div>
  </CardHeader>

  <CardContent className="p-6">
    {/* Current Plan */}
    <div className="mb-6">
      <p className="text-sm text-slate-500 mb-2">Current Plan</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">ISK 15,000</p>
        <p className="text-sm text-slate-500">/ month</p>
      </div>
    </div>

    {/* Features Checklist */}
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm text-slate-700">Unlimited events</p>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm text-slate-700">5 featured event slots</p>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm text-slate-700">Priority placement</p>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm text-slate-700">Advanced analytics</p>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm text-slate-700">Email support</p>
      </div>
    </div>

    {/* Usage */}
    <div className="p-4 bg-slate-50 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-700">Featured Events</p>
        <p className="text-sm font-bold text-slate-900">3 / 5 used</p>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: '60%' }}
        />
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1" size="sm">
        Manage Billing
      </Button>
      <Button className="bg-[#003580] hover:bg-[#002966] flex-1" size="sm">
        Upgrade Plan
      </Button>
    </div>
  </CardContent>
</Card>
```

---

#### 4. Your Events List

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-slate-800">
        Your Events
      </CardTitle>
      <Button variant="outline" size="sm">
        <PlusIcon className="w-4 h-4 mr-1" />
        Create Event
      </Button>
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <div className="divide-y divide-slate-100">
      {/* Upcoming Event */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                Featured
              </Badge>
              <Badge variant="outline" className="text-xs">
                Upcoming
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Midnight Sun Festival</h4>
            <p className="text-xs text-slate-500 mt-1">
              📍 Harbor Square • 🗓️ Jun 21, 2025, 8:00 PM
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">45 RSVPs</p>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-3 h-3 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">342 views</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <EditIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVerticalIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Repeat for other events */}
    </div>
  </CardContent>
</Card>
```

---

#### 5. Recommendations Panel

**Visual Design:**
```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="border-b border-slate-100">
    <CardTitle className="text-lg font-semibold text-slate-800">
      Growth Recommendations
    </CardTitle>
  </CardHeader>

  <CardContent className="p-6">
    {/* Profile Completeness */}
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-700">Profile Completeness</p>
        <p className="text-sm font-bold text-slate-900">75%</p>
      </div>
      <ProgressRing value={75} label="Complete" size="sm" />
    </div>

    {/* Suggestions */}
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <ImageIcon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Add more photos</p>
          <p className="text-xs text-slate-600 mt-0.5">
            Listings with 5+ photos get 40% more views
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
          <CalendarIcon className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Create weekly events</p>
          <p className="text-xs text-slate-600 mt-0.5">
            Regular events keep your business top-of-mind
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <BellIcon className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Send engagement notifications</p>
          <p className="text-xs text-slate-600 mt-0.5">
            Remind users about upcoming events
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Responsive Design Guidelines

### Breakpoints
```css
/* Mobile */
@media (max-width: 767px) {
  /* Single column layout */
  /* Stats: 1 column */
  /* Tables become cards */
  /* Hide less critical info */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Stats: 2 columns */
  /* Two-column grid for content */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Stats: 4 columns */
  /* Multi-column layouts */
  /* Full tables */
}
```

### Mobile Optimizations

**Stats Grid:**
```tsx
// Desktop: 4 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// Mobile: Stack vertically
className="grid grid-cols-1 gap-4"
```

**Activity Timeline:**
```tsx
// Hide timestamps on mobile
<p className="text-xs text-slate-400 hidden sm:block">
  {activity.timestamp}
</p>
```

**Tables to Cards:**
```tsx
// Desktop: Table
<table className="hidden lg:table">...</table>

// Mobile: Stacked cards
<div className="lg:hidden space-y-3">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## Color Coding System

### Semantic Colors

**Success (Green):**
- Revenue, positive trends, healthy status
- `#22c55e` (green-500)
- Use: Stat cards, badges, progress bars

**Warning (Yellow):**
- Pending actions, notifications, alerts
- `#f59e0b` (amber-500)
- Use: Alert badges, notification icons

**Danger (Red):**
- Errors, critical issues, deletion
- `#ef4444` (red-500)
- Use: Error states, delete buttons

**Primary (Blue):**
- Brand actions, users, main metrics
- `#003580` (brand blue)
- Use: Primary buttons, user icons, links

**Purple:**
- Premium features, events, featured content
- `#a855f7` (purple-500)
- Use: Premium badges, event indicators

**Neutral (Slate):**
- System info, secondary content
- `#64748b` (slate-500)
- Use: System health, general info

---

## Icons Reference

### Lucide Icons to Use

**Super Admin:**
```tsx
import {
  Building,           // Towns
  Users,             // Platform users
  Calendar,          // Events
  DollarSign,        // Revenue
  Activity,          // System health
  CheckCircle,       // Healthy status
  Database,          // Database
  Zap,              // Background jobs
  AlertTriangle,     // Warnings
  UserPlus,         // New user
  MapPin,           // Places
  Bell,             // Notifications
  CreditCard,       // Subscriptions
} from 'lucide-react';
```

**Town Admin:**
```tsx
import {
  Users,            // Town users
  MapPin,           // Places
  Calendar,         // Events
  Bell,             // Notifications
  PlusCircle,       // Create actions
  CalendarPlus,     // Create event
  BarChart,         // Analytics
  UserCheck,        // RSVPs
  Edit,             // Edit actions
  TrendingUp,       // Trends
} from 'lucide-react';
```

**Business Admin:**
```tsx
import {
  Building,         // Business
  Eye,             // Views
  Users,           // RSVPs
  MousePointerClick, // Clicks
  CheckCircle,     // Features
  Image,           // Photos
  Calendar,        // Events
  Bell,            // Notifications
  Edit,            // Edit
  MoreVertical,    // More options
  Plus,            // Add
} from 'lucide-react';
```

---

## Implementation Priority

### Phase 1: Core Components (2 hours)

**Must Have:**
1. ✅ **StatCard Component** - 30 min
   - All variants (blue, green, yellow, red, purple)
   - Props interface
   - Reusable across all dashboards

2. ✅ **Quick Action Panel** - 20 min
   - Grid layout
   - Icon buttons
   - Hover states

3. ✅ **Activity Timeline** - 30 min
   - Flexible item rendering
   - Icon variants
   - Timestamps

4. ✅ **Mini Chart Card** - 40 min
   - Line chart (SVG)
   - Bar chart
   - Trend indicators

---

### Phase 2: Role-Specific Layouts (1.5 hours)

**High Priority:**
1. ✅ **Town Admin Dashboard** - 45 min
   - Most common use case
   - Stats grid + quick actions
   - Content breakdown
   - Recent activity

2. ✅ **Super Admin Dashboard** - 30 min
   - Towns overview table
   - System health panel
   - Platform activity

3. ✅ **Business Admin Dashboard** - 15 min
   - Business profile hero
   - Events list
   - Subscription panel

---

### Phase 3: Polish & Enhancement (1 hour)

**Nice-to-Have:**
1. ✅ **Progress Ring Component** - 20 min
2. ✅ **Responsive Optimizations** - 20 min
3. ✅ **Empty States** - 10 min
4. ✅ **Loading Skeletons** - 10 min

---

## Data Requirements

### Super Admin Needs:
```typescript
{
  platformStats: {
    totalTowns: number;
    totalUsers: number;
    totalEvents: number;
    totalRevenue: string;
    systemUptime: string;
  };
  towns: {
    id: string;
    name: string;
    subdomain: string;
    userCount: number;
    placeCount: number;
    eventCount: number;
    status: 'active' | 'inactive';
    growth: string;
  }[];
  systemHealth: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    apiResponseTime: number;
    databaseStatus: 'healthy' | 'degraded' | 'down';
    queryRate: number;
    backgroundJobs: { running: number; failed: number };
    errorRate: number;
  };
  recentActivity: Activity[];
}
```

### Town Admin Needs:
```typescript
{
  townStats: {
    activeUsers: number;
    userGrowth: string;
    placesCount: number;
    eventsCount: number;
    notificationReach: string;
  };
  placesByType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  recentActivity: Activity[];
  popularContent: {
    places: { id: string; name: string; views: number }[];
    events: { id: string; title: string; rsvps: number }[];
  };
}
```

### Business Admin Needs:
```typescript
{
  business: {
    id: string;
    name: string;
    logoUrl?: string;
    type: string;
    subscriptionTier: string;
    subscriptionPrice: number;
    features: string[];
  };
  performanceStats: {
    totalViews: number;
    viewsTrend: string;
    viewsData: number[];
    totalRsvps: number;
    clickThroughRate: string;
  };
  subscription: {
    featuredEventsUsed: number;
    featuredEventsLimit: number;
  };
  events: {
    id: string;
    title: string;
    location: string;
    startsAt: string;
    rsvps: number;
    views: number;
    isFeatured: boolean;
    status: 'upcoming' | 'past';
  }[];
  recommendations: {
    profileCompleteness: number;
    suggestions: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
}
```

---

## Testing Checklist

### Visual Quality
- [ ] All stat cards have consistent styling
- [ ] Icons are properly sized and colored
- [ ] Charts render smoothly
- [ ] Hover states work on all interactive elements
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Typography hierarchy is clear
- [ ] Colors follow semantic meaning
- [ ] Spacing is generous and consistent

### Functional Quality
- [ ] Stats update with real data
- [ ] Quick actions navigate correctly
- [ ] Activity timeline shows recent items
- [ ] Charts reflect accurate data
- [ ] Progress rings animate smoothly
- [ ] Role-based views show correct content
- [ ] Empty states are helpful
- [ ] Loading states are smooth

### Professional Appearance
- [ ] Matches Vercel/Linear quality level
- [ ] Data is scannable at a glance
- [ ] Actionable insights are clear
- [ ] No visual bugs or rough edges
- [ ] Feels premium and trustworthy
- [ ] Inspires confidence

---

## Success Metrics

**Visual Quality:**
- Current: 7/10 (functional but generic)
- Target: 9.5/10 (premium, role-specific, data-rich)

**User Efficiency:**
- Before: "Where do I find X?"
- After: "All key info at a glance"

**Stakeholder Impression:**
- Before: "This works but feels basic"
- After: "This looks really professional and polished!"

**Role Clarity:**
- Before: Same view for everyone
- After: Tailored experience per role

---

**Transform the admin dashboard from generic to exceptional with role-specific, visually rich views! 📊✨**
