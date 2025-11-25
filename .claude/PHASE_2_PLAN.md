# Interactive Map - Phase 2 Plan

**Date:** 2025-11-24
**Phase:** 2 of 3 (Development Build + Full Testing)
**Estimated Time:** 3-4 hours
**Prerequisites:** Phase 1 Complete ✅

---

## 🎯 PHASE 2 OBJECTIVES

### Primary Goals
1. **Create EAS Development Build** - Native map support
2. **Test Full Interactive Map** - On real Android device
3. **Add GPS Auto-Detection** - User location features
4. **Implement Hot Event Animations** - Visual polish
5. **Add Search Functionality** - Find places/events by name
6. **Performance Optimization** - Smooth 60fps experience

### Success Criteria
- ✅ App runs on physical Android device
- ✅ Native maps render correctly
- ✅ All markers display (places + events)
- ✅ Marker tap shows preview cards
- ✅ Filters work smoothly
- ✅ Hot events animate
- ✅ GPS detects user location
- ✅ Search finds places/events
- ✅ No crashes or lag

---

## 📋 PHASE 2 TASKS

### Task 1: EAS Development Build Setup (30-45 min)

#### 1.1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### 1.2: Login to Expo Account
```bash
eas login
# Or create account: https://expo.dev/signup
```

#### 1.3: Configure EAS Build
```bash
cd /Users/carlosmaia/townhub-mobile
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

#### 1.4: Build for Android
```bash
# This takes 15-20 minutes
eas build --platform android --profile development
```

**What Happens:**
1. Code uploaded to Expo servers
2. Native modules compiled (react-native-maps)
3. APK file generated
4. Download link provided

#### 1.5: Install on Device
```bash
# Option A: Download from Expo dashboard
# - Opens browser with download link
# - Download APK to phone
# - Install (allow unknown sources)

# Option B: Direct install
adb install path/to/downloaded.apk
```

**Acceptance Criteria:**
- ✅ EAS build succeeds (no errors)
- ✅ APK downloads successfully
- ✅ App installs on Android device
- ✅ App opens without crashing

**Time:** 30-45 minutes (mostly waiting for build)

---

### Task 2: Test Core Map Functionality (30 min)

#### 2.1: Test Navigation
- [ ] Open app on device
- [ ] Scroll to "🗺️ Interactive Map" card on home screen
- [ ] Verify: Card shows place/event counts
- [ ] Verify: "NEW" badge visible
- [ ] Tap card → Should navigate to Explore screen

#### 2.2: Test Explore Tab
- [ ] Tap "Explore" tab (2nd tab)
- [ ] Verify: Map renders with Stykkishólmur centered
- [ ] Verify: Blue dot shows user location (if permissions granted)
- [ ] Verify: Map is interactive (pinch to zoom, drag to pan)

#### 2.3: Test Markers
- [ ] Verify: Place markers visible (📍 emoji)
- [ ] Verify: Event markers visible (⭐ emoji)
- [ ] Tap a place marker
- [ ] Verify: Preview card slides up from bottom
- [ ] Verify: Card shows: image, name, type, rating
- [ ] Tap backdrop → Card closes

#### 2.4: Test Filters
- [ ] Tap "Restaurants" filter chip
- [ ] Verify: Only restaurant markers visible
- [ ] Tap "Events" filter
- [ ] Verify: Only event markers visible
- [ ] Tap "All" filter
- [ ] Verify: All markers visible again

**Acceptance Criteria:**
- ✅ All navigation works
- ✅ Map renders correctly
- ✅ Markers appear and respond to taps
- ✅ Preview cards display properly
- ✅ Filters update markers correctly

**Issues to Document:**
- Any crashes or errors
- Performance issues (lag, stuttering)
- UI bugs (layout, styling)
- Missing features

---

### Task 3: Add GPS Auto-Detection (45 min)

#### 3.1: Create GPS Hook
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useUserLocation.ts`

```typescript
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useUserLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
}
```

#### 3.2: Update InteractiveMap
```typescript
import { useUserLocation } from '../../hooks/useUserLocation';

export function InteractiveMap() {
  const { location } = useUserLocation();

  // Use location.latitude, location.longitude if available
  // Otherwise fall back to town center

  const initialRegion = {
    latitude: location?.latitude ?? data.town.latitude,
    longitude: location?.longitude ?? data.town.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <MapView
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    />
  );
}
```

**Acceptance Criteria:**
- ✅ App requests location permission on first launch
- ✅ If granted, map centers on user location
- ✅ If denied, map centers on town
- ✅ Blue dot shows user position

---

### Task 4: Add Hot Event Animations (30 min)

#### 4.1: Create Animated Marker
**File:** `/Users/carlosmaia/townhub-mobile/components/map/AnimatedMarker.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export function AnimatedMarker({ isHot }: { isHot?: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isHot) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isHot]);

  return (
    <Animated.View style={[styles.marker, { transform: [{ scale: pulse }] }]}>
      <Text style={styles.icon}>⭐</Text>
      {isHot && <Text style={styles.fire}>🔥</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  marker: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  icon: {
    fontSize: 20,
  },
  fire: {
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 16,
  },
});
```

#### 4.2: Use in InteractiveMap
```typescript
{filterEvents.map((event) => (
  <Marker
    key={`event-${event.id}`}
    coordinate={{ latitude: event.latitude, longitude: event.longitude }}
    onPress={() => onMarkerPress(event, 'event')}
  >
    <AnimatedMarker isHot={event.isHot} />
  </Marker>
))}
```

**Acceptance Criteria:**
- ✅ Hot events pulse subtly (1s loop)
- ✅ Fire emoji shows on hot events
- ✅ Animation is smooth (60fps)
- ✅ No lag with multiple animated markers

