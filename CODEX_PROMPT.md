# TownHub Mobile App & CMS Development - AI Assistant Execution Prompt

## Context

You are an AI assistant tasked with converting the TownHub web application into a cross-platform mobile app (starting with Android using React Native/Expo) and building a comprehensive CMS for managing users, content, subscriptions, and push notifications.

**Original Project Location:** `/Users/carlosmaia/townhub`

**Project Overview:**
- **Current State:** Next.js 16 web application with Prisma/PostgreSQL, Supabase Auth
- **Goal:** React Native mobile app + Enhanced CMS with subscription management and push notifications
- **Target Users:** Small towns (up to 15,000 people) and local businesses
- **Business Model:** Subscription-based notification packages for businesses

**Key Documentation:**
- Full technical plan: `MOBILE_APP_PLAN.md`
- Setup instructions: `SETUP.md` and `README.md`
- Current database schema: `database/schema.prisma`

---

## Important Guidelines for Execution

### Performance & Token Optimization

1. **Incremental Development:**
   - Implement features in small, testable chunks
   - Use the TodoWrite tool to track progress
   - Mark tasks as completed immediately after finishing
   - Test each feature before moving to the next

2. **Code Reuse:**
   - Analyze existing code in `/Users/carlosmaia/townhub` before writing new code
   - Reuse TypeScript types, utilities, and business logic
   - Share constants and configurations between web and mobile
   - Extract common code into `packages/shared` if using monorepo

3. **Token-Efficient Practices:**
   - Read only the files you need when you need them
   - Use Glob/Grep to find specific code patterns instead of reading entire directories
   - Reference existing patterns rather than recreating from scratch
   - Use the Task tool for exploratory work to reduce context usage

