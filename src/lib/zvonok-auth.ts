/**
 * «Войти через Звоночек» — серверная половина OIDC-клиента.
 *
 * Звоночек (https://zvo.is) — полноценный OpenID Connect провайдер:
 * Authorization Code + PKCE (S256), discovery, JWKS. Никакого SDK и никакого
 * bot-токена здесь нет и быть не может — bot-токен это ключ от API бота, а не
 * от логина пользователя; вход выдаёт зарегистрированное OAuth-приложение
 * (client_id) из BotCreator.
 *
 * Приложение регистрируется как PUBLIC-клиент: провайдер требует https для
 * confidential-клиентов, а на локалке у нас http. Public-клиент секрета не
 * имеет вовсе (и присланный секрет там — ошибка), безопасность держится на
 * PKCE + побайтовой сверке redirect_uri.
 */
import crypto from "node:crypto";

export const ISSUER = (process.env.ZVONOK_ISSUER ?? "https://zvo.is").replace(/\/+$/, "");
export const CLIENT_ID = process.env.ZVONOK_CLIENT_ID ?? "";
export const CLIENT_SECRET = process.env.ZVONOK_CLIENT_SECRET ?? "";
export const SCOPE = process.env.ZVONOK_SCOPE ?? "openid profile";

export const PKCE_COOKIE = "zvo_pkce";
export const SESSION_COOKIE = "zvo_session";

/**
 * Ключ подписи cookie. Без ZVONOK_AUTH_SECRET берём случайный на процесс:
 * для локальной проверки этого хватает, но рестарт dev-сервера разлогинит —
 * поэтому в .env.example он есть.
 */
const SECRET =
  process.env.ZVONOK_AUTH_SECRET || crypto.randomBytes(32).toString("hex");

export interface ZvonokProfile {
  sub: string;
  name: string | null;
  username: string | null;
  picture: string | null;
}

interface Session extends ZvonokProfile {
  /** Нужен только чтобы отозвать доступ на выходе. */
  accessToken?: string;
  exp: number;
}

// ───────────────────────────── discovery ─────────────────────────────

interface Discovery {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint?: string;
  issuer: string;
}

let discoveryCache: { at: number; value: Discovery } | null = null;

/** Discovery кэшируется на час — ровно как её отдаёт сам провайдер. */
export async function discover(): Promise<Discovery> {
  if (discoveryCache && Date.now() - discoveryCache.at < 3_600_000) {
    return discoveryCache.value;
  }
  const res = await fetch(`${ISSUER}/.well-known/openid-configuration`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`discovery failed: HTTP ${res.status}`);
  }
  const value = (await res.json()) as Discovery;
  discoveryCache = { at: Date.now(), value };
  return value;
}

// ─────────────────────────────── PKCE ────────────────────────────────

export function randomUrlSafe(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function challengeFor(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ─────────────────────── подписанные cookie ──────────────────────────

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function seal(data: unknown): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function unseal<T>(token: string | undefined): T | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(payload);
  // timingSafeEqual падает на разной длине — сравниваем длины заранее.
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function readSession(raw: string | undefined): ZvonokProfile | null {
  const session = unseal<Session>(raw);
  if (!session || typeof session.exp !== "number" || session.exp < Date.now()) {
    return null;
  }
  const { sub, name, username, picture } = session;
  return { sub, name, username, picture };
}

export function readSessionRaw(raw: string | undefined): Session | null {
  const session = unseal<Session>(raw);
  if (!session || typeof session.exp !== "number" || session.exp < Date.now()) {
    return null;
  }
  return session;
}

export function makeSession(profile: ZvonokProfile, accessToken: string, ttlMs: number): string {
  return seal({ ...profile, accessToken, exp: Date.now() + ttlMs } satisfies Session);
}

// ───────────────────────────── redirect_uri ──────────────────────────

/**
 * redirect_uri сверяется провайдером ПОБАЙТОВО, поэтому он должен совпасть с
 * зарегистрированным символ в символ. Берём его из запроса, чтобы одна и та же
 * сборка работала и локально, и на проде, но локально требуем именно
 * 127.0.0.1: `localhost` в список loopback-хостов провайдера не входит
 * (RFC 8252 §7.3), и вход с него был бы отвергнут уже после редиректа.
 */
export function redirectUriFor(req: Request): string {
  return process.env.ZVONOK_REDIRECT_URI || `${siteOrigin(req)}/api/auth/zvonok/callback`;
}

/**
 * Origin строим из заголовка Host, а не из `nextUrl`: dev-сервер Next
 * нормализует 127.0.0.1 в localhost, и выведенный из него redirect_uri
 * перестал бы совпадать с зарегистрированным (сверка побайтовая).
 */
export function siteOrigin(req: Request): string {
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** Пояснимая причина, по которой вход заведомо не получится. */
export function configProblem(redirectUri: string): string | null {
  if (!CLIENT_ID) {
    return "ZVONOK_CLIENT_ID не задан — зарегистрируйте OAuth-приложение бота в BotCreator и положите client_id в .env.local";
  }
  const url = new URL(redirectUri);
  if (url.protocol === "http:" && url.hostname !== "127.0.0.1" && url.hostname !== "::1") {
    return `Звоночек принимает http только для loopback-адреса. Откройте сайт по http://127.0.0.1:${url.port || "80"}, а не по ${url.hostname}`;
  }
  return null;
}

/** Куда возвращать пользователя после логина: только свои же пути. */
export function safeReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export const cookieBase = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
});
