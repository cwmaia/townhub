# Engineer Task: Integrate MapMarker Component into InteractiveMap

**Priority:** P1 - High
**Status:** ✅ COMPLETED
**Completed:** December 1, 2025
**Depends On:** DESIGNER_TASK_MAP_ICONS.md ✅ COMPLETED

---

## ✅ All Steps Completed

1. **Designer icons delivered** - 12 SVG icons in `/townhub/public/branding/map-icons/`
2. **MapMarker component created** - `/townhub-mobile/components/map/MapMarker.tsx`
   - All SVG icons inlined for React Native compatibility
   - Hot event pulse animation implemented
   - Selected state spring animation implemented
   - Priority-based event state selection (hot > featured > town > soon > regular)
3. **InteractiveMap.tsx updated** - Emoji markers replaced with MapMarker component
   - Places use `placeType` prop for icon selection
   - Events use `isHot`, `isFeatured`, `isTownEvent`, `isHappeningSoon` flags
   - `isSelected` prop enables marker selection state
   - Cleaned up unused styles
4. **Backend verified** - Event flags already returned by API

---

## 📋 Next: QA Testing

See: `/Users/carlosmaia/townhub/.claude/tasks/QA_TASK_MAP_TESTING.md`

---

## Reference: Original Remaining Work (Now Complete)

### Task 1: Update InteractiveMap.tsx to Use MapMarker Component

**File:** `/Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx`

**Changes Required:**

1. Import the MapMarker component:
```typescript
import { MapMarker } from './MapMarker';
```

2. Replace place markers (lines 91-101):
```typescript
// BEFORE:
<Marker key={place.id} ...>
  <View style={styles.marker}>
    <Text style={styles.markerText}>📍</Text>
  </View>
</Marker>

// AFTER:
<Marker key={place.id} ...>
  <MapMarker
    type="place"
    placeType={place.type}
    isSelected={preview?.data?.id === place.id}
  />
</Marker>
```

3. Replace event markers (lines 102-112):
```typescript
// BEFORE:
<Marker key={`event-${event.id}`} ...>
  <View style={[styles.marker, styles.eventMarker]}>
    <Text style={styles.markerText}>⭐</Text>
  </View>
</Marker>

// AFTER:
<Marker key={`event-${event.id}`} ...>
  <MapMarker
    type="event"
    isHot={event.isHot}
    isFeatured={event.isFeatured}
    isTownEvent={event.isTownEvent}
    isHappeningSoon={event.isHappeningSoon}
    isSelected={preview?.data?.id === event.id}
  />
</Marker>
```

4. Remove unused styles:
   - `marker`
   - `eventMarker`
   - `markerText`

### Task 2: Verify Event Data Has Required Flags

Check that the event data from API includes these boolean fields:
- `isHot` - true if 20+ RSVPs
- `isFeatured` - true if premium/sponsored
- `isTownEvent` - true if official town event
- `isHappeningSoon` - true if within 48 hours

If not present, add logic to compute them in `useMapData` hook.

### Task 3: Test All Marker States

Verify visually on device/simulator:
- [ ] 4 place types display correct icons (LODGING, RESTAURANT, ATTRACTION, TOWN_SERVICE)
- [ ] 5 event states display correctly (regular, town, featured, hot, soon)
- [ ] Hot events have pulsing red glow animation
- [ ] Selected markers scale up with spring animation
- [ ] Markers are visible and distinguishable at different zoom levels

---

---

## Quick Start

```bash
# The MapMarker component is ready at:
# /Users/carlosmaia/townhub-mobile/components/map/MapMarker.tsx

# Edit InteractiveMap.tsx:
# /Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx
```

---

## Reference: Original Task Details

## Current State

**File:** `/Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx`

```typescript
// Lines 98-110 - Current placeholder implementation
<Marker
  key={place.id}
  coordinate={{ latitude: place.latitude, longitude: place.longitude }}
  title={place.name}
>
  <Text style={{ fontSize: 24 }}>📍</Text>  {/* Placeholder! */}
</Marker>
```

---

## Implementation

### 1. Create MapMarker Component

**New File:** `/Users/carlosmaia/townhub-mobile/components/map/MapMarker.tsx`

