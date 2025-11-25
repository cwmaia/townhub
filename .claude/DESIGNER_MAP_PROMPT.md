# Designer Prompt: Interactive Map Feature

**Copy this entire prompt to give to the Designer Agent**

---

## YOUR MISSION

Design the **most engaging, intuitive, and beautiful interactive map** for TownHub - a small-town discovery app. This is our **#1 selling point** and main competitive advantage.

## CONTEXT

**The Vision:**
Tourist arrives in Stykkishólmur (small Icelandic town, ~1,100 people) → Opens app → GPS detects location → Beautiful interactive map shows EVERYTHING happening in town at a glance.

**Reference Apps:**
- **Booking.com** - Clean POI markers, hover previews
- **Airbnb** - Clustered markers, price overlays, smooth interactions
- **Theme Park Maps** - Icon variety, visual excitement, instant understanding
- **Google Maps** - Familiar patterns, search, directions

**Key Insight:** This needs to feel like a **premium, theme-park-quality map** where every restaurant, hotel, event, and attraction is immediately visible and discoverable. Hot events should **pop** visually (animations, fire icons, pulsing).

## REQUIREMENTS

### 1. Custom Icon Set (CRITICAL)

Design **distinct, recognizable icons** for:

**Places:**
- 🏛️ Town Services (city hall, police, hospital)
- 🛏️ Lodging (hotels, guesthouses)
- 🍽️ Restaurants (dining, cafes, bars)
- 📍 Attractions (museums, viewpoints, landmarks)

**Events:**
- 📅 Regular events (concerts, markets, classes)
- ⭐ Featured events (premium/sponsored)
- 🎉 Town events (official community events)
- 🔥 Hot events (trending, high RSVPs)

