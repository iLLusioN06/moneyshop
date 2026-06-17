import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS sınıflarını birleştirmek için utility fonksiyon
 * clsx ile koşullu sınıfları birleştirir, tailwind-merge ile çakışmaları çözer
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Para birimi formatlama
 * @example formatCurrency(1500.5, "TRY") -> "₺1.500,50"
 */
export function formatCurrency(
  amount: number,
  currency: string = "TRY"
): string {
  const currencyMap: Record<string, { locale: string; currency: string }> = {
    TRY: { locale: "tr-TR", currency: "TRY" },
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
    GBP: { locale: "en-GB", currency: "GBP" },
    CHF: { locale: "de-CH", currency: "CHF" },
    AED: { locale: "ar-AE", currency: "AED" },
    IQD: { locale: "ar-IQ", currency: "IQD" },
    XAU: { locale: "en-US", currency: "XAU" },
  };

  const config = currencyMap[currency] || { locale: "tr-TR", currency: "TRY" };

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Sayı formatlama
 * @example formatNumber(1500000) -> "1.500.000"
 */
export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("tr-TR", options).format(number);
}

/**
 * Yüzde formatlama
 * @example formatPercentage(25.5) -> "%25,5"
 */
export function formatPercentage(value: number): string {
  return `%${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}`;
}

/**
 * Tarih formatlama
 * @example formatDate(new Date()) -> "1 Haziran 2026"
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "relative" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Bugün";
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    if (days < 365) return `${Math.floor(days / 30)} ay önce`;
    return `${Math.floor(days / 365)} yıl önce`;
  }

  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: format === "long" ? "long" : "short",
    day: "numeric",
  });
}

/**
 * Hesap türüne göre renk döndürür
 */
export function getAccountTypeColor(type: string): string {
  const colors: Record<string, string> = {
    CHECKING: "#3b82f6",
    SAVINGS: "#10b981",
    CREDIT_CARD: "#ef4444",
    INVESTMENT: "#8b5cf6",
    CASH: "#f59e0b",
    LOAN: "#ec4899",
  };
  return colors[type] || "#94a3b8";
}

/**
 * İşlem türüne göre renk döndürür
 */
export function getTransactionTypeColor(type: string): string {
  const colors: Record<string, string> = {
    INCOME: "#10b981",
    EXPENSE: "#ef4444",
    TRANSFER: "#3b82f6",
  };
  return colors[type] || "#94a3b8";
}

/**
 * Rastgele renk oluşturur (HSL formatında)
 */
export function generateColor(seed?: string): string {
  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
    "#14b8a6", "#f97316", "#6366f1", "#d946ef",
  ];

  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Parola gücünü kontrol eder (0-100 arası)
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  return Math.min(score, 100);
}

/**
 * Metni kısaltma
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * ID oluşturucu (prefix ile)
 */
export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Cache-Control header'ları için standart getter
 */
export function getCacheHeaders(seconds: number = 30): Record<string, string> {
  return {
    "Cache-Control": `private, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`,
  };
}
