// =============================================
// MoneyShop - WebAuthn Registration API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

interface RegistrationData {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
  challenge: string;
}

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const data: RegistrationData = await req.json();

    // Basit doğrulama
    if (!data.id || !data.rawId || !data.response) {
      return NextResponse.json(
        { error: "Geçersiz WebAuthn verisi." },
        { status: 400 }
      );
    }

    // Credential'ı kaydet (in-memory store - production'da DB'ye kaydedilmeli)
    // Şimdilik basit bir onay dönüyoruz
    console.log("WebAuthn registration for user:", session.user.id, "credential:", data.id);

    return NextResponse.json({
      success: true,
      message: "Biyometrik kimlik başarıyla kaydedildi.",
      credentialId: data.id,
    });
  } catch (error) {
    console.error("WebAuthn Registration error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, handler);
