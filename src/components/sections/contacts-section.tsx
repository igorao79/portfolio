"use client";

import { useApp } from "@/context/app-context";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Send, Mail } from "lucide-react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useHoverSound } from "@/hooks/use-hover-sound";

/* Custom hh.ru SVG icon — red circle with white "hh" */
function HhIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#D6001C" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="22"
      >
        hh
      </text>
    </svg>
  );
}

const contacts = [
  {
    id: "telegram",
    icon: Send,
    href: "https://t.me/igorao79",
    bg: "bg-[#2AABEE]",
    hoverText: "",
  },
  {
    id: "email",
    icon: Mail,
    href: "mailto:igoraor79@gmail.com",
    bg: "bg-[#EA4335]",
    hoverText: "",
  },
  {
    id: "hh",
    icon: HhIcon,
    href: "https://tula.hh.ru/resume/e14005b2ff0f3c33320039ed1f6d774c5a6458",
    bg: "bg-[#D6001C]",
    hoverText: "",
  },
];

export function ContactsSection() {
  const { locale } = useApp();
  const tr = t(locale);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const playHover = useHoverSound();

  return (
    <section
      id="contacts"
      className="relative flex min-h-screen items-center justify-center px-4 pb-24 pt-20 sm:px-6 sm:py-24 md:pb-24"
    >

      <div className="relative z-10 w-full max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {tr.contacts.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-base text-muted-foreground sm:mt-4 sm:text-lg"
        >
          {tr.contacts.subtitle}
        </motion.p>

        {/* Three-column block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 grid grid-cols-3 overflow-hidden rounded-2xl border border-border shadow-lg sm:mt-14"
        >
          {contacts.map(({ id, icon: Icon, href, bg, hoverText }, i) => {
            const label = tr.contacts[id as keyof typeof tr.contacts] || id;
            const isHovered = hoveredIndex === i;
            const otherHovered = hoveredIndex !== null && hoveredIndex !== i;

            return (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => { setHoveredIndex(i); playHover(); }}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-3 py-12 transition-all duration-500 sm:gap-4 sm:py-20",
                  isHovered ? `${bg} ${hoverText}` : "bg-card",
                  otherHovered ? "opacity-30" : "opacity-100",
                  i < contacts.length - 1 && "border-r border-border"
                )}
              >
                <Icon
                  className={cn(
                    "h-8 w-8 transition-all duration-500 sm:h-12 sm:w-12",
                    isHovered && "scale-125"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider transition-all duration-500 sm:text-sm",
                    isHovered
                      ? "text-foreground dark:text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>

                {/* Hover glow effect */}
                {isHovered && (
                  <div
                    className={cn(
                      "absolute inset-0 opacity-20 blur-3xl",
                      bg
                    )}
                  />
                )}
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
