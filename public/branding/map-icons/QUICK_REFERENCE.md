# Map Icons - Quick Reference

**Last Updated:** November 25, 2025

---

## Icon Selection Logic

### Places

```typescript
function getPlaceIcon(type: PlaceType): string {
  const iconMap = {
    LODGING: 'place-lodging.svg',        // Blue bed icon
    RESTAURANT: 'place-restaurant.svg',  // Orange fork & knife
    ATTRACTION: 'place-attraction.svg',  // Purple camera
    TOWN_SERVICE: 'place-service.svg',   // Dark blue building
  };
  return iconMap[type];
}
```

### Events

```typescript
function getEventIcon(event: Event): string {
  // Priority order (highest first)
  if (event.rsvpCount >= 20) return 'event-hot.svg';          // 🔥 Red pulse
  if (event.isPremium) return 'event-featured.svg';           // ⭐ Gold shimmer
  if (event.isTownOfficial) return 'event-town.svg';          // 🏛️ Official badge
  if (event.startsInHours < 48) return 'event-soon.svg';      // 🟢 NOW badge
  return 'event-regular.svg';                                  // 📅 Basic calendar
}
```

### Clusters

```typescript
function getClusterIcon(markers: Marker[]): ClusterConfig {
  const places = markers.filter(m => m.type === 'place').length;
  const events = markers.filter(m => m.type === 'event').length;
  const count = markers.length;

  // Determine size
  const size = count <= 5 ? 40 : count <= 20 ? 50 : 60;

  // Determine type
  let type = 'mixed';
  if (events === 0) type = 'places';
  if (places === 0) type = 'events';

  return {
    icon: `cluster-${type}.svg`,
    size,
    count,
  };
}
```

---

## Color Reference

| Icon Type | Color | Hex | Use Case |
|-----------|-------|-----|----------|
| Lodging | Blue | `#3b82f6` | Hotels, hostels, camping |
| Restaurant | Orange | `#f97316` | Dining, cafes, bars |
| Attraction | Purple | `#8b5cf6` | Tourism, sightseeing |
| Service | Dark Blue | `#003580` | Government, utilities |
| Event Regular | Blue | `#3b82f6` | Community events |
| Event Town | Dark Blue | `#003580` | Official events |
| Event Featured | Gold | `#fbbf24` | Premium/sponsored |
| Event Hot | Red | `#ef4444` | Trending events |
| Event Soon | Green | `#22c55e` | Starting soon |

---

## Animation Quick Copy

### Hot Event Pulse (Red Glow)

```typescript
const glowRadius = useSharedValue(4);
glowRadius.value = withRepeat(
  withSequence(
    withTiming(8, { duration: 750, easing: Easing.inOut(Easing.sine) }),
    withTiming(4, { duration: 750, easing: Easing.inOut(Easing.sine) })
  ),
  -1,
  false
);
```

### Featured Shimmer (Gold Sweep)

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.featured {
  background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 50%, #fbbf24 100%);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

### Selected State (Scale + Shadow)

```typescript
const scale = useSharedValue(1);
scale.value = withSpring(1.2, { damping: 15, stiffness: 200 });
```

---

## File Sizes

All icons optimized for mobile:

| File | Size | Notes |
|------|------|-------|
| place-*.svg | ~800B | 32x40px pins |
| event-*.svg | ~1.2KB | Includes badges |
| event-hot.svg | ~1.8KB | Includes glow filter |
| cluster-*.svg | ~1.5KB | 40-60px circles |

**Total:** ~14KB for all 12 icons

---

## Implementation Checklist

**Setup:**
- [ ] Copy SVGs to `/assets/map-icons/`
- [ ] Install `react-native-svg`
- [ ] Install `react-native-reanimated`

**Components:**
- [ ] Create `MapMarker.tsx`
- [ ] Create `ClusterMarker.tsx`
- [ ] Add animation logic

**Testing:**
- [ ] Verify all icons render
- [ ] Check animations at 60fps
- [ ] Test cluster expansion
- [ ] Test selected state

---

## Common Issues

**Issue:** Icons don't render
**Fix:** Check SVG import method, use `react-native-svg`

**Issue:** Animations stutter
**Fix:** Use `useNativeDriver: true`, limit concurrent animations

**Issue:** Cluster count not visible
**Fix:** Adjust text position, increase font weight

**Issue:** Hot event glow not visible
**Fix:** Check filter support, increase glow opacity

---

**Full Documentation:** See `MAP_ICON_SPECS.md`
