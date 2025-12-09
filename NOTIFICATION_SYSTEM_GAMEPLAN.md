# TownHub Notification & Profile System - Implementation Game Plan

## Executive Summary

Build a smart notification system that respects user preferences at multiple levels:
1. **Category-level** - User opts in/out of notification types during profile creation
2. **Business-level** - User can subscribe/unsubscribe from specific businesses
3. **Quota-controlled** - Businesses limited by subscription tier

---

## Current State Analysis

### What Exists

#### Web App (townhub)
- **Profile Model**: Has `notificationPreferences` JSON field with 5 boolean flags
- **Notification Infrastructure**: Expo push via server SDK, delivery tracking, quota enforcement
- **Business Plans**: 4 tiers (Free/Starter/Growth/Premium) with notification limits
- **Admin Dashboard**: Can send notifications, view quotas, manage segments
- **Device Registration**: `/api/notifications/register-device` endpoint

#### Mobile App (townhub-mobile)
- **Profile Screen**: Basic preferences UI (3 toggles: townAlerts, weatherAlerts, businessAlerts)
- **Push Setup**: expo-notifications configured, token registration working
- **Notification Screen**: Lists notifications, marks as read, deep links

### What's Missing

1. **Profile Creation Flow** - No onboarding, just auto-create on first action
2. **Granular Preferences** - Can't subscribe to specific businesses
3. **Business Subscription Model** - No `BusinessSubscription` table linking users to businesses
4. **Preference-Aware Sending** - Server doesn't filter recipients by preferences
5. **Profile Settings Page** (Web) - No UI to manage preferences

---

## Database Schema Changes

### New Tables

```prisma
// User's subscription to receive notifications from a specific business
model BusinessNotificationSubscription {
  id          String   @id @default(cuid())
  userId      String
  user        Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, businessId])
  @@index([businessId])
  @@index([userId])
}

// User's subscription to a place (for non-business places)
model PlaceNotificationSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  placeId   String
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, placeId])
  @@index([placeId])
  @@index([userId])
}
```

### Enhanced Profile notificationPreferences

```typescript
// Current (too simple)
{
  "events": true,
  "promos": true,
  "townAlerts": true,
  "weatherAlerts": true,
  "businessAlerts": true
}

// New (category-based with business types)
{
  "categories": {
    "townAlerts": true,      // Police, fire, civic announcements
    "weatherAlerts": true,   // Weather, road conditions, aurora
    "events": true,          // Community events, festivals
    "emergencyAlerts": true  // Critical safety alerts (always recommended ON)
  },
  "businessTypes": {
    "lodging": true,         // Hotels, guesthouses, B&Bs
    "restaurant": true,      // Restaurants, cafes, bars
    "attraction": true,      // Museums, tours, activities
    "service": true,         // Town services, shops, utilities
    "all_other": true        // Catch-all for uncategorized
  },
  "globalEnabled": true,     // Master switch
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}
```

---

## User Flows

### Flow 1: Profile Creation (First-Time User)

**Trigger**: User signs up or first opens mobile app

**Steps**:
1. Welcome screen with app value proposition
2. Request push notification permission (iOS/Android)
3. **Preference Selection Screen**:
   - "What would you like to hear about?"
   - Category toggles (town alerts, weather, events, emergency)
   - Business type toggles (lodging, restaurants, attractions, services)
   - All default ON except quiet hours
4. Optional: Name/avatar setup
5. Complete - redirect to home

**Mobile Screens**:
- `app/onboarding/welcome.tsx`
- `app/onboarding/notifications.tsx`
- `app/onboarding/profile.tsx`
- `app/onboarding/complete.tsx`

**Web Pages**:
- `/[locale]/onboarding` - Multi-step form (or modal)

### Flow 2: Business/Place Detail View

