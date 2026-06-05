"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAppStore } from "@/stores/app-store";
import { signOut } from "next-auth/react";
import {
  Palette,
  Globe,
  Bell,
  DollarSign,
  Shield,
  LogOut,
  Save,
  Moon,
  Sun,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    currency,
    setCurrency,
    notifications,
    toggleNotification,
  } = useAppStore();

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // State zaten persist ediliyor — localStorage'a otomatik kaydedilir
    await new Promise((r) => setTimeout(r, 300));
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <ErrorBoundary>
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Ayarlar</h2>
        <p className="text-sm text-text-muted mt-1">
          Uygulama tercihlerinizi yönetin
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit">
          <Check className="w-4 h-4" />
          Ayarlar kaydedildi.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Görünüm
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: theme === t ? "var(--color-secondary)" : "var(--color-border)",
                    backgroundColor:
                      theme === t ? "var(--color-secondary-10)" : "var(--color-surface)",
                  }}
                >
                  {t === "light" && <Sun className="w-5 h-5 text-pending" />}
                  {t === "dark" && <Moon className="w-5 h-5 text-secondary" />}
                  {t === "system" && <Globe className="w-5 h-5 text-text-muted" />}
                  <span className="text-sm font-medium text-text-primary">
                    {t === "light" ? "Açık" : t === "dark" ? "Koyu" : "Sistem"}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Para Birimi
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { value: "TRY", label: "₺ Türk Lirası" },
                { value: "USD", label: "$ Dolar" },
                { value: "EUR", label: "€ Euro" },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCurrency(c.value)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all"
                  style={{
                    borderColor:
                      currency === c.value ? "var(--color-secondary)" : "var(--color-border)",
                    backgroundColor:
                      currency === c.value
                        ? "var(--color-secondary-10)"
                        : "var(--color-surface)",
                  }}
                >
                  <span className="text-sm font-medium text-text-primary">{c.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Bildirimler
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: "budgetAlerts" as const, label: "Bütçe Uyarıları", desc: "Bütçe limitine yaklaşıldığında bildirim al" },
                { key: "monthlyReports" as const, label: "Aylık Raporlar", desc: "Her ay sonu özet rapor gönder" },
                { key: "largeTransactions" as const, label: "Büyük İşlemler", desc: "Yüksek tutarlı işlemlerde bildirim al" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: notifications[item.key]
                        ? "var(--color-secondary)"
                        : "var(--color-border)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{
                        transform: notifications[item.key]
                          ? "translateX(20px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Güvenlik
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Şifre Değiştir</p>
                <p className="text-xs text-text-muted mb-3">
                  Hesap güvenliğiniz için şifrenizi düzenli olarak değiştirin.
                </p>
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4" />
                  Şifre Değiştir
                </Button>
              </div>
              <hr className="border-border" />
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Oturumu Kapat</p>
                <p className="text-xs text-text-muted mb-3">
                  Tüm cihazlardan çıkış yapın.
                </p>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button isLoading={isSaving} onClick={handleSave}>
          <Save className="w-4 h-4" />
          Ayarları Kaydet
        </Button>
      </div>
    </div>
    </ErrorBoundary>
  );
}
