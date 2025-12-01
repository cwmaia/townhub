# Engineer Task: Map Marker System Implementation

**Priority:** P1 - Core Feature
**Estimated Time:** 8-10 hours
**Dependencies:** None (can start immediately)

---

## Current State Analysis

### Database - Subscription Tiers (EXISTING)

The seed file already defines these tiers in `database/seed/seed.ts`:

| Slug | Name | Price (ISK) | Priority | Notifications/mo | Events/mo |
|------|------|-------------|----------|------------------|-----------|
| starter | Starter | 7,500 | 1 | 2 | 2 |
| growth | Growth | 15,000 | 2 | 8 | 6 |
| premium | Premium | 29,000 | 3 | 20 | Unlimited |

**Premium = priority >= 3** (Premium tier only)
**Growth = priority >= 2** (Growth gets some perks but not gold markers)

### Database - Places (30 in DB)

Places have coordinates (`lat`/`lng`) and types:
- `TOWN_SERVICE` - 5 places (Police, Fire, Health, Ferry, Post)
- `LODGING` - 8 places (Hotels, Guesthouses)
- `RESTAURANT` - 9 places (Bistros, Cafes, etc.)
- `ATTRACTION` - 8 places (Museums, Tours, etc.)

**Places DO have coordinates** ✅

### Database - Events (4 in DB)

Events currently:
- Have `location` as text string ("Harbor Square", "Helgafell Trailhead")
- **NO latitude/longitude fields** ❌
- Have `isTownEvent` and `isFeatured` flags
- Have optional `businessId` link

**Events use FAKE coordinates** - currently generated from ID hash in `getEventCoordinates()`

### API - Current Response

The `/api/map/data` endpoint returns:
- Places with `latitude`, `longitude` (mapped from `lat`/`lng`)
- Events with COMPUTED coordinates (not real)
- Events have `isHappeningSoon` (within 48 hours) and `isHot` (20+ RSVPs)

---

## What Needs to Be Built

### Phase 1: Database Schema Update

Add real coordinates to Events:

```prisma
model Event {
  // ... existing fields
  latitude    Float?    // NEW - actual event location
  longitude   Float?    // NEW - actual event location
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_event_coordinates
```

### Phase 2: Update Seed Data

Update `database/seed/fetch_stykkisholmur.ts` to include event coordinates:

```typescript
export const stykkisholmurEvents: SeedEvent[] = [
  {
    title: "Breiðafjörður Seafood Festival",
    description: "...",
    imageUrl: "...",
    startsAt: "2025-07-12T11:00:00Z",
    endsAt: "2025-07-12T20:00:00Z",
    location: "Harbor Square",
    latitude: 65.0752,      // NEW - Harbor Square coords
    longitude: -22.7339,    // NEW
  },
  {
    title: "Midnight Sun Kayak Tour",
    location: "Bæjartröð Slipway",
    latitude: 65.0745,      // NEW
    longitude: -22.7285,    // NEW
    // ...
  },
  {
    title: "Helgafell Sunrise Walk",
    location: "Helgafell Trailhead",
    latitude: 65.0631,      // NEW - Helgafell coords
    longitude: -22.7290,    // NEW
    // ...
  },
  {
    title: "Norwegian House Museum Night",
    location: "Norwegian House",
    latitude: 65.0772,      // NEW - Museum coords
    longitude: -22.7287,    // NEW
    // ...
  },
];
```

Update `SeedEvent` type and seed.ts to include lat/lng.

### Phase 3: Add Free Tier to Subscriptions

Add a FREE tier (priority 0) for businesses that haven't subscribed:

```typescript
const BUSINESS_TIERS = [
  {
    slug: "free",
    name: "Free",
    price: 0,
    notificationLimit: 0,
    eventLimit: 1,
    description: "Basic listing for unclaimed businesses.",
    features: {
      highlights: ["Basic listing", "1 event/month"],
    },
    priority: 0,
  },
  // ... existing tiers (starter, growth, premium)
];
```

### Phase 4: Update Map API Response

**File:** `app/api/map/data/route.ts`

Add business/subscription info to response:

```typescript
// Fetch places WITH business and subscription
const places = await prisma.place.findMany({
  where: { townId, lat: { not: null }, lng: { not: null } },
  include: {
    business: {
      include: {
        subscription: true,
      },
    },
  },
});

// Fetch events WITH business and subscription
const events = await prisma.event.findMany({
  where: { townId },
  include: {
    business: {
      include: {
        subscription: true,
      },
    },
  },
});
```

