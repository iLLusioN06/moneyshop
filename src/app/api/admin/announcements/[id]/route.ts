// =============================================
// MoneyShop - Admin Announcement Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Geçici in-memory depolama (route.ts ile paylaşılır)
const announcements: Array<{
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}> = [];

// DELETE /api/admin/announcements/:id
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id } = await params;
    const index = announcements.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }

    announcements.splice(index, 1);

    return NextResponse.json({ success: true, message: "Duyuru silindi." });
  } catch (error) {
    console.error("Announcement DELETE error:", error);
    return NextResponse.json({ error: "Duyuru silinirken hata oluştu." }, { status: 500 });
  }
}