---

### Task 5: Add Search Functionality (45 min)

#### 5.1: Create Search Bar Component
**File:** `/Users/carlosmaia/townhub-mobile/components/map/MapSearch.tsx`

```typescript
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface Props {
  onSearch: (query: string) => void;
}

export function MapSearch({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleChange = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search places & events..."
        value={query}
        onChangeText={handleChange}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 11,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

#### 5.2: Add Search Logic
```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredPlaces = data.places.filter((place) => {
  const categoryMatch = selectedCategory === 'all' || place.type === selectedCategory;
  const searchMatch = !searchQuery ||
    place.name.toLowerCase().includes(searchQuery.toLowerCase());
  return categoryMatch && searchMatch;
});

const filteredEvents = data.events.filter((event) => {
  const categoryMatch = selectedCategory === 'events' || selectedCategory === 'all';
  const searchMatch = !searchQuery ||
    event.name.toLowerCase().includes(searchQuery.toLowerCase());
  return categoryMatch && searchMatch;
});
```

**Acceptance Criteria:**
- ✅ Search bar appears above filters
- ✅ Typing filters markers in real-time
- ✅ Case-insensitive search
- ✅ Searches both places and events
- ✅ Clear button to reset

---

### Task 6: Performance Optimization (30 min)

#### 6.1: Memoize Markers
```typescript
import { useMemo } from 'react';

const visibleMarkers = useMemo(() => {
  return {
    places: filteredPlaces,
    events: filteredEvents,
  };
}, [filteredPlaces, filteredEvents]);
```

#### 6.2: Throttle Updates
```typescript
import { useCallback } from 'react';
import debounce from 'lodash.debounce';

const debouncedSearch = useCallback(
  debounce((query: string) => setSearchQuery(query), 300),
  []
);
```

#### 6.3: Lazy Load Images
```typescript
<Image
  source={{ uri: item.imageUrl }}
  style={styles.image}
  resizeMode="cover"
  // Only load when needed
/>
```

**Acceptance Criteria:**
- ✅ Map is smooth with 50+ markers
- ✅ No lag when filtering/searching
- ✅ 60fps animations maintained
- ✅ Memory usage stable

---

## 🧪 TESTING CHECKLIST

### Functional Testing
- [ ] Navigation: Home card → Explore screen
- [ ] Navigation: Explore tab → Explore screen
- [ ] Map: Renders correctly
- [ ] Map: Centers on user location (if permission granted)
- [ ] Map: Centers on town (if permission denied)
- [ ] Markers: Places display correctly
- [ ] Markers: Events display correctly
- [ ] Markers: Hot events show fire icon
- [ ] Markers: Hot events animate
- [ ] Interaction: Tap marker shows preview
- [ ] Interaction: Tap backdrop closes preview
- [ ] Filters: Category filters work
- [ ] Filters: Date filters work (events)
- [ ] Search: Finds places by name
- [ ] Search: Finds events by name
- [ ] Search: Case-insensitive
- [ ] Search: Updates in real-time

### Performance Testing
- [ ] Map loads in < 2 seconds
- [ ] Animations are smooth (60fps)
- [ ] No lag with 50+ markers
- [ ] No memory leaks
- [ ] App doesn't crash

### UX Testing
- [ ] Touch targets are large enough (48px+)
- [ ] Gestures feel natural (pinch, drag, tap)
- [ ] Preview cards slide smoothly
- [ ] Filters respond immediately
- [ ] Search feels responsive
- [ ] No visual glitches

### Edge Case Testing
- [ ] No GPS: App works, uses town center
- [ ] No internet: Shows cached data or error
- [ ] No results: Shows empty state
- [ ] Many markers: Clusters or performs well
- [ ] Long names: Truncate properly
- [ ] Missing images: Show fallback

---

## 📊 SUCCESS METRICS

### Technical
- Map loads: < 2 seconds ✅
- Animations: 60fps ✅
- Crashes: 0 ✅
- Memory: Stable ✅

### User Experience
- Navigation: Intuitive ✅
- Interactions: Smooth ✅
- Visual: Polished ✅
- Performance: Fast ✅

---

## 🚀 ESTIMATED TIMELINE

| Task | Time | Type |
|------|------|------|
| EAS Build Setup | 30-45 min | Active + Waiting |
| Core Testing | 30 min | Testing |
| GPS Implementation | 45 min | Coding |
| Animations | 30 min | Coding |
| Search | 45 min | Coding |
| Performance | 30 min | Optimization |
| Final QA | 30 min | Testing |
| **Total** | **3-4 hours** | |

---

## 📝 DELIVERABLES

### Code
- [ ] EAS configuration (`eas.json`)
- [ ] GPS hook (`useUserLocation.ts`)
- [ ] Animated marker component
- [ ] Search bar component
- [ ] Performance optimizations

### Build
- [ ] Development APK file
- [ ] Installed on Android device
- [ ] Tested and verified

### Documentation
- [ ] Phase 2 test results
- [ ] Known issues list
- [ ] Performance benchmarks
- [ ] Screenshots/videos

---

## 🔮 PHASE 3 PREVIEW

After Phase 2 completes, Phase 3 will focus on:
- Directions integration (open native maps)
- Full details sheet (swipe up)
- Marker clustering (many markers)
- Offline support
- Final polish
- Production build

---

**Phase 2 Status:** 📋 PLANNED
**Ready to Start:** ✅ Yes
**Prerequisites:** Phase 1 Complete ✅
**Next Session:** Begin Task 1 (EAS Build)

---

**Created:** 2025-11-24
**By:** Architect Agent
**For:** TownHub Interactive Map Feature