```typescript
import React from 'react';
import { View, Image, Animated } from 'react-native';
import { Marker } from 'react-native-maps';

interface MapMarkerProps {
  type: 'place' | 'event';
  subType: string; // LODGING, RESTAURANT, etc. or regular, town, featured, hot
  coordinate: { latitude: number; longitude: number };
  isHot?: boolean;
  isFeatured?: boolean;
  isHappeningSoon?: boolean;
  onPress: () => void;
}

// Icon mapping
const PLACE_ICONS = {
  LODGING: require('../../assets/map-icons/place-lodging.png'),
  RESTAURANT: require('../../assets/map-icons/place-restaurant.png'),
  ATTRACTION: require('../../assets/map-icons/place-attraction.png'),
  TOWN_SERVICE: require('../../assets/map-icons/place-service.png'),
};

const EVENT_ICONS = {
  regular: require('../../assets/map-icons/event-regular.png'),
  town: require('../../assets/map-icons/event-town.png'),
  featured: require('../../assets/map-icons/event-featured.png'),
  hot: require('../../assets/map-icons/event-hot.png'),
};
```

### 2. Hot Event Pulse Animation

```typescript
function HotEventMarker({ children }: { children: React.ReactNode }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View>
      {/* Pulsing glow behind marker */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          transform: [{ scale: pulseAnim }],
        }}
      />
      {children}
    </View>
  );
}
```

### 3. Featured Event Shimmer

Use same shimmer effect as premium business cards:

```typescript
function FeaturedEventMarker({ children }: { children: React.ReactNode }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Gold shimmer border effect
  return (
    <View style={styles.featuredContainer}>
      <LinearGradient
        colors={['#fbbf24', '#f59e0b', '#d97706']}
        style={styles.goldBorder}
      />
      {children}
    </View>
  );
}
```

### 4. Update InteractiveMap.tsx

Replace emoji markers with new component:

```typescript
// Places
{places.map((place) => (
  <MapMarker
    key={place.id}
    type="place"
    subType={place.type}
    coordinate={{ latitude: place.latitude, longitude: place.longitude }}
    onPress={() => setSelectedItem(place)}
  />
))}

// Events
{events.map((event) => (
  <MapMarker
    key={event.id}
    type="event"
    subType={event.isTownEvent ? 'town' : 'regular'}
    coordinate={{ latitude: event.latitude, longitude: event.longitude }}
    isHot={event.isHot}
    isFeatured={event.isFeatured}
    isHappeningSoon={event.isHappeningSoon}
    onPress={() => setSelectedItem(event)}
  />
))}
```

### 5. Add Marker Clustering (Optional Enhancement)

```bash
npm install react-native-map-clustering
```

```typescript
import MapView from 'react-native-map-clustering';

<MapView
  clusterColor="#3b82f6"
  clusterTextColor="#fff"
  clusterFontFamily="System"
  radius={50}
>
  {/* markers */}
</MapView>
```

---

## Files to Create/Modify

```
/Users/carlosmaia/townhub-mobile/
├── components/map/
│   ├── MapMarker.tsx           # NEW - Custom marker component
│   ├── HotEventMarker.tsx      # NEW - Pulsing animation wrapper
│   ├── FeaturedEventMarker.tsx # NEW - Shimmer animation wrapper
│   └── InteractiveMap.tsx      # MODIFY - Use new markers
├── assets/map-icons/           # NEW - Icon PNGs from designer
│   ├── place-lodging.png
│   ├── place-restaurant.png
│   ├── place-attraction.png
│   ├── place-service.png
│   ├── event-regular.png
│   ├── event-town.png
│   ├── event-featured.png
│   └── event-hot.png
└── package.json                # ADD react-native-map-clustering
```

---

## Acceptance Criteria

- [ ] Each place type has unique icon
- [ ] Each event type has unique icon
- [ ] Hot events pulse with red glow
- [ ] Featured events have gold shimmer
- [ ] Town events have official badge/style
- [ ] Happening soon events have green indicator
- [ ] Selected marker scales up
- [ ] Markers cluster when zoomed out
- [ ] Performance is smooth (60fps animations)
