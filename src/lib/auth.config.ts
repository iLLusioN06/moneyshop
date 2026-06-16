// =============================================
// MoneyShop - Auth Route Koruması
// =============================================

import type { NextAuthConfig } from "next-auth";

// Auth gerektirmeyen rotalar
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/faq",
  "/card",
  "/api/auth/**",
];

// Auth sayfaları (giriş yapmış kullanıcılar erişemez)
export const authRoutes = ["/login", "/register"];

// API auth prefix
export const apiAuthPrefix = "/api/auth";

// Varsayılan giriş sonrası yönlendirme
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = authRoutes.includes(nextUrl.pathname);
      const isPublicRoute = publicRoutes.some((route) => {
        if (route.endsWith("/**")) {
          return nextUrl.pathname.startsWith(route.slice(0, -3));
        }
        return nextUrl.pathname === route;
      });
      const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

      // API auth rotaları herkese açık
      if (isApiAuthRoute) return true;

      // Auth sayfalarına giriş yapmış kullanıcılar erişemez
      if (isAuthRoute) {
        if (isLoggedIn) {
          // Admin kullanıcıyı admin paneline yönlendir
          if (auth?.user?.role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return true;
      }

      // Public rotalar herkese açık
      if (isPublicRoute) return true;

      // Diğer tüm rotalar auth gerektirir
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
