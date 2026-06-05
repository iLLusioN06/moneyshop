"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, QrCode, Copy, Check, Share2, Plus } from "lucide-react";
import Link from "next/link";

export default function IbanPage() {
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/transfers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-dark-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
              MoneyShop IBAN & Kolay Adres
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Size özel IBAN ve kolay adresinizle para transferlerini zahmetsiz hale getirin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IBAN Card */}
        <Card>
          <CardHeader>
            <CardTitle>MoneyShop IBAN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium opacity-80">MoneyShop Finansal Hizmetler</span>
                <span className="text-xs font-medium opacity-80">Vadesiz Hesap</span>
              </div>
              <div className="mb-4">
                <p className="text-xs opacity-80 mb-1">IBAN</p>
                <p className="text-lg font-mono font-bold tracking-wider">IQ12 3456 7890 1234 5678 901</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80 mb-1">Para Birimi</p>
                  <p className="text-sm font-semibold">IQD - Irak Dinarı</p>
                </div>
                <button
                  onClick={() => handleCopy("IQ12 3456 7890 1234 5678 901", setCopiedIban)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                >
                  {copiedIban ? (
                    <><Check className="w-3.5 h-3.5" /> Kopyalandı</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Kopyala</>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleCopy("IQ12 3456 7890 1234 5678 901", setCopiedIban)}>
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
              <Button variant="outline" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Hesap Ekle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kolay Adres Card */}
        <Card>
          <CardHeader>
            <CardTitle>Kolay Adres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-surface-dark-secondary rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-text-dark-primary mb-1">
                Kolay Adresin
              </p>
              <p className="text-2xl font-bold text-indigo-500 font-mono mb-3">
                @moneyshop.admin
              </p>
              <p className="text-xs text-gray-500 dark:text-text-dark-muted mb-4">
                Bu adresi paylaşarak IBAN girmeden para alabilirsiniz
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600"
                  onClick={() => handleCopy("@moneyshop.admin", setCopiedAddress)}
                >
                  {copiedAddress ? (
                    <><Check className="w-4 h-4 mr-2" /> Kopyalandı</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Adresi Kopyala</>
                  )}
                </Button>
                <Button variant="outline" className="px-3">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-text-dark-primary">Nasıl Çalışır?</h4>
              {[
                "Kolay adresini gönderecek kişiyle paylaş",
                "Gönderen MoneyShop uygulamasından adresine gönderir",
                "Para anında hesabına yansır — IBAN gerekmez",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-text-dark-secondary">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>QR Kod ile Gönderim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-white rounded-xl border-2 border-gray-200 dark:border-border-dark flex items-center justify-center flex-shrink-0">
              <QrCode className="w-20 h-20 text-gray-900" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-text-dark-primary mb-1">
                QR Kodunu Paylaş
              </p>
              <p className="text-sm text-gray-500 dark:text-text-dark-muted mb-3">
                Gönderen kişi bu QR kodu okutarak anında para gönderebilir.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
