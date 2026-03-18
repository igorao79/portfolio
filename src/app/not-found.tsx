"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-1 flex justify-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="h-20 w-20 overflow-hidden rounded-2xl sm:h-24 sm:w-24"
          >
            <Image
              src="/igorlogo.webp"
              alt="Logo"
              width={96}
              height={96}
              className="h-full w-full object-cover dark:invert"
              priority
            />
          </motion.div>
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-heading text-8xl font-bold tracking-tighter text-foreground sm:text-9xl"
        >
          404
        </motion.h1>

        {/* Message — bilingual */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-muted-foreground sm:text-xl"
        >
          Страница не найдена
        </motion.p>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          Page not found
        </motion.p>

        {/* Terminal-style error */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-8 max-w-sm overflow-hidden rounded-lg border border-red-500/30 bg-black/90 dark:bg-black/70"
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <div className="p-3 text-left">
            <p className="font-mono text-xs text-red-400">
              $ Error 404: Resource not found
            </p>
            <p className="mt-1 font-mono text-xs text-gray-400">
              The requested page does not exist.
            </p>
            <p className="font-mono text-xs text-gray-500">
              Try navigating back to the homepage.
            </p>
          </div>
        </motion.div>

        {/* Home button only */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md"
          >
            <Home className="h-4 w-4" />
            На главную / Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
