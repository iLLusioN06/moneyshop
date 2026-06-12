// =============================================
// MoneyShop - Tip Tanımlamaları
// =============================================

// Kullanıcı Rolleri
export type UserRole = "USER" | "ADMIN" | "MODERATOR";

// Kullanıcı
export interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  password: string;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Hesap Türü
export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT_CARD" | "INVESTMENT" | "CASH" | "LOAN";

// Para Birimi
export type Currency = "TRY" | "USD" | "EUR" | "GBP" | "CHF" | "XAU" | "BTC" | "ETH";

// Finansal Hesap
export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// İşlem Türü
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

// İşlem Durumu
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";

// İşlem Kategorisi
export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: Date;
}

// İşlem
export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string | null;
  status: TransactionStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  // Transfer bilgileri
  recipientName?: string | null;
  recipientIban?: string | null;
  recipientBank?: string | null;
  transferFee?: number;
  recipientUserId?: string | null;
  cardId?: string | null;
  // İlişkiler
  category?: Category;
  account?: FinancialAccount;
}

// Tekrarlanan İşlem
export type RecurringFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type RecurringStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface RecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string | null;
  frequency: RecurringFrequency;
  intervalCount: number;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  startDate: Date;
  endDate: Date | null;
  nextDate: Date;
  lastProcessed: Date | null;
  status: RecurringStatus;
  totalOccurrences: number | null;
  occurrenceCount: number;
  transferRecipientName: string | null;
  transferRecipientIban: string | null;
  transferRecipientBank: string | null;
  recipientUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  // İlişkiler
  account?: FinancialAccount;
  category?: Category;
}

// Bütçe
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  currency: Currency;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  category?: Category;
}

// Dashboard Özet İstatistikleri
export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  currency: Currency;
  incomeChange: number;  // yüzde değişim
  expenseChange: number; // yüzde değişim
  balanceChange: number; // yüzde değişim
  recentTransactions: Transaction[];
  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

// API Yanıt Tipleri
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Tipleri
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
}

// Kart Türü
export type CardType = "STANDARD" | "SILVER" | "GOLD";

// Kart Durumu
export type CardStatus = "ACTIVE" | "BLOCKED" | "CANCELLED" | "PENDING";

// MoneyShop Card
export interface Card {
  id: string;
  userId: string;
  cardType: CardType;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  status: CardStatus;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  balance: number;
  currency: Currency;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  transactions?: Transaction[];
}

export interface CardTransaction {
  id: string;
  amount: number;
  description: string | null;
  date: Date;
  type: TransactionType;
  status: TransactionStatus;
}
