# Engineer Task: Rebuild Interactive Map (Booking.com Style)

**Priority:** P0 - CRITICAL (Killer Feature)
**Status:** 🔴 TODO
**Time Estimate:** Full day sprint
**Reference:** Booking.com app map experience

---

## Context

The current map implementation has issues:
- Custom PNG markers not displaying
- Filters overflow off screen
- UX doesn't match modern travel app standards

We need to rebuild this to match Booking.com's proven map UX patterns.

---

## Part 1: Fix Marker Display (URGENT)

### Problem
Custom markers using `<Image>` inside `<Marker>` children aren't rendering on Android.

### Solution Options

**Option A: Use Marker's `image` prop directly**
```typescript
<Marker
  coordinate={{ latitude, longitude }}
  image={require('../../assets/map-icons/place-lodging.png')}
  onPress={() => onMarkerPress(place, 'place')}
/>
```

**Option B: Use Callout instead of custom children**
```typescript
<Marker coordinate={{ latitude, longitude }}>
  <Callout>
    <View style={styles.callout}>
      <Text>{place.name}</Text>
    </View>
  </Callout>
</Marker>
```

**Option C: Price bubble markers (Booking.com style)**
Instead of pin icons, show price/rating bubbles:
```typescript
<Marker coordinate={{ latitude, longitude }}>
  <View style={styles.priceBubble}>
    <Text style={styles.priceText}>$120</Text>
  </View>
</Marker>
```

### Implementation
File: `/townhub-mobile/components/map/InteractiveMap.tsx`

```typescript
// Booking.com style: Show price/rating bubbles on map
const PlaceMarker = ({ place, isSelected, onPress }) => (
  <Marker
    coordinate={{ latitude: place.latitude, longitude: place.longitude }}
    onPress={onPress}
  >
    <View style={[
      styles.markerBubble,
      isSelected && styles.markerBubbleSelected,
      place.type === 'RESTAURANT' && styles.markerRestaurant,
      place.type === 'LODGING' && styles.markerLodging,
    ]}>
      <Text style={styles.markerText}>
        {place.rating ? `★${place.rating.toFixed(1)}` : place.type.charAt(0)}
      </Text>
    </View>
  </Marker>
);

const styles = StyleSheet.create({
  markerBubble: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#003580',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerBubbleSelected: {
    backgroundColor: '#003580',
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#003580',
  },
  // Color coding by type
  markerRestaurant: { borderColor: '#f97316' },
  markerLodging: { borderColor: '#3b82f6' },
});
```

---

## Part 2: Bottom Sheet Results List (Booking.com Style)

### Current Problem
No list view - only map markers and preview card.

### Booking.com Pattern
- Draggable bottom sheet with scrollable results
- Shows list of places/events matching current map view
- Swipe up for full list, down to minimize
- Cards show: image, name, rating, price, distance

### Implementation

**Install dependency:**
```bash
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

**New Component:** `/townhub-mobile/components/map/MapBottomSheet.tsx`

```typescript
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

export function MapBottomSheet({ places, events, onItemPress }) {
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const items = [...places, ...events].sort((a, b) =>
    (b.rating || 0) - (a.rating || 0)
  );

  return (
    <BottomSheet snapPoints={snapPoints} index={0}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{items.length} results</Text>
      </View>
      <BottomSheetFlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResultCard item={item} onPress={() => onItemPress(item)} />
        )}
      />
    </BottomSheet>
  );
}

function ResultCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardType}>{item.type}</Text>
        {item.rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
```

---

## Part 3: Filter Modal (Booking.com Style)

### Current Problem
Horizontal scroll chips that overflow - not scalable.

### Booking.com Pattern
- Single "Filters" button that opens full-screen modal
- Categories organized vertically
- Checkboxes and toggles for options
- "Apply" button at bottom
- Shows active filter count on button

### Implementation

**New Component:** `/townhub-mobile/components/map/FilterModal.tsx`

```typescript
export function FilterModal({ visible, onClose, filters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={() => setLocalFilters({})}>
            <Text>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type</Text>
            {CATEGORIES.map(cat => (
              <FilterCheckbox
                key={cat.value}
                label={cat.label}
                checked={localFilters.categories?.includes(cat.value)}
                onToggle={() => toggleCategory(cat.value)}
              />
            ))}
          </View>

          {/* Date Section (for events) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When</Text>
            <FilterOption label="Today" />
            <FilterOption label="This week" />
            <FilterOption label="This month" />
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <FilterSlider min={0} max={5} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => onApply(localFilters)}
          >
            <Text style={styles.applyText}>Show results</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
```

**Update InteractiveMap header:**
```typescript
<View style={styles.topBar}>
  <TouchableOpacity
    style={styles.filterButton}
    onPress={() => setFilterModalVisible(true)}
  >
    <FilterIcon />
    <Text>Filters</Text>
    {activeFilterCount > 0 && (
      <View style={styles.filterBadge}>
        <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
      </View>
    )}
  </TouchableOpacity>

  <TouchableOpacity style={styles.sortButton}>
    <Text>Sort by</Text>
  </TouchableOpacity>
</View>
```

---

## Part 4: Map Interaction Improvements

### Booking.com Patterns to Implement

1. **Marker clustering** when zoomed out
```bash
npm install react-native-map-clustering
```

2. **Search this area** button when user pans map
```typescript
const [showSearchArea, setShowSearchArea] = useState(false);

<MapView
  onRegionChangeComplete={(region) => {
    if (regionChanged(region)) {
      setShowSearchArea(true);
    }
  }}
>

{showSearchArea && (
  <TouchableOpacity style={styles.searchAreaButton}>
    <Text>Search this area</Text>
  </TouchableOpacity>
)}
```

3. **Current location button**
```typescript
<TouchableOpacity
  style={styles.locationButton}
  onPress={goToCurrentLocation}
>
  <LocationIcon />
</TouchableOpacity>
```

4. **Marker highlight on list hover/scroll**
When scrolling the bottom sheet list, highlight corresponding marker on map.

---

## Files to Create/Modify

```
/townhub-mobile/components/map/
├── InteractiveMap.tsx      # MAJOR REWRITE
├── MapMarker.tsx           # REWRITE - bubble style
├── MapBottomSheet.tsx      # NEW - results list
├── FilterModal.tsx         # NEW - full filter UI
├── ResultCard.tsx          # NEW - list item card
├── MapControls.tsx         # NEW - location/zoom buttons
└── SearchAreaButton.tsx    # NEW - search this area
```

---

## Dependencies to Install

```bash
npx expo install @gorhom/bottom-sheet
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler
npm install react-native-map-clustering
```

---

## Acceptance Criteria

- [ ] Markers display correctly on Android and iOS
- [ ] Bottom sheet shows scrollable results list
- [ ] Filter modal with organized categories
- [ ] Marker clustering when zoomed out
- [ ] "Search this area" when panning
- [ ] Current location button
- [ ] Smooth 60fps interactions
- [ ] Matches Booking.com UX patterns

---

## Reference

- [Booking.com Map UX Research](https://www.researchgate.net/figure/Walkthrough-of-the-Bookingcom-Mobile-Map-Design_fig3_325559306)
- [Booking.com UX Benchmark - Baymard](https://baymard.com/ux-benchmark/case-studies/booking-com)
