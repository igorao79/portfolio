import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_ID,
  PKCE_COOKIE,
  SCOPE,
  challengeFor,
  configProblem,
  cookieBase,
  discover,
  randomUrlSafe,
  redirectUriFor,
  safeReturnTo,
  seal,
  siteOrigin,
} from "@/lib/zvonok-auth";

/** Шаг 1: уводим пользователя на экран согласия Звоночка. */
export async function GET(req: NextRequest) {
  const redirectUri = redirectUriFor(req);
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("return_to"));
  const home = new URL(returnTo, siteOrigin(req));

  const problem = configProblem(redirectUri);
  if (problem) {
    home.searchParams.set("zvo_error", problem);
    return NextResponse.redirect(home);
  }

  let authorizationEndpoint: string;
  try {
    ({ authorization_endpoint: authorizationEndpoint } = await discover());
  } catch {
    home.searchParams.set("zvo_error", "Звоночек недоступен — не удалось получить discovery-документ");
    return NextResponse.redirect(home);
  }

  const verifier = randomUrlSafe();
  const state = randomUrlSafe();
  const nonce = randomUrlSafe();

  const authorize = new URL(authorizationEndpoint);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", CLIENT_ID);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", SCOPE);
  authorize.searchParams.set("state", state);
  // nonce обязателен при scope=openid: без него id_token нельзя привязать
  // к конкретному входу.
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", challengeFor(verifier));
  authorize.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authorize);
  res.cookies.set(PKCE_COOKIE, seal({ verifier, state, nonce, redirectUri, returnTo }), {
    ...cookieBase(siteOrigin(req).startsWith("https:")),
    maxAge: 600,
  });
  return res;
}
