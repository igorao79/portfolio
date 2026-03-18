"use client";

import { cn } from "@/lib/utils";

interface ShinyTextProps {
  children: string;
  className?: string;
}

/**
 * Premium shiny text with gradient + sweeping shine animation.
 * Theme-aware: uses foreground colors in light, lighter in dark.
 */
export function ShinyText({ children, className }: ShinyTextProps) {
  return (
    <span className={cn("shiny-text", className)} data-text={children}>
      <span className="shiny-text__inner" data-text={children}>
        {children}
      </span>
    </span>
  );
}
