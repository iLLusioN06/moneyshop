// Sentry.io - Hata izleme entegrasyonu
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Production'da tamamen aktif, development'da devre dışı
  enabled: process.env.NODE_ENV === "production",

  // Performans izleme
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session replay (kullanıcı oturumu)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Ortam bilgisi
  environment: process.env.NODE_ENV || "development",

  // Dışlanan hatalar
  ignoreErrors: [
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    "NEXT_NOT_FOUND",
  ],

  // Breadcrumb filters
  beforeBreadcrumb(breadcrumb) {
    // Hassas verileri filtrele
    if (breadcrumb.category === "console" && breadcrumb.level === "info") {
      return null;
    }
    return breadcrumb;
  },
});
