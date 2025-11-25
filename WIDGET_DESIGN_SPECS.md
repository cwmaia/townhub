# TownHub Widget Design Specifications

**Purpose:** Professional, scannable weather/aurora/road widgets
**Target:** Demo-ready visual quality (Airbnb/Booking.com level)
**Implementation:** React Native StyleSheet with exact measurements

---

## Design Philosophy

**Core Principles:**
1. **Data-First:** Primary metric is hero-sized and immediately visible
2. **Visual Hierarchy:** Clear distinction between primary/secondary information
3. **Balanced Spacing:** Generous padding, logical grouping
4. **Professional Polish:** Subtle details that elevate quality
5. **Scannable:** All 3 widgets readable at a glance

**Inspiration:**
- Apple Weather (big data, small labels)
- Airbnb cards (clean hierarchy, perfect spacing)
- Notion widgets (compact but readable)

---

## Overall Layout

### Container Specifications

```
┌─────────────────────────────────────────────────────────┐
│  [Weather]      [Aurora]       [Road Conditions]        │
│   ~33%           ~33%             ~33%                   │
└─────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Height: `170px` (fixed for all 3 widgets)
- Width: Flex 1 with `8px` gap between widgets
- Border radius: `20px` (smooth, modern)
- Border: `1px solid` (subtle definition)

**Spacing:**
- Container gap: `8px` (between widgets)
- Internal padding: `20px` (generous breathing room)
- Minimum width per widget: `100px` (320px screen ÷ 3 - gaps)

---

## 1. Weather Widget Design

### Visual Hierarchy (Top to Bottom)

```
┌──────────────────────────┐
│  ☀️  Weather            │  ← Label + Icon
│                          │
│     27°                  │  ← Hero Temperature
│  Partly cloudy           │  ← Description
│                          │
│  💨 5 m/s                │  ← Wind
│                          │
│  M  T  W  T  F           │  ← 5-day forecast
│  25 26 24 23 22          │
└──────────────────────────┘
```

### Detailed Specifications

**Background:**
```typescript
backgroundColor: '#dbeafe'  // Light blue (existing)
borderColor: '#93c5fd'      // Medium blue border
borderWidth: 1
borderRadius: 20
padding: 20
```

**Icon + Label Row:**
```typescript
// Container
flexDirection: 'row'
alignItems: 'center'
marginBottom: 4

// Icon
fontSize: 18  // Emoji size
marginRight: 6

// Label
fontSize: 11
fontWeight: '600'
color: '#1e40af'  // Dark blue
textTransform: 'uppercase'
letterSpacing: 0.5
```

**Hero Temperature:**
```typescript
fontSize: 48         // LARGE - hero size
fontWeight: '700'    // Bold
color: '#1e3a8a'     // Very dark blue
lineHeight: 52
marginTop: 8
marginBottom: 4
```

**Description:**
```typescript
fontSize: 14
fontWeight: '400'
color: '#1e40af'  // Dark blue
marginBottom: 12
```

**Wind Row:**
```typescript
// Container
flexDirection: 'row'
alignItems: 'center'
marginBottom: 12

// Icon (💨)
fontSize: 14
marginRight: 4

// Text
fontSize: 13
fontWeight: '500'
color: '#3b82f6'  // Medium blue
```

**5-Day Forecast:**
```typescript
// Container
flexDirection: 'row'
justifyContent: 'space-between'
marginTop: 'auto'  // Push to bottom
paddingTop: 8
borderTopWidth: 1
borderTopColor: 'rgba(59, 130, 246, 0.2)'  // Subtle separator

// Day labels (M, T, W...)
fontSize: 10
fontWeight: '600'
color: '#60a5fa'  // Light blue
textAlign: 'center'
marginBottom: 2

