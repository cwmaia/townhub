# Interactive Map - Mobile-First Architecture

**Priority:** P0 (Killer Feature)
**Status:** In Progress
**Timeline:** 8-10 hours
**Started:** 2025-11-24
**Mobile-First:** ✅ PRIMARY FOCUS

---

## 🎯 ARCHITECTURAL DECISIONS

### Decision 1: Navigation Structure
**Choice:** Add dedicated "Explore" tab (new 2nd tab position)

**Rationale:**
- Makes map the #1 discovery tool (prominent position)
- Full-screen experience (no competing content)
- Fast access (one tap from home)
- Maintains home dashboard for overview

**Tab Order:**
1. 🏠 Home - Overview dashboard
2. 🗺️ **Explore - Interactive Map** (NEW)
3. 🏙️ Places - Browse list
4. 📅 Events - Browse calendar
5. 🔔 Alerts - Notifications
6. 🙂 Profile - User settings

---

### Decision 2: Component Architecture

```
/townhub-mobile
├── app/(tabs)/
│   └── explore.tsx                    # New tab screen
├── components/map/
│   ├── InteractiveMap.tsx            # Main map container
│   ├── MarkerCluster.tsx             # Clustering wrapper
│   ├── MapMarker.tsx                 # Custom marker component
│   ├── MarkerPreview.tsx             # Bottom sheet preview
│   ├── MarkerDetails.tsx             # Full details sheet
│   ├── MapFilters.tsx                # Category filter chips
│   └── MapSearch.tsx                 # Search bar
├── hooks/
│   ├── useMapData.ts                 # Fetch places + events
│   ├── useUserLocation.ts            # GPS + permissions
│   └── useMapMarkers.ts              # Transform data to markers
└── types/
    └── map.ts                        # TypeScript interfaces
```

---

### Decision 3: Data Flow

**API Endpoint (Backend):**
```
GET /api/map/data?townId={id}&categories={cat1,cat2}

Response:
{
  places: [...],  // with lat/lng
  events: [...],  // with lat/lng, isHot, isHappeningSoon
  town: { name, lat, lng, latitudeDelta, longitudeDelta }
}
```

**State Management:**
- React Query for data fetching (already in use)
- Local state for filters, selected marker
- Zustand for GPS location (persistent)

---

### Decision 4: Mobile UX Pattern

**Interaction Flow:**
1. User opens "Explore" tab
2. Map loads centered on Stykkishólmur (or GPS location)
3. Markers render with clustering
4. User taps marker → Preview card slides up from bottom
5. User swipes up on preview → Full details sheet expands
6. User taps "Get Directions" → Opens native maps app

**Mobile-Specific:**
- Bottom sheet for preview (not popover)
- Drag-to-dismiss gestures
- Large touch targets (48x48px minimum)
- Filter chips scroll horizontally
- Search bar sticky at top

---

### Decision 5: Performance Strategy

**Critical for Mobile:**
1. **Viewport culling** - Only render markers in view
2. **Clustering** - Group nearby markers when zoomed out
3. **Image lazy loading** - Load marker images on demand
4. **Memoization** - Cache marker components
5. **Throttling** - Limit pan/zoom callbacks to 100ms
6. **Initial render** - Show 10 closest markers first, then load rest

**Target Metrics:**
- Map loads in < 2 seconds
- 60fps animations
- Smooth with 50+ markers

---

## 🏗️ PHASE 1: FOUNDATION (3-4 hours)

### Goal
Get interactive map working with real data, category filters, and preview cards.

### Engineer Tasks

#### Task 1.1: Create Map API Endpoint (CMS)
**File:** `/Users/carlosmaia/townhub/app/api/map/data/route.ts`

