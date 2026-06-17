"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Key,
  Eye,
  EyeOff,
  Building2,
  ArrowUpDown,
  PiggyBank,
  CheckCircle2,
  XCircle,
  Camera,
  Lock,
  AlertCircle,
  RefreshCw,
  Fingerprint,
  Smartphone,
  ChevronDown,
  ChevronUp,
  IdCard,
  Activity,
  Target,
  TrendingUp,
  ScanLine,
  Upload,
  Loader2,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";
import { performOCR, validateFileSize, validateFileType, fileToBase64, type OCRResult } from "@/lib/ocr-service";
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  createRegistrationOptions,
  startRegistration,
  completeRegistration,
} from "@/lib/webauthn";

// --- Types ---
interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  dateOfBirth: string | null;
  tcKimlik: string | null;
  address: string | null;
  identityNumber: string | null;
  _count: {
    accounts: number;
    transactions: number;
    budgets: number;
  };
}

// --- Tab Configuration ---
type TabId = "info" | "security" | "activity";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: TabConfig[] = [
  { id: "info", label: "Kişisel Bilgiler", icon: User, description: "Ad, e-posta ve profil fotoğrafı" },
  { id: "security", label: "Güvenlik", icon: Shield, description: "Parola ve hesap güvenliği" },
  { id: "activity", label: "Aktivite", icon: Activity, description: "Hesap geçmişi ve durumu" },
];

// --- Role Badge Config ---
const ROLE_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning"; color: string }> = {
  ADMIN: { label: "Yönetici", variant: "success", color: "from-emerald-500 to-teal-600" },
  MODERATOR: { label: "Moderatör", variant: "info", color: "from-blue-500 to-indigo-600" },
  USER: { label: "Kullanıcı", variant: "warning", color: "from-secondary to-secondary-dark" },
};