// Temperatures
fontSize: 12
fontWeight: '700'
color: '#1e40af'  // Dark blue
textAlign: 'center'
```

### Complete StyleSheet

```typescript
// Weather Widget Styles
weather: {
  flex: 1,
  height: 170,
  backgroundColor: '#dbeafe',
  borderColor: '#93c5fd',
  borderWidth: 1,
  borderRadius: 20,
  padding: 20,
},
weatherHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
weatherIcon: {
  fontSize: 18,
  marginRight: 6,
},
weatherLabel: {
  fontSize: 11,
  fontWeight: '600',
  color: '#1e40af',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
weatherTemp: {
  fontSize: 48,
  fontWeight: '700',
  color: '#1e3a8a',
  lineHeight: 52,
  marginTop: 8,
  marginBottom: 4,
},
weatherDesc: {
  fontSize: 14,
  fontWeight: '400',
  color: '#1e40af',
  marginBottom: 12,
},
weatherWind: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
weatherWindIcon: {
  fontSize: 14,
  marginRight: 4,
},
weatherWindText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#3b82f6',
},
weatherForecast: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 'auto',
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: 'rgba(59, 130, 246, 0.2)',
},
weatherForecastDay: {
  alignItems: 'center',
  flex: 1,
},
weatherDayLabel: {
  fontSize: 10,
  fontWeight: '600',
  color: '#60a5fa',
  marginBottom: 2,
},
weatherDayTemp: {
  fontSize: 12,
  fontWeight: '700',
  color: '#1e40af',
},
```

---

## 2. Aurora Widget Design

### Visual Hierarchy (Top to Bottom)

```
┌──────────────────────────┐
│  🌌  Aurora              │  ← Label + Icon
│                          │
│     7.2/9                │  ← Hero KP Index
│                          │
│  85% visibility          │  ← Visibility %
│  Very high chance        │  ← Description
│                          │
│  Next peak: 22:00        │  ← Additional info
└──────────────────────────┘
```

### Detailed Specifications

**Background:**
```typescript
backgroundColor: '#e9d5ff'  // Light purple (existing)
borderColor: '#c084fc'      // Medium purple border
borderWidth: 1
borderRadius: 20
padding: 20
```

**Icon + Label Row:**
```typescript
// Same structure as weather
fontSize: 11
fontWeight: '600'
color: '#6b21a8'  // Dark purple
```

**Hero KP Index:**
```typescript
fontSize: 48         // LARGE - hero size
fontWeight: '700'    // Bold
color: '#581c87'     // Very dark purple
lineHeight: 52
marginTop: 8
marginBottom: 4
```

**Visibility Percentage:**
```typescript
fontSize: 16
fontWeight: '600'
color: '#7c3aed'  // Medium purple
marginBottom: 6
```

**Description:**
```typescript
fontSize: 13
fontWeight: '400'
color: '#8b5cf6'  // Light purple
marginBottom: 12
```

**Next Peak Info:**
```typescript
// Container
marginTop: 'auto'  // Push to bottom
backgroundColor: 'rgba(124, 58, 237, 0.15)'  // Subtle highlight
padding: 8
borderRadius: 12

// Text
fontSize: 12
fontWeight: '600'
color: '#6b21a8'  // Dark purple
textAlign: 'center'
```

### Complete StyleSheet

```typescript
// Aurora Widget Styles
aurora: {
  flex: 1,
  height: 170,
  backgroundColor: '#e9d5ff',
  borderColor: '#c084fc',
  borderWidth: 1,
  borderRadius: 20,
  padding: 20,
},
auroraHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
auroraIcon: {
  fontSize: 18,
  marginRight: 6,
},
auroraLabel: {
  fontSize: 11,
  fontWeight: '600',
  color: '#6b21a8',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
auroraKP: {
  fontSize: 48,
  fontWeight: '700',
  color: '#581c87',
  lineHeight: 52,
  marginTop: 8,
  marginBottom: 4,
},
auroraVisibility: {
  fontSize: 16,
  fontWeight: '600',
  color: '#7c3aed',
  marginBottom: 6,
},
auroraDesc: {
  fontSize: 13,
  fontWeight: '400',
  color: '#8b5cf6',
  marginBottom: 12,
},
auroraPeak: {
  marginTop: 'auto',
  backgroundColor: 'rgba(124, 58, 237, 0.15)',
  padding: 8,
  borderRadius: 12,
},
auroraPeakText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#6b21a8',
  textAlign: 'center',
},
```

---

## 3. Road Conditions Widget Design

### Visual Hierarchy (Top to Bottom)

```
┌──────────────────────────┐
│  🚗  Road conditions     │  ← Label + Icon
│                          │
│     ✅ Good              │  ← Hero Status
│                          │
│  All routes clear        │  ← Description
│  No warnings             │  ← Additional info
│                          │
│  📍 View map             │  ← CTA
└──────────────────────────┘
```

### Detailed Specifications

**Background:**
```typescript
backgroundColor: '#fef3c7'  // Light yellow (existing)
borderColor: '#fbbf24'      // Medium yellow border
borderWidth: 1
borderRadius: 20
padding: 20
```

**Icon + Label Row:**
```typescript
fontSize: 11
fontWeight: '600'
color: '#92400e'  // Dark orange/brown
```

**Hero Status:**
```typescript
// Container
flexDirection: 'row'
alignItems: 'center'
marginTop: 8
marginBottom: 8

