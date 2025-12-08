# Engineer Task: Integrate Geocoding for Map Locations

**Priority:** P1 - High
**Status:** 🟡 IN PROGRESS (Task 1 Complete)
**Depends On:** Google Maps API Key (already configured)

---

## Context

The Interactive Map needs real, accurate locations for all markers. The geocoding utility has been implemented, but it needs to be integrated with place/event creation and existing data needs to be backfilled.

---

## Completed Work

### ✅ Task 1: Geocoding Utility (DONE)

**File:** `/townhub/lib/google.ts`

The following functions have been added:

```typescript
// Geocode a single address
export async function geocodeAddress(address: string): Promise<GeocodingResult | null>

// Batch geocode with rate limiting
export async function geocodeAddresses(addresses: string[], delayMs = 100): Promise<Map<string, GeocodingResult>>
```

---

## Remaining Tasks

### Task 2: Auto-Geocode on Place Creation/Update

**Priority:** P1

When a place is created or updated in the CMS with an address but no coordinates, automatically geocode.

**File to modify:** `/townhub/app/[locale]/admin/page.tsx` or wherever places are created

**Implementation:**

```typescript
import { geocodeAddress } from "@/lib/google";

// Before saving a place:
async function handleSavePlace(placeData) {
  // Auto-geocode if address exists but coords don't
  if (placeData.address && (!placeData.lat || !placeData.lng)) {
    const coords = await geocodeAddress(placeData.address);
    if (coords) {
      placeData.lat = coords.lat;
      placeData.lng = coords.lng;
    }
  }

  // Save to DB...
}
```

**Acceptance Criteria:**
- [ ] New places with addresses get auto-geocoded
- [ ] Updated places with changed addresses get re-geocoded
- [ ] Places with existing coords are not re-geocoded
- [ ] Geocoding failures don't block place creation

---

### Task 3: Auto-Geocode on Event Creation/Update

**Priority:** P1

Same as Task 2 but for events. Events have a `location` field that should be geocoded.

**File to modify:** Event creation/update handlers

**Implementation:**

```typescript
// Before saving an event:
async function handleSaveEvent(eventData) {
  if (eventData.location && (!eventData.latitude || !eventData.longitude)) {
    const coords = await geocodeAddress(eventData.location);
    if (coords) {
      eventData.latitude = coords.lat;
      eventData.longitude = coords.lng;
    }
  }
}
```

**Acceptance Criteria:**
- [ ] New events with locations get auto-geocoded
- [ ] Town events default to town center if geocoding fails
- [ ] Geocoding failures don't block event creation

---

### Task 4: Backfill Script for Existing Data

**Priority:** P2

Create a one-time script to geocode existing places and events that have addresses but no real coordinates.

**New File:** `/townhub/scripts/geocode-backfill.ts`

```typescript
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/google";

const TOWN_CENTER = { lat: 65.0752, lng: -22.7339 };

async function backfillPlaces() {
  // Find places at town center (placeholder) or without coords
  const places = await prisma.place.findMany({
    where: {
      address: { not: null },
      OR: [
        { lat: null },
        { lat: 65.074 }, // Approx town center - placeholder value
      ],
    },
  });

  console.log(`Found ${places.length} places to geocode`);

  for (const place of places) {
    if (!place.address) continue;

    const coords = await geocodeAddress(place.address);
    if (coords) {
      await prisma.place.update({
        where: { id: place.id },
        data: { lat: coords.lat, lng: coords.lng },
      });
      console.log(`✓ ${place.name}: ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`✗ ${place.name}: geocoding failed`);
    }

    // Rate limit: 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }
}

async function backfillEvents() {
  const events = await prisma.event.findMany({
    where: {
      location: { not: null },
      latitude: null,
    },
  });

  console.log(`Found ${events.length} events to geocode`);

  for (const event of events) {
    if (!event.location) continue;

    const coords = await geocodeAddress(event.location);
    if (coords) {
      await prisma.event.update({
        where: { id: event.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      });
      console.log(`✓ ${event.title}: ${coords.lat}, ${coords.lng}`);
    } else if (event.isTownEvent) {
      // Town events fallback to town center
      await prisma.event.update({
        where: { id: event.id },
        data: { latitude: TOWN_CENTER.lat, longitude: TOWN_CENTER.lng },
      });
      console.log(`~ ${event.title}: using town center (fallback)`);
    }

    await new Promise(r => setTimeout(r, 100));
  }
}

async function main() {
  console.log("Starting geocoding backfill...\n");
  await backfillPlaces();
  console.log("\n");
  await backfillEvents();
  console.log("\nBackfill complete!");
}

main().catch(console.error);
```

**To run:**
```bash
npx ts-node scripts/geocode-backfill.ts
```

**Acceptance Criteria:**
- [ ] Script identifies places/events needing geocoding
- [ ] Successfully geocodes addresses via Google API
- [ ] Rate limiting prevents API quota issues
- [ ] Progress is logged to console
- [ ] Town events without geocoding results get town center

---

## Environment Setup

Ensure `GOOGLE_MAPS_API_KEY` is set in `.env`:

```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

The mobile app already has the key configured in `app.json`.

---

## Testing Checklist

After implementation:

1. [ ] Create a new place with address in CMS → verify lat/lng are set
2. [ ] Create a new event with location → verify coordinates are set
3. [ ] Run backfill script → verify existing items get real coordinates
4. [ ] Open mobile map → verify markers are at correct locations
5. [ ] Verify no API quota issues (check Google Cloud Console)

---

## Files Summary

```
/townhub/
├── lib/google.ts                    # ✅ DONE - Geocoding utility
├── app/[locale]/admin/page.tsx      # TODO - Auto-geocode places
├── [event creation handler]         # TODO - Auto-geocode events
└── scripts/geocode-backfill.ts      # TODO - Backfill script
```
