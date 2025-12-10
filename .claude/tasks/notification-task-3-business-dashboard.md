# Task 3: Business Notifications Dashboard UI

## Overview
Enhance the business dashboard to allow business owners to send notifications to their subscribers. This includes a dedicated notifications section with quota display, notification composer, and history.

## Context

### Existing Files to Reference
- `app/[locale]/admin/business/page.tsx` - Business dashboard page
- `app/[locale]/admin/notifications/page.tsx` - Town admin notifications page (reference for patterns)
- `lib/notifications/types.ts` - Notification types and categories
- `lib/notifications/quota.ts` - Quota checking functions
- `app/api/notifications/send/route.ts` - Send API endpoint
- `components/admin/SendNotificationForm.tsx` - Existing form component

### Business Notification Types (from types.ts)
```typescript
BUSINESS_PROMO: { label: "Promotion", labelIs: "Tilboð", category: "business" }
BUSINESS_EVENT: { label: "Business Event", labelIs: "Viðburður", category: "business" }
BUSINESS_UPDATE: { label: "Update", labelIs: "Uppfærsla", category: "business" }
```

### Quota API
```typescript
GET /api/notifications/quota
// Returns for business owner:
{
  entityType: "business",
  entityId: string,
  entityName: string,
  notifications: { allowed: boolean, used: number, limit: number | null, remaining: number | null },
  events: { allowed: boolean, used: number, limit: number | null, remaining: number | null }
}
```

### Send API
```typescript
POST /api/notifications/send
Body: {
  title: string,
  body: string,
  type: "BUSINESS_PROMO" | "BUSINESS_EVENT" | "BUSINESS_UPDATE",
  targetType: "BUSINESS_SUBSCRIBERS",
  deeplink?: string,
  imageUrl?: string
}
```

## Implementation

### 1. Create Business Notification Card Component

Create `components/admin/BusinessNotificationCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, AlertCircle } from "lucide-react";

interface QuotaStatus {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

interface BusinessNotificationCardProps {
  businessId: string;
  businessName: string;
  quota: QuotaStatus;
  onSend: (data: { title: string; body: string; type: string }) => Promise<void>;
}

const BUSINESS_NOTIFICATION_TYPES = [
  { value: "BUSINESS_PROMO", label: "Promotion", description: "Special offers and deals" },
  { value: "BUSINESS_EVENT", label: "Event", description: "Upcoming events at your business" },
  { value: "BUSINESS_UPDATE", label: "Update", description: "General business updates" },
];

export function BusinessNotificationCard({
  businessId,
  businessName,
  quota,
  onSend,
}: BusinessNotificationCardProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("BUSINESS_PROMO");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Title and message are required");
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      await onSend({ title, body, type });
      setSuccess("Notification sent successfully!");
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const quotaDisplay = quota.limit === null
    ? "Unlimited"
    : `${quota.used}/${quota.limit} used`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Send Notification</CardTitle>
          </div>
          <Badge variant={quota.allowed ? "outline" : "destructive"}>
            {quotaDisplay}
          </Badge>
        </div>
        <CardDescription>
          Send push notifications to your {businessName} subscribers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!quota.allowed && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Monthly notification quota exceeded</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select value={type} onValueChange={setType} disabled={!quota.allowed}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex flex-col">
                    <span>{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!quota.allowed || sending}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            placeholder="Your message to subscribers..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!quota.allowed || sending}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {body.length}/500
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600">{success}</p>
        )}

        <Button
          onClick={handleSend}
          disabled={!quota.allowed || sending || !title.trim() || !body.trim()}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? "Sending..." : "Send Notification"}
        </Button>

        {quota.remaining !== null && quota.remaining > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            {quota.remaining} notification{quota.remaining !== 1 ? "s" : ""} remaining this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 2. Create Notification History Component

Create `components/admin/NotificationHistory.tsx`:

```tsx
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NOTIFICATION_TYPE_INFO, NotificationType } from "@/lib/notifications/types";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  sentAt: Date | null;
  audienceCount: number;
  deliveryCount: number;
}

interface NotificationHistoryProps {
  notifications: NotificationItem[];
}

export function NotificationHistory({ notifications }: NotificationHistoryProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No notifications sent yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const typeInfo = NOTIFICATION_TYPE_INFO[notification.type as NotificationType];
            return (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{notification.title}</span>
                    {typeInfo && (
                      <Badge className={`${typeInfo.bgColor} ${typeInfo.color}`}>
                        {typeInfo.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {notification.body}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {notification.sentAt && (
                      <span>{format(new Date(notification.sentAt), "MMM d, h:mm a")}</span>
                    )}
                    <span>
                      {notification.deliveryCount}/{notification.audienceCount} delivered
                    </span>
                  </div>
                </div>
                <Badge
                  variant={notification.status === "sent" ? "default" : "secondary"}
                >
                  {notification.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Update Business Dashboard Page

Modify `app/[locale]/admin/business/page.tsx` to include the notification section:

Add imports:
```tsx
import { BusinessNotificationCard } from "@/components/admin/BusinessNotificationCard";
import { NotificationHistory } from "@/components/admin/NotificationHistory";
```

Add server action:
```tsx
const sendBusinessNotificationAction = async (formData: FormData) => {
  "use server";

  const { profile } = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const business = await prisma.business.findUnique({
    where: { userId: profile.id },
    select: { id: true },
  });

  if (!business) throw new Error("Business not found");

  const title = formData.get("title")?.toString();
  const body = formData.get("body")?.toString();
  const type = formData.get("type")?.toString() || "BUSINESS_PROMO";

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      body,
      type,
      targetType: "BUSINESS_SUBSCRIBERS",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send notification");
  }

  revalidatePath("/admin/business");
};
```

Add to the page JSX (in appropriate location):
```tsx
{/* Notifications Section */}
<section className="space-y-4">
  <h2 className="text-xl font-semibold">Notifications</h2>
  <div className="grid gap-4 md:grid-cols-2">
    <BusinessNotificationCard
      businessId={business.id}
      businessName={business.name}
      quota={notificationQuota}
      onSend={async (data) => {
        "use server";
        const fd = new FormData();
        fd.set("title", data.title);
        fd.set("body", data.body);
        fd.set("type", data.type);
        await sendBusinessNotificationAction(fd);
      }}
    />
    <NotificationHistory notifications={recentNotifications} />
  </div>
</section>
```

### 4. Fetch Quota and History Data

Add to page's data fetching:
```tsx
// Fetch notification quota
const quotaResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/quota`, {
  headers: { Cookie: `...` }, // Pass auth
});
const quotaData = await quotaResponse.json();
const notificationQuota = quotaData.notifications;

// Fetch recent notifications
const recentNotifications = await prisma.notification.findMany({
  where: { businessId: business.id },
  orderBy: { createdAt: "desc" },
  take: 10,
  select: {
    id: true,
    title: true,
    body: true,
    type: true,
    status: true,
    sentAt: true,
    audienceCount: true,
    deliveryCount: true,
  },
});
```

## Verification Steps

1. Log in as business owner (demo user)
2. Navigate to business dashboard
3. Verify quota display shows current usage
4. Send a test notification
5. Verify quota updates after sending
6. Verify notification appears in history
7. Try to exceed quota and verify error message

## Files Created/Modified

- `components/admin/BusinessNotificationCard.tsx` - Created
- `components/admin/NotificationHistory.tsx` - Created
- `app/[locale]/admin/business/page.tsx` - Modified to include notification section
