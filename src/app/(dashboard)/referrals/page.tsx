"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Badge, EmptyState, Input } from "@/components/ui";
import { Users, Copy, Gift, CheckCircle, Clock, AlertCircle, X, RefreshCw, ExternalLink } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Referral {
  id: string;
  code: string;
  status: string;
  rewardAmount: number;
  rewardType?: string;
  referred?: { id: string; name: string; email: string; createdAt: string };
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  PENDING: { color: "bg-warning/10 text-warning", label: "Bekliyor", icon: Clock },
  COMPLETED: { color: "bg-profit/10 text-profit", label: "Tamamlandı", icon: CheckCircle },
  EXPIRED: { color: "bg-surface-tertiary text-text-muted", label: "Süresi Doldu", icon: Clock },
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalReward: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      if (data.success) {
        setReferrals(data.data);
        setStats(data.stats);
        if (data.data.length > 0) setMyCode(data.data[0].code);
      }
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const generateCode = async () => {
    try {
      const res = await fetch("/api/referrals", { method: "POST" });
      const data = await res.json();
      if (data.success) { setMyCode(data.data.code); fetchReferrals(); }
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setIsRedeeming(true);
    setRedeemMsg("");
    try {
      const res = await fetch("/api/referrals/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();
      if (data.success) { setRedeemMsg("Davet kodu başarıyla kullanıldı!"); setRedeemCode(""); fetchReferrals(); }
      else { setRedeemMsg(data.error); }
    } catch { setRedeemMsg("Bir hata oluştu."); } finally { setIsRedeeming(false); }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Davet Sistemi</h2>
        <p className="text-sm text-text-muted mt-1">Arkadaşlarınızı davet edin, ödül kazanın</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Davet", value: stats.total, icon: Users },
          { label: "Tamamlanan", value: stats.completed, icon: CheckCircle },
          { label: "Bekleyen", value: stats.pending, icon: Clock },
          { label: "Toplam Ödül", value: formatCurrency(stats.totalReward), icon: Gift },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 text-center">
            <s.icon className="w-5 h-5 text-secondary mx-auto mb-2" />
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* My Code */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-text-primary mb-3">Davet Kodunuz</h3>
          {myCode ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 p-3 rounded-lg bg-surface-tertiary font-mono text-lg text-text-primary">{myCode}</code>
              <Button onClick={copyCode} variant="outline">{copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Kopyalandı" : "Kopyala"}</Button>
            </div>
          ) : (
            <Button onClick={generateCode}><Gift className="w-4 h-4" />Davet Kodu Oluştur</Button>
          )}
          {myCode && (
            <p className="text-xs text-text-muted mt-2">Bu kodu arkadaşlarınızla paylaşın. Kayıt olduktan sonra her ikiniz de ödül kazanırsınız.</p>
          )}
        </CardContent>
      </Card>

      {/* Redeem Code */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold text-text-primary mb-3">Davet Kodu Kullan</h3>
          <div className="flex items-center gap-3">
            <Input placeholder="Davet kodunu girin (MS-XXXX-XXXXXX)" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} className="flex-1" />
            <Button onClick={handleRedeem} isLoading={isRedeeming} disabled={!redeemCode.trim()}>Kullan</Button>
          </div>
          {redeemMsg && (
            <p className={cn("text-sm mt-2", redeemMsg.includes("başarı") ? "text-profit" : "text-loss")}>{redeemMsg}</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Referral List */}
      <div>
        <h3 className="font-semibold text-text-primary mb-3">Davet Geçmişi</h3>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/3" /></CardContent></Card>)}</div>
        ) : referrals.length === 0 ? (
          <Card><EmptyState icon={Users} title="Henüz davetiniz yok" description="İlk davet kodunuzu oluşturun." /></Card>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => {
              const cfg = statusConfig[r.status] || statusConfig.PENDING;
              const Icon = cfg.icon;
              return (
                <Card key={r.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-text-primary bg-surface-tertiary px-2 py-1 rounded">{r.code}</code>
                      {r.referred && (
                        <span className="text-sm text-text-muted">{r.referred.name || r.referred.email}</span>
                      )}
                    </div>
                    <Badge className={cn("text-xs", cfg.color)} size="sm"><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
