import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { t, tWithVars } from "@/lib/dashboard-i18n";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxVal =
    data.length > 0
      ? Math.max(...data.map((d) => Math.max(d.income, d.expense)))
      : 1;

  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("dash.monthlyChart")}</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              {t("dash.chartSubtitle")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-text-muted">
            {t("dash.noData")}
          </div>
        ) : (
          <>
            <div className="h-64 flex items-end gap-2">
              {data.map((d, idx) => {
                const incomeHeight = (d.income / maxVal) * 100;
                const expenseHeight = (d.expense / maxVal) * 100;
                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div className="w-full flex flex-col items-center gap-0.5 relative h-56 justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-primary text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 shadow-lg scale-95 group-hover:scale-100 origin-bottom">
                        {tWithVars("dash.incomeExpense", {
                          income: formatCurrency(d.income),
                          expense: formatCurrency(d.expense),
                        })}
                      </div>
                      {/* Income Bar */}
                      <div
                        className="w-full max-w-[40px] rounded-t-md bg-profit/80 hover:bg-profit hover:shadow-lg hover:shadow-profit/20 transition-all duration-300 cursor-pointer origin-bottom animate-[bar-grow_0.6s_ease-out]"
                        style={{
                          height: `${incomeHeight}%`,
                          animationDelay: `${idx * 0.06}s`,
                        }}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-full max-w-[40px] rounded-t-md bg-loss/80 hover:bg-loss hover:shadow-lg hover:shadow-loss/20 transition-all duration-300 cursor-pointer origin-bottom animate-[bar-grow_0.6s_ease-out]"
                        style={{
                          height: `${expenseHeight}%`,
                          animationDelay: `${idx * 0.06 + 0.15}s`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-muted font-medium group-hover:text-text-primary transition-colors duration-200">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border animate-[fade-in_0.5s_ease-out]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-profit" />
                <span className="text-sm text-text-secondary">
                  {t("dash.income")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-loss" />
                <span className="text-sm text-text-secondary">
                  {t("dash.expense")}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
