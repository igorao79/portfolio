"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Держит высоту блока одинаковой на обоих языках: обе версии лежат в одной
 * ячейке грида, неактивная остаётся невидимой распоркой. Без этого русский
 * текст переносится на лишнюю строку, и страница меняет высоту — а вместе с
 * ней уезжает скролл — каждый раз при переключении RU/EN.
 */
export function LocaleText({
  locale,
  ru,
  en,
  className,
}: {
  locale: Locale;
  ru: ReactNode;
  en: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("grid", className)}>
      {(["ru", "en"] as const).map((l) => (
        <span
          key={l}
          style={{ gridArea: "1 / 1" }}
          aria-hidden={l !== locale}
          className={l === locale ? undefined : "invisible"}
        >
          {l === "ru" ? ru : en}
        </span>
      ))}
    </span>
  );
}
