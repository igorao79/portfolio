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

/* ── Claw'd — Claude Code's orange pixel crab mascot (8-bit) ── */
const CLAWD_ORANGE = "#D97757";
const CLAWD_EYE = "#1a1a1a";

function Clawd() {
  const S = 3; // scale factor
  // Orange body pixels on a 16×12 grid (matching the Claude Code mascot)
  // prettier-ignore
  const body: [number, number, number, number][] = [
    // Left claw (pincer with a notch on top)
    [1,1,1,1], [3,1,1,1],
    [1,2,3,1],
    [1,3,3,1],
    // Right claw
    [12,1,1,1], [14,1,1,1],
    [12,2,3,1],
    [12,3,3,1],
    // Rounded body
    [5,3,6,1],   // shoulders (connects the claws)
    [4,4,8,1],
    [4,5,8,1],   // eyes row
    [4,6,8,1],
    [4,7,8,1],
    [5,8,6,1],   // taper
    // Legs
    [5,9,1,1], [5,10,1,1],
    [7,9,1,1], [7,10,1,1],
    [9,9,1,1], [9,10,1,1],
  ];
  // Two black eyes, centered
  const eyes: [number, number][] = [[6, 5], [9, 5]];

  return (
    <div className="flex items-center justify-center">
      <svg width={16 * S} height={12 * S} viewBox={`0 0 ${16 * S} ${12 * S}`}>
        {body.map(([x, y, w, h], i) => (
          <rect key={i} x={x * S} y={y * S} width={w * S} height={h * S} fill={CLAWD_ORANGE} />
        ))}
        {eyes.map(([x, y], i) => (
          <rect key={`e${i}`} x={x * S} y={y * S} width={S} height={S} fill={CLAWD_EYE} />
        ))}
      </svg>
    </div>
  );
}

/* ── Dead Claw'd — grey, drooping claws, red X eyes ── */
const CLAWD_DEAD = "#7d7d7d";

function DeadClawd() {
  const S = 3;
  // prettier-ignore
  const body: [number, number, number, number][] = [
    // Rounded body
    [5,2,6,1],
    [4,3,8,1],
    [4,4,8,1],   // X-eyes row
    [4,5,8,1],
    [5,6,6,1],
    // Drooping claws (hanging down at the sides)
    [1,5,3,1], [1,6,1,1], [3,6,1,1],
    [12,5,3,1], [12,6,1,1], [14,6,1,1],
  ];

  return (
    <div className="flex items-center justify-center">
      <svg width={16 * S} height={9 * S} viewBox={`0 0 ${16 * S} ${9 * S}`}>
        {body.map(([x, y, w, h], i) => (
          <rect key={i} x={x * S} y={y * S} width={w * S} height={h * S} fill={CLAWD_DEAD} />
        ))}
        {/* Red X eyes */}
        <line x1={6 * S} y1={4 * S} x2={7 * S} y2={5 * S} className="stroke-red-500" strokeWidth="1.5" />
        <line x1={7 * S} y1={4 * S} x2={6 * S} y2={5 * S} className="stroke-red-500" strokeWidth="1.5" />
        <line x1={9 * S} y1={4 * S} x2={10 * S} y2={5 * S} className="stroke-red-500" strokeWidth="1.5" />
        <line x1={10 * S} y1={4 * S} x2={9 * S} y2={5 * S} className="stroke-red-500" strokeWidth="1.5" />
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
        <div className="relative flex-1 overflow-hidden p-3">
          <p className="font-mono text-[11px] leading-relaxed text-red-400 sm:text-xs">
            $ prompt:
          </p>
          <p className="font-mono text-[11px] leading-relaxed text-gray-300 sm:text-xs">
            {badText}
            {phase === "bad" && cursor("bg-red-400")}
          </p>
          {/* Dead Claw'd inside terminal, top-right */}
          <div className="absolute right-2 top-2 opacity-60">
            <DeadClawd />
          </div>
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
        <div className="relative flex flex-1 flex-col overflow-hidden p-3">
          <p className="font-mono text-[11px] leading-relaxed text-emerald-400 sm:text-xs">
            $ prompt:{" "}
            {(phase === "bad" || phase === "pause") && goodLines.length === 0 && (
              <span className="text-gray-500">
                {locale === "ru" ? "ожидание..." : "waiting..."}
              </span>
            )}
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
          {/* Claw'd crab inside terminal, top-right */}
          <div className="absolute right-2 top-2 opacity-60">
            <Clawd />
          </div>
        </div>
      </div>
    </div>
  );
}
