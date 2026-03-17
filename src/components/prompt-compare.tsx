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

/* ── Claw'd pixel crab (Claude Code style, 8-bit, theme-aware) ── */
function Clawd() {
  // Exact pixel grid matching the Claude Code welcome screen crab
  // Each rect = 1 pixel unit in a 15x11 grid, scaled up
  const S = 3; // scale factor
  // prettier-ignore
  const pixels: [number, number, number, number, string][] = [
    // Claws (raised up)
    // Left claw
    [1,2,1,1,"fill"], [2,1,1,1,"fill"], [2,2,1,1,"fill"], [3,2,1,1,"fill"],
    // Right claw
    [11,2,1,1,"fill"], [12,1,1,1,"fill"], [12,2,1,1,"fill"], [13,2,1,1,"fill"],
    // Body top row
    [4,3,7,1,"fill"],
    // Body middle (with eyes)
    [3,4,9,1,"fill"],
    // Eyes row
    [3,5,2,1,"fill"], [6,5,3,1,"fill"], [10,5,2,1,"fill"],
    // Eye pixels (inverted - these are the dark squares)
    [5,5,1,1,"eye"], [9,5,1,1,"eye"],
    // Body rows
    [3,6,9,1,"fill"],
    [4,7,7,1,"fill"],
    // Mouth opening
    [5,7,2,1,"mouth"], [8,7,2,1,"mouth"],
    // Legs
    [4,8,1,2,"fill"], [6,8,1,2,"fill"], [8,8,1,2,"fill"], [10,8,1,2,"fill"],
  ];

  return (
    <div className="flex items-center justify-center">
      <svg
        width={15 * S}
        height={11 * S}
        viewBox={`0 0 ${15 * S} ${11 * S}`}
      >
        {pixels.map(([x, y, w, h, type], i) => (
          <rect
            key={i}
            x={x * S}
            y={y * S}
            width={w * S}
            height={h * S}
            className={
              type === "eye"
                ? "fill-emerald-400"
                : type === "mouth"
                  ? "fill-transparent"
                  : "fill-foreground"
            }
          />
        ))}
      </svg>
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
        className="relative flex flex-col overflow-hidden rounded-lg border border-red-500/30 bg-black/90 dark:bg-black/70"
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

      {/* Good prompt — RIGHT (with Claw'd sitting on top-right) */}
      <div className="relative" style={{ height: PANEL_HEIGHT }}>
        {/* Claw'd crab — always visible, perched on top-right corner */}
        <div className="absolute -top-8 right-2 z-10">
          <Clawd />
        </div>
        <div
          className="flex h-full flex-col overflow-hidden rounded-lg border border-emerald-500/30 bg-black/90 dark:bg-black/70"
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
        </div>
        </div>
      </div>
    </div>
  );
}
