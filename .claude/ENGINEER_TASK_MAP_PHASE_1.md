# Engineer Task: Interactive Map - Phase 1

**Priority:** P0
**Phase:** 1 of 3 (Foundation)
**Time Estimate:** 3-4 hours
**Started:** 2025-11-24
**Focus:** Mobile-first experience

---

## 🎯 YOUR MISSION

Build the foundation of the interactive map feature:
1. Create backend API endpoint for map data
2. Add "Explore" tab to mobile navigation
3. Build interactive map component with real data
4. Implement category filters
5. Add marker tap with preview cards

**Critical:** This must work perfectly on mobile. Test frequently on web view.

---

## 📋 TASK CHECKLIST

### Task 1: Create Map API Endpoint (45 min)
**File:** `/Users/carlosmaia/townhub/app/api/map/data/route.ts` (create new)

**Requirements:**
- [ ] Create new API route
- [ ] Fetch places with lat/lng from database
- [ ] Fetch upcoming events with lat/lng
- [ ] Compute `isHot` (rsvpCount >= 20)
- [ ] Compute `isHappeningSoon` (within 48 hours)
- [ ] Support category filtering via query params
- [ ] Return town center coordinates

**Implementation:**

```typescript
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours >= 0 && hours <= 48;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const townId = searchParams.get('townId') || 'stykkisholmur';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    // Fetch places with coordinates
    const places = await prisma.place.findMany({
      where: {
        townId,
        latitude: { not: null },
        longitude: { not: null },
        ...(categories.length > 0 && { type: { in: categories } }),
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
      take: 100, // Limit for performance
    });

    // Fetch upcoming events with coordinates
    const events = await prisma.event.findMany({
      where: {
        townId,
        latitude: { not: null },
        longitude: { not: null },
        startDate: { gte: new Date() },
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
      take: 50, // Limit for performance
    });

    // Enrich events with computed fields
    const enrichedEvents = events.map((event) => ({
      ...event,
      isHot: event.rsvpCount >= 20,
      isHappeningSoon: isWithin48Hours(new Date(event.startDate)),
    }));

    // Town center (Stykkishólmur, Iceland)
    const town = {
      name: 'Stykkishólmur',
      latitude: 65.0752,
      longitude: -22.7339,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    return Response.json({
      places,
      events: enrichedEvents,
      town,
    });
  } catch (error) {
    console.error('Map data error:', error);
    return Response.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
```

**Test:**
```bash
curl "http://localhost:3000/api/map/data?townId=stykkisholmur"
```

**Expected Response:**
```json
{
  "places": [...],
  "events": [...],
  "town": { ... }
}
```

**Acceptance Criteria:**
- ✅ Endpoint returns places with lat/lng
- ✅ Endpoint returns events with isHot/isHappeningSoon
- ✅ Category filtering works
- ✅ Returns valid JSON

---

### Task 2: Add Explore Tab (30 min)

#### 2.1: Create Explore Screen
**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/explore.tsx` (create new)

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

#### 2.2: Update Tab Navigation
**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/_layout.tsx` (update)

Add after "index" tab:

```typescript
<Tabs.Screen
  name="explore"
  options={{
    title: 'Explore',
    tabBarIcon: renderIcon('🗺️'),
  }}
/>
```

**Acceptance Criteria:**
- ✅ "Explore" tab appears 2nd in navigation
- ✅ Tapping tab shows explore screen
- ✅ Tab icon shows correctly

---

### Task 3: Create Map Data Hook (30 min)
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useMapData.ts` (create new)

```typescript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Place {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
}

interface Event {
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
}

interface MapData {
  places: Place[];
  events: Event[];
  town: {
    name: string;
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export function useMapData(townId: string = 'stykkisholmur', categories: string[] = []) {
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
    staleTime: 60000, // Cache for 1 minute
    retry: 2,
  });
}
```

**Acceptance Criteria:**
- ✅ Hook fetches data from API
- ✅ Returns typed data
- ✅ Supports category filtering
- ✅ Caches results

---

### Task 4: Create Map Filters Component (30 min)
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MapFilters.tsx` (create new)

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
      onChange(selected.filter((c) => c !== id));
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
        const isActive = cat.id === 'all' ? selected.length === 0 : selected.includes(cat.id);

        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => toggleCategory(cat.id)}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{cat.label}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    minHeight: 48, // Accessibility: large touch target
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

**Acceptance Criteria:**
- ✅ Horizontal scrollable chips
- ✅ Toggle categories on/off
- ✅ Active state styling
- ✅ Large touch targets (48px)

---

### Task 5: Create Preview Card Component (45 min)
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MarkerPreview.tsx` (create new)

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
    isHappeningSoon?: boolean;
  };
  onClose: () => void;
}

export function MarkerPreview({ item, onClose }: Props) {
  const isPlace = item.markerType === 'place';

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}

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
            {item.isHappeningSoon && (
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>⏰ Soon</Text>
              </View>
            )}
          </View>

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          {isPlace && item.rating ? (
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
          ) : null}

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

          {isPlace && item.tags && item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.slice(0, 3).map((tag, i) => (
                <Text key={i} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>View Details →</Text>
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
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '70%',
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
    flexWrap: 'wrap',
    gap: 8,
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
  soonBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e40af',
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 56, // Large touch target
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
```

