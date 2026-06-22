"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, EmptyState } from "@/components/ui";
import { Megaphone, AlertTriangle, Info, Wrench, RefreshCw, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: number;
  targetUrl?: string;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  INFO: { icon: Info, color: "border-l-secondary bg-secondary/5", label: "Bilgi" },
  WARNING: { icon: AlertTriangle, color: "border-l-warning bg-warning/5", label: "Uyarı" },
  MAINTENANCE: { icon: Wrench, color: "border-l-text-muted bg-surface-tertiary/50", label: "Bakım" },
  UPDATE: { icon: Megaphone, color: "border-l-profit bg-profit/5", label: "Güncelleme" },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
      } else {
        setError(data.error || "Duyurular alınamadı.");
      }
    } catch {
      setError("Duyurular alınırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Duyurular</h2>
          <p className="text-sm text-text-muted mt-1">Güncel duyurular ve bildirimler</p>
        </div>
        <button onClick={fetchAnnouncements} className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-5"><div className="animate-pulse space-y-3">
              <div className="h-4 bg-surface-tertiary rounded w-1/4" />
              <div className="h-5 bg-surface-tertiary rounded w-1/2" />
              <div className="h-16 bg-surface-tertiary rounded w-full" />
            </div></CardContent></Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="Duyuru yok" description="Şu anda aktif bir duyuru bulunmuyor." /></Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const config = typeConfig[a.type] || typeConfig.INFO;
            const Icon = config.icon;
            return (
              <Card key={a.id} className={cn("border-l-4 transition-all hover:shadow-md", config.color)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-text-muted">{config.label}</span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{formatDate(a.createdAt)}</span>
                      </div>
                      <h3 className="font-semibold text-text-primary mb-2">{a.title}</h3>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">{a.content}</p>
                      {a.targetUrl && (
                        <a href={a.targetUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-medium text-secondary hover:underline">
                          Daha fazla bilgi →
                        </a>
                      )}
                      {a.expiresAt && (
                        <p className="text-xs text-text-muted mt-2">Son geçerlilik: {formatDate(a.expiresAt)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
