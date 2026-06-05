// =============================================
// MoneyShop - Middleware (Route Koruması)
// =============================================
// Middleware runs on Edge Runtime — avoid importing server-only modules (bcryptjs, prisma).

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export { auth as middleware };

// Middleware'in çalışacağı route'lar
export const config = {
  matcher: [
    // Sadece dashboard ve API route'ları korumaya al
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/budgets/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/transfers/:path*",
    "/api/dashboard/:path*",
    "/api/accounts/:path*",
    "/api/transactions/:path*",
    "/api/categories/:path*",
    "/api/budgets/:path*",
  ],
};
