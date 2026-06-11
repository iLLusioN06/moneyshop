"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, Globe, MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const countries = [
  "Türkiye",
  "ABD",
  "Almanya",
  "Fransa",
  "İngiltere",
  "Hollanda",
  "Belçika",
  "Avusturya",
];

const currencies = [
  { code: "USD", name: "ABD Doları", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Sterlin", symbol: "£" },
  { code: "TRY", name: "Türk Lirası", symbol: "₺" },
];

export default function InternationalPage() {
  const [amount, setAmount] = useState("");
  const [country, setCountry] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/transfers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
              Yurt Dışından Para Al
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Dünyanın her yerinden para almanın en kolay yolu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Para Alma Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-lg p-4 flex items-start gap-3">
                <Globe className="w-5 h-5 text-sky-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sky-800 dark:text-sky-300">IBAN'ını paylaş, dünyadan para al</p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                    Gönderen kişiye aşağıdaki IBAN bilgilerini iletmen yeterli.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-surface-dark-secondary rounded-lg p-4 space-y-2">
                <label className="text-xs text-gray-500 dark:text-text-dark-muted">Senin IBAN'ın</label>
                <p className="text-sm font-mono font-medium text-gray-900 dark:text-text-dark-primary">
                  IQ12 3456 7890 1234 5678 901
                </p>
                <label className="text-xs text-gray-500 dark:text-text-dark-muted mt-2">Banka Adı</label>
                <p className="text-sm font-medium text-gray-900 dark:text-text-dark-primary">
                  MoneyShop Finansal Hizmetler A.Ş.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                    Gönderen Ülke
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-900 dark:text-text-dark-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Ülke seçin</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                    Para Birimi
                  </label>
                  <select className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-900 dark:text-text-dark-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50">
                    <option value="">Birim seçin</option>
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Beklenen Tutar
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button className="w-full bg-sky-500 hover:bg-sky-600">
                <Globe className="w-4 h-4 mr-2" />
                Havaleyi Bekliyorum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Döviz Kurları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { cur: "USD", rate: "1.310", change: "+0,2" },
                { cur: "EUR", rate: "1.420", change: "-0,1" },
                { cur: "GBP", rate: "1.650", change: "+0,3" },
                { cur: "TRY", rate: "0,038", change: "+0,5" },
              ].map((item) => (
                <div key={item.cur} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.cur}</span>
                  <span className="text-gray-900 dark:text-text-dark-primary">{item.rate} IQD</span>
                  <span className={item.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}>
                    {item.change}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Gelen Transferler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-sm">Henüz transfer yok</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
