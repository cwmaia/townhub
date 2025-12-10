"use client";

import { useState } from "react";
import { Bell, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  const quotaDisplay = quota.limit === null ? "Unlimited" : `${quota.used}/${quota.limit} used`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Send Notification</CardTitle>
          </div>
          <Badge variant={quota.allowed ? "outline" : "destructive"}>{quotaDisplay}</Badge>
        </div>
        <CardDescription>Send push notifications to your {businessName} subscribers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!quota.allowed && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
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
          <p className="text-right text-xs text-muted-foreground">{body.length}/500</p>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <Button
          onClick={handleSend}
          disabled={!quota.allowed || sending || !title.trim() || !body.trim()}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Sending..." : "Send Notification"}
        </Button>

        {quota.remaining !== null && quota.remaining > 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {quota.remaining} notification{quota.remaining !== 1 ? "s" : ""} remaining this month
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
