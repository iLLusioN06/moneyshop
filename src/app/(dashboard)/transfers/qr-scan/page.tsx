"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, Scan, QrCode } from "lucide-react";
import Link from "next/link";
import { QrScanner } from "@/components/qr";
import { type QrTransferData } from "@/lib/qr";

export default function QrScanPage() {
  const [scannedData, setScannedData] = useState<QrTransferData | null>(null);

  const handleScan = (data: QrTransferData) => {
    setScannedData(data);
    // QR okunduktan sonra transfer formuna yönlendir
    const params = new URLSearchParams({
      iban: data.iban,
      name: data.name,
    });
    if (data.amount) params.set("amount", String(data.amount));
    if (data.currency) params.set("currency", data.currency);
    if (data.description) params.set("description", data.description);

    setTimeout(() => {
      window.location.href = `/transfers/fast?${params.toString()}`;
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/transfers"
          className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              QR Kod ile Para Gönder
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            QR kodu okutarak hızlı para transferi yapın
          </p>
        </div>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              QR Kod Tara
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scannedData ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-profit/10 text-profit rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  QR Kod Okundu!
                </p>
                <p className="text-sm text-text-muted mt-1">
                  {scannedData.name} için transfer sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
              <div className="bg-surface-secondary rounded-lg p-4 text-left max-w-sm mx-auto space-y-1">
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Alıcı:</span> {scannedData.name}
                </p>
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">IBAN:</span> {scannedData.iban}
                </p>
                {scannedData.amount && (
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-text-primary">Tutar:</span> {scannedData.amount} {scannedData.currency || ""}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <QrScanner onScan={handleScan} />
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Nasıl Çalışır?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Kamerayı Aç",
                desc: "Sayfadaki 'Tara' butonuna basarak kamerayı başlatın.",
              },
              {
                step: "2",
                title: "QR Kodu Okut",
                desc: "Göndereceğiniz kişinin QR kodunu kameraya hizalayın.",
              },
              {
                step: "3",
                title: "Gönder",
                desc: "Tutarı girip onaylayın. Para anında hesabına ulaşsın.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
