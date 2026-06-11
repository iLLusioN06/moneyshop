// =============================================
// MoneyShop - Yetkilendirme Sistemi
// =============================================

import type { UserRole } from "@/types";

// Sidebar navigasyon öğelerinin yetki tanımları
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: UserRole[]; // Hangi rollerin erişebileceği
}

// Admin yetkisi gerektiren route'lar
export const ADMIN_ROUTES = [
  "/categories",
  "/settings",
  "/admin",
];

// Herkesin erişebileceği route'lar
export const PUBLIC_ROUTES = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/budgets",
  "/profile",
  "/transfers",
  "/deposit",
  "/withdraw",
  "/payments",
  "/card",
];

// Role bazlı route kontrolü
export function canAccessRoute(role: UserRole | undefined | null, path: string): boolean {
  if (!role) return false;
  if (role === "ADMIN") return true; // Admin her şeye erişebilir
  // USER ve MODERATOR admin route'larına erişemez
  return !ADMIN_ROUTES.some((route) => path.startsWith(route));
}

// Sidebar filtreleme
export function getAccessibleNavItems<T extends { href: string }>(role: UserRole | undefined | null, allItems: T[]): T[] {
  if (role === "ADMIN") return allItems; // Admin tüm menüleri görür
  // USER/MODERATOR sadece public route'ları görür
  return allItems.filter((item) =>
    PUBLIC_ROUTES.some((route) => item.href === route)
  );
}
