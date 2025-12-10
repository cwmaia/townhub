# Task 4: Mobile Notification Center Enhancement

## Overview
Enhance the mobile app's notification center to display rich notification types with proper styling, category filtering, and improved UX. The notifications should show type badges, icons, and colors matching the web admin's notification types.

## Context

### Existing Files (Mobile App - townhub-mobile)
- `app/(tabs)/notifications.tsx` - Current basic notifications screen
- `services/api.ts` - API service with `notificationsApi`
- `services/notifications.ts` - Push notification registration
- `utils/constants.ts` - App-wide constants and colors

### API Endpoints
```typescript
GET /api/notifications/user
// Returns:
{
  notifications: [{
    id: string,
    title: string,
    body: string,
    type: string,  // TOWN_ALERT, BUSINESS_PROMO, etc.
    sentAt: string,
    read: boolean,
    senderName?: string,
    data?: { deeplink?: string, type?: string, ... }
  }]
}

POST /api/notifications/{id}/read
// Marks notification as read
```

### Notification Types (from backend lib/notifications/types.ts)
```typescript
TOWN_ALERT: { label: "Town Alert", color: "text-red-700", bgColor: "bg-red-100", icon: "alert-circle" }
TOWN_NEWS: { label: "Town News", color: "text-blue-700", bgColor: "bg-blue-100", icon: "newspaper" }
TOWN_EVENT: { label: "Town Event", color: "text-purple-700", bgColor: "bg-purple-100", icon: "calendar" }
WEATHER_ALERT: { label: "Weather", color: "text-amber-700", bgColor: "bg-amber-100", icon: "cloud-lightning" }
AURORA_ALERT: { label: "Aurora", color: "text-green-700", bgColor: "bg-green-100", icon: "sparkles" }
BUSINESS_PROMO: { label: "Promotion", color: "text-pink-700", bgColor: "bg-pink-100", icon: "tag" }
BUSINESS_EVENT: { label: "Business Event", color: "text-indigo-700", bgColor: "bg-indigo-100", icon: "calendar-heart" }
BUSINESS_UPDATE: { label: "Update", color: "text-slate-700", bgColor: "bg-slate-100", icon: "store" }
SYSTEM_WELCOME: { label: "Welcome", color: "text-emerald-700", bgColor: "bg-emerald-100", icon: "hand-wave" }
SYSTEM_UPDATE: { label: "App Update", color: "text-cyan-700", bgColor: "bg-cyan-100", icon: "smartphone" }
```

## Implementation

### 1. Create Notification Type Constants (Mobile)

Create `utils/notificationTypes.ts`:

