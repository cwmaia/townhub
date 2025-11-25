# ENGINEER TASK: Implement Place Management Filtering and Sorting

## OBJECTIVE
Add professional filtering, search, and sorting functionality to the Place management section in the admin dashboard.

## CONTEXT
- File: `/Users/carlosmaia/townhub/app/[locale]/admin/PlaceListClient.tsx`
- Current state: Basic pagination exists, but no filtering or sorting
- Database: 30 places with types: RESTAURANT, LODGING, ATTRACTION, TOWN_SERVICE

## IMPLEMENTATION

### Step 1: Read the existing file
Read `/Users/carlosmaia/townhub/app/[locale]/admin/PlaceListClient.tsx` to understand current structure.

### Step 2: Add State Management
Add these state variables (use React.useState):
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [typeFilter, setTypeFilter] = useState<string>('all')
const [sortBy, setSortBy] = useState<'name' | 'rating' | 'createdAt'>('name')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
```

### Step 3: Implement Filtering Logic
Create a filtered and sorted list:
```typescript
const filteredPlaces = places
  .filter(place => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Type filter
    const matchesType = typeFilter === 'all' || place.type === typeFilter

    return matchesSearch && matchesType
  })
  .sort((a, b) => {
    let comparison = 0

    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'rating') {
      comparison = (a.rating || 0) - (b.rating || 0)
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })
```

### Step 4: Update UI - Add Filter Controls
Add these controls ABOVE the place list (in the existing section that shows "Browse, search, and edit places"):

```tsx
<div className="flex flex-wrap items-center gap-3 mb-4">
  {/* Search Input */}
  <input
    type="text"
    placeholder="Search places by name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="flex-1 min-w-[200px] h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
  />

  {/* Type Filter */}
  <select
    value={typeFilter}
    onChange={(e) => setTypeFilter(e.target.value)}
    className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
  >
    <option value="all">All Types</option>
    <option value="RESTAURANT">Restaurants</option>
    <option value="LODGING">Lodging</option>
    <option value="ATTRACTION">Attractions</option>
    <option value="TOWN_SERVICE">Town Services</option>
  </select>

  {/* Sort By */}
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value as any)}
    className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
  >
    <option value="name">Sort by Name</option>
    <option value="rating">Sort by Rating</option>
    <option value="createdAt">Sort by Date Created</option>
  </select>

  {/* Sort Order Toggle */}
  <button
    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
    className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-50"
  >
    {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
  </button>

  {/* Clear Filters */}
  {(searchQuery || typeFilter !== 'all' || sortBy !== 'name') && (
    <button
      onClick={() => {
        setSearchQuery('')
        setTypeFilter('all')
        setSortBy('name')
        setSortOrder('asc')
      }}
      className="h-9 px-3 rounded-md bg-slate-100 text-sm text-slate-700 hover:bg-slate-200"
    >
      Clear Filters
    </button>
  )}
</div>

{/* Results count */}
<p className="text-sm text-slate-500 mb-3">
  Showing {filteredPlaces.length} of {places.length} places
</p>
```

### Step 5: Update the Place List
Replace the `places.map()` with `filteredPlaces.map()` to show filtered results.

### Step 6: Handle Empty States
Add this after the filter controls:
```tsx
{filteredPlaces.length === 0 && (
  <div className="text-center py-8 text-slate-500">
    <p>No places found matching your filters.</p>
    <button
      onClick={() => {
        setSearchQuery('')
        setTypeFilter('all')
      }}
      className="mt-2 text-sm text-blue-600 hover:underline"
    >
      Clear filters
    </button>
  </div>
)}
```

## ACCEPTANCE CRITERIA
- ✅ Search input filters places by name (case-insensitive)
- ✅ Type dropdown filters by RESTAURANT, LODGING, ATTRACTION, TOWN_SERVICE
- ✅ Sort dropdown sorts by name, rating, or created date
- ✅ Sort order toggle switches between ascending/descending
- ✅ Clear filters button resets all filters
- ✅ Results count shows "X of Y places"
- ✅ Empty state shows when no results match
- ✅ Existing pagination still works
- ✅ UI is clean and professional

## TESTING
After implementation:
1. Test search with partial matches
2. Test each type filter
3. Test each sort option
4. Test sort order toggle
5. Test clear filters button
6. Test combinations (search + filter + sort)

Report back when complete with a summary of what was implemented.
