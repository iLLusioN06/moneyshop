import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";
import { Plus } from "lucide-react";
import type { FinancialAccount } from "@/types";

interface AccountsOverviewProps {
  accounts: FinancialAccount[];
}

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dash.accounts")}</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              {t("dash.accountsSubtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/accounts")}
          >
            <Plus className="w-4 h-4" />
            {t("dash.addAccount")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-secondary/30 hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
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
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold ${
                  account.balance >= 0 ? "text-text-primary" : "text-loss"
                }`}
              >
                {formatCurrency(account.balance, account.currency)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