**Compute marker category for each item:**

```typescript
type MarkerCategory =
  | 'TOWN_SERVICE'       // Blue - hospitals, post office, etc.
  | 'BUSINESS_FREE'      // Light green - no subscription
  | 'BUSINESS_STARTER'   // Green - starter tier
  | 'BUSINESS_GROWTH'    // Teal - growth tier
  | 'BUSINESS_PREMIUM'   // Gold - premium tier
  | 'EVENT_TOWN'         // Red - town-organized
  | 'EVENT_COMMUNITY'    // Green - community/business
  | 'EVENT_FEATURED'     // Gold - featured events
  | 'EVENT_PREMIUM';     // Shiny gold - premium business events

const MARKER_COLORS = {
  TOWN_SERVICE: '#2563eb',       // Blue-600
  BUSINESS_FREE: '#86efac',      // Green-300 (lighter)
  BUSINESS_STARTER: '#22c55e',   // Green-500
  BUSINESS_GROWTH: '#14b8a6',    // Teal-500
  BUSINESS_PREMIUM: '#D4AF37',   // Gold
  EVENT_TOWN: '#dc2626',         // Red-600
  EVENT_COMMUNITY: '#22c55e',    // Green-500
  EVENT_FEATURED: '#fbbf24',     // Amber-400
  EVENT_PREMIUM: '#FFD700',      // Bright Gold
};

function getPlaceMarkerCategory(place, business): MarkerCategory {
  if (place.type === 'TOWN_SERVICE') return 'TOWN_SERVICE';
  if (!business) return 'BUSINESS_FREE';

  const tier = business.subscription?.slug || 'free';
  switch (tier) {
    case 'premium': return 'BUSINESS_PREMIUM';
    case 'growth': return 'BUSINESS_GROWTH';
    case 'starter': return 'BUSINESS_STARTER';
    default: return 'BUSINESS_FREE';
  }
}

function getEventMarkerCategory(event, business): MarkerCategory {
  if (event.isTownEvent) return 'EVENT_TOWN';
  if (event.isFeatured) return 'EVENT_FEATURED';

  if (business?.subscription?.slug === 'premium') {
    return 'EVENT_PREMIUM';
  }

  return 'EVENT_COMMUNITY';
}
```

**Compute time flags:**

```typescript
function computeEventTimeFlags(startsAt: Date, endsAt: Date | null) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    isToday: startsAt >= today && startsAt < tomorrow,
    isThisWeek: startsAt >= today && startsAt < weekFromNow,
    isUpcoming: startsAt > now && startsAt < weekFromNow,
    isHappeningNow: startsAt <= now && (!endsAt || endsAt > now),
    shouldAnimate: startsAt > now && startsAt < weekFromNow, // Animate upcoming events
  };
}
```

**Final API response shape:**

```typescript
{
  places: [
    {
      id: "...",
      name: "Hotel Stykkishólmur",
      type: "LODGING",
      latitude: 65.074,
      longitude: -22.73,
      imageUrl: "/media/hotel.jpg",
      rating: 4.2,
      ratingCount: 418,
      tags: ["Hotel", "Breakfast", "$$"],

      // NEW fields
      businessId: "biz123" | null,
      subscriptionTier: "premium" | "growth" | "starter" | "free" | null,
      isPremium: true,
      markerCategory: "BUSINESS_PREMIUM",
      markerColor: "#D4AF37",
    }
  ],

  events: [
    {
      id: "...",
      name: "Breiðafjörður Seafood Festival",
      latitude: 65.0752,        // NOW from database
      longitude: -22.7339,      // NOT computed
      imageUrl: "...",
      startDate: "2025-07-12T11:00:00Z",
      endDate: "2025-07-12T20:00:00Z",
      location: "Harbor Square",

      // Existing flags
      isTownEvent: false,
      isFeatured: true,
      rsvpCount: 45,

      // NEW business info
      businessId: null,
      subscriptionTier: null,
      isPremium: false,

      // NEW time flags
      isToday: false,
      isThisWeek: true,
      isUpcoming: true,
      isHappeningNow: false,

      // NEW marker info
      markerCategory: "EVENT_FEATURED",
      markerColor: "#fbbf24",
      shouldAnimate: true,
    }
  ],

  town: { ... }
}
```

