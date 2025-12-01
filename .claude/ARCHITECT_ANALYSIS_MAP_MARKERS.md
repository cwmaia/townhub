# Architect Analysis: Interactive Map Marker System

**Date:** 2025-12-01
**Author:** Architect (Claude)
**Status:** Analysis Complete - Ready for Implementation
**Priority:** P1 - Core Feature

---

## Executive Summary

The interactive map is now rendering on Android, but the markers are displaying raw data (ratings, dates) in an unstructured way. We need a complete marker design system that:

1. Clearly distinguishes **Events** from **Places**
2. Color-codes by business relationship and subscription tier
3. Animates upcoming events to catch user attention
4. Shows relevant information at a glance

---

## User Story

> *"When a tourist or a user of the town loads up the app and opens the map, they want to see:*
> 1. *Events that are ongoing or coming up today/this week/weekend - these should be flashing with the name and datetime*
> 2. *When clicked, a white card with information should appear below*
> 3. *Clear difference between places and events - different icons and colors*
> 4. *Town places (hospitals, postbox) = BLUE*
> 5. *Businesses = GREEN*
> 6. *Premium businesses = GOLD*
> 7. *Premium business events = SHINY GOLD"*

---

## Current Database Architecture Analysis

### ✅ What We Have (Good)

```
Place Model:
├── type: TOWN_SERVICE | LODGING | RESTAURANT | ATTRACTION
├── lat/lng: Float (coordinates exist)
├── business?: Business (one-to-one relationship)
└── tags[], rating, etc.

Business Model:
├── placeId: links to Place (one-to-one)
├── subscriptionId: links to Subscription
├── events[]: one-to-many relationship
└── status: pending | approved

Subscription Model:
├── name: String (tier name)
├── priority: Int (for ordering)
├── features: JSON
└── notificationLimit, eventLimit

Event Model:
├── businessId?: links to Business (optional)
├── isTownEvent: Boolean
├── isFeatured: Boolean
├── startsAt/endsAt: DateTime
└── location: String (text description)
```

### ❌ What's Missing (Blockers)

1. **Events have no coordinates**
   - `Event.location` is a text string like "Harbor Square"
   - No `latitude`/`longitude` fields
   - **Impact:** Events cannot be placed on map accurately

2. **No clear "isPremium" indicator**
   - Must query through `Business → Subscription → priority/name`
   - No direct way to know if a place/event is premium
   - **Impact:** API complexity, extra queries

3. **Subscription tiers not defined**
   - What `priority` value = premium?
   - What subscription `name` = premium?
   - **Impact:** Can't determine gold vs green markers

---

## Proposed Solution

### Phase 1: Database Schema Updates (Engineer)

```prisma
// Option A: Add coordinates to Event
model Event {
  // ... existing fields
  latitude    Float?    // NEW
  longitude   Float?    // NEW
  placeId     String?   // NEW - link to a Place for coordinates
  place       Place?    @relation(fields: [placeId], references: [id])
}

// Option B: Always link Event to Place (preferred)
// Events happen AT places - use Place.lat/lng
```

**Recommendation:** Option B is cleaner. Every event happens at a location. Link events to places and use the place's coordinates.

### Phase 2: Define Subscription Tiers

```typescript
// In CMS constants or database
const SUBSCRIPTION_TIERS = {
  FREE: { priority: 0, isPremium: false, color: 'green' },
  BASIC: { priority: 1, isPremium: false, color: 'green' },
  PREMIUM: { priority: 2, isPremium: true, color: 'gold' },
  ENTERPRISE: { priority: 3, isPremium: true, color: 'gold' },
};
```

Add migration to seed these tiers if not present.

### Phase 3: API Response Shape