4. **Optimal Coding Performance:**
   - Leverage existing libraries (don't reinvent the wheel)
   - Follow React Native best practices for performance
   - Implement proper memoization and lazy loading
   - Use proper TypeScript types (leverage existing ones)

---

## Project Structure Decision

Before starting, decide on the project structure:

### Option A: Monorepo (Recommended for Long-term)
```
townhub-monorepo/
├── packages/
│   ├── mobile/        # New React Native app
│   ├── web/           # Existing Next.js (moved)
│   ├── cms/           # Enhanced CMS
│   ├── api/           # Backend API (optional)
│   └── shared/        # Shared code
```

### Option B: Separate Projects (Simpler to Start)
```
/Users/carlosmaia/
├── townhub/           # Existing web + Enhanced CMS
└── townhub-mobile/    # New React Native app
```

**Recommendation:** Start with Option B for faster initial development, migrate to Option A later if needed.

---

## Phase-by-Phase Execution Guide

## PHASE 1: Foundation & Setup

### Objective
Set up the mobile project structure and extend the database schema for new features.

### Tasks Checklist

#### 1.1 Create Mobile Project
```bash
# Navigate to parent directory
cd /Users/carlosmaia

# Create new React Native project with Expo
npx create-expo-app townhub-mobile --template blank-typescript

# Navigate into the project
cd townhub-mobile

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install expo-router react-native-safe-area-context react-native-screens
npm install @tanstack/react-query axios zustand
npm install react-hook-form zod
npm install expo-notifications expo-device expo-constants
npm install @react-native-async-storage/async-storage
npm install react-native-maps
npx expo install expo-location expo-image
```

#### 1.2 Set Up Project Structure
Create the following directory structure:
```
townhub-mobile/
├── app/                    # Expo Router
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home
│   │   ├── places.tsx
│   │   ├── events.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── place/
│   │   └── [id].tsx
│   ├── event/
│   │   └── [id].tsx
│   └── _layout.tsx
├── components/
│   ├── ui/
│   ├── places/
│   ├── events/
│   └── common/
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── notifications.ts
├── stores/
│   └── auth.ts
├── types/
│   └── index.ts
├── utils/
│   └── constants.ts
├── hooks/
│   └── useAuth.ts
└── app.json
```

#### 1.3 Extend Database Schema

**Location:** `/Users/carlosmaia/townhub/database/schema.prisma`

Add the following models (read MOBILE_APP_PLAN.md for full schema):

```prisma
model Business {
  id                String   @id @default(cuid())
  name              String
  userId            String
  user              Profile  @relation(fields: [userId], references: [id])
  placeId           String?  @unique
  place             Place?   @relation(fields: [placeId], references: [id])
  subscriptionId    String?
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id])
  notificationQuota Int      @default(0)
  quotaUsed         Int      @default(0)
  quotaResetAt      DateTime
  status            String   @default("pending") // pending, approved, suspended
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Subscription {
  id                String   @id @default(cuid())
  name              String
  price             Float
  currency          String   @default("USD")
  billingPeriod     String   // monthly, yearly
  notificationLimit Int
  features          Json
  isActive          Boolean  @default(true)
  businesses        Business[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Payment {
  id            String   @id @default(cuid())
  businessId    String
  amount        Float
  currency      String
  status        String
  stripeId      String?  @unique
  invoiceUrl    String?
  metadata      Json?
  createdAt     DateTime @default(now())
}

model Notification {
  id            String   @id @default(cuid())
  title         String
  body          String
  imageUrl      String?
  data          Json?
  type          String
  senderId      String
  sender        Profile  @relation(fields: [senderId], references: [id])
  targetType    String
  targetFilter  Json?
  scheduledFor  DateTime?
  sentAt        DateTime?
  status        String   @default("draft")
  deliveryCount Int      @default(0)
  clickCount    Int      @default(0)
  createdAt     DateTime @default(now())
  deliveries    NotificationDelivery[]
}

model NotificationDelivery {
  id             String   @id @default(cuid())
  notificationId String
  notification   Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  userId         String
  user           Profile  @relation(fields: [userId], references: [id])
  deviceToken    String
  status         String
  sentAt         DateTime?
  deliveredAt    DateTime?
  clickedAt      DateTime?
  error          String?
  createdAt      DateTime @default(now())
}

model DeviceToken {
  id        String   @id @default(cuid())
  userId    String
  user      Profile  @relation(fields: [userId], references: [id])
  token     String   @unique
  platform  String
  isActive  Boolean  @default(true)
  lastUsedAt DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Also update the `Profile` model to add relations:
```prisma
model Profile {
  // ... existing fields ...
  business              Business?
  notifications         Notification[]
  notificationDeliveries NotificationDelivery[]
  deviceTokens          DeviceToken[]
  notificationPreferences Json? @default("{\"events\": true, \"promos\": true, \"townNews\": true}")
}
```

Update the `Place` model to add business relation:
```prisma
model Place {
  // ... existing fields ...
  business Business?
}
```

#### 1.4 Apply Database Migrations

```bash
cd /Users/carlosmaia/townhub
npm run db:push
```

#### 1.5 Create Shared Types

**File:** `/Users/carlosmaia/townhub-mobile/types/index.ts`

```typescript
// Copy types from the web app and extend them
export interface Place {
  id: string;
  name: string;
  type: 'TOWN_SERVICE' | 'LODGING' | 'RESTAURANT' | 'ATTRACTION';
  description: string;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number | null;
  rating?: number | null;
  ratingCount?: number | null;
  imageUrl?: string | null;
  tags: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  location?: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName?: string | null;
  avatarUrl?: string | null;
  role: string;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  type: string;
  createdAt: string;
  clickedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Completion Criteria
- ✅ Mobile project created and dependencies installed
- ✅ Project structure set up
- ✅ Database schema extended with new models
- ✅ Database migration successful
- ✅ Shared types created
- ✅ App runs on Android emulator (`npx expo start`)

---

## PHASE 2: Mobile App Core Features

### Objective
Build essential mobile app screens and functionality to display places, events, and weather.

### Tasks Checklist

#### 2.1 Set Up API Client

**File:** `/Users/carlosmaia/townhub-mobile/services/api.ts`

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// API Methods
export const placesApi = {
  getAll: (params?: { type?: string; tags?: string[] }) =>
    api.get('/api/places', { params }),
  getById: (id: string) => api.get(`/api/places/${id}`),
  getNearby: (lat: number, lng: number, radius = 50) =>
    api.get('/api/places/nearby', { params: { lat, lng, radius } }),
};

export const eventsApi = {
  getAll: () => api.get('/api/events'),
  getById: (id: string) => api.get(`/api/events/${id}`),
  getUpcoming: () => api.get('/api/events/upcoming'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string }) =>
    api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};
```

#### 2.2 Create API Endpoints in Web App

**Location:** `/Users/carlosmaia/townhub/app/api/`

Create the following API routes:

**File:** `app/api/places/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const tags = searchParams.get('tags')?.split(',');

    const places = await prisma.place.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(tags && { tags: { hasSome: tags } }),
      },
      orderBy: [
        { rating: { sort: 'desc', nulls: 'last' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: places,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch places' },
      },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/places/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const place = await prisma.place.findUnique({
      where: { id },
    });

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Place not found' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch place' },
      },
      { status: 500 }
    );
  }
}
```

**File:** `app/api/events/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startsAt: { sort: 'asc', nulls: 'last' } },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch events' },
      },
      { status: 500 }
    );
  }
}
```

#### 2.3 Set Up React Query

**File:** `/Users/carlosmaia/townhub-mobile/app/_layout.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
```

#### 2.4 Build Home Screen

**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/index.tsx`

