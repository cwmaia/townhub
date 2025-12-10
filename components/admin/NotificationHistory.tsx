import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NOTIFICATION_TYPE_INFO, type NotificationType } from "@/lib/notifications/types";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  sentAt: Date | null;
  audienceCount: number | null;
  deliveryCount: number | null;
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
          <p className="py-8 text-center text-muted-foreground">No notifications sent yet</p>
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
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{notification.title}</span>
                    {typeInfo ? (
                      <Badge className={`${typeInfo.bgColor} ${typeInfo.color}`}>{typeInfo.label}</Badge>
                    ) : null}
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{notification.body}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {notification.sentAt ? (
                      <span>{format(new Date(notification.sentAt), "MMM d, h:mm a")}</span>
                    ) : null}
                    {typeof notification.deliveryCount === "number" && typeof notification.audienceCount === "number" ? (
                      <span>
                        {notification.deliveryCount}/{notification.audienceCount} delivered
                      </span>
                    ) : null}
                  </div>
                </div>
                <Badge variant={notification.status === "sent" ? "default" : "secondary"}>
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
