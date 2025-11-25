# Interactive Map Feature - Implementation Plan

**Priority:** P0 (Main Selling Point)
**Status:** Planning Phase
**Start After:** Phase 2 Visual Overhaul Complete
**Estimated Time:** 8-10 hours
**Last Updated:** 2025-11-24

---

## 🎯 VISION

Create a **stunning, interactive map experience** that becomes the #1 feature tourists and citizens use to discover and navigate the town. Think **Airbnb + Booking.com + Theme Park Map** combined into one beautiful, intuitive interface.

### Value Proposition

**For Tourists:**
- Arrive in town → Open app → See EVERYTHING happening at a glance
- No need to search - visual discovery through interactive map
- Instant answers: "What's near me?", "What's happening tonight?", "Where should I eat?"

**For Citizens:**
- Stay informed about community events
- Discover new places they didn't know existed
- See what's trending and popular in real-time

**For Businesses:**
- High visibility on interactive map
- Premium placement options (hot events, featured)
- Direct discovery from map → drive foot traffic

---

## 🎨 DESIGNER TASK: Interactive Map Visual Design

### YOUR MISSION

Design the most **engaging, intuitive, and beautiful** interactive map experience for a small-town discovery app. This is our **#1 selling point** - make it unforgettable.

### CONTEXT

**Target User:** Tourist arriving in Stykkishólmur (population ~1,100)
- Opens app → GPS detects location → Loads town data automatically
- Wants to see: restaurants, hotels, attractions, events, services
- Needs: Quick visual scanning, instant understanding, easy interaction

**Reference Apps:**
1. **Booking.com** - Clean POI markers, hover for details
2. **Airbnb** - Clustered markers, price tags on map
3. **Theme Park Maps** - Icon variety, visual hierarchy, excitement
4. **Google Maps** - Familiar interaction patterns

### DESIGN REQUIREMENTS

#### 1. Map Markers & Icons

**Design Custom Icon Set for Each Category:**

**Places:**
- 🏛️ Town Services (town hall, police, hospital)
- 🛏️ Lodging (hotels, guesthouses, camping)
- 🍽️ Restaurants (cafes, bars, fine dining)
- 📍 Attractions (museums, landmarks, viewpoints)

**Events:**
- 📅 Regular events
- ⭐ Featured/Hot events (with animation)
- 🎉 Town events (official)
- 🔥 Trending events (high RSVPs)

**Requirements:**
- Icons must be **clear at small sizes** (24x24px minimum)
- Use **brand colors** (#003580 primary, accent colors for categories)
- **Consistent style** across all icons
- Consider **day/night mode** (if applicable)

#### 2. Visual States & Animations

**Marker States:**
1. **Default:** Standard icon, subtle shadow
2. **Hover (web) / Focus (mobile):** Scale up 1.2x, show preview card
3. **Selected:** Bright highlight, expand to show full details
4. **Clustered:** Number badge showing count

**Special Visual Treatments:**

**🔥 Hot Events (High RSVPs):**
- Pulsing animation (subtle, not annoying)
- Fire icon overlay or glow effect
- Warm color accent (orange/red)
- Larger marker size

**⏰ Happening Soon (Today/Tomorrow):**
- Subtle clock icon badge
- Animated border pulse (slow)
- Urgency color (yellow/amber)

**⭐ Featured (Premium):**
- Star badge
- Gold accent color
- Priority z-index (appears on top)

**Design Question:** Should we use:
- A) Animated GIF overlays (performance concern?)
- B) CSS/React Native animations (smooth, performant)
- C) Lottie animations (high quality, complex)

**Recommendation:** Start with B (React Native animations), upgrade to C if needed.

#### 3. Info Cards / Tooltips

**Preview Card (Hover/Tap):**
- Shows on marker interaction
- **Content:**
  - Image thumbnail (if available)
  - Name (truncated to 40 chars)
  - Category icon + label
  - Distance from user
  - Rating (if place)
  - Date/time (if event)
  - "Hot" badge (if trending)
- **Size:** Compact (250x150px on web, full width on mobile)
- **Position:** Above marker (web), bottom sheet (mobile)

**Full Details (Tap to Expand):**
- Slide-up panel (mobile) or sidebar (web)
- Full place/event details
- Photos gallery
- Action buttons (directions, save, RSVP, visit website)

**Design Challenge:** How to show rich info without covering the map?

**Proposed Solution:**
- **Mobile:** Bottom sheet that user can drag up/down
- **Web:** Sidebar panel that slides in from left, map adjusts width

#### 4. Filters & Controls

**Filter Bar (Top of Map):**
- Horizontal scrollable chips
- Categories: All, Restaurants, Hotels, Attractions, Services, Events
- Active state: Brand color background
- Count badges: "(12)" next to each category

