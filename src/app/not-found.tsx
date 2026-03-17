"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Animated pixel crab */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <motion.svg
            width="80"
            height="56"
            viewBox="0 0 40 28"
            fill="none"
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Body */}
            <rect x="12" y="8" width="16" height="12" rx="3" fill="#e07850" />
            {/* Eyes — sad, looking down */}
            <rect x="16" y="12" width="3" height="3" fill="#1a1a1a" />
            <rect x="22" y="12" width="3" height="3" fill="#1a1a1a" />
            {/* Sad mouth */}
            <path d="M18 18 Q20.5 16 23 18" stroke="#c0603a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Left claw — drooping */}
            <rect x="4" y="10" width="8" height="4" rx="2" fill="#e07850" />
            <rect x="4" y="8" width="4" height="4" rx="1" fill="#e07850" />
            {/* Right claw — drooping */}
            <rect x="28" y="10" width="8" height="4" rx="2" fill="#e07850" />
            <rect x="32" y="8" width="4" height="4" rx="1" fill="#e07850" />
            {/* Legs */}
            <rect x="14" y="20" width="2" height="4" rx="1" fill="#c0603a" />
            <rect x="18" y="20" width="2" height="4" rx="1" fill="#c0603a" />
            <rect x="22" y="20" width="2" height="4" rx="1" fill="#c0603a" />
            <rect x="26" y="20" width="2" height="4" rx="1" fill="#c0603a" />
          </motion.svg>
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

        {/* Message */}
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
              $ curl {typeof window !== "undefined" ? window.location.href : "/..."}
            </p>
            <p className="mt-1 font-mono text-xs text-gray-400">
              Error 404: The requested resource was not found.
            </p>
            <p className="font-mono text-xs text-gray-500">
              Try navigating back to the homepage.
            </p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-md"
          >
            <Home className="h-4 w-4" />
            На главную
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
        </motion.div>
      </div>
    </div>
  );
}
