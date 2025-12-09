# Phase 4: Subscription Bell UI

Add a notification bell icon to PlaceCard that allows users to subscribe/unsubscribe from place notifications with a single click.

## Overview

Users should be able to click a bell icon on any PlaceCard to subscribe to notifications from that place. The bell shows visual feedback (filled vs outline) based on subscription status.

## API Endpoints (Already Built)

- `GET /api/places/[id]/subscribe` - Check subscription status
- `POST /api/places/[id]/subscribe` - Subscribe to place
- `DELETE /api/places/[id]/subscribe` - Unsubscribe from place

## Implementation Tasks

### 1. Create SubscriptionBell Component

**File:** `app/(components)/SubscriptionBell.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SubscriptionBellProps = {
  placeId: string;
  placeName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function SubscriptionBell({ placeId, placeName, className, size = 'md' }: SubscriptionBellProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Fetch initial subscription status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/places/${placeId}/subscribe`);
        if (res.ok) {
          const data = await res.json();
          setSubscribed(data.subscribed);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [placeId]);

  const toggleSubscription = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggling) return;
    setToggling(true);

    try {
      const method = subscribed ? 'DELETE' : 'POST';
      const res = await fetch(`/api/places/${placeId}/subscribe`, { method });

      if (res.ok) {
        const newStatus = !subscribed;
        setSubscribed(newStatus);
        toast.success(
          newStatus
            ? `Subscribed to ${placeName}`
            : `Unsubscribed from ${placeName}`
        );
      } else if (res.status === 401) {
        toast.error('Please sign in to subscribe');
      } else {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setToggling(false);
    }
  }, [placeId, placeName, subscribed, toggling]);

  const iconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const buttonSizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(buttonSizes[size], 'rounded-full', className)}
        disabled
      >
        <Loader2 className={cn(iconSizes[size], 'animate-spin text-slate-400')} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        buttonSizes[size],
        'rounded-full transition-all duration-200',
        subscribed
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600',
        className
      )}
      onClick={toggleSubscription}
      disabled={toggling}
      title={subscribed ? `Unsubscribe from ${placeName}` : `Subscribe to ${placeName}`}
    >
      {toggling ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : subscribed ? (
        <BellRing className={cn(iconSizes[size], 'fill-current')} />
      ) : (
        <Bell className={iconSizes[size]} />
      )}
    </Button>
  );
}
```

### 2. Update PlaceCard to Include Bell

**File:** `app/(components)/PlaceCard.tsx`

Add the SubscriptionBell component to the card header, positioned in the top-right area near the place name.

```tsx
import { SubscriptionBell } from './SubscriptionBell';

// In the component, add the bell next to the place name header:
<div className="flex items-start justify-between gap-4">
  <div>
    <h3 className="text-xl font-semibold text-slate-900">
      {place.name}
    </h3>
    {/* existing content */}
  </div>
  <SubscriptionBell
    placeId={place.id}
    placeName={place.name}
    size="md"
  />
</div>
```

### 3. Add Bell to Event Cards (Optional)

If there's an EventCard component, add similar subscription bell functionality for events/businesses.

## Visual Design

- **Unsubscribed state:** Outline bell icon, slate/gray color
- **Subscribed state:** Filled bell icon with ring, primary color with light background
- **Loading state:** Spinning loader
- **Hover effects:** Subtle background highlight
- **Animations:** Smooth transitions between states

## Testing

1. Visit stykkisholmur page as logged-in user
2. Click bell on any PlaceCard
3. Verify toast notification appears
4. Verify bell icon changes to filled state
5. Click again to unsubscribe
6. Verify state persists on page refresh
7. Check Settings page shows the subscription

## Notes

- Bell should work without page refresh (optimistic UI)
- Handle unauthenticated users gracefully (show sign-in prompt)
- Use sonner toast for feedback
- Ensure build passes after changes
