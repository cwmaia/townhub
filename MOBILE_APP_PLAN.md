# TownHub Mobile App & CMS Development Plan

## Executive Summary

This document outlines the comprehensive plan to convert the TownHub web application into a cross-platform mobile application (starting with Android) with a full-featured Content Management System (CMS) for managing users, content, subscriptions, and push notifications.

**Current State:** Next.js web application prototype
**Target State:** React Native mobile app + Enhanced web-based CMS
**Primary Goal:** Enable small towns (up to 15,000 people) to provide local information and allow businesses to send targeted notifications based on subscription packages

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Technology Stack Recommendations](#technology-stack-recommendations)
3. [Project Structure](#project-structure)
4. [Mobile App Architecture](#mobile-app-architecture)
5. [CMS Architecture](#cms-architecture)
6. [Notification System](#notification-system)
7. [Subscription & Package Management](#subscription--package-management)
8. [Implementation Phases](#implementation-phases)
9. [API Design](#api-design)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)

---

## Current Architecture Analysis

### Existing Web App Stack

**Location:** `/Users/carlosmaia/townhub`

**Technology Stack:**
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Database:** Prisma ORM with PostgreSQL
- **Authentication:** Supabase Auth (magic links)
- **Internationalization:** next-intl (English + Icelandic)
- **External APIs:**
  - Google Maps (Static API, Distance Matrix)
  - Open-Meteo (weather)
  - Aurora forecast
  - Image APIs (Pexels, Unsplash, Google Custom Search)

### Current Features

1. **User-Facing:**
   - Town information display
   - Weather forecast with aurora predictions
   - Places categorization (Services, Lodging, Restaurants, Attractions)
   - Events listing
   - Interactive maps
   - Travel time estimates to destinations
   - Bilingual support (EN/IS)

2. **Admin Features:**
   - Basic admin panel (`/admin`)
   - Role-based access (admin/user)
   - Content management for places and events

3. **Database Schema:**
   - `Place` model (with type enum, location, ratings, images)
   - `Event` model (with schedules, locations)
   - `Profile` model (user profiles with roles)

### What's Missing for Mobile + CMS

1. Push notification infrastructure
2. Subscription/package management
3. Business user tiers and permissions
4. Advanced CMS for content management
5. Mobile-optimized API endpoints
6. Image upload and management system
7. Analytics and reporting
8. Payment processing
9. Notification scheduling and targeting

---

## Technology Stack Recommendations

### Mobile App: React Native (Expo)

**Why React Native:**
- ✅ Shares TypeScript codebase with existing web app
- ✅ 85%+ code reuse between iOS and Android
- ✅ Expo provides easy push notifications
- ✅ Fast development with hot reload
- ✅ Strong community and library ecosystem
- ✅ Can reuse existing UI component logic
- ✅ React Navigation for native-like navigation
- ✅ Expo Application Services (EAS) for building

**Alternative Considered:** Flutter
- ❌ Requires Dart (new language)
- ❌ No code sharing with existing TypeScript
- ✅ Slightly better performance
- ✅ Better UI consistency

**Verdict:** React Native with Expo for maximum code reuse and faster development

### Backend Enhancement Stack

**API Layer:**
- **Option 1:** Keep Next.js API routes + enhance
- **Option 2:** Separate NestJS backend (recommended)
  - Better separation of concerns
  - Dedicated mobile API endpoints
  - Easier to scale
  - Better WebSocket support for real-time features
  - Comprehensive documentation with Swagger

**Push Notifications:**
- **Expo Push Notifications** (for React Native)
- **Firebase Cloud Messaging (FCM)** as fallback
- **OneSignal** for advanced segmentation (optional)

**File Storage:**
- **Supabase Storage** (already integrated)
- **AWS S3** or **Cloudinary** for advanced image processing

**Payment Processing:**
- **Stripe** (recommended for subscriptions)
- **PayPal** (alternative/additional)

### CMS Stack

**Framework:** Next.js (extend existing admin)
**Components:**
- Enhanced admin dashboard
- Rich text editor (TipTap or Slate)
- Image upload with drag-drop (react-dropzone)
- Data tables (TanStack Table)
- Charts (Recharts or Chart.js)
- Calendar for event scheduling (react-big-calendar)

---

## Project Structure

### Recommended Monorepo Structure

```
townhub-monorepo/
├── packages/
│   ├── mobile/                    # React Native app (NEW)
│   │   ├── app/                   # Expo Router
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/              # API clients
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── web/                       # Next.js web app (EXISTING - MOVED)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   ├── cms/                       # Enhanced CMS (NEW)
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── businesses/
│   │   │   │   │   ├── content/
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   ├── notifications/
│   │   │   │   │   └── analytics/
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── api/                       # Backend API (NEW)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── places/
│   │   │   │   ├── events/
│   │   │   │   ├── notifications/
│   │   │   │   ├── subscriptions/
│   │   │   │   └── analytics/
│   │   │   ├── common/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── shared/                    # Shared code (NEW)
│       ├── types/                 # TypeScript types
│       ├── utils/                 # Shared utilities
│       ├── constants/             # App constants
│       └── package.json
│
├── database/                      # Database (EXISTING)
│   ├── schema.prisma
│   └── seed/
│
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo config
└── README.md
```

**Alternative: Keep Simple Structure**

If monorepo is too complex initially, create separate projects:

```
/Users/carlosmaia/
├── townhub/                       # Existing web app + CMS
└── townhub-mobile/                # New React Native app
```

---

## Mobile App Architecture

### Core Features Required

1. **Authentication**
   - Email/password login
   - Social login (Google, Apple)
   - Biometric authentication (Face ID, fingerprint)
   - Session management

2. **Home Screen**
   - Town overview
   - Weather widget
   - Quick access to places/events
   - Notification center badge

3. **Places**
   - List view with filters (Services, Lodging, Restaurants, Attractions)
   - Search functionality
   - Detail view with photos, ratings, contact info
   - Map view
   - Call/directions integration

4. **Events**
   - Calendar view
   - List view
   - Event details
   - Add to device calendar
   - Set reminders

5. **Notifications**
   - Push notification handling
   - Notification history
   - Notification preferences
   - In-app notification center

6. **User Profile**
   - Profile editing
   - Notification preferences
   - Subscription status (for businesses)
   - Settings

7. **Business Dashboard (within app)**
   - View subscription status
   - Quick stats
   - Send notification (based on package)
   - Manage business profile

### React Native Tech Stack

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "@react-native-async-storage/async-storage": "1.23.0",
    "expo-notifications": "~0.28.0",
    "expo-location": "~17.0.0",
    "react-native-maps": "1.14.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^4.1.0"
  }
}
```

### State Management

**Approach:** Zustand + React Query
- **Zustand:** Local state (auth, user preferences)
- **React Query:** Server state (API data, caching)

### Navigation Structure

```
App
├── (tabs)
│   ├── index (Home)
│   ├── places
│   ├── events
│   ├── notifications
│   └── profile
├── place/[id]
├── event/[id]
├── auth
│   ├── login
│   └── register
└── business
    ├── dashboard
    └── send-notification
```

---

## CMS Architecture

### CMS User Roles & Permissions

1. **Super Admin**
   - Full system access
   - Manage all towns
   - Configure system settings
   - View all analytics

2. **Town Admin**
   - Manage town content
   - Approve/reject business registrations
   - Send town notifications
   - View town analytics
   - Manage users within town

3. **Business Owner**
   - Manage own business profile
   - Upload images
   - Send notifications (based on package)
   - View own analytics
   - Manage subscription

4. **Content Manager**
   - Create/edit events
   - Moderate content
   - Upload media
   - No user management

### CMS Modules

#### 1. Dashboard
- Overview statistics
- Recent activity
- Quick actions
- Pending approvals

#### 2. User Management
- User list with filters
- User details and activity
- Role assignment
- User suspension/activation
- Bulk actions

#### 3. Business Management
- Business registration approvals
- Business profile editing
- Package assignment
- Notification quota management
- Business analytics

#### 4. Content Management
**Places:**
- CRUD operations
- Bulk import/export
- Image gallery management
- Category management
- Tag management
- Location picker

**Events:**
- Calendar view
- Drag-to-reschedule
- Recurring events
- Featured events
- Event templates

#### 5. Subscription Management
- Package creation/editing
- Pricing tiers
- Feature toggles per package
- Subscription analytics
- Payment history
- Invoice generation

#### 6. Notification Center
- Create notification
- Target audience selection
- Schedule notifications
- Notification templates
- A/B testing
- Delivery analytics
- Notification history

#### 7. Media Library
- Upload interface (drag-drop)
- Image optimization
- Bulk upload
- Folder organization
- Search and filter
- Usage tracking

#### 8. Analytics & Reporting
- User engagement metrics
- Notification performance
- Popular places/events
- Revenue reports
- Custom date ranges
- Export to CSV/PDF

#### 9. Settings
- Town configuration
- Localization settings
- API key management
- Email templates
- System preferences

---

## Notification System

### Architecture

```
┌──────────────┐
│   CMS        │
│   (Create    │
│   Schedule)  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   Backend API    │
│   - Validate     │
│   - Queue        │
│   - Target       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Queue System   │
│   (Bull/Redis)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Notification   │
│   Service        │
│   - FCM/APNS     │
│   - Expo Push    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Mobile App     │
│   - Receive      │
│   - Display      │
│   - Track        │
└──────────────────┘
```

### Database Schema Additions

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
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Subscription {
  id                String   @id @default(cuid())
  name              String   // Basic, Pro, Premium
  price             Float
  currency          String   @default("USD")
  billingPeriod     String   // monthly, yearly
  notificationLimit Int
  features          Json     // Array of feature flags
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
  status        String   // pending, completed, failed, refunded
  stripeId      String?  @unique
  invoiceUrl    String?
  createdAt     DateTime @default(now())
}

model Notification {
  id            String   @id @default(cuid())
  title         String
  body          String
  imageUrl      String?
  type          String   // town_event, business_promo, system
  senderId      String   // Profile ID
  sender        Profile  @relation(fields: [senderId], references: [id])
  targetType    String   // all, segments, specific_users
  targetFilter  Json?    // Audience filters
  scheduledFor  DateTime?
  sentAt        DateTime?
  status        String   // draft, scheduled, sending, sent, failed
  deliveryCount Int      @default(0)
  clickCount    Int      @default(0)
  createdAt     DateTime @default(now())
  deliveries    NotificationDelivery[]
}

model NotificationDelivery {
  id             String   @id @default(cuid())
  notificationId String
  notification   Notification @relation(fields: [notificationId], references: [id])
  userId         String
  user           Profile  @relation(fields: [userId], references: [id])
  deviceToken    String
  status         String   // sent, delivered, failed, clicked
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
  platform  String   // ios, android
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Update Profile model
model Profile {
  // ... existing fields ...
  business              Business?
  notifications         Notification[]
  notificationDeliveries NotificationDelivery[]
  deviceTokens          DeviceToken[]
  notificationPreferences Json? // { events: true, promos: true, etc. }
}
```

### Notification Packages

| Feature | Basic | Pro | Premium | Town |
|---------|-------|-----|---------|------|
| Monthly Cost | $29 | $79 | $199 | Custom |
| Notifications/Month | 50 | 200 | 1000 | Unlimited |
| Targeted Segments | ❌ | ✅ | ✅ | ✅ |
| A/B Testing | ❌ | ❌ | ✅ | ✅ |
| Rich Media | ❌ | ✅ | ✅ | ✅ |
| Analytics | Basic | Advanced | Advanced | Premium |
| Priority Support | ❌ | ✅ | ✅ | ✅ |
| Scheduled Sends | 1/day | 5/day | Unlimited | Unlimited |

---

## Subscription & Package Management

### User Flow

1. **Business Registration:**
   - Business owner signs up
   - Fills business profile
   - Selects subscription package
   - Enters payment details (Stripe)
   - Admin approval (optional)
   - Account activated

2. **Subscription Management:**
   - View current plan
   - Upgrade/downgrade
   - Update payment method
   - View usage (notifications sent)
   - View invoices
   - Cancel subscription

3. **Notification Sending:**
   - Check quota
   - Create notification
   - Preview
   - Select audience
   - Schedule or send immediately
   - Track delivery

### Stripe Integration

```typescript
// Subscription creation flow
interface CreateSubscription {
  businessId: string;
  planId: string;
  paymentMethodId: string;
}

// Webhook handling
webhookEvents = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up project structure and core infrastructure

**Tasks:**
1. ✅ Set up monorepo (or separate mobile project)
2. ✅ Initialize React Native with Expo
3. ✅ Set up development environment
4. ✅ Configure Supabase for mobile
5. ✅ Create shared TypeScript types
6. ✅ Set up CI/CD pipeline (EAS Build)
7. ✅ Extend Prisma schema for notifications/subscriptions
8. ✅ Run database migrations

**Deliverables:**
- Project structure set up
- Mobile app runs on Android emulator
- Database schema updated
- Development environment documented

### Phase 2: Mobile App - Core Features (Weeks 3-5)

**Goal:** Build essential mobile app functionality

**Tasks:**
1. ✅ Implement authentication (login/register)
2. ✅ Create navigation structure
3. ✅ Build home screen with weather widget
4. ✅ Implement places listing and detail screens
5. ✅ Implement events listing and detail screens
6. ✅ Add map integration
7. ✅ Set up API client with React Query
8. ✅ Implement pull-to-refresh
9. ✅ Add loading states and error handling
10. ✅ Create user profile screen

**Deliverables:**
- Functional mobile app with core features
- User can browse places and events
- Authentication working
- API integration complete

### Phase 3: Push Notifications (Weeks 6-7)

**Goal:** Implement push notification infrastructure

**Tasks:**
1. ✅ Set up Expo Push Notifications
2. ✅ Create device token registration
3. ✅ Build notification service in backend
4. ✅ Implement notification queue (Bull + Redis)
5. ✅ Create notification handler in mobile app
6. ✅ Add notification preferences UI
7. ✅ Test notification delivery
8. ✅ Implement notification analytics tracking

**Deliverables:**
- Push notifications working end-to-end
- Users can manage notification preferences
- Basic notification tracking in place

### Phase 4: CMS Enhancement (Weeks 8-10)

**Goal:** Build comprehensive CMS for content and business management

**Tasks:**
1. ✅ Create enhanced admin dashboard
2. ✅ Build user management module
3. ✅ Build business management module
4. ✅ Create subscription management UI
5. ✅ Build notification center in CMS
6. ✅ Implement media library with upload
7. ✅ Add rich text editor for events
8. ✅ Create analytics dashboard
9. ✅ Build approval workflow for businesses
10. ✅ Add bulk operations

**Deliverables:**
- Fully functional CMS
- Admins can manage all aspects of the system
- Business owners can manage their profiles
- Notification creation interface ready

### Phase 5: Subscription & Payment (Weeks 11-12)

**Goal:** Implement subscription management and payment processing

**Tasks:**
1. ✅ Integrate Stripe
2. ✅ Create subscription packages
3. ✅ Build checkout flow
4. ✅ Implement webhook handlers
5. ✅ Add invoice generation
6. ✅ Create billing portal
7. ✅ Implement quota tracking
8. ✅ Add upgrade/downgrade flows
9. ✅ Build payment history view
10. ✅ Test payment scenarios

**Deliverables:**
- Payment processing functional
- Subscription management working
- Quota enforcement in place
- Billing automated

### Phase 6: Advanced Notification Features (Weeks 13-14)

**Goal:** Add advanced notification capabilities

**Tasks:**
1. ✅ Implement audience segmentation
2. ✅ Add notification scheduling
3. ✅ Create notification templates
4. ✅ Build A/B testing framework
5. ✅ Add rich media support
6. ✅ Implement deep linking
7. ✅ Create notification analytics
8. ✅ Add delivery reports
9. ✅ Implement retry logic
10. ✅ Build notification preview

**Deliverables:**
- Advanced notification features working
- Segmentation and scheduling functional
- Analytics showing delivery metrics

### Phase 7: Polish & Testing (Weeks 15-16)

**Goal:** Refinement, testing, and optimization

**Tasks:**
1. ✅ Performance optimization
2. ✅ Implement offline support
3. ✅ Add error tracking (Sentry)
4. ✅ Write automated tests
5. ✅ Conduct security audit
6. ✅ UI/UX refinements
7. ✅ Accessibility improvements
8. ✅ Documentation
9. ✅ Beta testing
10. ✅ Bug fixes

**Deliverables:**
- Production-ready mobile app
- Comprehensive test coverage
- Documentation complete
- Ready for app store submission

### Phase 8: Deployment (Week 17)

**Goal:** Launch to production

**Tasks:**
1. ✅ Submit to Google Play Store
2. ✅ Set up production environment
3. ✅ Configure monitoring and alerts
4. ✅ Create onboarding materials
5. ✅ Launch marketing page
6. ✅ Conduct final testing
7. ✅ Go live
8. ✅ Monitor initial usage

**Deliverables:**
- App live on Google Play Store
- Production environment stable
- Monitoring in place

---

## API Design

### Core Endpoints

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

#### Users
```
GET    /api/users/profile
PUT    /api/users/profile
PATCH  /api/users/preferences
POST   /api/users/device-token
DELETE /api/users/device-token/:token
```

#### Places
```
GET    /api/places
GET    /api/places/:id
POST   /api/places              // Admin/Business only
PUT    /api/places/:id
DELETE /api/places/:id
GET    /api/places/tags
GET    /api/places/nearby?lat=X&lng=Y
```

#### Events
```
GET    /api/events
GET    /api/events/:id
POST   /api/events              // Admin only
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/upcoming
```

#### Notifications
```
GET    /api/notifications
GET    /api/notifications/:id
POST   /api/notifications       // Admin/Business only
PUT    /api/notifications/:id
DELETE /api/notifications/:id
POST   /api/notifications/:id/send
GET    /api/notifications/:id/analytics
PATCH  /api/notifications/:id/status
```

#### Subscriptions
```
GET    /api/subscriptions
GET    /api/subscriptions/:id
POST   /api/subscriptions/checkout
POST   /api/subscriptions/cancel
POST   /api/subscriptions/upgrade
GET    /api/subscriptions/invoices
POST   /api/webhooks/stripe     // Stripe webhooks
```

#### Business
```
GET    /api/business/profile
PUT    /api/business/profile
GET    /api/business/analytics
GET    /api/business/quota
```

#### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/role
GET    /api/admin/businesses
PATCH  /api/admin/businesses/:id/approve
GET    /api/admin/analytics
```

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

---

## Performance Optimization

### Mobile App

1. **Image Optimization:**
   - Use WebP format
   - Lazy loading
   - Progressive image loading
   - Image caching with expo-image

2. **API Optimization:**
   - Request batching
   - Pagination
   - Response caching
   - Optimistic updates

3. **Bundle Optimization:**
   - Code splitting
   - Remove unused dependencies
   - Tree shaking
   - Minification

4. **State Management:**
   - Minimize re-renders
   - Memoization
   - Virtual lists for long lists

### Backend

1. **Database:**
   - Proper indexing
   - Query optimization
   - Connection pooling
   - Read replicas for scaling

2. **Caching:**
   - Redis for session storage
   - API response caching
   - Static asset CDN

3. **Notification Queue:**
   - Bull for job queuing
   - Rate limiting
   - Batch processing
   - Retry mechanisms

---

## Security Considerations

1. **Authentication:**
   - JWT with refresh tokens
   - Secure token storage (Keychain/Keystore)
   - Session management
   - Brute force protection

2. **Authorization:**
   - Role-based access control (RBAC)
   - Permission checks on all endpoints
   - Business quota enforcement

3. **Data Protection:**
   - HTTPS only
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection
   - CSRF tokens

4. **API Security:**
   - Rate limiting
   - API key rotation
   - Webhook signature verification
   - Request size limits

5. **Payment Security:**
   - PCI compliance (via Stripe)
   - Never store card details
   - Webhook signature verification
   - Fraud detection

---

## Success Metrics

### Technical Metrics
- App crash rate < 0.1%
- API response time < 200ms (p95)
- Push notification delivery rate > 95%
- App bundle size < 50MB
- App store rating > 4.5 stars

### Business Metrics
- User adoption rate
- Business subscription conversion
- Notification engagement rate
- Revenue per business
- Churn rate

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| React Native performance issues | High | Extensive testing, fallback to native modules if needed |
| Push notification delivery failures | High | Implement retry logic, multiple providers |
| Payment processing errors | High | Comprehensive testing, Stripe test mode, error handling |
| Database scaling issues | Medium | Connection pooling, read replicas, caching |
| App store rejection | Medium | Follow guidelines strictly, prepare for review |
| User privacy concerns | High | Clear privacy policy, GDPR compliance, opt-in notifications |

---

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Schedule regular progress reviews
5. Adjust timeline based on progress

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** TownHub Development Team
