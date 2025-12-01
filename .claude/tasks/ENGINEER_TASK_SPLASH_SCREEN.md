# Engineer Task: TownApp Splash Screen

**Priority:** P1
**Status:** Ready for Implementation

---

## Overview

Create an animated splash screen that displays when the app launches, featuring the TownApp logo with heartbeat animation.

---

## Design Specification

### Visual Elements

1. **Background:** Brand blue gradient or solid #3b82f6
2. **Logo:** Animated heart-in-pin logo (center of screen)
3. **App Name:** "TownApp" text below logo
4. **Tagline:** "Your Town, Connected" (optional, subtle)

### Animation Sequence

```
0.0s - 0.3s: Fade in background
0.3s - 0.5s: Logo scales up from 0.8 to 1.0 with bounce
0.5s - 2.0s: Heart beats 1-2 times (using existing heartbeat animation)
2.0s - 2.3s: Fade out to main app
```

### Timing

- **Minimum display:** 2 seconds (for branding)
- **Maximum display:** 3 seconds (don't annoy users)
- **Transition:** Fade out to home screen

---

## Implementation Options

### Option A: Expo SplashScreen + Custom Animated Screen (Recommended)

Use native splash for instant display, then animated React Native screen:

```typescript
// app/_layout.tsx
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AnimatedSplash from '../components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Load fonts, fetch initial data, etc.
      await loadResources();
      setAppReady(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!splashAnimationComplete) {
    return (
      <AnimatedSplash
        onAnimationComplete={() => setSplashAnimationComplete(true)}
        isReady={appReady}
      />
    );
  }

  return <MainApp />;
}
```

### Option B: expo-splash-screen with Static Image

Simpler but no animation:

```json
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3b82f6"
    }
  }
}
```

---

## AnimatedSplash Component

**New File:** `/Users/carlosmaia/townhub-mobile/components/AnimatedSplash.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
  isReady: boolean;
}

export function AnimatedSplash({ onAnimationComplete, isReady }: AnimatedSplashProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Logo bounce in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Heartbeat animation
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: 150, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.10, duration: 120, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: 120, useNativeDriver: true }),
        Animated.delay(1460),
      ]),
      { iterations: 2 }
    );
    heartbeat.start();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Wait for minimum display time, then fade out
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#3b82f6', '#1e40af']}
        style={styles.gradient}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {/* Pin + Animated Heart */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/pin-only.png')}
              style={styles.pin}
            />
            <Animated.Image
              source={require('../assets/heart-only.png')}
              style={[
                styles.heart,
                { transform: [{ scale: heartScale }] }
              ]}
            />
          </View>
        </Animated.View>

        <Text style={styles.appName}>TownApp</Text>
        <Text style={styles.tagline}>Your Town, Connected</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 152,
    marginBottom: 24,
  },
  pin: {
    width: 120,
    height: 152,
    resizeMode: 'contain',
  },
  heart: {
    position: 'absolute',
    width: 70,
    height: 63,
    top: 36,
    left: 25,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
});
```

---

## Static Splash Image (Fallback)

Create static splash for native splash screen (shown before JS loads):

**File:** `/Users/carlosmaia/townhub-mobile/assets/splash.png`

- Size: 1284 x 2778 (iPhone Pro Max)
- Blue gradient background
- Centered logo + text
- Export from Figma or create with ImageMagick

---

## Files to Create/Modify

```
/Users/carlosmaia/townhub-mobile/
├── components/
│   └── AnimatedSplash.tsx    # NEW - Animated splash component
├── app/
│   └── _layout.tsx           # MODIFY - Add splash logic
├── assets/
│   ├── splash.png            # NEW - Static splash image
│   └── (pin-only.png, heart-only.png already exist)
└── app.json                  # MODIFY - Configure native splash
```

---

## app.json Configuration

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3b82f6"
    },
    "android": {
      "splash": {
        "backgroundColor": "#3b82f6",
        "resizeMode": "contain"
      }
    },
    "ios": {
      "splash": {
        "backgroundColor": "#3b82f6",
        "resizeMode": "contain"
      }
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Native splash shows immediately on app launch (blue background + logo)
- [ ] Animated splash plays after JS bundle loads
- [ ] Heart beats 1-2 times during splash
- [ ] Smooth fade transition to home screen
- [ ] Total splash time: 2-3 seconds
- [ ] Works on both iOS and Android
- [ ] No flash of white/blank screen between splashes
