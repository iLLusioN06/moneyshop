"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, HandCoins, Link2, Copy, Check, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function RequestPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreateLink = () => {
    if (!amount) return;
    const link = `https://moneyshop.iq/pay/request/${Date.now()}`;
    setCreatedLink(link);
  };

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
              <HandCoins className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
              Ödeme İste
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Müşterilerinizden veya iş ortaklarınızdan tek tıkla ödeme isteyin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Talebi Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Talep Tutarı (IQD)
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
                  Açıklama
                </label>
                <Input
                  placeholder="Ne için ödeme istiyorsunuz? (örn: Fatura #001)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleCreateLink}
                disabled={!amount}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Ödeme Linki Oluştur
              </Button>

              {createdLink && (
                <div className="bg-gray-50 dark:bg-surface-dark-secondary rounded-lg p-4 space-y-2">
                  <label className="text-xs text-gray-500 dark:text-text-dark-muted">
                    Ödeme Linkin Hazır
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-gray-900 dark:text-text-dark-primary bg-white dark:bg-surface-dark px-3 py-2 rounded border border-gray-200 dark:border-border-dark truncate">
                      {createdLink}
                    </code>
                    <button
                      onClick={() => handleCopy(createdLink)}
                      className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1">
                    Kopyala
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                    WhatsApp'ta Gönder
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                    E-Posta ile Gönder
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Talepler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["250 IQD", "500 IQD", "1.000 IQD", "5.000 IQD"].map((t) => (
                <button
                  key={t}
                  onClick={() => setAmount(t.replace(/[^0-9]/g, ""))}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-surface-dark-secondary transition-colors"
                >
                  {t}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Clock className="w-8 h-8 mb-2" />
                <p className="text-sm">Henüz talep yok</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kayıtlı Alıcılar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-sm">Henüz alıcı eklenmemiş</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
