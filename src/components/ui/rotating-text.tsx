"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
  staggerDuration?: number;
  transition?: object;
}

export function RotatingText({
  texts,
  rotationInterval = 2000,
  className,
  staggerDuration = 0.025,
  transition = { type: "spring", damping: 25, stiffness: 300 },
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % texts.length);
  }, [texts.length]);

  useEffect(() => {
    const interval = setInterval(next, rotationInterval);
    return () => clearInterval(interval);
  }, [next, rotationInterval]);

  const text = texts[index];
  const chars = text.split("");

  return (
    <span className={cn("inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          className="inline-flex"
          aria-label={text}
        >
          {chars.map((char, i) => (
            <motion.span
              key={`${text}-${i}`}
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              transition={{
                ...transition,
                delay: i * staggerDuration,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
