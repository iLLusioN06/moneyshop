import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/lib/dashboard-i18n";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  status: string;
  category?: { name: string } | null;
}

interface RecentTransactionsProps {
  transactions: TransactionItem[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>{t("dash.recentTransactions")}</CardTitle>
          <button
            onClick={() => router.push("/transactions")}
            className="text-sm text-secondary hover:text-secondary-dark transition-colors flex items-center gap-1"
          >
            {t("dash.viewAll")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            {t("dash.noTransactions")}
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx, idx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-tertiary hover:scale-[1.01] transition-all duration-200 cursor-pointer group animate-[slide-up_0.3s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.type === "INCOME" ? "bg-profit/10" : "bg-loss/10"
                    }`}
                  >
                    {tx.type === "INCOME" ? (
                      <ArrowUpRight className="w-4 h-4 text-profit" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-loss" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-text-muted">
                        {tx.category?.name || t("dash.noCategory")}
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">
                        {formatDate(new Date(tx.date), "relative")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "INCOME" ? "text-profit" : "text-loss"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <Badge
                    variant={tx.status === "COMPLETED" ? "success" : "warning"}
                  >
                    {tx.status === "COMPLETED"
                      ? t("dash.completed")
                      : t("dash.pending")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
