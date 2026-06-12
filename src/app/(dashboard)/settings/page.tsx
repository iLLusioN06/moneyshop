"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAppStore } from "@/stores/app-store";
import { signOut } from "next-auth/react";
import {
  Palette,
  Globe,
  Bell,
  Mail,
  DollarSign,
  Shield,
  LogOut,
  Save,
  Moon,
  Sun,
  Check,
  Key,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Loader2,
  Send,
  ArrowUpDown,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  FileText,
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

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Email notifications
  const [emailSettings, setEmailSettings] = useState({
    email: "",
    enabled: false,
    onTransaction: true,
    onTransfer: true,
    onBudgetAlert: true,
    onMonthlyReport: false,
    onLargeTransaction: true,
  });
  const [emailSettingsLoading, setEmailSettingsLoading] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    fetch("/api/notifications/email")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setEmailSettings({
            email: d.data.email || "",
            enabled: d.data.enabled || false,
            onTransaction: d.data.onTransaction ?? true,
            onTransfer: d.data.onTransfer ?? true,
            onBudgetAlert: d.data.onBudgetAlert ?? true,
            onMonthlyReport: d.data.onMonthlyReport ?? false,
            onLargeTransaction: d.data.onLargeTransaction ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setEmailSettingsLoading(false));
  }, []);

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      const res = await fetch("/api/notifications/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings),
      });
      const data = await res.json();
      if (!data.success) {
        setEmailError(data.error || "Kaydedilemedi.");
        return;
      }
      setEmailSuccess("E-posta bildirim ayarları kaydedildi.");
      setTimeout(() => setEmailSuccess(""), 3000);
    } catch {
      setEmailError("Bir hata oluştu.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestSending(true);
    setTestResult("");
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      setTestResult(data.success ? "✅ Test e-postası gönderildi." : "❌ " + (data.error || "Gönderilemedi."));
    } catch {
      setTestResult("❌ Bir hata oluştu.");
    } finally {
      setTestSending(false);
      setTimeout(() => setTestResult(""), 5000);
    }
  };

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

  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordFieldErrors({});

    if (!currentPassword) {
      setPasswordFieldErrors({ currentPassword: "Mevcut şifrenizi girin" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFieldErrors({ newPassword: "Yeni şifre en az 6 karakter olmalıdır" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({ confirmPassword: "Yeni şifreler eşleşmiyor" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setPasswordError(data.error || "Şifre değiştirilemedi.");
        return;
      }

      setPasswordSuccess("Şifreniz başarıyla değiştirildi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
    } catch {
      setPasswordError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsChangingPassword(false);
    }
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
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
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
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
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
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
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

        {/* Email Notifications */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
            <CardTitle>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-posta Bildirimleri
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSettingsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-text-muted">
                  Önemli işlemler hakkında e-posta bildirimi almak için ayarlayın.
                  {!process.env.NEXT_PUBLIC_RESEND_KEY && (
                    <span className="block text-loss mt-1">
                      ⚠️ RESEND_API_KEY tanımlı değil — e-postalar gönderilemez.
                    </span>
                  )}
                </p>

                {emailSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit">
                    <Check className="w-4 h-4" /> {emailSuccess}
                  </div>
                )}
                {emailError && (
                  <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                    <AlertCircle className="w-4 h-4" /> {emailError}
                  </div>
                )}

                <Input
                  label="E-posta Adresi"
                  type="email"
                  placeholder="ornek@email.com"
                  value={emailSettings.email}
                  onChange={(e) => setEmailSettings({ ...emailSettings, email: e.target.value })}
                />

                {/* Master toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">E-posta Bildirimleri</p>
                    <p className="text-xs text-text-muted">Tüm e-posta bildirimlerini aç/kapa</p>
                  </div>
                  <button
                    onClick={() => setEmailSettings({ ...emailSettings, enabled: !emailSettings.enabled })}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{
                      backgroundColor: emailSettings.enabled ? "var(--color-secondary)" : "var(--color-border)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      style={{
                        transform: emailSettings.enabled ? "translateX(20px)" : "translateX(0)",
                      }}
                    />
                  </button>
                </div>

                {emailSettings.enabled && (
                  <>
                    <hr className="border-border" />

                    {/* Event toggles */}
                    <div className="space-y-3">
                      {[
                        { key: "onTransaction" as const, label: "İşlem Bildirimleri", desc: "Yeni gelir/gider eklendiğinde", icon: ArrowUpDown },
                        { key: "onTransfer" as const, label: "Transfer Bildirimleri", desc: "Para transferi gerçekleştiğinde", icon: ArrowRightLeft },
                        { key: "onBudgetAlert" as const, label: "Bütçe Uyarıları", desc: "Bütçe limitine yaklaşıldığında", icon: Wallet },
                        { key: "onLargeTransaction" as const, label: "Büyük İşlemler", desc: "10.000+ üzeri işlemlerde", icon: BarChart3 },
                        { key: "onMonthlyReport" as const, label: "Aylık Rapor", desc: "Her ay sonu özet rapor", icon: FileText },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-text-muted" />
                              <div>
                                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                                <p className="text-xs text-text-muted">{item.desc}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setEmailSettings({ ...emailSettings, [item.key]: !emailSettings[item.key] })}
                              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                              style={{
                                backgroundColor: emailSettings[item.key] ? "var(--color-secondary)" : "var(--color-border)",
                              }}
                            >
                              <div
                                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                                style={{
                                  transform: emailSettings[item.key] ? "translateX(20px)" : "translateX(0)",
                                }}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <hr className="border-border" />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1" isLoading={emailSaving} onClick={handleSaveEmail}>
                        <Save className="w-4 h-4" />
                        Kaydet
                      </Button>
                      <Button variant="outline" isLoading={testSending} onClick={handleTestEmail}>
                        <Send className="w-4 h-4" />
                        Test
                      </Button>
                    </div>
                    {testResult && (
                      <p className="text-xs text-text-muted">{testResult}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
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
                <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                  <Key className="w-4 h-4" />
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border max-w-md w-full mx-4 animate-[slide-up_0.2s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Key className="w-4 h-4" />
                Şifre Değiştir
              </h3>
              <button
                onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(""); }}
                className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {passwordSuccess ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit">
                  <Check className="w-4 h-4" />
                  {passwordSuccess}
                </div>
              ) : (
                <>
                  <Input
                    label="Mevcut Şifre"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPasswordFieldErrors({}); }}
                    placeholder="••••••••"
                    error={passwordFieldErrors.currentPassword}
                  />

                  <Input
                    label="Yeni Şifre"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordFieldErrors({}); }}
                    placeholder="En az 6 karakter"
                    error={passwordFieldErrors.newPassword}
                  />

                  <Input
                    label="Yeni Şifre (Tekrar)"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordFieldErrors({}); }}
                    placeholder="Şifrenizi tekrar girin"
                    error={passwordFieldErrors.confirmPassword}
                  />

                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPasswords ? "Gizle" : "Göster"}
                  </button>

                  {passwordError && (
                    <div className="shake-alert flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {passwordError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setShowPasswordModal(false); setPasswordError(""); }}
                      disabled={isChangingPassword}
                    >
                      İptal
                    </Button>
                    <Button
                      className="flex-1"
                      isLoading={isChangingPassword}
                      onClick={handlePasswordChange}
                    >
                      {isChangingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}
