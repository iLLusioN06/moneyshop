"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Input, EmptyState, Badge } from "@/components/ui";
import { ShieldAlert, RefreshCw, AlertCircle, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginAttempt {
  id: string;
  success: boolean;
  failureReason?: string;
  ip?: string;
  country?: string;
  city?: string;
  createdAt: string;
}

export default function LoginAttemptsPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [recentFailures, setRecentFailures] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttempts = useCallback(async (e: string) => {
    if (!e.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/login-attempts?email=${encodeURIComponent(e)}`);
      const data = await res.json();
      if (data.success) {
        setAttempts(data.data);
        setRecentFailures(data.recentFailures);
        setIsLocked(data.isLocked);
      } else {
        setError(data.error);
      }
    } catch { setError("Giriş denemeleri alınamadı."); } finally { setIsLoading(false); }
  }, []);

  const handleSearch = () => {
    setSearchEmail(email);
    fetchAttempts(email);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Giriş Denemeleri</h2>
        <p className="text-sm text-text-muted mt-1">Hesap güvenlik geçmişini görüntüleyin</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input label="E-posta Adresi" placeholder="kullanici@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <Button onClick={handleSearch} isLoading={isLoading} disabled={!email.trim()}><Search className="w-4 h-4" />Sorgula</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {searchEmail && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{attempts.length}</p>
            <p className="text-xs text-text-muted">Toplam Deneme</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className={cn("text-2xl font-bold", recentFailures >= 5 ? "text-loss" : "text-text-primary")}>{recentFailures}</p>
            <p className="text-xs text-text-muted">Son 15 dk Başarısız</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Badge className={cn("text-xs", isLocked ? "bg-loss/10 text-loss" : "bg-profit/10 text-profit")} size="sm">{isLocked ? "Hesap Kilitli" : "Hesap Açık"}</Badge>
            <p className="text-xs text-text-muted mt-1">Hesap Durumu</p>
          </CardContent></Card>
        </div>
      )}

      {searchEmail && !isLoading && attempts.length === 0 && (
        <Card><EmptyState icon={ShieldAlert} title="Deneme bulunamadı" description={`${searchEmail} için giriş denemesi kaydı bulunamadı.`} /></Card>
      )}

      {attempts.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {attempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-tertiary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", a.success ? "bg-profit" : "bg-loss")} />
                    <div>
                      <p className={cn("text-sm font-medium", a.success ? "text-profit" : "text-loss")}>{a.success ? "Başarılı" : "Başarısız"}</p>
                      <p className="text-xs text-text-muted">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.failureReason && <p className="text-xs text-loss">{a.failureReason}</p>}
                    {a.ip && <p className="text-xs text-text-muted font-mono">{a.ip}</p>}
                    {a.city && <p className="text-xs text-text-muted">{[a.city, a.country].filter(Boolean).join(", ")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
