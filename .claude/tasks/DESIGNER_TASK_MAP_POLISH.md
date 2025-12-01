# Designer Task: Interactive Map Visual Polish

**Priority:** P1 - High
**Status:** 🔴 TODO
**Depends On:** Map markers working (✅ Done)

---

## Context

The Interactive Map now has working custom markers and filters. We need design polish to make it feel premium and match the TownApp brand.

---

## Current State

### What's Working
- Custom PNG markers for places (4 types) and events (5 states)
- Filter chips at top of screen
- Preview card when tapping a marker
- Selection animation (scale up)
- Hot event glow animation

### What Needs Polish
1. Filter bar looks basic
2. Preview card needs better styling
3. Map style could be customized
4. Marker clusters not designed yet

---

## Design Tasks

### Task 1: Filter Bar Redesign

**Current:** Basic white card with chips
**Goal:** Premium floating control that matches TownApp brand

Consider:
- Frosted glass effect (blur background)
- Subtle gradient or brand color accent
- Icon + text for each filter category
- Smooth toggle animation between states
- Collapse to single row when not focused

**Deliverable:** Updated styles and any icon assets needed

### Task 2: Preview Card Enhancement

**File:** `/townhub-mobile/components/map/MarkerPreview.tsx`

**Current:** Basic card with image, title, type label
**Goal:** Rich preview that entices users to tap through

Design elements to add:
- Distance indicator (e.g., "0.3 km away")
- Action buttons (Directions, Save, Share)
- Swipe-up gesture hint for full details
- Smooth slide-in animation
- Different styling for events vs places

**Deliverable:** Updated MarkerPreview design with new layout

### Task 3: Custom Map Style (Optional)

Google Maps supports custom styling. Consider:
- Muted colors that let our markers pop
- TownApp brand blue for water
- Simplified labels
- Dark mode variant

**Deliverable:** Map style JSON for Google Maps

### Task 4: Cluster Marker Design

When multiple markers overlap, they cluster. Design needed for:
- Circle with count number
- Color coding by type (blue for places, purple for events, gradient for mixed)
- Expand animation when tapped

**Reference:** Cluster SVGs already exist at `/townhub/public/branding/map-icons/cluster-*.svg`

**Deliverable:**
- PNG exports of cluster markers
- Cluster component design specs

### Task 5: Empty/Error States

Design needed for:
- No markers in current filter
- Loading state (skeleton markers?)
- Error state (failed to load data)
- No events in selected date range

**Deliverable:** Empty state illustrations and copy

---

## Brand Reference

**Colors:**
- Primary Blue: #3b82f6
- Dark Blue (Town): #003580
- Gold (Featured): #fbbf24
- Hot Red: #ef4444
- Success Green: #22c55e

**Existing Icons:** `/townhub-mobile/assets/map-icons/`

---

## Files to Update

```
/townhub-mobile/components/map/
├── MapFilters.tsx        # Filter bar styling
├── MarkerPreview.tsx     # Preview card design
├── ClusterMarker.tsx     # NEW - Cluster component
└── InteractiveMap.tsx    # Map container, empty states
```

---

## Success Criteria

- [ ] Filter bar looks premium and matches brand
- [ ] Preview card is visually rich and engaging
- [ ] Cluster markers work for overlapping pins
- [ ] Empty states guide users appropriately
- [ ] All animations feel smooth and intentional
- [ ] Dark mode support (if applicable)
