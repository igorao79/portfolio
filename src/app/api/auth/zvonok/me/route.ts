import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/zvonok-auth";

export async function GET(req: NextRequest) {
  const profile = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json(
    { user: profile },
    { headers: { "Cache-Control": "no-store" } }
  );
}
