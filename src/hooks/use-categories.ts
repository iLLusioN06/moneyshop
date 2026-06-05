import { useFetch, useMutate } from "./use-fetch";
import { API_ROUTES } from "@/lib/constants";
import type { Category } from "@/types";

export function useCategories() {
  return useFetch<Category[]>(API_ROUTES.CATEGORIES);
}

export function useCategory(id: string) {
  return useFetch<Category>(`${API_ROUTES.CATEGORIES}/${id}`, {
    skip: !id,
  });
}

export function useCreateCategory() {
  return useMutate<Category>(API_ROUTES.CATEGORIES);
}

export function useUpdateCategory(id: string) {
  return useMutate<Category>(`${API_ROUTES.CATEGORIES}/${id}`);
}

export function useDeleteCategory() {
  return useMutate<void>(API_ROUTES.CATEGORIES);
}
