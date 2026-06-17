// =============================================
// MoneyShop - Investments API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";

// GET /api/investments - List investments with portfolio summary
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    const where: Prisma.InvestmentWhereInput = { userId: session.user.id };
    if (accountId) where.accountId = accountId;

    const investments = await prisma.investment.findMany({
      where,
      include: { account: true },
      orderBy: { createdAt: "desc" },
    });

    // Portfolio summary
    let totalCost = 0;
    let totalCurrent = 0;
    const typeBreakdown: Record<string, { cost: number; current: number }> = {};

    for (const inv of investments) {
      const cost = Number(inv.shares) * Number(inv.buyPrice);
      const current = Number(inv.shares) * Number(inv.currentPrice);
      totalCost += cost;
      totalCurrent += current;

      if (!typeBreakdown[inv.type]) typeBreakdown[inv.type] = { cost: 0, current: 0 };
      typeBreakdown[inv.type].cost += cost;
      typeBreakdown[inv.type].current += current;
    }

    return NextResponse.json({
      success: true,
      data: investments,
      summary: {
        totalCost,
        totalCurrent,
        totalProfit: totalCurrent - totalCost,
        profitPercent: totalCost > 0 ? ((totalCurrent - totalCost) / totalCost) * 100 : 0,
        typeBreakdown,
      },
    });
  } catch (error) {
    console.error("Investments GET error:", error);
    return NextResponse.json(
      { error: "Yatırımlar alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/investments - Add a new investment
async function postHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { accountId, name, symbol, type, shares, buyPrice, currentPrice, currency, notes } = body;

    if (!accountId || !name || !symbol || shares === undefined || !buyPrice) {
      return NextResponse.json(
        { error: "Hesap, ad, sembol, miktar ve alış fiyatı zorunludur." },
        { status: 400 }
      );
    }

    // Hesabın kullanıcıya ait olduğunu kontrol et
    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    const investment = await prisma.investment.create({
      data: {
        userId,
        accountId,
        name,
        symbol,
        type: type || "STOCK",
        shares,
        buyPrice,
        currentPrice: currentPrice || buyPrice,
        currency: currency || account.currency,
        notes: notes || null,
      },
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "INVESTMENT",
      entityId: investment.id,
      details: { name: investment.name, symbol: investment.symbol, shares: investment.shares, type: investment.type },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return NextResponse.json({ success: true, data: investment }, { status: 201 });
  } catch (error) {
    console.error("Investments POST error:", error);
    return NextResponse.json(
      { error: "Yatırım eklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, postHandler);

// PATCH /api/investments - Update current prices in bulk
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { id, currentPrice, shares, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Yatırım ID gerekli." }, { status: 400 });
    }

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existing = await prisma.investment.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Yatırım bulunamadı." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
    if (shares !== undefined) updateData.shares = shares;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.investment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Investments PATCH error:", error);
    return NextResponse.json(
      { error: "Yatırım güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/investments/[id]
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Yatırım ID gerekli." }, { status: 400 });
    }

    const existing = await prisma.investment.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Yatırım bulunamadı." }, { status: 404 });
    }

    await prisma.investment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Yatırım silindi." });
  } catch (error) {
    console.error("Investments DELETE error:", error);
    return NextResponse.json(
      { error: "Yatırım silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
