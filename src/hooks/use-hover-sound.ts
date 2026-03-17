"use client";

import { useCallback, useRef } from "react";

export function useHoverSound(src = "/music/hover_0.ogg", volume = 0.15) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
    }
    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [src, volume]);

  return play;
}
