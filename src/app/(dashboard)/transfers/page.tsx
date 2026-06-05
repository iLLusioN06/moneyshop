"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import Link from "next/link";
import {
  Bolt,
  ArrowLeftRight,
  Globe,
  QrCode,
  HandCoins,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const transferServices = [
  {
    id: "fast",
    href: "/dashboard/transfers/fast",
    title: "FAST Para Transferi",
    desc: "7/24 anında para transferi. Saniyeler içinde gönderin, hemen ulaşsın.",
    icon: Bolt,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: ["7/24 kesintisiz", "Anında gönderim", "Ücretsiz transfer"],
  },
  {
    id: "eft",
    href: "/dashboard/transfers/eft",
    title: "Havale & EFT",
    desc: "Geleneksel bankacılık işlemlerinizi tek platformdan yönetin.",
    icon: ArrowLeftRight,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    features: ["Tüm bankalar", "Dakikalar içinde", "Güvenli gönderim"],
  },
  {
    id: "international",
    href: "/dashboard/transfers/international",
    title: "Yurt Dışından Para Al",
    desc: "Dünyanın her yerinden para almanın en kolay yolu.",
    icon: Globe,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    features: ["Global erişim", "Anında takip", "Düşük komisyon"],
  },
  {
    id: "iban",
    href: "/dashboard/transfers/iban",
    title: "MoneyShop IBAN & Kolay Adres",
    desc: "Size özel IBAN ve kolay adresinizle para transferlerini zahmetsiz hale getirin.",
    icon: QrCode,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    features: ["Özel IBAN", "QR ile gönderim", "Kolay adres"],
  },
  {
    id: "request",
    href: "/dashboard/transfers/request",
    title: "Ödeme İste",
    desc: "Müşterilerinizden veya iş ortaklarınızdan tek tıkla ödeme isteyin.",
    icon: HandCoins,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: ["Tek tıkla iste", "Link ile gönder", "Otomatik takip"],
  },
  {
    id: "secure",
    href: "#",
    title: "Güvenli Ödeme",
    desc: "3D Secure ve tokenizasyon altyapısı ile korunan ödeme işlemleri.",
    icon: ShieldCheck,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    features: ["3D Secure", "Tokenizasyon", "Gerçek zamanlı izleme"],
  },
];

function TransferCard({
  service,
}: {
  service: (typeof transferServices)[number];
}) {
  const Icon = service.icon;
  const isLink = service.href !== "#";

  const content = (
    <>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        <div
          className={`w-12 h-12 ${service.bgColor} ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-text-dark-primary mb-2">
          {service.title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-text-dark-secondary mb-4">
          {service.desc}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {service.features.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-surface-dark-secondary rounded-md text-xs font-medium text-gray-600 dark:text-text-dark-muted"
            >
              <Sparkles className="w-3 h-3 text-secondary" />
              {feat}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center text-sm font-medium text-secondary group-hover:gap-2 transition-all">
          <span>Hemen Dene</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </>
  );

  if (isLink) {
    return (
      <Link
        href={service.href}
        className="group relative bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 hover:shadow-lg hover:border-secondary/30 transition-all duration-300 block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-6 opacity-60 cursor-not-allowed">
      {content}
    </div>
  );
}

function TransfersContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
            Para Transferi
          </h1>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Hızlı ve güvenli para transferi işlemlerinizi yönetin
          </p>
        </div>
      </div>

      {/* Transfer Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transferServices.map((service) => (
          <TransferCard key={service.id} service={service} />
        ))}
      </div>

      {/* Quick Transfer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Kendi Hesabıma", href: "/dashboard/transfers/fast", icon: ArrowLeftRight, color: "text-blue-500" },
              { label: "Başka Hesaba", href: "/dashboard/transfers/eft", icon: ArrowLeftRight, color: "text-purple-500" },
              { label: "IBAN ile", href: "/dashboard/transfers/iban", icon: QrCode, color: "text-indigo-500" },
              { label: "QR ile Gönder", href: "/dashboard/transfers/iban", icon: QrCode, color: "text-emerald-500" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-surface-dark-secondary hover:bg-secondary/5 hover:border-secondary/30 border border-gray-200 dark:border-border-dark transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-lg ${item.color} bg-current/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-text-dark-muted">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransfersPage() {
  return (
    <ErrorBoundary>
      <TransfersContent />
    </ErrorBoundary>
  );
}
