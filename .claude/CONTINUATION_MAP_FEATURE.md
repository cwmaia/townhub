# Continuation Prompt: Interactive Map Feature (Booking.com Style)

**Date:** December 1, 2025
**Feature:** Interactive Map - Killer Feature for TownApp
**Status:** In Progress - Full Day Sprint

---

## Context Summary

We are rebuilding the Interactive Map to match Booking.com's UX patterns. This is TownApp's killer feature.

### What's Working
1. **API endpoint** `/api/map/data` returns 30 places and 4 events for Stykkishólmur
2. **Bubble markers** - Simple View+Text markers with colored borders (no PNG images - they weren't rendering)
3. **Basic filter chips** - Working but being replaced with filter modal
4. **MarkerPreview card** - Shows when tapping a marker

### What's Being Built (Engineer Tasks)
- **Part 2:** Bottom sheet results list using `@gorhom/bottom-sheet`
- **Part 3:** Full-screen filter modal (replaces horizontal chip scroll)
- **Part 4:** Map controls (current location, search this area)

### Key Files

**Mobile App:**
- `/townhub-mobile/components/map/InteractiveMap.tsx` - Main map component
- `/townhub-mobile/components/map/MapMarker.tsx` - Bubble-style markers
- `/townhub-mobile/components/map/MapFilters.tsx` - Filter chips (being replaced)
- `/townhub-mobile/components/map/MarkerPreview.tsx` - Preview card on marker tap
- `/townhub-mobile/hooks/useMapData.ts` - Data fetching hook

**Backend:**
- `/townhub/app/api/map/data/route.ts` - Map data API (places + events + town center)

**Task Documents:**
- `/townhub/.claude/tasks/ENGINEER_TASK_MAP_BOOKING_STYLE.md` - Full engineer spec
- `/townhub/.claude/tasks/DESIGNER_TASK_MAP_BOOKING_STYLE.md` - Full designer spec

### Dependencies to Install (if not done)
```bash
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

---

## Architecture Notes

### MapMarker Props
```typescript
interface MapMarkerProps {
  type: 'place' | 'event';
  placeType?: 'LODGING' | 'RESTAURANT' | 'ATTRACTION' | 'TOWN_SERVICE';
  isHot?: boolean;
  isFeatured?: boolean;
  isTownEvent?: boolean;
  isHappeningSoon?: boolean;
  isSelected?: boolean;
  rating?: number | null;
  price?: string;
}
```

### Map Data Types
```typescript
type MapPlace = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  rating?: number | null;
};

type MapEvent = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  startDate: string;
  isHot?: boolean;
  isFeatured?: boolean;
  isTownEvent?: boolean;
  isHappeningSoon?: boolean;
};
```

### Color Scheme
- LODGING: #3b82f6 (blue)
- RESTAURANT: #f97316 (orange)
- ATTRACTION: #8b5cf6 (purple)
- TOWN_SERVICE: #003580 (dark blue)
- EVENT regular: #3b82f6
- EVENT hot: #ef4444 (red)
- EVENT featured: #fbbf24 (gold)
- EVENT town: #003580

---

## Current Sprint Status

| Task | Owner | Status |
|------|-------|--------|
| Bubble markers | Architect | ✅ Done |
| Bottom sheet list | Engineer | 🔄 In Progress |
| Filter modal | Engineer | ⏳ Pending |
| Map controls | Engineer | ⏳ Pending |
| UI polish | Designer | ⏳ Pending |

---

## What to Do When Resuming

1. **Check Engineer's progress** on bottom sheet implementation
2. **Test the map** - reload Expo app, verify:
   - Markers display as bubbles with icons/ratings
   - Bottom sheet (if implemented) shows results list
   - Filters work
3. **Review any new files** created by Engineer:
   - `MapBottomSheet.tsx`
   - `FilterModal.tsx`
   - `ResultCard.tsx`
4. **Fix any issues** - permission errors, runtime errors
5. **Coordinate Designer** for UI polish once Engineer completes parts

---

## Known Issues to Watch

1. **File permissions** - After writes, run `chmod 644` on modified files
2. **Expo Go limitations** - Some native modules need dev build
3. **Android marker rendering** - Using View+Text bubbles instead of Image components
4. **All places at same coords** - Many places are at town center (65.074, -22.73) - geocoding task pending

---

## Commands

**Backend:** Running at http://localhost:3000
**Mobile:** Expo dev server (press 'a' for Android)

**Test API:**
```bash
curl -s "http://localhost:3000/api/map/data?townId=stykkisholmur" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Places: {len(d[\"places\"])}, Events: {len(d[\"events\"])}')"
```

---

## Reference Links

- [Booking.com Map UX Research](https://www.researchgate.net/figure/Walkthrough-of-the-Bookingcom-Mobile-Map-Design_fig3_325559306)
- [Baymard UX Benchmark](https://baymard.com/ux-benchmark/case-studies/booking-com)
- [@gorhom/bottom-sheet docs](https://gorhom.github.io/react-native-bottom-sheet/)
