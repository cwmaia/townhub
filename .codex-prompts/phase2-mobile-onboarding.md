# Phase 2: Mobile App Onboarding & Profile Creation Flow

## Objective
Create a first-time user onboarding flow in the mobile app that:
1. Welcomes the user
2. Requests push notification permission
3. Lets user select notification preferences (categories + business types)
4. Optionally collects name/avatar
5. Saves preferences and marks onboarding complete

---

## Task 2.1: Create Onboarding Store

**File:** `stores/onboarding.ts` (new file)

```typescript
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_completed";

interface OnboardingState {
  hasCompletedOnboarding: boolean | null; // null = not yet checked
  isLoading: boolean;

  // Preference selections during onboarding
  selectedCategories: {
    townAlerts: boolean;
    weatherAlerts: boolean;
    events: boolean;
    emergencyAlerts: boolean;
  };
  selectedBusinessTypes: {
    lodging: boolean;
    restaurant: boolean;
    attraction: boolean;
    service: boolean;
  };

  // Actions
  checkOnboardingStatus: () => Promise<void>;
  setSelectedCategories: (categories: Partial<OnboardingState["selectedCategories"]>) => void;
  setSelectedBusinessTypes: (types: Partial<OnboardingState["selectedBusinessTypes"]>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>; // For testing
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  hasCompletedOnboarding: null,
  isLoading: true,

  selectedCategories: {
    townAlerts: true,
    weatherAlerts: true,
    events: true,
    emergencyAlerts: true,
  },

  selectedBusinessTypes: {
    lodging: true,
    restaurant: true,
    attraction: true,
    service: true,
  },

  checkOnboardingStatus: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({
        hasCompletedOnboarding: value === "true",
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      set({ hasCompletedOnboarding: false, isLoading: false });
    }
  },

  setSelectedCategories: (categories) => {
    set((state) => ({
      selectedCategories: { ...state.selectedCategories, ...categories },
    }));
  },

  setSelectedBusinessTypes: (types) => {
    set((state) => ({
      selectedBusinessTypes: { ...state.selectedBusinessTypes, ...types },
    }));
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      set({ hasCompletedOnboarding: true });
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      set({
        hasCompletedOnboarding: false,
        selectedCategories: {
          townAlerts: true,
          weatherAlerts: true,
          events: true,
          emergencyAlerts: true,
        },
        selectedBusinessTypes: {
          lodging: true,
          restaurant: true,
          attraction: true,
          service: true,
        },
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  },
}));
```

---

## Task 2.2: Create Onboarding Layout

**File:** `app/onboarding/_layout.tsx` (new file)

```typescript
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: false, // Prevent swipe back during onboarding
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="preferences" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="complete" />
      </Stack>
    </>
  );
}
```

---

## Task 2.3: Create Welcome Screen

**File:** `app/onboarding/index.tsx` (new file)

```typescript
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push("/onboarding/notifications");
  };

  return (
    <LinearGradient
      colors={["#0ea5e9", "#0284c7", "#0369a1"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="map" size={64} color="#0ea5e9" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome to TownHub</Text>
          <Text style={styles.subtitle}>
            Your complete guide to Stykkishólmur
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem
              icon="notifications"
              text="Real-time alerts & updates"
            />
            <FeatureItem
              icon="restaurant"
              text="Discover local businesses"
            />
            <FeatureItem
              icon="calendar"
              text="Never miss an event"
            />
            <FeatureItem
              icon="partly-sunny"
              text="Weather & road conditions"
            />
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#0ea5e9" />
          </Pressable>

          <Text style={styles.footerText}>
            Takes less than a minute to set up
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={24} color="white" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
  },
  features: {
    width: "100%",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0ea5e9",
  },
  footerText: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
```

---

## Task 2.4: Create Notification Permission Screen

**File:** `app/onboarding/notifications.tsx` (new file)

```typescript
import { View, Text, Pressable, StyleSheet, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useState } from "react";

export default function NotificationPermissionScreen() {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async () => {
    setIsRequesting(true);

    try {
      if (!Device.isDevice) {
        Alert.alert(
          "Simulator Detected",
          "Push notifications only work on physical devices. Continuing without notifications.",
          [{ text: "OK", onPress: () => router.push("/onboarding/preferences") }]
        );
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        router.push("/onboarding/preferences");
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        // Set up Android channel
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#0ea5e9",
          });
        }
      }

      router.push("/onboarding/preferences");
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      Alert.alert(
        "Error",
        "Could not request notification permissions. You can enable them later in Settings.",
        [{ text: "Continue", onPress: () => router.push("/onboarding/preferences") }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/preferences");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={80} color="#0ea5e9" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Stay in the Loop</Text>
        <Text style={styles.description}>
          Enable notifications to receive important updates about weather alerts,
          local events, and special offers from your favorite businesses.
        </Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          <BenefitItem
            icon="warning"
            title="Safety Alerts"
            description="Critical weather and road warnings"
          />
          <BenefitItem
            icon="calendar"
            title="Events"
            description="Community happenings you'll love"
          />
          <BenefitItem
            icon="pricetag"
            title="Deals"
            description="Special offers from local businesses"
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={requestPermission}
          disabled={isRequesting}
        >
          <Ionicons name="notifications" size={20} color="white" />
          <Text style={styles.buttonText}>
            {isRequesting ? "Requesting..." : "Enable Notifications"}
          </Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Not now, maybe later</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon as any} size={24} color="#0ea5e9" />
      </View>
      <View style={styles.benefitText}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  progressDotActive: {
    backgroundColor: "#0ea5e9",
    width: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  benefits: {
    width: "100%",
    gap: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: "#64748b",
  },
});
```

