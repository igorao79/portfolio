"use client";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LocaleText } from "@/components/ui/locale-text";

const DEVELOPER_URL =
  "https://apps.apple.com/ru/developer/igor-titor/id6776274160";

/* Apple (simple-icons, один path) — currentColor, чтобы жить в обеих темах. */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

const TEXT = {
  ru: {
    program: "Apple Developer Program",
    status: "Аккаунт подтверждён",
    body: "Личность и реквизиты проверены Apple, страница разработчика открыта в App Store. Под этим аккаунтом опубликован Звоночек — он прошёл ревью и лежит в сторе.",
    cta: "Открыть в App Store",
  },
  en: {
    program: "Apple Developer Program",
    status: "Verified account",
    body: "Identity and details verified by Apple, with a public developer page on the App Store. Zvonochek ships under this account — it passed review and is live in the store.",
    cta: "Open on the App Store",
  },
} as const;

/**
 * Карточка-пруф: аккаунт в Apple Developer Program со своей страницей в
 * App Store. Вся карточка — ссылка, проверить можно в один клик.
 */
export function AppleDeveloper({ locale }: { locale: Locale }) {
  const t = TEXT[locale];

  return (
    <a
      href={DEVELOPER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md sm:items-center sm:gap-5 sm:p-6"
    >
      {/* Яблоко */}
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-foreground sm:h-14 sm:w-14">
        <AppleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {t.program}
        </p>

        <h3 className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-lg font-semibold sm:text-xl">
          Igor Titor
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            <LocaleText locale={locale} ru={TEXT.ru.status} en={TEXT.en.status} />
          </span>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <LocaleText locale={locale} ru={TEXT.ru.body} en={TEXT.en.body} />
        </p>

        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          <LocaleText locale={locale} ru={TEXT.ru.cta} en={TEXT.en.cta} />
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}
