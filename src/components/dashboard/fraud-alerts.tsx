"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingUp,
  Clock,
  Zap,
  DollarSign,
  UserX,
  Loader2,
} from "lucide-react";

interface FraudAlert {
  id: string;
  type: "UNUSUAL_AMOUNT" | "RAPID_TRANSACTIONS" | "LATE_NIGHT" | "HIGH_VALUE" | "NEW_RECIPIENT";
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  transactionId?: string;
  amount?: number;
  createdAt: string;
}

interface FraudSummary {
  totalAlerts: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  todayTransactions: number;
  todayAmount: number;
}

interface FraudAlertsProps {
  t: (key: string) => string;
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "HIGH":
      return <AlertTriangle className="w-4 h-4" />;
    case "MEDIUM":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "HIGH":
      return "text-loss bg-loss/10 border-loss/20";
    case "MEDIUM":
      return "text-secondary bg-secondary/10 border-secondary/20";
    default:
      return "text-profit bg-profit/10 border-profit/20";
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "UNUSUAL_AMOUNT":
      return <DollarSign className="w-4 h-4" />;
    case "RAPID_TRANSACTIONS":
      return <Zap className="w-4 h-4" />;
    case "LATE_NIGHT":
      return <Clock className="w-4 h-4" />;
    case "HIGH_VALUE":
      return <TrendingUp className="w-4 h-4" />;
    case "NEW_RECIPIENT":
      return <UserX className="w-4 h-4" />;
    default:
      return <ShieldAlert className="w-4 h-4" />;
  }
}

export default function FraudAlerts({ t }: FraudAlertsProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [summary, setSummary] = useState<FraudSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFraudAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fraud-detection");
      const json = await res.json();
      if (json.success) {
        setAlerts(json.data.alerts);
        setSummary(json.data.summary);
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
      fetchFraudAlerts();
    }, 0);
  }, [fetchFraudAlerts]);

  if (loading) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-tertiary" />
          <div className="h-5 w-40 bg-surface-tertiary rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-tertiary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6">
        <div className="flex items-center gap-3 mb-3">
          <ShieldAlert className="w-5 h-5 text-text-muted" />
          <h3 className="font-semibold text-text-primary">{t("fraud.title")}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-loss">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-loss/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-loss" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{t("fraud.title")}</h3>
            <p className="text-xs text-text-muted">{t("fraud.subtitle")}</p>
          </div>
        </div>
        {summary && summary.totalAlerts > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-loss/10 text-loss">
            {summary.totalAlerts}
          </span>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-surface-secondary">
            <p className="text-lg font-bold text-loss">{summary.highSeverity}</p>
            <p className="text-xs text-text-muted">{t("fraud.high")}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface-secondary">
            <p className="text-lg font-bold text-secondary">{summary.mediumSeverity}</p>
            <p className="text-xs text-text-muted">{t("fraud.medium")}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-surface-secondary">
            <p className="text-lg font-bold text-profit">{summary.lowSeverity}</p>
            <p className="text-xs text-text-muted">{t("fraud.low")}</p>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-6">
          <ShieldAlert className="w-10 h-10 text-profit mx-auto mb-2" />
          <p className="text-sm text-profit font-medium">{t("fraud.noAlerts")}</p>
          <p className="text-xs text-text-muted mt-1">{t("fraud.allClear")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} transition-colors hover:shadow-sm`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(alert.type)}
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{alert.description}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {new Date(alert.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
