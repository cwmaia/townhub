'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { TownHubEvent } from "./types";

// Animation constants (matching mobile version)
const CARD_WIDTH = 220; // Card width in pixels
const CARD_GAP = 12; // gap-3 = 12px
const SCROLL_UNIT = CARD_WIDTH + CARD_GAP; // Total width per card including gap
const MAX_SCROLL_CARDS = 1.5; // Scroll 1.5 cards to show more content
const PAUSE_DURATION = 3000; // 3 second pause at each end
const SCROLL_DURATION = 18000; // 18 seconds to scroll (much slower)

type WhatsHappeningProps = {
  events: TownHubEvent[];
};

// Check if event is happening today or within 24 hours
const isEventImminent = (startsAt: Date | string | null) => {
  if (!startsAt) return false;
  const eventDate = new Date(startsAt);
  const now = new Date();
  const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24 && diffHours >= -12;
};

// Format event date for display
const formatEventDate = (startsAt: Date | string | null) => {
  if (!startsAt) return '';
  const eventDate = new Date(startsAt);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

// Format event time
const formatEventTime = (startsAt: Date | string | null) => {
  if (!startsAt) return '';
  const eventDate = new Date(startsAt);
  return eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

type FeaturedEventCardProps = {
  event: TownHubEvent;
  type: 'imminent' | 'town' | 'premium';
  onClick: () => void;
};

const FeaturedEventCard = ({ event, type, onClick }: FeaturedEventCardProps) => {
  const badgeStyles = {
    imminent: 'bg-red-500 text-white',
    premium: 'bg-amber-400 text-amber-900',
    town: 'bg-[#003580] text-white',
  };

  const badgeText = {
    imminent: 'Starting Soon!',
    premium: 'Featured',
    town: 'Town Event',
  };

  const borderStyles = {
    imminent: 'ring-[3px] ring-red-500',
    premium: '',
    town: 'ring-[3px] ring-[#003580]',
  };

  const cardContent = (
    <button
      onClick={onClick}
      style={{ width: '220px', minWidth: '220px', maxWidth: '220px', flexShrink: 0 }}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-lg ${borderStyles[type]} ${type === 'imminent' ? 'animate-pulse-border' : ''} ${type === 'premium' ? 'shimmer-gold' : ''}`}
    >
      <div className="relative w-full overflow-hidden" style={{ height: '130px' }}>
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-5xl">
            {type === 'premium' ? '🎉' : type === 'town' ? '🏛️' : '⏰'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
          {formatEventDate(event.startsAt)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-left text-sm font-semibold text-slate-900">
          {event.title}
        </h3>
        {/* Metadata */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          {event.startsAt && (
            <span>🕐 {formatEventTime(event.startsAt)}</span>
          )}
          {event.location && (
            <span className="truncate">📍 {event.location}</span>
          )}
        </div>
        <span className={`self-start rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[type]}`}>
          {badgeText[type]}
        </span>
      </div>
    </button>
  );

  // Wrap premium cards in shimmer border
  return cardContent;
};

// Placeholder "Coming Soon" card
const ComingSoonCard = ({ index }: { index: number }) => {
  const placeholders = [
    { emoji: '🎭', title: 'Community Theater Night', desc: 'Local performances coming soon' },
    { emoji: '🎪', title: 'Summer Festival 2025', desc: 'Annual celebration planned' },
  ];
  const { emoji, title, desc } = placeholders[index % placeholders.length];

  return (
    <div
      style={{ width: '220px', minWidth: '220px', maxWidth: '220px', flexShrink: 0 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white/60 border-2 border-dashed border-slate-300 shadow-sm"
    >
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200" style={{ height: '130px' }}>
        <div className="flex h-full w-full items-center justify-center text-5xl opacity-50">
          {emoji}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-200/80 to-transparent" />
        <div className="absolute left-2 top-2 rounded bg-slate-400/70 px-2 py-1 text-[11px] font-bold text-white">
          TBA
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-left text-sm font-semibold text-slate-500">
          {title}
        </h3>
        <p className="text-[11px] text-slate-400">{desc}</p>
        <span className="self-start rounded bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Coming Soon
        </span>
      </div>
    </div>
  );
};

const WhatsHappening = ({ events }: WhatsHappeningProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  // Categorize events
  const { imminentEvent, townEvent, premiumEvent, extraEvents } = useMemo(() => {
    const imminent = events.find(e => isEventImminent(e.startsAt)) ?? events[0];
    const town = events.find(e => e.isTownEvent && e.id !== imminent?.id)
      ?? events.find(e => e.id !== imminent?.id);
    const premium = events.find(e => e.isFeatured && e.id !== imminent?.id && e.id !== town?.id)
      ?? events.find(e => e.id !== imminent?.id && e.id !== town?.id);

    // Get additional events
    const usedIds = new Set([imminent?.id, town?.id, premium?.id].filter(Boolean));
    const extra = events.filter(e => !usedIds.has(e.id)).slice(0, 2);

    return {
      imminentEvent: imminent,
      townEvent: town,
      premiumEvent: premium,
      extraEvents: extra,
    };
  }, [events]);

  const displayEvents = [
    imminentEvent && { event: imminentEvent, type: 'imminent' as const },
    premiumEvent && { event: premiumEvent, type: 'premium' as const },
    townEvent && { event: townEvent, type: 'town' as const },
    ...extraEvents.map(e => ({ event: e, type: 'town' as const })),
  ].filter(Boolean);

  // Calculate max scroll distance (just enough to peek at next cards)
  const maxScroll = SCROLL_UNIT * MAX_SCROLL_CARDS;

  // Easing function for smooth animation (ease-in-out)
  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  // Handle user interaction - stop auto-scroll temporarily
  const handleUserInteraction = useCallback(() => {
    setUserHasInteracted(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Handle manual scroll to update dot indicator
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / SCROLL_UNIT);
      setCurrentIndex(Math.max(0, Math.min(newIndex, displayEvents.length - 1)));
    }
  }, [displayEvents.length]);

  // Drag-to-scroll handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleUserInteraction();
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.pageX;
    scrollStartX.current = scrollContainerRef.current?.scrollLeft ?? 0;
  }, [handleUserInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.pageX;
    const diff = Math.abs(dragStartX.current - x);
    if (diff > 5) {
      hasDragged.current = true;
      e.preventDefault();
    }
    const walk = (dragStartX.current - x) * 1.5; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollStartX.current + walk;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle card click - only trigger if not dragging
  const handleCardClick = useCallback((eventId: string) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    console.log('Event clicked:', eventId);
    // TODO: Navigate to event detail
  }, []);

  // Back-and-forth auto-scroll animation
  useEffect(() => {
    if (userHasInteracted || displayEvents.length <= 1) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Animation state
    let phase: 'pause-start' | 'scroll-right' | 'pause-end' | 'scroll-left' = 'pause-start';
    let phaseStartTime = performance.now();

    const animate = (currentTime: number) => {
      if (userHasInteracted) return;

      const elapsed = currentTime - phaseStartTime;

      switch (phase) {
        case 'pause-start':
          if (elapsed >= PAUSE_DURATION) {
            phase = 'scroll-right';
            phaseStartTime = currentTime;
          }
          break;

        case 'scroll-right': {
          const progress = Math.min(elapsed / SCROLL_DURATION, 1);
          const easedProgress = easeInOutQuad(progress);
          container.scrollLeft = easedProgress * maxScroll;

          if (progress >= 1) {
            phase = 'pause-end';
            phaseStartTime = currentTime;
          }
          break;
        }

        case 'pause-end':
          if (elapsed >= PAUSE_DURATION) {
            phase = 'scroll-left';
            phaseStartTime = currentTime;
          }
          break;

        case 'scroll-left': {
          const progress = Math.min(elapsed / SCROLL_DURATION, 1);
          const easedProgress = easeInOutQuad(progress);
          container.scrollLeft = maxScroll * (1 - easedProgress);

          if (progress >= 1) {
            phase = 'pause-start';
            phaseStartTime = currentTime;
          }
          break;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [userHasInteracted, displayEvents.length, maxScroll]);

  // Update current index based on scroll position for dots
  useEffect(() => {
    if (displayEvents.length <= 1) return;

    const interval = setInterval(() => {
      if (!userHasInteracted && scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const newIndex = Math.round(scrollLeft / SCROLL_UNIT);
        setCurrentIndex(Math.max(0, Math.min(newIndex, displayEvents.length - 1)));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [displayEvents.length, userHasInteracted]);

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">What&apos;s Happening</h2>
        <div className="flex gap-1.5">
          {displayEvents.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-4 bg-blue-500'
                  : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className={`flex gap-3 overflow-x-auto py-1 px-1 -mx-1 scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleUserInteraction}
        onWheel={handleUserInteraction}
        onScroll={handleScroll}
      >
        {displayEvents.map((item) => (
          item && (
            <FeaturedEventCard
              key={item.event.id}
              event={item.event}
              type={item.type}
              onClick={() => handleCardClick(item.event.id)}
            />
          )
        ))}
        {/* Add placeholder "Coming Soon" cards to fill the space */}
        <ComingSoonCard index={0} />
        <ComingSoonCard index={1} />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <style jsx global>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        .shimmer-gold {
          position: relative;
          box-shadow: 0 0 0 3px #f59e0b;
        }
        .shimmer-gold::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 19px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer-sweep 5s linear infinite;
          pointer-events: none;
        }
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
};

export default WhatsHappening;