// ============================================================================
// PROFILE HEADER — gradient banner + avatar + quick info
// ============================================================================
function ProfileHeader({
  profile,
  activeTab,
  onTabChange,
}: {
  profile: ProfileData | null;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  const { data: session } = useSession();
  const displayName = profile?.name || session?.user?.name || "Kullanıcı";
  const displayEmail = profile?.email || session?.user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();
  const role = profile?.role || session?.user?.role || "USER";
  const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.USER;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 shadow-xl">
      {/* Decorative Elements — pointer-events-none lets clicks pass through to tabs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-secondary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative p-6 md:p-8">
        {/* Top Row — Avatar + Name + Role */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with camera overlay */}
          <div className="relative group flex-shrink-0">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${roleCfg.color} flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-secondary/20 ring-4 ring-white/20`}>
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-800 dark:border-slate-600 hover:scale-110 transition-transform text-slate-600 dark:text-slate-300"
              title="Fotoğraf değiştir"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name + Email + Role */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {displayName}
            </h1>
            <p className="text-sm text-white/60 mt-1 truncate">{displayEmail}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <Badge variant={roleCfg.variant} size="md" className="bg-white/10 text-white border border-white/10 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 mr-1" />
                {roleCfg.label}
              </Badge>
              {profile?.isActive !== false ? (
                <Badge variant="success" size="sm" className="bg-white/10 text-emerald-300 border border-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              ) : (
                <Badge variant="danger" size="sm">
                  <XCircle className="w-3 h-3 mr-1" />
                  Pasif
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats — visible on medium+ screens */}
          {profile && (
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              {[
                { icon: Building2, value: profile._count.accounts, label: "Hesap" },
                { icon: ArrowUpDown, value: profile._count.transactions, label: "İşlem" },
                { icon: PiggyBank, value: profile._count.budgets, label: "Bütçe" },
              ].map((stat, i) => (
                <div key={i} className="text-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <stat.icon className="w-4 h-4 text-white/50 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Since */}
        {profile && (
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-4 text-xs text-white/40">
            <Calendar className="w-3.5 h-3.5" />
            <span>Üyelik: {formatDate(new Date(profile.createdAt), "long")}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-white/10 px-6 md:px-8">
        <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (e.key === "ArrowRight") {
                    const next = TABS[(idx + 1) % TABS.length];
                    onTabChange(next.id);
                  } else if (e.key === "ArrowLeft") {
                    const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                    onTabChange(prev.id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  isActive
                    ? "text-white border-white bg-white/5"
                    : "text-white/50 border-transparent hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PERSONAL INFO TAB
// ============================================================================
function PersonalInfoTab({
  profile,
  onProfileUpdate,
}: {
  profile: ProfileData | null;
  onProfileUpdate: (data: ProfileData) => void;
}) {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState(profile?.name || session?.user?.name || "");
  const [image, setImage] = useState(profile?.image || session?.user?.image || "");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      if (profile?.name) setName(profile.name);
      if (profile?.image !== undefined) setImage(profile.image || "");
    }, 0);
  }, [profile?.name, profile?.image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Güncelleme başarısız.");
        setIsSaving(false);
        return;
      }

      await updateSession();

      if (data.data) {
        onProfileUpdate(data.data as unknown as ProfileData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const infoCards = [
    {
      icon: User,
      label: "Ad Soyad",
      value: profile?.name || session?.user?.name || "-",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Mail,
      label: "E-posta Adresi",
      value: profile?.email || session?.user?.email || "-",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      label: "Kayıt Tarihi",
      value: profile ? formatDate(new Date(profile.createdAt), "long") : "-",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Shield,
      label: "Hesap Rolü",
      value: roleLabel(profile?.role || "USER"),
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {infoCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="relative group rounded-xl bg-surface border border-border p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-text-muted font-medium">{card.label}</p>
                  <p className="text-sm font-semibold text-text-primary truncate">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Form */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <User className="w-5 h-5 text-secondary" />
            Profil Düzenle
          </CardTitle>
          <CardDescription>Adınızı ve profil fotoğrafınızı güncelleyin</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
            {success && (
              <div className="p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Profil başarıyla güncellendi.
              </div>
            )}

            {error && (
              <div className="shake-alert p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label="Ad Soyad"
                  value={name}
                  icon={<User className="w-4 h-4" />}
                  disabled
                />
                <p className="text-xs text-text-muted">Ad değiştirmek için yöneticinize başvurun.</p>
              </div>

              <div className="space-y-1">
                <Input
                  label="E-posta"
                  type="email"
                  value={profile?.email || session?.user?.email || ""}
                  icon={<Mail className="w-4 h-4" />}
                  disabled
                />
                <p className="text-xs text-text-muted">E-posta adresi değiştirilemez.</p>
              </div>
            </div>

            <Input
              label="Profil Fotoğrafı (URL)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              icon={<Camera className="w-4 h-4" />}
              placeholder="https://example.com/avatar.jpg"
            />

            {/* Image Preview */}
            {image && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-tertiary/50 border border-border">
                <ImagePreview url={image} />
                <div>
                  <p className="text-xs font-medium text-text-primary">Fotoğraf Önizleme</p>
                  <p className="text-xs text-text-muted">Kaydettiğinizde profil fotoğrafınız güncellenecek</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4" />
                Kaydet
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setName(profile?.name || session?.user?.name || "");
                  setImage(profile?.image || session?.user?.image || "");
                  setError("");
                }}
              >
                Sıfırla
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SECURITY TAB
// ============================================================================
function SecurityTab({ profile }: { profile: ProfileData | null }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Biometric auth state
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<string | null>(null);

  const checkBiometricSupport = useCallback(async () => {
    const supported = isWebAuthnSupported();
    setBiometricSupported(supported);

    if (supported) {
      const platformAvailable = await isPlatformAuthenticatorAvailable();
      setBiometricSupported(platformAvailable);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => checkBiometricSupport(), 0);
  }, [checkBiometricSupport]);

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      // Devre dışı bırak
      setBiometricEnabled(false);
      setBiometricStatus("Biyometrik kimlik devre dışı bırakıldı.");
      setTimeout(() => setBiometricStatus(null), 3000);
      return;
    }

    // Etkinleştir - WebAuthn registration başlat
    setBiometricLoading(true);
    setBiometricStatus(null);

    try {
      const options = await createRegistrationOptions(
        profile?.id || "",
        profile?.email || "",
        profile?.name || profile?.email || "User"
      );

      const credential = await startRegistration(options);

      if (credential) {
        const success = await completeRegistration(credential, options.challenge);
        if (success) {
          setBiometricEnabled(true);
          setBiometricStatus("Biyometrik kimlik başarıyla etkinleştirildi!");
        } else {
          setBiometricStatus("Kayıt başarısız oldu.");
        }
      } else {
        setBiometricStatus("İşlem iptal edildi veya başarısız oldu.");
      }
    } catch (err) {
      setBiometricStatus("Hata: " + (err instanceof Error ? err.message : "Bilinmeyen hata"));
    } finally {
      setBiometricLoading(false);
      setTimeout(() => setBiometricStatus(null), 5000);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Yeni parolalar eşleşmiyor" });
      return;
    }

    if (form.newPassword.length < 6) {
      setFieldErrors({ newPassword: "Yeni parola en az 6 karakter olmalıdır" });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Parola güncellenemedi.");
        setIsSaving(false);
        return;
      }

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Security score calculation
  const securityItems = [
    { label: "E-posta Doğrulama", ok: !!profile?.emailVerified },
    { label: "Parola Koruması", ok: true },
    { label: "Hesap Aktif", ok: profile?.isActive !== false },
    { label: "Biyometrik Kimlik", ok: biometricEnabled },
  ];
  const securityScore = securityItems.filter((i) => i.ok).length;
  const securityPercent = Math.round((securityScore / securityItems.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-[fade-in_0.3s_ease-out]">
      {/* Left — Security Status */}
      <div className="lg:col-span-2 space-y-4">
        {/* Security Score Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - securityPercent / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-text-primary">Güvenlik Skoru</h3>
              <p className="text-3xl font-bold text-secondary mt-1">{securityPercent}%</p>
            </div>

            <div className="space-y-3 mt-6 pt-6 border-t border-border">
              {securityItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{item.label}</span>
                  {item.ok ? (
                    <span className="flex items-center gap-1 text-profit font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tamam
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-pending font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Eksik
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Password Tips */}
        <Card>
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-secondary" />
              Parola İpuçları
            </h4>
            <ul className="space-y-2">
              {[
                "En az 8 karakter kullanın",
                "Büyük/küçük harf ve rakam ekleyin",
                "Özel karakterler kullanın (!@#$%)",
                "Aynı parolayı farklı sitelerde kullanmayın",
                "Parolanızı düzenli aralıklarla değiştirin",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3 h-3 text-secondary mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Biometric Auth */}
        <Card>
          <CardContent className="p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-secondary" />
              Biyometrik Kimlik Doğrulama
            </h4>

            {!biometricSupported ? (
              <div className="p-3 rounded-lg bg-surface-secondary border border-border">
                <p className="text-xs text-text-muted">
                  Cihazınız biyometrik kimlik doğrulamayı desteklemiyor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Parmak izi veya Face ID ile hızlı ve güvenli giriş yapın.
                </p>

                <button
                  onClick={handleBiometricToggle}
                  disabled={biometricLoading}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    biometricEnabled
                      ? "bg-profit/5 border-profit/20 hover:bg-profit/10"
                      : "bg-surface-secondary border-border hover:bg-surface-tertiary"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      biometricEnabled ? "bg-profit/10" : "bg-surface-tertiary"
                    }`}>
                      <Fingerprint className={`w-4 h-4 ${biometricEnabled ? "text-profit" : "text-text-muted"}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary">
                        {biometricEnabled ? "Etkin" : "Devre Dışı"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {biometricEnabled ? "Biyometrik kimlik aktif" : "Tıklayarak etkinleştirin"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    biometricEnabled ? "bg-profit" : "bg-border"
                  }`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                      biometricEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`} />
                  </div>
                </button>

                {biometricStatus && (
                  <p className={`text-xs ${
                    biometricStatus.includes("başarıyla") ? "text-profit" : 
                    biometricStatus.includes("Hata") || biometricStatus.includes("başarısız") ? "text-loss" : "text-text-muted"
                  }`}>
                    {biometricStatus}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right — Password Change Form */}
      <div className="lg:col-span-3">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Lock className="w-5 h-5 text-secondary" />
              Parola Değiştir
            </CardTitle>
            <CardDescription>Parolanızı düzenli aralıklarla değiştirmeniz önerilir</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
              {success && (
                <div className="p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Parolanız başarıyla güncellendi.
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Input
                label="Mevcut Parola"
                type={showPasswords ? "text" : "password"}
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                icon={<Key className="w-4 h-4" />}
                placeholder="Mevcut parolanızı girin"
                required
                error={fieldErrors.currentPassword}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Yeni Parola"
                  type={showPasswords ? "text" : "password"}
                  value={form.newPassword}
                  onChange={handleChange("newPassword")}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="En az 6 karakter"
                  required
                  minLength={6}
                  error={fieldErrors.newPassword}
                />

                <Input
                  label="Yeni Parola (Tekrar)"
                  type={showPasswords ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Tekrar girin"
                  required
                  minLength={6}
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {/* Password Strength indicator */}
              {form.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = Math.min(
                        (form.newPassword.length > 6 ? 1 : 0) +
                        (/[A-Z]/.test(form.newPassword) ? 1 : 0) +
                        (/[0-9]/.test(form.newPassword) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(form.newPassword) ? 1 : 0),
                        4
                      );
                      return (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            level <= strength
                              ? strength <= 2
                                ? "bg-loss"
                                : strength === 3
                                ? "bg-pending"
                                : "bg-profit"
                              : "bg-surface-tertiary"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-muted">
                    {form.newPassword.length < 6
                      ? "Çok zayıf — en az 6 karakter gerekli"
                      : form.newPassword.length < 8
                      ? "Zayıf — daha güçlü bir parola deneyin"
                      : /[A-Z]/.test(form.newPassword) && /[0-9]/.test(form.newPassword) && /[^A-Za-z0-9]/.test(form.newPassword)
                      ? "Güçlü parola ✓"
                      : "Orta — büyük harf, rakam ve özel karakter ekleyin"}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded border-border text-secondary focus:ring-secondary/30"
                  />
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Parolaları göster
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSaving} variant="outline">
                  <Key className="w-4 h-4" />
                  Parolayı Güncelle
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY TAB
// ============================================================================
function ActivityTab({ profile }: { profile: ProfileData | null }) {
  if (!profile) return null;

  const activities = [
    {
      icon: Calendar,
      label: "Hesap Oluşturma",
      date: profile.createdAt,
      color: "from-secondary to-secondary-dark",
    },
    {
      icon: RefreshCw,
      label: "Son Güncelleme",
      date: profile.updatedAt,
      color: "from-accent to-accent-dark",
    },
    {
      icon: Mail,
      label: "E-posta Doğrulama",
      date: profile.emailVerified,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Activity Timeline */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Activity className="w-5 h-5 text-secondary" />
            Hesap Zaman Çizelgesi
          </CardTitle>
          <CardDescription>Hesabınızdaki önemli olayların kronolojik sıralaması</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-secondary via-accent to-surface-tertiary rounded-full" />

            <div className="space-y-6">
              {activities.map((item, i) => {
                const Icon = item.icon;
                const date = item.date ? new Date(item.date) : null;
                return (
                  <div key={i} className="relative flex gap-4 pl-0">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                      {date ? (
                        <>
                          <p className="text-sm text-text-secondary mt-0.5">{formatDate(date, "long")}</p>
                          <p className="text-xs text-text-muted mt-0.5">{formatDate(date, "relative")}</p>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-pending" />
                          <span className="text-sm text-pending">Henüz gerçekleşmedi</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-profit/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-profit" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">E-posta Durumu</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Doğrulama</span>
              {profile.emailVerified ? (
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Doğrulanmış
                </Badge>
              ) : (
                <Badge variant="warning">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Doğrulanmamış
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-profit/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-profit" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Hesap Durumu</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Durum</span>
              {profile.isActive ? (
                <Badge variant="success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              ) : (
                <Badge variant="danger">
                  <XCircle className="w-3 h-3 mr-1" />
                  Pasif
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            Hesap Özeti
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Building2, value: profile._count.accounts, label: "Hesaplar", color: "from-secondary to-secondary-dark" },
              { icon: ArrowUpDown, value: profile._count.transactions, label: "İşlemler", color: "from-accent to-accent-dark" },
              { icon: PiggyBank, value: profile._count.budgets, label: "Bütçeler", color: "from-amber-500 to-amber-600" },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <div key={i} className="text-center p-4 rounded-xl bg-surface-tertiary/50 border border-border hover:bg-surface-tertiary/80 transition-colors">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                    <StatIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN PROFILE CONTENT
// ============================================================================
function ProfileContent() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("info");

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Profil yüklenemedi.");
        setIsLoading(false);
        return;
      }

      setProfile(data.data);
    } catch {
      setError("Profil bilgileri alınamadı.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    setTimeout(() => fetchProfile(), 0);
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-surface-tertiary" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary animate-spin" />
          </div>
          <p className="text-sm text-text-muted animate-pulse">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-loss/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-loss" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Bir hata oluştu</h3>
        <p className="text-sm text-text-muted mb-8 max-w-sm">{error}</p>
        <Button onClick={fetchProfile}>
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil</h1>
        <p className="text-sm text-text-muted mt-1">
          Hesap bilgilerinizi görüntüleyin, düzenleyin ve güvenlik ayarlarınızı yönetin
        </p>
      </div>

      {/* Profile Header with Tabs */}
      <ProfileHeader
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* KYC Doğrulama Formu */}
      {!profile?.emailVerified && (
        <VerificationBanner
          profile={profile}
          onVerified={(data) => setProfile(data)}
        />
      )}

      {/* Tab Content */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={activeTab}>
        {activeTab === "info" && (
          <PersonalInfoTab profile={profile} onProfileUpdate={(data) => setProfile(data)} />
        )}
        {activeTab === "security" && <SecurityTab profile={profile} />}
        {activeTab === "activity" && <ActivityTab profile={profile} />}
      </div>
    </div>
  );
}

// ============================================================================
// KYC DOĞRULAMA FORMU
// ============================================================================
function VerificationBanner({
  profile,
  onVerified,
}: {
  profile: ProfileData | null;
  onVerified: (data: ProfileData) => void;
}) {
  const { data: session, update: updateSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    dateOfBirth: "",
    tcKimlik: "",
    address: "",
    identityNumber: "",
  });

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setFieldErrors({});
      setError("");
    };

  // OCR ile kimlik bilgilerini oku
  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya doğrulama
    if (!validateFileType(file)) {
      setError("Geçersiz dosya türü. JPG, PNG veya WebP yükleyin.");
      return;
    }

    if (!validateFileSize(file, 5)) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setOcrLoading(true);
    setOcrProgress(0);
    setError("");
    setOcrResult(null);

    // Önizleme oluştur
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const result = await performOCR(file, (progress) => {
        setOcrProgress(progress);
      });

      setOcrResult(result);

      if (result.success && result.data) {
        // Okunan bilgileri forma doldur
        setForm((prev) => ({
          ...prev,
          tcKimlik: result.data.tcKimlik || prev.tcKimlik,
          dateOfBirth: result.data.dateOfBirth || prev.dateOfBirth,
          identityNumber: result.data.documentNumber || result.data.tcKimlik || prev.identityNumber,
        }));

        if (!result.data.tcKimlik && !result.data.documentNumber) {
          setError("Belgeden bilgi çıkarılamadı. Lütfen formu manuel doldurun.");
        }
      } else {
        setError(result.error || "OCR işlemi başarısız oldu.");
      }
    } catch {
      setError("OCR işlemi sırasında bir hata oluştu.");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  // OCR'ı temizle
  const clearOCR = () => {
    setOcrResult(null);
    setPreviewUrl(null);
    setForm({
      dateOfBirth: "",
      tcKimlik: "",
      address: "",
      identityNumber: "",
    });
  };

  // dateOfBirth'i YYYY-MM-DD formatına çevir (input[type=date] için)
  const toDateInputValue = (date: string | null | undefined): string => {
    if (!date) return "";
    // "2024-01-15T00:00:00.000Z" → "2024-01-15"
    return date.slice(0, 10);
  };

  // Profile yüklendiğinde, eğer KYC verileri varsa formu doldur (manuel düzeltme için)
  useEffect(() => {
    setTimeout(() => {
      if (profile) {
        setForm((prev) => ({
          ...prev,
          dateOfBirth: prev.dateOfBirth || toDateInputValue(profile.dateOfBirth),
          tcKimlik: prev.tcKimlik || profile.tcKimlik || "",
          address: prev.address || profile.address || "",
          identityNumber: prev.identityNumber || profile.identityNumber || "",
        }));
      }
    }, 0);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const fieldErrMap: Record<string, string> = {};
          data.details.forEach((d: { field: string; message: string }) => {
            fieldErrMap[d.field] = d.message;
          });
          setFieldErrors(fieldErrMap);
        } else {
          setError(data.error || "Doğrulama başarısız.");
        }
        setIsSubmitting(false);
        return;
      }

      // Session ve profile'ı güncelle
      await updateSession();

      // Profili tekrar fetch et
      const profileRes = await fetch("/api/auth/profile");
      const profileData = await profileRes.json();
      if (profileData.success && profileData.data) {
        onVerified(profileData.data as unknown as ProfileData);
      }
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-pending/20 bg-gradient-to-r from-pending/5 to-transparent overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-pending/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pending/10 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-5 h-5 text-pending" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Kimlik Doğrulaması (KYC) Gerekli</p>
            <p className="text-xs text-text-muted mt-0.5">
              Hesabınızın tam özelliklerini kullanmak için kimlik bilgilerinizi doğrulayın
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">
            Doğrulanmamış
          </Badge>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-6 border-t border-pending/10 animate-[fade-in_0.2s_ease-out]">
          <p className="text-sm text-text-secondary pt-4 mb-5 leading-relaxed">
            Hesabınızı aktifleştirmek için aşağıdaki kimlik bilgilerini eksiksiz doldurun.
            Bilgileriniz gizli tutulur ve yalnızca doğrulama amacıyla kullanılır.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            {error && (
              <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* OCR Section */}
            <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-3">
                <ScanLine className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-text-primary">Otomatik Bilgi Çıkarma (OCR)</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Kimlik belgenizi yükleyin, bilgiler otomatik olarak doldurulsun.
              </p>

              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Yüklenen belge"
                      className="w-full h-32 object-contain rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={clearOCR}
                      className="absolute top-2 right-2 p-1 rounded-full bg-surface/80 hover:bg-surface text-text-muted hover:text-loss transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {ocrLoading && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>OCR işleniyor... %{ocrProgress}</span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {ocrResult && !ocrLoading && (
                    <div className="text-xs text-text-muted">
                      <span className="font-medium">Okunan güvenilirlik:</span>{" "}
                      %{Math.round(ocrResult.confidence)}
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                  <Upload className="w-6 h-6 text-text-muted mb-2" />
                  <span className="text-sm text-text-muted">
                    {ocrLoading ? "Yükleniyor..." : "Kimlik belgesi yükleyin"}
                  </span>
                  <span className="text-xs text-text-muted mt-1">
                    JPG, PNG veya WebP (maks. 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                    onChange={handleOCR}
                    className="hidden"
                    disabled={ocrLoading}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Doğum Tarihi"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                icon={<Calendar className="w-4 h-4" />}
                required
                error={fieldErrors.dateOfBirth}
              />

              <Input
                label="TC Kimlik No"
                value={form.tcKimlik}
                onChange={handleChange("tcKimlik")}
                icon={<IdCard className="w-4 h-4" />}
                placeholder="11 haneli TC Kimlik numarası"
                maxLength={11}
                error={fieldErrors.tcKimlik}
              />
            </div>

            <Input
              label="Kimlik / Pasaport Numarası"
              value={form.identityNumber}
              onChange={handleChange("identityNumber")}
              icon={<IdCard className="w-4 h-4" />}
              placeholder="Pasaport veya kimlik numaranız"
              required
              error={fieldErrors.identityNumber}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Adres
              </label>
              <textarea
                value={form.address}
                onChange={handleChange("address")}
                placeholder="Tam adresinizi girin (en az 10 karakter)"
                required
                rows={3}
                className={`flex w-full rounded-lg border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all duration-200 ${
                  fieldErrors.address
                    ? "border-danger focus:ring-danger/30 focus:border-danger"
                    : "border-border"
                }`}
              />
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-danger animate-[fade-in_0.15s_ease-out]">
                  {fieldErrors.address}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                <Fingerprint className="w-4 h-4" />
                Kimliği Doğrula
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setForm({
                    dateOfBirth: "",
                    tcKimlik: "",
                    address: "",
                    identityNumber: "",
                  });
                  setError("");
                  setFieldErrors({});
                }}
              >
                Temizle
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// IMAGE PREVIEW with error fallback
// ============================================================================
function ImagePreview({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center border border-border flex-shrink-0">
        <Camera className="w-4 h-4 text-text-muted" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 flex-shrink-0">
      <img
        src={url}
        alt="Önizleme"
        className="w-10 h-10 rounded-full object-cover border border-border"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// ============================================================================
// HELPER
// ============================================================================
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "Yönetici",
    MODERATOR: "Moderatör",
    USER: "Kullanıcı",
  };
  return map[role] || role;
}

// ============================================================================
// PAGE EXPORT
// ============================================================================
export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
