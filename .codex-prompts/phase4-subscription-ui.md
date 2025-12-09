# Phase 4: Subscription Bell UI on Business/Place Cards

## Objective
Add a subscription bell icon to business cards and place detail pages that allows users to:
1. See if they're subscribed to a business/place
2. Subscribe/unsubscribe with one tap
3. Get visual feedback on subscription status

---

## Task 4.1: Create SubscriptionBell Component (Web)

**File:** `app/(components)/SubscriptionBell.tsx` (new file)

```typescript
"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubscriptionBellProps {
  type: "business" | "place";
  id: string;
  name: string;
  initialSubscribed?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export default function SubscriptionBell({
  type,
  id,
  name,
  initialSubscribed = false,
  size = "md",
  showLabel = false,
  className,
  onSubscriptionChange,
}: SubscriptionBellProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(!initialSubscribed);

  const endpoint = type === "business"
    ? `/api/businesses/${id}/subscribe`
    : `/api/places/${id}/subscribe`;

  // Check subscription status on mount if not provided
  useEffect(() => {
    if (initialSubscribed !== undefined) {
      setIsChecking(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.subscribed);
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [endpoint, initialSubscribed]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: isSubscribed ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update subscription");
      }

      const newState = !isSubscribed;
      setIsSubscribed(newState);
      onSubscriptionChange?.(newState);

      toast.success(
        newState
          ? `Subscribed to ${name}`
          : `Unsubscribed from ${name}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (isChecking) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(sizeClasses[size], "rounded-full", className)}
        disabled
      >
        <Loader2 className="animate-spin" size={iconSizes[size]} />
      </Button>
    );
  }

  const button = (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size={showLabel ? "sm" : "icon"}
      className={cn(
        !showLabel && sizeClasses[size],
        !showLabel && "rounded-full",
        isSubscribed && "bg-sky-500 hover:bg-sky-600",
        className
      )}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={iconSizes[size]} />
      ) : isSubscribed ? (
        <>
          <Bell size={iconSizes[size]} fill="currentColor" />
          {showLabel && <span className="ml-2">Subscribed</span>}
        </>
      ) : (
        <>
          <BellOff size={iconSizes[size]} />
          {showLabel && <span className="ml-2">Subscribe</span>}
        </>
      )}
    </Button>
  );

  if (showLabel) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{isSubscribed ? `Unsubscribe from ${name}` : `Subscribe to ${name}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

---

## Task 4.2: Create SubscriptionBell Component (Mobile)

**File:** `components/notifications/SubscriptionBell.tsx` (new file in mobile app)

```typescript
import { useState, useEffect } from "react";
import { Pressable, ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import * as Haptics from "expo-haptics";

interface SubscriptionBellProps {
  type: "business" | "place";
  id: string;
  name: string;
  initialSubscribed?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export default function SubscriptionBell({
  type,
  id,
  name,
  initialSubscribed,
  size = "md",
  showLabel = false,
  onSubscriptionChange,
}: SubscriptionBellProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(initialSubscribed === undefined);

  const endpoint = type === "business"
    ? `/api/businesses/${id}/subscribe`
    : `/api/places/${id}/subscribe`;

  useEffect(() => {
    if (initialSubscribed !== undefined) {
      setIsChecking(false);
      setIsSubscribed(initialSubscribed);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await api.get(endpoint);
        setIsSubscribed(response.subscribed ?? false);
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [endpoint, initialSubscribed]);

  const handleToggle = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isSubscribed) {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }

      const newState = !isSubscribed;
      setIsSubscribed(newState);
      onSubscriptionChange?.(newState);

      Haptics.notificationAsync(
        newState
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (error) {
      console.error("Error toggling subscription:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    sm: { button: 32, icon: 16 },
    md: { button: 40, icon: 20 },
    lg: { button: 48, icon: 24 },
  };

  const currentSize = sizes[size];

  if (isChecking) {
    return (
      <View
        style={[
          styles.button,
          {
            width: showLabel ? "auto" : currentSize.button,
            height: currentSize.button,
          },
        ]}
      >
        <ActivityIndicator size="small" color="#64748b" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleToggle}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.button,
        isSubscribed ? styles.buttonSubscribed : styles.buttonUnsubscribed,
        {
          width: showLabel ? "auto" : currentSize.button,
          height: currentSize.button,
          paddingHorizontal: showLabel ? 16 : 0,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isSubscribed ? "white" : "#64748b"} />
      ) : (
        <>
          <Ionicons
            name={isSubscribed ? "notifications" : "notifications-outline"}
            size={currentSize.icon}
            color={isSubscribed ? "white" : "#64748b"}
          />
          {showLabel && (
            <Text
              style={[
                styles.label,
                { color: isSubscribed ? "white" : "#64748b" },
              ]}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 6,
  },
  buttonSubscribed: {
    backgroundColor: "#0ea5e9",
  },
  buttonUnsubscribed: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
```

---

## Task 4.3: Add SubscriptionBell to PlaceCard (Web)

**File:** `app/(components)/PlaceCard.tsx` (update existing)

Add the subscription bell to the card:

```typescript
// Add import
import SubscriptionBell from "./SubscriptionBell";

// Add to component props
interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    // ... other fields
    businessId?: string; // If place has a linked business
  };
  isSubscribed?: boolean;
}

// Inside the component, add the bell in the card header/corner:
<div className="relative">
  {/* Existing image/content */}
  <img src={place.imageUrl} ... />

  {/* Subscription bell - positioned in top-right corner */}
  <div className="absolute top-2 right-2">
    <SubscriptionBell
      type={place.businessId ? "business" : "place"}
      id={place.businessId ?? place.id}
      name={place.name}
      initialSubscribed={isSubscribed}
      size="sm"
    />
  </div>
</div>
```

---

## Task 4.4: Add SubscriptionBell to PlaceCard (Mobile)

**File:** `components/places/PlaceCard.tsx` (update existing in mobile app)

```typescript
// Add import
import SubscriptionBell from "@/components/notifications/SubscriptionBell";

// Add to component props
interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    // ... other fields
    businessId?: string;
  };
  isSubscribed?: boolean;
}

// Inside the component, add the bell:
<View style={styles.cardHeader}>
  {/* Existing content */}
  <Image source={{ uri: place.imageUrl }} style={styles.image} />

  {/* Subscription bell overlay */}
  <View style={styles.bellContainer}>
    <SubscriptionBell
      type={place.businessId ? "business" : "place"}
      id={place.businessId ?? place.id}
      name={place.name}
      initialSubscribed={isSubscribed}
      size="sm"
    />
  </View>
</View>

// Add styles
const styles = StyleSheet.create({
  // ... existing styles
  bellContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
```

---

## Task 4.5: Add SubscriptionBell to Place Detail Page (Web)

**File:** `app/[locale]/places/[id]/page.tsx` (update or create)

Add subscription bell to the detail page header:

```typescript
// In the page component
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold">{place.name}</h1>
    <p className="text-slate-600">{place.address}</p>
  </div>
  <SubscriptionBell
    type={place.businessId ? "business" : "place"}
    id={place.businessId ?? place.id}
    name={place.name}
    showLabel
    size="lg"
  />
</div>
```

---

## Task 4.6: Add SubscriptionBell to Place Detail Screen (Mobile)

**File:** `app/place/[id].tsx` (update existing in mobile app)

```typescript
// Add import
import SubscriptionBell from "@/components/notifications/SubscriptionBell";

// In the screen component, add to header:
<View style={styles.header}>
  <View style={styles.headerContent}>
    <Text style={styles.title}>{place.name}</Text>
    <Text style={styles.subtitle}>{place.address}</Text>
  </View>
  <SubscriptionBell
    type={place.businessId ? "business" : "place"}
    id={place.businessId ?? place.id}
    name={place.name}
    size="lg"
    showLabel
  />
</View>
```

---

## Task 4.7: Create useSubscription Hook (Mobile)

**File:** `hooks/useSubscription.ts` (new file in mobile app)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionId: string | null;
}

export function useSubscriptionStatus(type: "business" | "place", id: string) {
  const endpoint = type === "business"
    ? `/api/businesses/${id}/subscribe`
    : `/api/places/${id}/subscribe`;

  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription", type, id],
    queryFn: () => api.get(endpoint),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSubscribeMutation(type: "business" | "place", id: string) {
  const queryClient = useQueryClient();
  const endpoint = type === "business"
    ? `/api/businesses/${id}/subscribe`
    : `/api/places/${id}/subscribe`;

  return useMutation({
    mutationFn: () => api.post(endpoint),
    onSuccess: () => {
      queryClient.setQueryData<SubscriptionStatus>(
        ["subscription", type, id],
        { subscribed: true, subscriptionId: null }
      );
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useUnsubscribeMutation(type: "business" | "place", id: string) {
  const queryClient = useQueryClient();
  const endpoint = type === "business"
    ? `/api/businesses/${id}/subscribe`
    : `/api/places/${id}/subscribe`;

  return useMutation({
    mutationFn: () => api.delete(endpoint),
    onSuccess: () => {
      queryClient.setQueryData<SubscriptionStatus>(
        ["subscription", type, id],
        { subscribed: false, subscriptionId: null }
      );
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useUserSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => api.get("/api/subscriptions"),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

---

## Task 4.8: Update API Service (Mobile)

**File:** `services/api.ts` (update existing)

Add subscription endpoints:

```typescript
// Add to api object or create subscriptionsApi
subscriptionsApi: {
  // Business subscriptions
  getBusinessStatus: (businessId: string) =>
    api.get(`/api/businesses/${businessId}/subscribe`),
  subscribeBusiness: (businessId: string) =>
    api.post(`/api/businesses/${businessId}/subscribe`),
  unsubscribeBusiness: (businessId: string) =>
    api.delete(`/api/businesses/${businessId}/subscribe`),

  // Place subscriptions
  getPlaceStatus: (placeId: string) =>
    api.get(`/api/places/${placeId}/subscribe`),
  subscribePlace: (placeId: string) =>
    api.post(`/api/places/${placeId}/subscribe`),
  unsubscribePlace: (placeId: string) =>
    api.delete(`/api/places/${placeId}/subscribe`),

  // List all subscriptions
  getAll: () => api.get("/api/subscriptions"),
},
```

---

## Task 4.9: Show Subscription Status in Notification List (Mobile)

**File:** `app/(tabs)/notifications.tsx` (update existing)

Show which business/place the notification came from:

```typescript
// In the notification item component
{notification.data?.businessId && (
  <View style={styles.notificationSource}>
    <Ionicons name="business" size={12} color="#64748b" />
    <Text style={styles.sourceText}>{notification.data.businessName}</Text>
  </View>
)}
```

---

## Task 4.10: Preference Check Before Subscribe

When user tries to subscribe to a business but has that business type disabled in preferences, show a prompt:

**File:** `components/notifications/SubscriptionBell.tsx` (update)

Add preference check:

```typescript
// Add to mobile component
import { useProfileQuery } from "@/hooks/useProfile";
import { Alert } from "react-native";

// Inside component
const { data: profile } = useProfileQuery();

const handleToggle = async () => {
  // If subscribing, check preferences
  if (!isSubscribed && profile?.notificationPreferences) {
    const prefs = profile.notificationPreferences;

    // Check global enabled
    if (!prefs.globalEnabled) {
      Alert.alert(
        "Notifications Disabled",
        "You have notifications turned off. Enable them in Settings to subscribe.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: () => router.push("/(tabs)/profile") },
        ]
      );
      return;
    }

    // Could also check business type here if we know the place's type
  }

  // Continue with subscription toggle
  setIsLoading(true);
  // ... rest of the function
};
```

---

## Verification Steps

1. **Web App:**
   - Navigate to a place card - should see subscription bell
   - Click bell - should toggle subscription
   - Check Settings > Subscriptions - should show new subscription
   - Unsubscribe from Settings - bell should update on card

2. **Mobile App:**
   - View place card - should see subscription bell
   - Tap bell - should toggle with haptic feedback
   - Check Profile > Subscriptions - should show new subscription
   - Visit place detail screen - should see larger subscribe button

3. **Cross-Platform:**
   - Subscribe on web - should reflect on mobile
   - Unsubscribe on mobile - should reflect on web

---

## Files Created (Web)

- `app/(components)/SubscriptionBell.tsx`

## Files Modified (Web)

- `app/(components)/PlaceCard.tsx`
- `app/[locale]/places/[id]/page.tsx` (or similar detail page)

## Files Created (Mobile)

- `components/notifications/SubscriptionBell.tsx`
- `hooks/useSubscription.ts`

## Files Modified (Mobile)

- `components/places/PlaceCard.tsx`
- `app/place/[id].tsx`
- `services/api.ts`
- `app/(tabs)/notifications.tsx`
