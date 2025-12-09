export interface NotificationCategories {
  townAlerts: boolean;
  weatherAlerts: boolean;
  events: boolean;
  emergencyAlerts: boolean;
}

export interface BusinessTypePreferences {
  lodging: boolean;
  restaurant: boolean;
  attraction: boolean;
  service: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface NotificationPreferences {
  categories: NotificationCategories;
  businessTypes: BusinessTypePreferences;
  globalEnabled: boolean;
  quietHours: QuietHours;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  categories: {
    townAlerts: true,
    weatherAlerts: true,
    events: true,
    emergencyAlerts: true,
  },
  businessTypes: {
    lodging: true,
    restaurant: true,
    attraction: true,
    service: true,
  },
  globalEnabled: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

// Helper to migrate old preferences to new structure
export function migratePreferences(old: Record<string, boolean> | null): NotificationPreferences {
  if (!old) return DEFAULT_NOTIFICATION_PREFERENCES;

  // Check if already in new format
  if ("categories" in old) {
    return old as unknown as NotificationPreferences;
  }

  // Migrate from old format
  return {
    categories: {
      townAlerts: old.townAlerts ?? true,
      weatherAlerts: old.weatherAlerts ?? true,
      events: old.events ?? true,
      emergencyAlerts: true, // New field, default on
    },
    businessTypes: {
      lodging: old.businessAlerts ?? true,
      restaurant: old.businessAlerts ?? true,
      attraction: old.businessAlerts ?? true,
      service: old.businessAlerts ?? true,
    },
    globalEnabled: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  };
}

// Check if user is in quiet hours
export function isInQuietHours(quietHours: QuietHours): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = quietHours.start.split(":").map(Number);
  const [endHour, endMin] = quietHours.end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Map place category to business type key
export function placeTagToBusinessType(tags: string[]): keyof BusinessTypePreferences | null {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  if (tagSet.has("hotel") || tagSet.has("guesthouse") || tagSet.has("lodging") || tagSet.has("accommodation")) {
    return "lodging";
  }
  if (tagSet.has("restaurant") || tagSet.has("cafe") || tagSet.has("bar") || tagSet.has("food")) {
    return "restaurant";
  }
  if (tagSet.has("museum") || tagSet.has("tour") || tagSet.has("attraction") || tagSet.has("activity")) {
    return "attraction";
  }
  if (tagSet.has("shop") || tagSet.has("service") || tagSet.has("store")) {
    return "service";
  }

  return null;
}
