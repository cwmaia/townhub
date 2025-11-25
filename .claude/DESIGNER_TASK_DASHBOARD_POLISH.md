# DESIGNER TASK: Dashboard Polish with Role-Specific Views

## OBJECTIVE
Design professional, visually rich dashboard views for three admin roles with relevant information and better visual representations.

## CONTEXT
- Current dashboard is functional but generic
- Need role-specific dashboards with relevant metrics and actions
- Three roles: Super Admin, Town Admin, Business Admin
- Target: Vercel/Linear/Stripe quality with data visualization
- Brand color: #003580 (deep blue)

## YOUR TASK

### Step 1: Review Current Dashboard

Read the current implementation:
- `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx`
- Review what's currently shown (places, events, stats)
- Identify what's generic vs. role-specific

### Step 2: Design Role-Specific Dashboards

Create specifications for three dashboard variants:

#### A. Super Admin Dashboard
**Who:** Platform administrators managing multiple towns
**Key Metrics:**
- Total towns managed
- Total users across all towns
- Platform-wide statistics
- System health indicators
- Revenue/billing summary

**Visual Components:**
1. **Stats Grid (Top Section)**
   - 4-5 stat cards with icons
   - Key metrics: Towns, Users, Events, Places, Revenue
   - Trend indicators (↑ +12% vs last month)
   - Color-coded (green for good, red for issues)

2. **Activity Feed**
   - Recent actions across all towns
   - User registrations, content creation, etc.
   - Timeline view with timestamps

3. **Town Performance Grid**
   - Table/cards showing each town
   - Metrics per town: Users, Content, Engagement
   - Quick actions (View, Settings)

4. **System Status**
   - API health
   - Database status
   - Background jobs
   - Error rates

**Visual Style:**
- Dashboard grid layout (2-3 columns)
- Charts and graphs where appropriate
- Icons for all metrics
- Mini-charts (sparklines) showing trends

---

#### B. Town Admin Dashboard
**Who:** Administrators managing a specific town
**Key Metrics:**
- Town-specific user count
- Places and events in town
- Notification delivery rates
- Recent activity in town
- Popular content

**Visual Components:**
1. **Town Overview Card (Hero)**
   - Town name and info
   - Quick stats: Users, Places, Events
   - Visual map thumbnail (if available)
   - "Manage Town" button

2. **Content Stats Grid**
   - Places count with type breakdown (chart)
   - Events count (upcoming vs past)
   - Businesses count by tier
   - Notifications sent this month

3. **Recent Activity**
   - Latest places added
   - Latest events created
   - Recent RSVPs
   - User interactions

4. **Quick Actions Panel**
   - Create Place (button)
   - Create Event (button)
   - Send Notification (button)
   - View Analytics (button)

5. **Engagement Metrics**
   - Most viewed places
   - Most popular events
   - Notification open rates
   - User retention trends

**Visual Style:**
- Focus on actionable insights
- Mini bar/pie charts for breakdowns
- Timeline for recent activity
- Large, clear action buttons

---

#### C. Business Admin Dashboard
**Who:** Business owners managing their listings
**Key Metrics:**
- Their business views
- Event RSVPs
- Notification reach
- Subscription status
- Analytics for their content

**Visual Components:**
1. **Business Profile Card (Hero)**
   - Business name and logo
   - Subscription tier badge
   - Quick stats: Views, Events, Engagement
   - "Edit Profile" button

2. **Performance Metrics**
   - Total views (trend chart)
   - Event RSVPs
   - Notification clicks
   - Profile completeness score

3. **Your Events**
   - Upcoming events list
   - RSVP counts
   - Quick edit actions

4. **Your Places**
   - Listed places
   - Views and ratings
   - Quick edit actions

5. **Subscription Panel**
   - Current tier
   - Features available
   - Upgrade options
   - Billing info

6. **Recommendations**
   - Suggestions to improve visibility
   - "Add more photos"
   - "Create an event"
   - "Complete profile"

**Visual Style:**
- Focus on business growth
- Clear progress indicators
- Upgrade prompts (if not premium)
- Achievement-style badges

---

### Step 3: Create Visual Component Library

Design reusable dashboard components:

#### 1. Stat Card
```tsx
// Modern stat card with icon, number, label, trend
<Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-center justify-between mb-2">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        <UsersIcon className="w-6 h-6 text-blue-600" />
      </div>
      <Badge className="bg-green-100 text-green-800 border-green-200">
        ↑ 12%
      </Badge>
    </div>
    <p className="text-3xl font-bold text-slate-900">1,234</p>
    <p className="text-sm text-slate-500 mt-1">Total Users</p>
    <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
      <TrendingUpIcon className="w-3 h-3" />
      <span>+56 this week</span>
    </div>
  </CardContent>
</Card>
```

**Variants:**
- Primary (blue)
- Success (green)
- Warning (yellow)
- Danger (red)
- Neutral (slate)

**Props:**
- Icon
- Value (number or string)
- Label
- Trend (percentage)
- Subtitle
- Color variant

---

