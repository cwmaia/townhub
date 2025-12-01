# Map UI - Quick Implementation Guide

**Last Updated:** December 1, 2025

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @gorhom/bottom-sheet react-native-reanimated react-native-maps
```

### 2. Component Checklist

**Core Components:**
- [ ] `MarkerBubble.tsx` - Price/rating bubbles
- [ ] `BottomSheetResults.tsx` - Draggable results list
- [ ] `ResultCard.tsx` - Individual result card
- [ ] `FilterModal.tsx` - Full-screen filter
- [ ] `MapTopBar.tsx` - Filter and sort buttons
- [ ] `MapControls.tsx` - Zoom and location buttons
- [ ] `SelectedItemPreview.tsx` - Detailed preview card
- [ ] `EmptyState.tsx` - No results view
- [ ] `LoadingSkeleton.tsx` - Loading placeholder

---

## 📋 Component Import Reference

```typescript
// MarkerBubble - Booking.com style price/rating bubbles
import { MarkerBubble } from '@/components/map/MarkerBubble';

<Marker coordinate={place.location}>
  <MarkerBubble
    type="lodging"  // lodging | restaurant | attraction | event
    content="$120/nt"  // Price, rating, or date
    isSelected={isSelected}
  />
</Marker>

// BottomSheet - Draggable results list
import { BottomSheetResults } from '@/components/map/BottomSheetResults';

<BottomSheetResults
  results={places}
  sortBy="rating"  // rating | distance | price | best
  onSortChange={setSortBy}
/>

// ResultCard - Individual result in list
import { ResultCard } from '@/components/map/ResultCard';

<ResultCard
  item={place}
  onPress={() => navigate('Details', { id: place.id })}
  onSavePress={() => toggleSave(place.id)}
  isSaved={savedItems.includes(place.id)}
/>

// FilterModal - Full-screen filter
import { FilterModal } from '@/components/map/FilterModal';

<FilterModal
  visible={showFilters}
  onClose={() => setShowFilters(false)}
  onApply={(filters) => {
    setFilters(filters);
    fetchResults(filters);
  }}
  initialFilters={filters}
/>

// MapTopBar - Filter and sort buttons
import { MapTopBar } from '@/components/map/MapTopBar';

<MapTopBar
  activeFilterCount={3}
  sortBy="Rating"
  onFilterPress={() => setShowFilters(true)}
  onSortPress={() => setShowSortMenu(true)}
/>

// MapControls - Zoom and location controls
import { MapControls } from '@/components/map/MapControls';

<MapControls
  onCurrentLocation={() => centerOnUser()}
  onZoomIn={() => mapRef.current?.zoomIn()}
  onZoomOut={() => mapRef.current?.zoomOut()}
/>

// SelectedItemPreview - Large preview card
import { SelectedItemPreview } from '@/components/map/SelectedItemPreview';

<SelectedItemPreview
  item={selectedPlace}
  onDirections={() => openDirections(selectedPlace)}
  onSave={() => toggleSave(selectedPlace.id)}
  onViewDetails={() => navigate('Details', { id: selectedPlace.id })}
  onClose={() => setSelectedPlace(null)}
  isSaved={savedItems.includes(selectedPlace.id)}
/>

// EmptyState - No results
import { EmptyState } from '@/components/map/EmptyState';

<EmptyState
  title="No places found nearby"
  description="Try adjusting your filters or search a different area"
  actionLabel="Clear filters"
  onAction={() => setFilters({})}
  icon="🗺️"
/>

// LoadingSkeleton - Loading state
import { LoadingSkeleton } from '@/components/map/LoadingSkeleton';

{isLoading ? <LoadingSkeleton /> : <ResultsList />}
```

---

## 🎨 Color Quick Reference

```typescript
const colors = {
  // Type colors
  lodging: '#3b82f6',
  restaurant: '#f97316',
  attraction: '#8b5cf6',
  event: '#ef4444',

  // UI
  primary: '#003580',
  success: '#22c55e',
  warning: '#fbbf24',

  // Text
  text: '#0f172a',
  textSecondary: '#475467',
  textMuted: '#94a3b8',

  // Background
  white: '#ffffff',
  background: '#f1f5f9',
  border: '#e2e8f0',
};
```

---

## 📏 Spacing Quick Reference

```typescript
const spacing = {
  xs: 4,   // Tight spacing
  sm: 8,   // Small gap
  md: 12,  // Default gap
  lg: 16,  // Card padding
  xl: 24,  // Section spacing
  xxl: 32, // Large spacing
};
```

---

## 🎯 Touch Targets

**Minimum sizes:**
- Buttons: 44x44px
- Filter chips: 40px height
- Markers: 48px minimum width

---

## 🎬 Animation Reference

```typescript
// Spring animation (default)
const springConfig = {
  damping: 20,
  stiffness: 150,
};

