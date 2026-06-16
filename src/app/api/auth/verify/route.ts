import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyIdentitySchema, validateRequest } from "@/lib/validations";

export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = validateRequest(verifyIdentitySchema, body);
    if (!parsed.success) return parsed.response;

    const { dateOfBirth, tcKimlik, address, identityNumber } = parsed.data;

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

    // KYC verilerini kaydet ve hesabı doğrula
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: new Date(dateOfBirth),
        ...(tcKimlik !== undefined && tcKimlik !== ""
          ? { tcKimlik }
          : {}),
        address,
        identityNumber,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kimliğiniz başarıyla doğrulandı.",
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
