import { JsonValue } from "@prisma/client/runtime/library";

export const NOTIFICATION_TYPES = {
  TOWN_ALERT: "TOWN_ALERT",
  TOWN_NEWS: "TOWN_NEWS",
  TOWN_EVENT: "TOWN_EVENT",
  WEATHER_ALERT: "WEATHER_ALERT",
  AURORA_ALERT: "AURORA_ALERT",
  BUSINESS_PROMO: "BUSINESS_PROMO",
  BUSINESS_EVENT: "BUSINESS_EVENT",
  BUSINESS_UPDATE: "BUSINESS_UPDATE",
  SYSTEM_WELCOME: "SYSTEM_WELCOME",
  SYSTEM_UPDATE: "SYSTEM_UPDATE",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface NotificationTypeInfo {
  label: string;
  labelIs: string;
  color: string;
  bgColor: string;
  icon: string;
  category: "town" | "business" | "system";
}

export const NOTIFICATION_TYPE_INFO: Record<NotificationType, NotificationTypeInfo> = {
  TOWN_ALERT: {
    label: "Town Alert",
    labelIs: "Bæjartilkynning",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: "alert-circle",
    category: "town",
  },
  TOWN_NEWS: {
    label: "Town News",
    labelIs: "Bæjarfréttir",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "newspaper",
    category: "town",
  },
  TOWN_EVENT: {
    label: "Town Event",
    labelIs: "Viðburður",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: "calendar",
    category: "town",
  },
  WEATHER_ALERT: {
    label: "Weather",
    labelIs: "Veður",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: "cloud-lightning",
    category: "town",
  },
  AURORA_ALERT: {
    label: "Aurora",
    labelIs: "Norðurljós",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: "sparkles",
    category: "town",
  },
  BUSINESS_PROMO: {
    label: "Promotion",
    labelIs: "Tilboð",
    color: "text-pink-700",
    bgColor: "bg-pink-100",
    icon: "tag",
    category: "business",
  },
  BUSINESS_EVENT: {
    label: "Business Event",
    labelIs: "Viðburður",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    icon: "calendar-heart",
    category: "business",
  },
  BUSINESS_UPDATE: {
    label: "Update",
    labelIs: "Uppfærsla",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: "store",
    category: "business",
  },
  SYSTEM_WELCOME: {
    label: "Welcome",
    labelIs: "Velkomin",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: "hand-wave",
    category: "system",
  },
  SYSTEM_UPDATE: {
    label: "App Update",
    labelIs: "Uppfærsla",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: "smartphone",
    category: "system",
  },
};

export const TOWN_NOTIFICATION_TYPES = Object.entries(NOTIFICATION_TYPE_INFO)
  .filter(([, info]) => info.category === "town")
  .map(([type]) => type as NotificationType);

export const BUSINESS_NOTIFICATION_TYPES = Object.entries(NOTIFICATION_TYPE_INFO)
  .filter(([, info]) => info.category === "business")
  .map(([type]) => type as NotificationType);

export interface NotificationPreferences {
  globalEnabled: boolean;
  categories: {
    townAlerts: boolean;
    weatherAlerts: boolean;
    events: boolean;
    emergencyAlerts: boolean;
  };
  businessTypes: {
    lodging: boolean;
    restaurant: boolean;
    attraction: boolean;
    service: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  globalEnabled: true,
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
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

export function migratePreferences(
  raw: Record<string, boolean> | JsonValue | null | undefined
): NotificationPreferences {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  const obj = raw as Record<string, unknown>;

  return {
    globalEnabled:
      typeof obj.globalEnabled === "boolean"
        ? obj.globalEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.globalEnabled,
    categories: {
      townAlerts:
        typeof (obj.categories as Record<string, unknown>)?.townAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).townAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.townAlerts,
      weatherAlerts:
        typeof (obj.categories as Record<string, unknown>)?.weatherAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).weatherAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.weatherAlerts,
      events:
        typeof (obj.categories as Record<string, unknown>)?.events === "boolean"
          ? (obj.categories as Record<string, boolean>).events
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.events,
      emergencyAlerts:
        typeof (obj.categories as Record<string, unknown>)?.emergencyAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).emergencyAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.emergencyAlerts,
    },
    businessTypes: {
      lodging:
        typeof (obj.businessTypes as Record<string, unknown>)?.lodging === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).lodging
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.lodging,
      restaurant:
        typeof (obj.businessTypes as Record<string, unknown>)?.restaurant === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).restaurant
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.restaurant,
      attraction:
        typeof (obj.businessTypes as Record<string, unknown>)?.attraction === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).attraction
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.attraction,
      service:
        typeof (obj.businessTypes as Record<string, unknown>)?.service === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).service
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.service,
    },
    quietHours: {
      enabled:
        typeof (obj.quietHours as Record<string, unknown>)?.enabled === "boolean"
          ? (obj.quietHours as Record<string, boolean>).enabled
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.enabled,
      start:
        typeof (obj.quietHours as Record<string, unknown>)?.start === "string"
          ? (obj.quietHours as Record<string, string>).start
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.start,
      end:
        typeof (obj.quietHours as Record<string, unknown>)?.end === "string"
          ? (obj.quietHours as Record<string, string>).end
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.end,
    },
  };
}

export function isInQuietHours(quietHours: NotificationPreferences["quietHours"]): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = quietHours.start.split(":").map(Number);
  const [endHour, endMin] = quietHours.end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function placeTagToBusinessType(
  tags: string[]
): keyof NotificationPreferences["businessTypes"] | null {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  if (
    tagSet.has("hotel") ||
    tagSet.has("guesthouse") ||
    tagSet.has("lodging") ||
    tagSet.has("accommodation")
  ) {
    return "lodging";
  }
  if (
    tagSet.has("restaurant") ||
    tagSet.has("cafe") ||
    tagSet.has("bar") ||
    tagSet.has("food")
  ) {
    return "restaurant";
  }
  if (
    tagSet.has("museum") ||
    tagSet.has("tour") ||
    tagSet.has("attraction") ||
    tagSet.has("activity")
  ) {
    return "attraction";
  }
  if (tagSet.has("shop") || tagSet.has("service") || tagSet.has("store")) {
    return "service";
  }

  return null;
}