**Acceptance Criteria:**
- ✅ Slides up from bottom on marker tap
- ✅ Shows image, name, type, badges
- ✅ Hot/Soon badges display correctly
- ✅ Tap backdrop to close
- ✅ "View Details" button (functional in Phase 2)

---

### Task 6: Create Interactive Map Component (60 min)
**File:** `/Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx` (create new)

**Create directory first:**
```bash
mkdir -p /Users/carlosmaia/townhub-mobile/components/map
```

**Implementation:**

```typescript
import { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useMapData } from '@/hooks/useMapData';
import { MapFilters } from './MapFilters';
import { MarkerPreview } from './MarkerPreview';
import { COLORS } from '@/utils/constants';

const INITIAL_REGION: Region = {
  latitude: 65.0752,
  longitude: -22.7339,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type MarkerItem = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  markerType: 'place' | 'event';
  // Place fields
  rating?: number;
  tags?: string[];
  // Event fields
  startDate?: string;
  location?: string;
  isHot?: boolean;
  isHappeningSoon?: boolean;
};

export function InteractiveMap() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const { data, isPending, isError } = useMapData('stykkisholmur', selectedCategories);

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load map data</Text>
        <Text style={styles.errorSubtext}>Check your connection and try again</Text>
      </View>
    );
  }

  // Combine places and events into markers
  const allMarkers: MarkerItem[] = [
    ...data.places.map((p) => ({
      ...p,
      markerType: 'place' as const,
    })),
    ...data.events.map((e) => ({
      ...e,
      markerType: 'event' as const,
    })),
  ];

  const selectedItem = selectedMarker ? allMarkers.find((m) => m.id === selectedMarker) : null;

  return (
    <View style={styles.container}>
      <MapFilters selected={selectedCategories} onChange={setSelectedCategories} />

      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
      >
        {allMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.name}
            description={marker.type}
            onPress={() => setSelectedMarker(marker.id)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerIcon}>
                {marker.markerType === 'place' ? getPlaceIcon(marker.type) : '📅'}
              </Text>
              {marker.isHot && <Text style={styles.hotIcon}>🔥</Text>}
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedItem && <MarkerPreview item={selectedItem} onClose={() => setSelectedMarker(null)} />}
    </View>
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.muted,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    fontSize: 32,
  },
  hotIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 20,
  },
});
```

**Acceptance Criteria:**
- ✅ Map renders centered on Stykkishólmur
- ✅ Shows user location (blue dot)
- ✅ Renders markers for places and events
- ✅ Tapping marker shows preview card
- ✅ Category filters update markers
- ✅ Hot events show fire icon
- ✅ Loading and error states work

---

## 🧪 TESTING CHECKLIST

### Manual Testing (Web)
```bash
cd /Users/carlosmaia/townhub-mobile
npx expo start --web --port 19006 --clear
```

Open: http://localhost:19006

**Test:**
- [ ] Navigate to "Explore" tab (2nd position)
- [ ] Map loads centered on town
- [ ] Markers appear for places and events
- [ ] Tap a place marker → Preview card shows
- [ ] Preview shows: image, name, type, rating
- [ ] Tap backdrop → Preview closes
- [ ] Tap event marker → Preview shows
- [ ] Preview shows: image, name, date, location, badges
- [ ] Filter by "Restaurants" → Only restaurant markers show
- [ ] Filter by "Events" → Only event markers show
- [ ] Clear filters → All markers show
- [ ] Hot events have fire icon
- [ ] No console errors

### API Testing
```bash
# Test map endpoint
curl "http://localhost:3000/api/map/data?townId=stykkisholmur"

# Should return:
# - places array with lat/lng
# - events array with isHot/isHappeningSoon
# - town object with coordinates
```

---

## 📸 SCREENSHOT PROOF

After completing Phase 1, take screenshots:
1. Explore tab in navigation
2. Map with multiple markers
3. Tapped marker with preview card open
4. Filter bar with active category
5. Hot event with fire icon

Save to: `/Users/carlosmaia/townhub/.claude/screenshots/map_phase1_*.png`

---

## ✅ COMPLETION CRITERIA

You can mark Phase 1 complete when:
- [ ] Map API endpoint works and returns valid data
- [ ] Explore tab exists in mobile navigation
- [ ] Map renders with real places and events
- [ ] Category filters work correctly
- [ ] Marker tap shows preview card with correct data
- [ ] Preview card has hot/soon badges
- [ ] No console errors
- [ ] Tested on web (http://localhost:19006)
- [ ] All code properly typed (TypeScript)
- [ ] Components are in correct directories

---

## 🚀 NEXT STEPS

After Phase 1 is complete:
1. **Report back to Architect:** "Phase 1 complete, ready for review"
2. **Architect will review** and test the implementation
3. **If approved:** Move to Phase 2 (GPS, animations, search)
4. **If issues:** Fix them before proceeding

---

## 💡 TIPS

**Performance:**
- Keep markers simple for now (emojis are fine)
- We'll optimize in Phase 2

**Mobile Testing:**
- If you have iOS Simulator, test there too
- Check touch targets are large enough (48px minimum)
- Ensure gestures feel natural

**Code Quality:**
- Use TypeScript types for everything
- Keep components small and focused
- Add error boundaries if needed

**Debugging:**
- Use React DevTools to inspect state
- Console.log marker counts to verify filtering
- Check Network tab for API calls

---

**Let's build this! Focus on mobile-first experience. 🚀**
