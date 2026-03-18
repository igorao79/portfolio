"use client";

import { useApp } from "@/context/app-context";
import { motion } from "framer-motion";

export function FooterSection() {
  const { locale } = useApp();

  return (
    <footer className="relative px-4 pb-24 pt-4 sm:px-6 sm:pb-12 md:pb-12">
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
    </footer>
  );
}
