"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ArrowLeft, ArrowLeftRight, Building2, Clock } from "lucide-react";
import Link from "next/link";
import "@/app/landing.css";

const banks = [
  "Ziraat Bankası",
  "İş Bankası",
  "Garanti BBVA",
  "Akbank",
  "Yapı Kredi",
  "VakıfBank",
  "Halkbank",
  "QNB Finansbank",
];

const eftSlidePages = [
  {
    panelTitle: "FAST Para Transferi",
    panelDescription: "7/24 anında para transferi. Saniyeler içinde gönderin, hemen ulaşsın. Tüm bankalar arası kesintisiz ve ücretsiz transfer.",
    phoneTitle: "FAST Para Transferi",
    phoneDescription: "Fast ile yapmak istediğiniz işlemi seçiniz.",
    items: [
      { icon: "fas fa-qrcode", label: "Fast QR Kod ile Öde" },
      { icon: "fas fa-paper-plane", label: "Para Gönder" },
      { icon: "fas fa-qrcode", label: "Fast QR Kod Oluştur" },
      { icon: "fas fa-address-card", label: "Kolay Adres Yönetimi" },
      { icon: "fas fa-shield-alt", label: "Güvenli Ödeme İşlemi" },
    ],
  },
  {
    panelTitle: "En hızlı şekilde para transferi!",
    panelDescription: "MoneyShop hesabından tüm banka ve MoneyShop hesaplarına FAST limiti olan 400.000 TL’ye kadar transfer yap, tutar saniyeler içinde alıcı hesabına geçsin.",
    phoneTitle: "Hızlı İşlemler",
    phoneDescription: "Favori transferlerinize hızlıca erişin.",
    items: [
      { icon: "fas fa-star", label: "Favori Kişiler" },
      { icon: "fas fa-clock", label: "Son İşlemler" },
      { icon: "fas fa-wallet", label: "Bakiye Kontrolü" },
      { icon: "fas fa-user-friends", label: "Kişiler" },
      { icon: "fas fa-credit-card", label: "Kart Bilgileri" },
    ],
  },
  {
    panelTitle: "FAST ile 7/24 para gönder",
    panelDescription: "Para göndereceğin hesabın hangi bankada olduğu fark etmez. FAST ile para gönderme işlemlerini mesai saatlerine takılmadan haftanın her günü yap.",
    phoneTitle: "Hesap Takibi",
    phoneDescription: "Hesabınızın durumunu anlık takip edin.",
    items: [
      { icon: "fas fa-chart-line", label: "Bakiye Grafiği" },
      { icon: "fas fa-file-invoice-dollar", label: "Fatura Ödemeleri" },
      { icon: "fas fa-exchange-alt", label: "Ayarlar" },
      { icon: "fas fa-bell", label: "Bildirimler" },
      { icon: "fas fa-user-shield", label: "Güvenlik Ayarları" },
    ],
  },
  {
    panelTitle: "Detaylarda kaybolma",
    panelDescription: "Bir ödeme son anda aklına geldiğinde veya arkadaşının acil nakit ihtiyacı olduğunda, saniyeler içinde para gönder. MoneyShop kullanıcılarına rehberinde kayıtlı telefon numaraları veya MoneyShop numaralarıyla; MoneyShop'lu olmayan kişilere Kolay Adres’e tanımlı bilgileri veya IBAN numaraları üzerinden FAST ile para transferi yap.",
    phoneTitle: "Güvenlik",
    phoneDescription: "Hesabınızı daha güvenli hale getirin.",
    items: [
      { icon: "fas fa-lock", label: "2FA Ayarları" },
      { icon: "fas fa-shield-alt", label: "Kara Liste" },
      { icon: "fas fa-id-card", label: "Kimlik Doğrulama" },
      { icon: "fas fa-key", label: "Şifre Değiştir" },
      { icon: "fas fa-user-secret", label: "Gizlilik" },
    ],
  },
];

export default function EftTransferPage() {
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [eftSlideIndex, setEftSlideIndex] = useState(0);
  const currentEftSlide = eftSlidePages[eftSlideIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEftSlideIndex((prev) => (prev + 1) % eftSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="landing-page space-y-6">
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
            <div className="w-8 h-8 bg-cyan-500/10 text-cyan-500 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-dark-primary">
              Havale & EFT
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Tüm bankalara güvenli havale ve EFT gönderimi
          </p>
        </div>
      </div>

      <div className="service-detail">
        <div className="service-detail-fast-layout">
          <div className="service-detail-fast-info">
            <div className="service-detail-header">
              <div className="service-icon teal large-icon">
                <i className="fas fa-bolt" />
              </div>
              <h2>{currentEftSlide.panelTitle}</h2>
            </div>
            <p className="service-detail-desc">{currentEftSlide.panelDescription}</p>
            {eftSlideIndex === 0 && (
              <Link href="/register" className="btn-primary service-fast-cta">
                Hemen Başvur <i className="fas fa-arrow-right" />
              </Link>
            )}
          </div>
          <div className="service-detail-fast-phone">
            <div className="features-phone phone-16pro">
              <div className="phone-side-buttons">
                <div className="phone-btn phone-btn-vol-up" />
                <div className="phone-btn phone-btn-vol-down" />
                <div className="phone-btn phone-btn-action" />
                <div className="phone-btn phone-btn-power" />
              </div>
              <div className="phone-screen">
                <div className="phone-dynamic-island" />
                <div className="phone-fast-topbar">
                  <div className="phone-fast-logo">
                    <i className="fas fa-wallet" />
                    <span>MoneyShop</span>
                  </div>
                  <div className="phone-fast-avatar">
                    <i className="fas fa-user-circle" />
                    <div className="phone-fast-account text-right text-[10px]">
                      <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                      <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                    </div>
                  </div>
                </div>
                <div className="phone-fast-header">
                  <i className="fas fa-bolt" />
                  FAST Para Transferi
                </div>
                <div className="phone-fast-sub">
                  Fast ile yapmak istediğiniz işlemi seçiniz.
                </div>
                <div className="phone-fast-menu">
                  {currentEftSlide.items.map((item, idx) => (
                    <div key={idx} className="phone-fast-menu-item">
                      <i className={item.icon} />
                      <span>{item.label}</span>
                      <i className="fas fa-chevron-right" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="phone-fast-slider phone-fast-slider-dots-only">
          <div className="phone-fast-slider-dots">
            {Array.from({ length: eftSlidePages.length }).map((_, index) => (
              <span
                key={index}
                className={index === eftSlideIndex ? "active" : ""}
                onClick={() => setEftSlideIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Havale/EFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Alıcı Banka
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-900 dark:text-text-dark-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">Banka seçin</option>
                  {banks.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Alıcı IBAN
                </label>
                <Input
                  placeholder="TR00 0000 0000 0000 0000 0000"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                    Alıcı Adı
                  </label>
                  <Input placeholder="Ad Soyad" />
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-dark-secondary mb-1">
                  Açıklama
                </label>
                <Input placeholder="Açıklama girin..." />
              </div>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Gönder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Limitler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Minimum</span>
                <span className="font-medium">100 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maksimum</span>
                <span className="font-medium">250.000 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ücret</span>
                <span className="font-medium">5 IQD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Süre</span>
                <span className="font-medium">~15 dk</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sık Kullanılanlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Building2 className="w-8 h-8 mb-2" />
                <p className="text-sm">Henüz kayıtlı alıcı yok</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