#### 2. Activity Timeline
```tsx
// Timeline of recent actions
<Card>
  <CardHeader>
    <CardTitle>Recent Activity</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">
              {activity.title}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {activity.description}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

#### 3. Mini Chart Card
```tsx
// Stat card with embedded sparkline chart
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">Total Views</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">12.4K</p>
        <p className="text-xs text-green-600 mt-1">↑ 23% vs last month</p>
      </div>
      <div className="w-24 h-16">
        {/* Mini line chart showing trend */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <polyline
            points="0,40 20,35 40,25 60,30 80,15 100,10"
            fill="none"
            stroke="#003580"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  </CardContent>
</Card>
```

---

#### 4. Quick Action Panel
```tsx
// Grid of action buttons with icons
<Card>
  <CardHeader>
    <CardTitle>Quick Actions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
      >
        <PlusCircleIcon className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium">Create Place</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
      >
        <CalendarIcon className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium">Create Event</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
      >
        <BellIcon className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium">Send Alert</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex-col gap-2 hover:bg-slate-50"
      >
        <BarChartIcon className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium">Analytics</span>
      </Button>
    </div>
  </CardContent>
</Card>
```

---

#### 5. Progress Ring
```tsx
// Circular progress indicator
<div className="relative w-32 h-32">
  <svg className="w-full h-full" viewBox="0 0 100 100">
    {/* Background circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="8"
    />
    {/* Progress circle */}
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke="#003580"
      strokeWidth="8"
      strokeDasharray={`${2 * Math.PI * 45}`}
      strokeDashoffset={`${2 * Math.PI * 45 * (1 - 0.75)}`}
      transform="rotate(-90 50 50)"
    />
  </svg>
  <div className="absolute inset-0 flex items-center justify-center flex-col">
    <p className="text-2xl font-bold text-slate-900">75%</p>
    <p className="text-xs text-slate-500">Complete</p>
  </div>
</div>
```

---

### Step 4: Create Implementation Specs

Create document: `/Users/carlosmaia/townhub/DASHBOARD_DESIGN_SPECS.md`

Structure:
```markdown
# Dashboard Design Specifications

## Overview
Role-specific dashboards with data visualization and quick actions

## Component Library
[Stat Card, Activity Timeline, Charts, etc.]

## Super Admin Dashboard
[Layout, components, metrics, implementation code]

## Town Admin Dashboard
[Layout, components, metrics, implementation code]

## Business Admin Dashboard
[Layout, components, metrics, implementation code]

## Responsive Behavior
[Mobile, tablet, desktop layouts]

## Color Coding
- Success: Green (#22c55e)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Primary: Blue (#003580)
- Neutral: Slate (#64748b)

## Icons
[List of icons to use for each metric/action]

## Implementation Priority
1. High: Core stat cards and quick actions
2. Medium: Activity feeds and mini charts
3. Low: Advanced analytics and recommendations
```

---

### Step 5: Visual Examples

For each dashboard, provide:

1. **Layout Grid**
   - Describe the layout structure
   - Example: "2-column grid on desktop, single column on mobile"

2. **Color Palette**
   - Which colors for which metrics
   - Example: "Users = blue, Revenue = green, Errors = red"

3. **Typography Hierarchy**
   - Metric numbers: 3xl, bold
   - Labels: sm, medium, slate-500
   - Trends: xs, colored by direction

4. **Spacing Guidelines**
   - Card padding: p-6
   - Grid gaps: gap-6
   - Section spacing: space-y-8

5. **Interactive States**
   - Hover: shadow-md, scale-[1.02]
   - Active: ring-2, ring-primary
   - Disabled: opacity-50, cursor-not-allowed

---

## DELIVERABLES

1. **Complete Dashboard Design Specs** (`DASHBOARD_DESIGN_SPECS.md`)
   - All three role variants
   - Component library
   - Implementation code examples
   - Responsive guidelines

2. **Component Specifications**
   - Stat cards (5 variants)
   - Activity timeline
   - Mini charts
   - Quick action panels
   - Progress indicators

3. **Implementation Guidance**
   - Priority order (what to build first)
   - Reusable patterns
   - Data requirements (what metrics to fetch)

4. **Visual Enhancement List**
   - Icons to add
   - Charts to implement
   - Animations/transitions
   - Empty states

---

## SUCCESS CRITERIA

**Visual Quality:**
- ✅ Looks as polished as Vercel/Linear dashboards
- ✅ Clear visual hierarchy
- ✅ Data is scannable at a glance
- ✅ Professional charts and graphs
- ✅ Consistent with brand colors

**Functionality:**
- ✅ Role-specific information shown
- ✅ Actionable insights provided
- ✅ Quick actions easily accessible
- ✅ Metrics are meaningful
- ✅ Trends are visible

**User Experience:**
- ✅ Immediately understand key metrics
- ✅ Know what actions to take
- ✅ See performance at a glance
- ✅ Feel confident in the platform

---

## DESIGN REFERENCES

Study these dashboards for inspiration:
- Vercel Dashboard (clean, modern, data-focused)
- Linear Dashboard (minimal, action-oriented)
- Stripe Dashboard (comprehensive, business metrics)
- Tailwind UI Dashboard Examples (component patterns)

Focus on:
- Clear metric presentation
- Meaningful data visualization
- Quick action accessibility
- Professional appearance

---

**Goal:** Transform the dashboard from "functional" to "impressive" with role-specific, visually rich views that provide actionable insights at a glance. 📊✨
