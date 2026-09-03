import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  SESSION_COOKIE,
  discover,
  readSessionRaw,
} from "@/lib/zvonok-auth";

export async function POST(req: NextRequest) {
  const session = readSessionRaw(req.cookies.get(SESSION_COOKIE)?.value);

  // Гасим токен на стороне Звоночка, а не только выбрасываем cookie: иначе
  // выданный доступ жил бы до истечения exp уже после «выхода».
  if (session?.accessToken) {
    try {
      const { revocation_endpoint } = await discover();
      if (revocation_endpoint) {
        const body = new URLSearchParams({ token: session.accessToken, client_id: CLIENT_ID });
        if (CLIENT_SECRET) body.set("client_secret", CLIENT_SECRET);
        await fetch(revocation_endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
          cache: "no-store",
        });
      }
    } catch {
      // Отзыв — best effort: локальный выход важнее и должен случиться всегда.
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
