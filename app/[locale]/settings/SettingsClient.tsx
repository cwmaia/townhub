"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { NotificationPreferences } from "@/lib/notifications/types";
import type { UserRole } from "@prisma/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  locale?: string;
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    profile.notificationPreferences
  );
  const [businessSubscriptions, setBusinessSubscriptions] = useState(profile.businessSubscriptions);
  const [placeSubscriptions, setPlaceSubscriptions] = useState(profile.placeSubscriptions);

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

      setBusinessSubscriptions((prev) => prev.filter((sub) => sub.businessId !== businessId));
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

      setPlaceSubscriptions((prev) => prev.filter((sub) => sub.placeId !== placeId));
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

  const updateBusinessType = (
    key: keyof NotificationPreferences["businessTypes"],
    value: boolean
  ) => {
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
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your profile and notification preferences</p>
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

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>Enable or disable all push notifications</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>Choose which types of alerts you want to receive</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Business Notifications</CardTitle>
              <CardDescription>Choose which types of businesses can send you notifications</CardDescription>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Quiet Hours
                  </CardTitle>
                  <CardDescription>Pause non-emergency notifications during specific hours</CardDescription>
                </div>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updateQuietHours({ enabled: checked })}
                  disabled={!preferences.globalEnabled}
                />
              </div>
            </CardHeader>
            {preferences.quietHours.enabled && preferences.globalEnabled ? (
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
                <p className="mt-2 text-sm text-slate-500">
                  Emergency alerts will still come through during quiet hours.
                </p>
              </CardContent>
            ) : null}
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </TabsContent>

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
                <div className="py-8 text-center text-slate-500">
                  <Building2 className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No business subscriptions yet</p>
                  <p className="text-sm">Subscribe to businesses to receive their updates</p>
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
                <div className="py-8 text-center text-slate-500">
                  <MapPin className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No place subscriptions yet</p>
                  <p className="text-sm">Subscribe to places to receive updates about them</p>
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

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function NotificationToggle({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  recommended,
  disabled,
}: {
  icon: ReactNode;
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
            {recommended ? (
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
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
  onUnsubscribe: () => Promise<void> | void;
}) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true);
    await onUnsubscribe();
    setIsUnsubscribing(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200">
          <Building2 className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{name}</p>
        {subtitle ? <p className="truncate text-sm text-slate-500">{subtitle}</p> : null}
        {tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUnsubscribe}
        disabled={isUnsubscribing}
        className="text-slate-500 hover:text-red-600"
      >
        {isUnsubscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
