import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";
import { Plus, RefreshCw, Globe } from "lucide-react";
import type { AccountWithConversion } from "@/hooks/use-dashboard";

interface AccountsOverviewProps {
  accounts: AccountWithConversion[];
  baseCurrency: string;
  exchangeRates: Record<string, number>;
  onRefreshRates?: () => void;
  isRefreshing?: boolean;
}

export function AccountsOverview({
  accounts,
  baseCurrency,
  exchangeRates,
  onRefreshRates,
  isRefreshing,
}: AccountsOverviewProps) {
  const router = useRouter();

  // Toplamı baseCurrency cinsinden hesapla
  const totalConverted = accounts.reduce(
    (sum, acc) => sum + acc.convertedBalance,
    0
  );

  const rateCount = Object.keys(exchangeRates).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dash.accounts")}</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              {t("dash.accountsSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefreshRates && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshRates}
                disabled={isRefreshing}
                title="Kurları güncelle"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/accounts")}
            >
              <Plus className="w-4 h-4" />
              {t("dash.addAccount")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Converted Total */}
        <div className="flex items-center justify-between p-4 mb-4 rounded-xl bg-gradient-to-r from-secondary/5 to-transparent border border-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">
                Toplam (Hepsi {baseCurrency})
              </p>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(totalConverted, baseCurrency)}
              </p>
            </div>
          </div>
          {rateCount > 0 && (
            <span className="text-xs text-text-muted">
              {rateCount} kur
            </span>
          )}
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const isDifferentCurrency = account.originalCurrency !== baseCurrency;
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: account.color || "#3b82f6" }}
                  >
                    {account.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {account.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {account.type === "CREDIT_CARD"
                        ? t("dash.debt")
                        : t("dash.balance")}
                      {isDifferentCurrency && (
                        <span className="ml-1.5 text-secondary">
                          {account.originalCurrency}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      account.convertedBalance >= 0
                        ? "text-text-primary"
                        : "text-loss"
                    }`}
                  >
                    {formatCurrency(account.convertedBalance, baseCurrency)}
                  </p>
                  {isDifferentCurrency && (
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {formatCurrency(account.originalBalance, account.originalCurrency)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-8 text-sm text-text-muted">
            Henüz hesap bulunmuyor
          </div>
        )}
      </CardContent>
    </Card>
  );
}
