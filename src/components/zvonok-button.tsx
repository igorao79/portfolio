"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import type { useZvonokAuth } from "@/hooks/use-zvonok-auth";
import type { ZvonokProfile } from "@/hooks/use-zvonok-auth";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Auth = ReturnType<typeof useZvonokAuth>;

interface Props {
  auth: Auth;
  locale: Locale;
  /** Куда открывать карточку: влево от колонки (десктоп) или вверх (мобилка). */
  placement: "left" | "top";
  className?: string;
  onMouseEnter?: () => void;
}

/**
 * Круглая кнопка входа через Звоночек — того же размера и стиля, что соседи
 * по сайдбару. Пока не вошли, на ней логотип мессенджера; после входа —
 * аватар аккаунта, а по клику раскрывается карточка с ником и выходом.
 */
export function ZvonokButton({ auth, locale, placement, className, onMouseEnter }: Props) {
  const tr = t(locale).zvonok;
  const { user, ready, busy, error, setError, logout } = auth;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // До ответа /me кнопку не рисуем: иначе на секунду мелькнёт «войти» у того,
  // кто уже вошёл.
  if (!ready) return null;

  const card =
    placement === "left"
      ? "absolute right-full top-0 mr-3"
      : "absolute bottom-full right-0 mb-3";

  return (
    <div ref={rootRef} className="relative">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              card,
              "flex w-64 max-w-[calc(100vw-2rem)] items-start gap-2 rounded-xl border border-destructive/40 bg-card px-3 py-2 text-left text-xs leading-snug shadow-xl"
            )}
          >
            <span className="flex-1">
              <span className="font-semibold">{tr.failed}. </span>
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="mt-0.5 shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && user && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              card,
              "w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-3 text-left shadow-xl"
            )}
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
              onMouseEnter={onMouseEnter}
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
          onMouseEnter={onMouseEnter}
          aria-label={user.username ? `@${user.username}` : tr.loginShort}
          className={cn(className, open && "border-primary")}
        >
          <Face user={user} />
        </button>
      ) : (
        <a
          href="/api/auth/zvonok/login"
          onMouseEnter={onMouseEnter}
          aria-label={tr.login}
          className={className}
        >
          <Face user={null} />
        </a>
      )}
    </div>
  );
}

/** Аватар вошедшего или логотип Звоночка — оба заполняют кружок целиком. */
function Face({ user }: { user: ZvonokProfile | null }) {
  const [broken, setBroken] = useState(false);
  const src = user ? user.picture : "/zvonok.webp";

  if (!src || broken) {
    const initial = (user?.name ?? user?.username ?? "?").trim().charAt(0).toUpperCase();
    return (
      <span className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {initial}
      </span>
    );
  }
  return (
    // Обычный <img>: аватар приходит подписанным URL с домена Звоночка, и
    // гонять его через next/image ради 40px незачем.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="h-full w-full rounded-full object-cover"
    />
  );
}
