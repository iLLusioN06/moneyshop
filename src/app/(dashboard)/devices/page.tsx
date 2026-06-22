"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { Smartphone, Laptop, Tablet, Shield, ShieldCheck, Trash2, RefreshCw, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Device {
  id: string;
  name?: string;
  type?: string;
  os?: string;
  browser?: string;
  ip?: string;
  lastSeenAt: string;
  status: string;
  isTrusted: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = { MOBILE: Smartphone, TABLET: Tablet, DESKTOP: Laptop };
const statusColors: Record<string, string> = { ACTIVE: "bg-profit/10 text-profit", INACTIVE: "bg-surface-tertiary text-text-muted", BLOCKED: "bg-loss/10 text-loss" };

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      if (data.success) setDevices(data.data);
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const toggleTrust = async (id: string, trusted: boolean) => {
    try {
      const res = await fetch("/api/devices/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: id, trusted: !trusted }),
      });
      const data = await res.json();
      if (data.success) setDevices((prev) => prev.map((d) => d.id === id ? { ...d, isTrusted: !trusted } : d));
    } catch {}
  };

  const removeDevice = async (id: string) => {
    try {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Cihazlarım</h2>
          <p className="text-sm text-text-muted mt-1">Hesabınıza erişen cihazları yönetin</p>
        </div>
        <button onClick={fetchDevices} className="p-2 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {error && (
        <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i}><CardContent className="p-4"><div className="animate-pulse h-4 bg-surface-tertiary rounded w-1/3" /></CardContent></Card>)}</div>
      ) : devices.length === 0 ? (
        <Card><EmptyState icon={Smartphone} title="Cihaz yok" description="Henüz kayıtlı cihaz bulunmuyor." /></Card>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const Icon = typeIcons[device.type || ""] || Smartphone;
            return (
              <Card key={device.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", device.isTrusted ? "bg-profit/10 text-profit" : "bg-surface-tertiary text-text-muted")}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-text-primary">{device.name || device.os || "Bilinmeyen Cihaz"}</h4>
                          {device.isTrusted && <ShieldCheck className="w-4 h-4 text-profit" />}
                        </div>
                        <p className="text-xs text-text-muted">
                          {[device.os, device.browser, device.ip].filter(Boolean).join(" · ")} · Son görülme: {timeAgo(device.lastSeenAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleTrust(device.id, device.isTrusted)} className={cn("p-2 rounded-lg transition-colors", device.isTrusted ? "hover:bg-loss/10 text-profit hover:text-loss" : "hover:bg-surface-tertiary text-text-muted hover:text-profit")} title={device.isTrusted ? "Güvenilirlikten kaldır" : "Güvenilir olarak işaretle"}>
                        {device.isTrusted ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeDevice(device.id)} className="p-2 rounded-lg hover:bg-loss/10 text-text-muted hover:text-loss transition-colors" title="Cihazı kaldır">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