// Timing animation (simple)
const timingConfig = {
  duration: 300,
  easing: Easing.inOut(Easing.ease),
};

// Marker selection
scale: withSpring(1.1, springConfig)

// Bottom sheet
snapPoints: ['15%', '50%', '90%']

// Preview card slide-up
translateY: withSpring(0, springConfig)
```

---

## 🔍 State Management

```typescript
// Recommended state structure
const [selectedItem, setSelectedItem] = useState<Place | null>(null);
const [filters, setFilters] = useState({
  types: [],
  rating: null,
  when: null,
  features: [],
});
const [sortBy, setSortBy] = useState('best');
const [results, setResults] = useState<Place[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [savedItems, setSavedItems] = useState<string[]>([]);
```

---

## 📱 Bottom Sheet Setup

```typescript
// Install
npm install @gorhom/bottom-sheet

// Setup in _layout.tsx or App.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {/* Your app */}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 🗺️ Map Markers Logic

```typescript
// Marker content logic
function getMarkerContent(item: Place | Event): string {
  if (item.type === 'place') {
    // Show price if available
    if (item.pricePerNight) {
      return `$${item.pricePerNight}/nt`;
    }
    // Otherwise show rating
    if (item.rating) {
      return `★${item.rating.toFixed(1)}`;
    }
    // Fallback to emoji
    return getPlaceEmoji(item.placeType);
  } else {
    // Events: show date
    const date = new Date(item.startDate);
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }
}
```

---

## 🎯 Performance Tips

**Do's:**
✅ Use `useNativeDriver: true` for animations
✅ Limit visible markers to < 100 at once
✅ Use cluster markers for dense areas
✅ Implement virtualized list in bottom sheet
✅ Cache images with FastImage

**Don'ts:**
❌ Don't animate > 20 markers simultaneously
❌ Don't fetch all results at once (paginate)
❌ Don't use complex SVG filters on markers
❌ Don't forget to cleanup animations on unmount

---

## 🧪 Testing Checklist

**Visual:**
- [ ] Marker bubbles visible at all zoom levels
- [ ] Selected state clearly different
- [ ] Bottom sheet drags smoothly
- [ ] Filter modal scrollable
- [ ] Preview card slides up smoothly
- [ ] Empty state centered

**Interaction:**
- [ ] Marker tap shows preview
- [ ] Bottom sheet drag gestures work
- [ ] Filter apply updates results
- [ ] Sort changes order
- [ ] Save button toggles
- [ ] Directions button works

**Performance:**
- [ ] 60fps animations
- [ ] No lag when dragging bottom sheet
- [ ] Map remains responsive
- [ ] Images load quickly

**Accessibility:**
- [ ] Touch targets 44px+
- [ ] High contrast text
- [ ] Screen reader labels
- [ ] Reduce motion support

---

## 🐛 Common Issues

**Issue:** Bottom sheet doesn't drag
**Fix:** Wrap app in `GestureHandlerRootView`

**Issue:** Markers don't update
**Fix:** Use `key` prop on Marker components

**Issue:** Preview card doesn't appear
**Fix:** Check z-index and position: 'absolute'

**Issue:** Filters don't apply
**Fix:** Ensure `onApply` updates results state

**Issue:** Map controls covered by bottom sheet
**Fix:** Adjust `bottom` position based on sheet height

---

## 📚 Full Documentation

See complete specs:
- `MAP_UI_DESIGN_SYSTEM.md` - Part 1 (Markers, Bottom Sheet, Filters)
- `MAP_UI_DESIGN_SYSTEM_PART2.md` - Part 2 (Controls, Preview, States)

**Status:** Production-ready components with complete code examples 🚀
