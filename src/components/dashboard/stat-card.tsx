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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-text-muted font-medium">{title}</p>
          <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(value, currency)}
          </p>
          {change !== 0 && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-profit" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss" />
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
