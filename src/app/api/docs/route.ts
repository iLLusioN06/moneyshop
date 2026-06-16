// =============================================
// MoneyShop - OpenAPI Spec JSON Endpoint
// =============================================
// Serves the OpenAPI 3.0 specification as JSON
// for consumption by Swagger UI.
// =============================================

import { NextResponse } from "next/server";
import spec from "@/lib/openapi";

export async function GET() {
  return NextResponse.json(spec);
}
