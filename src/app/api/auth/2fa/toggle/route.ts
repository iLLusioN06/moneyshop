// =============================================
// MoneyShop - 2FA Aç/Kapa
// =============================================
// Kullanıcının 2FA durumunu değiştirir.
// AUTHENTICATOR için: secret kaydedilmiş olmalı.
// SMS için: yöntem seçimi yeterli.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { twoFactorToggleSchema, validateRequest } from "@/lib/validations";
import { generateBackupCodes, encryptSecret } from "@/lib/two-factor";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateRequest(twoFactorToggleSchema, body);
    if (!parsed.success) return parsed.response;

    const { enabled, method } = parsed.data;

    // Kullanıcının mevcut durumu
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        twoFactorMethod: true,
        twoFactorSecret: true,
      },
    });

    if (enabled) {
      // 2FA'yı aç
      if (!method) {
        return NextResponse.json(
          { error: "2FA yöntemi seçilmelidir." },
          { status: 400 }
        );
      }

      if (method === "AUTHENTICATOR") {
        // Secret kaydedilmiş mi kontrol et
        if (!user?.twoFactorSecret) {
          return NextResponse.json(
            { error: "Önce Google Authenticator kurulumunu tamamlayın." },
            { status: 400 }
          );
        }
      }

      // Yedek kodlar oluştur (ilk açılışta)
      const backupCodes = generateBackupCodes();

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: method,
          twoFactorBackupCodes: backupCodes.hashed,
        },
      });

      // Denetim günlüğü
      const meta = getRequestMetadata(req);
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        entityId: session.user.id,
        details: { twoFactorEnabled: true, twoFactorMethod: method },
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "İki faktörlü doğrulama aktif edildi.",
        backupCodes: backupCodes.plain,
      });
    } else {
      // 2FA'yı kapat
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
        },
      });

      // Denetim günlüğü
      const meta = getRequestMetadata(req);
      await createAuditLog({
        userId: session.user.id,
        action: "UPDATE",
        entity: "USER",
        entityId: session.user.id,
        details: { twoFactorEnabled: false },
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "İki faktörlü doğrulama devre dışı bırakıldı.",
      });
    }
  } catch (error) {
    console.error("2FA toggle error:", error);
    return NextResponse.json(
      { error: "2FA durumu değiştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
