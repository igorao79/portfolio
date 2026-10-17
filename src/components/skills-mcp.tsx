"use client";

import { useState, useEffect, useCallback } from "react";
import { Blocks, Bot, Plug, Terminal } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LocaleText } from "@/components/ui/locale-text";

type Category = "skills" | "agents" | "mcp";

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
  agents: {
    label: "Agents",
    tag: { ru: "Субагенты", en: "Subagents" },
    def: {
      ru: "Отдельные агенты со своим контекстом, моделью и набором инструментов. Тяжёлый поиск и разбор уходят им, а основной диалог остаётся чистым — и независимые куски работы считаются параллельно.",
      en: "Separate agents with their own context, model and tool set. Heavy searching and digging goes to them, so the main thread stays clean — and independent chunks of work run in parallel.",
    },
    items: [
      {
        name: "explore",
        desc: { ru: "поиск по незнакомой кодовой базе", en: "search an unfamiliar codebase" },
      },
      {
        name: "plan",
        desc: { ru: "архитектура до первой строчки", en: "architecture before line one" },
      },
      {
        name: "code-review",
        desc: { ru: "разбор диффа перед коммитом", en: "diff review before commit" },
      },
      {
        name: "debugger",
        desc: { ru: "причина бага по логам", en: "root cause from the logs" },
      },
      {
        name: "web-fetch",
        desc: { ru: "чтение доков и страниц", en: "reads docs & pages" },
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

const CATEGORIES: Category[] = ["skills", "agents", "mcp"];
const ICONS: Record<Category, typeof Blocks> = {
  skills: Blocks,
  agents: Bot,
  mcp: Plug,
};
const AUTO_SWITCH = 7000;

export function SkillsMcp({ locale }: { locale: Locale }) {
  const [active, setActive] = useState<Category>("skills");

  const cycle = useCallback(() => {
    setActive((prev) => {
      const i = CATEGORIES.indexOf(prev);
      return CATEGORIES[(i + 1) % CATEGORIES.length];
    });
  }, []);

  // Auto-switch between Skills, Agents and MCP
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
        <div className="flex w-full shrink-0 items-center gap-1 self-stretch rounded-full border border-border bg-background/60 p-0.5 sm:w-auto sm:self-auto">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat];
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
                <LocaleText locale={locale} ru={cd.def.ru} en={cd.def.en} />
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
                    {/* Обе локали друг на друге: русские подписи длиннее, и
                        на узком экране плашки перескакивали на лишний ряд —
                        карточка меняла высоту вместе со всей страницей. */}
                    <span className="text-[10px] text-muted-foreground sm:text-[11px]">
                      <LocaleText locale={locale} ru={item.desc.ru} en={item.desc.en} />
                    </span>
                  </div>
                ))}
                {cat !== "mcp" && (
                  <span className="rounded-lg border border-dashed border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground sm:text-[11px]">
                    {cat === "skills" ? "+ 50…" : "+ …"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="mt-4 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        <LocaleText
          locale={locale}
          ru="И это лишь часть — я использую огромное количество скиллов под разные задачи, все сюда просто не уместить."
          en="And that's just a slice — I use a huge number of skills for different purposes; they simply don't all fit here."
        />
      </p>
    </div>
  );
}
