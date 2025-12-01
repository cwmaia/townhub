# TownApp Map UI Design System (Booking.com Style)

**Version:** 1.0
**Date:** December 1, 2025
**Status:** Production Ready
**Design Reference:** Booking.com, Airbnb, Google Maps

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Marker Bubbles](#marker-bubbles)
4. [Bottom Sheet](#bottom-sheet)
5. [Filter Modal](#filter-modal)
6. [Map Controls](#map-controls)
7. [Selected Item Preview](#selected-item-preview)
8. [Empty & Loading States](#empty--loading-states)
9. [React Native Implementation](#react-native-implementation)
10. [Animation Specifications](#animation-specifications)

---

## Design Principles

### Booking.com UX Patterns

**Why Booking.com?**
- Proven conversion rates in travel industry
- Clean, information-dense design
- Excellent mobile UX patterns
- Clear visual hierarchy

**Core Principles:**
1. **Information Density** - Show maximum useful info without clutter
2. **Touch-First** - 44px+ touch targets, swipe gestures
3. **Progressive Disclosure** - Collapsed → Half → Expanded states
4. **Clear CTAs** - Primary actions always visible
5. **Instant Feedback** - Animations confirm user actions

---

## Color System

### Brand Colors (TownApp)

```typescript
const colors = {
  // Primary
  primaryDark: '#003580',    // Main brand blue
  primary: '#3b82f6',        // Light blue

  // Type-specific
  lodging: '#3b82f6',        // Blue
  restaurant: '#f97316',     // Orange
  attraction: '#8b5cf6',     // Purple
  service: '#003580',        // Dark blue
  event: '#ef4444',          // Red

  // Status
  hot: '#ef4444',            // Hot events
  featured: '#fbbf24',       // Premium/featured
  success: '#22c55e',        // Distance, success

  // Neutrals
  text: '#0f172a',           // Slate 900
  textSecondary: '#475467',  // Slate 600
  textMuted: '#94a3b8',      // Slate 400
  border: '#e2e8f0',         // Slate 200
  background: '#f1f5f9',     // Slate 100
  white: '#ffffff',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};
```

### Typography Scale

```typescript
const typography = {
  // Titles
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '600', lineHeight: 22 },

  // Body
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },

  // UI
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },

  // Marker
  markerPrice: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
};
```

### Spacing Scale

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

---

## Marker Bubbles

### Design Philosophy

**Booking.com Pattern:**
- Price/rating bubbles instead of pins
- Instant price visibility
- Clear selected state
- Color-coded by type

### Bubble Anatomy

```
Default State:
┌─────────────┐
│   $120/nt   │  ← White bg, blue border (2px)
└─────────────┘
      ▼          ← Small pointer (6px height)

Selected State:
┌─────────────┐
│   $120/nt   │  ← Blue bg, white text, larger shadow
└─────────────┘
      ▼
```

### Dimensions & Specs

```typescript
const markerBubble = {
  // Container
  minWidth: 48,
  height: 28,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 14,
  borderWidth: 2,

  // Pointer
  pointerHeight: 6,
  pointerWidth: 10,

  // Typography
  fontSize: 12,
  fontWeight: '700',

  // Shadow (default)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,

  // Shadow (selected)
  shadowOpacitySelected: 0.2,
  shadowRadiusSelected: 8,

  // Scale
  scaleDefault: 1.0,
  scaleSelected: 1.1,
};
```

### Marker Variants by Type

#### Lodging (Hotels, Hostels)
```typescript
const lodgingMarker = {
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
    textColor: '#3b82f6',
  },
  selected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    textColor: '#ffffff',
  },
  content: '$120/nt',  // or '★4.5'
};
```

#### Restaurant
```typescript
const restaurantMarker = {
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#f97316',
    textColor: '#f97316',
  },
  selected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
    textColor: '#ffffff',
  },
  content: '★4.2',  // or '🍽'
};
```

#### Attraction
```typescript
const attractionMarker = {
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#8b5cf6',
    textColor: '#8b5cf6',
  },
  selected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    textColor: '#ffffff',
  },
  content: '★4.8',  // or '📷'
};
```

#### Event
```typescript
const eventMarker = {
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#ef4444',
    textColor: '#ef4444',
  },
  selected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
    textColor: '#ffffff',
  },
  content: 'Dec 15',  // or '📅'
};
```

### React Native Component

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface MarkerBubbleProps {
  type: 'lodging' | 'restaurant' | 'attraction' | 'event';
  content: string;  // Price, rating, or date
  isSelected: boolean;
}

const typeColors = {
  lodging: '#3b82f6',
  restaurant: '#f97316',
  attraction: '#8b5cf6',
  event: '#ef4444',
};

export const MarkerBubble: React.FC<MarkerBubbleProps> = ({
  type,
  content,
  isSelected,
}) => {
  const color = typeColors[type];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: withSpring(isSelected ? 1.1 : 1.0, {
        damping: 15,
        stiffness: 200,
      }),
    }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isSelected ? color : '#ffffff',
            borderColor: color,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isSelected ? '#ffffff' : color },
          ]}
        >
          {content}
        </Text>
      </View>
      <View style={[styles.pointer, { borderTopColor: color }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bubble: {
    minWidth: 48,
    height: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
```

### Content Logic

```typescript
function getMarkerContent(item: Place | Event): string {
  if (item.type === 'place') {
    // Show price if available, otherwise rating
    if (item.pricePerNight) {
      return `$${item.pricePerNight}/nt`;
    } else if (item.rating) {
      return `★${item.rating.toFixed(1)}`;
    } else {
      return item.placeType === 'LODGING' ? '🏨' :
             item.placeType === 'RESTAURANT' ? '🍽️' :
             item.placeType === 'ATTRACTION' ? '📷' : '🏛️';
    }
  } else {
    // Events: show date or calendar emoji
    const date = new Date(item.startDate);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}
```

---

## Bottom Sheet

### Three-State Design

**Collapsed (15%):** Shows result count only
**Half (50%):** Shows 2-3 cards, scrollable
**Expanded (90%):** Full list view

### Bottom Sheet Anatomy

```
┌────────────────────────────────┐
│  ═════  (drag handle)          │ ← 32px height header
├────────────────────────────────┤
│  32 places nearby              │ ← 48px height title
│  Sort: Rating ▼                │ ← 40px height sort
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │   Result Card 1          │  │ ← 108px height card
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │   Result Card 2          │  │
│  └──────────────────────────┘  │
│  ...scrollable...              │
└────────────────────────────────┘
```

### Drag Handle

```typescript
const dragHandle = {
  width: 40,
  height: 4,
  backgroundColor: '#cbd5e1',  // Slate 300
  borderRadius: 2,
  marginTop: 8,
  marginBottom: 8,
};
```

### Header Design

```typescript
const bottomSheetHeader = {
  backgroundColor: '#ffffff',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
};
```

### Result Card

```
┌────────────────────────────────┐
│ ┌──────┐                       │
│ │      │  Hotel Stykkishólmur  │ ← 16px semibold title
│ │ 80px │  ★ 4.5 · Hotel        │ ← 13px rating + type
│ │      │  0.3 km away          │ ← 12px distance (green)
│ └──────┘                       │
│          $120/night    ❤️      │ ← 16px bold price + heart
└────────────────────────────────┘
```

### Card Specifications

```typescript
const resultCard = {
  // Container
  marginHorizontal: 16,
  marginVertical: 8,
  padding: 12,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,

  // Image
  imageSize: 80,
  imageRadius: 12,
  imageMarginRight: 12,

  // Content
  titleFontSize: 16,
  titleFontWeight: '600',
  titleColor: '#0f172a',

  subtitleFontSize: 13,
  subtitleColor: '#475467',

  distanceFontSize: 12,
  distanceColor: '#22c55e',

  priceFontSize: 16,
  priceFontWeight: '700',
  priceColor: '#003580',

  // Heart icon
  heartSize: 24,
  heartColorInactive: '#cbd5e1',
  heartColorActive: '#ef4444',
};
```

### React Native Bottom Sheet Component

```typescript
import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

interface BottomSheetResultsProps {
  results: Array<Place | Event>;
  sortBy: 'rating' | 'distance' | 'price';
  onSortChange: (sort: string) => void;
}

export const BottomSheetResults: React.FC<BottomSheetResultsProps> = ({
  results,
  sortBy,
  onSortChange,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['15%', '50%', '90%'];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1}  // Start at half
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.background}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {results.length} places nearby
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort: {sortBy}</Text>
          <ChevronDown size={20} color="#475467" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResultCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  dragHandle: {
    backgroundColor: '#cbd5e1',
    width: 40,
    height: 4,
  },
  background: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sortText: {
    fontSize: 14,
    color: '#475467',
    marginRight: 4,
  },
  list: {
    paddingBottom: 100,
  },
});
```

### Result Card Component

```typescript
interface ResultCardProps {
  item: Place | Event;
  onPress: () => void;
  onSavePress: () => void;
  isSaved: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  item,
  onPress,
  onSavePress,
  isSaved,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={onSavePress}>
            <Heart
              size={24}
              color={isSaved ? '#ef4444' : '#cbd5e1'}
              fill={isSaved ? '#ef4444' : 'none'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Star size={14} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.type}>{item.type}</Text>
        </View>

        <Text style={styles.distance}>
          {item.distanceKm.toFixed(1)} km away
        </Text>

        {item.pricePerNight && (
          <Text style={styles.price}>${item.pricePerNight}/night</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475467',
    marginLeft: 4,
  },
  separator: {
    fontSize: 13,
    color: '#94a3b8',
    marginHorizontal: 6,
  },
  type: {
    fontSize: 13,
    color: '#475467',
  },
  distance: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003580',
    marginTop: 4,
  },
});
```

---

## Filter Modal

### Full-Screen Modal Layout

```
┌────────────────────────────────┐
│ Cancel      Filters      Reset │ ← 56px header
├────────────────────────────────┤
│                                │
│  TYPE                          │ ← Section title
│  ☑ Hotels                      │ ← 48px checkbox rows
│  ☑ Restaurants                 │
│  ☐ Attractions                 │
│  ☐ Services                    │
│  ☐ Events                      │
│                                │
│  RATING                        │
│  ○ Any  ● 3+  ○ 4+  ○ 4.5+    │ ← 44px radio row
│                                │
│  WHEN (Events only)            │
│  ○ Any time                    │
│  ○ Today                       │
│  ○ This week                   │
│  ○ This month                  │
│                                │
│  FEATURES                      │
│  ☐ Free WiFi                   │
│  ☐ Parking                     │
│  ☐ Pet friendly                │
│                                │
├────────────────────────────────┤
│  ┌────────────────────────┐    │ ← 64px footer
│  │   Show 24 results      │    │ ← 48px button
│  └────────────────────────┘    │
└────────────────────────────────┘
```

### Header Specifications

```typescript
const filterModalHeader = {
  height: 56,
  backgroundColor: '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
  paddingHorizontal: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const headerButton = {
  fontSize: 16,
  fontWeight: '400',
  color: '#3b82f6',
  paddingVertical: 8,
  paddingHorizontal: 8,
};

const headerTitle = {
  fontSize: 18,
  fontWeight: '600',
  color: '#0f172a',
};
```

### Section Specifications

```typescript
const filterSection = {
  marginTop: 24,
  paddingHorizontal: 16,
};

const sectionTitle = {
  fontSize: 12,
  fontWeight: '600',
  color: '#475467',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 12,
};

const filterRow = {
  flexDirection: 'row',
  alignItems: 'center',
  height: 48,
  paddingVertical: 12,
};
```

### Checkbox & Radio Styles

```typescript
const checkbox = {
  width: 24,
  height: 24,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: '#cbd5e1',
  marginRight: 12,

  // Checked state
  borderColorChecked: '#3b82f6',
  backgroundColorChecked: '#3b82f6',
};

const radio = {
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#cbd5e1',
  marginRight: 12,

  // Selected state
  borderColorSelected: '#3b82f6',

  // Inner dot
  innerDotSize: 12,
  innerDotColor: '#3b82f6',
};
```

### Apply Button

```typescript
const applyButton = {
  height: 48,
  backgroundColor: '#003580',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 16,
  marginVertical: 12,

  // Pressed state
  backgroundColorPressed: '#002147',

  // Disabled state
  backgroundColorDisabled: '#cbd5e1',

  // Text
  textColor: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
};
```

### React Native Filter Modal

```typescript
import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initialFilters: Filters;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleReset = () => {
    setFilters({
      types: [],
      rating: null,
      when: null,
      features: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.headerButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {/* TYPE Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TYPE</Text>
            {['Hotels', 'Restaurants', 'Attractions', 'Services', 'Events'].map(type => (
              <FilterCheckbox
                key={type}
                label={type}
                checked={filters.types.includes(type)}
                onPress={() => {
                  setFilters(f => ({
                    ...f,
                    types: f.types.includes(type)
                      ? f.types.filter(t => t !== type)
                      : [...f.types, type],
                  }));
                }}
              />
            ))}
          </View>

          {/* RATING Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RATING</Text>
            <View style={styles.radioRow}>
              {[null, 3, 4, 4.5].map(rating => (
                <FilterRadio
                  key={rating || 'any'}
                  label={rating ? `${rating}+` : 'Any'}
                  selected={filters.rating === rating}
                  onPress={() => setFilters(f => ({ ...f, rating }))}
                />
              ))}
            </View>
          </View>

          {/* WHEN Section (Events only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WHEN (EVENTS ONLY)</Text>
            {['Any time', 'Today', 'This week', 'This month'].map(when => (
              <FilterRadio
                key={when}
                label={when}
                selected={filters.when === when}
                onPress={() => setFilters(f => ({ ...f, when }))}
              />
            ))}
          </View>

          {/* FEATURES Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FEATURES</Text>
            {['Free WiFi', 'Parking', 'Pet friendly'].map(feature => (
              <FilterCheckbox
                key={feature}
                label={feature}
                checked={filters.features.includes(feature)}
                onPress={() => {
                  setFilters(f => ({
                    ...f,
                    features: f.features.includes(feature)
                      ? f.features.filter(feat => feat !== feature)
                      : [...f.features, feature],
                  }));
                }}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Show {resultsCount} results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    fontSize: 16,
    color: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475467',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  applyButton: {
    height: 48,
    backgroundColor: '#003580',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

**[Continued in next message - document is getting very long. This covers Marker Bubbles, Bottom Sheet, and Filter Modal in detail. Next sections will cover Map Controls, Selected Item Preview, Empty/Loading States, and complete implementations.]**
