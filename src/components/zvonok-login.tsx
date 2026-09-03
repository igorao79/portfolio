"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, X } from "lucide-react";
import { useApp } from "@/context/app-context";
import { useHoverSound } from "@/hooks/use-hover-sound";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Profile {
  sub: string;
  name: string | null;
  username: string | null;
  picture: string | null;
}

/**
 * Демонстрация «Войти через Звоночек»: OIDC-логин в собственном мессенджере.
 * Кнопка живёт слева внизу — справа по центру уже стоит сайдбар, а снизу на
 * мобилке таб-бар, поэтому на узких экранах поднимаемся над ним.
 */
export function ZvonokLogin() {
  const { locale } = useApp();
  const tr = t(locale).zvonok;
  const playHover = useHoverSound();

  const [user, setUser] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/zvonok/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Ошибку колбэк приносит в query — показываем и сразу убираем из адреса,
  // чтобы она не всплыла снова при перезагрузке.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("zvo_error");
    if (!message) return;
    setError(message);
    params.delete("zvo_error");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/zvonok/logout", { method: "POST" });
      setUser(null);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }, []);

  if (!ready) return null;

  const label = user?.username ? `@${user.username}` : user?.name ?? tr.loginShort;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex flex-col items-start gap-2 md:bottom-6 lg:left-6">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex max-w-[min(20rem,calc(100vw-2rem))] items-start gap-2 rounded-xl border border-destructive/40 bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-lg"
          >
            <span className="flex-1">
              <span className="font-semibold">{tr.failed}. </span>
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && user && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="w-56 rounded-2xl border border-border bg-card p-3 shadow-xl"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {tr.signedInAs}
            </p>
            <p className="mt-1 truncate text-sm font-semibold">{user.name ?? "—"}</p>
            {user.username && (
              <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
            )}
            <button
              onClick={logout}
              disabled={busy}
              onMouseEnter={playHover}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {tr.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {user ? (
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={playHover}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3.5 shadow-sm transition-all hover:scale-105 hover:shadow-md",
            open && "border-primary"
          )}
        >
          <Avatar user={user} />
          <span className="max-w-32 truncate text-xs font-semibold">{label}</span>
        </button>
      ) : (
        <a
          href="/api/auth/zvonok/login"
          onMouseEnter={playHover}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 shadow-sm transition-all hover:scale-105 hover:shadow-md"
        >
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">{tr.login}</span>
        </a>
      )}
    </div>
  );
}

function Avatar({ user }: { user: Profile }) {
  const [broken, setBroken] = useState(false);
  const initial = (user.name ?? user.username ?? "?").trim().charAt(0).toUpperCase();

  if (!user.picture || broken) {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
        {initial}
      </span>
    );
  }
  return (
    // Обычный <img>: аватар приходит подписанным URL с домена Звоночка, и
    // гонять его через next/image ради 28px незачем.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.picture}
      alt=""
      width={28}
      height={28}
      onError={() => setBroken(true)}
      className="h-7 w-7 rounded-full object-cover"
    />
  );
}