// Status Icon (✅)
fontSize: 32
marginRight: 8

// Status Text ("Good")
fontSize: 32
fontWeight: '700'
color: '#78350f'  // Dark brown
```

**Description:**
```typescript
fontSize: 14
fontWeight: '500'
color: '#b45309'  // Medium brown
marginBottom: 4
```

**Additional Info:**
```typescript
fontSize: 13
fontWeight: '400'
color: '#d97706'  // Light brown
marginBottom: 12
```

**CTA Button:**
```typescript
// Container
marginTop: 'auto'  // Push to bottom
flexDirection: 'row'
alignItems: 'center'
justifyContent: 'center'
backgroundColor: 'rgba(217, 119, 6, 0.2)'  // Subtle highlight
paddingVertical: 8
paddingHorizontal: 12
borderRadius: 12

// Icon
fontSize: 14
marginRight: 4

// Text
fontSize: 12
fontWeight: '600'
color: '#92400e'  // Dark brown
```

### Complete StyleSheet

```typescript
// Road Conditions Widget Styles
road: {
  flex: 1,
  height: 170,
  backgroundColor: '#fef3c7',
  borderColor: '#fbbf24',
  borderWidth: 1,
  borderRadius: 20,
  padding: 20,
},
roadHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
roadIcon: {
  fontSize: 18,
  marginRight: 6,
},
roadLabel: {
  fontSize: 11,
  fontWeight: '600',
  color: '#92400e',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
roadStatus: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 8,
},
roadStatusIcon: {
  fontSize: 32,
  marginRight: 8,
},
roadStatusText: {
  fontSize: 32,
  fontWeight: '700',
  color: '#78350f',
},
roadDesc: {
  fontSize: 14,
  fontWeight: '500',
  color: '#b45309',
  marginBottom: 4,
},
roadInfo: {
  fontSize: 13,
  fontWeight: '400',
  color: '#d97706',
  marginBottom: 12,
},
roadCTA: {
  marginTop: 'auto',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(217, 119, 6, 0.2)',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 12,
},
roadCTAIcon: {
  fontSize: 14,
  marginRight: 4,
},
roadCTAText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#92400e',
},
```

---

## Complete Implementation Code

### JSX Structure (Home Screen)

```tsx
<View style={styles.widgetRow}>
  {/* Weather Widget */}
  <View style={styles.weather}>
    <View style={styles.weatherHeader}>
      <Text style={styles.weatherIcon}>☀️</Text>
      <Text style={styles.weatherLabel}>Weather</Text>
    </View>

    <Text style={styles.weatherTemp}>
      {overview.weather.temperature ?? '--'}°
    </Text>

    <Text style={styles.weatherDesc}>
      {overview.weather.description}
    </Text>

    <View style={styles.weatherWind}>
      <Text style={styles.weatherWindIcon}>💨</Text>
      <Text style={styles.weatherWindText}>
        {overview.weather.windSpeed ?? '--'} m/s
      </Text>
    </View>

    <View style={styles.weatherForecast}>
      {overview.weather.daily.map((day) => (
        <View key={day.date} style={styles.weatherForecastDay}>
          <Text style={styles.weatherDayLabel}>
            {formatWeekday(day.date)}
          </Text>
          <Text style={styles.weatherDayTemp}>
            {day.maxTemp}°
          </Text>
        </View>
      ))}
    </View>
  </View>

  {/* Aurora Widget */}
  <View style={styles.aurora}>
    <View style={styles.auroraHeader}>
      <Text style={styles.auroraIcon}>🌌</Text>
      <Text style={styles.auroraLabel}>Aurora</Text>
    </View>

    <Text style={styles.auroraKP}>
      {overview.aurora?.kpIndex ?? '--'}/9
    </Text>

    <Text style={styles.auroraVisibility}>
      {overview.aurora?.probability ?? '--'}% visibility
    </Text>

    <Text style={styles.auroraDesc}>
      {overview.aurora?.description}
    </Text>

    <View style={styles.auroraPeak}>
      <Text style={styles.auroraPeakText}>
        Peak tonight at 22:00
      </Text>
    </View>
  </View>

  {/* Road Conditions Widget */}
  <Pressable
    style={styles.road}
    onPress={() => Linking.openURL(overview.roadMapUrl)}
  >
    <View style={styles.roadHeader}>
      <Text style={styles.roadIcon}>🚗</Text>
      <Text style={styles.roadLabel}>Road conditions</Text>
    </View>

    <View style={styles.roadStatus}>
      <Text style={styles.roadStatusIcon}>✅</Text>
      <Text style={styles.roadStatusText}>Good</Text>
    </View>

    <Text style={styles.roadDesc}>All routes clear</Text>
    <Text style={styles.roadInfo}>No warnings</Text>

    <View style={styles.roadCTA}>
      <Text style={styles.roadCTAIcon}>📍</Text>
      <Text style={styles.roadCTAText}>View map</Text>
    </View>
  </Pressable>
