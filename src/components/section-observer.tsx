"use client";

import { useEffect } from "react";
import { useApp } from "@/context/app-context";

const sectionIds = ["home", "about", "projects", "contacts"];

export function SectionObserver() {
  const { setActiveSection } = useApp();

  useEffect(() => {
    // Scrollspy: a thin band across the vertical centre of the viewport.
    // Whichever section crosses that band is the active one — this stays
    // correct even for sections taller than the viewport (a fixed threshold
    // like 0.4 can never be reached by a very tall section).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [setActiveSection]);

  return null;
}