---

## Task 2.5: Create Preferences Selection Screen

**File:** `app/onboarding/preferences.tsx` (new file)

```typescript
import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/stores/onboarding";

const CATEGORIES = [
  {
    key: "emergencyAlerts" as const,
    icon: "alert-circle",
    title: "Emergency Alerts",
    description: "Critical safety notifications",
    recommended: true,
  },
  {
    key: "townAlerts" as const,
    icon: "megaphone",
    title: "Town News",
    description: "Civic announcements & updates",
    recommended: true,
  },
  {
    key: "weatherAlerts" as const,
    icon: "cloudy",
    title: "Weather & Roads",
    description: "Conditions, aurora forecasts",
    recommended: true,
  },
  {
    key: "events" as const,
    icon: "calendar",
    title: "Events",
    description: "Community happenings",
    recommended: false,
  },
];

const BUSINESS_TYPES = [
  {
    key: "lodging" as const,
    icon: "bed",
    title: "Hotels & Stays",
    description: "Accommodations, guesthouses",
  },
  {
    key: "restaurant" as const,
    icon: "restaurant",
    title: "Food & Drink",
    description: "Restaurants, cafes, bars",
  },
  {
    key: "attraction" as const,
    icon: "compass",
    title: "Attractions",
    description: "Tours, museums, activities",
  },
  {
    key: "service" as const,
    icon: "storefront",
    title: "Local Services",
    description: "Shops, utilities, services",
  },
];

export default function PreferencesScreen() {
  const {
    selectedCategories,
    selectedBusinessTypes,
    setSelectedCategories,
    setSelectedBusinessTypes,
  } = useOnboardingStore();

  const handleContinue = () => {
    router.push("/onboarding/profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>What interests you?</Text>
        <Text style={styles.description}>
          Choose what notifications you'd like to receive. You can change these anytime in Settings.
        </Text>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Types</Text>
          {CATEGORIES.map((category) => (
            <PreferenceToggle
              key={category.key}
              icon={category.icon}
              title={category.title}
              description={category.description}
              recommended={category.recommended}
              value={selectedCategories[category.key]}
              onValueChange={(value) =>
                setSelectedCategories({ [category.key]: value })
              }
            />
          ))}
        </View>

        {/* Business Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Notifications</Text>
          <Text style={styles.sectionDescription}>
            Get updates from businesses you follow
          </Text>
          {BUSINESS_TYPES.map((type) => (
            <PreferenceToggle
              key={type.key}
              icon={type.icon}
              title={type.title}
              description={type.description}
              value={selectedBusinessTypes[type.key]}
              onValueChange={(value) =>
                setSelectedBusinessTypes({ [type.key]: value })
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  recommended,
  value,
  onValueChange,
}: {
  icon: string;
  title: string;
  description: string;
  recommended?: boolean;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleIcon}>
        <Ionicons name={icon as any} size={24} color="#0ea5e9" />
      </View>
      <View style={styles.toggleContent}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleTitle}>{title}</Text>
          {recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e2e8f0", true: "#7dd3fc" }}
        thumbColor={value ? "#0ea5e9" : "#f4f4f5"}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  progressDotActive: {
    backgroundColor: "#0ea5e9",
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  recommendedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },
  toggleDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
});
```

---

## Task 2.6: Create Profile Setup Screen (Optional Step)

**File:** `app/onboarding/profile.tsx` (new file)

```typescript
import { View, Text, TextInput, Pressable, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileSetupScreen() {
  const { profile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");

  const handleContinue = () => {
    // Pass firstName to complete screen
    router.push({
      pathname: "/onboarding/complete",
      params: { firstName: firstName.trim() || undefined },
    });
  };

  const handleSkip = () => {
    router.push("/onboarding/complete");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progress}>
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      <View style={styles.content}>
        {/* Avatar placeholder */}
        <View style={styles.avatarContainer}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#94a3b8" />
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>One last thing...</Text>
        <Text style={styles.description}>
          What should we call you? This helps personalize your experience.
        </Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your first name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your name"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>
            {firstName.trim() ? "Continue" : "Skip for now"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>

        {firstName.trim() ? (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip this step</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  progressDotActive: {
    backgroundColor: "#0ea5e9",
    width: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0f172a",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: "#64748b",
  },
});
```

---

