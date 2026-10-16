"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, KeyRound, X } from "lucide-react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { lockPageScroll } from "@/lib/lock-scroll";

interface Props {
  open: boolean;
  locale: Locale;
  onClose: () => void;
}

/**
 * Что вообще делает лисёнок в панели: кружок ведёт не на внешний сайт, а
 * сюда — объяснить, что это OAuth через мой же мессенджер, и уже отсюда
 * отправить на реальный вход.
 */
export function ZvonokInfoModal({ open, locale, onClose }: Props) {
  const tr = t(locale).zvonok;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const unlock = lockPageScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Кнопка живёт в сайдбаре, а у того -translate-y-1/2 — transform делает
  // контейнер для fixed-потомков, и оверлей без портала прилипает к колонке
  // вместо экрана.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-2xl sm:p-7"
          >
            <button
              onClick={onClose}
              aria-label={tr.close}
              className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
                <Image src="/zvonok.webp" alt="" width={48} height={48} className="h-full w-full object-cover" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-xl font-bold tracking-tight">
                  {tr.modalTitle}
                </h3>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <KeyRound className="h-3 w-3" />
                  OAuth 2.0 · OIDC
                </p>
              </div>
            </div>

            {/* Обе локали друг на друге — высота модалки не прыгает при
                переключении языка. */}
            <div className="mt-5 grid">
              {(["ru", "en"] as const).map((l) => (
                <div
                  key={l}
                  style={{ gridArea: "1 / 1" }}
                  aria-hidden={l !== locale}
                  className={l === locale ? undefined : "invisible"}
                >
                  <p className="text-sm font-medium leading-relaxed">
                    {t(l).zvonok.modalLead}
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {t(l).zvonok.modalBody}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="/api/auth/zvonok/login"
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                {tr.modalTry}
              </a>
              <a
                href="https://zvonochek.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
                {tr.modalAbout}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
