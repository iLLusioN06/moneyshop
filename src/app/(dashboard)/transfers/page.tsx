"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import Link from "next/link";
import {
  Bolt,
  ArrowLeftRight,
  Globe,
  QrCode,
  Scan,
  HandCoins,
  ArrowRight,
} from "lucide-react";

const transferServices = [
  { id: "fast", href: "/transfers/fast", title: "FAST Transferi", icon: Bolt, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "eft", href: "/transfers/eft", title: "Havale & EFT", icon: ArrowLeftRight, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  { id: "international", href: "/transfers/international", title: "Yurt Dışı Para Al", icon: Globe, color: "text-sky-500", bgColor: "bg-sky-500/10" },
  { id: "iban", href: "/transfers/iban", title: "IBAN & QR Kod", icon: QrCode, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  { id: "qr-scan", href: "/transfers/qr-scan", title: "QR ile Gönder", icon: Scan, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "request", href: "/transfers/request", title: "Ödeme İste", icon: HandCoins, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
];

function TransferCard({
  service,
}: {
  service: (typeof transferServices)[number];
}) {
  const Icon = service.icon;
  const isLink = service.href !== "#";

  const content = (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 ${service.bgColor} ${service.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-text-primary flex-1 truncate">
        {service.title}
      </span>
      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
    </div>
  );

  if (isLink) {
    return (
      <Link
        href={service.href}
        className="group bg-surface rounded-lg border border-border p-3 hover:shadow-md hover:border-secondary/30 transition-all duration-200 block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group bg-surface rounded-lg border border-border p-3 opacity-60 cursor-not-allowed">
      {content}
    </div>
  );
}

function TransfersContent() {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <h1 className="text-xl font-bold text-text-primary">Para Transferi</h1>

      {/* Transfer Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
        {transferServices.map((service) => (
          <TransferCard key={service.id} service={service} />
        ))}
      </div>

      {/* Quick Transfer Section */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Hızlı Transfer</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Kendi Hesabıma", href: "/transfers/fast", icon: ArrowLeftRight, color: "text-blue-500" },
              { label: "Başka Hesaba", href: "/transfers/eft", icon: ArrowLeftRight, color: "text-purple-500" },
              { label: "IBAN ile", href: "/transfers/iban", icon: QrCode, color: "text-indigo-500" },
              { label: "QR ile Gönder", href: "/transfers/qr-scan", icon: QrCode, color: "text-emerald-500" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-row items-center gap-2 p-2 rounded-lg bg-surface-secondary hover:bg-secondary/5 hover:border-secondary/30 border border-border transition-all duration-200 group"
                >
                  <div className={`w-7 h-7 rounded-lg ${item.color} bg-current/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className="text-xs font-medium text-text-secondary truncate">
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