**Special Filters:**
- "Happening Today" toggle
- "Hot Events" toggle
- "Near Me" toggle (shows only within X km)
- Distance slider (0-10 km)

**Search Bar:**
- Sticky at top
- Auto-suggest as user types
- Search by: name, category, tag
- Shows results both as list AND map markers

#### 5. Map Clustering

**Problem:** 30+ places + 10+ events = cluttered map

**Solution:** Cluster nearby markers
- Show count badge on cluster (e.g., "8")
- Tap cluster → Zoom in to reveal individual markers
- Color-code clusters by dominant category

**Design Specs:**
- Cluster radius: 50-100px depending on zoom level
- Cluster icon: Circle with count number
- Cluster colors:
  - Mixed categories: Gray
  - Single category: Category color

#### 6. Visual Hierarchy & Polish

**Key Principles:**
1. **Hot events** should be **immediately eye-catching** (animations, colors)
2. **Town events** should stand out (official badge)
3. **Regular places** should be **clear but not distracting**
4. **User location** should be prominent (blue dot with pulse)

**Polish Details:**
- Smooth transitions when zooming/panning
- Skeleton loading state while map loads
- Empty state if no results found
- Offline fallback message

#### 7. Mobile-Specific Considerations

**Gestures:**
- Single tap → Show preview card
- Double tap → Zoom in
- Two-finger pinch → Zoom in/out
- Drag → Pan map
- Swipe up on preview → Expand to full details

**Bottom Navigation Overlap:**
- Map should extend behind tab bar (with padding)
- Important markers should not be hidden by UI

**Performance:**
- Only render visible markers (viewport culling)
- Lazy load images
- Throttle pan/zoom events

---

### DELIVERABLES FROM DESIGNER

Please provide:

1. **High-Fidelity Mockups**
   - Map view with 10-15 markers (mixed types)
   - Show at least 2 hot events with animations
   - Preview card design (hover/tap state)
   - Full details panel (expanded state)
   - Filter bar (active/inactive states)
   - Cluster markers (different counts)

2. **Icon Set**
   - All category icons (24x24, 32x32, 48x48 sizes)
   - Special state icons (hot, featured, town event)
   - Export as SVG and PNG

3. **Animation Specifications**
   - Hot event pulse animation (duration, easing, colors)
   - Happening soon border pulse
   - Marker tap/hover transitions
   - Cluster expand animation

4. **Color Palette**
   - Marker colors for each category
   - Hot event accent color
   - Featured accent color
   - Town event accent color
   - Neutral/inactive states

5. **Interaction Flows**
   - User journey: Open app → See map → Filter → Tap marker → View details → Navigate
   - Edge cases: No GPS, No results, Offline mode

6. **Component Specifications**
   - Exact spacing, padding, border radius
   - Font sizes, weights, colors
   - Shadow/elevation values
   - Z-index hierarchy

---

### DESIGN QUESTIONS TO ANSWER

1. **Icon Style:** Flat, outlined, or filled?
2. **Map Style:** Light, dark, or custom branded?
3. **Animation Speed:** Fast (200ms) or slow (500ms) for pulses?
4. **Hot Event Indicator:** Fire emoji, flame icon, or glow effect?
5. **Cluster Style:** Circular badge or custom shape?
6. **Info Card:** White background or semi-transparent overlay?
7. **Mobile Bottom Sheet:** Peek height (100px, 150px, 200px)?

---

### SUCCESS CRITERIA

