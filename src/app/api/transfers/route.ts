// =============================================
// MoneyShop - Transfers API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { withRateLimit } from "@/lib/rate-limit";
import { createTransferSchema, validateRequest } from "@/lib/validations";
import { sendNotification, buildTransferEmail } from "@/lib/email";
import {
  emitTransactionEvent,
  emitBalanceEvent,
  emitNotification,
} from "@/lib/ws";
import {
  sendPushNotification,
  buildTransferPushPayload,
  buildTransactionPushPayload,
} from "@/lib/push-notifications";

// GET /api/transfers - Kullanıcının son transfer işlemlerini listele
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "fast" | "eft"
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      type: "TRANSFER",
    };

    if (type === "fast") {
      where.recipientBank = null; // FAST = MoneyShop içi, banka bilgisi yok
    } else if (type === "eft") {
      where.recipientBank = { not: null }; // EFT = harici banka
    }

    const transfers = await prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: { date: "desc" },
      take: Math.min(limit, 50),
    });

    return NextResponse.json({ success: true, data: transfers });
  } catch (error) {
    console.error("Transfers GET error:", error);
    return NextResponse.json(
      { error: "Transferler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/transfers - Yeni transfer oluştur
async function postHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = validateRequest(createTransferSchema, body);
    if (!parsed.success) return parsed.response;

    const {
      type,
      senderAccountId,
      amount,
      currency,
      description,
      recipientIdentifier,
      recipientName,
      recipientIban,
      recipientBank,
    } = parsed.data;

    // Gönderen hesabı kontrol et
    const senderAccount = await prisma.financialAccount.findFirst({
      where: { id: senderAccountId, userId, isActive: true },
    });

    if (!senderAccount) {
      return NextResponse.json(
        { error: "Gönderen hesap bulunamadı." },
        { status: 404 }
      );
    }

    // FAST transfer: MoneyShop içi kullanıcıya gönder
    if (type === "fast") {
      // Alıcıyı bul (önce email, sonra kullanıcı adı ile dene)
      let recipient = await prisma.user.findUnique({
        where: { email: recipientIdentifier },
      });

      if (!recipient) {
        recipient = await prisma.user.findFirst({
          where: { name: recipientIdentifier },
        });
      }

      if (!recipient || !recipient.isActive) {
        return NextResponse.json(
          { error: "Alıcı bulunamadı. E-posta veya kullanıcı adını kontrol edin." },
          { status: 404 }
        );
      }

      if (recipient.id === userId) {
        return NextResponse.json(
          { error: "Kendinize transfer yapamazsınız." },
          { status: 400 }
        );
      }

      // Alıcının aktif bir hesabı var mı?
      const recipientAccount = await prisma.financialAccount.findFirst({
        where: { userId: recipient.id, isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (!recipientAccount) {
        return NextResponse.json(
          { error: "Alıcının aktif hesabı bulunamadı." },
          { status: 400 }
        );
      }

      // Gönderen adı
      const senderName = session.user?.name || "MoneyShop Kullanıcısı";
      const recipientDisplayName = recipient.name || recipient.email || "Alıcı";

      // Transfer işlemini transaction ile yap (gönderen ve alıcı için)
      const transferResult = await prisma.$transaction(async (tx) => {
        // 1. Gönderen hesaptan düş (bakiye kontrolü ile birlikte)
        const updatedSender = await tx.financialAccount.updateMany({
          where: { id: senderAccount.id, balance: { gte: amount } },
          data: { balance: { decrement: amount } },
        });

        if (updatedSender.count === 0) {
          throw new Error("Yetersiz bakiye.");
        }

        // 2. Alıcı hesaba ekle
        await tx.financialAccount.update({
          where: { id: recipientAccount.id },
          data: { balance: { increment: amount } },
        });

        // 3. Gönderen için giden transfer kaydı
        const outTx = await tx.transaction.create({
          data: {
            accountId: senderAccount.id,
            userId,
            type: "TRANSFER",
            amount,
            currency: currency || senderAccount.currency,
            description: description || `${recipientDisplayName} adlı kullanıcıya FAST transfer`,
            status: "COMPLETED",
            recipientName: recipient.name || recipient.email,
            recipientUserId: recipient.id,
          },
        });

        // 4. Alıcı için gelen transfer kaydı
        await tx.transaction.create({
          data: {
            accountId: recipientAccount.id,
            userId: recipient.id,
            type: "TRANSFER",
            amount,
            currency: currency || senderAccount.currency,
            description: `${senderName} adlı kullanıcıdan FAST transfer`,
            status: "COMPLETED",
            recipientName: senderName,
            recipientUserId: userId,
          },
        });

        return outTx;
      });

      // E-posta bildirimi (gönderene)
      const userName = session.user?.name || "Kullanıcı";
      const userEmail = session.user?.email || "";
      sendNotification(userId, "TRANSFER", () =>
        buildTransferEmail({
          to: userEmail,
          userName,
          amount,
          currency: currency || senderAccount.currency,
          recipientName: recipient.name || recipient.email,
          recipientIban: undefined,
          fee: 0,
          date: transferResult.createdAt,
        })
      ).catch(() => {});

      // ─── WebSocket bildirimleri (gönderen) ────────────────
      try {
        emitTransactionEvent(userId, {
          id: transferResult.id,
          type: "TRANSFER",
          amount,
          currency: currency || senderAccount.currency,
          description: description || `${recipientDisplayName} adlı kullanıcıya FAST transfer`,
          accountName: senderAccount.name,
          date: transferResult.createdAt.toISOString(),
          status: "COMPLETED",
        });

        emitBalanceEvent(userId, {
          accountId: senderAccount.id,
          accountName: senderAccount.name,
          newBalance: Number(senderAccount.balance) - amount,
          currency: currency || senderAccount.currency,
          change: -amount,
        });

        emitNotification(userId, {
          id: `transfer-out-${transferResult.id}`,
          title: "Para Transferi",
          body: `${amount} ${currency || senderAccount.currency} → ${recipientDisplayName}`,
          variant: "info",
          url: "/dashboard/transfers",
          timestamp: Date.now(),
        });
      } catch {
        // WS hatası işlem akışını etkilemez
      }

      // ─── WebSocket bildirimleri (alıcı) ──────────────────
      try {
        const inAmount = amount;
        emitTransactionEvent(recipient.id, {
          id: `in-${transferResult.id}`,
          type: "TRANSFER",
          amount: inAmount,
          currency: currency || senderAccount.currency,
          description: `${senderName} adlı kullanıcıdan FAST transfer`,
          accountName: recipientAccount.name,
          date: transferResult.createdAt.toISOString(),
          status: "COMPLETED",
        });

        emitBalanceEvent(recipient.id, {
          accountId: recipientAccount.id,
          accountName: recipientAccount.name,
          newBalance: Number(recipientAccount.balance) + inAmount,
          currency: currency || senderAccount.currency,
          change: inAmount,
        });

        emitNotification(recipient.id, {
          id: `transfer-in-${transferResult.id}`,
          title: "Para Aldınız",
          body: `${senderName} adlı kullanıcıdan ${inAmount} ${currency || senderAccount.currency} aldınız.`,
          variant: "success",
          url: "/dashboard/transfers",
          timestamp: Date.now(),
        });
      } catch {
        // WS hatası işlem akışını etkilemez
      }

      // ─── Push Notification (gönderen) ────────────────────
      sendPushNotification(userId, "TRANSFER", buildTransferPushPayload({
        userName: session.user?.name || "Kullanıcı",
        amount,
        currency: currency || senderAccount.currency,
        recipientName: recipientDisplayName,
      })).catch(() => {});

      return NextResponse.json(
        {
          success: true,
          message: "FAST transfer başarıyla gerçekleştirildi.",
          data: transferResult,
        },
        { status: 201 }
      );
    }

    // EFT transfer: Harici IBAN'a gönder
    if (type === "eft") {
      const transferResult = await prisma.$transaction(async (tx) => {
        // 1. Hesaptan düş (bakiye kontrolü ile birlikte)
        const updatedSender = await tx.financialAccount.updateMany({
          where: { id: senderAccount.id, balance: { gte: amount } },
          data: { balance: { decrement: amount } },
        });

        if (updatedSender.count === 0) {
          throw new Error("Yetersiz bakiye.");
        }

        // 2. Transfer kaydı oluştur
        const txRecord = await tx.transaction.create({
          data: {
            accountId: senderAccount.id,
            userId,
            type: "TRANSFER",
            amount,
            currency: currency || senderAccount.currency,
            description: description || `${recipientName} adlı alıcıya EFT`,
            status: "COMPLETED",
            recipientName,
            recipientIban,
            recipientBank: recipientBank || null,
          },
        });

        return txRecord;
      });

      // E-posta bildirimi (gönderene)
      const userName = session.user?.name || "Kullanıcı";
      const userEmail = session.user?.email || "";
      sendNotification(userId, "TRANSFER", () =>
        buildTransferEmail({
          to: userEmail,
          userName,
          amount,
          currency: currency || senderAccount.currency,
          recipientName,
          recipientIban,
          fee: 0,
          date: transferResult.createdAt,
        })
      ).catch(() => {});

      // ─── WebSocket bildirimleri ─────────────────────────
      try {
        emitTransactionEvent(userId, {
          id: transferResult.id,
          type: "TRANSFER",
          amount,
          currency: currency || senderAccount.currency,
          description: description || `${recipientName} adlı alıcıya EFT`,
          accountName: senderAccount.name,
          date: transferResult.createdAt.toISOString(),
          status: "COMPLETED",
        });

        emitBalanceEvent(userId, {
          accountId: senderAccount.id,
          accountName: senderAccount.name,
          newBalance: Number(senderAccount.balance) - amount,
          currency: currency || senderAccount.currency,
          change: -amount,
        });

        emitNotification(userId, {
          id: `eft-${transferResult.id}`,
          title: "EFT Gönderildi",
          body: `${amount} ${currency || senderAccount.currency} → ${recipientName}`,
          variant: "info",
          url: "/dashboard/transfers",
          timestamp: Date.now(),
        });
      } catch {
        // WS hatası işlem akışını etkilemez
      }

      // ─── Push Notification (gönderen) ────────────────────
      sendPushNotification(userId, "TRANSFER", buildTransferPushPayload({
        userName: session.user?.name || "Kullanıcı",
        amount,
        currency: currency || senderAccount.currency,
        recipientName,
      })).catch(() => {});

      return NextResponse.json(
        {
          success: true,
          message: "EFT başarıyla gerçekleştirildi.",
          data: transferResult,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Geçersiz transfer türü." },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer gerçekleştirilirken bir hata oluştu.";
    if (message === "Yetersiz bakiye.") {
      return NextResponse.json({ error: "Yetersiz bakiye." }, { status: 400 });
    }
    console.error("Transfers POST error:", error);
    return NextResponse.json(
      { error: "Transfer gerçekleştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, postHandler);
