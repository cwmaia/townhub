# ENGINEER TASK: Apply Designer UI Improvements to Places List

## OBJECTIVE
Enhance the existing Place filtering/sorting implementation with premium UI styling from the Designer's specifications.

## CONTEXT
- You already implemented functional filtering/sorting in `PlaceListClient.tsx`
- Designer has created comprehensive UI specs in `/Users/carlosmaia/townhub/ADMIN_DESIGN_SPECS.md`
- Goal: Combine your functionality with Designer's premium styling
- Target: Transform from "functional" to "Vercel/Stripe quality"

## WHAT TO DO

### Step 1: Read the Designer Specs
Read `/Users/carlosmaia/townhub/ADMIN_DESIGN_SPECS.md` sections:
- Component Styles (lines 212-510)
- Page-Specific Improvements > Dashboard Page (lines 513-742)
- Focus on the Place Listing implementation (lines 524-684)

### Step 2: Apply Premium Styling to PlaceListClient.tsx

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/PlaceListClient.tsx`

#### A. Enhance Filter Controls (lines 83-146)

**Current:** Basic native inputs
**Target:** Premium styled with hover states and shadows

Replace the filter controls section with:

```tsx
<div className="mb-6">
  <div className="flex flex-wrap items-center gap-3">
    {/* Search Input with Icon */}
    <div className="relative flex-1 min-w-[200px]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search places by name or tag..."
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
        setTypeFilter(event.target.value as PlaceFilterType);
        setPage(0);
      }}
      className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm
                 hover:border-slate-400 focus:border-[#003580]
                 focus:ring-2 focus:ring-[#003580]/20
                 transition-all outline-none"
    >
      <option value="all">All Types</option>
      <option value="RESTAURANT">🍽️ Restaurants</option>
      <option value="LODGING">🏨 Lodging</option>
      <option value="ATTRACTION">🎭 Attractions</option>
      <option value="TOWN_SERVICE">🏛️ Town Services</option>
    </select>

    {/* Sort By */}
    <select
      value={sortBy}
      onChange={(event) => {
        setSortBy(event.target.value as 'name' | 'rating' | 'createdAt');
        setPage(0);
      }}
      className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm
                 hover:border-slate-400 focus:border-[#003580]
                 focus:ring-2 focus:ring-[#003580]/20
                 transition-all outline-none"
    >
      <option value="name">Sort by Name</option>
      <option value="rating">Sort by Rating</option>
      <option value="createdAt">Sort by Date</option>
    </select>

    {/* Sort Order Toggle */}
    <button
      type="button"
      onClick={() => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        setPage(0);
      }}
      className="h-10 px-4 rounded-md border border-slate-300 bg-white text-sm
                 hover:bg-slate-50 hover:border-slate-400
                 transition-all font-medium"
    >
      {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
    </button>

    {/* Clear Filters Button */}
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
        className="h-10 px-4 rounded-md bg-slate-100 text-sm text-slate-700
                   font-medium hover:bg-slate-200 transition-colors"
      >
        Clear Filters
      </button>
    )}
  </div>

  {/* Results Count */}
  <p className="text-sm text-slate-500 mt-3">
    Showing <span className="font-semibold text-slate-700">{filteredPlaces.length}</span> of{' '}
    <span className="font-semibold text-slate-700">{places.length}</span> places
  </p>
</div>
```

#### B. Enhance Place Cards (lines 174-224)

**Current:** Basic cards
**Target:** Premium cards with hover states and better shadows

Replace the place cards section with:

```tsx
<div className="space-y-3">
  {pagedPlaces.map((place) => {
    const isExpanded = expandedId === place.id;
    return (
      <div
        key={place.id}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white
                   shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* Card Header */}
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 px-5 py-4
                     text-left hover:bg-slate-50 transition-colors"
          onClick={() => handleToggle(place.id)}
        >
          <div className="flex-1">
            {/* Place Name & Type */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-900">
                {place.name}
              </h3>
              <Badge
                variant="outline"
                className="text-xs font-medium border-slate-300"
              >
                {place.type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {place.description ?? 'No description yet'}
            </p>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {place.tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-slate-100
                               text-slate-600 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {place.tags.length > 4 && (
                  <span className="px-2 py-0.5 text-slate-500 text-xs">
                    +{place.tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-slate-100 transition-colors"
              type="button"
            >
              {isExpanded ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Close
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </>
              )}
            </Button>
          </div>
        </button>

        {/* Expanded Edit Form */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="townId" value={townId} />
              <input type="hidden" name="id" value={place.id} />

              {/* Description Field */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Description
                </label>
                <Textarea
                  name="description"
                  rows={3}
                  defaultValue={place.description ?? ''}
                  className="resize-none border-slate-300 focus:border-[#003580]
                             focus:ring-2 focus:ring-[#003580]/20"
                  placeholder="Add a description..."
                />
              </div>

              {/* Tags Field */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tags
                </label>
                <Input
                  name="tags"
                  defaultValue={(place.tags ?? []).join(', ')}
                  className="h-10 border-slate-300 focus:border-[#003580]
                             focus:ring-2 focus:ring-[#003580]/20"
                  placeholder="comma, separated, tags"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <form action={deleteAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="townId" value={townId} />
                  <input type="hidden" name="id" value={place.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50
                               hover:border-red-300 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
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
```

#### C. Enhance Empty State (lines 152-168)

```tsx
{filteredPlaces.length === 0 && (
  <div className="text-center py-12 px-4">
    <div className="mx-auto w-16 h-16 rounded-full bg-slate-100
                    flex items-center justify-center mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-8 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-1">
      No places found
    </h3>
    <p className="text-sm text-slate-500 mb-4">
      No places match your current filters. Try adjusting your search.
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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                 bg-slate-100 text-sm font-medium text-slate-700
                 hover:bg-slate-200 transition-colors"
    >
      Clear all filters
    </button>
  </div>
)}
```

#### D. Enhance Pagination (lines 229-251)

```tsx
<div className="flex items-center justify-between text-sm text-slate-500 pt-4
                border-t border-slate-100">
  <span className="text-slate-600">
    Showing{' '}
    <span className="font-semibold text-slate-900">
      {pageStart}-{pageEnd}
    </span>{' '}
    of{' '}
    <span className="font-semibold text-slate-900">
      {filteredPlaces.length}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Button>
  </div>
</div>
```

### Step 3: Fix Type Dropdown Placeholder (Issue #21)

**File:** `/Users/carlosmaia/townhub/app/[locale]/admin/page.tsx`

Find the "Create a place" form type dropdown (around line 392) and add the placeholder:

```tsx
<Select name="type" required>
  <SelectTrigger>
    <SelectValue placeholder="Select place type" />  {/* ADD THIS LINE */}
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="LODGING">🏨 Lodging</SelectItem>
    <SelectItem value="RESTAURANT">🍽️ Restaurant</SelectItem>
    <SelectItem value="ATTRACTION">🎭 Attraction</SelectItem>
    <SelectItem value="TOWN_SERVICE">🏛️ Town Service</SelectItem>
  </SelectContent>
</Select>
```

## TESTING

After implementation:
1. Navigate to http://localhost:3000/en/admin
2. Test search functionality (try partial matches, tags)
3. Test type filter dropdown
4. Test sorting (name, rating, date)
5. Test sort order toggle
6. Test clear filters button
7. Test expand/collapse on cards
8. Test edit and save
9. Test delete
10. Test pagination with filters active
11. Verify all hover states work
12. Verify focus states (blue ring) on inputs
13. Check responsive behavior (narrow browser window)

## ACCEPTANCE CRITERIA

**Functionality:**
- ✅ All existing functionality still works
- ✅ Search, filter, sort, pagination working perfectly

**Visual Quality:**
- ✅ Premium appearance (Vercel/Stripe level)
- ✅ Smooth hover states on all interactive elements
- ✅ Focus states with blue ring on inputs
- ✅ Icons add visual clarity
- ✅ Typography hierarchy is clear
- ✅ Cards have proper shadows and transitions
- ✅ Empty state is helpful and well-designed
- ✅ Consistent spacing and alignment
- ✅ Tags display nicely with badges
- ✅ Edit forms have proper visual separation

**Polish:**
- ✅ All animations smooth (200ms transitions)
- ✅ Brand color (#003580) used consistently
- ✅ No visual bugs or rough edges
- ✅ Professional appearance throughout

## EXPECTED OUTCOME

**Before:** Functional but basic (7/10)
**After:** Premium professional (9.5/10)

The place management should look and feel like a Vercel or Stripe admin dashboard - polished, professional, and confidence-inspiring.

Report back when complete with:
1. Summary of changes made
2. Any issues encountered
3. Screenshots or description of the result