**Requirements:**
- Clear at 24x24px minimum
- Use brand colors (#003580 primary + category accents)
- Consistent style (flat/outlined/filled?)
- Work on both light and dark backgrounds

**Deliverable:** SVG + PNG exports (24x24, 32x32, 48x48 sizes)

---

### 2. Visual States & Animations

**Standard Marker States:**
- Default: Clean icon with subtle shadow
- Hover/Focus: Scale 1.2x, show glow
- Selected: Bright highlight, expand
- Clustered: Circle badge with count

**Special Visual Treatments:**

**🔥 Hot Events (High RSVPs):**
- Needs to be **IMPOSSIBLE TO MISS**
- Options:
  - Pulsing animation (subtle, elegant)
  - Fire icon overlay or glow effect
  - Warm color (orange/red gradient)
  - Larger size (1.5x normal)
- **This is critical** - hot events are a key selling point

**⏰ Happening Soon (Today/Tomorrow):**
- Clock icon badge
- Animated border pulse (slow, 2s cycle)
- Urgency color (yellow/amber)

**⭐ Featured (Premium/Sponsored):**
- Star badge overlay
- Gold accent color
- Higher z-index (appears on top)

**Design Challenge:** Make hot events exciting WITHOUT making the map feel chaotic or overwhelming.

**Deliverable:** Animation specs (duration, easing, colors, keyframes)

---

### 3. Info Cards & Tooltips

**Preview Card (Marker Tap/Hover):**

Shows when user taps/hovers on marker:
- Image thumbnail (rounded corners)
- Name (bold, 18px, truncate at 40 chars)
- Category icon + label (12px, muted)
- Distance from user ("1.2 km away")
- Rating (⭐ 4.5 with count)
- Date/time (if event)
- "Hot" or "Featured" badge (if applicable)

**Size:**
- Web: 280x180px card above marker
- Mobile: Full-width bottom sheet (peek: 120px)

**Full Details (Tap to Expand):**
- Mobile: Swipeable bottom sheet (drag up to full screen)
- Web: Sidebar panel slides in from left (400px width)
- Content: Photos gallery, full description, action buttons (directions, RSVP, save)

**Design Challenge:** Show rich information without covering the map too much.

**Deliverable:** High-fidelity mockups of preview card + full detail view

---

### 4. Filters & Controls

**Filter Bar (Top of Map):**
- Horizontal scrollable chips
- Categories: "All", "Restaurants", "Hotels", "Attractions", "Events", "Services"
- Active state: Brand color background (#003580)
- Count badges: "Restaurants (8)"
- Smooth scroll animation

**Special Toggles:**
- "Happening Today" (events only)
- "Hot Events" (show only trending)
- "Near Me" (within X km radius)

**Search Bar:**
- Sticky at top (or integrated in filter bar?)
- Auto-suggest dropdown
- Search by name, category, or tag
- Results shown as list + highlighted markers

**Deliverable:** Filter bar mockup (active/inactive states)

---

### 5. Map Clustering

**Problem:** 30+ places + 10+ events = cluttered map at low zoom levels

**Solution:** Group nearby markers into clusters

**Cluster Design:**
- Circular badge showing count (e.g., "8")
- Color-coded by dominant category
  - Mixed: Gray (#6b7280)
  - Single category: Category color
- Size scales with count (5 items = small, 20+ items = large)
- Tap to zoom in and reveal individual markers

**Deliverable:** Cluster marker designs (small, medium, large sizes)

---

### 6. Visual Hierarchy & Polish

**Priorities (most → least prominent):**
1. 🔥 Hot events (pulsing, fire effect)
2. ⏰ Happening soon (clock badge)
3. ⭐ Featured places/events (star badge)
4. 📍 User location (blue dot with pulse)
5. Regular places/events (standard icons)

**Polish Details:**
- Smooth zoom/pan transitions (300ms ease-out)
- Skeleton loading while map loads
- Empty state: "No results found - try adjusting filters"
- Offline mode: "Map unavailable - check connection"

**Deliverable:** Full map view mockup showing visual hierarchy

---

### 7. Mobile-Specific Design

**Gestures:**
- Single tap → Show preview card
- Long press → Pin location
- Two-finger pinch → Zoom
- Swipe up on preview → Expand to details

**Bottom Nav Overlap:**
- Map extends behind tab bar (with safe padding)
- Important markers not hidden by UI

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Generous tap area around markers

**Deliverable:** Mobile interaction flow diagram

---

## DELIVERABLES CHECKLIST

Please provide:

1. **High-Fidelity Mockups (3-5 screens):**
   - [ ] Map overview with 10-15 markers (mixed types)
   - [ ] At least 2 hot events with fire/pulse animations
   - [ ] Preview card (tap/hover state)
   - [ ] Full details panel (expanded)
   - [ ] Filter bar (active + inactive states)
   - [ ] Cluster markers (different sizes/counts)
   - [ ] Empty state + loading state

2. **Icon Set:**
   - [ ] All category icons (4 place types, 4 event types)
   - [ ] Special badges (hot, featured, town event, happening soon)
   - [ ] User location marker
   - [ ] Cluster markers
   - [ ] Export as SVG + PNG (multiple sizes)

3. **Animation Specifications:**
   - [ ] Hot event pulse (duration, easing, colors, loop?)
   - [ ] Happening soon border pulse
   - [ ] Marker tap/select transitions
   - [ ] Cluster expand animation
   - [ ] Preview card slide-in

4. **Color Palette:**
   - [ ] Marker colors for each category
   - [ ] Hot event accent (orange/red?)
   - [ ] Featured accent (gold?)
   - [ ] Town event accent (blue?)
   - [ ] Neutral states (gray)

5. **Component Specs:**
   - [ ] Spacing, padding, border radius
   - [ ] Font sizes, weights, line heights
   - [ ] Shadow/elevation values
   - [ ] Z-index hierarchy

6. **Interaction Flows:**
   - [ ] User journey: Open map → Filter → Tap marker → View details → Navigate
   - [ ] Edge cases: No GPS, no results, offline mode

---

## KEY DESIGN QUESTIONS

Please answer these in your design:

1. **Icon Style:** Flat, outlined, filled, or mixed?
2. **Map Theme:** Light, dark, or custom branded style?
3. **Hot Event Animation:** Fire emoji 🔥, custom icon, or glow effect?
4. **Animation Speed:** Fast (200ms) or slow (500ms) for pulses?
5. **Cluster Style:** Simple circle or custom shape with category icon?
6. **Info Card Background:** Solid white, semi-transparent, or blurred?
7. **Mobile Bottom Sheet:** Peek height (100px, 150px, 200px)?

---

## SUCCESS CRITERIA

Your design should:
- ✅ Be **instantly understandable** (no tutorial needed)
- ✅ Make **hot events visually pop** (impossible to miss)
- ✅ Feel **premium and polished** (attention to detail)
- ✅ Work on **small screens** (iPhone SE, 320px width)
- ✅ Be **accessible** (WCAG AA color contrast)
- ✅ Match **brand identity** (#003580 primary color)
- ✅ Feel **fast** (smooth animations, no jank)

---

## INSPIRATION

**What to Study:**
- Airbnb map view (search NYC, view map)
- Booking.com property map
- Disney theme park maps (visual excitement)
- Apple Maps look around (smooth interactions)

**What Makes Them Great:**
- Clear visual hierarchy
- Smooth, delightful animations
- Information density without clutter
- Intuitive interactions

---

## TIMELINE

**Phase:** After Phase 2 visual overhaul completes
**Design Time:** 2-3 days (parallel to other work)
**Review:** Architect approval before Engineer implementation

---

## CONTEXT FOR DESIGNERS

**Brand Colors:**
- Primary: #003580 (deep blue)
- Secondary: #0f172a (dark slate)
- Text: #111827 (near black)
- Muted: #6b7280 (gray)
- Background: #ffffff (white)

**Typography:**
- System font (San Francisco on iOS, Roboto on Android)
- Headings: 700 weight
- Body: 400 weight
- Small text: 600 weight

**Spacing Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Border Radius:**
- Small: 8px
- Medium: 12px
- Large: 20px
- XL: 24px

---

## FINAL NOTE

This is **THE** feature that will make TownHub special. Tourists should open the app and say "Wow, this is beautiful and useful."

Make it a **banger**. 🚀

---

**Full Implementation Plan:** See `/Users/carlosmaia/townhub/.claude/INTERACTIVE_MAP_FEATURE_PLAN.md` for technical details and Engineer tasks.

**Questions?** Ask the Architect for clarification before starting.

**Ready?** Begin designing! Show us something amazing. ✨
