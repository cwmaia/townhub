# Engineer Task: Implement TownApp Branding Assets

**Date:** 2025-11-25
**Priority:** High
**Status:** Not Started
**Depends On:** Designer Task (COMPLETED)

---

## Overview

Implement the new TownApp branding assets created by the Designer across both web and mobile applications. This includes exporting PNGs, updating metadata, and renaming TownHub → TownApp.

## Source Files Location

All branding assets are in:
```
/Users/carlosmaia/townhub/public/branding/
├── townapp-logo-full.svg        # Full logo with wordmark
├── townapp-icon.svg             # Standalone icon (512x512)
├── townapp-icon-mono-black.svg  # Monochrome black
├── townapp-icon-mono-white.svg  # Monochrome white
├── ios-app-icon-1024.svg        # iOS app icon template
├── android-adaptive-foreground-432.svg
├── android-adaptive-background-432.svg
├── splash-icon.svg              # Splash screen logo
├── brand-guidelines.md          # Full documentation
├── colors.json                  # Color palette
├── tailwind-colors.js           # Tailwind config
└── DELIVERABLES.md              # Implementation guide

/Users/carlosmaia/townhub/public/
├── logo.svg                     # Website header (light)
├── logo-dark.svg                # Website header (dark)
└── favicon.svg                  # Browser favicon
```

---

## Tasks

### 1. Export PNG Assets

Use ImageMagick or an SVG tool to export:

```bash
cd /Users/carlosmaia/townhub/public/branding

# iOS App Icon (1024x1024, no transparency)
magick ios-app-icon-1024.svg -resize 1024x1024 -background white -flatten icon.png

# Android Adaptive Icon (432x432 with transparency)
magick android-adaptive-foreground-432.svg -resize 432x432 adaptive-icon.png

# Splash Icon (400x400)
magick splash-icon.svg -resize 400x400 splash-icon.png

# Favicons
magick ../favicon.svg -resize 32x32 ../favicon-32.png
magick ../favicon.svg -resize 16x16 ../favicon-16.png
magick ../favicon.svg -resize 180x180 ../apple-touch-icon.png
```

**If ImageMagick not installed:**
```bash
brew install imagemagick
```

**Alternative:** Use Inkscape, Figma, or online converter (svgtopng.com)

### 2. Update Mobile App (townhub-mobile)

#### Copy Assets
```bash
cp /Users/carlosmaia/townhub/public/branding/icon.png /Users/carlosmaia/townhub-mobile/assets/
cp /Users/carlosmaia/townhub/public/branding/adaptive-icon.png /Users/carlosmaia/townhub-mobile/assets/
cp /Users/carlosmaia/townhub/public/branding/splash-icon.png /Users/carlosmaia/townhub-mobile/assets/
```

#### Update app.json
```json
{
  "expo": {
    "name": "TownApp",
    "slug": "townapp",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#3b82f6"
    },
    "ios": {
      "bundleIdentifier": "com.kalwag.townapp",
      "icon": "./assets/icon.png"
    },
    "android": {
      "package": "com.kalwag.townapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3b82f6"
      }
    }
  }
}
```

**Note:** Changing package name may require new EAS build.

### 3. Update Web App (townhub)

#### Update app/layout.tsx metadata
```typescript
export const metadata: Metadata = {
  title: 'TownApp - Your Town, Connected',
  description: 'Connect with your local community in Stykkishólmur',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};
```

#### Update Header/Navigation Component
Find the header component and update logo:
```tsx
import Image from 'next/image';

// Light mode
<Image src="/logo.svg" alt="TownApp" width={40} height={40} />

// Or with dark mode support
<Image
  src="/logo.svg"
  alt="TownApp"
  width={40}
  height={40}
  className="dark:hidden"
/>
<Image
  src="/logo-dark.svg"
  alt="TownApp"
  width={40}
  height={40}
  className="hidden dark:block"
/>
```

### 4. Rename TownHub → TownApp

#### Files to Update

**townhub/package.json:**
```json
{
  "name": "townapp",
  "description": "Your Town, Connected"
}
```

**townhub-mobile/package.json:**
```json
{
  "name": "townapp-mobile"
}
```

**Search and replace in code:**
```bash
# Find all occurrences
grep -r "TownHub" --include="*.tsx" --include="*.ts" --include="*.json" /Users/carlosmaia/townhub/
grep -r "TownHub" --include="*.tsx" --include="*.ts" --include="*.json" /Users/carlosmaia/townhub-mobile/
```

Common places to check:
- Page titles
- Navigation headers
- Footer text
- Metadata
- Comments (optional)

### 5. Optional: Update Tailwind Colors

If you want to use the brand colors config:

**townhub/tailwind.config.ts:**
```typescript
import townappColors from './public/branding/tailwind-colors.js';

export default {
  theme: {
    extend: {
      colors: {
        ...townappColors,
      },
    },
  },
};
```

---

## Testing Checklist

### Web App
- [ ] Favicon shows in browser tab
- [ ] Apple touch icon works on iOS Safari
- [ ] Logo displays correctly in header
- [ ] Dark mode logo switching works (if implemented)
- [ ] All "TownHub" references replaced

### Mobile App
- [ ] App icon shows correctly on home screen
- [ ] Splash screen displays with new logo
- [ ] Android adaptive icon works correctly
- [ ] App name shows as "TownApp" on device

### Build Verification
- [ ] `npm run build` succeeds for web
- [ ] EAS build succeeds for mobile (if package name changed)

---

## Acceptance Criteria

- [ ] PNG assets exported from SVGs
- [ ] Mobile app icons updated (icon.png, adaptive-icon.png, splash-icon.png)
- [ ] app.json updated with new assets and name
- [ ] Web favicon updated
- [ ] layout.tsx metadata updated
- [ ] Header logo updated
- [ ] "TownHub" renamed to "TownApp" throughout codebase
- [ ] Both apps build successfully
- [ ] Visual verification on device/browser

---

## Reference

- **Brand Guidelines:** `/Users/carlosmaia/townhub/public/branding/brand-guidelines.md`
- **Color Palette:** `/Users/carlosmaia/townhub/public/branding/colors.json`
- **Full Deliverables:** `/Users/carlosmaia/townhub/public/branding/DELIVERABLES.md`

---

**Note to Engineer:** The SVG files are production-ready. Focus on proper PNG export and making sure icons display correctly at all sizes. Test on actual devices if possible. The package name change (townhub → townapp) may require a new EAS build for mobile.
