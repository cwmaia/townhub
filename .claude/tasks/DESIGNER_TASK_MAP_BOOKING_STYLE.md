# Designer Task: Map UI Redesign (Booking.com Style)

**Priority:** P0 - CRITICAL (Killer Feature)
**Status:** ✅ COMPLETED
**Completed:** December 1, 2025
**Time Estimate:** Full day sprint
**Reference:** Booking.com, Airbnb, Google Maps app

---

## Context

Current map UI issues:
- Filter chips overflow horizontally
- Preview card is basic
- No results list view
- Doesn't match modern travel app standards

We need a complete visual redesign inspired by Booking.com's proven patterns.

---

## Design System Reference

**Brand Colors:**
- Primary Blue: #003580
- Light Blue: #3b82f6
- Gold (Featured): #fbbf24
- Hot Red: #ef4444
- Success Green: #22c55e
- Neutral Gray: #475467
- Background: #f1f5f9

---

## Part 1: Map Markers

### Booking.com Pattern
Instead of pin icons, use **price/rating bubbles**:
- White bubble with colored border
- Shows price OR rating inside
- Selected state: inverted colors, slight scale up
- Color coding by type

### Design Specs

**Default State:**
```
┌─────────┐
│  $120   │  ← White bg, blue border, blue text
└─────────┘
    ▼       ← Small pointer
```

**Selected State:**
```
┌─────────┐
│  $120   │  ← Blue bg, white text, shadow
└─────────┘
    ▼
```

**Marker Variants:**
| Type | Border Color | Icon/Text |
|------|--------------|-----------|
| LODGING | #3b82f6 (blue) | Price or ★4.5 |
| RESTAURANT | #f97316 (orange) | ★4.2 or 🍽 |
| ATTRACTION | #8b5cf6 (purple) | ★4.8 or 📷 |
| TOWN_SERVICE | #003580 (dark) | 🏛 |
| EVENT | #ef4444 (red) | 📅 or date |

**Dimensions:**
- Bubble: min-width 48px, height 28px
- Border radius: 14px
- Border: 2px
- Font: 12px bold
- Padding: 4px 8px

### Deliverable
- Figma/Sketch designs for all marker states
- Export any icons needed as PNG @2x @3x

---

## Part 2: Bottom Sheet Results

### Booking.com Pattern
Draggable bottom sheet with scrollable cards:
- **Collapsed (15%):** Shows "X results" count
- **Half (50%):** Shows 2-3 cards visible
- **Expanded (90%):** Full list mode

### Bottom Sheet Header
```
┌────────────────────────────────┐
│  ═══════  (drag handle)        │
│                                │
│  32 places nearby              │
│  Sort: Rating ▼                │
└────────────────────────────────┘
```

### Result Card Design
```
┌────────────────────────────────┐
│ ┌──────┐                       │
│ │      │  Hotel Stykkishólmur  │
│ │ IMG  │  ★ 4.5 · Hotel        │
│ │      │  0.3 km away          │
│ └──────┘                       │
│         $120/night    ❤️       │
└────────────────────────────────┘
```

**Card Specs:**
- Image: 80x80px, rounded 12px
- Title: 16px semibold, #0f172a
- Subtitle: 13px, #475467
- Distance: 12px, #22c55e
- Price: 16px bold, #003580
- Heart icon: 24px, outline gray, filled red when saved
- Card padding: 12px
- Card gap: 8px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)

### Deliverable
- Bottom sheet header design
- Result card component design
- Empty state design
- Loading skeleton design

---

## Part 3: Filter Modal

### Booking.com Pattern
Full-screen modal with organized filters:
- Header with Cancel/Title/Reset
- Scrollable filter sections
- Sticky footer with Apply button

### Filter Modal Layout
```
┌────────────────────────────────┐
│ Cancel      Filters      Reset │
├────────────────────────────────┤
│                                │
│  TYPE                          │
│  ☑ Hotels                      │
│  ☑ Restaurants                 │
│  ☐ Attractions                 │
│  ☐ Services                    │
│  ☐ Events                      │
│                                │
│  RATING                        │
│  ○ Any  ● 3+  ○ 4+  ○ 4.5+    │
│                                │
│  WHEN (Events only)            │
│  ○ Any time                    │
│  ○ Today                       │
│  ○ This week                   │
│  ○ This month                  │
│                                │
│  FEATURES                      │
│  ☐ Free WiFi                   │
│  ☐ Parking                     │
│  ☐ Pet friendly                │
│                                │
├────────────────────────────────┤
│  ┌────────────────────────┐    │
│  │   Show 24 results      │    │
│  └────────────────────────┘    │
└────────────────────────────────┘
```

