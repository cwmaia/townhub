# Engineer Task: Implement Google Maps Geocoding for Map Locations

**Priority:** P0 - Critical (Killer Feature)
**Status:** 🔴 TODO
**Depends On:** Google Maps API Key (already configured in app.json)

---

## Context

The Interactive Map currently uses:
- **Places:** Coordinates from database (`lat`/`lng` fields) - mostly set to town center
- **Events:** Deterministic coordinates based on event ID hash (not real locations)

We need real, accurate locations for all markers based on their addresses using Google Maps Geocoding API.

---

## Current State

### Places
File: `/townhub/app/api/map/data/route.ts`
```typescript
// Places have lat/lng from DB, but many are set to town center (65.074, -22.73)
const places = await prisma.place.findMany({
  where: { townId, lat: { not: null }, lng: { not: null } },
  // ...
});
```

### Events
```typescript
// Events use fake deterministic coordinates
function getEventCoordinates(event: { id: string; isTownEvent: boolean }) {
  // Returns hash-based coordinates around town center
}
```

---

## Implementation Tasks

### Task 1: Create Geocoding Utility

**New File:** `/townhub/lib/geocoding.ts`

```typescript
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: data.results[0].formatted_address,
    };
  }
  return null;
}

// Batch geocoding with rate limiting
export async function geocodeAddresses(addresses: string[]): Promise<Map<string, GeocodingResult>> {
  const results = new Map();
  for (const address of addresses) {
    const result = await geocodeAddress(address);
    if (result) results.set(address, result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
  }
  return results;
}
```

### Task 2: Add Geocoding to Place/Event Creation

When a place or event is created/updated in the CMS, automatically geocode the address:

**File:** `/townhub/app/api/places/route.ts` (or wherever places are created)

```typescript
import { geocodeAddress } from '@/lib/geocoding';

// On create/update:
if (data.address && (!data.lat || !data.lng)) {
  const coords = await geocodeAddress(data.address);
  if (coords) {
    data.lat = coords.lat;
    data.lng = coords.lng;
  }
}
```

### Task 3: Backfill Existing Data

Create a one-time script to geocode existing places/events:

**New File:** `/townhub/scripts/geocode-existing.ts`

```typescript
import { prisma } from '@/lib/db';
import { geocodeAddress } from '@/lib/geocoding';

async function backfillCoordinates() {
  // Get places without real coordinates (at town center)
  const places = await prisma.place.findMany({
    where: {
      OR: [
        { lat: 65.074, lng: -22.73 }, // Town center placeholder
        { lat: null },
      ],
    },
  });

  for (const place of places) {
    if (place.address) {
      const coords = await geocodeAddress(place.address);
      if (coords) {
        await prisma.place.update({
          where: { id: place.id },
          data: { lat: coords.lat, lng: coords.lng },
        });
        console.log(`Updated ${place.name}: ${coords.lat}, ${coords.lng}`);
      }
    }
    await new Promise(r => setTimeout(r, 200)); // Rate limit
  }

  // Same for events with location field
  const events = await prisma.event.findMany({
    where: { location: { not: null } },
  });

  // ... similar logic
}

backfillCoordinates();
```

### Task 4: Update Event Location Storage

Add `lat`/`lng` columns to Event model if not present:

**File:** `/townhub/database/schema.prisma`

```prisma
model Event {
  // ... existing fields
  lat       Float?
  lng       Float?
  // ...
}
```

Then update the map API to use event coordinates:

```typescript
// In /api/map/data/route.ts
const enrichedEvents = events.map((event) => ({
  // ...
  latitude: event.lat ?? getEventCoordinates(event).latitude,
  longitude: event.lng ?? getEventCoordinates(event).longitude,
  // ...
}));
```

---

## Environment Setup

Add to `.env`:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

The mobile app already has the key in `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "AIzaSyA3MSCsqQr282qPM52kjTCiHp8VQT91XNQ"
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Places show at their real addresses on the map
- [ ] Events show at their venue locations
- [ ] New places/events are auto-geocoded on creation
- [ ] Existing data is backfilled with real coordinates
- [ ] Geocoding errors are handled gracefully (fallback to town center)
- [ ] Rate limiting prevents API quota issues

---

## Files to Create/Modify

```
/townhub/
├── lib/
│   └── geocoding.ts              # NEW - Geocoding utility
├── scripts/
│   └── geocode-existing.ts       # NEW - Backfill script
├── database/
│   └── schema.prisma             # MODIFY - Add lat/lng to Event
├── app/api/
│   ├── places/route.ts           # MODIFY - Auto-geocode on create
│   ├── events/route.ts           # MODIFY - Auto-geocode on create
│   └── map/data/route.ts         # MODIFY - Use real event coords
└── .env                          # MODIFY - Add API key
```

---

## Testing

1. Create a new place with address in CMS → verify coordinates are set
2. Create a new event with location → verify coordinates are set
3. Run backfill script → verify existing items get real coordinates
4. Open map → verify markers are at correct locations (not all clustered at town center)