</View>
```

### Parent Container

```typescript
widgetRow: {
  flexDirection: 'row',
  gap: 8,  // Space between widgets
  marginBottom: SPACING.lg,
},
```

---

## Typography Summary

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Widget Label | 11px | 600 | Dark (varies) | "Weather", "Aurora", etc. |
| Hero Data | 48px | 700 | Very dark | Main metric (temp, KP) |
| Secondary Metric | 16px | 600 | Medium | Visibility %, wind |
| Description | 13-14px | 400 | Light | Weather desc, aurora desc |
| Small Text | 12px | 500-600 | Medium | Forecast, CTA text |
| Tiny Text | 10px | 600 | Light | Day labels (M, T, W) |

---

## Spacing Summary

| Area | Value | Purpose |
|------|-------|---------|
| Widget padding | 20px | Generous breathing room |
| Widget gap | 8px | Space between widgets |
| Section spacing | 4-12px | Vertical rhythm |
| Hero margin top | 8px | Separate from label |
| Hero margin bottom | 4px | Tight with description |
| Forecast border | 1px rgba | Subtle separator |
| Border radius | 20px | Smooth, modern |
| CTA padding | 8px / 12px | Balanced button feel |

---

## Color Palette

### Weather (Blue)
```typescript
background: '#dbeafe'     // Light blue
border: '#93c5fd'         // Medium blue
darkText: '#1e3a8a'       // Very dark blue
mediumText: '#1e40af'     // Dark blue
lightText: '#3b82f6'      // Medium blue
accent: '#60a5fa'         // Light blue
```

### Aurora (Purple)
```typescript
background: '#e9d5ff'     // Light purple
border: '#c084fc'         // Medium purple
darkText: '#581c87'       // Very dark purple
mediumText: '#6b21a8'     // Dark purple
lightText: '#7c3aed'      // Medium purple
accent: '#8b5cf6'         // Light purple
```

### Road (Yellow/Orange)
```typescript
background: '#fef3c7'     // Light yellow
border: '#fbbf24'         // Medium yellow
darkText: '#78350f'       // Very dark brown
mediumText: '#92400e'     // Dark brown
lightText: '#b45309'      // Medium brown
accent: '#d97706'         // Light brown
```

---

## Responsive Behavior

### Mobile (320px - 480px)
- Widgets stay side-by-side (minimum width: 100px each)
- Font sizes stay the same (already optimized for small screens)
- Padding stays at 20px (comfortable)
- 5-day forecast shows all days (readable at 10px)

### Tablet (481px - 768px)
- Widgets have more breathing room
- Same layout, more comfortable spacing

### Desktop (769px+)
- Consider limiting widget container max-width
- Prevent widgets from becoming too wide

```typescript
// Optional: Limit container width on large screens
widgetRow: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: SPACING.lg,
  maxWidth: 720,  // ← Add this for desktop
  alignSelf: 'center',  // ← Center on wide screens
},
```

---

## Edge Cases & Variations

### Temperature Edge Cases

**3-Digit Temperature:**
```typescript
// Handle -10° or 100°
weatherTemp: {
  fontSize: 48,  // Keep same
  // Will auto-fit, may need to reduce slightly if needed
  // Alternative: fontSize: temperature.length > 2 ? 42 : 48
}
```

**No Data:**
```typescript
// Show "--" placeholder
<Text style={styles.weatherTemp}>--°</Text>
```

### Long Descriptions

**Weather Description:**
```typescript
weatherDesc: {
  fontSize: 14,
  fontWeight: '400',
  color: '#1e40af',
  marginBottom: 12,
  numberOfLines: 1,  // ← Add this to truncate
  ellipsizeMode: 'tail',
}
```

### Aurora KP Index

**Formatting:**
```typescript
// Always show one decimal: "7.2/9"
const kpFormatted = overview.aurora?.kpIndex?.toFixed(1) ?? '--';

