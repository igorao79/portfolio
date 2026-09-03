import { NextRequest, NextResponse } from "next/server";
import {
  absolutePicture,
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER,
  PKCE_COOKIE,
  SESSION_COOKIE,
  cookieBase,
  discover,
  makeSession,
  safeReturnTo,
  siteOrigin,
  unseal,
} from "@/lib/zvonok-auth";

interface Pending {
  verifier: string;
  state: string;
  nonce: string;
  redirectUri: string;
  returnTo: string;
}

/** Шаг 2: меняем код на токен и забираем профиль. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const pending = unseal<Pending>(req.cookies.get(PKCE_COOKIE)?.value);
  const home = new URL(safeReturnTo(pending?.returnTo ?? null), siteOrigin(req));

  const fail = (message: string) => {
    home.searchParams.set("zvo_error", message);
    const res = NextResponse.redirect(home);
    res.cookies.delete(PKCE_COOKIE);
    return res;
  };

  if (params.get("error")) {
    const code = params.get("error");
    return fail(
      code === "access_denied"
        ? "Вход отменён"
        : `Звоночек отклонил запрос: ${params.get("error_description") || code}`
    );
  }
  if (!pending) return fail("Сессия входа истекла — попробуйте ещё раз");
  // state связывает редирект с той вкладкой, из которой начали вход.
  if (params.get("state") !== pending.state) return fail("Не совпал state — вход прерван");
  // RFC 9207: провайдер объявил поддержку iss в ответе, так что если он
  // пришёл — он обязан быть нашим.
  const iss = params.get("iss");
  if (iss && iss.replace(/\/+$/, "") !== ISSUER) return fail("Ответ пришёл от чужого провайдера");

  const code = params.get("code");
  if (!code) return fail("Звоночек не вернул код авторизации");

  try {
    const { token_endpoint, userinfo_endpoint } = await discover();

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: pending.redirectUri,
      code_verifier: pending.verifier,
      client_id: CLIENT_ID,
    });
    // Public-клиент секрета не шлёт вовсе — провайдер отвергнет запрос с ним.
    if (CLIENT_SECRET) body.set("client_secret", CLIENT_SECRET);

    const tokenRes = await fetch(token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      return fail(`Обмен кода не удался: ${tokens.error_description || tokens.error || tokenRes.status}`);
    }

    // Профиль берём с /userinfo, а не из id_token: это прямой backchannel-
    // запрос к провайдеру по TLS с только что полученным токеном, так что
    // проверять подпись JWT здесь нечего.
    const userRes = await fetch(userinfo_endpoint, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!userRes.ok) return fail(`Не удалось получить профиль: HTTP ${userRes.status}`);
    const claims = await userRes.json();

    const ttlMs = Math.max(60, Number(tokens.expires_in) || 3600) * 1000;
    const res = NextResponse.redirect(home);
    res.cookies.delete(PKCE_COOKIE);
    res.cookies.set(
      SESSION_COOKIE,
      makeSession(
        {
          sub: String(claims.sub),
          name: claims.name ?? null,
          username: claims.preferred_username ?? null,
          picture: absolutePicture(claims.picture),
        },
        tokens.access_token,
        ttlMs
      ),
      { ...cookieBase(siteOrigin(req).startsWith("https:")), maxAge: Math.floor(ttlMs / 1000) }
    );
    return res;
  } catch (e) {
    return fail(`Ошибка обмена: ${String(e)}`);
  }
}
