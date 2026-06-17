"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Bell, Trash2, Send, X, Megaphone, BellRing } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  category: "GENERAL" | "NOTIFICATION";
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"GENERAL" | "NOTIFICATION" | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", type: "INFO" as Announcement["type"] });

  function fetchAnnouncements() {
    setLoading(true);
    fetch("/api/admin/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnnouncements(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setTimeout(() => fetchAnnouncements(), 0);
  }, []);

  function handleCreate() {
    if (!formData.title.trim() || !formData.content.trim() || !activeForm) return;
    fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, category: activeForm }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnnouncements([data.data, ...announcements]);
          setActiveForm(null);
          setFormData({ title: "", content: "", type: "INFO" });
        }
      })
      .catch(() => {});
  }

  function handleDelete(id: string) {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    fetch(`/api/admin/announcements/${id}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnnouncements(announcements.filter((a) => a.id !== id));
      })
      .catch(() => {});
  }

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      INFO: "text-secondary bg-secondary/10",
      WARNING: "text-amber-500 bg-amber-500/10",
      SUCCESS: "text-profit bg-profit/10",
      URGENT: "text-loss bg-loss/10",
    };
    return map[type] || "text-text-muted bg-surface-tertiary";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Duyurular</h1>
        <p className="text-text-muted text-sm">Sistem duyurularını yönetin</p>
      </div>

      {/* Seçim Kartları */}
      {!activeForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-secondary/30 transition-all duration-200"
            onClick={() => setActiveForm("GENERAL")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Megaphone className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-lg">Genel Duyuru Oluştur</h3>
                <p className="text-sm text-text-muted mt-1">Tüm kullanıcılara görünecek genel sistem duyurusu</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-accent/30 transition-all duration-200"
            onClick={() => setActiveForm("NOTIFICATION")}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <BellRing className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-lg">Bildirim Duyurusu Oluştur</h3>
                <p className="text-sm text-text-muted mt-1">Kullanıcılara push/bildirim olarak gönderilecek duyuru</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form */}
      {activeForm && (
        <Card className="border-secondary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeForm === "GENERAL" ? (
                  <Megaphone className="w-5 h-5 text-secondary" />
                ) : (
                  <BellRing className="w-5 h-5 text-accent" />
                )}
                <h2 className="font-semibold">
                  {activeForm === "GENERAL" ? "Genel Duyuru" : "Bildirim Duyurusu"} Oluştur
                </h2>
              </div>
              <button
                onClick={() => { setActiveForm(null); setFormData({ title: "", content: "", type: "INFO" }); }}
                className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Duyuru başlığı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm"
            />

            <textarea
              placeholder="Duyuru içeriği"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm resize-none"
            />

            <div className="flex items-center gap-3">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement["type"] })}
                className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm"
              >
                <option value="INFO">Bilgi</option>
                <option value="WARNING">Uyarı</option>
                <option value="SUCCESS">Başarılı</option>
                <option value="URGENT">Acil</option>
              </select>
              <Button onClick={handleCreate} disabled={!formData.title.trim() || !formData.content.trim()}>
                <Send className="w-4 h-4 mr-1" /> Yayınla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mevcut Duyurular */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Mevcut Duyurular</h2>
        {loading ? (
          <div className="text-center py-8 text-text-muted">Yükleniyor...</div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">Henüz duyuru bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-text-primary">{a.title}</h3>
                        <Badge className={typeBadge(a.type)}>{a.type}</Badge>
                        <Badge className={a.category === "GENERAL" ? "text-secondary bg-secondary/10" : "text-accent bg-accent/10"}>
                          {a.category === "GENERAL" ? "Genel" : "Bildirim"}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2">{a.content}</p>
                      <p className="text-xs text-text-muted mt-2">{new Date(a.createdAt).toLocaleString("tr-TR")}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
