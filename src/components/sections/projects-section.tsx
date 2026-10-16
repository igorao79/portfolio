"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowUpRight, GitCommitHorizontal, Github } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useHoverSound } from "@/hooks/use-hover-sound";
import { ShinyText } from "@/components/ui/shiny-text";
import { ProjectModal } from "@/components/project-modal";
import type { Project } from "@/components/project-modal";

const projects: Project[] = [
  {
    title: "CRYPTOMIA",
    subtitle: { ru: "КРИПТО-ШЛЮЗ", en: "CRYPTO PAYMENT GATEWAY" },
    description: {
      ru: "Платёжный шлюз для криптовалюты, который живёт на своей инфраструктуре — без стороннего кастодиана. Принимает USDT, USDC, BTC, ETH, TON, TRX, LTC, DOGE и SOL в восьми сетях: под каждый счёт заводится временный кошелёк, по событиям оплаты уходят подписанные вебхуки, кошельки по расписанию сметаются на нужный адрес. Сверху — админка с аналитикой, правами по проектам и 2FA. Цифры на скриншоте скрыты: проект коммерческий, это чужие обороты.",
      en: "A crypto payment gateway that runs on its own infrastructure — no third-party custody. It takes USDT, USDC, BTC, ETH, TON, TRX, LTC, DOGE and SOL across eight networks: every invoice gets a temporary wallet, payment events fire signed webhooks, and wallets are swept to a target address on a schedule. On top sits an admin panel with analytics, per-project permissions and 2FA. The figures in the screenshot are blurred — it's a commercial project and those are someone else's turnover.",
    },
    hue: 135,
    tags: ["React", "Vite", "Express", "PostgreSQL", "Redis", "ethers.js"],
    shots: ["/shots/cryptomia-1.webp", "/shots/cryptomia-2.webp"],
    commercial: true,
    live: "https://pustbudt.xyz",
    // Репозиторий BogdanGlushkov/cryptoservice закрытый — см. ZVONOCHEK ниже.
    commits: 2239,
  },
  {
    title: "SERPIUM",
    subtitle: { ru: "SEO ЛЕНДИНГИ С ИИ", en: "AI SEO LANDING PAGES" },
    description: {
      ru: "Коммерческий сервис, который собирает SEO-лендинги с помощью ИИ: генерация текстов и структуры страницы под запрос, вёрстка на Next.js и деплой на Railway.",
      en: "A commercial service that builds SEO landing pages with AI: copy and page structure generated for the query, markup on Next.js, deployed to Railway.",
    },
    hue: 275,
    tags: ["Claude Code", "Next.js", "Railway"],
    shots: ["/shots/serpium-1.webp"],
    commercial: true,
    live: "https://serpium.online",
    // Репозиторий igorao79/Serpium закрытый — см. ZVONOCHEK ниже.
    commits: 1706,
  },
  {
    title: "RPTBOT",
    subtitle: { ru: "SEO ЛЕНДИНГИ С ИИ", en: "AI SEO LANDING PAGES" },
    description: {
      ru: "Telegram-бот для коммерческой генерации SEO-лендингов: заказ и выдача результата прямо в чате, бэкенд живёт на Render.",
      en: "A Telegram bot for commercial SEO landing generation: the whole order-to-result flow lives in the chat, with the backend hosted on Render.",
    },
    hue: 25,
    tags: ["Cursor", "Render", "Telegram"],
    commercial: true,
    repo: "igorao79/rptbot",
  },
  // Временно скрыто:
  // {
  //   title: "XIVEX",
  //   subtitle: { ru: "ИИ ПОИСКОВИК", en: "AI SEARCH ENGINE" },
  //   description: {
  //     ru: "Поисковик, который отвечает текстом, а не списком ссылок: запрос уходит в модель, ответ собирается на Next.js со стримингом.",
  //     en: "A search engine that answers in prose instead of a list of links: the query goes to a model and the answer streams back through Next.js.",
  //   },
  //   hue: 200,
  //   tags: ["Claude Code", "Next.js"],
  //   live: "https://xivex.vercel.app/",
  //   repo: "igorao79/xivex",
  // },
  {
    title: "SOULCYCLE",
    subtitle: { ru: "САЙТ КНИГИ", en: "BOOK WEBSITE" },
    description: {
      ru: "Сайт книги с главами, персонажами и аккаунтами читателей. React на фронте, Supabase — под авторизацию и данные.",
      en: "A book website with chapters, characters and reader accounts. React on the front, Supabase for auth and data.",
    },
    hue: 340,
    tags: ["Cursor", "React", "Supabase"],
    live: "https://igorao79.github.io/soulcycle/",
    repo: "igorao79/soulcycle",
  },
  // Временно скрыто:
  // {
  //   title: "CONVERTARYAO",
  //   subtitle: { ru: "КОНВЕРТЕР ФАЙЛОВ", en: "FILE CONVERTER" },
  //   description: {
  //     ru: "Конвертер файлов, который работает прямо в браузере: перетащил файл — получил результат, без очередей и загрузки на чужой сервер.",
  //     en: "A file converter that runs right in the browser: drop a file, get the result — no queues, no uploading to someone else's server.",
  //   },
  //   hue: 155,
  //   tags: ["Claude Code", "Next.js"],
  //   live: "https://convertaryao.vercel.app/",
  //   repo: "igorao79/convertaryao",
  // },
  {
    title: "ZVONOCHEK",
    subtitle: { ru: "ПРИЛОЖЕНИЕ ДЛЯ ЗВОНКОВ", en: "CALLING APP" },
    description: {
      ru: "Мой мессенджер, и далеко не демка: чаты, звонки, группы, сообщества и ещё уйма всего. Есть веб-версия и приложение для macOS, в App Store он уже лежит, в Google Play скоро будет. Он же отдаёт OAuth, через который можно войти в это портфолио — кнопка с лисёнком в боковой панели.",
      en: "My own messenger, and nothing like a demo: chats, calls, groups, communities and a pile more. There's a web version and a macOS app, it's already on the App Store, and Google Play is coming. It also serves the OAuth you can sign into this portfolio with — the fox button in the side panel.",
    },
    hue: 45,
    tags: ["React", "React Native", "Electron", "Express", "PostgreSQL", "LiveKit"],
    shots: ["/shots/zvonochek-1.webp", "/shots/zvonochek-2.webp"],
    live: "https://zvo.is/download",
    // Репозиторий BogdanGlushkov/zvonok закрытый: ссылку на него давать
    // некуда, а счёт коммитов браузер оттуда не получит — он здесь руками.
    commits: 2067,
  },
  // Временно скрыто:
  // {
  //   title: "2025–2026",
  //   subtitle: { ru: "ИТОГИ ГОДА", en: "YEAR RECAP" },
  //   description: {
  //     ru: "Личный отчёт за год: что сделано, чему научился и куда ушло время — одной прокручиваемой страницей.",
  //     en: "A personal year in review: what got shipped, what I learned and where the time went — all on one scrolling page.",
  //   },
  //   hue: 230,
  //   tags: ["Cursor", "Next.js"],
  //   live: "https://igor2025-2026.vercel.app/",
  //   repo: "igorao79/igor2025-2026",
  // },
];

