import { Card, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { t } from "@/lib/dashboard-i18n";

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  currency: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export function StatCard({
  title,
  value,
  change,
  currency,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
            <Icon className={`w-5 h-5 ${color} group-hover:rotate-3 transition-transform duration-300`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-text-primary tracking-tight animate-[count-in_0.6s_ease-out]">
            {formatCurrency(value, currency)}
          </p>
          {change !== 0 && (
            <div className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform duration-200">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-profit group-hover:-translate-y-0.5 transition-transform duration-200" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss group-hover:translate-y-0.5 transition-transform duration-200" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-profit" : "text-loss"}`}>
                %{Math.abs(change).toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">{t("dash.vsLastMonth")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