**When viewing a business or place**:
1. Show notification bell icon in header
2. If opted into that business type → bell is filled, "Subscribed"
3. Tap bell → toggle subscription for THIS specific business
4. If business type is OFF in preferences → show "Enable restaurant notifications to subscribe"

**API Endpoints**:
- `POST /api/businesses/[id]/subscribe` - Subscribe to business
- `DELETE /api/businesses/[id]/subscribe` - Unsubscribe
- `GET /api/businesses/[id]/subscription` - Check subscription status

### Flow 3: Profile Settings (Manage Preferences)

**Accessible from**:
- Mobile: Profile tab → Settings gear
- Web: Header profile menu → Settings

**Sections**:
1. **Notification Categories** - Toggle each category
2. **Business Types** - Toggle each type
3. **My Subscriptions** - List of businesses user follows
4. **Quiet Hours** - Enable/disable + time range
5. **Push Notifications** - Master enable/disable

### Flow 4: Admin/Business Sending Notification

**Current flow works, but add**:
1. Before sending, calculate audience based on:
   - User has `globalEnabled: true`
   - User has relevant category enabled (e.g., `businessTypes.restaurant: true`)
   - User has subscription to this specific business (if business notification)
   - User is not in quiet hours
2. Show estimated audience count before send
3. Enforce quota limits (already exists)
4. Track delivery + engagement (already exists)

---

## Implementation Phases

### Phase 1: Database & API Foundation
1. Add new Prisma models (BusinessNotificationSubscription, PlaceNotificationSubscription)
2. Migrate notificationPreferences to new structure
3. Create API endpoints for subscription management
4. Update notification sending to respect preferences

### Phase 2: Mobile Profile Creation Flow
1. Create onboarding screens
2. Implement notification preference selection
3. Update profile store to track onboarding completion
4. Add "first launch" detection

### Phase 3: Web Profile Settings Page
1. Create `/[locale]/settings` page
2. Build notification preferences UI
3. Build business subscriptions management UI
4. Add quiet hours configuration

### Phase 4: Business/Place Subscription UI
1. Add subscription bell to BusinessCard/PlaceCard components
2. Add subscription toggle to detail pages
3. Show subscription status in notifications list
4. Add "Manage subscriptions" link from notification

### Phase 5: Smart Notification Sending
1. Update `sendNotificationAction` to filter by preferences
2. Add audience estimation before send
3. Add scheduling support (use `scheduledFor` field)
4. Add A/B testing capability (future)

---

## API Endpoints Summary

### Profile & Preferences
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/profile` | Get profile with preferences |
| POST | `/api/profile` | Update profile and preferences |
| POST | `/api/profile/onboarding` | Complete onboarding flow |

### Business Subscriptions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/businesses/[id]/subscription` | Check if subscribed |
| POST | `/api/businesses/[id]/subscribe` | Subscribe to business |
| DELETE | `/api/businesses/[id]/subscribe` | Unsubscribe |
| GET | `/api/subscriptions` | List all user subscriptions |

### Place Subscriptions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/places/[id]/subscription` | Check if subscribed |
| POST | `/api/places/[id]/subscribe` | Subscribe to place |
| DELETE | `/api/places/[id]/subscribe` | Unsubscribe |

### Notifications (existing, enhanced)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/notifications/register-device` | Register push token |
| GET | `/api/notifications/user` | Get user notifications |
| POST | `/api/notifications/[id]/read` | Mark as read |
| GET | `/api/notifications/audience-estimate` | Estimate recipients |

---

## Mobile App Structure

### New Files
```
app/
  onboarding/
    _layout.tsx           # Onboarding stack navigator
    index.tsx             # Welcome screen
    notifications.tsx     # Preference selection
    profile.tsx           # Name/avatar (optional)
    complete.tsx          # Success + redirect

components/
  onboarding/
    CategoryToggle.tsx    # Notification category toggle
    BusinessTypeToggle.tsx # Business type toggle
    ProgressDots.tsx      # Step indicator

  notifications/
    SubscriptionBell.tsx  # Bell icon for subscribe/unsubscribe

hooks/
  useOnboarding.ts        # Track onboarding state
  useSubscription.ts      # Business subscription mutations

stores/
  onboarding.ts           # Zustand store for onboarding state
```

