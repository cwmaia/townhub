# ENGINEER TASK: Implement Event Management Filtering and Sorting

## OBJECTIVE
Create professional filtering, search, and sorting functionality for Event management with premium UI styling (matching the Place management quality).

## CONTEXT
- Currently events are displayed on the main dashboard without filtering
- Need to create an `EventListClient.tsx` component (similar to `PlaceListClient.tsx`)
- Events have different properties: type (TOWN, FEATURED, COMMUNITY), date ranges, RSVPs, views
- Apply same premium UI as Place management (icons, hover states, etc.)

## IMPLEMENTATION

### Step 1: Review Existing Code

Read these files to understand the structure:
- `/Users/carlosmaia/townhub/app/[locale]/admin/PlaceListClient.tsx` (reference implementation)
- `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx` (see how events are currently displayed)
- `/Users/carlosmaia/townhub/ADMIN_DESIGN_SPECS.md` (design system)

### Step 2: Create EventListClient Component

**Create:** `/Users/carlosmaia/townhub/app/[locale]/admin/EventListClient.tsx`

```tsx
'use client';

import { useMemo, useState } from 'react';
import { EventType } from '@prisma/client';
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, ChevronUp, Clock, Edit3, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export type EventListClientProps = {
  events: {
    id: string;
    title: string;
    type: EventType;
    location: string;
    description: string | null;
    startsAt: string;
    endsAt: string | null;
    rsvpCount?: number;
    viewCount?: number;
    createdAt: string;
  }[];
  locale: string;
  townId: string;
  updateAction: (formData: FormData) => Promise<unknown>;
  deleteAction: (formData: FormData) => Promise<unknown>;
};

const PAGE_SIZE = 6;

type EventFilterType = 'all' | EventType;
type DateFilterType = 'all' | 'upcoming' | 'past';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  TOWN: '🏛️ Town',
  FEATURED: '⭐ Featured',
  COMMUNITY: '👥 Community',
};

export default function EventListClient({
  events,
  locale,
  townId,
  updateAction,
  deleteAction,
}: EventListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventFilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rsvps' | 'views' | 'createdAt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const now = new Date();

    const filtered = events.filter((event) => {
      // Search filter
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch);

      // Type filter
      const matchesType = typeFilter === 'all' || event.type === typeFilter;

      // Date filter
      const eventDate = new Date(event.startsAt);
      let matchesDate = true;
      if (dateFilter === 'upcoming') {
        matchesDate = eventDate >= now;
      } else if (dateFilter === 'past') {
        matchesDate = eventDate < now;
      }

      return matchesSearch && matchesType && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      } else if (sortBy === 'rsvps') {
        comparison = (a.rsvpCount ?? 0) - (b.rsvpCount ?? 0);
      } else if (sortBy === 'views') {
        comparison = (a.viewCount ?? 0) - (b.viewCount ?? 0);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [events, searchQuery, typeFilter, dateFilter, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pagedEvents = filteredEvents.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const pageStart = filteredEvents.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = filteredEvents.length === 0 ? 0 : Math.min((page + 1) * PAGE_SIZE, filteredEvents.length);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input with Icon */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(0);
              }}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-300
                         bg-white text-sm placeholder:text-slate-400
                         focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20
                         transition-all outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as EventFilterType);
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm
                       hover:border-slate-400 focus:border-[#003580]
                       focus:ring-2 focus:ring-[#003580]/20
                       transition-all outline-none"
          >
            <option value="all">All Types</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value as DateFilterType);
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm
                       hover:border-slate-400 focus:border-[#003580]
                       focus:ring-2 focus:ring-[#003580]/20
                       transition-all outline-none"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">📅 Upcoming</option>
            <option value="past">🕐 Past</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as 'date' | 'rsvps' | 'views' | 'createdAt');
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm
                       hover:border-slate-400 focus:border-[#003580]
                       focus:ring-2 focus:ring-[#003580]/20
                       transition-all outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="rsvps">Sort by RSVPs</option>
            <option value="views">Sort by Views</option>
            <option value="createdAt">Sort by Created</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              setPage(0);
            }}
            className="h-10 px-4 rounded-md border border-slate-300 bg-white text-sm
                       font-medium hover:bg-slate-50 hover:border-slate-400
                       transition-all"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          {/* Clear Filters Button */}
          {(searchQuery || typeFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'asc') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setDateFilter('all');
                setSortBy('date');
                setSortOrder('asc');
                setPage(0);
              }}
              className="h-10 px-4 rounded-md bg-slate-100 text-sm text-slate-700
                         font-medium hover:bg-slate-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-xs text-slate-500 mt-2">
          Showing <span className="font-semibold text-slate-900">{filteredEvents.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{events.length}</span> events
        </p>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100
                          flex items-center justify-center mb-4">
            <Calendar className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No events found
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            No events match your current filters. Try adjusting your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setDateFilter('all');
              setSortBy('date');
              setSortOrder('asc');
              setPage(0);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                       bg-slate-100 text-sm font-medium text-slate-700
                       hover:bg-slate-200 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Event Cards */}
          <div className="space-y-4">
            {pagedEvents.map((event) => {
              const isExpanded = expandedId === event.id;
              const upcoming = isUpcoming(event.startsAt);

              return (
                <div
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white
                             shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Event Title & Type */}
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-slate-900">
                          {event.title}
                        </p>
                        <Badge variant="outline" className="text-xs uppercase tracking-wide">
                          {EVENT_TYPE_LABELS[event.type]}
                        </Badge>
                        {upcoming && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Upcoming
                          </Badge>
                        )}
                      </div>

                      {/* Event Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          <span>{formatDate(event.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                        {event.rsvpCount !== undefined && event.rsvpCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="size-4" />
                            <span>{event.rsvpCount} RSVPs</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(event.id)}
                      className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide
                                 transition-colors duration-200 hover:bg-slate-50"
                      type="button"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Close
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                      <form action={updateAction} className="space-y-4">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="townId" value={townId} />
                        <input type="hidden" name="id" value={event.id} />

                        <div className="grid grid-cols-2 gap-4">
                          {/* Title */}
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Title
                            </label>
                            <Input
                              name="title"
                              defaultValue={event.title}
                              className="h-10 border-slate-300 focus:border-[#003580]
                                         focus:ring-2 focus:ring-[#003580]/20"
                            />
                          </div>

                          {/* Location */}
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Location
                            </label>
                            <Input
                              name="location"
                              defaultValue={event.location}
                              className="h-10 border-slate-300 focus:border-[#003580]
                                         focus:ring-2 focus:ring-[#003580]/20"
                            />
                          </div>

                          {/* Description */}
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Description
                            </label>
                            <Textarea
                              name="description"
                              rows={3}
                              defaultValue={event.description ?? ''}
                              className="resize-none border-slate-300 focus:border-[#003580]
                                         focus:ring-2 focus:ring-[#003580]/20"
                              placeholder="Event description..."
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <form action={deleteAction}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="townId" value={townId} />
                            <input type="hidden" name="id" value={event.id} />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50
                                         hover:border-red-300 transition-colors"
                            >
                              <Trash2 className="size-4 mr-1" />
                              Delete
                            </Button>
                          </form>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedId(null)}
                              className="hover:bg-slate-100"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-[#003580] hover:bg-[#002966] text-white
                                         shadow-sm hover:shadow-md transition-all"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-4
                          border-t border-slate-100">
            <span className="text-slate-600">
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {pageStart}-{pageEnd}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900">
                {filteredEvents.length}
              </span>
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
                className="hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Next
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### Step 3: Integrate into Admin Page

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx`

