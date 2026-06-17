// =============================================
// MoneyShop - OpenAPI Spec JSON Endpoint
// =============================================
// Serves the OpenAPI 3.0 specification as JSON
// for consumption by Swagger UI.
// Sadece development modunda veya admin kullanıcılar için erişilebilir.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import spec from "@/lib/openapi";

export async function GET() {
  // Production'da sadece admin erişebilir
  if (process.env.NODE_ENV === "production") {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Erişim engellendi." }, { status: 403 });
    }
  }

  return NextResponse.json(spec);
}
