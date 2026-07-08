"use client";

import { useState, useEffect, useCallback } from "react";
import { Blocks, Plug, Terminal } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type Category = "skills" | "mcp";

interface Item {
  name: string;
  desc: { ru: string; en: string };
}

interface CategoryData {
  label: string;
  tag: { ru: string; en: string };
  def: { ru: string; en: string };
  items: Item[];
}

const data: Record<Category, CategoryData> = {
  skills: {
    label: "Skills",
    tag: { ru: "Агентные навыки", en: "Agent Skills" },
    def: {
      ru: "Модульные навыки — папка со SKILL.md, инструкциями и ресурсами. Claude подгружает их только когда они нужны — progressive disclosure.",
      en: "Modular capabilities — a folder with SKILL.md, instructions and resources. Claude loads them only when relevant — progressive disclosure.",
    },
    items: [
      {
        name: "frontend-design",
        desc: { ru: "продуманный UI без AI-эстетики", en: "polished UI, no generic AI look" },
      },
      {
        name: "react-expert",
        desc: { ru: "паттерны React 19 и хуки", en: "React 19 patterns & hooks" },
      },
      {
        name: "nextjs-developer",
        desc: { ru: "App Router, RSC, кэширование", en: "App Router, RSC, caching" },
      },
      {
        name: "typescript-pro",
        desc: { ru: "строгие типы и дженерики", en: "strict types & generics" },
      },
      {
        name: "test-driven-development",
        desc: { ru: "тесты раньше кода", en: "tests before code" },
      },
      {
        name: "security-review",
        desc: { ru: "аудит уязвимостей", en: "vulnerability audit" },
      },
    ],
  },
  mcp: {
    label: "MCP",
    tag: { ru: "Model Context Protocol", en: "Model Context Protocol" },
    def: {
      ru: "Открытый стандарт: host ↔ client ↔ server. Серверы дают Claude инструменты, ресурсы и промпты для внешних систем.",
      en: "Open standard: host ↔ client ↔ server. Servers expose tools, resources and prompts that connect Claude to external systems.",
    },
    items: [
      {
        name: "context7",
        desc: { ru: "актуальные доки библиотек", en: "up-to-date library docs" },
      },
      {
        name: "figma",
        desc: { ru: "дизайн ↔ код в обе стороны", en: "design ↔ code both ways" },
      },
      {
        name: "playwright",
        desc: { ru: "автоматизация браузера", en: "browser automation" },
      },
      {
        name: "shadcn-ui",
        desc: { ru: "готовые компоненты и блоки", en: "ready components & blocks" },
      },
      {
        name: "chrome",
        desc: { ru: "живой просмотр и отладка", en: "live preview & debugging" },
      },
    ],
  },
};

const CATEGORIES: Category[] = ["skills", "mcp"];
const AUTO_SWITCH = 7000;

export function SkillsMcp({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<Category>("skills");

  const cycle = useCallback(() => {
    setActive((prev) => (prev === "skills" ? "mcp" : "skills"));
  }, []);

  // Auto-switch between Skills and MCP
  useEffect(() => {
    const timer = setInterval(cycle, AUTO_SWITCH);
    return () => clearInterval(timer);
  }, [cycle]);

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {locale === "ru" ? "Мой ИИ-инструментарий" : "My AI toolkit"}
          </span>
        </div>

        {/* Toggle pills */}
        <div className="flex shrink-0 items-center gap-1 self-stretch rounded-full border border-border bg-background/60 p-0.5 sm:self-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat === "skills" ? Blocks : Plug;
            const selected = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all sm:flex-none ${
                  selected
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {data[cat].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content — both states stacked in one grid cell so the card height
          equals the taller state and never shifts when switching. */}
      <div className="grid">
        {CATEGORIES.map((cat) => {
          const cd = data[cat];
          const isActive = active === cat;
          return (
            <div
              key={cat}
              style={{ gridArea: "1 / 1" }}
              aria-hidden={!isActive}
              className={`transition-all duration-300 ease-in-out ${
                isActive
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none translate-y-1 opacity-0"
              }`}
            >
              {/* Tag */}
              <p className="font-mono text-[11px] uppercase tracking-wider text-primary/80 sm:text-xs">
                {cd.tag[locale]}
              </p>

              {/* Definition */}
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {cd.def[locale]}
              </p>

              {/* Items */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {cd.items.map((item) => (
                  <div
                    key={item.name}
                    className="group flex items-baseline gap-2 rounded-lg border border-border bg-background/50 px-2.5 py-1.5 transition-colors hover:border-primary/30"
                  >
                    <code className="font-mono text-[11px] font-semibold text-foreground sm:text-xs">
                      {item.name}
                    </code>
                    <span className="text-[10px] text-muted-foreground sm:text-[11px]">
                      {item.desc[locale]}
                    </span>
                  </div>
                ))}
                {cat === "skills" && (
                  <span className="rounded-lg border border-dashed border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground sm:text-[11px]">
                    + 50…
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="mt-4 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        {locale === "ru"
          ? "И это лишь часть — я использую огромное количество скиллов под разные задачи, все сюда просто не уместить."
          : "And that's just a slice — I use a huge number of skills for different purposes; they simply don't all fit here."}
      </p>
    </div>
  );
}
