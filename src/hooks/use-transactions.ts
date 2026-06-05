import { useFetch, useMutate } from "./use-fetch";
import { API_ROUTES } from "@/lib/constants";
import type { Transaction } from "@/types";

interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

function buildQuery(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `${API_ROUTES.TRANSACTIONS}?${qs}` : API_ROUTES.TRANSACTIONS;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const url = buildQuery(filters);
  return useFetch<{ transactions: Transaction[]; total: number; page: number; limit: number }>(url);
}

export function useTransaction(id: string) {
  return useFetch<Transaction>(`${API_ROUTES.TRANSACTIONS}/${id}`, {
    skip: !id,
  });
}

export function useCreateTransaction() {
  return useMutate<Transaction>(API_ROUTES.TRANSACTIONS);
}

export function useUpdateTransaction(id: string) {
  return useMutate<Transaction>(`${API_ROUTES.TRANSACTIONS}/${id}`);
}

export function useDeleteTransaction() {
  return useMutate<void>(API_ROUTES.TRANSACTIONS);
}
