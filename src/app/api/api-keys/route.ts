import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function generateApiKey() {
  const prefix = "ms_live_";
  const random = crypto.randomBytes(24).toString("hex");
  return `${prefix}${random}`;
}

function hashKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    console.error("API keys GET error:", error);
    return NextResponse.json({ error: "API anahtarları alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const existingCount = await prisma.apiKey.count({
      where: { userId: session.user.id, isActive: true },
    });

    if (existingCount >= 10) {
      return NextResponse.json({ error: "Maksimum 10 aktif API anahtarı oluşturabilirsiniz." }, { status: 400 });
    }

    const body = await req.json();
    const { name, permissions, rateLimit, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: "Anahtar adı zorunludur." }, { status: 400 });
    }

    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        keyHash,
        keyPrefix: rawKey.slice(0, 12),
        permissions: permissions || [],
        rateLimit: rateLimit || 1000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: apiKey.id, name: apiKey.name, key: rawKey, keyPrefix: apiKey.keyPrefix },
        message: "API anahtarı oluşturuldu. Anahtarı güvenli bir yerde saklayın — tekrar gösterilmeyecek." },
      { status: 201 }
    );
  } catch (error) {
    console.error("API keys POST error:", error);
    return NextResponse.json({ error: "API anahtarı oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, createHandler);