**Requirements:**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const townId = searchParams.get('townId');
  const categories = searchParams.get('categories')?.split(',') || [];

  // Fetch places with lat/lng
  const places = await prisma.place.findMany({
    where: {
      townId,
      latitude: { not: null },
      longitude: { not: null },
      type: categories.length > 0 ? { in: categories } : undefined,
    },
    select: {
      id: true,
      name: true,
      type: true,
      latitude: true,
      longitude: true,
      imageUrl: true,
      rating: true,
      ratingCount: true,
      tags: true,
    },
  });

  // Fetch events with computed fields
  const events = await prisma.event.findMany({
    where: {
      townId,
      latitude: { not: null },
      longitude: { not: null },
      startDate: { gte: new Date() }, // Only upcoming
    },
    select: {
      id: true,
      name: true,
      type: true,
      latitude: true,
      longitude: true,
      imageUrl: true,
      startDate: true,
      location: true,
      rsvpCount: true,
      isTownEvent: true,
      isFeatured: true,
    },
  });

  // Compute isHot and isHappeningSoon
  const enrichedEvents = events.map(event => ({
    ...event,
    isHot: event.rsvpCount >= 20,
    isHappeningSoon: isWithin48Hours(event.startDate),
  }));

  return Response.json({
    places,
    events: enrichedEvents,
    town: {
      name: 'Stykkishólmur',
      latitude: 65.0752,
      longitude: -22.7339,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    },
  });
}
```

**Acceptance:**
- ✅ Returns places with lat/lng
- ✅ Returns events with computed flags
- ✅ Filters by categories
- ✅ Only upcoming events

---

#### Task 1.2: Add Explore Tab
**Files:**
- `/Users/carlosmaia/townhub-mobile/app/(tabs)/explore.tsx` (new)
- `/Users/carlosmaia/townhub-mobile/app/(tabs)/_layout.tsx` (update)

**explore.tsx:**
```typescript
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InteractiveMap } from '@/components/map/InteractiveMap';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <InteractiveMap />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
});
```

**_layout.tsx update:**
```typescript
// Add after "index" tab, before "places"
<Tabs.Screen
  name="explore"
  options={{
    title: 'Explore',
    tabBarIcon: renderIcon('🗺️'),
  }}
/>
```

**Acceptance:**
- ✅ New tab appears 2nd in navigation
- ✅ Tapping opens explore screen
- ✅ Full-screen map container ready

---

#### Task 1.3: Create Map Data Hook
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useMapData.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface MapData {
  places: Array<{
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    rating?: number;
    ratingCount?: number;
    tags?: string[];
  }>;
  events: Array<{
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    startDate: string;
    location: string;
    rsvpCount: number;
    isTownEvent: boolean;
    isFeatured: boolean;
    isHot: boolean;
    isHappeningSoon: boolean;
  }>;
  town: {
    name: string;
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export function useMapData(townId: string, categories: string[] = []) {
  return useQuery({
    queryKey: ['map-data', townId, categories],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('townId', townId);
      if (categories.length > 0) {
        params.append('categories', categories.join(','));
      }

      const response = await axios.get<MapData>(
        `http://localhost:3000/api/map/data?${params.toString()}`
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}
```

**Acceptance:**
- ✅ Fetches map data from API
- ✅ Supports category filtering
- ✅ Returns typed data

---

#### Task 1.4: Create Interactive Map Component
**File:** `/Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx`

```typescript
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useMapData } from '@/hooks/useMapData';
import { MapFilters } from './MapFilters';
import { MarkerPreview } from './MarkerPreview';
import { LoadingView } from '../ui/LoadingView';

