// =============================================
// MoneyShop - Global Search API
// Transactions, Accounts, Categories, Users ara
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/search?q=...
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // Tüm aramaları paralel yap
    const [transactions, accounts, categories, users] = await Promise.all([
      // İşlemler - description, recipientName, recipientIban, recipientBank üzerinde ara
      prisma.transaction.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { recipientName: { contains: q, mode: "insensitive" } },
            { recipientIban: { contains: q, mode: "insensitive" } },
            { recipientBank: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          description: true,
          status: true,
          date: true,
          recipientName: true,
        },
        orderBy: { date: "desc" },
        take: 10,
      }),

      // Hesaplar - name üzerinde ara
      prisma.financialAccount.findMany({
        where: {
          userId,
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          currency: true,
        },
        orderBy: { name: "asc" },
        take: 5,
      }),

      // Kategoriler - name üzerinde ara
      prisma.category.findMany({
        where: {
          userId,
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
        orderBy: { name: "asc" },
        take: 5,
      }),

      // Kullanıcılar (sadece admin)
      isAdmin
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              isActive: true,
            },
            orderBy: { name: "asc" },
            take: 10,
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      results: {
        transactions,
        accounts,
        categories,
        ...(isAdmin ? { users } : {}),
      },
      total:
        transactions.length +
        accounts.length +
        categories.length +
        (isAdmin ? users.length : 0),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Arama yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