```typescript
// GET /api/map/data response
{
  places: [
    {
      id: "...",
      name: "Hotel Stykkishólmur",
      type: "LODGING",           // PlaceType enum
      latitude: 65.074,
      longitude: -22.73,

      // Business info (if linked)
      business: {
        id: "...",
        name: "Hotel Stykkishólmur",
        isPremium: true,          // Computed from subscription
        subscriptionTier: "PREMIUM"
      } | null,

      // For marker rendering
      markerCategory: "BUSINESS_PREMIUM",  // Computed
      markerColor: "#D4AF37"               // Gold
    }
  ],

  events: [
    {
      id: "...",
      name: "Midnight Sun Festival",
      latitude: 65.0752,
      longitude: -22.7339,
      startsAt: "2025-06-21T22:00:00Z",
      endsAt: "2025-06-22T04:00:00Z",

      // Event flags
      isTownEvent: false,
      isFeatured: true,

      // Business info (if business event)
      business: {
        id: "...",
        isPremium: true,
        subscriptionTier: "PREMIUM"
      } | null,

      // Time-based flags (computed)
      isUpcoming: true,           // Starts within 7 days
      isHappeningNow: false,      // Currently ongoing
      isToday: false,             // Starts today
      isThisWeek: true,           // Starts within 7 days

      // For marker rendering
      markerCategory: "EVENT_PREMIUM",
      markerColor: "#FFD700",     // Shiny gold
      shouldAnimate: true         // Flash for upcoming
    }
  ],

  town: { ... }
}
```

### Phase 4: Marker Design System

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAP MARKER HIERARCHY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLACES (Static pins)                                           │
│  ─────────────────────                                          │
│  🔵 TOWN_SERVICE    - Blue pin       - Hospital, Post, Police   │
│  🟢 BUSINESS        - Green pin      - Free/Basic subscription  │
│  🟡 BUSINESS_PREMIUM - Gold pin      - Premium subscription     │
│                                                                  │
│  EVENTS (Dynamic markers with date/time)                        │
│  ─────────────────────────────────────                          │
│  🔴 TOWN_EVENT      - Red calendar   - Town-organized           │
│  🟢 BUSINESS_EVENT  - Green calendar - Business (free/basic)    │
│  🟡 EVENT_PREMIUM   - Gold calendar  - Business (premium)       │
│  ✨ EVENT_FEATURED  - Gold + shine   - Explicitly featured      │
│                                                                  │
│  ANIMATIONS                                                      │
│  ──────────                                                      │
│  • Upcoming (today/this week): Pulse animation                  │
│  • Happening now: Glow effect                                    │
│  • Featured: Sparkle/shimmer                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 5: Mobile Implementation

```typescript
// components/map/MapMarker.tsx

type MarkerCategory =
  | 'TOWN_SERVICE'      // Blue
  | 'BUSINESS'          // Green
  | 'BUSINESS_PREMIUM'  // Gold
  | 'TOWN_EVENT'        // Red
  | 'BUSINESS_EVENT'    // Green
  | 'EVENT_PREMIUM'     // Gold
  | 'EVENT_FEATURED';   // Gold + shine

const MARKER_COLORS = {
  TOWN_SERVICE: '#2563eb',      // Blue-600
  BUSINESS: '#16a34a',          // Green-600
  BUSINESS_PREMIUM: '#D4AF37',  // Gold
  TOWN_EVENT: '#dc2626',        // Red-600
  BUSINESS_EVENT: '#16a34a',    // Green-600
  EVENT_PREMIUM: '#FFD700',     // Gold
  EVENT_FEATURED: '#FFD700',    // Gold + animation
};

// Marker shape
// Places: Pin/teardrop shape
// Events: Calendar/flag shape with date
```

---

## Implementation Tasks

### Task 1: Database Migration (Engineer - 2hrs)

**File:** `database/migrations/add_event_coordinates.sql`

```sql
-- Add coordinates to Event OR link to Place
ALTER TABLE "Event" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Event" ADD COLUMN "placeId" TEXT REFERENCES "Place"("id");

-- Seed subscription tiers
INSERT INTO "Subscription" (id, name, slug, price, priority, ...) VALUES
  ('free', 'Free', 'free', 0, 0, ...),
  ('basic', 'Basic', 'basic', 4900, 1, ...),
  ('premium', 'Premium', 'premium', 14900, 2, ...),
  ('enterprise', 'Enterprise', 'enterprise', 49900, 3, ...);
```

**Acceptance Criteria:**
- [ ] Events can have lat/lng directly OR link to a Place
- [ ] Subscription tiers exist with clear priority values
- [ ] Migration is reversible

