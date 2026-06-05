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
  Loader2,
  Camera,
  Info,
  Clock,
  Lock,
  AlertCircle,
  RefreshCw,
  Fingerprint,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Scan,
  Check,
  ExternalLink,
  QrCode,
  ListChecks,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

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
  _count: {
    accounts: number;
    transactions: number;
    budgets: number;
  };
}

// --- Verification Banner ---
function VerificationBanner({ profile }: { profile: ProfileData | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const isVerified = !!profile?.emailVerified;

  if (isVerified) return null;

  const steps = [
    {
      icon: Scan,
      title: t("profile.verifyStep1"),
      desc: t("profile.verifyStep1Desc"),
    },
    {
      icon: Check,
      title: t("profile.verifyStep2"),
      desc: t("profile.verifyStep2Desc"),
    },
    {
      icon: Smartphone,
      title: t("profile.verifyStep3"),
      desc: t("profile.verifyStep3Desc"),
    },
    {
      icon: CheckCircle2,
      title: t("profile.verifyStep4"),
      desc: t("profile.verifyStep4Desc"),
    },
  ];

  return (
    <div className="rounded-xl border border-pending/20 bg-pending/5 overflow-hidden">
      {/* Banner Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-pending/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pending/10 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-5 h-5 text-pending" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">
              {t("profile.verifyTitle")}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t("profile.verifyDesc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-pending bg-pending/10 px-2.5 py-1 rounded-full">
            {t("dash.unverifiedAccount")}
            </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-4 pb-6 border-t border-pending/10">
          <p className="text-sm text-text-secondary pt-4 mb-5">
            {t("profile.verifyDesc")} Uygulama içinde aşağıdaki adımları takip etmen yeterli.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-surface border border-border"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {i + 1}. {step.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-surface border border-border">
            <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <QrCode className="w-20 h-20 text-gray-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                {t("profile.qrTitle")}
              </p>
              <p className="text-xs text-text-muted">
                {t("profile.qrDesc")}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("profile.appStore")}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("profile.googlePlay")}
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Uygulamamızı App Store veya Google Play Store&apos;a girerek de indirebilirsin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Profile Summary Card ---
function ProfileSummary({ profile }: { profile: ProfileData | null }) {
  const { data: session } = useSession();
  const displayName = profile?.name || session?.user?.name || t("nav.user");
  const displayEmail = profile?.email || session?.user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();
  const role = profile?.role || session?.user?.role || "USER";

  const roleLabel: Record<string, { label: string; variant: "success" | "info" | "warning" }> = {
    ADMIN: { label: t("nav.admin"), variant: "success" },
    MODERATOR: { label: "Moderatör", variant: "info" },
    USER: { label: t("nav.user"), variant: "warning" },
  };

  const roleInfo = roleLabel[role] || { label: t("nav.user"), variant: "warning" as const };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Avatar */}
        <div className="flex items-start">
          <div className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-secondary/20 ml-auto">
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
          <div className="relative">
            <button
              className="absolute bottom-0 right-0 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-tertiary transition-colors shadow-sm"
              title={t("profile.title")}
            >
              <Camera className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-text-primary mt-4">
            {displayName}
          </h3>
          <p className="text-sm text-text-muted">{displayEmail}</p>

          <div className="mt-3">
            <Badge variant={roleInfo.variant} size="md">
              <Shield className="w-3.5 h-3.5 mr-1" />
              {roleInfo.label}
            </Badge>
          </div>

          {profile && (
            <p className="text-xs text-text-muted mt-3">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              {t("profile.memberSince")}: {formatDate(new Date(profile.createdAt), "long")}
            </p>
          )}
        </div>

        {/* Quick Stats */}
        {profile && (
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <Building2 className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-lg font-bold text-text-primary">{profile._count.accounts}</p>
              <p className="text-xs text-text-muted">{t("header.accounts")}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <ArrowUpDown className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-lg font-bold text-text-primary">{profile._count.transactions}</p>
              <p className="text-xs text-text-muted">{t("header.transactions")}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                <PiggyBank className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-lg font-bold text-text-primary">{profile._count.budgets}</p>
              <p className="text-xs text-text-muted">{t("nav.budgets")}</p>
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {t("header.accounts")}
            </span>
            {profile?.isActive !== false ? (
              <span className="flex items-center gap-1 text-profit font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 text-loss font-medium">
                <XCircle className="w-3.5 h-3.5" />
                Pasif
              </span>
            )}
          </div>
          {profile?.emailVerified && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                E-posta
              </span>
              <span className="flex items-center gap-1 text-profit font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Doğrulanmış
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Edit Profile Form ---
function EditProfileForm({
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

  // Update form when profile data loads
  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.image !== undefined) setImage(profile.image || "");
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

      // Update session to reflect changes
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

  return (
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            {t("profile.personalInfo")}
          </CardTitle>
          <CardDescription>Adınızı ve profil bilgilerinizi güncelleyin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {success && (
            <div className="p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Profil başarıyla güncellendi.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Input
            label={t("profile.fullName")}
            value={name}
            icon={<User className="w-4 h-4" />}
            disabled
          />
          <p className="mt-1 text-xs text-text-muted">{t("profile.nameLocked")}</p>

          <div>
            <Input
              label={t("profile.email")}
              type="email"
              value={profile?.email || session?.user?.email || ""}
              icon={<Mail className="w-4 h-4" />}
              disabled
            />
            <p className="mt-1 text-xs text-text-muted">E-posta adresi değiştirilemez.</p>
          </div>

          <Input
            label="Profil Fotoğrafı (URL)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            icon={<Camera className="w-4 h-4" />}
            placeholder="https://example.com/avatar.jpg"
          />

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
  );
}

// --- Password Change Form ---
function PasswordChangeForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError("Yeni parolalar eşleşmiyor.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Yeni parola en az 6 karakter olmalıdır.");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-secondary" />
          Güvenlik
        </CardTitle>
        <CardDescription>Parolanızı düzenli aralıklarla değiştirmeniz önerilir</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {success && (
            <div className="p-3 rounded-lg bg-profit/10 border border-profit/20 text-sm text-profit flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Parolanız başarıyla güncellendi.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
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
          />

          <Input
            label="Yeni Parola"
            type={showPasswords ? "text" : "password"}
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            icon={<Lock className="w-4 h-4" />}
            placeholder="En az 6 karakter"
            required
            minLength={6}
          />

          <Input
            label="Yeni Parola (Tekrar)"
            type={showPasswords ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            icon={<Lock className="w-4 h-4" />}
            placeholder="Yeni parolanızı tekrar girin"
            required
            minLength={6}
          />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
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
  );
}

// --- Account Activity ---
function AccountActivity({ profile }: { profile: ProfileData | null }) {
  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          Hesap Aktivitesi
        </CardTitle>
        <CardDescription>Hesap bilgileri ve oturum geçmişi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-tertiary/50 border border-border">
              <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Hesap Oluşturma
              </div>
              <p className="text-sm font-medium text-text-primary">
                {formatDate(new Date(profile.createdAt), "long")}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {formatDate(new Date(profile.createdAt), "relative")}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-tertiary/50 border border-border">
              <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Son Güncelleme
              </div>
              <p className="text-sm font-medium text-text-primary">
                {formatDate(new Date(profile.updatedAt), "long")}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {formatDate(new Date(profile.updatedAt), "relative")}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-tertiary/50 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
                <Shield className="w-3.5 h-3.5" />
                Güvenlik Durumu
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">E-posta Doğrulama</span>
                {profile.emailVerified ? (
                  <span className="flex items-center gap-1 text-profit font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Doğrulanmış
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-pending font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Doğrulanmamış
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Parola Koruması</span>
                <span className="flex items-center gap-1 text-profit font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Hesap Durumu</span>
                {profile.isActive ? (
                  <span className="flex items-center gap-1 text-profit font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-loss font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Pasif
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileContent() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          <p className="text-sm text-text-muted">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-loss mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-1">Bir hata oluştu</h3>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <Button onClick={fetchProfile}>
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil</h1>
        <p className="text-sm text-text-muted mt-1">
          Hesap bilgilerinizi görüntüleyin, düzenleyin ve güvenlik ayarlarınızı yönetin
        </p>
      </div>

      {/* Verification Banner */}
      <VerificationBanner profile={profile} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileSummary profile={profile} />
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <EditProfileForm
            profile={profile}
            onProfileUpdate={(data) => setProfile(data)}
          />
          <PasswordChangeForm />
          <AccountActivity profile={profile} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
}