Find the "Manage events" section and replace the event list rendering with:

```tsx
import EventListClient from './EventListClient';

// In the "Manage events" section, replace the existing event display with:
<EventListClient
  events={events.map((event) => ({
    id: event.id,
    title: event.title,
    type: event.type,
    location: event.location,
    description: event.description,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString() ?? null,
    rsvpCount: event._count?.rsvps ?? 0,
    viewCount: event.viewCount ?? 0,
    createdAt: event.createdAt.toISOString(),
  }))}
  locale={locale}
  townId={managedTownId}
  updateAction={updateEventAction}
  deleteAction={deleteEventAction}
/>
```

## TESTING

After implementation:
1. Navigate to http://localhost:3000/en/admin
2. Scroll to "Manage events" section
3. Test search by title and location
4. Test type filter (Town, Featured, Community)
5. Test date filter (All, Upcoming, Past)
6. Test sorting (Date, RSVPs, Views, Created)
7. Test sort order toggle
8. Test clear filters button
9. Test expand/collapse on event cards
10. Test edit and save
11. Test delete
12. Test pagination
13. Verify all hover states work
14. Verify focus states (blue ring) on inputs
15. Check responsive behavior

## ACCEPTANCE CRITERIA

**Functionality:**
- ✅ Search filters by title and location
- ✅ Type filter works for all event types
- ✅ Date filter shows upcoming/past events correctly
- ✅ Sort by date, RSVPs, views, created date
- ✅ Sort order toggle works
- ✅ Clear filters resets everything
- ✅ Pagination works with filtered results
- ✅ Expand/collapse works (one at a time)
- ✅ Edit and delete actions work

**Visual Quality:**
- ✅ Premium appearance matching Place management
- ✅ Search icon visible
- ✅ Type emojis displayed (🏛️ ⭐ 👥)
- ✅ Date/location icons visible
- ✅ "Upcoming" badge shows for future events
- ✅ RSVP count displayed
- ✅ Hover shadows on cards
- ✅ Focus rings on inputs
- ✅ Smooth transitions
- ✅ Empty state is helpful

**Code Quality:**
- ✅ TypeScript types correct
- ✅ Memoized for performance
- ✅ No console errors
- ✅ Follows same patterns as PlaceListClient

Report back when complete!
