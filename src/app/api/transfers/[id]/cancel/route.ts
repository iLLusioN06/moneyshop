// =============================================
// MoneyShop - Transfer Cancel API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitTransactionEvent, emitBalanceEvent, emitNotification } from "@/lib/ws";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id, type: "TRANSFER" },
      include: { account: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transfer bulunamadı." }, { status: 404 });
    }

    if (transaction.status === "CANCELLED") {
      return NextResponse.json({ error: "Transfer zaten iptal edilmiş." }, { status: 400 });
    }

    if (transaction.status === "FAILED") {
      return NextResponse.json({ error: "Başarısız transfer iptal edilemez." }, { status: 400 });
    }

    if (transaction.status === "COMPLETED") {
      const transferAge = Date.now() - transaction.date.getTime();
      const maxCancelAge = 30 * 60 * 1000; // 30 dakika
      if (transferAge > maxCancelAge) {
        return NextResponse.json(
          { error: "Tamamlanmış transferler 30 dakika içinde iptal edilebilir." },
          { status: 400 }
        );
      }

      // FAST transfer (MoneyShop içi) — alıcıdan geri al
      if (transaction.recipientUserId) {
        const recipientAccount = await prisma.financialAccount.findFirst({
          where: { userId: transaction.recipientUserId, isActive: true },
          orderBy: { createdAt: "asc" },
        });

        if (recipientAccount) {
          const amount = Number(transaction.amount);

          await prisma.$transaction(async (tx) => {
            // Alıcıdan düş
            await tx.financialAccount.update({
              where: { id: recipientAccount.id },
              data: { balance: { decrement: amount } },
            });

            // Gönderene iade et
            await tx.financialAccount.update({
              where: { id: transaction.accountId },
              data: { balance: { increment: amount } },
            });

            // Transfer durumunu güncelle
            await tx.transaction.update({
              where: { id },
              data: { status: "CANCELLED" },
            });

            // Alıcı için iade kaydı
            await tx.transaction.create({
              data: {
                accountId: recipientAccount.id,
                userId: transaction.recipientUserId!,
                type: "TRANSFER",
                amount,
                currency: transaction.currency,
                description: `Transfer iptal edildi — iade`,
                status: "COMPLETED",
              },
            });
          });

          // WebSocket bildirimleri
          try {
            const newBalance = Number(transaction.account.balance) + amount;
            emitTransactionEvent(session.user.id, {
              id: `cancel-${transaction.id}`,
              type: "TRANSFER",
              amount,
              currency: transaction.currency,
              description: "Transfer iptal edildi — iade",
              accountName: transaction.account.name,
              date: new Date().toISOString(),
              status: "CANCELLED",
            });

            emitBalanceEvent(session.user.id, {
              accountId: transaction.accountId,
              accountName: transaction.account.name,
              newBalance,
              currency: transaction.currency,
              change: amount,
            });

            emitNotification(session.user.id, {
              id: `cancel-${transaction.id}`,
              title: "Transfer İptal Edildi",
              body: `${amount} ${transaction.currency} tutarındaki transfer iptal edildi.`,
              variant: "warning",
              url: "/dashboard/transfers",
              timestamp: Date.now(),
            });
          } catch {
            // WS hatası işlem akışını etkilemez
          }

          return NextResponse.json({
            success: true,
            message: "Transfer başarıyla iptal edildi ve tutar iade edildi.",
          });
        }
      }

      // EFT transfer — sadece durumu iptal olarak işaretle
      await prisma.transaction.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({
        success: true,
        message: "EFT transferi iptal edildi. Banka iadesi 1-3 iş günü içinde gerçekleşecektir.",
      });
    }

    // PENDING durumunda iptal
    await prisma.transaction.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Transfer başarıyla iptal edildi.",
    });
  } catch (error) {
    console.error("Transfer Cancel error:", error);
    return NextResponse.json(
      { error: "Transfer iptal edilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
