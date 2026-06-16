"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";
import {
  Smartphone,
  Check,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  KeyRound,
  Copy,
  CheckCheck,
} from "lucide-react";

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingToken = searchParams.get("token") || "";
  const method = (searchParams.get("method") || "AUTHENTICATOR") as
    | "AUTHENTICATOR"
    | "SMS";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [countdown, setCountdown] = useState(120);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Geri sayım
  useEffect(() => {
    if (countdown <= 0 || success || method !== "SMS") return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, success, method]);

  // Token yoksa login'e yönlendir
  useEffect(() => {
    if (!pendingToken) {
      router.push("/login");
    }
  }, [pendingToken, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullCode = useBackupCode ? backupCode : code.join("");

    if (!fullCode) {
      setError(
        useBackupCode
          ? "Lütfen yedek kurtarma kodunu girin."
          : "Lütfen 6 haneli doğrulama kodunu girin."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendingToken,
          code: fullCode,
          isBackupCode: useBackupCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 410 = süresi dolmuş token
        if (res.status === 410) {
          setError("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
          setTimeout(() => router.push("/login"), 2000);
          setIsLoading(false);
          return;
        }
        setError(data.error || "Doğrulama sırasında bir hata oluştu.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        // Role bazlı yönlendirme
        if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 1500);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  const handleResendSms = async () => {
    if (countdown > 0) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi.");
        setIsLoading(false);
        return;
      }

      setCode(["", "", "", "", "", ""]);
      setCountdown(120);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Kod gönderilirken hata oluştu.");
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Success */}
      {success ? (
        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <Check className="w-8 h-8 text-profit" />
          </div>
          <p className="text-lg font-semibold text-text-primary">
            Giriş Başarılı
          </p>
          <p className="text-sm text-text-muted text-center">
            Yönlendiriliyorsunuz...
          </p>
        </div>
      ) : (
        <>
          {/* Info */}
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              {method === "AUTHENTICATOR" ? (
                <KeyRound className="w-6 h-6 text-secondary" />
              ) : (
                <Smartphone className="w-6 h-6 text-secondary" />
              )}
            </div>
            <p className="text-sm text-text-primary font-medium">
              İki Faktörlü Doğrulama
            </p>
            <p className="text-xs text-text-muted mt-1">
              {method === "AUTHENTICATOR"
                ? "Google Authenticator uygulamasındaki 6 haneli kodu girin."
                : "Telefonunuza gönderilen 6 haneli SMS kodunu girin."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="shake-alert mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
              <ShieldAlert className="w-4 h-4 inline-block mr-1.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!useBackupCode ? (
              <>
                {/* 6 Haneli Kod Inputu */}
                <div className="flex justify-center gap-2 mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-border bg-surface text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                      autoComplete="one-time-code"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* SMS: Yeniden gönderme (sadece SMS yöntemi için) */}
                {method === "SMS" && (
                  <div className="text-center mb-4">
                    {countdown > 0 ? (
                      <p className="text-xs text-text-muted">
                        Yeni kod almak için{" "}
                        <span className="text-secondary font-medium">
                          {formatTime(countdown)}
                        </span>{" "}
                        bekleyin.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendSms}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1 text-xs text-secondary hover:text-secondary-dark font-medium transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Kodu Yeniden Gönder
                      </button>
                    )}
                  </div>
                )}

                {/* Yedek Kod Geçişi */}
                <div className="text-center mb-4">
                  <button
                    type="button"
                    onClick={() => setUseBackupCode(true)}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
                  >
                    Yedek kurtarma koduyla giriş yap
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Yedek Kod Inputu */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Yedek Kurtarma Kodu
                  </label>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="w-full h-12 text-center text-lg font-bold tracking-widest rounded-lg border border-border bg-surface text-text-primary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-xs text-text-muted text-center mt-2">
                    Yedek kodlarınızdan birini girin (büyük-küçük harf duyarsız)
                  </p>
                </div>

                {/* Normal Kod'a Dön */}
                <div className="text-center mb-4">
                  <button
                    type="button"
                    onClick={() => setUseBackupCode(false)}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
                  >
                    Doğrulama koduyla giriş yap
                  </button>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Doğrula
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş Sayfasına Dön
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default function Verify2FAPage() {
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
              İki Adımlı Doğrulama
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <Verify2FAForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
