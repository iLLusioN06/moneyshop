// =============================================
// MoneyShop - Single Recurring Transaction API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";

// PATCH /api/recurring-transactions/[id] - Update (pause/resume/cancel)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { status, description, amount, categoryId } = body;

    // Önce kaydın kullanıcıya ait olduğunu kontrol et
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tekrarlanan işlem bulunamadı." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: updateData,
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "RECURRING_TRANSACTION",
      entityId: id,
      details: updateData,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Recurring PATCH error:", error);
    return NextResponse.json(
      { error: "Tekrarlanan işlem güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/recurring-transactions/[id] - Cancel a recurring transaction
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tekrarlanan işlem bulunamadı." },
        { status: 404 }
      );
    }

    // Soft delete - durumu CANCELLED olarak işaretle
    await prisma.recurringTransaction.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: session.user.id,
      action: "CANCEL",
      entity: "RECURRING_TRANSACTION",
      entityId: id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return NextResponse.json({ success: true, message: "Tekrarlanan işlem iptal edildi." });
  } catch (error) {
    console.error("Recurring DELETE error:", error);
    return NextResponse.json(
      { error: "Tekrarlanan işlem silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