Implement:
- Weather widget (reuse weather API from web app)
- Quick links to places/events
- Recent events carousel
- Town information section

#### 2.5 Build Places Screen

**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/places.tsx`

Implement:
- List view of places with images
- Category filter (Services, Lodging, Restaurants, Attractions)
- Search functionality
- Pull-to-refresh
- Infinite scroll or pagination

#### 2.6 Build Events Screen

**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/events.tsx`

Implement:
- List of upcoming events
- Event cards with images
- Date/time display
- Pull-to-refresh

#### 2.7 Build Detail Screens

**Files:**
- `/Users/carlosmaia/townhub-mobile/app/place/[id].tsx`
- `/Users/carlosmaia/townhub-mobile/app/event/[id].tsx`

Implement full details with:
- Images
- Description
- Contact info (for places)
- Map location
- Call/directions buttons

### Completion Criteria
- ✅ API routes created and tested
- ✅ API client configured with interceptors
- ✅ React Query set up
- ✅ Home screen displays weather and quick links
- ✅ Places screen shows all places with filtering
- ✅ Events screen shows upcoming events
- ✅ Detail screens show complete information
- ✅ Pull-to-refresh works on list screens

---

## PHASE 3: Push Notifications

### Objective
Implement end-to-end push notification system.

### Tasks Checklist

#### 3.1 Set Up Expo Notifications

**File:** `/Users/carlosmaia/townhub-mobile/services/notifications.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Register token with backend
  await api.post('/api/users/device-token', {
    token,
    platform: Platform.OS,
  });

  return token;
}
```

#### 3.2 Create Backend Notification Service

**File:** `/Users/carlosmaia/townhub/lib/notifications/push-service.ts`

```typescript
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../db';

const expo = new Expo();

export async function sendPushNotification(
  notificationId: string
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      deliveries: {
        where: { status: 'pending' },
      },
    },
  });

  if (!notification) throw new Error('Notification not found');

  const messages: ExpoPushMessage[] = notification.deliveries.map((delivery) => ({
    to: delivery.deviceToken,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data as any,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending notification chunk:', error);
    }
  }

  // Update delivery statuses
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });

  return tickets;
}
```

#### 3.3 Create Notification API Endpoints

Create these API routes in `/Users/carlosmaia/townhub/app/api/notifications/`:
- `route.ts` (GET all, POST create)
- `[id]/route.ts` (GET single, PUT update, DELETE)
- `[id]/send/route.ts` (POST to send)

#### 3.4 Handle Notifications in Mobile App

**File:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/notifications.tsx`

Implement:
- Notification list
- Mark as read
- Notification preferences
- Deep linking to content

### Completion Criteria
- ✅ Push notifications register on app launch
- ✅ Backend can send notifications
- ✅ Mobile app receives and displays notifications
- ✅ Notification preferences work
- ✅ Deep linking works (clicking notification navigates to content)

---

## PHASE 4: CMS Enhancement

### Objective
Build comprehensive CMS for managing the entire system.

### Tasks Checklist

#### 4.1 Create CMS Dashboard

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/dashboard/page.tsx`

Implement:
- Statistics cards (users, businesses, notifications sent)
- Recent activity feed
- Quick actions
- Charts (using recharts)

#### 4.2 Build User Management

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/users/page.tsx`

Implement:
- User list with search and filters
- Role management
- User detail view
- Suspend/activate users

#### 4.3 Build Business Management

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/businesses/page.tsx`

Implement:
- Business registration approval workflow
- Business list with filters
- Subscription assignment
- Quota management

