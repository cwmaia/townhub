# QA Task: Interactive Map End-to-End Testing

**Priority:** P1
**Status:** Ready after Engineering tasks complete
**Depends On:** ENGINEER_TASK_MAP_EVENT_LOCATIONS.md, ENGINEER_TASK_MAP_MARKERS.md

---

## Overview

Comprehensive testing of the interactive map feature across mobile platforms (iOS & Android).

---

## Test Environment Setup

1. **Backend:** Ensure townhub CMS is running with seed data
2. **Mobile:** Run townhub-mobile on iOS Simulator and Android Emulator
3. **Test Data:** Verify database has:
   - At least 10 places with coordinates
   - At least 5 events (mix of town, featured, regular)
   - At least 1 "hot" event (20+ RSVPs)

---

## Test Cases

### TC-001: Map Initial Load

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app, tap Explore tab | Map loads centered on town |
| 2 | Wait for data | Place markers appear |
| 3 | Wait for data | Event markers appear |
| 4 | Check loading state | Loading indicator shown while fetching |

**Pass Criteria:** Map renders within 3 seconds with all markers visible

---

### TC-002: Place Markers

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Identify lodging marker | Shows bed/house icon in blue |
| 2 | Identify restaurant marker | Shows food icon in orange |
| 3 | Identify attraction marker | Shows camera/star icon in purple |
| 4 | Identify town service marker | Shows building icon in dark blue |
| 5 | Tap any place marker | Preview card appears at bottom |
| 6 | Check preview card | Shows name, type, rating, image |

**Pass Criteria:** All place types have distinct, recognizable icons

---

### TC-003: Event Markers - Regular

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find regular event marker | Shows calendar icon in blue |
| 2 | Tap marker | Preview card shows event details |
| 3 | Check preview | Shows title, date, RSVP count |

---

### TC-004: Event Markers - Town Events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find town event marker | Shows calendar with town badge |
| 2 | Verify location | Should be at/near town center |
| 3 | Tap marker | Preview shows "Town Event" badge |
| 4 | Check styling | Dark blue color, official feel |

---

### TC-005: Event Markers - Hot Events

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find hot event (20+ RSVPs) | Marker has pulsing red glow |
| 2 | Verify animation | Smooth pulse, not jarring |
| 3 | Tap marker | Preview shows "🔥 HOT" badge |
| 4 | Check RSVP count | Shows high number (20+) |

**Pass Criteria:** Animation runs at 60fps, clearly visible

---

### TC-006: Event Markers - Featured/Premium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find featured event | Marker has gold shimmer border |
| 2 | Verify animation | Smooth shimmer sweep effect |
| 3 | Tap marker | Preview shows premium styling |

---

### TC-007: Event Markers - Happening Soon

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find event within 48 hours | Green "NOW" badge visible |
| 2 | Check badge | Small, doesn't obscure icon |
| 3 | Tap marker | Preview emphasizes timing |

---

### TC-008: Filter - Categories

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Restaurants" filter | Only restaurant markers shown |
| 2 | Tap "Events" filter | Only event markers shown |
| 3 | Tap "All" filter | All markers return |
| 4 | Verify filter chips | Active state shows brand color |

---

### TC-009: Filter - Date

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Upcoming" date filter | Only future events shown |
| 2 | Tap "All dates" | All events return |
| 3 | Combine with category | Both filters apply together |

---

### TC-010: Marker Preview Card

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap place marker | Card slides up from bottom |
| 2 | Check image | Thumbnail loads (or placeholder) |
| 3 | Check details | Name, type, rating visible |
| 4 | Tap outside card | Card dismisses |
| 5 | Tap another marker | Card updates to new item |

---

### TC-011: Map Interaction

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Pinch to zoom out | Markers cluster when close |
| 2 | Pinch to zoom in | Clusters expand to individual markers |
| 3 | Pan map | Smooth scrolling, markers stay in place |
| 4 | Double tap | Zooms in on that location |

---

### TC-012: Performance

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load map with 50+ markers | No lag or frame drops |
| 2 | Pan rapidly | Smooth 60fps |
| 3 | Multiple animations running | No stutter |
| 4 | Memory usage | Stable, no leaks |

---

### TC-013: Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No network | Error state with retry button |
| Empty data | "No places/events found" message |
| Event at same location as place | Both markers visible, slightly offset |
| Many events at town center | Cluster or stack neatly |

---

### TC-014: Platform Specific

**iOS:**
- [ ] Map renders correctly on iPhone SE (small screen)
- [ ] Map renders correctly on iPhone Pro Max (large screen)
- [ ] Apple Maps tiles load properly

**Android:**
- [ ] Map renders correctly on various screen sizes
- [ ] Google Maps tiles load properly
- [ ] Animations work on lower-end devices

---

## Bug Report Template

```markdown
**Bug ID:** MAP-XXX
**Severity:** Critical/High/Medium/Low
**Platform:** iOS/Android/Both

**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**
**Screenshot/Video:** [attach]
```

---

## Sign-Off Checklist

- [ ] All test cases passed on iOS
- [ ] All test cases passed on Android
- [ ] Performance acceptable (<3s load, 60fps)
- [ ] No critical or high severity bugs open
- [ ] Accessibility tested (VoiceOver/TalkBack)
- [ ] Dark mode tested (if applicable)

**QA Approved:** _________________ Date: _________
