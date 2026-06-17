// =============================================
// MoneyShop - Admin Kullanıcı Detay API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users/[id] - Kullanıcı detayı
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        dateOfBirth: true,
        tcKimlik: true,
        address: true,
        identityNumber: true,
        image: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            transactions: true,
            categories: true,
            budgets: true,
            investments: true,
            recurringTransactions: true,
            cards: true,
            emailLogs: true,
            auditLogs: true,
          },
        },
        accounts: {
          select: {
            id: true,
            name: true,
            type: true,
            balance: true,
            currency: true,
            isActive: true,
            createdAt: true,
            _count: { select: { transactions: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        cards: {
          select: {
            id: true,
            cardType: true,
            cardHolderName: true,
            status: true,
            balance: true,
            currency: true,
            dailyLimit: true,
            monthlyLimit: true,
            issuedAt: true,
          },
          orderBy: { issuedAt: "desc" },
        },
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            currency: true,
            description: true,
            status: true,
            date: true,
            account: { select: { name: true } },
            category: { select: { name: true, icon: true, color: true } },
          },
          orderBy: { date: "desc" },
          take: 20,
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            entity: true,
            entityId: true,
            details: true,
            ip: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        emailLogs: {
          select: {
            id: true,
            to: true,
            subject: true,
            event: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // İstatistikler
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyIncome, monthlyExpense, totalIncome, totalExpense] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: id,
            type: "INCOME",
            status: "COMPLETED",
            date: { gte: monthStart },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: id,
            type: "EXPENSE",
            status: "COMPLETED",
            date: { gte: monthStart },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: id,
            type: "INCOME",
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: id,
            type: "EXPENSE",
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          monthlyIncome: Number(monthlyIncome._sum.amount) || 0,
          monthlyExpense: Number(monthlyExpense._sum.amount) || 0,
          totalIncome: Number(totalIncome._sum.amount) || 0,
          totalExpense: Number(totalExpense._sum.amount) || 0,
          balance: (Number(totalIncome._sum.amount) || 0) - (Number(totalExpense._sum.amount) || 0),
        },
      },
    });
  } catch (error) {
    console.error("Admin user detail GET error:", error);
    return NextResponse.json(
      { error: "Kullanıcı detayı alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Kullanıcıyı sil
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id } = await params;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Admin kullanıcıları silmeyi engelle
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin kullanıcıları silinemez." },
        { status: 400 }
      );
    }

    // Kendini silmeyi engelle
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Kendinizi silemezsiniz." },
        { status: 400 }
      );
    }

    // Audit log (silmeden önce)
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "USER",
        entityId: id,
        details: JSON.stringify({
          deletedUser: user.email,
          deletedBy: session.user.email,
        }),
      },
    });

    // İlişkili verileri sil (cascade ile otomatik silinecek)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Kullanıcı başarıyla silindi.",
    });
  } catch (error) {
    console.error("Admin user DELETE error:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
