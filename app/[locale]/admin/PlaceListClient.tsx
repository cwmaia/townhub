'use client';

import { useMemo, useState } from 'react';
import { PlaceType } from '@prisma/client';
import { ArrowLeft, ArrowRight, Calendar, ChevronDown, ChevronUp, Edit3, Eye, MapPin, Search, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export type PlaceListClientProps = {
  places: {
    id: string;
    name: string;
    type: PlaceType;
    description: string | null;
    tags?: string[];
    rating?: number | null;
    createdAt: string;
  }[];
  locale: string;
  townId: string;
  updateAction: (formData: FormData) => Promise<unknown>;
  deleteAction: (formData: FormData) => Promise<unknown>;
};

const PAGE_SIZE = 6;

type PlaceFilterType = 'all' | PlaceType;

const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  RESTAURANT: '🍽️ Restaurant',
  LODGING: '🏨 Lodging',
  ATTRACTION: '🎭 Attraction',
  TOWN_SERVICE: '🏛️ Town Service',
};

export default function PlaceListClient({
  places,
  locale,
  townId,
  updateAction,
  deleteAction,
}: PlaceListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PlaceFilterType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filteredPlaces = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const filtered = places.filter((place) => {
      const matchesSearch =
        !normalizedSearch ||
        place.name.toLowerCase().includes(normalizedSearch) ||
        (place.tags ?? []).some((tag) => tag.toLowerCase().includes(normalizedSearch));
      const matchesType = typeFilter === 'all' || place.type === typeFilter;
      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rating') {
        comparison = (a.rating ?? 0) - (b.rating ?? 0);
      } else if (sortBy === 'createdAt') {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [places, searchQuery, typeFilter, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredPlaces.length / PAGE_SIZE));
  const pagedPlaces = filteredPlaces.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const pageStart = filteredPlaces.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const pageEnd = filteredPlaces.length === 0 ? 0 : Math.min((page + 1) * PAGE_SIZE, filteredPlaces.length);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search places by name or tag..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(0);
              }}
              className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as PlaceFilterType);
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm hover:border-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
          >
            <option value="all">All Types</option>
            <option value="RESTAURANT">🍽️ Restaurants</option>
            <option value="LODGING">🏨 Lodging</option>
            <option value="ATTRACTION">🎭 Attractions</option>
            <option value="TOWN_SERVICE">🏛️ Town Services</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as 'name' | 'rating' | 'createdAt');
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm hover:border-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="createdAt">Sort by Date</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              setPage(0);
            }}
            className="h-10 px-4 rounded-md border border-slate-300 bg-white text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
          {(searchQuery || typeFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setSortBy('name');
                setSortOrder('asc');
                setPage(0);
              }}
              className="h-10 px-4 rounded-md bg-slate-100 text-sm text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Showing{' '}
          <span className="font-semibold text-slate-900">{filteredPlaces.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{places.length}</span> places
        </p>
      </div>

      {filteredPlaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500 shadow-sm">
          <Search className="mx-auto mb-3 h-6 w-6 text-slate-400" />
          <p className="text-lg font-semibold text-slate-900">No places found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your filters or clear them to view all places.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setSortBy('name');
              setSortOrder('asc');
              setPage(0);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pagedPlaces.map((place) => {
            const isExpanded = expandedId === place.id;
            return (
              <div
                key={place.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-900">{place.name}</p>
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {PLACE_TYPE_LABELS[place.type]}
                      </Badge>
                    </div>
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {place.tags.map((tag) => (
                          <span
                            key={`${place.id}-${tag}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {place.description ?? 'No description yet'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(place.id)}
                    className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide transition-colors duration-200 hover:bg-slate-50"
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
                {isExpanded ? (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-1">
                    <form action={updateAction} className="space-y-4 pt-4">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="townId" value={townId} />
                      <input type="hidden" name="id" value={place.id} />
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Description
                        </label>
                        <Textarea
                          name="description"
                          rows={3}
                          defaultValue={place.description ?? ''}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Tags
                        </label>
                        <Input
                          name="tags"
                          defaultValue={(place.tags ?? []).join(', ')}
                          placeholder="comma, separated, tags"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-1 px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200 hover:bg-slate-50"
                          onClick={() => setExpandedId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex items-center gap-1 rounded-full bg-[#003580] px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#002966]"
                        >
                          <Edit3 className="h-4 w-4" />
                          Save changes
                        </Button>
                      </div>
                    </form>
                    <form action={deleteAction} className="mt-4 pt-4 border-t border-slate-100">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="townId" value={townId} />
                      <input type="hidden" name="id" value={place.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete place
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {pageStart}-{pageEnd}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{filteredPlaces.length}</span> places
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 rounded-md border-slate-300 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
            className="flex items-center gap-1 rounded-md border-slate-300 transition-colors duration-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type EventListType = 'TOWN' | 'FEATURED' | 'COMMUNITY';
type EventFilterType = 'all' | EventListType;
type DateFilterType = 'all' | 'upcoming' | 'past';

export type EventListClientProps = {
  events: {
    id: string;
    title: string;
    type: EventListType;
    location: string | null;
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

const EVENT_PAGE_SIZE = 6;

const EVENT_TYPE_LABELS: Record<EventListType, string> = {
  TOWN: '🏛️ Town',
  FEATURED: '⭐ Featured',
  COMMUNITY: '👥 Community',
};

const formatEventDate = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function EventListClient({
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
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        (event.location ?? '').toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === 'all' || event.type === typeFilter;

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

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / EVENT_PAGE_SIZE));
  const pagedEvents = filteredEvents.slice(page * EVENT_PAGE_SIZE, page * EVENT_PAGE_SIZE + EVENT_PAGE_SIZE);

  const pageStart = filteredEvents.length === 0 ? 0 : page * EVENT_PAGE_SIZE + 1;
  const pageEnd = filteredEvents.length === 0 ? 0 : Math.min((page + 1) * EVENT_PAGE_SIZE, filteredEvents.length);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
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
              className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as EventFilterType);
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm hover:border-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
          >
            <option value="all">All types</option>
            <option value="TOWN">🏛️ Town</option>
            <option value="FEATURED">⭐ Featured</option>
            <option value="COMMUNITY">👥 Community</option>
          </select>
          <select
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value as DateFilterType);
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm hover:border-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
          >
            <option value="all">All dates</option>
            <option value="upcoming">📅 Upcoming</option>
            <option value="past">🕐 Past</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as 'date' | 'rsvps' | 'views' | 'createdAt');
              setPage(0);
            }}
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm hover:border-slate-400 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20 transition-all outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="rsvps">Sort by RSVPs</option>
            <option value="views">Sort by Views</option>
            <option value="createdAt">Sort by Created</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              setPage(0);
            }}
            className="h-10 px-4 rounded-md border border-slate-300 bg-white text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
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
              className="h-10 px-4 rounded-md bg-slate-100 text-sm text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Showing{' '}
          <span className="font-semibold text-slate-900">{filteredEvents.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{events.length}</span> events
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500 shadow-sm">
          <Search className="mx-auto mb-3 h-6 w-6 text-slate-400" />
          <p className="text-lg font-semibold text-slate-900">No events found</p>
          <p className="mt-2 text-sm text-slate-500">
            Adjust your filters or clear them to see all town events again.
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
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pagedEvents.map((event) => {
            const eventDate = new Date(event.startsAt);
            const isUpcoming = eventDate >= new Date();

            return (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-900 line-clamp-1">{event.title}</p>
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {EVENT_TYPE_LABELS[event.type]}
                      </Badge>
                      {isUpcoming && <Badge variant="secondary" className="text-xs">Upcoming</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(event.startsAt, locale)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location ?? 'Location TBD'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.rsvpCount ?? 0} RSVPs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{event.viewCount ?? 0} views</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(event.id)}
                    className="flex items-center gap-1 text-sm font-medium uppercase tracking-wide transition-colors duration-200 hover:bg-slate-50"
                  >
                    {expandedId === event.id ? (
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
                {expandedId === event.id && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <form action={updateAction} className="space-y-4">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="townId" value={townId} />
                      <input type="hidden" name="id" value={event.id} />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                          <Input
                            name="title"
                            defaultValue={event.title}
                            className="h-10 border-slate-300 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Location</label>
                          <Input
                            name="location"
                            defaultValue={event.location ?? ''}
                            className="h-10 border-slate-300 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                          <Textarea
                            name="description"
                            rows={3}
                            defaultValue={event.description ?? ''}
                            className="resize-none border-slate-300 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/20"
                            placeholder="Event description..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <form action={deleteAction}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="townId" value={townId} />
                          <input type="hidden" name="id" value={event.id} />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
                            className="bg-[#003580] hover:bg-[#002966] text-white shadow-sm hover:shadow-md transition-all"
                          >
                            <Edit3 className="h-4 w-4" />
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
      )}

      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
        <span className="text-slate-600">
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {pageStart}-{pageEnd}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-900">{filteredEvents.length}</span>
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
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
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
