"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState, Input } from "@/components/ui";
import { FileText, PenLine, X, AlertCircle, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contract {
  id: string;
  title: string;
  type: string;
  version: string;
  content?: string;
  status: string;
  signedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  TERMS_OF_SERVICE: "Kullanım Şartları", PRIVACY_POLICY: "Gizlilik Politikası",
  KYC_CONSENT: "KYC Onayı", CARD_AGREEMENT: "Kart Sözleşmesi",
};

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  DRAFT: { color: "bg-surface-tertiary text-text-muted", label: "Taslak", icon: FileText },
  ACTIVE: { color: "bg-profit/10 text-profit", label: "Aktif", icon: CheckCircle },
  TERMINATED: { color: "bg-loss/10 text-loss", label: "Feshedildi", icon: X },
  EXPIRED: { color: "bg-warning/10 text-warning", label: "Süresi Doldu", icon: Clock },
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      if (data.success) setContracts(data.data);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const viewContract = async (id: string) => {
    const res = await fetch(`/api/contracts/${id}`);
    const data = await res.json();
    if (data.success) setSelected(data.data);
  };

  const signContract = async (id: string) => {
    setSigning(true);
    try {
      const res = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: id }),
      });
      const data = await res.json();
      if (data.success) { setSelected(null); fetchContracts(); }
      else { setError(data.error); }
    } catch { setError("İmzalama sırasında hata oluştu."); } finally { setSigning(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Sözleşmelerim</h2>
          <p className="text-sm text-text-muted mt-1">Sözleşme ve onaylarınızı görüntüleyin</p>
        </div>
        <button onClick={fetchContracts} className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/3" /></CardContent></Card>)}</div>
      ) : contracts.length === 0 ? (
        <Card><EmptyState icon={FileText} title="Sözleşme yok" description="Henüz sözleşme bulunmuyor." /></Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.DRAFT;
            const Icon = cfg.icon;
            return (
              <Card key={c.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => viewContract(c.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-text-muted">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{c.title}</h4>
                      <p className="text-xs text-text-muted">{typeLabels[c.type] || c.type} · v{c.version} · {formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", cfg.color)} size="sm"><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{selected.title}</h3>
                <p className="text-xs text-text-muted">{typeLabels[selected.type] || selected.type} · v{selected.version}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-surface-tertiary"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="prose prose-sm max-w-none text-text-secondary" dangerouslySetInnerHTML={{ __html: selected.content || "İçerik yükleniyor..." }} />
            </div>
            <div className="flex items-center justify-between p-5 border-t border-border">
              <div className="text-xs text-text-muted">
                {selected.signedAt ? `İmza tarihi: ${formatDate(selected.signedAt)}` : "Henüz imzalanmadı"}
              </div>
              {selected.status !== "ACTIVE" && !selected.signedAt && (
                <Button onClick={() => signContract(selected.id)} isLoading={signing}>
                  <PenLine className="w-4 h-4" />Sözleşmeyi İmzala
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
