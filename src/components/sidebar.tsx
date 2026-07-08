"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { useHoverSound } from "@/hooks/use-hover-sound";
import {
  Home,
  User,
  FolderKanban,
  Mail,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { MusicIcon } from "@/components/ui/music-icon";
import { cn } from "@/lib/utils";

const sections = [
  { id: "home", icon: Home },
  { id: "about", icon: User },
  { id: "projects", icon: FolderKanban },
  { id: "contacts", icon: Mail },
] as const;

export function Sidebar() {
  const { locale, setLocale, musicPlaying, toggleMusic, activeSection } =
    useApp();
  const tr = t(locale);
  const playHover = useHoverSound();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(el);
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop sidebar — right side */}
      <aside className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex lg:right-6 lg:gap-3">
        {/* Music toggle */}
        <Tooltip>
          <TooltipTrigger
            onMouseEnter={playHover}
            onClick={toggleMusic}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:scale-110 hover:shadow-md cursor-pointer lg:h-11 lg:w-11",
              musicPlaying && "bg-primary text-primary-foreground"
            )}
          >
            <MusicIcon playing={musicPlaying} />
          </TooltipTrigger>
          <TooltipContent side="left">
            {musicPlaying ? tr.music.on : tr.music.off}
          </TooltipContent>
        </Tooltip>

        {/* Language toggle */}
        <Tooltip>
          <TooltipTrigger
            onMouseEnter={playHover}
            onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-xs font-bold shadow-sm transition-all hover:scale-110 hover:shadow-md cursor-pointer lg:h-11 lg:w-11"
          >
            {locale === "ru" ? "EN" : "RU"}
          </TooltipTrigger>
          <TooltipContent side="left">
            {locale === "ru" ? "Switch to English" : "Переключить на русский"}
          </TooltipContent>
        </Tooltip>

        <div className="my-0.5 h-px w-5 bg-border" />

        {/* Navigation */}
        {sections.map(({ id, icon: Icon }) => {
          const label = tr.nav[id as keyof typeof tr.nav];
          const isActive = activeSection === id;
          return (
            <Tooltip key={id}>
              <TooltipTrigger
                onMouseEnter={playHover}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:scale-110 hover:shadow-md cursor-pointer lg:h-11 lg:w-11",
                  isActive &&
                    "bg-primary text-primary-foreground border-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          );
        })}

        <div className="my-0.5 h-px w-5 bg-border" />

        {/* Animated theme toggle — standalone, no tooltip wrapper to avoid nested button */}
        <AnimatedThemeToggler
          onMouseEnter={playHover}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:scale-110 hover:shadow-md lg:h-11 lg:w-11"
        />
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/80 px-2 py-2 backdrop-blur-md md:hidden">
        {sections.map(({ id, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {tr.nav[id as keyof typeof tr.nav]}
              </span>
            </button>
          );
        })}

        <button
          onClick={toggleMusic}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors",
            musicPlaying ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MusicIcon playing={musicPlaying} className="h-5 w-5" />
        </button>

        <button
          onClick={() => setLocale(locale === "ru" ? "en" : "ru")}
          className="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors"
        >
          <span className="text-sm font-bold">{locale === "ru" ? "EN" : "RU"}</span>
        </button>

        <AnimatedThemeToggler onMouseEnter={playHover} className="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors" />
      </nav>
    </>
  );
}
