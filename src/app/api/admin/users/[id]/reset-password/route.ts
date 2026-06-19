// =============================================
// MoneyShop - Admin Kullanıcı Şifre Sıfırlama API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import crypto from "crypto";

// POST /api/admin/users/[id]/reset-password - Kullanıcı şifresini sıfırla
export async function POST(
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
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Rastgele şifre oluştur
    const newPassword = crypto.randomBytes(12).toString("base64url").slice(0, 16);

    // Şifreyi hash'le ve güncelle
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Audit log
    const meta = getRequestMetadata(_req);
    await createAuditLog({
      userId: session.user.id,
      action: "PASSWORD_RESET",
      entity: "USER",
      entityId: id,
      details: {
        targetUser: user.email,
        resetBy: session.user.email,
      },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    // Not: Gerçek uygulamada burada kullanıcıya e-posta gönderilir
    // Şimdilik sadece başarı mesajı dönüyoruz
    console.log(`Password reset for ${user.email} by admin ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: "Şifre sıfırlandı. Kullanıcıya yeni şifre bildirilmelidir.",
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Şifre sıfırlanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
