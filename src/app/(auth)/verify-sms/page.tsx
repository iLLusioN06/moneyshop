"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Smartphone, Check, ArrowLeft, RefreshCw } from "lucide-react";

function VerifySmsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const mode = searchParams.get("mode") || "register";

  const pendingTokenParam = searchParams.get("pendingToken") || "";
  const [pendingToken, setPendingToken] = useState(pendingTokenParam || "");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 dakika
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Geri sayım
  useEffect(() => {
    if (countdown <= 0 || success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, success]);

  // Telefon yoksa login'e yönlendir
  useEffect(() => {
    if (!phone) {
      router.push(ROUTES.LOGIN);
    }
  }, [phone, router]);

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

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Lütfen 6 haneli SMS kodunu girin.");
      return;
    }

    setIsLoading(true);

    try {
      // Mod'a göre doğrulama endpoint'ini seç
      const verifyEndpoint =
        mode === "login"
          ? "/api/auth/verify-login-code"
          : "/api/auth/verify-sms";

      const token = pendingToken || sessionStorage.getItem("pending_token") || "";
      const res = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: fullCode, pendingToken: token || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Doğrulama sırasında bir hata oluştu.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);

      // sessionStorage'dan geçici verileri temizle
      sessionStorage.removeItem("pending_token");

      // Dashboard'a yönlendir (session cookie API tarafından set edildi)
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }, 1500);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      // Mod'a göre yeniden kod gönderme endpoint'ini seç
      const resendEndpoint =
        mode === "login"
          ? "/api/auth/send-login-code"
          : "/api/auth/register";

      const body =
        mode === "login"
          ? {
              email: sessionStorage.getItem("pending_email") || "",
              password: sessionStorage.getItem("pending_password") || "",
            }
          : { phone, pendingToken: pendingToken || sessionStorage.getItem("pending_token") || undefined };

      const res = await fetch(resendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kod gönderilemedi.");
        setIsLoading(false);
        return;
      }

      setCode(["", "", "", "", "", ""]);
      setCountdown(120);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Bir hata oluştu.");
    }

    setIsLoading(false);
  };

  const maskedPhone = phone
    ? phone.replace(/.(?=.{4})/g, "*")
    : "";

  return (
    <>
      {/* Success */}
      {success ? (
        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <Check className="w-8 h-8 text-profit" />
          </div>
          <p className="text-lg font-semibold text-text-primary">
            {mode === "login" ? "Hesaba Erişim Onaylandı" : "Hesabınız Oluşturuldu!"}
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
              <Smartphone className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-sm text-text-primary font-medium">
              SMS Kodunu Girin
            </p>
            <p className="text-xs text-text-muted mt-1">
              {phone
                ? `${maskedPhone} numarasına 6 haneli kod gönderildi.`
                : "Telefon numaranıza kod gönderildi."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="shake-alert mb-4 p-3 rounded-lg bg-loss/10 border border-loss/20 text-sm text-loss">
              {error}
            </div>
          )}

          {/* Code Input */}
          <form onSubmit={handleSubmit}>
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
                />
              ))}
            </div>

            {/* Countdown / Resend */}
            <div className="text-center mb-6">
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
                  onClick={handleResend}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-xs text-secondary hover:text-secondary-dark font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  Kodu Yeniden Gönder
                </button>
              )}
            </div>

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
              href={mode === "login" ? ROUTES.LOGIN : ROUTES.REGISTER}
              className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default function VerifySmsPage() {
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
              SMS Doğrulama
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <VerifySmsForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
