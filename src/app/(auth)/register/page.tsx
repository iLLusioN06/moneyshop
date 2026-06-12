"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Eye, EyeOff, Mail, Lock, User, Check, Phone } from "lucide-react";
import { checkPasswordStrength } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const passwordStrength = checkPasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (passwordStrength < 30) return "Zayıf";
    if (passwordStrength < 60) return "Orta";
    if (passwordStrength < 80) return "İyi";
    return "Güçlü";
  };

  const getStrengthColor = () => {
    if (passwordStrength < 30) return "bg-loss";
    if (passwordStrength < 60) return "bg-pending";
    if (passwordStrength < 80) return "bg-info";
    return "bg-profit";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      setError("Parolalar eşleşmiyor.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Parola en az 6 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
        setIsLoading(false);
        return;
      }

      // SMS doğrulama için bilgileri sessionStorage'da sakla
      sessionStorage.setItem("pending_email", formData.email);
      sessionStorage.setItem("pending_password", formData.password);

      // SMS doğrulama sayfasına yönlendir
      router.push(`/verify-sms?phone=${encodeURIComponent(formData.phone)}`);
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

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
            <p className="text-sm text-text-muted mt-1">
              Yeni hesap oluşturun
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="shake-alert mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              type="text"
              placeholder="Ahmet Yılmaz"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              icon={<User className="w-4 h-4" />}
              required
              autoComplete="name"
            />

            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Cep Telefonu"
              type="tel"
              placeholder="+90 5XX XXX XX XX"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              icon={<Phone className="w-4 h-4" />}
              required
              autoComplete="tel"
            />

            <div className="relative">
              <Input
                label="Parola"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= level * 25
                          ? getStrengthColor()
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs ${
                    passwordStrength < 30
                      ? "text-loss"
                      : passwordStrength < 60
                        ? "text-pending"
                        : "text-profit"
                  }`}
                >
                  Parola gücü: {getStrengthLabel()}
                </p>
              </div>
            )}

            <Input
              label="Parola Tekrar"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              icon={<Check className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Kayıt Ol
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-text-muted">
            Zaten hesabınız var mı?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-secondary hover:text-secondary-dark font-medium transition-colors"
            >
              Giriş Yap
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
