# Engineer Task: Fix Mobile App Issues

**Priority:** HIGH
**Estimated Time:** 30-45 minutes
**Date:** 2025-11-25

---

## Overview

The TownHub mobile app is now running on the Samsung device via EAS development build, but there are several issues preventing it from working correctly. This task fixes those issues.

---

## Issue 1: useMapData Returns Undefined (CRITICAL)

**Error:**
```
Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ["mapData","stykkisholmur"]
```

**Root Cause:**
The axios response interceptor in `services/api.ts` already unwraps `response.data`:
```typescript
// Line 22
(response) => response.data,
```

But `useMapData.ts` calls `.then((response) => response.data)` again:
```typescript
// Line 49
queryFn: () => mapApi.getData({ townId }).then((response) => response.data as MapData),
```

This results in accessing `undefined` because `response` is already the data.

**Fix:**

**File:** `/Users/carlosmaia/townhub-mobile/hooks/useMapData.ts`

Change line 49 from:
```typescript
queryFn: () => mapApi.getData({ townId }).then((response) => response.data as MapData),
```

To:
```typescript
queryFn: () => mapApi.getData({ townId }) as Promise<MapData>,
```

---

## Issue 2: API URL Port Mismatch (CHECK REQUIRED)

**Current State:**
- Backend runs on port 3000
- `app.json` has `apiUrl: "http://192.168.1.21:3000"` ✓

This should be correct, but verify the IP hasn't changed:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

If IP changed, update `/Users/carlosmaia/townhub-mobile/app.json`:
```json
"apiUrl": "http://NEW_IP:3000"
```

---

## Issue 3: Similar Pattern in Other Hooks

Check these hooks for the same `.data` issue:

**File:** `/Users/carlosmaia/townhub-mobile/hooks/useDashboard.ts`
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useEvents.ts`
**File:** `/Users/carlosmaia/townhub-mobile/hooks/usePlaces.ts`
**File:** `/Users/carlosmaia/townhub-mobile/hooks/useProfile.ts`

Each query function should NOT call `.then(r => r.data)` since the interceptor already does this.

---

## Issue 4: SafeAreaView Deprecation Warning

**Warning:**
```
SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.
```

**Fix:**
Search for imports of SafeAreaView from 'react-native' and replace with 'react-native-safe-area-context'.

**Search:**
```bash
grep -r "from 'react-native'" /Users/carlosmaia/townhub-mobile --include="*.tsx" | grep SafeAreaView
```

**Replace:**
```typescript
// FROM:
import { SafeAreaView } from 'react-native';

// TO:
import { SafeAreaView } from 'react-native-safe-area-context';
```

---

## Testing Checklist

After fixes, verify on Samsung device:

1. [ ] App loads without "undefined" error
2. [ ] Home screen shows content (events, places)
3. [ ] Explore tab opens and shows map
4. [ ] Map markers appear (if places have coordinates)
5. [ ] Tapping markers shows preview card
6. [ ] No console errors in Metro

---

## Quick Fix Commands

```bash
# 1. Fix useMapData.ts
cd /Users/carlosmaia/townhub-mobile

# 2. Check current IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 3. Restart Metro after changes
# Press 'r' in Metro terminal to reload
```

---

## Files to Modify

| File | Change |
|------|--------|
| `hooks/useMapData.ts` | Remove `.then(r => r.data)` |
| `hooks/useDashboard.ts` | Check for same issue |
| `hooks/useEvents.ts` | Check for same issue |
| `hooks/usePlaces.ts` | Check for same issue |
| Components using SafeAreaView | Update import |

---

## Notes for Engineer

- The EAS development build is installed and working on Samsung
- Metro bundler is running on port 8081
- Backend API is running on port 3000
- Hot reload should work - just save files and app updates
- If app doesn't reload, press 'r' in Metro terminal

---

**Created by:** Architect Agent
**Date:** 2025-11-25