---

### Task 2: Update Map API (Engineer - 3hrs)

**File:** `app/api/map/data/route.ts`

Update the API to:
1. Include business subscription info with places
2. Compute `isPremium` based on subscription priority >= 2
3. Compute event time flags (isUpcoming, isHappeningNow, isToday, isThisWeek)
4. Return `markerCategory` and `markerColor` for each item
5. Include `shouldAnimate` for events

**Acceptance Criteria:**
- [ ] API returns all fields documented above
- [ ] Premium businesses correctly identified
- [ ] Event time calculations are accurate
- [ ] Response is typed with TypeScript

---

### Task 3: Marker Component Redesign (Architect + Engineer - 4hrs)

**Files:**
- `components/map/MapMarker.tsx` - Main marker component
- `components/map/PlaceMarker.tsx` - Place-specific marker
- `components/map/EventMarker.tsx` - Event-specific marker with animation

**Design Requirements:**
1. Places: Teardrop/pin shape with icon inside
2. Events: Calendar/banner shape showing date
3. Colors per the hierarchy above
4. Animation support for upcoming events

**Acceptance Criteria:**
- [ ] Clear visual distinction between places and events
- [ ] Color-coded by category
- [ ] Upcoming events animate (pulse/flash)
- [ ] Selected state is visually distinct

---

### Task 4: Bottom Card Preview (Architect + Engineer - 3hrs)

**Files:**
- `components/map/MarkerPreviewCard.tsx`
- `components/map/InteractiveMap.tsx` (integration)

When a marker is tapped:
1. Show a white card sliding up from bottom
2. Display: Image, Name, Type badge, Rating (if place), Date/Time (if event)
3. "View Details" button to navigate to detail screen
4. Dismiss on tap outside or swipe down

**Acceptance Criteria:**
- [ ] Card appears on marker tap
- [ ] Shows relevant info based on item type
- [ ] Premium items show gold accent
- [ ] Can dismiss and navigate to detail

---

### Task 5: Filter Updates (Engineer - 2hrs)

**File:** `components/map/FilterModal.tsx`

Update filters to match new categories:
- [ ] Town Services (blue)
- [ ] Businesses (green)
- [ ] Premium Businesses (gold)
- [ ] Events - All
- [ ] Events - Today
- [ ] Events - This Week
- [ ] Events - Featured

---

## Data Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Database      │────▶│   API Endpoint  │────▶│   Mobile App    │
│                 │     │                 │     │                 │
│ • Place         │     │ /api/map/data   │     │ InteractiveMap  │
│ • Business      │     │                 │     │                 │
│ • Subscription  │     │ Computes:       │     │ Renders:        │
│ • Event         │     │ • isPremium     │     │ • MapMarker     │
│                 │     │ • markerCategory│     │ • Animations    │
│                 │     │ • shouldAnimate │     │ • PreviewCard   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Priority Order

1. **P0 (Blocker):** Event coordinates - Without this, events can't be on map
2. **P1 (High):** API updates with premium/time flags
3. **P1 (High):** Marker redesign with colors
4. **P2 (Medium):** Animation for upcoming events
5. **P2 (Medium):** Bottom card preview
6. **P3 (Low):** Filter updates

---

## Estimated Timeline

| Task | Owner | Hours | Depends On |
|------|-------|-------|------------|
| Database migration | Engineer | 2h | - |
| API updates | Engineer | 3h | Database |
| Marker components | Architect + Engineer | 4h | API |
| Bottom card | Architect + Engineer | 3h | Markers |
| Filter updates | Engineer | 2h | API |
| **Total** | | **14h** | |

---

## Questions for Product

1. Should events always be linked to a Place, or can they have freeform coordinates?
2. What subscription tier names do we want? (FREE, BASIC, PREMIUM, ENTERPRISE?)
3. Should "featured" events always animate, or only when upcoming?
4. Do we want different animations for "happening now" vs "upcoming"?

---

## Next Steps

1. Engineer: Review this document and confirm approach
2. Engineer: Start with database migration (Task 1)
3. Architect: Create marker design mockups
4. Sync: Align on subscription tier definitions

---

**Document Status:** Ready for Engineer Review
