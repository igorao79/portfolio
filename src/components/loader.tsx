"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/app-context";
import Image from "next/image";

export function Loader() {
  const { loaded } = useApp();

  return (
    <AnimatePresence>
      {!loaded && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative mb-8"
          >
            <div className="h-20 w-20 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
              <Image
                src="/igorlogo.webp"
                alt="Logo"
                width={96}
                height={96}
                className="h-full w-full object-cover dark:invert"
                priority
              />
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
          >
            igorao79
          </motion.h1>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 h-0.5 w-48 overflow-hidden rounded-full bg-muted sm:w-64"
          >
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-xs tracking-[0.3em] text-muted-foreground uppercase"
          >
            Portfolio
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
