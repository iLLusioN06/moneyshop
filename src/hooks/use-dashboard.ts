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

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  currency: string;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  recentTransactions: RecentTransaction[];
  monthlyData: MonthlyDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
}

export function useDashboard() {
  return useFetch<DashboardStats>(API_ROUTES.DASHBOARD);
}
