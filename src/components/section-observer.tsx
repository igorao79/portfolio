"use client";

import { useEffect } from "react";
import { useApp } from "@/context/app-context";

const sectionIds = ["home", "about", "projects", "contacts"];

export function SectionObserver() {
  const { setActiveSection } = useApp();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.4 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [setActiveSection]);

  return null;
}
