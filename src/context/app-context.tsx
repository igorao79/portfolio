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

/** Фон, а не трек: едва слышно, чтобы не перебивать. */
const MUSIC_VOLUME = 0.04;

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

  // Хочет ли человек музыку прямо сейчас. Ref, а не только state: слушатель
  // первого взаимодействия вешается один раз и иначе навсегда запомнил бы
  // стартовое «да» — и включал музыку тем же кликом, которым её выключили.
  const wantMusic = useRef(true);

  useEffect(() => {
    const audio = new Audio("/music/phone.mp3");
    audio.loop = true;
    audio.volume = MUSIC_VOLUME;
    audioRef.current = audio;

    // Браузер даёт запустить звук только после жеста: клика, касания или
    // клавиши (прокрутка жестом не считается). Ждём первый такой и снимаем
    // слушатели, только когда музыка действительно заиграла.
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const stop = () => events.forEach((e) => document.removeEventListener(e, onGesture));
    const onGesture = () => {
      // Жест — это и клик по самой кнопке музыки: её обработчик уже успел
      // поменять wantMusic, так что решаем после него.
      setTimeout(() => {
        if (!wantMusic.current) return stop();
        audio.play().then(stop, () => {});
      }, 0);
    };
    events.forEach((e) => document.addEventListener(e, onGesture));

    return () => {
      stop();
      audio.pause();
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const next = !wantMusic.current;
    wantMusic.current = next;
    if (next) audioRef.current?.play().catch(() => {});
    else audioRef.current?.pause();
    setMusicPlaying(next);
  }, []);

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
