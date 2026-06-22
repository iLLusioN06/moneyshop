// =============================================
// MoneyShop - Accounts API (Liste & Oluşturma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { apiHandler, ValidationError, successResponse } from "@/lib/api-handler";

// GET /api/accounts - Kullanıcının hesaplarını listele
export const GET = apiHandler(async () => {
  const session = await auth();
  const accounts = await prisma.financialAccount.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(accounts);
}, { requireAuth: true });

// POST /api/accounts - Yeni hesap oluştur
async function postHandler(req: Request) {
  const session = await auth();
  const body = await req.json();
  const { name, type, balance, currency, icon, color } = body;

  if (!name) throw new ValidationError("Hesap adı zorunludur.");

  const account = await prisma.financialAccount.create({
    data: {
      userId: session!.user!.id as string,
      name,
      type: type || "CHECKING",
      balance: balance || 0,
      currency: currency || "TRY",
      icon: icon || null,
      color: color || null,
    },
  });

  const meta = getRequestMetadata(req);
  await createAuditLog({
    userId: session!.user!.id as string,
    action: "CREATE",
    entity: "ACCOUNT",
    entityId: account.id,
    details: { name, type, balance, currency },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return NextResponse.json({ success: true, data: account }, { status: 201 });
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, apiHandler(postHandler, { requireAuth: true }));
