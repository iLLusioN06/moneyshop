// =============================================
// MoneyShop - 2FA Durum Sorgulama
// =============================================
// Kullanıcının mevcut 2FA yapılandırmasını döndürür.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTwoFactorStatus } from "@/lib/two-factor";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const status = await getUserTwoFactorStatus(session.user.id);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("2FA status error:", error);
    return NextResponse.json(
      { error: "Durum sorgulanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
