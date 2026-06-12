// =============================================
// MoneyShop - Proxy (Route Koruması)
// =============================================
// Proxy runs on Node.js Runtime — avoid importing server-only modules (bcryptjs, prisma).

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export { auth as proxy };

// Proxy'in çalışacağı route'lar
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
    "/api/transfers/:path*",
    "/api/deposits/:path*",
    "/api/withdrawals/:path*",
    "/recurring/:path*",
    "/api/recurring-transactions/:path*",
    "/reports/:path*",
    "/api/reports/:path*",
    "/portfolio/:path*",
    "/api/investments/:path*",
    "/api/payments/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/admin/audit-logs/:path*",
    "/api/admin/audit-logs/:path*",
  ],
};