---

## Mobile Implementation

### Update Types

**File:** `hooks/useMapData.ts` or new `types/map.ts`

```typescript
export type MarkerCategory =
  | 'TOWN_SERVICE'
  | 'BUSINESS_FREE'
  | 'BUSINESS_STARTER'
  | 'BUSINESS_GROWTH'
  | 'BUSINESS_PREMIUM'
  | 'EVENT_TOWN'
  | 'EVENT_COMMUNITY'
  | 'EVENT_FEATURED'
  | 'EVENT_PREMIUM';

export type MapPlace = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
  tags: string[];
  businessId: string | null;
  subscriptionTier: string | null;
  isPremium: boolean;
  markerCategory: MarkerCategory;
  markerColor: string;
};

export type MapEvent = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isTownEvent: boolean;
  isFeatured: boolean;
  rsvpCount: number;
  businessId: string | null;
  subscriptionTier: string | null;
  isPremium: boolean;
  isToday: boolean;
  isThisWeek: boolean;
  isUpcoming: boolean;
  isHappeningNow: boolean;
  markerCategory: MarkerCategory;
  markerColor: string;
  shouldAnimate: boolean;
};
```

### Update MarkerBubble Component

**File:** `components/map/MarkerBubble.tsx`

Use `markerColor` from API instead of computing locally. Add pulse animation for `shouldAnimate`:

```tsx
// Use item.markerColor directly
<View style={[styles.bubble, { backgroundColor: item.markerColor }]}>
  ...
</View>

// Add animation for events
useEffect(() => {
  if (type === 'event' && item.shouldAnimate) {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }
}, [item.shouldAnimate]);
```

### Marker Visual Design

**Places (Pin shape):**
- 🔵 Town Services: Blue teardrop pin
- 🟢 Businesses: Green teardrop pin (shade varies by tier)
- 🟡 Premium: Gold teardrop pin

**Events (Calendar/Banner shape):**
- Show date (e.g., "Jul 12") inside marker
- 🔴 Town Events: Red with white text
- 🟢 Community Events: Green
- 🟡 Featured/Premium: Gold with shimmer effect
- Pulse animation for upcoming events

---

## Acceptance Criteria

### Database
- [ ] Event model has `latitude` and `longitude` fields
- [ ] Seed events have real coordinates
- [ ] FREE subscription tier exists (priority 0)

### API
- [ ] `/api/map/data` includes business info for places
- [ ] Events use real coordinates (not computed from ID)
- [ ] Response includes `markerCategory`, `markerColor`, `shouldAnimate`
- [ ] Time flags computed correctly (isToday, isUpcoming, etc.)

### Mobile
- [ ] Markers use colors from API
- [ ] Town services are blue
- [ ] Businesses show green/teal/gold based on tier
- [ ] Events show date and animate if upcoming
- [ ] Premium items have gold markers

---

## Files to Modify

### CMS (Backend)
1. `database/schema.prisma` - Add Event.latitude, Event.longitude
2. `database/seed/seed.ts` - Add FREE tier, include lat/lng for events
3. `database/seed/fetch_stykkisholmur.ts` - Add coordinates to events
4. `app/api/map/data/route.ts` - Include business info, compute markers

### Mobile
1. `hooks/useMapData.ts` - Update types
2. `components/map/MarkerBubble.tsx` - Use API colors, add animation
3. `components/map/InteractiveMap.tsx` - Pass new props to markers

---

## Testing Checklist

1. **Run seed:** `npx prisma db seed` - verify events have coordinates
2. **Test API:** `curl http://localhost:3000/api/map/data?townId=stykkisholmur`
   - Check places have `markerCategory` and `markerColor`
   - Check events have real lat/lng (not all near town center)
   - Check events have time flags
3. **Visual test on device:**
   - Town services appear blue
   - Restaurants/hotels appear green
   - Events show date and pulse if upcoming
   - Featured events are gold

---

## Start Here

1. **Database first:** Add lat/lng to Event model, run migration
2. **Update seed:** Add coordinates to `stykkisholmurEvents`, add FREE tier
3. **Run seed:** `npx prisma db seed`
4. **Update API:** Include business info, compute marker metadata
5. **Test API:** Verify response shape with curl
6. **Then mobile:** Update types and marker component

---

**Questions? Check `ARCHITECT_ANALYSIS_MAP_MARKERS.md` or ask Architect.**
