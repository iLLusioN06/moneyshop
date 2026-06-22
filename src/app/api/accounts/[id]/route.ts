// =============================================
// MoneyShop - Accounts API (Tekil İşlemler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { apiHandler, NotFoundError, successResponse } from "@/lib/api-handler";

// GET /api/accounts/[id] - Hesap detayı
export const GET = apiHandler(async (_req, context) => {
  const session = await auth();
  const params = await (context as { params: Promise<{ id: string }> }).params;

  const account = await prisma.financialAccount.findFirst({
    where: { id: params.id, userId: session!.user!.id },
  });

  if (!account) throw new NotFoundError("Hesap bulunamadı.");
  return successResponse(account);
}, { requireAuth: true });

// PUT /api/accounts/[id] - Hesap güncelle
export const PUT = apiHandler(async (req, context) => {
  const session = await auth();
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId: session!.user!.id },
  });
  if (!existing) throw new NotFoundError("Hesap bulunamadı.");

  const body = await req.json();
  const { name, type, balance, currency, icon, color, isActive } = body;

  const account = await prisma.financialAccount.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(balance !== undefined && { balance }),
      ...(currency !== undefined && { currency }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  const meta = getRequestMetadata(req);
  await createAuditLog({
    userId: session!.user!.id as string,
    action: "UPDATE",
    entity: "ACCOUNT",
    entityId: id,
    details: body,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return successResponse(account);
}, { requireAuth: true });

// DELETE /api/accounts/[id] - Hesap sil (soft delete)
export const DELETE = apiHandler(async (_req, context) => {
  const session = await auth();
  const { id } = await (context as { params: Promise<{ id: string }> }).params;

  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId: session!.user!.id },
  });
  if (!existing) throw new NotFoundError("Hesap bulunamadı.");

  await prisma.financialAccount.update({
    where: { id },
    data: { isActive: false },
  });

  const meta = getRequestMetadata(_req);
  await createAuditLog({
    userId: session!.user!.id as string,
    action: "DEACTIVATE",
    entity: "ACCOUNT",
    entityId: id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return successResponse({ message: "Hesap devre dışı bırakıldı." });
}, { requireAuth: true });
