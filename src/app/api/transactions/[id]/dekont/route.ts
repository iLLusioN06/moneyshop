// =============================================
// MoneyShop - Dekont (Receipt) API
// =============================================
// GET  /api/transactions/[id]/dekont          → JSON (view)
// GET  /api/transactions/[id]/dekont?format=pdf → PDF (download)
// POST /api/transactions/[id]/dekont          → E-posta ile gönder
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDekontPdf, buildDekontEmail } from "@/lib/dekont";
import type { DekontData } from "@/lib/dekont";
import { sendNotification } from "@/lib/email";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

// ─── Shared: verify and fetch transaction ───────────────

async function getTransaction(userId: string, id: string) {
  return prisma.transaction.findFirst({
    where: { id, userId },
    include: { account: true, category: true },
  });
}

function buildDekontData(
  transaction: NonNullable<Awaited<ReturnType<typeof getTransaction>>>,
  userName: string
): DekontData {
  const referenceNo = `MS-${transaction.id.slice(0, 8).toUpperCase()}-${transaction.createdAt.getTime().toString(36).toUpperCase()}`;
  return {
    transaction: transaction as unknown as DekontData["transaction"],
    userName,
    referenceNo,
  };
}

// ─── GET — JSON (view) or PDF (download) ────────────────

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = new URL(req.url).searchParams;
    const format = searchParams.get("format") || "json";

    const transaction = await getTransaction(session.user.id, id);
    if (!transaction) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 404 });
    }

    const userName = session.user.name || "Kullanıcı";
    const data = buildDekontData(transaction, userName);

    if (format === "pdf") {
      const pdfBuffer = generateDekontPdf(data);
      const filename = `dekont-${data.referenceNo}.pdf`;

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // JSON (default)
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[dekont] GET error:", error);
    return NextResponse.json(
      { error: "Dekont alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

// ─── POST — Send receipt via email ──────────────────────

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await getTransaction(session.user.id, id);
    if (!transaction) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 404 });
    }

    const userName = session.user.name || "Kullanıcı";
    const data = buildDekontData(transaction, userName);

    // E-postayı gönder
    const sent = await sendNotification(
      session.user.id,
      transaction.type === "TRANSFER" ? "TRANSFER" : "TRANSACTION",
      () => buildDekontEmail(data)
    );

    // Audit log
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: session.user.id,
      action: "SEND",
      entity: "TRANSACTION",
      entityId: transaction.id,
      details: { action: "dekont_gonder", referenceNo: data.referenceNo },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (!sent) {
      return NextResponse.json({
        success: false,
        message: "E-posta gönderilemedi. Bildirim ayarlarınızı kontrol edin.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Dekont e-posta adresinize gönderildi.",
    });
  } catch (error) {
    console.error("[dekont] POST error:", error);
    return NextResponse.json(
      { error: "Dekont gönderilirken hata oluştu." },
      { status: 500 }
    );
  }
}
