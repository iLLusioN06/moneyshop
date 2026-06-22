"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState, Input } from "@/components/ui";
import { Key, Plus, Trash2, X, AlertCircle, RefreshCw, Eye, EyeOff, Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  rateLimit: number;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      if (data.success) setKeys(data.data);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) { setCreatedKey(data.data.key); setNewKeyName(""); setShowCreate(false); fetchKeys(); }
      else { setError(data.error); }
    } catch { setError("API anahtarı oluşturulurken hata oluştu."); } finally { setIsCreating(false); }
  };

  const revokeKey = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchKeys();
    } catch {}
  };

  const toggleKey = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      const data = await res.json();
      if (data.success) fetchKeys();
    } catch {}
  };

  const copyKey = () => { navigator.clipboard.writeText(createdKey); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR");

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">API Anahtarları</h2>
          <p className="text-sm text-text-muted mt-1">API erişim anahtarlarınızı yönetin</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setCreatedKey(""); }}><Plus className="w-4 h-4" />Anahtar Oluştur</Button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {createdKey && (
        <Card className="border-profit/30 bg-profit/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-profit mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-text-primary mb-1">API Anahtarı Oluşturuldu</h4>
                <p className="text-xs text-text-muted mb-3">Bu anahtarı güvenli bir yerde saklayın — tekrar gösterilmeyecek.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-surface-tertiary font-mono text-sm break-all">{createdKey}</code>
                  <Button size="sm" onClick={copyKey}>{copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/3" /></CardContent></Card>)}</div>
      ) : keys.length === 0 ? (
        <Card><EmptyState icon={Key} title="API anahtarı yok" description="API erişimi için bir anahtar oluşturun." action={{ label: "Anahtar Oluştur", onClick: () => setShowCreate(true), icon: Plus }} /></Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <Card key={k.id} className={cn("hover:shadow-md transition-all", !k.isActive && "opacity-60")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-text-muted"><Key className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-medium text-text-primary">{k.name}</h4>
                    <p className="text-xs text-text-muted font-mono">{k.keyPrefix}... · {k.rateLimit} ist/dk · {k.lastUsedAt ? `Son kullanım: ${formatDate(k.lastUsedAt)}` : "Hiç kullanılmadı"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleKey(k.id, k.isActive)} className={cn("p-2 rounded-lg transition-colors", k.isActive ? "hover:bg-warning/10 text-profit hover:text-warning" : "hover:bg-surface-tertiary text-text-muted hover:text-profit")} title={k.isActive ? "Devre dışı bırak" : "Etkinleştir"}>
                    {k.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => revokeKey(k.id)} className="p-2 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors" title="Sil"><Trash2 className="w-4 h-4" /></button>
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
                <h3 className="text-lg font-semibold text-text-primary">Yeni API Anahtarı</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-surface-tertiary"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <Input label="Anahtar Adı" placeholder="Örn: Production App" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>İptal</Button>
                  <Button className="flex-1" isLoading={isCreating} onClick={createKey} disabled={!newKeyName.trim()}>Oluştur</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
