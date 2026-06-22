"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState, Input } from "@/components/ui";
import { Webhook, Plus, Trash2, X, AlertCircle, RefreshCw, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string;
  failCount: number;
  lastTriggeredAt?: string;
  lastStatus?: number;
  createdAt: string;
}

const availableEvents = [
  "transaction.created", "transaction.completed", "transfer.created", "transfer.completed",
  "account.created", "budget.alert", "card.status_changed",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ url: "", description: "", events: [] as string[] });
  const [createdSecret, setCreatedSecret] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      if (data.success) setWebhooks(data.data);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const createWebhook = async () => {
    if (!form.url.trim() || form.events.length === 0) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setCreatedSecret(data.data.secret); setShowCreate(false); setForm({ url: "", description: "", events: [] }); fetchWebhooks(); }
      else { setError(data.error); }
    } catch { setError("Webhook oluşturulurken hata oluştu."); } finally { setIsCreating(false); }
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      const data = await res.json();
      if (data.success) fetchWebhooks();
    } catch {}
  };

  const deleteWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchWebhooks();
    } catch {}
  };

  const toggleEvent = (event: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter((e) => e !== event) : [...prev.events, event],
    }));
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR");

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Webhook&apos;lar</h2>
          <p className="text-sm text-text-muted mt-1">HTTP bildirim endpoint&apos;lerinizi yönetin</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setCreatedSecret(""); }}><Plus className="w-4 h-4" />Webhook Oluştur</Button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {createdSecret && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-text-primary mb-1">Webhook Secret</h4>
                <p className="text-xs text-text-muted mb-3">Bu secret&apos;ı HMAC imza doğrulaması için kullanın. Tekrar gösterilmeyecek.</p>
                <code className="block p-2 rounded bg-surface-tertiary font-mono text-sm break-all">{createdSecret}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/3" /></CardContent></Card>)}</div>
      ) : webhooks.length === 0 ? (
        <Card><EmptyState icon={Webhook} title="Webhook yok" description="HTTP bildirimleri için bir webhook oluşturun." action={{ label: "Webhook Oluştur", onClick: () => setShowCreate(true), icon: Plus }} /></Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <Card key={w.id} className={cn("hover:shadow-md transition-all", !w.isActive && "opacity-60")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", w.isActive ? "bg-secondary/10 text-secondary" : "bg-surface-tertiary text-text-muted")}><Webhook className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-text-primary truncate">{w.url}</h4>
                      {w.lastStatus && w.lastStatus >= 200 && w.lastStatus < 300 ? (
                        <Badge className="text-xs bg-profit/10 text-profit" size="sm">{w.lastStatus}</Badge>
                      ) : w.lastStatus ? (
                        <Badge className="text-xs bg-loss/10 text-loss" size="sm">{w.lastStatus}</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{w.events.length} oland · {w.failCount > 0 ? `${w.failCount} başarısız` : "Başarılı"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleWebhook(w.id, w.isActive)} className={cn("p-2 rounded-lg transition-colors", w.isActive ? "hover:bg-warning/10 text-profit hover:text-warning" : "hover:bg-surface-tertiary text-text-muted hover:text-profit")}>
                    {w.isActive ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteWebhook(w.id)} className="p-2 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Yeni Webhook</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-surface-tertiary"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <Input label="URL" placeholder="https://example.com/webhook" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                <Input label="Açıklama (opsiyonel)" placeholder="Webhook açıklaması" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Olaylar</label>
                  <div className="flex flex-wrap gap-2">
                    {availableEvents.map((e) => (
                      <button key={e} onClick={() => toggleEvent(e)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", form.events.includes(e) ? "bg-secondary text-white border-secondary" : "bg-surface border-border text-text-muted hover:border-secondary")}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>İptal</Button>
                  <Button className="flex-1" isLoading={isCreating} onClick={createWebhook} disabled={!form.url.trim() || form.events.length === 0}>Oluştur</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
