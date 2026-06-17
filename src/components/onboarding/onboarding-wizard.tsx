"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  User,
  Wallet,
  Globe,
  Palette,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  CreditCard,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface OnboardingData {
  name: string;
  currency: string;
  theme: "light" | "dark" | "system";
  accounts: string[];
}

const STEPS = [
  { id: "welcome", icon: Rocket },
  { id: "profile", icon: User },
  { id: "currency", icon: Globe },
  { id: "theme", icon: Palette },
  { id: "complete", icon: Sparkles },
];

const CURRENCIES = [
  { code: "TRY", name: "Türk Lirası", symbol: "₺" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "IQD", name: "Irak Dinarı", symbol: "IQD" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

const THEMES = [
  { id: "light" as const, label: "Açık", icon: "☀️" },
  { id: "dark" as const, label: "Koyu", icon: "🌙" },
  { id: "system" as const, label: "Sistem", icon: "💻" },
];

const QUICK_ACCOUNTS = [
  { id: "checking", name: "Vadesiz Hesap", icon: Wallet, color: "text-secondary" },
  { id: "savings", name: "Birikim Hesabı", icon: PiggyBank, color: "text-profit" },
  { id: "credit", name: "Kredi Kartı", icon: CreditCard, color: "text-loss" },
  { id: "investment", name: "Yatırım", icon: BarChart3, color: "text-info" },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    currency: "TRY",
    theme: "system",
    accounts: ["checking"],
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length >= 2;
      case 2:
        return data.currency.length > 0;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    // Save onboarding data
    localStorage.setItem("moneyshop-onboarding", JSON.stringify(data));
    localStorage.setItem("moneyshop-onboarding-completed", "true");

    // Apply theme
    document.documentElement.classList.toggle("dark", data.theme === "dark");

    onComplete();
  };

  const toggleAccount = (accountId: string) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(accountId)
        ? prev.accounts.filter((a) => a !== accountId)
        : [...prev.accounts, accountId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-secondary/10 via-surface to-accent/5 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-8 bg-secondary"
                  : i < currentStep
                  ? "w-4 bg-secondary/50"
                  : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
          <div
            className={`transition-all duration-300 ${
              isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            }`}
          >
            {/* Step Content */}
            <div className="p-8">
              {/* Welcome */}
              {currentStep === 0 && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-10 h-10 text-secondary" />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {t("onboarding.welcome")}
                  </h1>
                  <p className="text-text-muted mb-6">
                    {t("onboarding.welcomeDesc")}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-surface-secondary">
                      <Wallet className="w-6 h-6 text-secondary mx-auto mb-2" />
                      <p className="text-xs font-medium text-text-primary">{t("onboarding.trackFinances")}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-secondary">
                      <PiggyBank className="w-6 h-6 text-profit mx-auto mb-2" />
                      <p className="text-xs font-medium text-text-primary">{t("onboarding.setGoals")}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-secondary">
                      <BarChart3 className="w-6 h-6 text-info mx-auto mb-2" />
                      <p className="text-xs font-medium text-text-primary">{t("onboarding.analyzeSpending")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile */}
              {currentStep === 1 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                      {t("onboarding.profileSetup")}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {t("onboarding.profileSetupDesc")}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        {t("onboarding.name")}
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder={t("onboarding.namePlaceholder")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Currency */}
              {currentStep === 2 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                      {t("onboarding.selectCurrency")}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {t("onboarding.selectCurrencyDesc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {CURRENCIES.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => setData((prev) => ({ ...prev, currency: currency.code }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          data.currency === currency.code
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{currency.symbol}</span>
                        <span className="text-sm font-medium text-text-primary">{currency.code}</span>
                        <span className="text-xs text-text-muted block">{currency.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Theme */}
              {currentStep === 3 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-8 h-8 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">
                      {t("onboarding.selectTheme")}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {t("onboarding.selectThemeDesc")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setData((prev) => ({ ...prev, theme: theme.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          data.theme === theme.id
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <span className="text-3xl mb-2 block">{theme.icon}</span>
                        <span className="text-sm font-medium text-text-primary">{theme.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Quick Accounts */}
                  <div className="mt-6">
                    <p className="text-sm font-medium text-text-primary mb-3">
                      {t("onboarding.quickAccounts")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_ACCOUNTS.map((account) => {
                        const Icon = account.icon;
                        return (
                          <button
                            key={account.id}
                            onClick={() => toggleAccount(account.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                              data.accounts.includes(account.id)
                                ? "border-secondary bg-secondary/5"
                                : "border-border"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${account.color}`} />
                            <span className="text-xs font-medium text-text-primary">{account.name}</span>
                            {data.accounts.includes(account.id) && (
                              <Check className="w-3 h-3 text-secondary ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Complete */}
              {currentStep === 4 && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-profit/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-profit" />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {t("onboarding.ready")}
                  </h1>
                  <p className="text-text-muted mb-6">
                    {t("onboarding.readyDesc")}
                  </p>
                  <div className="p-4 rounded-xl bg-surface-secondary text-left">
                    <p className="text-sm font-medium text-text-primary mb-2">{t("onboarding.summary")}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-muted">{t("onboarding.name")}:</span>
                        <span className="text-text-primary">{data.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">{t("onboarding.currency")}:</span>
                        <span className="text-text-primary">{data.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">{t("onboarding.theme")}:</span>
                        <span className="text-text-primary">{THEMES.find((t) => t.id === data.theme)?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-8 pb-8">
              <div className="flex items-center justify-between">
                {currentStep > 0 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("onboarding.back")}
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === STEPS.length - 1 ? (
                    <>
                      {t("onboarding.start")}
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {t("onboarding.next")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Skip */}
        {currentStep < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {t("onboarding.skip")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
