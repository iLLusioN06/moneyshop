"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState } from "@/components/ui";
import { Bell, Check, CheckCheck, Trash2, X, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  TRANSACTION: "bg-profit/10 text-profit",
  TRANSFER: "bg-secondary/10 text-secondary",
  BUDGET_ALERT: "bg-warning/10 text-warning",
  SYSTEM: "bg-surface-tertiary text-text-muted",
  SECURITY: "bg-loss/10 text-loss",
  PROMOTION: "bg-accent/10 text-accent",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("unreadOnly", "true");
      const res = await fetch(`/api/notifications?${params}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } else {
        setError(data.error || "Bildirimler alınamadı.");
      }
    } catch {
      setError("Bildirimler alınırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (!notifications.find((n) => n.id === id)?.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch {}
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Bildirimler</h2>
          <p className="text-sm text-text-muted mt-1">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilter(filter === "all" ? "unread" : "all")}>
            {filter === "all" ? "Okunmamışlar" : "Tümü"}
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4" />
              Tümünü Okundu İşaretle
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-4"><div className="animate-pulse space-y-2">
              <div className="h-4 bg-surface-tertiary rounded w-1/3" />
              <div className="h-3 bg-surface-tertiary rounded w-2/3" />
            </div></CardContent></Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card><EmptyState icon={Bell} title="Bildirim yok" description={filter === "unread" ? "Tüm bildirimleriniz okundu." : "Henüz bildirim almamışsınız."} /></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn("transition-all hover:shadow-md", !n.isRead && "border-l-4 border-l-secondary")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs", typeColors[n.type] || typeColors.SYSTEM)} size="sm">{n.type}</Badge>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary" />}
                    </div>
                    <h4 className="font-medium text-text-primary">{n.title}</h4>
                    <p className="text-sm text-text-muted mt-0.5">{n.message}</p>
                    <p className="text-xs text-text-muted mt-2">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-profit transition-colors" title="Okundu İşaretle">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} className="p-1.5 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors" title="Sil">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