Your design should:
- ✅ Be **instantly understandable** (no tutorial needed)
- ✅ Make **hot events pop** visually (can't miss them)
- ✅ Feel **fast and smooth** (60fps animations)
- ✅ Work on **small screens** (iPhone SE, 320px width)
- ✅ Be **accessible** (color contrast, touch targets ≥44px)
- ✅ Feel **premium** (polish, attention to detail)
- ✅ Match **brand identity** (colors, typography, tone)

---

### INSPIRATION LINKS

- **Airbnb Map:** https://airbnb.com (search any city, view map)
- **Booking.com Map:** https://booking.com (hotels, show map)
- **Disney Park Map:** Visual hierarchy, icon variety
- **Google Maps Live View:** AR overlays (future inspiration)

---

## 🛠️ ENGINEER TASK: Interactive Map Implementation

### PHASE 1: Foundation (2-3 hours)

**Goal:** Get basic interactive map working with markers

**Tasks:**

1. **Setup Map Component** (30 min)
   - Create `components/map/InteractiveMap.tsx`
   - Use `react-native-maps` (already installed)
   - Configure initial region (Stykkishólmur coordinates)
   - Add user location marker

2. **Fetch Map Data** (45 min)
   - Create `hooks/useMapData.ts`
   - Fetch places + events from API
   - Filter by selected categories
   - Transform to marker format

3. **Render Basic Markers** (45 min)
   - Place markers for each location
   - Event markers for each event
   - Use emoji icons temporarily (proper icons in Phase 2)
   - Handle marker tap → Show alert with name

4. **Add Filter Bar** (30 min)
   - Horizontal scroll of category chips
   - Toggle categories on/off
   - Update visible markers based on filters

**Acceptance Criteria:**
- ✅ Map loads centered on Stykkishólmur
- ✅ Shows all places and events as markers
- ✅ Tapping marker shows place/event name
- ✅ Filters work (show/hide categories)

---

### PHASE 2: Polish & Interactions (3-4 hours)

**Goal:** Add preview cards, animations, and custom icons

**Tasks:**

1. **Custom Marker Icons** (1 hour)
   - Replace emojis with Designer's icon set
   - Create `MarkerIcon` component
   - Support different sizes (default, hot, featured)
   - Add category colors

2. **Preview Cards** (1 hour)
   - Show card on marker tap
   - Display: image, name, category, distance, rating
   - Position above marker (mobile: bottom sheet)
   - Swipe up to expand to full details

3. **Hot Event Animations** (1 hour)
   - Identify hot events (rsvpCount > threshold)
   - Add pulsing animation to hot markers
   - Fire icon overlay
   - Warm color accent

4. **Happening Soon Badge** (30 min)
   - Identify events today/tomorrow
   - Add clock icon badge
   - Subtle border pulse animation

5. **Marker Clustering** (1 hour)
   - Group nearby markers when zoomed out
   - Show count badge on clusters
   - Tap cluster → Zoom in to reveal markers
   - Use `react-native-map-clustering` library

**Acceptance Criteria:**
- ✅ Custom icons for all categories
- ✅ Preview cards show rich info
- ✅ Hot events pulse/animate
- ✅ Events today/tomorrow have clock badge
- ✅ Markers cluster when zoomed out

---

### PHASE 3: Advanced Features (3-4 hours)

**Goal:** GPS detection, search, routing, premium polish

**Tasks:**

1. **GPS Auto-Detection** (1 hour)
   - Get user's current location
   - Reverse geocode to town name
   - Auto-load town data
   - Fallback: Manual town selection

2. **Search Functionality** (1 hour)
   - Search bar at top of map
   - Auto-suggest results
   - Highlight matching markers
   - Pan to selected result

3. **Directions Integration** (1 hour)
   - "Get Directions" button on detail cards
   - Open native maps app (Google Maps / Apple Maps)
   - Pass coordinates and name

4. **Performance Optimization** (1 hour)
   - Viewport culling (only render visible markers)
   - Lazy load marker images
   - Throttle pan/zoom callbacks
   - Memoize marker components

**Acceptance Criteria:**
- ✅ App detects user location on launch
- ✅ Search finds places/events by name
- ✅ Directions open native maps app
- ✅ Smooth performance (60fps) with 50+ markers

---

## 📋 TECHNICAL REQUIREMENTS

### Dependencies

**Already Installed:**
- `react-native-maps` (v1.26.18)
- `@tanstack/react-query` (data fetching)

**Need to Install:**
- `react-native-map-clustering` (marker clustering)
- `expo-location` (GPS access)
- `@expo/vector-icons` or custom SVG icons

### API Endpoints Needed

1. **GET /api/map/data**
   - Returns all places + events for a town
   - Params: `townId`, `categories[]`, `dateRange`
   - Response:
     ```json
     {
       "places": [
         {
           "id": "uuid",
           "name": "Restaurant Name",
           "type": "RESTAURANT",
           "latitude": 65.0752,
           "longitude": -22.7339,
           "imageUrl": "...",
           "rating": 4.5,
           "ratingCount": 12,
           "distance": 1.2
         }
       ],
       "events": [
         {
           "id": "uuid",
           "name": "Event Name",
           "latitude": 65.0752,
           "longitude": -22.7339,
           "startDate": "2025-11-24T18:00:00Z",
           "imageUrl": "...",
           "rsvpCount": 45,
           "isTownEvent": true,
           "isFeatured": false,
           "isHot": true
         }
       ]
     }
     ```

2. **GET /api/towns/detect**
   - Reverse geocode coordinates to town
   - Params: `lat`, `lng`
   - Response: `{ townId: "...", name: "Stykkishólmur" }`

### Data Model Updates

**Add to Place model:**
- `latitude: Float`
- `longitude: Float`

**Add to Event model:**
- `latitude: Float?` (optional, uses venue's location if null)
- `longitude: Float?`

**Add to Event model (computed):**
- `isHot: Boolean` (rsvpCount > threshold, e.g., 20)
- `isHappeningSoon: Boolean` (startDate within 48 hours)

### Map Configuration

**Initial Region (Stykkishólmur):**
```typescript
{
  latitude: 65.0752,
  longitude: -22.7339,
  latitudeDelta: 0.05, // Zoom level
  longitudeDelta: 0.05,
}
```

**Marker Clustering Config:**
- Cluster radius: 60px
- Min zoom for clustering: 10
- Max zoom: 18

---

## 🎭 WORKFLOW

### Step-by-Step Execution Plan

**1. Designer Phase (2-3 days parallel to Phase 2 visual work)**
   - Designer reads this document
   - Creates high-fidelity mockups
   - Designs icon set
   - Specifies animations
   - Delivers assets + specs

**2. Architect Review (1 hour)**
   - Review Designer's mockups
   - Validate feasibility
   - Provide feedback
   - Approve design

**3. Engineer Phase 1 (2-3 hours)**
   - Implement basic map
   - Get markers showing
   - Add filters
   - Report back for review

**4. Architect Review + Designer Feedback (30 min)**
   - Test basic functionality
   - Designer reviews against mockups
   - Approve or request changes

**5. Engineer Phase 2 (3-4 hours)**
   - Add custom icons
   - Implement preview cards
   - Add animations
   - Report back for review

**6. Architect Review + Designer Feedback (30 min)**
   - Test interactions
   - Designer reviews polish
   - Approve or request changes

**7. Engineer Phase 3 (3-4 hours)**
   - GPS detection
   - Search
   - Directions
   - Performance optimization
   - Report back for review

**8. Final QA (1 hour)**
   - QA Agent tests all functionality
   - Real device testing (iOS + Android)
   - Performance testing
   - Edge case testing

**9. Launch! 🚀**

---

## 🎯 SUCCESS METRICS

### User Engagement
- **Target:** 80% of users open map within first session
- **Target:** Average 5+ marker taps per session
- **Target:** 30% conversion from map view → place/event details

### Performance
- **Target:** Map loads in < 2 seconds
- **Target:** 60fps animations on mid-range devices
- **Target:** Smooth panning with 50+ markers

### Business Impact
- **Target:** 50% increase in place/event discovery
- **Target:** Premium businesses see 3x more views
- **Target:** Hot events get 2x more RSVPs

---

## 🚨 RISKS & MITIGATION

### Risk 1: Performance Issues with Many Markers
**Mitigation:**
- Implement clustering early
- Viewport culling
- Lazy loading
- Test with 100+ markers

### Risk 2: GPS Not Available
**Mitigation:**
- Fallback to IP geolocation
- Manual town selection
- Remember last town

### Risk 3: Complex Animations Lag on Low-End Devices
**Mitigation:**
- Feature detection (disable animations if FPS drops)
- Use native driver for animations
- Simplify effects if needed

### Risk 4: Map API Costs
**Mitigation:**
- Self-host map tiles if volume grows
- Cache tile data
- Monitor usage limits

---

## 📦 DELIVERABLES CHECKLIST

### Designer Deliverables
- [ ] High-fidelity mockups (3+ screens)
- [ ] Icon set (SVG + PNG, all sizes)
- [ ] Animation specs (duration, easing, colors)
- [ ] Color palette for markers
- [ ] Component specifications (spacing, fonts, shadows)

### Engineer Deliverables
- [ ] Interactive map component
- [ ] Custom marker icons
- [ ] Preview cards (tap interaction)
- [ ] Filter functionality
- [ ] Hot event animations
- [ ] Happening soon badges
- [ ] Marker clustering
- [ ] GPS auto-detection
- [ ] Search functionality
- [ ] Directions integration
- [ ] Performance optimizations

### QA Deliverables
- [ ] Test report (all features tested)
- [ ] Performance benchmarks
- [ ] Edge case testing results
- [ ] Real device testing (iOS + Android)

---

## 🎉 LAUNCH PLAN

### Pre-Launch
1. Beta test with 10 local users
2. Gather feedback on UX
3. Fix critical bugs
4. Performance tune

### Launch Day
1. Enable map feature in app
2. Announce on social media
3. Create demo video
4. Update app store screenshots

### Post-Launch
1. Monitor analytics
2. Collect user feedback
3. A/B test hot event animations
4. Plan v2 features (AR view?)

---

## 🔮 FUTURE ENHANCEMENTS (V2)

- **AR View:** Point camera → See overlays of nearby places
- **Route Planning:** Multi-stop itinerary builder
- **Social:** See where friends are checking in
- **Offline Maps:** Download town data for offline use
- **Live Events:** Real-time updates (concert starting soon!)
- **Heatmap:** Show popular areas by time of day
- **Street View:** Integrated panoramic photos

---

**This is our killer feature. Let's make it unforgettable. 🚀**

---

**Created:** 2025-11-24
**Status:** Planning
**Start Date:** TBD (after Phase 2 visual complete)
**Team:** Designer + Engineer + Architect + QA
**Priority:** P0 (Main Selling Point)
