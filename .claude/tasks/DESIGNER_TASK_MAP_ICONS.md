# Designer Task: Interactive Map Marker Icons & Animations

**Priority:** P0 - Critical for killer feature
**Status:** ✅ COMPLETED
**Completed:** December 1, 2025

---

## Context

The interactive map is TownApp's killer feature but currently uses placeholder emoji icons for all markers. We need a cohesive icon set that matches our brand and clearly distinguishes between different place types and event states.

**Current State:**
- All places use 📍 emoji
- All events use ⭐ emoji
- No visual distinction between types
- No animations for special events

**Brand Colors:**
- Primary Blue: #3b82f6
- Dark Blue: #003580
- Gold/Premium: #fbbf24
- Hot/Urgent Red: #ef4444
- Success Green: #22c55e

---

## Deliverables

### 1. Place Marker Icons (Static)

Create distinct icons for each place type. Should be recognizable at 32x32px on map.

| Type | Icon Concept | Color |
|------|--------------|-------|
| LODGING | Bed/House | Blue #3b82f6 |
| RESTAURANT | Fork & Knife / Plate | Orange #f97316 |
| ATTRACTION | Camera / Star | Purple #8b5cf6 |
| TOWN_SERVICE | Building / Shield | Dark Blue #003580 |

**Requirements:**
- SVG format, optimized for mobile
- 32x32px base size
- Clear silhouette (visible on map tiles)
- White or light interior for contrast
- Colored background/border matching type

### 2. Event Marker Icons (With States)

Events need multiple visual states:

| State | Visual Treatment |
|-------|------------------|
| Regular Event | Calendar icon, blue |
| Town Event | Calendar + town badge, dark blue |
| Featured/Premium | Calendar + gold shimmer border |
| Hot Event (20+ RSVPs) | Calendar + pulsing red glow |
| Happening Soon (<48h) | Calendar + green "NOW" badge |

### 3. Animation Specifications

**Hot Event Pulse:**
```
- Glow radius: 4px → 8px → 4px
- Color: rgba(239, 68, 68, 0.6)
- Duration: 1.5s loop
- Easing: ease-in-out
```

**Featured Event Shimmer:**
```
- Gold gradient sweep across border
- Duration: 2s loop
- Same as premium business card shimmer
```

**Happening Soon Badge:**
```
- Small green dot/badge
- Subtle pulse: scale 1.0 → 1.1 → 1.0
- Duration: 2s loop
```

### 4. Marker Cluster Icon

When multiple markers overlap, show cluster:
- Circle with count number
- Color gradient based on contents (blue for places, mix for events)
- Size scales with count: 40px (2-5), 50px (6-20), 60px (20+)

### 5. Selected State

When a marker is tapped:
- Scale up to 1.2x
- Add shadow/elevation
- Show connection line to preview card

---

## Design Files to Deliver

```
/Users/carlosmaia/townhub/public/branding/map-icons/
├── place-lodging.svg
├── place-restaurant.svg
├── place-attraction.svg
├── place-service.svg
├── event-regular.svg
├── event-town.svg
├── event-featured.svg
├── event-hot.svg
├── cluster-places.svg
├── cluster-events.svg
├── cluster-mixed.svg
└── MAP_ICON_SPECS.md (animation timing & usage guide)
```

---

## Reference

**Current Map Implementation:**
- `/Users/carlosmaia/townhub-mobile/components/map/InteractiveMap.tsx`
- `/Users/carlosmaia/townhub-mobile/components/map/MarkerPreview.tsx`

**Architecture Plan:**
- `/Users/carlosmaia/townhub/.claude/INTERACTIVE_MAP_ARCHITECTURE.md`
- `/Users/carlosmaia/townhub/.claude/INTERACTIVE_MAP_FEATURE_PLAN.md`

**Brand Guidelines:**
- `/Users/carlosmaia/townhub/public/branding/brand-guidelines.md`

---

## Success Criteria

- [x] Icons are distinguishable at 32x32px ✅
- [x] Color coding is intuitive (restaurants = food color, etc.) ✅
- [x] Animations are subtle but noticeable ✅
- [x] Hot events clearly stand out ✅
- [x] Town events have official/authoritative feel ✅
- [x] Cluster icons show meaningful counts ✅
- [x] All SVGs optimized for mobile rendering ✅

---

## ✅ Deliverables Summary

**Files Created:** 14 files total

### Icons (12 SVG files)
- ✅ `place-lodging.svg` (684B) - Blue bed icon
- ✅ `place-restaurant.svg` (891B) - Orange fork & knife
- ✅ `place-attraction.svg` (793B) - Purple camera
- ✅ `place-service.svg` (951B) - Dark blue building
- ✅ `event-regular.svg` (1.0KB) - Blue calendar
- ✅ `event-town.svg` (1.3KB) - Dark blue with gold star badge
- ✅ `event-featured.svg` (2.2KB) - Gold shimmer border animation
- ✅ `event-hot.svg` (2.1KB) - Red with pulsing glow
- ✅ `event-soon.svg` (1.5KB) - Green "NOW" badge
- ✅ `cluster-places.svg` (1.1KB) - Blue gradient circle
- ✅ `cluster-events.svg` (1.4KB) - Purple gradient circle
- ✅ `cluster-mixed.svg` (1.6KB) - Multi-color gradient

### Documentation (2 files)
- ✅ `MAP_ICON_SPECS.md` (19KB) - Complete animation specs & React Native code
- ✅ `QUICK_REFERENCE.md` (4.0KB) - Quick implementation guide

**Total Size:** ~38KB (highly optimized for mobile)

---

## 🎨 Design Highlights

### Color System
- **Lodging:** Blue #3b82f6 (brand color, travel/booking)
- **Restaurant:** Orange #f97316 (appetizing, food industry)
- **Attraction:** Purple #8b5cf6 (creative, entertainment)
- **Service:** Dark Blue #003580 (official, governmental)
- **Hot Event:** Red #ef4444 (urgent, trending)
- **Featured:** Gold #fbbf24 (premium, sponsored)

### Animations Provided
1. **Hot Event Pulse:** Red glow 4px→8px→4px, 1.5s loop
2. **Featured Shimmer:** Gold gradient sweep, 2s linear
3. **Happening Soon:** Green badge pulse, 2s sine
4. **Selected State:** Scale 1.0→1.2 with spring physics
5. **Cluster Expansion:** Radial explosion with spring

### State Hierarchy
```
Events (priority order):
1. Hot (20+ RSVPs) → Red pulsing glow
2. Featured/Premium → Gold shimmer border
3. Town Official → Dark blue with badge
4. Happening Soon → Green "NOW" badge
5. Regular → Basic blue calendar
```

---

## 📱 Implementation Ready

**All code provided for:**
- Complete React Native Reanimated animations
- Marker selection logic
- Cluster sizing and type detection
- Accessibility support (Reduce Motion)
- Performance optimization guidelines

**Next Steps:**
1. Copy SVGs to mobile project: `/townhub-mobile/assets/map-icons/`
2. Install dependencies: `react-native-svg`, `react-native-reanimated`
3. Implement `MapMarker.tsx` and `ClusterMarker.tsx` components
4. Test animations on iOS and Android

**Location:** `/Users/carlosmaia/townhub/public/branding/map-icons/`
