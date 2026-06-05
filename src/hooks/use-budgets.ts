import { useFetch, useMutate } from "./use-fetch";
import { API_ROUTES } from "@/lib/constants";
import type { Budget } from "@/types";

export interface BudgetWithProgress extends Budget {
  spent: number;
  progress: number;
}

export function useBudgets() {
  return useFetch<BudgetWithProgress[]>(API_ROUTES.BUDGETS);
}

export function useBudget(id: string) {
  return useFetch<Budget>(`${API_ROUTES.BUDGETS}/${id}`, {
    skip: !id,
  });
}

export function useCreateBudget() {
  return useMutate<Budget>(API_ROUTES.BUDGETS);
}

export function useUpdateBudget(id: string) {
  return useMutate<Budget>(`${API_ROUTES.BUDGETS}/${id}`);
}

export function useDeleteBudget() {
  return useMutate<void>(API_ROUTES.BUDGETS);
}
