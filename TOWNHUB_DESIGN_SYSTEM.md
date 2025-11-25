# TownHub Design System

**Version:** 1.0.0
**Last Updated:** November 20, 2025
**Maintainer:** Design Team

---

## Introduction

The TownHub Design System is a comprehensive collection of design tokens, components, patterns, and guidelines that ensure consistency and quality across all TownHub applications.

### Purpose
- Ensure visual consistency across CMS and mobile apps
- Speed up development with reusable components
- Maintain accessibility standards
- Create predictable, delightful user experiences

### Tech Stack
- **Framework:** React 19 with Next.js 15
- **Styling:** Tailwind CSS v4
- **Component Library:** shadcn/ui
- **Icons:** (Recommended: Lucide React or Heroicons)
- **Typography:** Inter font family

---

## Design Tokens

### Color System

#### Primary Colors

```css
/* Brand Colors */
--primary: #003580;              /* Deep Blue - Main brand color */
--primary-foreground: #f8fafc;   /* Off-white - Text on primary */
--secondary: #e2e8f0;            /* Light Blue-Gray - Supporting */
--secondary-foreground: #1e3a8a; /* Dark Blue - Text on secondary */
```

**Primary (#003580)** - Deep, professional blue
- **Use for:** Primary CTAs, active states, links, brand elements
- **Contrast ratio:** 8.2:1 with white (WCAG AAA)
- **Brand association:** Trust, reliability, professionalism
- **Similar to:** Booking.com, Expedia (hospitality industry standard)

**Secondary (#e2e8f0)** - Light blue-gray
- **Use for:** Secondary buttons, subtle backgrounds, disabled states
- **Contrast ratio:** 1.15:1 with background (decorative only)

#### Background Colors

```css
/* Surface Colors */
--background: #f8fafc;    /* App background - Very light blue-gray */
--card: #ffffff;          /* Card surface - Pure white */
--popover: #ffffff;       /* Dropdown/modal background */
--muted: #f1f5f9;         /* Muted background - Subtle gray */
```

**Background (#f8fafc)** - Very light blue-gray
- **Use for:** Page backgrounds, app shell
- **Creates:** Subtle depth between app and cards

**Card (#ffffff)** - Pure white
- **Use for:** Content cards, modals, dropdowns
- **Creates:** Clear visual separation from background

**Muted (#f1f5f9)** - Subtle gray
- **Use for:** Disabled inputs, secondary backgrounds, code blocks

#### Text Colors

```css
/* Text Hierarchy */
--foreground: #0f172a;        /* Primary text - Near black */
--muted-foreground: #475569;  /* Secondary text - Mid gray */
--card-foreground: #0f172a;   /* Text on cards */
```

**Foreground (#0f172a)** - Near black
- **Use for:** Headings, body text, primary content
- **Contrast ratio:** 15.8:1 with background (WCAG AAA)

**Muted Foreground (#475569)** - Mid gray
- **Use for:** Labels, captions, metadata, helper text
- **Contrast ratio:** 6.7:1 with background (WCAG AA)

#### Interactive Colors

```css
/* Interactive States */
--accent: #dbeafe;            /* Highlight/hover - Light blue */
--accent-foreground: #1e3a8a; /* Text on accent */
--destructive: #ef4444;       /* Danger/delete - Red */
--ring: #2563eb;              /* Focus ring - Bright blue */
```

**Destructive (#ef4444)** - Red
- **Use for:** Delete buttons, error messages, dangerous actions
- **Always:** Require confirmation for destructive actions

**Ring (#2563eb)** - Bright blue
- **Use for:** Focus indicators (keyboard navigation)
- **Width:** 3px ring with 50% opacity

#### Border Colors

```css
/* Borders & Dividers */
--border: #cbd5f5;  /* Default border - Light purple-blue */
--input: #cbd5f5;   /* Input border - Same as border */
```

**Border (#cbd5f5)** - Light purple-blue
- **Use for:** Card borders, input borders, dividers
- **Weight:** 1px default

#### Chart Colors

```css
/* Data Visualization */
--chart-1: #2563eb;  /* Blue - Primary data */
--chart-2: #0ea5e9;  /* Sky blue - Secondary data */
--chart-3: #22c55e;  /* Green - Positive/growth */
--chart-4: #facc15;  /* Yellow - Warning/neutral */
--chart-5: #fb7185;  /* Pink - Alert/negative */
```

**Usage Guidelines:**
- Use `--chart-1` (blue) for primary metrics
- Use `--chart-3` (green) for positive trends
- Use `--chart-5` (pink/red) for alerts or declining metrics
- Use `--chart-4` (yellow) for warnings or neutral data

#### Sidebar Colors

```css
/* Sidebar Navigation */
--sidebar: #ffffff;
--sidebar-foreground: #0f172a;
--sidebar-primary: #003580;
--sidebar-primary-foreground: #f8fafc;
--sidebar-accent: #e2e8f0;
--sidebar-accent-foreground: #1e3a8a;
--sidebar-border: #cbd5f5;
--sidebar-ring: #2563eb;
```

#### Dark Mode Colors

```css
.dark {
  --background: #0b1120;        /* Very dark blue-black */
  --foreground: #e2e8f0;        /* Light gray text */
  --card: #111827;              /* Dark card */
  --primary: #60a5fa;           /* Lighter blue for dark mode */
  --destructive: #f87171;       /* Lighter red for dark mode */
  /* ... complete dark palette */
}
```

**Note:** Dark mode is fully defined but not yet implemented in UI.

---

### Typography System

#### Font Families

```css
/* Primary Font */
--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: Inter, ui-monospace, monospace;
```

**Inter** - Modern, readable UI font
- **Designed for:** Screen reading and user interfaces
- **Features:** Excellent legibility, multiple weights, open source
- **Fallbacks:** System fonts for performance

#### Type Scale

**Modular Scale (1.25 ratio):**

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.25rem;      /* 20px */
--text-xl: 1.563rem;     /* 25px */
--text-2xl: 1.953rem;    /* 31px */
--text-3xl: 2.441rem;    /* 39px */
```

**Usage:**
- `xs` - Captions, tiny labels
- `sm` - Body text in dense UIs, buttons, form labels
- `base` - Default body text, inputs
- `lg` - Card titles, section subheadings
- `xl` - Section headings
- `2xl` - Page titles
- `3xl` - Hero text, marketing

#### Font Weights

```css
/* Weights */
--font-normal: 400;    /* Body text, paragraphs */
--font-medium: 500;    /* Emphasized text, buttons */
--font-semibold: 600;  /* Subheadings, card titles */
--font-bold: 700;      /* Headings, strong emphasis */
```

**Guidelines:**
- Use `normal` (400) for most body text
- Use `medium` (500) for buttons and labels
- Use `semibold` (600) for card titles and small headings
- Use `bold` (700) for page titles and major headings

#### Line Heights

```css
/* Leading */
--leading-tight: 1.25;    /* Headings, titles */
--leading-normal: 1.5;    /* Body text, most UI */
--leading-relaxed: 1.625; /* Long-form content, articles */
```

**Guidelines:**
- Headings: 1.2-1.3 (tighter for visual impact)
- Body text: 1.5-1.6 (comfortable reading)
- Long-form: 1.625 (relaxed for extended reading)

#### Text Styles (Semantic)

```tsx
/* React/Tailwind Class Combinations */

// Display - Large marketing text
<h1 className="text-3xl font-bold leading-tight">

// Heading - Page titles
<h2 className="text-2xl font-bold leading-tight">

// Subheading - Section headers
<h3 className="text-xl font-semibold leading-tight">

// Title - Card titles
<h4 className="text-lg font-semibold">

// Body - Default text
<p className="text-base leading-normal">

// Small - Dense text
<p className="text-sm leading-normal">

// Caption - Metadata, labels
<p className="text-xs text-muted-foreground leading-normal">

// Label - Form labels
<label className="text-sm font-medium">
```

---

### Spacing System

#### Spacing Scale

**Based on 4px grid:**

```css
/* Spacing Tokens */
--spacing-0: 0px;
--spacing-1: 4px;      /* 0.25rem */
--spacing-2: 8px;      /* 0.5rem */
--spacing-3: 12px;     /* 0.75rem */
--spacing-4: 16px;     /* 1rem */
--spacing-5: 20px;     /* 1.25rem */
--spacing-6: 24px;     /* 1.5rem */
--spacing-8: 32px;     /* 2rem */
--spacing-10: 40px;    /* 2.5rem */
--spacing-12: 48px;    /* 3rem */
--spacing-16: 64px;    /* 4rem */
--spacing-20: 80px;    /* 5rem */
--spacing-24: 96px;    /* 6rem */
```

**In Tailwind:**
```tsx
p-4   // padding: 16px
m-6   // margin: 24px
gap-3 // gap: 12px
```

#### Common Spacing Patterns

**Card Spacing:**
```tsx
<Card className="p-6">        {/* 24px padding */}
  <div className="space-y-6"> {/* 24px gap between children */}
    ...
  </div>
</Card>
```

**Form Spacing:**
```tsx
<form className="space-y-4">  {/* 16px gap between fields */}
  <div className="space-y-2"> {/* 8px gap between label/input */}
    <Label />
    <Input />
  </div>
</form>
```

**Layout Spacing:**
```tsx
<div className="container max-w-7xl mx-auto px-4 py-8">
  {/* 32px vertical padding, 16px horizontal */}
</div>
```

---

### Border Radius

```css
/* Radius Tokens */
--radius: 0.75rem;                    /* 12px - Base */
--radius-sm: calc(var(--radius) - 4px); /* 8px */
--radius-md: calc(var(--radius) - 2px); /* 10px */
--radius-lg: var(--radius);             /* 12px */
--radius-xl: calc(var(--radius) + 4px); /* 16px */
--radius-full: 9999px;                  /* Circular */
```

**Usage:**
- `rounded-sm` (8px) - Small buttons, badges
- `rounded-md` (10px) - Buttons, inputs, most interactive elements
- `rounded-lg` (12px) - Cards (default)
- `rounded-xl` (16px) - Large cards, modals
- `rounded-full` - Avatar images, circular buttons

**Consistency Rule:** Use `rounded-md` for inputs/buttons, `rounded-xl` for cards.

---

### Shadows

```css
/* Shadow Tokens */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04);
```

**Usage:**
- `shadow-xs` - Inputs (very subtle)
- `shadow-sm` - Cards (default), buttons at rest
- `shadow-md` - Elevated cards, dropdowns
- `shadow-lg` - Modals, popovers
- `shadow-xl` - Major overlays (rarely used)

**Hover Interactions:**
```tsx
<Card className="shadow-sm hover:shadow-md transition-shadow">
```

---

## Component Library

### Button Component

#### Variants

```tsx
import { Button } from '@/components/ui/button'

// Primary (default) - Main actions
<Button>Save Changes</Button>

// Secondary - Supporting actions
<Button variant="secondary">Cancel</Button>

// Outline - Tertiary actions
<Button variant="outline">Edit</Button>

// Destructive - Dangerous actions
<Button variant="destructive">Delete</Button>

// Ghost - Minimal emphasis
<Button variant="ghost">View More</Button>

// Link - Text link style
<Button variant="link">Learn more</Button>
```

#### Sizes

```tsx
// Small - Compact spaces
<Button size="sm">Small</Button>

// Default - Standard size
<Button>Default</Button>

// Large - Prominent CTAs
<Button size="lg">Get Started</Button>

// Icon - Square icon buttons
<Button size="icon"><Icon /></Button>
```

#### With Icons

```tsx
// Icon before text
<Button>
  <PlusIcon className="mr-2 size-4" />
  Create Place
</Button>

// Icon after text
<Button>
  Continue
  <ArrowRightIcon className="ml-2 size-4" />
</Button>

// Icon only
<Button size="icon" variant="ghost">
  <MenuIcon className="size-5" />
</Button>
```

#### Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoaderIcon className="mr-2 size-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

#### Best Practices

✅ **DO:**
- Use primary (default) sparingly (1-2 per page)
- Place primary action on the right in button groups
- Use destructive variant for delete/remove actions
- Show loading state during async operations
- Disable buttons during loading

❌ **DON'T:**
- Use multiple primary buttons on same page
- Use red for non-destructive actions
- Forget to show loading state
- Make buttons too small (min 36px height)

---

### Card Component

#### Structure

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description text</CardDescription>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>

  <CardContent>
    {/* Main content goes here */}
  </CardContent>

  <CardFooter>
    {/* Footer actions or metadata */}
  </CardFooter>
</Card>
```

#### Spacing

Cards use **24px (gap-6)** internal spacing:
```tsx
<Card className="gap-6 p-6">
  {/* 24px padding, 24px gaps */}
</Card>
```

#### Examples

**Simple Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Statistics</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">2,543</p>
    <p className="text-sm text-muted-foreground">Total views</p>
  </CardContent>
</Card>
```

**Card with Action:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Hótel Stykkishólmur</CardTitle>
    <CardDescription>LODGING • hotel, accommodation</CardDescription>
    <CardAction>
      <Button size="sm" variant="outline">Edit</Button>
    </CardAction>
  </CardHeader>
</Card>
```

#### Best Practices

✅ **DO:**
- Use CardHeader for all cards (consistency)
- Keep card widths responsive
- Use CardDescription for context
- Group related cards with consistent spacing

❌ **DON'T:**
- Nest cards inside cards (use sections instead)
- Make cards too wide (max-w-2xl for content)
- Skip CardHeader (breaks consistent spacing)

---

### Input Component

#### Basic Usage

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="name@example.com"
  />
</div>
```

#### With Helper Text

```tsx
<div className="space-y-2">
  <Label htmlFor="name">Full Name *</Label>
  <Input id="name" required />
  <p className="text-xs text-muted-foreground">
    Your name as it appears on official documents
  </p>
</div>
```

#### With Validation

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email *</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={errors.email ? "true" : "false"}
    className={errors.email ? "border-destructive" : ""}
  />
  {errors.email && (
    <p className="text-xs text-destructive">{errors.email}</p>
  )}
</div>
```

#### Types

```tsx
<Input type="text" />
<Input type="email" />
<Input type="password" />
<Input type="number" min={0} max={100} />
<Input type="search" placeholder="Search..." />
<Input type="tel" />
<Input type="url" />
```

---

### Select Component

#### Basic Usage

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

#### With Icons

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select place type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="LODGING">
      🏨 Lodging
    </SelectItem>
    <SelectItem value="RESTAURANT">
      🍽️ Restaurant
    </SelectItem>
    <SelectItem value="ATTRACTION">
      🎭 Attraction
    </SelectItem>
  </SelectContent>
</Select>
```

---

### Badge Component

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

**Use Cases:**
- Status indicators (ACTIVE, INACTIVE)
- Subscription tiers (STARTER, PREMIUM)
- Tags and categories
- Counts and numbers

---

### Alert Component

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

// Info (default)
<Alert>
  <Info className="size-4" />
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>
    This is an informational message.
  </AlertDescription>
</Alert>

// Destructive
<Alert variant="destructive">
  <AlertTriangle className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong.
  </AlertDescription>
</Alert>
```

---

## Patterns & Guidelines

### Form Patterns

#### Standard Form Layout

```tsx
<form className="space-y-6">
  <div className="space-y-4">
    {/* Field group */}
    <div className="space-y-2">
      <Label htmlFor="name">Name *</Label>
      <Input id="name" required />
    </div>

    {/* Field group */}
    <div className="space-y-2">
      <Label htmlFor="email">Email *</Label>
      <Input id="email" type="email" required />
    </div>
  </div>

  {/* Action buttons */}
  <div className="flex justify-end gap-3">
    <Button type="button" variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

#### Field Spacing
- Between label and input: `space-y-2` (8px)
- Between fields: `space-y-4` (16px)
- Between sections: `space-y-6` (24px)

---

### Data Display Patterns

#### Stat Card

```tsx
<Card>
  <CardContent className="pt-6">
    <div className="text-3xl font-bold">2,543</div>
    <p className="text-sm text-muted-foreground">
      Total views this month
    </p>
  </CardContent>
</Card>
```

#### List with Actions

```tsx
<Card>
  <CardHeader>
    <CardTitle>Places</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {places.map(place => (
        <div key={place.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">{place.name}</p>
            <p className="text-sm text-muted-foreground">{place.type}</p>
          </div>
          <Button size="sm" variant="outline">Edit</Button>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-muted p-6 mb-4">
    <CalendarIcon className="size-12 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">
    No events scheduled
  </h3>
  <p className="text-sm text-muted-foreground max-w-sm mb-6">
    Create your first event to engage with your community
    and keep everyone informed.
  </p>
  <Button>
    <PlusIcon className="mr-2 size-4" />
    Create Event
  </Button>
</div>
```

**Components:**
- Icon in muted circle
- Clear heading
- Helpful description
- Primary action CTA

---

### Loading States

#### Skeleton Loading

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Card>
  <CardHeader>
    <Skeleton className="h-5 w-[200px]" />
    <Skeleton className="h-4 w-[300px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>
```

#### Button Loading

```tsx
<Button disabled={isLoading}>
  {isLoading && <LoaderIcon className="mr-2 size-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

---

## Accessibility Guidelines

### Color Contrast

**WCAG AA Requirements:**
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**TownHub Compliance:**
- Primary text (#0f172a) on background (#f8fafc): **15.8:1** ✅
- Muted text (#475569) on background (#f8fafc): **6.7:1** ✅
- Primary button (#003580): **8.2:1** with white text ✅

### Keyboard Navigation

**Focus Indicators:**
- All interactive elements have visible focus rings
- Focus ring: 3px `--ring` color at 50% opacity
- Focus order follows logical tab sequence

**Keyboard Shortcuts:**
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons and links
- `Escape` - Close modals and dropdowns
- `Arrow keys` - Navigate within select/dropdown

### Screen Reader Support

**ARIA Attributes:**
```tsx
// Labels
<Input aria-label="Search places" />

// Required fields
<Input aria-required="true" />

// Invalid fields
<Input aria-invalid="true" aria-describedby="email-error" />
<p id="email-error">Please enter a valid email</p>

// Loading states
<Button aria-busy={isLoading}>Save</Button>
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large screens */
2xl: 1536px /* Ultra wide screens */
```

### Mobile-First Approach

```tsx
// Base styles are mobile, then scale up
<div className="
  text-sm        /* Mobile: 14px */
  md:text-base   /* Tablet: 16px */
  lg:text-lg     /* Desktop: 20px */
">
```

### Common Responsive Patterns

**Responsive Grid:**
```tsx
<div className="
  grid grid-cols-1    /* Mobile: 1 column */
  md:grid-cols-2      /* Tablet: 2 columns */
  lg:grid-cols-3      /* Desktop: 3 columns */
  gap-4
">
```

**Responsive Spacing:**
```tsx
<div className="
  px-4 py-6      /* Mobile: smaller padding */
  md:px-6 md:py-8  /* Desktop: larger padding */
">
```

---

## Icon Guidelines

### Recommended Libraries

1. **Lucide React** (Recommended)
   ```bash
   npm install lucide-react
   ```
   ```tsx
   import { Calendar, User, Settings } from 'lucide-react'
   ```

2. **Heroicons** (Alternative)
   ```bash
   npm install @heroicons/react
   ```

### Icon Sizing

```tsx
// Standard sizes
<Icon className="size-4" />  /* 16px - Inline with text */
<Icon className="size-5" />  /* 20px - Buttons */
<Icon className="size-6" />  /* 24px - Larger buttons */
<Icon className="size-8" />  /* 32px - Empty states */
<Icon className="size-12" /> /* 48px - Hero sections */
```

### Icon Colors

```tsx
// Inherit text color
<Icon className="text-muted-foreground" />

// Specific color
<Icon className="text-primary" />
<Icon className="text-destructive" />
```

---

## Animation & Transitions

### Transition Utilities

```tsx
// Standard transition
className="transition-colors duration-200"

// All properties
className="transition-all duration-200"

// Custom timing
className="transition-transform duration-300 ease-out"
```

### Common Animations

**Button Hover:**
```tsx
className="hover:scale-[1.02] active:scale-[0.98]
           transition-transform duration-200"
```

**Card Hover:**
```tsx
className="hover:shadow-md transition-shadow duration-200"
```

**Fade In:**
```tsx
className="animate-in fade-in duration-300"
```

---

## Implementation Checklist

When building new features, ensure:

- [ ] Colors use design tokens (no hardcoded hex values)
- [ ] Typography uses defined scale
- [ ] Spacing follows 4px grid (Tailwind scale)
- [ ] Border radius uses token system
- [ ] Components use shadcn/ui library
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA
- [ ] Responsive on mobile, tablet, desktop
- [ ] Loading states are shown
- [ ] Error states are handled
- [ ] Empty states have helpful messaging
- [ ] Icons are consistent size and style

---

## Resources

### Internal Documentation
- [TownHub Design Audit Report](/TOWNHUB_DESIGN_AUDIT_REPORT.md)
- [TownHub Brand Guidelines](/TOWNHUB_BRAND_GUIDELINES.md)
- [QA Testing Report](/qa-reports/QA_REPORT_DETAILED.md)

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Inter Font](https://rsms.me/inter/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Changelog

### Version 1.0.0 (2025-11-20)
- Initial design system documentation
- Complete design token reference
- Component library guidelines
- Accessibility standards
- Responsive design patterns

---

**Maintained by:** TownHub Design Team
**Questions?** Reference this document for all design decisions
**Updates:** Submit PRs with design system changes for review
