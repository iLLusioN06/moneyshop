"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, Bolt, ArrowRight, Copy, Check, Clock } from "lucide-react";
import Link from "next/link";

export default function FastTransferPage() {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <Bolt className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
              FAST Para Transferi
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            7/24 anında para transferi — saniyeler içinde gönderin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Yeni FAST Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Alıcı Adı veya IBAN
                </label>
                <Input
                  placeholder="IBAN veya kullanıcı adı girin"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Tutar (IQD)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Açıklama (İsteğe Bağlı)
                </label>
                <Input placeholder="Açıklama girin..." />
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Bolt className="w-4 h-4 mr-2" />
                FAST Gönder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Limitler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-text-dark-muted">Minimum</span>
                <span className="font-medium">1.000 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-text-dark-muted">Maksimum</span>
                <span className="font-medium">50.000 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-text-dark-muted">Komisyon</span>
                <span className="font-medium text-emerald-500">Ücretsiz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-text-dark-muted">İşlem Süresi</span>
                <span className="font-medium text-emerald-500">Anında</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-text-dark-muted">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-sm">Henüz işlem yok</p>
              </div>
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
               <CardTitle>Hesap Bilgilerin</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <label className="block text-xs text-gray-500 dark:text-text-dark-muted mb-1">IBAN</label>
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-gray-900 dark:text-text-dark-primary font-mono">
                       IQ12 3456 7890 1234 5678 901
                     </span>
                     <button
                       onClick={() => handleCopy("IQ12 3456 7890 1234 5678 901")}
                       className="p-1 hover:bg-gray-100 dark:hover:bg-surface-dark-secondary rounded transition-colors"
                     >
                       {copied ? (
                         <Check className="w-4 h-4 text-emerald-500" />
                       ) : (
                         <Copy className="w-4 h-4 text-gray-400" />
                       )}
                     </button>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs text-gray-500 dark:text-text-dark-muted mb-1">Adres Adı</label>
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-gray-900 dark:text-text-dark-primary font-mono">
                       moneyshop.admin
                     </span>
                     <button
                       onClick={() => handleCopy("moneyshop.admin")}
                       className="p-1 hover:bg-gray-100 dark:hover:bg-surface-dark-secondary rounded transition-colors"
                     >
                       {copied ? (
                         <Check className="w-4 h-4 text-emerald-500" />
                       ) : (
                         <Copy className="w-4 h-4 text-gray-400" />
                       )}
                     </button>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
