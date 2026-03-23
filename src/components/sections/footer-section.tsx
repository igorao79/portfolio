"use client";

import { useApp } from "@/context/app-context";
import { motion } from "framer-motion";
import { Separator } from "@igorao79/uivix";

export function FooterSection() {
  const { locale } = useApp();

  return (
    <footer className="relative pb-24 pt-4 sm:pb-12 md:pb-12">
      {/* Full-width separator */}
      <div className="mb-6 w-full">
        <Separator variant="gradient" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center text-xs text-muted-foreground"
      >
        {locale === "ru"
          ? "этот сайт сделан за ~2 часа"
          : "this site was made in ~2 hours"}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-center text-xs text-muted-foreground"
      >
        {locale === "ru"
          ? "Часть компонентов взято из моей библиотеки "
          : "Some components are from my library "}
        <a
          href="https://uivix-docs.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          uivix
        </a>
      </motion.p>
    </footer>
  );
}
