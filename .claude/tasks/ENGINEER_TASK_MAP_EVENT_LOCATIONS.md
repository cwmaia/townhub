# Engineer Task: Fix Event Locations on Interactive Map

**Priority:** P0 - Critical blocker
**Status:** Ready for Implementation

---

## Problem

Events on the interactive map currently have **random/mock coordinates**. They should display at their actual venue locations or a sensible default.

**Current Code (BROKEN):**
```typescript
// /Users/carlosmaia/townhub/app/api/map/data/route.ts lines 84-85
latitude: 65.0752 + (Math.random() - 0.5) * 0.02,  // Random!
longitude: -22.7339 + (Math.random() - 0.5) * 0.02,
```

---

## Solution

### Option A: Use Venue/Place Coordinates (Recommended)

Events are often hosted at a Place (restaurant, venue, etc.). Link events to their venue's coordinates.

**Database Changes:**
```prisma
// In schema.prisma - Event model
model Event {
  // ... existing fields

  // Add venue relationship
  venueId    String?
  venue      Place?   @relation(fields: [venueId], references: [id])

  // Keep direct coords as fallback
  latitude   Float?
  longitude  Float?
}
```

**API Logic:**
```typescript
// Use venue coords if available, else event coords, else town center
const getEventCoordinates = (event, townCenter) => {
  if (event.venue?.lat && event.venue?.lng) {
    return { latitude: event.venue.lat, longitude: event.venue.lng };
  }
  if (event.latitude && event.longitude) {
    return { latitude: event.latitude, longitude: event.longitude };
  }
  // Town events default to town center
  return { latitude: townCenter.lat, longitude: townCenter.lng };
};
```

### Option B: Quick Fix - Town Events at Town Center

For immediate fix without DB changes:

```typescript
// Town events at town center, others at slight offset based on ID
const getEventCoordinates = (event, townCenter, index) => {
  if (event.isTownEvent) {
    return { latitude: townCenter.lat, longitude: townCenter.lng };
  }
  // Deterministic offset based on event ID (not random)
  const hash = event.id.charCodeAt(0) + event.id.charCodeAt(1);
  const angle = (hash % 360) * (Math.PI / 180);
  const distance = 0.005 + (hash % 10) * 0.001;
  return {
    latitude: townCenter.lat + Math.cos(angle) * distance,
    longitude: townCenter.lng + Math.sin(angle) * distance,
  };
};
```

---

## Implementation Steps

### Step 1: Update API Endpoint

**File:** `/Users/carlosmaia/townhub/app/api/map/data/route.ts`

1. Remove random coordinate generation
2. Implement coordinate resolution logic
3. Ensure town events cluster at town center
4. Add venue relationship to Prisma query if using Option A

### Step 2: Update Prisma Schema (Option A only)

**File:** `/Users/carlosmaia/townhub/database/schema.prisma`

1. Add `venueId` and `venue` relation to Event model
2. Run migration: `npx prisma migrate dev --name add_event_venue`
3. Update seed data to link events to venues

### Step 3: Update CMS Event Form (Option A only)

**File:** `/Users/carlosmaia/townhub/app/dashboard/events/...`

1. Add venue selector dropdown to event create/edit form
2. Show venue address when selected
3. Allow manual lat/lng override

### Step 4: Test

1. Verify town events appear at town center
2. Verify business events appear at correct venues
3. Verify events without venues have sensible fallback
4. Check mobile app renders correctly

---

## Files to Modify

```
/Users/carlosmaia/townhub/
├── app/api/map/data/route.ts          # Main fix
├── database/schema.prisma              # Option A: Add venue relation
├── app/dashboard/events/[id]/page.tsx  # Option A: Add venue selector
└── prisma/seed.ts                      # Update seed data
```

---

## Test Data

After fix, verify these scenarios:

| Event Type | Expected Location |
|------------|-------------------|
| Town Meeting | Town center (65.0752, -22.7339) |
| Restaurant Special | Restaurant's coordinates |
| Hotel Event | Hotel's coordinates |
| Generic Event (no venue) | Town center or deterministic offset |

---

## Acceptance Criteria

- [ ] No more random coordinates in API response
- [ ] Town events cluster at town center
- [ ] Events with venues show at venue location
- [ ] Events without venues have sensible default
- [ ] Mobile map shows events at correct positions
- [ ] Multiple events at same venue stack/cluster properly
