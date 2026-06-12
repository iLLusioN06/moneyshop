// =============================================
// MoneyShop - Sabitler
// =============================================

export const APP_NAME = "MoneyShop";
export const APP_DESCRIPTION = "Modern Finansal Yönetim Paneli";
export const APP_VERSION = "1.0.0";

// Sayfa yönlendirmeleri
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ACCOUNTS: "/accounts",
  TRANSACTIONS: "/transactions",
  CATEGORIES: "/categories",
  BUDGETS: "/budgets",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  TRANSFERS: "/transfers",
  DEPOSIT: "/deposit",
  WITHDRAW: "/withdraw",
  PAYMENTS: "/payments",
  CARD: "/my-card",
  ADMIN: "/admin",
  RECURRING: "/recurring",
  REPORTS: "/reports",
  PORTFOLIO: "/portfolio",
} as const;

// API route'ları
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  ACCOUNTS: "/api/accounts",
  TRANSACTIONS: "/api/transactions",
  CATEGORIES: "/api/categories",
  BUDGETS: "/api/budgets",
  DASHBOARD: "/api/dashboard",
} as const;

// Hesap türleri
export const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Vadesiz Hesap", icon: "building-bank" },
  { value: "SAVINGS", label: "Vadeli Hesap", icon: "piggy-bank" },
  { value: "CREDIT_CARD", label: "Kredi Kartı", icon: "credit-card" },
  { value: "INVESTMENT", label: "Yatırım", icon: "chart-line" },
  { value: "CASH", label: "Nakit", icon: "money-bill" },
  { value: "LOAN", label: "Kredi", icon: "hand-holding-dollar" },
] as const;

// Para birimleri
export const CURRENCIES = [
  { value: "TRY", label: "₺ Türk Lirası", symbol: "₺" },
  { value: "USD", label: "$ Dolar", symbol: "$" },
  { value: "EUR", label: "€ Euro", symbol: "€" },
  { value: "GBP", label: "£ Sterlin", symbol: "£" },
  { value: "CHF", label: "CHF İsviçre Frangı", symbol: "CHF" },
  { value: "XAU", label: "Altın (Gram)", symbol: "Au" },
] as const;

// İşlem türleri
export const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Gelir", color: "#10b981" },
  { value: "EXPENSE", label: "Gider", color: "#ef4444" },
  { value: "TRANSFER", label: "Transfer", color: "#3b82f6" },
] as const;

// İşlem durumları
export const TRANSACTION_STATUS = [
  { value: "COMPLETED", label: "Tamamlandı", color: "#10b981" },
  { value: "PENDING", label: "Beklemede", color: "#f59e0b" },
  { value: "FAILED", label: "Başarısız", color: "#ef4444" },
  { value: "CANCELLED", label: "İptal Edildi", color: "#94a3b8" },
] as const;

// Bütçe periyotları
export const BUDGET_PERIODS = [
  { value: "WEEKLY", label: "Haftalık" },
  { value: "MONTHLY", label: "Aylık" },
  { value: "YEARLY", label: "Yıllık" },
] as const;

// Varsayılan kategoriler
export const DEFAULT_CATEGORIES = [
  { name: "Maaş", icon: "wallet", color: "#10b981", type: "INCOME" },
  { name: "Kira", icon: "home", color: "#3b82f6", type: "EXPENSE" },
  { name: "Faturalar", icon: "file-invoice", color: "#f59e0b", type: "EXPENSE" },
  { name: "Market", icon: "shopping-cart", color: "#ec4899", type: "EXPENSE" },
  { name: "Ulaşım", icon: "car", color: "#8b5cf6", type: "EXPENSE" },
  { name: "Sağlık", icon: "heart", color: "#ef4444", type: "EXPENSE" },
  { name: "Eğitim", icon: "book", color: "#06b6d4", type: "EXPENSE" },
  { name: "Eğlence", icon: "gamepad", color: "#f97316", type: "EXPENSE" },
  { name: "Yatırım", icon: "chart-line", color: "#6366f1", type: "INCOME" },
  { name: "Diğer Gelir", icon: "plus-circle", color: "#84cc16", type: "INCOME" },
  { name: "Diğer Gider", icon: "minus-circle", color: "#94a3b8", type: "EXPENSE" },
] as const;

// Sayfalama
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Tema
export const THEME = {
  STORAGE_KEY: "moneyshop-theme",
  DEFAULT: "light" as const,
} as const;
