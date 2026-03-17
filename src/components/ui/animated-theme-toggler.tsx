"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps {
  duration?: number;
  className?: string;
  /** Render as button (default) or div (when inside another button) */
  as?: "button" | "div";
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  as: Tag = "button",
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!ref.current) return;

    const newTheme = isDark ? "light" : "dark";
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;

    if (supportsViewTransition) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any)
        .startViewTransition(() => {
          flushSync(() => {
            setTheme(newTheme);
          });
        })
        .ready;

      const { top, left, width, height } =
        ref.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } else {
      setTheme(newTheme);
    }
  }, [isDark, duration, setTheme]);

  const icons = mounted ? (
    <div className="flex aspect-square w-5 items-center justify-center">
      <Sun
        className={cn(
          "absolute h-4 w-4 transition duration-300",
          isDark
            ? "opacity-0 rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        )}
      />
    </div>
  ) : (
    <div className="h-4 w-4" />
  );

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(
        "group relative flex items-center justify-center cursor-pointer",
        className
      )}
      onClick={toggleTheme}
    >
      {icons}
    </Tag>
  );
};