/**
 * Сколько коммитов показать. Обычно число приезжает из GitHub API по repo,
 * но у закрытого репозитория браузер получит 404 — для таких проектов счёт
 * лежит в данных руками (project.commits) и обновляется вместе с ними.
 */
function resolveCommits(
  project: Project,
  fetched: Record<string, number>
): number | null {
  if (project.commits != null) return project.commits;
  return project.repo ? fetched[project.repo] ?? null : null;
}

export function ProjectsSection() {
  const { locale } = useApp();
  const tr = t(locale);
  const playHover = useHoverSound();
  const [commits, setCommits] = useState<Record<string, number>>({});
  const [openProject, setOpenProject] = useState<Project | null>(null);

  useEffect(() => {
    const CACHE_KEY = "gh_commits";
    const CACHE_TTL = 1000 * 60 * 30; // 30 min

    // Try reading from sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setCommits(data);
          return;
        }
      }
    } catch { /* ignore */ }

    const fetchCommits = async () => {
      const results: Record<string, number> = {};
      // Sequential with small delay to avoid rate limits
      for (const p of projects.filter((p) => p.repo)) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${p.repo}/commits?per_page=1`,
            { headers: { Accept: "application/vnd.github.v3+json" } }
          );
          if (res.status === 403 || res.status === 429) break; // rate limited, stop
          if (!res.ok) continue;
          const link = res.headers.get("Link");
          if (link) {
            const match = link.match(/page=(\d+)>; rel="last"/);
            if (match) results[p.repo!] = parseInt(match[1], 10);
          } else {
            const data = await res.json();
            results[p.repo!] = Array.isArray(data) ? data.length : 0;
          }
          // Small delay between requests
          await new Promise((r) => setTimeout(r, 200));
        } catch { /* ignore */ }
      }
      if (Object.keys(results).length > 0) {
        setCommits(results);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: results, ts: Date.now() }));
        } catch { /* ignore */ }
      }
    };
    fetchCommits();
  }, []);

  return (
    <section
      id="projects"
      className="relative flex items-center justify-center px-4 py-16 sm:min-h-screen sm:px-6 sm:py-24"
    >
      <div className="relative z-10 w-full max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        >
          <ShinyText>{tr.projects.title}</ShinyText>
        </motion.h2>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8">
          {projects.map((project, i) => {
            const commitCount = resolveCommits(project, commits);
            return (
              // Не <button>: внутри плитки живёт <h3>, а заголовок внутри
              // кнопки — невалидная разметка. Роль и клавиатуру навешиваем
              // руками.
              <motion.div
                key={project.title}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                onClick={() => setOpenProject(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenProject(project);
                  }
                }}
                onMouseEnter={playHover}
                style={{ "--accent-h": project.hue } as CSSProperties}
                aria-label={project.title}
                className="project-tile group flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-8 sm:py-5"
              >
                {/* Left: title + tags */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <h3 className="font-heading text-xl font-black italic tracking-tight sm:text-3xl md:text-4xl">
                      {project.title}
                    </h3>
                    {project.commercial && (
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400 sm:text-[10px]">
                        Commercial
                      </span>
                    )}
                  </div>
                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="project-chip rounded-full border px-2 py-0.5 text-[9px] font-medium sm:text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: commits + subtitle + arrow */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {commitCount != null && commitCount > 0 && (
                    <div className="hidden items-center gap-1 text-muted-foreground lg:flex">
                      <GitCommitHorizontal className="h-3.5 w-3.5" />
                      <span className="text-xs tabular-nums">{commitCount}</span>
                    </div>
                  )}
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground md:block">
                    {project.subtitle[locale]}
                  </span>
                  <div className="project-arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all sm:h-10 sm:w-10">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* "More" GitHub link */}
        <motion.a
          href="https://github.com/igorao79"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 * projects.length }}
          onMouseEnter={playHover}
          className="group mt-3 flex items-center justify-between overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-transparent px-4 py-3.5 transition-all hover:scale-[1.02] hover:border-foreground/50 hover:bg-card hover:shadow-xl sm:px-8 sm:py-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <h3 className="font-heading text-xl font-black italic tracking-tight sm:text-3xl md:text-4xl">
              {locale === "ru" ? "БОЛЬШЕ" : "MORE"}
            </h3>
            <Github className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:block">
              GitHub
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all group-hover:bg-foreground sm:h-10 sm:w-10">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-background sm:h-5 sm:w-5" />
            </div>
          </div>
        </motion.a>
      </div>

      <ProjectModal
        project={openProject}
        commits={openProject ? resolveCommits(openProject, commits) : null}
        locale={locale}
        onClose={() => setOpenProject(null)}
      />
    </section>
  );
}
