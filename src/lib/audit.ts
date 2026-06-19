// =============================================
// MoneyShop - Denetim Günlüğü (Audit Log)
// =============================================

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Denetim günlüğü kaydı oluşturur.
 * Hata durumunda sessizce başarısız olur (log kaydı kritik değildir).
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user: { connect: { id: input.userId } },
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        details: (input.details as Prisma.InputJsonValue) ?? {},
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

/**
 * İstekten IP ve User-Agent bilgilerini çıkarır.
 */
export function getRequestMetadata(req: Request): { ip?: string; userAgent?: string } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || req.headers.get("cf-connecting-ip")
    || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;
  return { ip, userAgent };
}
