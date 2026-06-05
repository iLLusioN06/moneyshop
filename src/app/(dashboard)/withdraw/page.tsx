"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { Banknote, Landmark, QrCode, CreditCard, ArrowLeft } from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

const withdrawOptions = [
  {
    id: "iban",
    title: t("withdraw.iban"),
    description: "Hesabınızdaki parayı istediğiniz IBAN numarasına havale/EFT ile gönderin.",
    icon: Landmark,
    color: "text-loss",
    bgColor: "bg-loss/10",
  },
  {
    id: "qr",
    title: t("withdraw.qr"),
    description: "ATM'lerde QR kod okutarak hesabınızdan para çekin.",
    icon: QrCode,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "card",
    title: t("withdraw.card"),
    description: "MoneyShop Card ile anında nakit çekim işlemi yapın.",
    icon: CreditCard,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

function IbanWithdraw({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-loss" />
            </div>
            <div>
              <CardTitle>IBAN ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                Hesabınızdaki parayı istediğiniz IBAN numarasına gönderin.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <Landmark className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              IBAN ile Para Çekme
            </h3>
            <p className="text-sm text-text-muted max-w-sm">
              Bu özellik yakında kullanıma sunulacaktır. IBAN numarasına para
              gönderme işlemlerinizi buradan gerçekleştirebileceksiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QrWithdraw({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <CardTitle>QR ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                ATM'lerde QR kod okutarak hesabınızdan para çekin.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              QR ile Para Çekme
            </h3>
            <p className="text-sm text-text-muted max-w-sm">
              Bu özellik yakında kullanıma sunulacaktır. ATM'lerden QR kod
              kullanarak para çekme işlemlerinizi buradan gerçekleştirebileceksiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CardWithdraw({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle>MoneyShop Card ile Para Çek</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                MoneyShop Card ile anında nakit çekim işlemi yapın.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              MoneyShop Card ile Para Çekme
            </h3>
            <p className="text-sm text-text-muted max-w-sm">
              Bu özellik yakında kullanıma sunulacaktır. MoneyShop Card ile
              nakit çekim işlemlerinizi buradan gerçekleştirebileceksiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WithdrawSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-loss" />
          </div>
          <div>
            <CardTitle>{t("withdraw.title")}</CardTitle>
            <p className="text-sm text-text-muted mt-0.5">
              {t("withdraw.selectMethod")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {withdrawOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border hover:border-secondary/30 hover:bg-surface-secondary/80 transition-all duration-200 text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary">{option.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{option.description}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function WithdrawContent() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const handleBack = () => setSelectedOption(null);

  if (selectedOption === "iban") return <IbanWithdraw onBack={handleBack} />;
  if (selectedOption === "qr") return <QrWithdraw onBack={handleBack} />;
  if (selectedOption === "card") return <CardWithdraw onBack={handleBack} />;

  return <WithdrawSelection onSelect={setSelectedOption} />;
}

export default function WithdrawPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ErrorBoundary>
        <WithdrawContent />
      </ErrorBoundary>
    </div>
  );
}