**Specs:**
- Section title: 12px uppercase, #475467, tracking 1px
- Checkbox: 24px, brand blue when checked
- Radio: 24px, brand blue when selected
- Apply button: Full width, 48px height, #003580 bg, white text
- Section gap: 24px
- Item gap: 12px

### Deliverable
- Filter modal full design
- Checkbox/radio component styles
- Button states (default, pressed, disabled)

---

## Part 4: Map Controls

### Top Bar (replaces filter chips)
```
┌────────────────────────────────┐
│ ┌─────────┐    ┌────────────┐  │
│ │ Filters │    │ Sort: Best │  │
│ │   (3)   │    │     ▼      │  │
│ └─────────┘    └────────────┘  │
└────────────────────────────────┘
```

**Filter Button:**
- White bg, rounded 20px
- Icon + "Filters" text
- Badge with count if filters active
- Shadow

**Sort Dropdown:**
- Options: Best match, Rating, Distance, Price

### Map Control Buttons (right side)
```
     ┌───┐
     │ ⊕ │  ← Current location
     └───┘
     ┌───┐
     │ + │  ← Zoom in
     └───┘
     ┌───┐
     │ − │  ← Zoom out
     └───┘
```

**Button Specs:**
- 44x44px touch target
- White bg, rounded 8px
- Shadow
- Icon 24px, #475467

### "Search This Area" Button
Appears when user pans map:
```
┌─────────────────────┐
│ 🔄 Search this area │
└─────────────────────┘
```
- Centered horizontally
- Below top bar
- White bg, rounded 20px
- Shadow
- Disappears after search or timeout

### Deliverable
- Top bar design
- Map control buttons
- Search area button
- Sort dropdown design

---

## Part 5: Selected Item View

### Booking.com Pattern
When marker tapped, show quick preview card:

```
┌────────────────────────────────┐
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │         LARGE IMAGE        │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
│  Hotel Stykkishólmur           │
│  ★★★★ · 4.5 (128 reviews)     │
│  0.3 km · Borgarbraut 8        │
│                                │
│  ┌──────────┐  ┌──────────┐   │
│  │ Directions│  │   Save   │   │
│  └──────────┘  └──────────┘   │
│                                │
│  ┌────────────────────────┐   │
│  │     View details →     │   │
│  └────────────────────────┘   │
└────────────────────────────────┘
```

**Specs:**
- Card slides up from bottom
- Image: full width, 180px height
- Title: 18px bold
- Actions: 44px height buttons
- View details: Full width, primary style

### Deliverable
- Selected item card design
- Button styles
- Slide-up animation specs

---

## Part 6: Empty & Loading States

### No Results
```
┌────────────────────────────────┐
│                                │
│            🗺️                  │
│                                │
│   No places found nearby       │
│                                │
│   Try adjusting your filters   │
│   or search a different area   │
│                                │
│   ┌────────────────────┐       │
│   │   Clear filters    │       │
│   └────────────────────┘       │
└────────────────────────────────┘
```

### Loading State
- Skeleton cards in bottom sheet
- Pulsing placeholder markers on map

### Deliverable
- Empty state illustration
- Loading skeleton designs

---

## Summary of Deliverables

1. **Marker designs** - All types, states, specs
2. **Bottom sheet** - Header, cards, empty, loading
3. **Filter modal** - Full layout, components
4. **Map controls** - Top bar, buttons, search area
5. **Selected view** - Preview card with actions
6. **States** - Empty, loading, error

---

## Reference

- [Booking.com Map UX](https://www.researchgate.net/figure/Walkthrough-of-the-Bookingcom-Mobile-Map-Design_fig3_325559306)
- [Booking.com App Design](https://www.designrush.com/best-designs/apps/bookingcom)
- [Baymard UX Benchmark](https://baymard.com/ux-benchmark/case-studies/booking-com)
