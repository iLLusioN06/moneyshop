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
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Wallet,
  BarChart3,
  FileText,
  Smartphone,
  KeyRound,
  Copy,
  Download,
  ShieldOff,
  ShieldCheck,
  QrCode,
  CheckCheck,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
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

  // ─── 2FA State ─────────────────────────────────────
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    method: string | null;
    isSetupComplete: boolean;
  } | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorMode, setTwoFactorMode] = useState<"idle" | "setup" | "verify">("idle");
  const [twoFactorMethod, setTwoFactorMethod] = useState<"AUTHENTICATOR" | "SMS">("AUTHENTICATOR");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorOtpauth, setTwoFactorOtpauth] = useState("");
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState("");
  const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState<string[]>([]);
  const [twoFactorSetupMessage, setTwoFactorSetupMessage] = useState("");
  const [twoFactorSetupError, setTwoFactorSetupError] = useState("");
  const [twoFactorEnableLoading, setTwoFactorEnableLoading] = useState(false);
  const [twoFactorDisableLoading, setTwoFactorDisableLoading] = useState(false);
  const [twoFactorShowBackupCodes, setTwoFactorShowBackupCodes] = useState(false);
  const [twoFactorCopied, setTwoFactorCopied] = useState(false);
  const [twoFactorSmsPhone, setTwoFactorSmsPhone] = useState("");
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState("");

  // QR kod oluştur (Authenticator kurulumu için)
  useEffect(() => {
    if (twoFactorOtpauth) {
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(twoFactorOtpauth, {
          width: 200,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        }).then((url: string) => setTwoFactorQrDataUrl(url));
      });
    } else {
      setTwoFactorQrDataUrl("");
    }
  }, [twoFactorOtpauth]);

  // 2FA durumunu yükle
  useEffect(() => {
    fetch("/api/auth/2fa/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setTwoFactorStatus(d.data);
        }
      })
      .catch(() => {})
      .finally(() => setTwoFactorLoading(false));
  }, []);

  // 2FA kurulum başlat
  const handleTwoFactorSetup = async () => {
    setTwoFactorSetupMessage("");
    setTwoFactorSetupError("");
    setTwoFactorMode("setup");

    if (twoFactorMethod === "AUTHENTICATOR") {
      try {
        const res = await fetch("/api/auth/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "AUTHENTICATOR" }),
        });
        const data = await res.json();

        if (!data.success) {
          setTwoFactorSetupError(data.error || "Kurulum başlatılamadı.");
          setTwoFactorMode("idle");
          return;
        }

        setTwoFactorSecret(data.secret);
        setTwoFactorOtpauth(data.otpauth);
        setTwoFactorBackupCodes(data.backupCodes || []);
      } catch {
        setTwoFactorSetupError("Bir hata oluştu.");
        setTwoFactorMode("idle");
      }
    } else {
      // SMS kurulumu
      try {
        const res = await fetch("/api/auth/2fa/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "SMS" }),
        });
        const data = await res.json();

        if (!data.success) {
          setTwoFactorSetupError(data.error || "Kurulum başlatılamadı.");
          setTwoFactorMode("idle");
          return;
        }

        setTwoFactorSmsPhone(data.phone || "");
      } catch {
        setTwoFactorSetupError("Bir hata oluştu.");
        setTwoFactorMode("idle");
      }
    }
  };

  // SMS kodu gönder
  const handleSendSmsCode = async () => {
    setTwoFactorSetupMessage("");
    setTwoFactorSetupError("");
    try {
      const res = await fetch("/api/auth/2fa/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) {
        setTwoFactorSetupError(data.error || "Kod gönderilemedi.");
      } else {
        setTwoFactorSetupMessage("SMS kodu gönderildi.");
      }
    } catch {
      setTwoFactorSetupError("Kod gönderilirken hata oluştu.");
    }
  };

  // Setup kodunu doğrula
  const handleVerifySetupCode = async () => {
    setTwoFactorSetupError("");
    setTwoFactorSetupMessage("");

    if (!twoFactorSetupCode) {
      setTwoFactorSetupError("Lütfen doğrulama kodunu girin.");
      return;
    }

    setTwoFactorEnableLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: twoFactorMethod,
          secret: twoFactorMethod === "AUTHENTICATOR" ? twoFactorSecret : undefined,
          code: twoFactorSetupCode,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setTwoFactorSetupError(data.error || "Doğrulama başarısız.");
        setTwoFactorEnableLoading(false);
        return;
      }

      // Doğrulama başarılı → 2FA'yı aktif et
      const toggleRes = await fetch("/api/auth/2fa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          method: twoFactorMethod,
        }),
      });

      const toggleData = await toggleRes.json();

      if (!toggleData.success) {
        setTwoFactorSetupError(toggleData.error || "2FA aktif edilemedi.");
        setTwoFactorEnableLoading(false);
        return;
      }

      // Yedek kodlar varsa göster
      if (toggleData.backupCodes) {
        setTwoFactorBackupCodes(toggleData.backupCodes);
        setTwoFactorShowBackupCodes(true);
      }

      setTwoFactorStatus({
        enabled: true,
        method: twoFactorMethod,
        isSetupComplete: true,
      });
      setTwoFactorMode("idle");
      setTwoFactorSetupCode("");
      setTwoFactorSetupMessage("İki faktörlü doğrulama başarıyla aktif edildi.");
      setTwoFactorEnableLoading(false);
    } catch {
      setTwoFactorSetupError("Bir hata oluştu.");
      setTwoFactorEnableLoading(false);
    }
  };

  // 2FA'yı devre dışı bırak
  const handleTwoFactorDisable = async () => {
    if (!confirm("İki faktörlü doğrulamayı devre dışı bırakmak istediğinize emin misiniz?")) return;

    setTwoFactorDisableLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });

      const data = await res.json();

      if (!data.success) {
        setTwoFactorSetupError(data.error || "Devre dışı bırakılamadı.");
        setTwoFactorDisableLoading(false);
        return;
      }

      setTwoFactorStatus({
        enabled: false,
        method: null,
        isSetupComplete: false,
      });
      setTwoFactorMode("idle");
      setTwoFactorSecret("");
      setTwoFactorOtpauth("");
      setTwoFactorBackupCodes([]);
      setTwoFactorShowBackupCodes(false);
      setTwoFactorSetupMessage("İki faktörlü doğrulama devre dışı bırakıldı.");
      setTwoFactorDisableLoading(false);
    } catch {
      setTwoFactorSetupError("Bir hata oluştu.");
      setTwoFactorDisableLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(twoFactorBackupCodes.join("\n"));
    setTwoFactorCopied(true);
    setTimeout(() => setTwoFactorCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const text = `MoneyShop Yedek Kodları\n${new Date().toLocaleDateString("tr-TR")}\n\n${twoFactorBackupCodes.join("\n")}\n\nBu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moneyshop-yedek-kodlar.txt";
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="border border-border hover:text-profit hover:bg-profit/10 hover:border-profit/30">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
        <h2 className="text-2xl font-bold text-text-primary">Ayarlar</h2>
        <p className="text-sm text-text-muted mt-1">
          Uygulama tercihlerinizi yönetin
        </p>
      </div>
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

              {/* ─── İki Faktörlü Doğrulama ─── */}
              <div>
                <p className="text-sm font-medium text-text-primary mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  İki Faktörlü Doğrulama (2FA)
                </p>
                <p className="text-xs text-text-muted mb-3">
                  Google Authenticator veya SMS ile hesap güvenliğinizi artırın.
                </p>

                {twoFactorLoading ? (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </div>
                ) : (
                  <>
                    {/* Setup mesajları */}
                    {twoFactorSetupMessage && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit mb-3">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        {twoFactorSetupMessage}
                      </div>
                    )}
                    {twoFactorSetupError && (
                      <div className="shake-alert flex items-center gap-2 p-2.5 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss mb-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {twoFactorSetupError}
                      </div>
                    )}

                    {/* 2FA Durumu */}
                    {twoFactorStatus?.enabled ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-profit" />
                            <span className="text-sm font-medium text-profit">
                              Aktif
                            </span>
                            <span className="text-xs text-text-muted">
                              ({twoFactorStatus.method === "AUTHENTICATOR" ? "Google Authenticator" : "SMS"})
                            </span>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={twoFactorDisableLoading}
                            onClick={handleTwoFactorDisable}
                          >
                            <ShieldOff className="w-3.5 h-3.5" />
                            Devre Dışı Bırak
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* 2FA Kapalı → Kurulum Başlat */}
                        {twoFactorMode === "idle" && (
                          <div className="space-y-3">
                            {/* Yöntem seçimi */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => setTwoFactorMethod("AUTHENTICATOR")}
                                className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
                                style={{
                                  borderColor: twoFactorMethod === "AUTHENTICATOR" ? "var(--color-secondary)" : "var(--color-border)",
                                  backgroundColor: twoFactorMethod === "AUTHENTICATOR" ? "var(--color-secondary-10)" : "var(--color-surface)",
                                }}
                              >
                                <KeyRound className="w-5 h-5 text-secondary" />
                                <span className="text-xs font-medium text-text-primary">Google Authenticator</span>
                              </button>
                              <button
                                onClick={() => setTwoFactorMethod("SMS")}
                                className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all"
                                style={{
                                  borderColor: twoFactorMethod === "SMS" ? "var(--color-secondary)" : "var(--color-border)",
                                  backgroundColor: twoFactorMethod === "SMS" ? "var(--color-secondary-10)" : "var(--color-surface)",
                                }}
                              >
                                <Smartphone className="w-5 h-5 text-secondary" />
                                <span className="text-xs font-medium text-text-primary">SMS</span>
                              </button>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={handleTwoFactorSetup}
                            >
                              <Shield className="w-4 h-4" />
                              Kurulumu Başlat
                            </Button>
                          </div>
                        )}

                        {/* Authenticator Kurulum */}
                        {twoFactorMode === "setup" && twoFactorMethod === "AUTHENTICATOR" && twoFactorOtpauth && (
                          <div className="space-y-3">
                            <p className="text-xs text-text-muted">
                              Google Authenticator uygulamasını açın, <strong>+</strong> ikonuna tıklayın ve
                              aşağıdaki kodu tarayın veya secret anahtarı manuel girin.
                            </p>

                            {/* QR Kod */}
                            <div className="flex justify-center">
                              <div className="bg-white p-3 rounded-lg">
                                {twoFactorQrDataUrl ? (
                                  <img
                                    src={twoFactorQrDataUrl}
                                    alt="Google Authenticator QR Kodu"
                                    className="w-40 h-40"
                                  />
                                ) : (
                                  <div className="w-40 h-40 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Secret Anahtar */}
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-secondary border border-border">
                              <code className="flex-1 text-xs font-mono break-all text-text-primary">
                                {twoFactorSecret}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(twoFactorSecret);
                                }}
                                className="flex-shrink-0 p-1.5 rounded-md hover:bg-surface-tertiary transition-colors"
                                title="Kopyala"
                              >
                                <Copy className="w-3.5 h-3.5 text-text-muted" />
                              </button>
                            </div>

                            <hr className="border-border" />

                            {/* Doğrulama Kodu */}
                            <p className="text-xs text-text-muted">
                              Google Authenticator'daki 6 haneli kodu girin:
                            </p>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={twoFactorSetupCode}
                              onChange={(e) => setTwoFactorSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="000000"
                              className="w-full h-10 text-center text-lg font-bold tracking-widest rounded-lg border border-border bg-surface text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                            />

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                size="sm"
                                onClick={() => { setTwoFactorMode("idle"); setTwoFactorSetupCode(""); setTwoFactorSetupError(""); }}
                                disabled={twoFactorEnableLoading}
                              >
                                İptal
                              </Button>
                              <Button
                                className="flex-1"
                                size="sm"
                                isLoading={twoFactorEnableLoading}
                                onClick={handleVerifySetupCode}
                              >
                                Doğrula ve Aktif Et
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* SMS Kurulum */}
                        {twoFactorMode === "setup" && twoFactorMethod === "SMS" && (
                          <div className="space-y-3">
                            <p className="text-xs text-text-muted">
                              Telefon numaranıza SMS ile 6 haneli bir doğrulama kodu gönderilecek.
                              {twoFactorSmsPhone && (
                                <span className="block mt-1 text-text-primary font-medium">
                                  {twoFactorSmsPhone.replace(/.(?=.{4})/g, "*")}
                                </span>
                              )}
                            </p>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSendSmsCode}
                              disabled={twoFactorEnableLoading}
                            >
                              <Send className="w-3.5 h-3.5" />
                              SMS Kodu Gönder
                            </Button>

                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              value={twoFactorSetupCode}
                              onChange={(e) => setTwoFactorSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="000000"
                              className="w-full h-10 text-center text-lg font-bold tracking-widest rounded-lg border border-border bg-surface text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                            />

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                size="sm"
                                onClick={() => { setTwoFactorMode("idle"); setTwoFactorSetupCode(""); setTwoFactorSetupError(""); }}
                                disabled={twoFactorEnableLoading}
                              >
                                İptal
                              </Button>
                              <Button
                                className="flex-1"
                                size="sm"
                                isLoading={twoFactorEnableLoading}
                                onClick={handleVerifySetupCode}
                              >
                                Doğrula ve Aktif Et
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Yedek Kodlar */}
                        {twoFactorShowBackupCodes && twoFactorBackupCodes.length > 0 && (
                          <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                              ⚠️ Yedek Kurtarma Kodlarınız
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-500 mb-2">
                              Bu kodları güvenli bir yerde saklayın. Google Authenticator uygulamanıza
                              erişemezseniz bu kodlarla giriş yapabilirsiniz. Her kod yalnızca bir kez kullanılabilir.
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 mb-3">
                              {twoFactorBackupCodes.map((code, i) => (
                                <code key={i} className="text-xs font-mono bg-white dark:bg-surface-secondary px-2 py-1 rounded border border-amber-200 dark:border-amber-800 text-text-primary">
                                  {code}
                                </code>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCopyBackupCodes}
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
                              >
                                {twoFactorCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {twoFactorCopied ? "Kopyalandı" : "Kopyala"}
                              </button>
                              <button
                                onClick={handleDownloadBackupCodes}
                                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                İndir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
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