#### 4.4 Build Notification Center

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/notifications/page.tsx`

Implement:
- Create notification form
- Audience targeting (all users, by location, by preferences)
- Schedule for later
- Notification templates
- Preview
- Analytics view (delivery rate, click rate)

#### 4.5 Build Media Library

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/media/page.tsx`

Implement:
- Drag-and-drop upload (react-dropzone)
- Image grid view
- Search and filter
- Delete/manage images
- Integration with Supabase Storage

#### 4.6 Build Subscription Management

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/subscriptions/page.tsx`

Implement:
- Create/edit subscription packages
- Pricing tiers
- Feature toggles
- Package comparison view

### Completion Criteria
- ✅ Dashboard shows accurate statistics
- ✅ Admins can manage users and assign roles
- ✅ Business approval workflow works
- ✅ Notification creation and scheduling works
- ✅ Media library functional with upload
- ✅ Subscription packages can be created

---

## PHASE 5: Payment Integration

### Objective
Implement Stripe integration for subscription billing.

### Tasks Checklist

#### 5.1 Set Up Stripe

```bash
cd /Users/carlosmaia/townhub
npm install stripe @stripe/stripe-js
```

**Environment Variables:** Add to `.env.local`
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 5.2 Create Stripe Service

**File:** `/Users/carlosmaia/townhub/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function createCheckoutSession(
  businessId: string,
  priceId: string,
  customerId?: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/admin/business/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/admin/business/subscriptions`,
    metadata: {
      businessId,
    },
  });

  return session;
}
```

#### 5.3 Create Checkout API

**File:** `/Users/carlosmaia/townhub/app/api/subscriptions/checkout/route.ts`

Implement:
- Create Stripe checkout session
- Handle success/cancel redirects
- Create subscription record in database

#### 5.4 Create Webhook Handler

**File:** `/Users/carlosmaia/townhub/app/api/webhooks/stripe/route.ts`

Handle events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

#### 5.5 Build Checkout Flow

**File:** `/Users/carlosmaia/townhub/app/[locale]/business/subscribe/page.tsx`

Implement:
- Package selection
- Stripe checkout redirect
- Success/cancel handling

### Completion Criteria
- ✅ Stripe integration works in test mode
- ✅ Businesses can subscribe to packages
- ✅ Webhooks update database correctly
- ✅ Subscription status reflects in CMS
- ✅ Quota enforcement works based on subscription

---

## PHASE 6: Advanced Features & Polish

### Objective
Add advanced notification features, optimize performance, and polish UX.

### Tasks Checklist

#### 6.1 Implement Notification Segmentation
- User location-based targeting
- Preference-based targeting
- Custom audience builder

#### 6.2 Add Notification Scheduling
- Schedule for specific date/time
- Recurring notifications
- Timezone handling

#### 6.3 Build Analytics
- Notification delivery metrics
- User engagement metrics
- Revenue reports
- Export to CSV

#### 6.4 Optimize Mobile App
- Implement offline support
- Add image caching
- Optimize bundle size
- Add loading skeletons

#### 6.5 Add Error Tracking
```bash
cd /Users/carlosmaia/townhub-mobile
npm install @sentry/react-native
npx @sentry/wizard@latest -i reactNative
```

#### 6.6 Write Tests
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows

### Completion Criteria
- ✅ Advanced notification features work
- ✅ Analytics provide useful insights
- ✅ App performs well with large datasets
- ✅ Error tracking configured
- ✅ Critical paths have test coverage

---

## PHASE 7: Deployment

### Objective
Deploy to production and submit to Google Play Store.

### Tasks Checklist

#### 7.1 Configure for Production

**File:** `/Users/carlosmaia/townhub-mobile/app.json`

Update:
```json
{
  "expo": {
    "name": "TownHub",
    "slug": "townhub",
    "version": "1.0.0",
    "android": {
      "package": "com.townhub.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      },
      "permissions": [
        "NOTIFICATIONS",
        "ACCESS_FINE_LOCATION",
        "INTERNET"
      ]
    }
  }
}
```

#### 7.2 Build Android App

```bash
cd /Users/carlosmaia/townhub-mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android
```

#### 7.3 Submit to Google Play

```bash
eas submit --platform android
```

#### 7.4 Deploy Web App & CMS

Deploy to Vercel, Netlify, or your hosting provider.

#### 7.5 Set Up Monitoring

- Configure Sentry for error tracking
- Set up uptime monitoring
- Configure analytics

### Completion Criteria
- ✅ Android app built successfully
- ✅ App submitted to Google Play Store
- ✅ Web app deployed to production
- ✅ Monitoring and alerts configured
- ✅ Documentation updated

---

## Execution Best Practices

### Before Starting Each Phase

1. **Read the relevant documentation:**
   - `MOBILE_APP_PLAN.md` for detailed technical specs
   - Current code in `/Users/carlosmaia/townhub` for patterns to follow

2. **Create a task list:**
   - Use TodoWrite to create tasks for the phase
   - Break down complex tasks into smaller subtasks

3. **Analyze existing code:**
   - Use Grep to find similar patterns
   - Read relevant files to understand current implementation
   - Reuse existing utilities and types

### During Implementation

1. **Incremental development:**
   - Implement one feature at a time
   - Test immediately after implementation
   - Mark task as completed before moving on

2. **Code reuse:**
   - Copy and adapt existing components
   - Share types between web and mobile
   - Use existing API patterns

3. **Error handling:**
   - Add proper try-catch blocks
   - Display user-friendly error messages
   - Log errors for debugging

4. **Testing:**
   - Test on Android emulator frequently
   - Test API endpoints with curl or Postman
   - Verify database changes with Prisma Studio

### After Each Phase

1. **Verify completion criteria:**
   - Check off all items in the checklist
   - Test all features work as expected
   - Document any issues or limitations

2. **Commit changes:**
   - Create meaningful commit messages
   - Reference the phase and features implemented

3. **Update documentation:**
   - Update README if needed
   - Document any configuration changes
   - Note any deviations from the plan

---

## Key Reference Files

While executing, refer to these files frequently:

1. **Project Structure:**
   - `/Users/carlosmaia/townhub/` - Current web app
   - `/Users/carlosmaia/townhub/database/schema.prisma` - Database schema
   - `/Users/carlosmaia/townhub/package.json` - Dependencies

2. **Existing Patterns:**
   - `/Users/carlosmaia/townhub/app/[locale]/page.tsx` - Server components pattern
   - `/Users/carlosmaia/townhub/lib/` - Utility functions
   - `/Users/carlosmaia/townhub/components/` - UI components

3. **Configuration:**
   - `/Users/carlosmaia/townhub/.env.example` - Environment variables
   - `/Users/carlosmaia/townhub/app/api/` - API route patterns

---

## Success Metrics

Track these metrics to measure success:

### Technical Metrics
- [ ] App bundle size < 50MB
- [ ] API response time < 200ms (p95)
- [ ] App crash rate < 0.1%
- [ ] Push notification delivery > 95%

### Functional Metrics
- [ ] All core features working
- [ ] CMS fully functional
- [ ] Payment processing works
- [ ] Notifications delivered reliably

### User Experience Metrics
- [ ] App loads in < 3 seconds
- [ ] Smooth scrolling and animations
- [ ] Intuitive navigation
- [ ] Clear error messages

---

## Common Issues & Solutions

### Issue: API Connection Fails
**Solution:** Check that:
- Web app is running on `localhost:3000`
- `apiUrl` in `app.json` extra config points to correct URL
- For Android emulator, use `http://10.0.2.2:3000` instead of `localhost`

### Issue: Prisma Client Out of Sync
**Solution:**
```bash
cd /Users/carlosmaia/townhub
npx prisma generate
npm run db:push
```

### Issue: Expo Push Notifications Not Working
**Solution:**
- Use physical device (not emulator) for testing
- Check notification permissions granted
- Verify Expo push token registered in database

### Issue: Build Fails
**Solution:**
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

---

## Final Checklist

Before considering the project complete:

- [ ] All phases completed
- [ ] Mobile app runs on Android
- [ ] CMS fully functional
- [ ] Push notifications working
- [ ] Payment integration tested
- [ ] Database properly seeded
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Error tracking configured
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] App submitted to Play Store
- [ ] Production deployment successful

---

## Getting Started

To begin execution:

1. **Review all documentation:**
   ```bash
   cd /Users/carlosmaia/townhub
   # Read: MOBILE_APP_PLAN.md, SETUP.md, README.md
   ```

2. **Start with Phase 1:**
   - Create TodoWrite task list for Phase 1
   - Follow Phase 1 checklist step by step
   - Test thoroughly before moving to Phase 2

3. **Maintain communication:**
   - Report completion of each phase
   - Highlight any blockers or issues
   - Suggest improvements as you discover them

Good luck with the implementation!
