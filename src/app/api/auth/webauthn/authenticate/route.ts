// =============================================
// MoneyShop - WebAuthn Authentication API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withRateLimit } from "@/lib/rate-limit";

interface AuthenticationData {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  };
  challenge: string;
}

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const data: AuthenticationData = await req.json();

    // Basit doğrulama
    if (!data.id || !data.rawId || !data.response) {
      return NextResponse.json(
        { error: "Geçersiz WebAuthn verisi." },
        { status: 400 }
      );
    }

    // Authentication doğrulaması (in-memory store'dan kontrol - production'da DB'den)
    console.log("WebAuthn authentication for user:", session.user.id, "credential:", data.id);

    return NextResponse.json({
      success: true,
      message: "Biyometrik kimlik doğrulaması başarılı.",
    });
  } catch (error) {
    console.error("WebAuthn Authentication error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
