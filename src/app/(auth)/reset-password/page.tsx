"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <Card className="relative w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-loss/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-loss" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Geçersiz Bağlantı</h1>
            <p className="text-sm text-text-muted mb-8">
              Bu parola sıfırlama bağlantısı geçersiz. Lütfen yeni bir talep oluşturun.
            </p>
            <Link
              href="/forgot-password"
              className="text-secondary hover:text-secondary-dark font-medium text-sm transition-colors"
            >
              Yeni talep oluştur
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Parolalar eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Parola en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <Card className="relative w-full max-w-md animate-[fade-in_0.5s_ease-out]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-profit" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Parola Sıfırlandı</h1>
            <p className="text-sm text-text-muted leading-relaxed mb-8">
              Parolanız başarıyla sıfırlandı. Yeni parolanızla giriş yapabilirsiniz.
            </p>
            <Button onClick={() => router.push(ROUTES.LOGIN)}>
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md animate-[fade-in_0.5s_ease-out]">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-secondary/25">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{APP_NAME}</h1>
            <p className="text-sm text-text-muted mt-1">Yeni parola belirleyin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Yeni Parola"
                type={showPassword ? "text" : "password"}
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="relative">
              <Input
                label="Yeni Parola (Tekrar)"
                type={showPassword ? "text" : "password"}
                placeholder="Parolayı tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-border text-secondary focus:ring-secondary/30"
              />
              <span className="text-xs text-text-muted flex items-center gap-1">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                Parolaları göster
              </span>
            </label>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Parolayı Sıfırla
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary p-4">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
