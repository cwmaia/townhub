# Phase 3: Web App Settings & Notification Preferences Page

## Objective
Create a settings page in the web app where users can:
1. Edit their profile (name, email)
2. Manage notification preferences (categories + business types)
3. Configure quiet hours
4. View and manage their business/place subscriptions

---

## Task 3.1: Create Settings Page Layout

**File:** `app/[locale]/settings/page.tsx` (new file)

```typescript
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";
import Header from "@/app/(components)/Header";
import { migratePreferences } from "@/lib/notifications/types";

export const metadata: Metadata = {
  title: "Settings - TownHub",
  description: "Manage your profile and notification preferences",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/stykkisholmur`);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      businessNotificationSubscriptions: {
        where: { isActive: true },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              place: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  tags: true,
                },
              },
            },
          },
        },
      },
      placeNotificationSubscriptions: {
        where: { isActive: true },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              tags: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    redirect(`/${locale}/stykkisholmur`);
  }

  // Migrate preferences to new structure if needed
  const preferences = migratePreferences(
    profile.notificationPreferences as Record<string, boolean> | null
  );

  const profileData = {
    id: profile.id,
    firstName: profile.firstName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    notificationPreferences: preferences,
    businessSubscriptions: profile.businessNotificationSubscriptions.map((sub) => ({
      id: sub.id,
      businessId: sub.businessId,
      businessName: sub.business.name,
      placeId: sub.business.place?.id,
      placeName: sub.business.place?.name,
      imageUrl: sub.business.place?.imageUrl,
      tags: sub.business.place?.tags ?? [],
    })),
    placeSubscriptions: profile.placeNotificationSubscriptions.map((sub) => ({
      id: sub.id,
      placeId: sub.placeId,
      placeName: sub.place.name,
      imageUrl: sub.place.imageUrl,
      tags: sub.place.tags ?? [],
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        townName="Stykkishólmur"
        locale={locale}
        profile={{
          firstName: profile.firstName,
          avatarUrl: profile.avatarUrl,
          role: profile.role,
        }}
      />
      <SettingsClient profile={profileData} locale={locale} />
    </div>
  );
}

export const dynamic = "force-dynamic";
```

---

## Task 3.2: Create Settings Client Component

**File:** `app/[locale]/settings/SettingsClient.tsx` (new file)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  User,
  Building2,
  MapPin,
  Trash2,
  Save,
  AlertTriangle,
  Cloud,
  Calendar,
  Shield,
  Bed,
  Utensils,
  Compass,
  Store,
  Moon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { NotificationPreferences } from "@/lib/notifications/types";
import type { UserRole } from "@prisma/client";

interface ProfileData {
  id: string;
  firstName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  notificationPreferences: NotificationPreferences;
  businessSubscriptions: {
    id: string;
    businessId: string;
    businessName: string;
    placeId?: string;
    placeName?: string;
    imageUrl?: string | null;
    tags: string[];
  }[];
  placeSubscriptions: {
    id: string;
    placeId: string;
    placeName: string;
    imageUrl?: string | null;
    tags: string[];
  }[];
}

interface SettingsClientProps {
  profile: ProfileData;
  locale: string;
}

export default function SettingsClient({ profile, locale }: SettingsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    profile.notificationPreferences
  );

  // Subscriptions state
  const [businessSubscriptions, setBusinessSubscriptions] = useState(
    profile.businessSubscriptions
  );
  const [placeSubscriptions, setPlaceSubscriptions] = useState(
    profile.placeSubscriptions
  );

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          email: email.trim() || null,
          notificationPreferences: preferences,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Settings saved successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeBusiness = async (businessId: string) => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/subscribe`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to unsubscribe");

      setBusinessSubscriptions((prev) =>
        prev.filter((sub) => sub.businessId !== businessId)
      );
      toast.success("Unsubscribed successfully");
    } catch (error) {
      toast.error("Failed to unsubscribe");
    }
  };

  const handleUnsubscribePlace = async (placeId: string) => {
    try {
      const response = await fetch(`/api/places/${placeId}/subscribe`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to unsubscribe");

      setPlaceSubscriptions((prev) =>
        prev.filter((sub) => sub.placeId !== placeId)
      );
      toast.success("Unsubscribed successfully");
    } catch (error) {
      toast.error("Failed to unsubscribe");
    }
  };

  const updateCategory = (key: keyof NotificationPreferences["categories"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      categories: { ...prev.categories, [key]: value },
    }));
  };

  const updateBusinessType = (key: keyof NotificationPreferences["businessTypes"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      businessTypes: { ...prev.businessTypes, [key]: value },
    }));
  };

  const updateQuietHours = (updates: Partial<NotificationPreferences["quietHours"]>) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, ...updates },
    }));
  };

  return (
    <main className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your profile and notification preferences
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Building2 className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Master Switch */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Enable or disable all push notifications
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.globalEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, globalEnabled: checked }))
                  }
                />
              </div>
            </CardHeader>
          </Card>

          {/* Alert Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>
                Choose which types of alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                icon={<Shield className="h-5 w-5 text-red-500" />}
                title="Emergency Alerts"
                description="Critical safety notifications"
                checked={preferences.categories.emergencyAlerts}
                onCheckedChange={(v) => updateCategory("emergencyAlerts", v)}
                recommended
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                title="Town Alerts"
                description="Civic announcements and updates"
                checked={preferences.categories.townAlerts}
                onCheckedChange={(v) => updateCategory("townAlerts", v)}
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<Cloud className="h-5 w-5 text-blue-500" />}
                title="Weather & Roads"
                description="Weather conditions, road status, aurora forecasts"
                checked={preferences.categories.weatherAlerts}
                onCheckedChange={(v) => updateCategory("weatherAlerts", v)}
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<Calendar className="h-5 w-5 text-purple-500" />}
                title="Events"
                description="Community events and festivals"
                checked={preferences.categories.events}
                onCheckedChange={(v) => updateCategory("events", v)}
                disabled={!preferences.globalEnabled}
              />
            </CardContent>
          </Card>

          {/* Business Types */}
          <Card>
            <CardHeader>
              <CardTitle>Business Notifications</CardTitle>
              <CardDescription>
                Choose which types of businesses can send you notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                icon={<Bed className="h-5 w-5 text-indigo-500" />}
                title="Hotels & Stays"
                description="Accommodations, guesthouses, B&Bs"
                checked={preferences.businessTypes.lodging}
                onCheckedChange={(v) => updateBusinessType("lodging", v)}
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<Utensils className="h-5 w-5 text-orange-500" />}
                title="Food & Drink"
                description="Restaurants, cafes, bars"
                checked={preferences.businessTypes.restaurant}
                onCheckedChange={(v) => updateBusinessType("restaurant", v)}
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<Compass className="h-5 w-5 text-teal-500" />}
                title="Attractions"
                description="Tours, museums, activities"
                checked={preferences.businessTypes.attraction}
                onCheckedChange={(v) => updateBusinessType("attraction", v)}
                disabled={!preferences.globalEnabled}
              />
              <Separator />
              <NotificationToggle
                icon={<Store className="h-5 w-5 text-slate-500" />}
                title="Local Services"
                description="Shops, utilities, town services"
                checked={preferences.businessTypes.service}
                onCheckedChange={(v) => updateBusinessType("service", v)}
                disabled={!preferences.globalEnabled}
              />
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Quiet Hours
                  </CardTitle>
                  <CardDescription>
                    Pause non-emergency notifications during specific hours
                  </CardDescription>
                </div>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
                  disabled={!preferences.globalEnabled}
                />
              </div>
            </CardHeader>
            {preferences.quietHours.enabled && preferences.globalEnabled && (
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="quiet-start">Start time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => updateQuietHours({ start: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="quiet-end">End time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => updateQuietHours({ end: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Emergency alerts will still come through during quiet hours.
                </p>
              </CardContent>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Subscriptions</CardTitle>
              <CardDescription>
                Businesses you've subscribed to for notifications ({businessSubscriptions.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businessSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No business subscriptions yet</p>
                  <p className="text-sm">
                    Subscribe to businesses to receive their updates
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {businessSubscriptions.map((sub) => (
                    <SubscriptionItem
                      key={sub.id}
                      name={sub.businessName}
                      subtitle={sub.placeName}
                      imageUrl={sub.imageUrl}
                      tags={sub.tags}
                      onUnsubscribe={() => handleUnsubscribeBusiness(sub.businessId)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Place Subscriptions</CardTitle>
              <CardDescription>
                Places you've subscribed to for notifications ({placeSubscriptions.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {placeSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No place subscriptions yet</p>
                  <p className="text-sm">
                    Subscribe to places to receive updates about them
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {placeSubscriptions.map((sub) => (
                    <SubscriptionItem
                      key={sub.id}
                      name={sub.placeName}
                      imageUrl={sub.imageUrl}
                      tags={sub.tags}
                      onUnsubscribe={() => handleUnsubscribePlace(sub.placeId)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

// Helper Components

function NotificationToggle({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  recommended,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  recommended?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{title}</span>
            {recommended && (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

function SubscriptionItem({
  name,
  subtitle,
  imageUrl,
  tags,
  onUnsubscribe,
}: {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  tags: string[];
  onUnsubscribe: () => void;
}) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true);
    await onUnsubscribe();
    setIsUnsubscribing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{name}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 truncate">{subtitle}</p>
        )}
        {tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUnsubscribe}
        disabled={isUnsubscribing}
        className="text-slate-500 hover:text-red-600"
      >
        {isUnsubscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

---

## Task 3.3: Add Settings Link to Profile Menu

**File:** `app/(components)/ProfileMenu.tsx` (update existing)

Add a settings link to the dropdown menu:

```typescript
// Add import
import { Settings } from "lucide-react";

// Add menu item after the profile display, before admin links
<DropdownMenuItem asChild>
  <Link href={`/${locale}/settings`} className="flex items-center gap-2">
    <Settings className="h-4 w-4" />
    Settings
  </Link>
</DropdownMenuItem>
```

---

## Task 3.4: Add Settings Link to Header (Mobile)

**File:** `app/(components)/Header.tsx` (update if needed)

Ensure there's a way to access settings from mobile header menu.

---

## Task 3.5: Create Onboarding Modal for Web (Optional)

**File:** `app/(components)/OnboardingModal.tsx` (new file)

For users who haven't completed onboarding on web:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  AlertTriangle,
  Cloud,
  Calendar,
  Bed,
  Utensils,
  Compass,
  Store,
  ChevronRight,
  Check,
} from "lucide-react";
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences } from "@/lib/notifications/types";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (preferences: NotificationPreferences) => void;
}

type Step = "welcome" | "categories" | "business" | "complete";

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );

  const handleComplete = () => {
    onComplete(preferences);
  };

  const updateCategory = (key: keyof NotificationPreferences["categories"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      categories: { ...prev.categories, [key]: value },
    }));
  };

  const updateBusinessType = (key: keyof NotificationPreferences["businessTypes"], value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      businessTypes: { ...prev.businessTypes, [key]: value },
    }));
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideClose>
        {step === "welcome" && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-sky-600" />
              </div>
              <DialogTitle className="text-2xl">Stay Connected</DialogTitle>
              <DialogDescription className="text-base">
                Set up your notification preferences to get the most out of TownHub.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <FeatureItem icon={Shield} text="Receive important safety alerts" />
              <FeatureItem icon={Calendar} text="Never miss local events" />
              <FeatureItem icon={Store} text="Get updates from your favorite businesses" />
            </div>
            <div className="mt-6 space-y-2">
              <Button className="w-full" onClick={() => setStep("categories")}>
                Set Up Notifications
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setPreferences({
                    ...DEFAULT_NOTIFICATION_PREFERENCES,
                    globalEnabled: false,
                  });
                  handleComplete();
                }}
              >
                Skip for now
              </Button>
            </div>
          </>
        )}

        {step === "categories" && (
          <>
            <DialogHeader>
              <DialogTitle>Alert Types</DialogTitle>
              <DialogDescription>
                Choose which alerts you want to receive
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <PreferenceToggle
                icon={<Shield className="h-5 w-5 text-red-500" />}
                title="Emergency Alerts"
                description="Critical safety notifications"
                checked={preferences.categories.emergencyAlerts}
                onCheckedChange={(v) => updateCategory("emergencyAlerts", v)}
                recommended
              />
              <PreferenceToggle
                icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                title="Town Alerts"
                description="Civic announcements"
                checked={preferences.categories.townAlerts}
                onCheckedChange={(v) => updateCategory("townAlerts", v)}
              />
              <PreferenceToggle
                icon={<Cloud className="h-5 w-5 text-blue-500" />}
                title="Weather & Roads"
                description="Conditions and forecasts"
                checked={preferences.categories.weatherAlerts}
                onCheckedChange={(v) => updateCategory("weatherAlerts", v)}
              />
              <PreferenceToggle
                icon={<Calendar className="h-5 w-5 text-purple-500" />}
                title="Events"
                description="Community happenings"
                checked={preferences.categories.events}
                onCheckedChange={(v) => updateCategory("events", v)}
              />
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={() => setStep("business")}>
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === "business" && (
          <>
            <DialogHeader>
              <DialogTitle>Business Notifications</DialogTitle>
              <DialogDescription>
                Get updates from businesses you follow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <PreferenceToggle
                icon={<Bed className="h-5 w-5 text-indigo-500" />}
                title="Hotels & Stays"
                description="Accommodations"
                checked={preferences.businessTypes.lodging}
                onCheckedChange={(v) => updateBusinessType("lodging", v)}
              />
              <PreferenceToggle
                icon={<Utensils className="h-5 w-5 text-orange-500" />}
                title="Food & Drink"
                description="Restaurants, cafes"
                checked={preferences.businessTypes.restaurant}
                onCheckedChange={(v) => updateBusinessType("restaurant", v)}
              />
              <PreferenceToggle
                icon={<Compass className="h-5 w-5 text-teal-500" />}
                title="Attractions"
                description="Tours, activities"
                checked={preferences.businessTypes.attraction}
                onCheckedChange={(v) => updateBusinessType("attraction", v)}
              />
              <PreferenceToggle
                icon={<Store className="h-5 w-5 text-slate-500" />}
                title="Local Services"
                description="Shops, services"
                checked={preferences.businessTypes.service}
                onCheckedChange={(v) => updateBusinessType("service", v)}
              />
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={() => setStep("complete")}>
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === "complete" && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-2xl">You're All Set!</DialogTitle>
              <DialogDescription className="text-base">
                Your notification preferences have been saved. You can change these anytime in Settings.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <Button className="w-full" onClick={handleComplete}>
                Start Exploring
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-sky-600" />
      </div>
      <span className="text-slate-700">{text}</span>
    </div>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  recommended,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  recommended?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{title}</span>
            {recommended && (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
```

---

## Task 3.6: Add Translations

**File:** `messages/en.json` (update existing)

Add settings-related translations:

```json
{
  "settings": {
    "title": "Settings",
    "description": "Manage your profile and notification preferences",
    "tabs": {
      "notifications": "Notifications",
      "subscriptions": "Subscriptions",
      "profile": "Profile"
    },
    "notifications": {
      "pushTitle": "Push Notifications",
      "pushDescription": "Enable or disable all push notifications",
      "alertsTitle": "Alert Types",
      "alertsDescription": "Choose which types of alerts you want to receive",
      "businessTitle": "Business Notifications",
      "businessDescription": "Choose which types of businesses can send you notifications",
      "quietHoursTitle": "Quiet Hours",
      "quietHoursDescription": "Pause non-emergency notifications during specific hours",
      "quietHoursNote": "Emergency alerts will still come through during quiet hours.",
      "emergency": {
        "title": "Emergency Alerts",
        "description": "Critical safety notifications"
      },
      "town": {
        "title": "Town Alerts",
        "description": "Civic announcements and updates"
      },
      "weather": {
        "title": "Weather & Roads",
        "description": "Weather conditions, road status, aurora forecasts"
      },
      "events": {
        "title": "Events",
        "description": "Community events and festivals"
      },
      "lodging": {
        "title": "Hotels & Stays",
        "description": "Accommodations, guesthouses, B&Bs"
      },
      "restaurant": {
        "title": "Food & Drink",
        "description": "Restaurants, cafes, bars"
      },
      "attraction": {
        "title": "Attractions",
        "description": "Tours, museums, activities"
      },
      "service": {
        "title": "Local Services",
        "description": "Shops, utilities, town services"
      }
    },
    "subscriptions": {
      "businessTitle": "Business Subscriptions",
      "businessDescription": "Businesses you've subscribed to for notifications",
      "placeTitle": "Place Subscriptions",
      "placeDescription": "Places you've subscribed to for notifications",
      "emptyBusiness": "No business subscriptions yet",
      "emptyPlace": "No place subscriptions yet",
      "subscribeHint": "Subscribe to businesses to receive their updates"
    },
    "profile": {
      "title": "Profile Information",
      "description": "Update your personal information",
      "firstName": "First name",
      "email": "Email"
    },
    "actions": {
      "save": "Save Changes",
      "saving": "Saving...",
      "saved": "Settings saved successfully",
      "error": "Failed to save settings",
      "unsubscribe": "Unsubscribe",
      "unsubscribed": "Unsubscribed successfully"
    }
  }
}
```

---

## Verification Steps

1. Log in to the web app
2. Navigate to Settings (from profile menu)
3. Test each tab:
   - Notifications: Toggle categories, business types, quiet hours
   - Subscriptions: View list (may be empty initially)
   - Profile: Edit name and email
4. Save changes and verify they persist
5. Check that preferences are correctly saved to database
6. Verify mobile app reflects the same preferences

---

## Files Created

- `app/[locale]/settings/page.tsx`
- `app/[locale]/settings/SettingsClient.tsx`
- `app/(components)/OnboardingModal.tsx` (optional)

## Files Modified

- `app/(components)/ProfileMenu.tsx`
- `messages/en.json`
