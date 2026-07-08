"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface QuoteData {
  text: { ru: string; en: string };
  author: string;
  role: { ru: string; en: string };
}

const quotes: QuoteData[] = [
  {
    text: {
      ru: "Наша задача — создать вычислительные технологии, чтобы никому не нужно было программировать, и чтобы языком программирования стал человеческий язык. Каждый человек в мире теперь программист. Это чудо ИИ.",
      en: "It is our job to create computing technology such that nobody has to program and that the programming language is human. Everybody in the world is now a programmer. This is the miracle of AI.",
    },
    author: "Jensen Huang",
    role: { ru: "CEO NVIDIA", en: "CEO NVIDIA" },
  },
  {
    text: {
      ru: "Самый горячий новый язык программирования — это английский.",
      en: "The hottest new programming language is English.",
    },
    author: "Andrej Karpathy",
    role: { ru: "Экс-директор AI в Tesla", en: "Former Tesla AI Director" },
  },
  {
    text: {
      ru: "Для крупных организаций есть фундаментальная проблема: если ваша скорость изменений не поспевает за возможностями технологий, вас обгонят маленькие компании — они достигают масштаба с помощью этих инструментов.",
      en: "For large organizations, there is a fundamental challenge: if your change speed cannot keep up with what technology can achieve, you will be outpaced by smaller companies — they can achieve scale with these tools.",
    },
    author: "Satya Nadella",
    role: { ru: "CEO Microsoft", en: "CEO Microsoft" },
  },
  {
    text: {
      ru: "ИИ не заменит программистов, но программисты, использующие ИИ, заменят тех, кто этого не делает.",
      en: "AI won't replace programmers, but programmers who use AI will replace those who don't.",
    },
    author: "Santiago Valdarrama",
    role: { ru: "ML-инженер", en: "ML Engineer" },
  },
  {
    text: {
      ru: "В будущем вы будете говорить компьютеру, что вы хотите, и он это сделает. Есть искусство в промпт-инженерии — это то, как вы подбираете инструкции, чтобы получить именно то, что нужно.",
      en: "In the future, you will tell the computer what you want, and it will do it. There is an artistry to prompt engineering — it's how you fine-tune the instructions to get exactly what you want.",
    },
    author: "Jensen Huang",
    role: { ru: "CEO NVIDIA", en: "CEO NVIDIA" },
  },
];

function QuoteBody({ q, locale }: { q: QuoteData; locale: Locale }) {
  return (
    <>
      <p className="text-sm italic leading-relaxed text-foreground/80 sm:text-base">
        &ldquo;{q.text[locale]}&rdquo;
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <div className="text-right">
          <p className="text-sm font-semibold">{q.author}</p>
          <p className="text-xs text-muted-foreground">{q.role[locale]}</p>
        </div>
      </div>
    </>
  );
}

export function AIQuotes({ locale }: { locale: Locale }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % quotes.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const q = quotes[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {locale === "ru" ? "Цитаты об ИИ" : "Quotes on AI"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quote content — an invisible sizer holding every quote fixes the
          height to the longest one, so the card never resizes between quotes.
          The animated active quote is overlaid on top. */}
      <div className="relative">
        <div className="grid" aria-hidden="true">
          {quotes.map((qq, i) => (
            <div key={i} style={{ gridArea: "1 / 1" }} className="invisible">
              <QuoteBody q={qq} locale={locale} />
            </div>
          ))}
        </div>

        <div className="absolute inset-0">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuoteBody q={q} locale={locale} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="mt-4 flex justify-center gap-1.5">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`h-1.5 cursor-pointer rounded-full transition-all ${
              i === current
                ? "w-4 bg-foreground"
                : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
