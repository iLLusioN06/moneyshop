// =============================================
// MoneyShop - Fraud Detection API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

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

async function handler(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      recentTransactions,
      allTimeStats,
      todayTransactions,
    ] = await Promise.all([
      // Son 30 günlük işlemler
      prisma.transaction.findMany({
        where: {
          userId,
          status: "COMPLETED",
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "desc" },
        take: 500,
      }),

      // Tüm zamanların istatistikleri
      prisma.transaction.aggregate({
        where: {
          userId,
          status: "COMPLETED",
        },
        _avg: { amount: true },
        _max: { amount: true },
        _count: { id: true },
      }),

      // Bugünkü işlemler
      prisma.transaction.findMany({
        where: {
          userId,
          status: "COMPLETED",
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const alerts: FraudAlert[] = [];
    const avgAmount = Number(allTimeStats._avg.amount) || 0;
    const maxAmount = Number(allTimeStats._max.amount) || 0;

    // 1. Olağandışı Yüksek Tutar Kontrolü
    const unusualAmounts = recentTransactions.filter((t) => {
      const amount = Number(t.amount);
      return amount > avgAmount * 3 && amount > 1000;
    });

    for (const tx of unusualAmounts.slice(0, 5)) {
      alerts.push({
        id: `ua-${tx.id}`,
        type: "UNUSUAL_AMOUNT",
        severity: Number(tx.amount) > avgAmount * 5 ? "HIGH" : "MEDIUM",
        title: "Olağandışı Yüksek Tutar",
        description: `${tx.amount} ${tx.currency} tutarındaki işlem, ortalama tutarın ${Math.round(Number(tx.amount) / avgAmount)} katı.`,
        transactionId: tx.id,
        amount: Number(tx.amount),
        createdAt: tx.date.toISOString(),
      });
    }

    // 2. Hızlı Ardışık İşlemler (10 dakika içinde 3+ işlem)
    const sortedByTime = [...recentTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedByTime.length - 2; i++) {
      const window = 10 * 60 * 1000; // 10 dakika
      const rapidGroup = sortedByTime.filter(
        (t) =>
          new Date(t.date).getTime() >= new Date(sortedByTime[i].date).getTime() &&
          new Date(t.date).getTime() <= new Date(sortedByTime[i].date).getTime() + window
      );

      if (rapidGroup.length >= 3) {
        const totalRapid = rapidGroup.reduce((sum, t) => sum + Number(t.amount), 0);
        alerts.push({
          id: `rt-${sortedByTime[i].id}`,
          type: "RAPID_TRANSACTIONS",
          severity: rapidGroup.length >= 5 ? "HIGH" : "MEDIUM",
          title: "Hızlı Ardışık İşlemler",
          description: `${rapidGroup.length} işlem 10 dakika içinde yapıldı. Toplam: ${totalRapid.toLocaleString("tr-TR")} ${rapidGroup[0].currency}`,
          amount: totalRapid,
          createdAt: sortedByTime[i].date.toISOString(),
        });
        break; // Sadece bir kez raporla
      }
    }

    // 3. Gece İşlemleri (23:00 - 05:00 arası)
    const lateNightTx = recentTransactions.filter((t) => {
      const hour = new Date(t.date).getHours();
      return hour >= 23 || hour < 5;
    });

    if (lateNightTx.length >= 2) {
      const totalLateNight = lateNightTx.reduce((sum, t) => sum + Number(t.amount), 0);
      alerts.push({
        id: `ln-${lateNightTx[0].id}`,
        type: "LATE_NIGHT",
        severity: lateNightTx.length >= 3 ? "HIGH" : "LOW",
        title: "Gece İşlemleri",
        description: `${lateNightTx.length} işlem gece saatlerinde (23:00-05:00) yapıldı. Toplam: ${totalLateNight.toLocaleString("tr-TR")} ${lateNightTx[0].currency}`,
        amount: totalLateNight,
        createdAt: lateNightTx[0].date.toISOString(),
      });
    }

    // 4. Yüksek Değerli İşlemler (max'in %80'inden fazla)
    if (maxAmount > 0) {
      const highValueTx = recentTransactions.filter((t) => {
        const amount = Number(t.amount);
        return amount > maxAmount * 0.8 && amount > 5000;
      });

      for (const tx of highValueTx.slice(0, 3)) {
        alerts.push({
          id: `hv-${tx.id}`,
          type: "HIGH_VALUE",
          severity: Number(tx.amount) >= maxAmount * 0.95 ? "HIGH" : "MEDIUM",
          title: "Yüksek Değerli İşlem",
          description: `${tx.amount} ${tx.currency} tutarındaki işlem, tüm zamanların en yüksek işleminin yakınında.`,
          transactionId: tx.id,
          amount: Number(tx.amount),
          createdAt: tx.date.toISOString(),
        });
      }
    }

    // 5. Bugünkü İşlem Özeti
    const todayTotal = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const todayCount = todayTransactions.length;

    // Alert'leri şiddete göre sırala
    alerts.sort((a, b) => {
      const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          alerts: alerts.slice(0, 10),
          summary: {
            totalAlerts: alerts.length,
            highSeverity: alerts.filter((a) => a.severity === "HIGH").length,
            mediumSeverity: alerts.filter((a) => a.severity === "MEDIUM").length,
            lowSeverity: alerts.filter((a) => a.severity === "LOW").length,
            todayTransactions: todayCount,
            todayAmount: todayTotal,
          },
        },
      },
      { headers: getCacheHeaders(30) }
    );
  } catch (error) {
    console.error("Fraud Detection GET error:", error);
    return NextResponse.json(
      { error: "Dolandırıcılık tespiti sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
