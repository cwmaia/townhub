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
