import { useFetch, useMutate } from "./use-fetch";
import { API_ROUTES } from "@/lib/constants";
import type { FinancialAccount } from "@/types";

export function useAccounts() {
  return useFetch<FinancialAccount[]>(API_ROUTES.ACCOUNTS);
}

export function useAccount(id: string) {
  return useFetch<FinancialAccount>(`${API_ROUTES.ACCOUNTS}/${id}`, {
    skip: !id,
  });
}

export function useCreateAccount() {
  return useMutate<FinancialAccount>(API_ROUTES.ACCOUNTS);
}

export function useUpdateAccount(id: string) {
  return useMutate<FinancialAccount>(`${API_ROUTES.ACCOUNTS}/${id}`);
}

export function useDeleteAccount() {
  return useMutate<void>(API_ROUTES.ACCOUNTS);
}
