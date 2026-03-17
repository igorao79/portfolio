"use client";

import { cn } from "@/lib/utils";

interface MusicIconProps {
  playing: boolean;
  className?: string;
}

export function MusicIcon({ playing, className }: MusicIconProps) {
  return (
    <div className={cn("relative flex h-4 w-4 items-center justify-center", className)}>
      {playing ? (
        /* Sound wave bars animation */
        <div className="flex h-3.5 items-end gap-[2px]">
          <span className="w-[2px] animate-sound-bar-1 rounded-full bg-current" />
          <span className="w-[2px] animate-sound-bar-2 rounded-full bg-current" />
          <span className="w-[2px] animate-sound-bar-3 rounded-full bg-current" />
          <span className="w-[2px] animate-sound-bar-4 rounded-full bg-current" />
        </div>
      ) : (
        /* X icon when muted */
        <svg
          className="h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      )}
    </div>
  );
}
