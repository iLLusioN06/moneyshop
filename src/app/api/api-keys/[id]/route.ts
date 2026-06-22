import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id },
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

    if (!apiKey) {
      return NextResponse.json({ error: "API anahtarı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: apiKey });
  } catch (error) {
    console.error("API key GET error:", error);
    return NextResponse.json({ error: "API anahtarı alınırken hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.apiKey.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "API anahtarı bulunamadı." }, { status: 404 });
    }

    const { name, permissions, rateLimit, isActive, expiresAt } = body;

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(permissions !== undefined && { permissions }),
        ...(rateLimit !== undefined && { rateLimit }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json({ success: true, data: { id: updated.id, name: updated.name, isActive: updated.isActive } });
  } catch (error) {
    console.error("API key PATCH error:", error);
    return NextResponse.json({ error: "API anahtarı güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.apiKey.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "API anahtarı bulunamadı." }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "API anahtarı silindi." });
  } catch (error) {
    console.error("API key DELETE error:", error);
    return NextResponse.json({ error: "API anahtarı silinirken hata oluştu." }, { status: 500 });
  }
}
