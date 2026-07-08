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

  // Mount the page content the moment the loader's progress bar fills
  // (0.5s delay + 1.8s fill). It renders underneath the still-opaque loader,
  // so the heavy mount is hidden and the loader can fade out smoothly.
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2300);
    return () => clearTimeout(timer);
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
