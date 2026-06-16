import { useFetch } from "./use-fetch";
import { API_ROUTES } from "@/lib/constants";

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  status: string;
  category: { id: string; name: string; color: string } | null;
  account: { id: string; name: string } | null;
}

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface CategoryBreakdown {
  category: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface AccountWithConversion {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  originalBalance: number;
  originalCurrency: string;
  convertedBalance: number;
  convertedCurrency: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  currency: string;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  accounts: AccountWithConversion[];
  exchangeRates: Record<string, number>;
  recentTransactions: RecentTransaction[];
  monthlyData: MonthlyDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
}

export function useDashboard(baseCurrency: string = "TRY") {
  const url = `${API_ROUTES.DASHBOARD}?base=${encodeURIComponent(baseCurrency)}`;
  return useFetch<DashboardStats>(url);
}