### Updated Files
```
app/_layout.tsx           # Add onboarding check
app/(tabs)/profile.tsx    # Enhanced settings UI
components/places/PlaceCard.tsx    # Add subscription bell
components/events/EventCard.tsx    # Show notification source
services/api.ts           # Add subscription endpoints
```

---

## Web App Structure

### New Files
```
app/[locale]/
  settings/
    page.tsx              # Settings hub
    notifications/
      page.tsx            # Notification preferences
    subscriptions/
      page.tsx            # Manage business subscriptions

  onboarding/
    page.tsx              # First-time user flow (or modal)

app/(components)/
  settings/
    NotificationCategoryToggles.tsx
    BusinessTypeToggles.tsx
    QuietHoursConfig.tsx
    SubscriptionsList.tsx

  notifications/
    SubscriptionBell.tsx
    AudienceEstimate.tsx
```

### Updated Files
```
app/[locale]/admin/notifications/page.tsx  # Add preference filtering
app/(components)/PlaceCard.tsx             # Add subscription bell
lib/notifications/expo-push.ts             # Filter by preferences
```

---

## Notification Type Mapping

| Notification Source | Category | Business Type |
|---------------------|----------|---------------|
| Town Admin broadcast | townAlerts | - |
| Weather warning | weatherAlerts | - |
| Road conditions | weatherAlerts | - |
| Aurora forecast | weatherAlerts | - |
| Emergency alert | emergencyAlerts | - |
| Community event | events | - |
| Hotel promotion | businessAlerts | lodging |
| Restaurant special | businessAlerts | restaurant |
| Tour announcement | businessAlerts | attraction |
| Shop sale | businessAlerts | service |

---

## Testing Checklist

### Profile Creation
- [ ] New user sees onboarding on first launch
- [ ] Can skip optional steps
- [ ] Preferences saved correctly
- [ ] Returning user skips onboarding

### Notification Preferences
- [ ] Toggle category enables/disables all in category
- [ ] Toggle business type enables/disables for that type
- [ ] Master switch disables all
- [ ] Quiet hours block notifications in time range

### Business Subscriptions
- [ ] Can subscribe from business detail page
- [ ] Can unsubscribe from settings
- [ ] Subscription count shows on business card
- [ ] Blocked if business type disabled in preferences

### Notification Sending
- [ ] Audience estimate accurate before send
- [ ] Respects category preferences
- [ ] Respects business type preferences
- [ ] Respects individual subscriptions
- [ ] Respects quiet hours
- [ ] Quota enforced correctly

---

## Success Metrics

1. **Opt-in Rate**: % of users who enable notifications
2. **Category Engagement**: Which categories have highest engagement
3. **Subscription Rate**: Avg subscriptions per user
4. **Unsubscribe Rate**: % who unsubscribe after receiving
5. **Click-Through Rate**: % who tap notification
6. **Quota Utilization**: % of quota used by businesses

---

## Risk Mitigation

1. **Notification Fatigue**: Default to fewer categories ON, let users enable more
2. **Spam Concerns**: Quota limits + unsubscribe from notification
3. **Permission Denial**: Graceful fallback, prompt again later
4. **Data Migration**: Migrate existing preferences to new structure safely
5. **Business Confusion**: Clear quota display + warnings before limit

---

## Next Steps

1. Review and approve this game plan
2. Create Codex prompts for each phase
3. Implement Phase 1 (Database + API)
4. Test with mobile app
5. Implement Phase 2 (Mobile onboarding)
6. Continue through phases

---

*Document created: December 9, 2025*
*Author: Claude Code (5-star software architect mode)*
