import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const { dateOfBirth, tcKimlik } = await req.json();

    // Zaten doğrulanmış mı?
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });

    if (user?.emailVerified) {
      return NextResponse.json(
        { error: "Hesabınız zaten doğrulanmış." },
        { status: 400 }
      );
    }

    // Gerekli alanları kontrol et
    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Doğum tarihi zorunludur." },
        { status: 400 }
      );
    }

    // Hesabı doğrula
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Hesabınız başarıyla doğrulandı.",
      emailVerified: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
