import "server-only";

import { NextResponse } from "next/server";
import { totesLesReceptes } from "@/content/private/alquimia";

export function GET() {
  return NextResponse.json({ receptes: totesLesReceptes() });
}
