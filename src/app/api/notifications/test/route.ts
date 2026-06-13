// =============================================
// MoneyShop - Test E-postası API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, buildTestEmail, logEmail } from "@/lib/email";

// POST /api/notifications/test - Test e-postası gönder
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "E-posta adresiniz bulunamadı." }, { status: 400 });
    }

    const emailContent = buildTestEmail(session.user.name || "Kullanıcı");

    const result = await sendEmail({
      to: userEmail,
      subject: emailContent.subject,
      text: emailContent.text,
    });

    await logEmail({
      userId: session.user.id,
      to: userEmail,
      subject: emailContent.subject,
      body: emailContent.text,
      event: "TEST",
      status: result?.success ? "SENT" : "FAILED",
      error: result?.success ? undefined : (result?.error ?? "E-posta gönderilemedi"),
    });

    if (!result?.success) {
      return NextResponse.json({
        success: false,
        error: `E-posta gönderilemedi: ${result?.error ?? "RESEND_API_KEY tanımlı değil"}`,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Test e-postası gönderildi." });
  } catch (error) {
    console.error("[email-test] POST error:", error);
    return NextResponse.json({ success: false, error: "E-posta gönderilemedi." }, { status: 500 });
  }
}
