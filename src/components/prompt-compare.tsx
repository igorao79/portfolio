"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface PromptPair {
  bad: { ru: string; en: string };
  good: { ru: string[]; en: string[] };
}

const prompts: PromptPair[] = [
  {
    bad: { ru: "сделай мне кнопку", en: "make me a button" },
    good: {
      ru: [
        "Создай компонент Button на React + TypeScript.",
        "Используй forwardRef, variant: primary | ghost | outline,",
        "size: sm | md | lg. Стилизуй через cva.",
      ],
      en: [
        "Create a Button component in React + TypeScript.",
        "Use forwardRef, variant: primary | ghost | outline,",
        "size: sm | md | lg. Style with cva.",
      ],
    },
  },
  {
    bad: { ru: "сделай авторизацию", en: "add auth" },
    good: {
      ru: [
        "Реализуй JWT авторизацию с refresh-токенами.",
        "Эндпоинты: POST /auth/login, POST /auth/refresh.",
        "Храни токены в httpOnly cookies. Middleware для защиты роутов.",
      ],
      en: [
        "Implement JWT auth with refresh tokens.",
        "Endpoints: POST /auth/login, POST /auth/refresh.",
        "Store tokens in httpOnly cookies. Middleware for protected routes.",
      ],
    },
  },
  {
    bad: { ru: "сделай форму", en: "make a form" },
    good: {
      ru: [
        "Создай форму обратной связи с react-hook-form + zod.",
        "Поля: name (string, min 2), email (valid email),",
        "message (string, min 10). Валидация на blur, submit на /api/contact.",
      ],
      en: [
        "Create a contact form with react-hook-form + zod.",
        "Fields: name (string, min 2), email (valid email),",
        "message (string, min 10). Validate on blur, submit to /api/contact.",
      ],
    },
  },
  {
    bad: { ru: "добавь тёмную тему", en: "add dark mode" },
    good: {
      ru: [
        "Добавь переключатель темы через next-themes.",
        "Используй attribute='class', defaultTheme='system'.",
        "CSS-переменные в oklch для light/dark. Анимация через View Transitions API.",
      ],
      en: [
        "Add theme toggle via next-themes.",
        "Use attribute='class', defaultTheme='system'.",
        "CSS vars in oklch for light/dark. Animate via View Transitions API.",
      ],
    },
  },
  {
    bad: { ru: "оптимизируй сайт", en: "optimize the site" },
    good: {
      ru: [
        "Проведи аудит LCP, CLS, FID через Lighthouse.",
        "Lazy-load изображения через next/image, добавь priority для hero.",
        "Code-split через dynamic(), prefetch критичные роуты.",
      ],
      en: [
        "Audit LCP, CLS, FID via Lighthouse.",
        "Lazy-load images via next/image, add priority for hero.",
        "Code-split via dynamic(), prefetch critical routes.",
      ],
    },
  },
];

// Typing speed in ms per character
const CHAR_DELAY = 35;
const PAUSE_BETWEEN = 800;
const DISPLAY_TIME = 3000;

export function PromptCompare({ locale }: { locale: Locale }) {
  const [pairIdx, setPairIdx] = useState(0);
  const [badText, setBadText] = useState("");
  const [goodLines, setGoodLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<"bad" | "pause" | "good" | "display">("bad");

  const pair = prompts[pairIdx];

  const typeText = useCallback(
    (
      fullText: string,
      setter: (v: string) => void,
      onDone: () => void
    ) => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setter(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(interval);
          onDone();
        }
      }, CHAR_DELAY);
      return () => clearInterval(interval);
    },
    []
  );

  const typeLines = useCallback(
    (
      lines: string[],
      setter: (v: string[]) => void,
      onDone: () => void
    ) => {
      let lineIdx = 0;
      let charIdx = 0;
      const result: string[] = [];
      const interval = setInterval(() => {
        if (lineIdx >= lines.length) {
          clearInterval(interval);
          onDone();
          return;
        }
        charIdx++;
        result[lineIdx] = lines[lineIdx].slice(0, charIdx);
        setter([...result]);
        if (charIdx >= lines[lineIdx].length) {
          lineIdx++;
          charIdx = 0;
        }
      }, CHAR_DELAY);
      return () => clearInterval(interval);
    },
    []
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (phase === "bad") {
      setBadText("");
      setGoodLines([]);
      cleanup = typeText(pair.bad[locale], setBadText, () => {
        setTimeout(() => setPhase("pause"), PAUSE_BETWEEN);
      });
    } else if (phase === "pause") {
      setTimeout(() => setPhase("good"), 300);
    } else if (phase === "good") {
      cleanup = typeLines(pair.good[locale], setGoodLines, () => {
        setPhase("display");
      });
    } else if (phase === "display") {
      const timer = setTimeout(() => {
        setPairIdx((prev) => (prev + 1) % prompts.length);
        setPhase("bad");
      }, DISPLAY_TIME);
      return () => clearTimeout(timer);
    }

    return cleanup;
  }, [phase, pair, locale, typeText, typeLines]);

  // Reset when locale changes
  useEffect(() => {
    setBadText("");
    setGoodLines([]);
    setPhase("bad");
  }, [locale]);

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {/* Bad prompt — LEFT */}
      <div className="overflow-hidden rounded-lg border border-red-500/30 bg-black/90 dark:bg-black/70">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <X className="h-3.5 w-3.5 text-red-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
            {locale === "ru" ? "Неправильно" : "Bad"}
          </span>
        </div>
        <div className="p-3">
          <p className="font-mono text-[11px] leading-relaxed text-red-400 sm:text-xs">
            $ prompt:
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-gray-300 sm:text-xs">
            {badText}
            {phase === "bad" && (
              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-red-400" />
            )}
          </p>
        </div>
      </div>

      {/* Good prompt — RIGHT */}
      <div className="overflow-hidden rounded-lg border border-emerald-500/30 bg-black/90 dark:bg-black/70">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            {locale === "ru" ? "Правильно" : "Good"}
          </span>
        </div>
        <div className="p-3">
          <p className="font-mono text-[11px] leading-relaxed text-emerald-400 sm:text-xs">
            $ prompt:
          </p>
          {goodLines.map((line, i) => (
            <p
              key={i}
              className="font-mono text-[11px] leading-relaxed text-gray-300 sm:text-xs"
            >
              {line}
              {phase === "good" && i === goodLines.length - 1 && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400" />
              )}
            </p>
          ))}
          {(phase === "bad" || phase === "pause") && goodLines.length === 0 && (
            <p className="font-mono text-[11px] text-gray-500 sm:text-xs">
              {locale === "ru" ? "ожидание..." : "waiting..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