<Text style={styles.auroraKP}>{kpFormatted}/9</Text>
```

### Road Conditions States

**Different Statuses:**
```typescript
const roadStatus = {
  good: { icon: '✅', text: 'Good', color: '#22c55e' },
  warning: { icon: '⚠️', text: 'Caution', color: '#f59e0b' },
  bad: { icon: '❌', text: 'Poor', color: '#ef4444' },
};

// Use appropriate status
const status = roadStatus[overview.roadCondition] || roadStatus.good;
```

---

## Implementation Checklist

Before submitting:
- [ ] All font sizes match spec (11px, 14px, 48px, etc.)
- [ ] All colors match spec (exact hex values)
- [ ] All spacing matches spec (8px gap, 20px padding)
- [ ] Hero data (48px, bold) is prominent
- [ ] Labels are uppercase with letter-spacing
- [ ] Widgets are exactly 170px tall
- [ ] 5-day forecast has subtle separator
- [ ] CTA buttons have background tint
- [ ] All emojis are correct sizes
- [ ] Text truncates gracefully when long
- [ ] Edge cases are handled (no data, 3-digit temps)

---

## Testing Checklist

After implementation:
- [ ] All 3 widgets side-by-side on mobile (320px width)
- [ ] Readable at all screen sizes (320px - 1920px)
- [ ] Hero data immediately scannable
- [ ] Visual hierarchy is clear (big → medium → small)
- [ ] Colors look good (not too bright, not too dull)
- [ ] Spacing feels balanced (not cramped, not empty)
- [ ] Emojis render correctly on iOS and Android
- [ ] Touch targets are adequate (CTA button)
- [ ] Text doesn't overflow containers
- [ ] Looks professional next to other app elements

---

## Success Criteria Validation

**Test with Real Users:**
1. Show all 3 widgets
2. Ask: "What's the temperature?" (should answer in < 1 second)
3. Ask: "What's the aurora KP index?" (should answer in < 1 second)
4. Ask: "Are road conditions good?" (should answer in < 1 second)

**Visual Quality Check:**
- ✅ Looks as polished as Apple Weather
- ✅ Feels as professional as Airbnb property cards
- ✅ Hierarchy is as clear as Notion widgets
- ✅ Spacing is as balanced as Linear dashboard

**NOT:**
- ❌ Cluttered like old weather.com
- ❌ Cramped like generic widgets
- ❌ Hard to scan like poorly designed dashboards

---

## Final Implementation File

**Location:** `/Users/carlosmaia/townhub-mobile/app/(tabs)/index.tsx`

**Changes Needed:**
1. Replace existing `widgetCard` styles with specific `weather`, `aurora`, `road` styles
2. Update JSX to match structure above
3. Ensure all font sizes, colors, spacing match spec exactly
4. Test on multiple screen sizes
5. Verify emojis display correctly

**Estimated Time:** 45 minutes to implement and test

---

## Design Rationale

### Why These Choices?

**48px Hero Size:**
- Immediately visible from arm's length (mobile)
- Large enough to be glanceable
- Standard for dashboard metrics (Apple, Google)

**20px Padding:**
- Generous enough for breathing room
- Not so much that it wastes space
- Golden ratio with 170px height

**170px Height:**
- Fits 3 widgets + gaps on 320px screen
- Tall enough for hierarchy
- Short enough to see multiple widgets

**Uppercase Labels:**
- Professional, technical appearance
- Distinguishes labels from data
- Common in dashboard design

**Color-Coded Borders:**
- Reinforces widget category
- Subtle but effective differentiation
- Doesn't compete with content

**marginTop: 'auto' for CTAs:**
- Pushes element to bottom
- Consistent footer position
- Works regardless of content height

---

**This specification is implementation-ready. Engineer can code directly from this document.** 🎨✨