## Task 2.7: Create Completion Screen

**File:** `app/onboarding/complete.tsx` (new file)

```typescript
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/stores/onboarding";
import { useProfileMutation } from "@/hooks/useProfile";
import { useNotificationPermissions } from "@/hooks/useNotifications";
import LottieView from "lottie-react-native";

export default function CompleteScreen() {
  const { firstName } = useLocalSearchParams<{ firstName?: string }>();
  const [isSaving, setIsSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedCategories,
    selectedBusinessTypes,
    completeOnboarding,
  } = useOnboardingStore();

  const profileMutation = useProfileMutation();
  const { expoPushToken } = useNotificationPermissions();

  useEffect(() => {
    savePreferences();
  }, []);

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Save preferences to server
      await profileMutation.mutateAsync({
        firstName: firstName || undefined,
        notificationPreferences: {
          categories: selectedCategories,
          businessTypes: selectedBusinessTypes,
          globalEnabled: true,
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "08:00",
          },
        },
      });

      // Mark onboarding as complete locally
      await completeOnboarding();

      setIsSaving(false);
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences. Please try again.");
      setIsSaving(false);
    }
  };

  const handleGoToApp = () => {
    router.replace("/(tabs)");
  };

  const handleRetry = () => {
    savePreferences();
  };

  if (isSaving) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContent}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={handleGoToApp}>
            <Text style={styles.skipText}>Skip and continue to app</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success animation/icon */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color="#22c55e" />
        </View>

        {/* Title */}
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.description}>
          {firstName
            ? `Welcome, ${firstName}! Your TownHub is ready.`
            : "Your TownHub is ready to explore."}
        </Text>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your preferences</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="notifications" size={20} color="#0ea5e9" />
            <Text style={styles.summaryText}>
              {Object.values(selectedCategories).filter(Boolean).length} alert types enabled
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="business" size={20} color="#0ea5e9" />
            <Text style={styles.summaryText}>
              {Object.values(selectedBusinessTypes).filter(Boolean).length} business types enabled
            </Text>
          </View>
          {expoPushToken && (
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.summaryText}>Push notifications active</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleGoToApp}>
          <Text style={styles.buttonText}>Explore TownHub</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#0f172a",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: "#64748b",
  },
});
```

---

## Task 2.8: Update Root Layout for Onboarding Check

**File:** `app/_layout.tsx` (update existing)

Add onboarding check to redirect new users:

```typescript
// Add these imports
import { useOnboardingStore } from "@/stores/onboarding";
import { useEffect } from "react";

// Inside the component, add:
const {
  hasCompletedOnboarding,
  isLoading: isOnboardingLoading,
  checkOnboardingStatus,
} = useOnboardingStore();

useEffect(() => {
  checkOnboardingStatus();
}, []);

// Add this effect after auth check
useEffect(() => {
  if (isOnboardingLoading) return;
  if (hasCompletedOnboarding === false) {
    // User hasn't completed onboarding, redirect
    router.replace("/onboarding");
  }
}, [hasCompletedOnboarding, isOnboardingLoading]);

// Update the loading check
if (isOnboardingLoading) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
```

---

## Task 2.9: Update API Service for Onboarding

**File:** `services/api.ts` (update existing)

Add onboarding completion endpoint:

```typescript
// Add to profileApi object
completeOnboarding: (payload: {
  firstName?: string;
  notificationPreferences?: {
    categories: Record<string, boolean>;
    businessTypes: Record<string, boolean>;
    globalEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}) => api.post('/api/profile/onboarding', payload),
```

---

## Task 2.10: Update Profile Hook

**File:** `hooks/useProfile.ts` (update existing)

Ensure the mutation handles the new preference structure:

```typescript
// Update the mutation payload type
interface ProfileUpdatePayload {
  firstName?: string;
  avatarUrl?: string | null;
  email?: string;
  notificationPreferences?: {
    categories?: Record<string, boolean>;
    businessTypes?: Record<string, boolean>;
    globalEnabled?: boolean;
    quietHours?: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}
```

---

## Verification Steps

1. Clear AsyncStorage or reset onboarding: `useOnboardingStore.getState().resetOnboarding()`
2. Launch app fresh - should see welcome screen
3. Progress through all onboarding steps
4. Verify preferences saved correctly via profile API
5. Relaunch app - should skip onboarding and go to main tabs
6. Check profile screen shows correct preferences

---

## Files Created

- `stores/onboarding.ts`
- `app/onboarding/_layout.tsx`
- `app/onboarding/index.tsx`
- `app/onboarding/notifications.tsx`
- `app/onboarding/preferences.tsx`
- `app/onboarding/profile.tsx`
- `app/onboarding/complete.tsx`

## Files Modified

- `app/_layout.tsx`
- `services/api.ts`
- `hooks/useProfile.ts`

---

## Dependencies

Make sure these are installed:
```bash
npx expo install expo-linear-gradient
```

If using Lottie animations (optional):
```bash
npx expo install lottie-react-native
```
