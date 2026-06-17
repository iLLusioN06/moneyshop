"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  TrendingUp,
  Shield,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

interface HealthBreakdown {
  score: number;
  value: number;
  label: string;
}

interface HealthScoreData {
  overall: number;
  breakdown: {
    savingsRate: HealthBreakdown;
    budgetAdherence: HealthBreakdown;
    emergencyFund: HealthBreakdown;
    transactionConsistency: HealthBreakdown;
    accountDiversity: HealthBreakdown;
  };
  tips: string[];
}

interface HealthScoreProps {
  t: (key: string) => string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-profit";
  if (score >= 40) return "text-secondary";
  return "text-loss";
}

function getScoreBgColor(score: number): string {
  if (score >= 70) return "bg-profit";
  if (score >= 40) return "bg-secondary";
  return "bg-loss";
}

export default function HealthScore({ t }: HealthScoreProps) {
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthScore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/financial-health");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Veri alınamadı");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchHealthScore();
    }, 0);
  }, [fetchHealthScore]);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-tertiary" />
          <div className="h-5 w-40 bg-surface-tertiary rounded" />
        </div>
        <div className="h-24 w-full bg-surface-tertiary rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-text-muted" />
          <h3 className="font-semibold text-text-primary">{t("health.title")}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />
          <span>{error || t("health.error")}</span>
        </div>
      </div>
    );
  }

  const overallColor = getScoreColor(data.overall);

  return (
    <div className="rounded-xl bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${getScoreBgColor(data.overall)}/10 flex items-center justify-center`}>
            <Heart className={`w-5 h-5 ${overallColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{t("health.title")}</h3>
            <p className="text-xs text-text-muted">{t("health.subtitle")}</p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${overallColor}`}>{data.overall}</div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.overall / 100)}`}
              strokeLinecap="round"
              className={overallColor}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${overallColor}`}>{data.overall}</span>
            <span className="text-xs text-text-muted">/100</span>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <BreakdownItem
          icon={<TrendingUp className="w-4 h-4" />}
          label={t("health.savingsRate")}
          score={data.breakdown.savingsRate.score}
          detail={`%${Math.round(data.breakdown.savingsRate.value)}`}
          status={data.breakdown.savingsRate.label}
        />
        <BreakdownItem
          icon={<Shield className="w-4 h-4" />}
          label={t("health.budgetAdherence")}
          score={data.breakdown.budgetAdherence.score}
          detail={`%${Math.round(data.breakdown.budgetAdherence.value)}`}
          status={data.breakdown.budgetAdherence.label}
        />
        <BreakdownItem
          icon={<Clock className="w-4 h-4" />}
          label={t("health.emergencyFund")}
          score={data.breakdown.emergencyFund.score}
          detail={`${data.breakdown.emergencyFund.value.toFixed(1)} ${t("health.months")}`}
          status={data.breakdown.emergencyFund.label}
        />
        <BreakdownItem
          icon={<Layers className="w-4 h-4" />}
          label={t("health.consistency")}
          score={data.breakdown.transactionConsistency.score}
          detail={`${data.breakdown.transactionConsistency.value} ${t("health.days")}`}
          status={data.breakdown.transactionConsistency.label}
        />
      </div>

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-text-primary">{t("health.tips")}</span>
          </div>
          <ul className="space-y-1">
            {data.tips.map((tip, i) => (
              <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 text-secondary flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BreakdownItem({
  icon,
  label,
  score,
  detail,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  detail: string;
  status: string;
}) {
  const color = getScoreColor(score);
  const bgColor = getScoreBgColor(score);

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${bgColor}/10 flex items-center justify-center flex-shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-primary truncate">{label}</span>
          <span className="text-xs text-text-muted ml-2">{detail}</span>
        </div>
        <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full ${bgColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>
      <span className={`text-xs font-medium ${color} ml-2`}>{status}</span>
    </div>
  );
}
