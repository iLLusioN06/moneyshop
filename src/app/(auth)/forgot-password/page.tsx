"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
            <h1 className="text-2xl font-bold text-text-primary mb-2">Kontrol Edin</h1>
            <p className="text-sm text-text-muted leading-relaxed mb-8">
              E-posta adresinize parola sıfırlama bağlantısı gönderdik.
              Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary-dark font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
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
            <p className="text-sm text-text-muted mt-1">Parolanızı sıfırlayın</p>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Hesabınıza kayıtlı e-posta adresini girin.
            Size parola sıfırlama bağlantısı göndereceğiz.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="E-posta Adresi"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Bağlantı Gönder
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary-dark font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