```typescript
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const NOTIFICATION_TYPES = {
  TOWN_ALERT: 'TOWN_ALERT',
  TOWN_NEWS: 'TOWN_NEWS',
  TOWN_EVENT: 'TOWN_EVENT',
  WEATHER_ALERT: 'WEATHER_ALERT',
  AURORA_ALERT: 'AURORA_ALERT',
  BUSINESS_PROMO: 'BUSINESS_PROMO',
  BUSINESS_EVENT: 'BUSINESS_EVENT',
  BUSINESS_UPDATE: 'BUSINESS_UPDATE',
  SYSTEM_WELCOME: 'SYSTEM_WELCOME',
  SYSTEM_UPDATE: 'SYSTEM_UPDATE',
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

interface NotificationTypeInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: 'town' | 'business' | 'system';
}

export const NOTIFICATION_TYPE_INFO: Record<NotificationType, NotificationTypeInfo> = {
  TOWN_ALERT: {
    label: 'Town Alert',
    color: '#b91c1c', // red-700
    bgColor: '#fee2e2', // red-100
    icon: 'alert-circle',
    category: 'town',
  },
  TOWN_NEWS: {
    label: 'Town News',
    color: '#1d4ed8', // blue-700
    bgColor: '#dbeafe', // blue-100
    icon: 'newspaper',
    category: 'town',
  },
  TOWN_EVENT: {
    label: 'Town Event',
    color: '#7c3aed', // purple-700
    bgColor: '#ede9fe', // purple-100
    icon: 'calendar',
    category: 'town',
  },
  WEATHER_ALERT: {
    label: 'Weather',
    color: '#b45309', // amber-700
    bgColor: '#fef3c7', // amber-100
    icon: 'weather-lightning',
    category: 'town',
  },
  AURORA_ALERT: {
    label: 'Aurora',
    color: '#15803d', // green-700
    bgColor: '#dcfce7', // green-100
    icon: 'shimmer',
    category: 'town',
  },
  BUSINESS_PROMO: {
    label: 'Promotion',
    color: '#be185d', // pink-700
    bgColor: '#fce7f3', // pink-100
    icon: 'tag',
    category: 'business',
  },
  BUSINESS_EVENT: {
    label: 'Business Event',
    color: '#4338ca', // indigo-700
    bgColor: '#e0e7ff', // indigo-100
    icon: 'calendar-heart',
    category: 'business',
  },
  BUSINESS_UPDATE: {
    label: 'Update',
    color: '#334155', // slate-700
    bgColor: '#f1f5f9', // slate-100
    icon: 'store',
    category: 'business',
  },
  SYSTEM_WELCOME: {
    label: 'Welcome',
    color: '#047857', // emerald-700
    bgColor: '#d1fae5', // emerald-100
    icon: 'hand-wave',
    category: 'system',
  },
  SYSTEM_UPDATE: {
    label: 'App Update',
    color: '#0e7490', // cyan-700
    bgColor: '#cffafe', // cyan-100
    icon: 'cellphone',
    category: 'system',
  },
};

export function getNotificationTypeInfo(type: string): NotificationTypeInfo {
  return (
    NOTIFICATION_TYPE_INFO[type as NotificationType] || {
      label: 'Notification',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: 'bell',
      category: 'system',
    }
  );
}
```

### 2. Create NotificationCard Component

Create `components/notifications/NotificationCard.tsx`:

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationTypeInfo, NotificationType } from '../../utils/notificationTypes';
import { COLORS, SPACING } from '../../utils/constants';

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  sentAt: string;
  read: boolean;
  senderName?: string;
  data?: {
    deeplink?: string;
    type?: string;
  };
}

interface NotificationCardProps {
  notification: NotificationData;
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const typeInfo = getNotificationTypeInfo(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true });

  return (
    <Pressable
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: typeInfo.bgColor }]}>
        <MaterialCommunityIcons
          name={typeInfo.icon}
          size={20}
          color={typeInfo.color}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: typeInfo.bgColor }]}>
            <Text style={[styles.badgeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>

        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>

        <View style={styles.footer}>
          {notification.senderName && (
            <Text style={styles.sender}>
              From {notification.senderName}
            </Text>
          )}
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unread: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sender: {
    fontSize: 12,
    color: COLORS.secondary,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
```

### 3. Create Category Filter Component

Create `components/notifications/CategoryFilter.tsx`:

```tsx
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/constants';

type Category = 'all' | 'town' | 'business' | 'system';

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
  counts?: {
    all: number;
    town: number;
    business: number;
    system: number;
  };
}

const CATEGORIES: { value: Category; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'all', label: 'All', icon: 'bell' },
  { value: 'town', label: 'Town', icon: 'town-hall' },
  { value: 'business', label: 'Business', icon: 'store' },
  { value: 'system', label: 'System', icon: 'cog' },
];

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.value;
          const count = counts?.[cat.value] ?? 0;

          return (
            <Pressable
              key={cat.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(cat.value)}
            >
              <MaterialCommunityIcons
                name={cat.icon}
                size={16}
                color={isSelected ? '#fff' : COLORS.muted}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {cat.label}
              </Text>
              {count > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                  <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.muted,
  },
  chipTextSelected: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  countTextSelected: {
    color: '#fff',
  },
});
```

### 4. Update Notifications Screen

Replace `app/(tabs)/notifications.tsx`:

```tsx
import { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationsApi } from '../../services/api';
import { NotificationCard } from '../../components/notifications/NotificationCard';
import { CategoryFilter } from '../../components/notifications/CategoryFilter';
import { getNotificationTypeInfo } from '../../utils/notificationTypes';
import { COLORS, SPACING } from '../../utils/constants';

