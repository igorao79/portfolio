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
        "Храни токены в httpOnly cookies.",
      ],
      en: [
        "Implement JWT auth with refresh tokens.",
        "Endpoints: POST /auth/login, POST /auth/refresh.",
        "Store tokens in httpOnly cookies.",
      ],
    },
  },
  {
    bad: { ru: "сделай форму", en: "make a form" },
    good: {
      ru: [
        "Создай форму с react-hook-form + zod.",
        "Поля: name (min 2), email (valid), message (min 10).",
        "Валидация на blur, submit на /api/contact.",
      ],
      en: [
        "Create a form with react-hook-form + zod.",
        "Fields: name (min 2), email (valid), message (min 10).",
        "Validate on blur, submit to /api/contact.",
      ],
    },
  },
  {
    bad: { ru: "добавь тёмную тему", en: "add dark mode" },
    good: {
      ru: [
        "Добавь переключатель темы через next-themes.",
        "attribute='class', defaultTheme='system'.",
        "CSS-переменные в oklch. View Transitions API.",
      ],
      en: [
        "Add theme toggle via next-themes.",
        "attribute='class', defaultTheme='system'.",
        "CSS vars in oklch. View Transitions API.",
      ],
    },
  },
  {
    bad: { ru: "оптимизируй сайт", en: "optimize the site" },
    good: {
      ru: [
        "Аудит LCP, CLS, FID через Lighthouse.",
        "Lazy-load через next/image, priority для hero.",
        "Code-split через dynamic(), prefetch роуты.",
      ],
      en: [
        "Audit LCP, CLS, FID via Lighthouse.",
        "Lazy-load via next/image, priority for hero.",
        "Code-split via dynamic(), prefetch routes.",
      ],
    },
  },
];

const MAX_GOOD_LINES = 3;
const CHAR_DELAY = 35;
const PAUSE_BETWEEN = 800;
const DISPLAY_TIME = 3000;

/* ── Dancing Crab SVG (Claude Code style, pixel art) ── */
function DancingCrab({ phase }: { phase: string }) {
  const show = phase === "display";
  return (
    <div
      className={`mt-2 flex items-center justify-center transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      style={{ height: 32 }}
    >
      {show && (
        <svg
          width="40"
          height="28"
          viewBox="0 0 40 28"
          fill="none"
          className="animate-bounce"
          style={{ animationDuration: "0.6s" }}
        >
          {/* Body */}
          <rect x="12" y="8" width="16" height="12" rx="3" fill="#e07850" />
          {/* Eyes */}
          <rect x="16" y="11" width="3" height="3" fill="#1a1a1a" />
          <rect x="22" y="11" width="3" height="3" fill="#1a1a1a" />
          {/* Mouth */}
          <rect x="18" y="16" width="5" height="2" rx="1" fill="#c0603a" />
          {/* Left claw */}
          <rect x="4" y="6" width="8" height="4" rx="2" fill="#e07850" />
          <rect x="4" y="4" width="4" height="4" rx="1" fill="#e07850" />
          {/* Right claw */}
          <rect x="28" y="6" width="8" height="4" rx="2" fill="#e07850" />
          <rect x="32" y="4" width="4" height="4" rx="1" fill="#e07850" />
          {/* Legs */}
          <rect x="14" y="20" width="2" height="4" rx="1" fill="#c0603a" />
          <rect x="18" y="20" width="2" height="4" rx="1" fill="#c0603a" />
          <rect x="22" y="20" width="2" height="4" rx="1" fill="#c0603a" />
          <rect x="26" y="20" width="2" height="4" rx="1" fill="#c0603a" />
        </svg>
      )}
    </div>
  );
}

export function PromptCompare({ locale }: { locale: Locale }) {
  const [pairIdx, setPairIdx] = useState(0);
  const [badText, setBadText] = useState("");
  const [goodLines, setGoodLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<"bad" | "pause" | "good" | "display">("bad");

  const pair = prompts[pairIdx];

  const typeText = useCallback(
    (fullText: string, setter: (v: string) => void, onDone: () => void) => {
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
    (lines: string[], setter: (v: string[]) => void, onDone: () => void) => {
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

  useEffect(() => {
    setBadText("");
    setGoodLines([]);
    setPhase("bad");
  }, [locale]);

  const cursor = (color: string) => (
    <span
      className={`ml-0.5 inline-block w-1.5 translate-y-[2px] animate-pulse ${color}`}
      style={{ height: "0.85em" }}
    />
  );

  // Fixed height for both panels (header ~30px + content area)
  const PANEL_HEIGHT = "11rem";

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {/* Bad prompt — LEFT */}
      <div
        className="flex flex-col overflow-hidden rounded-lg border border-red-500/30 bg-black/90 dark:bg-black/70"
        style={{ height: PANEL_HEIGHT }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <X className="h-3.5 w-3.5 text-red-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
            {locale === "ru" ? "Неправильно" : "Bad"}
          </span>
        </div>
        <div className="flex-1 overflow-hidden p-3">
          <p className="font-mono text-[11px] leading-relaxed text-red-400 sm:text-xs">
            $ prompt:
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-gray-300 sm:text-xs">
            {badText}
            {phase === "bad" && cursor("bg-red-400")}
          </p>
        </div>
      </div>

      {/* Good prompt — RIGHT */}
      <div
        className="flex flex-col overflow-hidden rounded-lg border border-emerald-500/30 bg-black/90 dark:bg-black/70"
        style={{ height: PANEL_HEIGHT }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            {locale === "ru" ? "Правильно" : "Good"}
          </span>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <p className="font-mono text-[11px] leading-relaxed text-emerald-400 sm:text-xs">
            $ prompt:
          </p>
          {Array.from({ length: MAX_GOOD_LINES }).map((_, i) => (
            <p
              key={i}
              className="font-mono text-[11px] leading-relaxed text-gray-300 sm:text-xs"
              style={{ minHeight: "1.25em" }}
            >
              {goodLines[i] || "\u00A0"}
              {phase === "good" &&
                i === goodLines.length - 1 &&
                goodLines.length > 0 &&
                cursor("bg-emerald-400")}
            </p>
          ))}
          {(phase === "bad" || phase === "pause") && goodLines.length === 0 && (
            <p className="font-mono text-[11px] text-gray-500 sm:text-xs">
              {locale === "ru" ? "ожидание..." : "waiting..."}
            </p>
          )}
          {/* Dancing crab on success */}
          <DancingCrab phase={phase} />
        </div>
      </div>
    </div>
  );
}
