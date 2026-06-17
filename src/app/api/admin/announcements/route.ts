// =============================================
// MoneyShop - Admin Announcements API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Geçici in-memory depolama (gerçek uygulamada veritabanı kullanılır)
const announcements: Array<{
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}> = [
  {
    id: "1",
    title: "Sistem Bakımı",
    content: "15 Temmuz 2026 tarihinde 02:00-04:00 saatleri arasında planlı bakım yapılacaktır.",
    type: "WARNING",
    category: "GENERAL",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Yeni Özellik: Birikim Hedefleri",
    content: "Artık birikim hedeflerinizi oluşturabilir ve takip edebilirsiniz.",
    type: "SUCCESS",
    category: "NOTIFICATION",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/admin/announcements
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Announcements GET error:", error);
    return NextResponse.json({ error: "Duyurular alınırken hata oluştu." }, { status: 500 });
  }
}

// POST /api/admin/announcements
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type, category } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Başlık ve içerik zorunludur." }, { status: 400 });
    }

    const announcement = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      type: type || "INFO",
      category: category || "GENERAL",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    announcements.unshift(announcement);

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Announcements POST error:", error);
    return NextResponse.json({ error: "Duyuru oluşturulurken hata oluştu." }, { status: 500 });
  }
}