type Category = 'all' | 'town' | 'business' | 'system';

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  sentAt: string;
  read: boolean;
  senderName?: string;
  data?: {
    screen?: string;
    placeId?: string;
    eventId?: string;
    deeplink?: string;
  };
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationsApi.getUserNotifications();
      return response.notifications as Notification[];
    },
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'all') return data;

    return data.filter((n) => {
      const typeInfo = getNotificationTypeInfo(n.type);
      return typeInfo.category === selectedCategory;
    });
  }, [data, selectedCategory]);

  const categoryCounts = useMemo(() => {
    if (!data) return { all: 0, town: 0, business: 0, system: 0 };

    const counts = { all: 0, town: 0, business: 0, system: 0 };
    data.forEach((n) => {
      if (!n.read) {
        counts.all++;
        const typeInfo = getNotificationTypeInfo(n.type);
        counts[typeInfo.category]++;
      }
    });
    return counts;
  }, [data]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    const notificationData = notification.data;
    if (notificationData?.deeplink) {
      router.push(notificationData.deeplink as any);
    } else if (notificationData?.screen) {
      router.push(notificationData.screen as any);
    } else if (notificationData?.placeId) {
      router.push(`/place/${notificationData.placeId}`);
    } else if (notificationData?.eventId) {
      router.push(`/event/${notificationData.eventId}`);
    }
  }, [markAsReadMutation]);

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorTitle}>Error loading notifications</Text>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {categoryCounts.all > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{categoryCounts.all}</Text>
          </View>
        )}
      </View>

      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        counts={categoryCounts}
      />

      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={64}
            color="#d1d5db"
          />
          <Text style={styles.emptyTitle}>
            {selectedCategory === 'all'
              ? 'No notifications yet'
              : `No ${selectedCategory} notifications`}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedCategory === 'all'
              ? "You'll see notifications from your town and subscribed businesses here"
              : 'Try selecting a different category'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerBadge: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.muted,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    maxWidth: 280,
  },
  listContent: {
    paddingVertical: SPACING.md,
  },
});
```

### 5. Update API Types (if needed)

The current `notificationsApi` in `services/api.ts` should work, but ensure the response type includes the new fields:

```typescript
export const notificationsApi = {
  registerDevice: (payload: { token: string; platform: string }) =>
    api.post('/api/notifications/register-device', payload),
  getUserNotifications: () => api.get<{
    notifications: {
      id: string;
      title: string;
      body: string;
      type: string;
      sentAt: string;
      read: boolean;
      senderName?: string;
      data?: Record<string, unknown>;
    }[];
  }>('/api/notifications/user'),
  markAsRead: (notificationId: string) =>
    api.post(`/api/notifications/${notificationId}/read`),
};
```

## Verification Steps

1. Start the mobile app: `npx expo start`
2. Navigate to the Notifications tab
3. Verify the header shows unread count badge
4. Verify category filter chips appear (All, Town, Business, System)
5. Send a test notification from admin dashboard
6. Verify notification appears with correct type badge and styling
7. Tap notification to mark as read and verify navigation
8. Test category filtering (only shows notifications of selected type)
9. Test pull-to-refresh functionality

## Files Created/Modified

- `utils/notificationTypes.ts` - Created (notification type constants for mobile)
- `components/notifications/NotificationCard.tsx` - Created
- `components/notifications/CategoryFilter.tsx` - Created
- `app/(tabs)/notifications.tsx` - Modified (enhanced UI)
- `services/api.ts` - May need type updates

## Dependencies
No new dependencies required - uses existing:
- `@expo/vector-icons` (MaterialCommunityIcons)
- `date-fns` (formatDistanceToNow)
- `@tanstack/react-query`
