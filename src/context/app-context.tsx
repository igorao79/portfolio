"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "@/lib/i18n";

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  musicPlaying: boolean;
  toggleMusic: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  loaded: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ru");
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reveal the page only once BOTH are true: the loader's progress bar has
  // visibly filled (0.5s delay + 1.8s ≈ 2.3s) AND the hero image is fully
  // fetched + decoded. Content then mounts under the still-opaque loader with
  // the image already painted, so nothing jitters in when the loader fades.
  useEffect(() => {
    let cancelled = false;

    const minTime = new Promise<void>((resolve) => setTimeout(resolve, 2300));

    const heroReady = new Promise<void>((resolve) => {
      const img = new window.Image();
      img.src = "/igor.webp";
      const done = () => resolve();
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        img.onload = done;
        img.onerror = done;
      }
      // Hard cap: a broken/slow asset must never trap the user on the loader.
      setTimeout(done, 6000);
    });

    Promise.all([minTime, heroReady]).then(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/music/phone.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;

    // Autoplay on first user interaction
    const playOnInteraction = () => {
      if (audioRef.current && musicPlaying) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", playOnInteraction);
      document.removeEventListener("scroll", playOnInteraction);
    };

    document.addEventListener("click", playOnInteraction);
    document.addEventListener("scroll", playOnInteraction);

    return () => {
      document.removeEventListener("click", playOnInteraction);
      document.removeEventListener("scroll", playOnInteraction);
      audioRef.current?.pause();
    };
  }, []);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setMusicPlaying((prev) => !prev);
  }, [musicPlaying]);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        musicPlaying,
        toggleMusic,
        activeSection,
        setActiveSection,
        loaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