const INITIAL_REGION = {
  latitude: 65.0752,
  longitude: -22.7339,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function InteractiveMap() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const { data, isPending } = useMapData('stykkisholmur', selectedCategories);

  if (isPending || !data) {
    return <LoadingView />;
  }

  const allMarkers = [
    ...data.places.map(p => ({ ...p, markerType: 'place' as const })),
    ...data.events.map(e => ({ ...e, markerType: 'event' as const })),
  ];

  const selectedItem = selectedMarker
    ? allMarkers.find(m => m.id === selectedMarker)
    : null;

  return (
    <View style={styles.container}>
      <MapFilters
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />

      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {allMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.name}
            onPress={() => setSelectedMarker(marker.id)}
          />
        ))}
      </MapView>

      {selectedItem && (
        <MarkerPreview
          item={selectedItem}
          onClose={() => setSelectedMarker(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
```

**Acceptance:**
- ✅ Map renders centered on town
- ✅ Shows user location (blue dot)
- ✅ Markers for all places + events
- ✅ Tapping marker shows preview

---

#### Task 1.5: Create Filter Bar
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MapFilters.tsx`

```typescript
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { COLORS } from '@/utils/constants';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📍' },
  { id: 'RESTAURANT', label: 'Restaurants', icon: '🍽️' },
  { id: 'LODGING', label: 'Hotels', icon: '🛏️' },
  { id: 'ATTRACTION', label: 'Attractions', icon: '🏛️' },
  { id: 'SERVICE', label: 'Services', icon: '🏢' },
  { id: 'event', label: 'Events', icon: '📅' },
];

interface Props {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function MapFilters({ selected, onChange }: Props) {
  const toggleCategory = (id: string) => {
    if (id === 'all') {
      onChange([]);
    } else if (selected.includes(id)) {
      onChange(selected.filter(c => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.id === 'all'
          ? selected.length === 0
          : selected.includes(cat.id);

        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => toggleCategory(cat.id)}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  labelActive: {
    color: '#fff',
  },
});
```

**Acceptance:**
- ✅ Horizontal scrollable chips
- ✅ Category toggle works
- ✅ Active state styling
- ✅ Filters update markers

---

#### Task 1.6: Create Preview Card
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MarkerPreview.tsx`

```typescript
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '@/utils/constants';

interface Props {
  item: {
    id: string;
    name: string;
    type: string;
    imageUrl?: string;
    markerType: 'place' | 'event';
    // Place-specific
    rating?: number;
    tags?: string[];
    // Event-specific
    startDate?: string;
    location?: string;
    isHot?: boolean;
  };
  onClose: () => void;
}

export function MarkerPreview({ item, onClose }: Props) {
  const isPlace = item.markerType === 'place';

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.type}>
              {isPlace ? getPlaceIcon(item.type) : '📅'} {item.type}
            </Text>
            {item.isHot && (
              <View style={styles.hotBadge}>
                <Text style={styles.hotText}>🔥 HOT</Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          {isPlace && item.rating && (
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          )}

          {!isPlace && item.startDate && (
            <Text style={styles.date}>
              📅 {new Date(item.startDate).toLocaleDateString()}
            </Text>
          )}

          {!isPlace && item.location && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {item.location}
            </Text>
          )}
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

function getPlaceIcon(type: string): string {
  const icons: Record<string, string> = {
    RESTAURANT: '🍽️',
    LODGING: '🛏️',
    ATTRACTION: '🏛️',
    SERVICE: '🏢',
  };
  return icons[type] || '📍';
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 200, // Allow tapping to close
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#e2e8f0',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  hotBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  date: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.muted,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
```

**Acceptance:**
- ✅ Preview slides up from bottom
- ✅ Shows image, name, type
- ✅ Hot badge for hot events
- ✅ Rating for places, date for events
- ✅ "View Details" button
- ✅ Tap outside to close

---

### Phase 1 Completion Checklist
- [ ] Map API endpoint created and tested
- [ ] Explore tab added to navigation
- [ ] Map renders with real data
- [ ] Category filters work
- [ ] Marker tap shows preview card
- [ ] Preview card shows correct info
- [ ] Mobile tested (iOS/Android web)

**Time Estimate:** 3-4 hours
**Assigned To:** Engineer

---

## 🎨 PHASE 2: POLISH & FEATURES (2-3 hours)

### Goal
Add GPS, hot event animations, search, and performance optimizations.

### Engineer Tasks

#### Task 2.1: GPS Auto-Detection
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useUserLocation.ts`

```typescript
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useUserLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  return { location, error };
}
```

**Update InteractiveMap.tsx:**
- Use `useUserLocation()` hook
- If location detected, center map on user
- Animate to user location on mount

**Acceptance:**
- ✅ Requests GPS permission on mount
- ✅ Centers map on user location if granted
- ✅ Falls back to town center if denied

---

#### Task 2.2: Hot Event Animations
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MapMarker.tsx`

Create custom marker with animations:
- Hot events: pulsing glow effect
- Happening soon: clock badge
- Regular: static marker

Use `react-native-reanimated` for 60fps animations.

**Acceptance:**
- ✅ Hot markers pulse subtly
- ✅ Animations don't lag (60fps)
- ✅ Markers use category colors

---

#### Task 2.3: Search Functionality
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MapSearch.tsx`

Add search bar at top:
- Search by name, tags, location
- Auto-suggest results
- Tap result → Pan to marker + show preview

**Acceptance:**
- ✅ Search finds places/events
- ✅ Results highlight on map
- ✅ Selecting result opens preview

---

#### Task 2.4: Performance Optimization
**Updates to InteractiveMap.tsx:**

1. **Viewport Culling:**
   - Only render markers in visible region
   - Use `onRegionChangeComplete` to track viewport

2. **Memoization:**
   - Memoize marker components
   - Prevent re-renders on pan/zoom

3. **Throttling:**
   - Throttle region change callbacks to 100ms

**Acceptance:**
- ✅ Smooth with 50+ markers
- ✅ 60fps panning/zooming
- ✅ No lag on interactions

---

### Phase 2 Completion Checklist
- [ ] GPS detection works
- [ ] Hot events animate
- [ ] Search finds and highlights markers
- [ ] Performance optimized (60fps)
- [ ] Tested on real device (iOS/Android)

**Time Estimate:** 2-3 hours
**Assigned To:** Engineer

---

## 🚀 PHASE 3: LAUNCH POLISH (1-2 hours)

### Goal
Final UX polish, directions integration, QA testing.

### Tasks

#### Task 3.1: Directions Integration
Add "Get Directions" button to preview card:
- Opens Apple Maps (iOS) or Google Maps (Android)
- Passes coordinates and name

```typescript
import { Linking, Platform } from 'react-native';

function openDirections(lat: number, lng: number, name: string) {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });
  const url = Platform.select({
    ios: `${scheme}?q=${name}&ll=${lat},${lng}`,
    android: `${scheme}${lat},${lng}?q=${name}`,
  });
  Linking.openURL(url!);
}
```

**Acceptance:**
- ✅ Opens native maps app
- ✅ Shows correct location

---

#### Task 3.2: Full Details Sheet
Extend preview card:
- Swipe up → Expands to full details
- Shows all photos, description, hours, etc.
- RSVP button for events
- Save/favorite button

**Acceptance:**
- ✅ Swipe gesture works smoothly
- ✅ Full details render correctly
- ✅ Action buttons functional

---

#### Task 3.3: QA Testing
**QA Agent tests:**
- [ ] GPS permission flow
- [ ] All categories filter correctly
- [ ] Search finds all results
- [ ] Hot events animate
- [ ] Preview cards show correct data
- [ ] Directions open native app
- [ ] Performance: 60fps with 50+ markers
- [ ] iOS: Test on simulator
- [ ] Android: Test on web
- [ ] Edge cases: No GPS, no internet, no results

---

### Phase 3 Completion Checklist
- [ ] Directions integration works
- [ ] Full details sheet implemented
- [ ] QA testing complete
- [ ] No critical bugs
- [ ] Ready for user demo

**Time Estimate:** 1-2 hours
**Assigned To:** Engineer + QA

---

## 📊 SUCCESS METRICS

### Technical
- ✅ Map loads in < 2 seconds
- ✅ 60fps animations
- ✅ Works with 50+ markers
- ✅ GPS detection reliable
- ✅ No memory leaks

### User Experience
- ✅ Intuitive (no tutorial needed)
- ✅ Hot events visually prominent
- ✅ Fast filtering and search
- ✅ Smooth gestures
- ✅ Large touch targets (48px+)

### Business
- ✅ Increases place/event discovery
- ✅ Premium markers stand out
- ✅ Drives navigation to businesses

---

## 🚨 RISKS & MITIGATION

### Risk 1: GPS Not Available
**Mitigation:**
- Fallback to town center
- Show friendly message
- Remember last location

### Risk 2: Performance with Many Markers
**Mitigation:**
- Viewport culling (render only visible)
- Clustering (group nearby markers)
- Lazy load images

### Risk 3: Complex Animations Lag
**Mitigation:**
- Use native driver for animations
- Simplify on low-end devices
- Feature detection

---

## 📦 DELIVERABLES

### Backend (CMS)
- [ ] `/api/map/data` endpoint
- [ ] Database: Add lat/lng to places/events

### Mobile
- [ ] Explore tab in navigation
- [ ] InteractiveMap component
- [ ] Custom marker components
- [ ] Filter bar
- [ ] Preview card
- [ ] Search bar
- [ ] GPS hook
- [ ] Directions integration

### QA
- [ ] Test report
- [ ] Performance benchmarks
- [ ] Edge case testing

---

## 🎯 NEXT STEPS TO START

1. **Engineer:** Create map API endpoint (Task 1.1)
2. **Engineer:** Add Explore tab (Task 1.2)
3. **Engineer:** Create map data hook (Task 1.3)
4. **Engineer:** Build InteractiveMap component (Task 1.4)
5. **Architect:** Review Phase 1 completion
6. **Engineer:** Continue to Phase 2
7. **QA:** Test Phase 3

---

**This is our killer feature. Mobile-first. Step-by-step. Let's build it right. 🚀**
