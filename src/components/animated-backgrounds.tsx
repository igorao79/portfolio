"use client";

import { motion } from "framer-motion";

/* Gradient fade edges for smooth section transitions */
function SectionFade({ color = "background" }: { color?: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
        style={{
          background: `linear-gradient(to bottom, var(--${color}), transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
        style={{
          background: `linear-gradient(to top, var(--${color}), transparent)`,
        }}
      />
    </>
  );
}

/* ——————————————————————————————————————————
   Home: floating colored orbs
   —————————————————————————————————————————— */
export function HomeBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SectionFade />
      {/* Large blue-ish orb top-right */}
      <motion.div
        className="absolute -right-24 -top-24 h-[550px] w-[550px] rounded-full opacity-30 blur-3xl dark:opacity-20"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Warm orb bottom-left */}
      <motion.div
        className="absolute -bottom-16 -left-16 h-[450px] w-[450px] rounded-full opacity-25 blur-3xl dark:opacity-15"
        style={{ background: "radial-gradient(circle, rgba(244,114,182,0.4), transparent 70%)" }}
        animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Center accent */}
      <motion.div
        className="absolute left-1/3 top-1/4 h-[250px] w-[250px] rounded-full opacity-20 blur-3xl dark:opacity-15"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)" }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

/* ——————————————————————————————————————————
   About: flowing waves + geometric shapes
   —————————————————————————————————————————— */
export function AboutBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SectionFade />
      {/* Wide gradient wave */}
      <motion.div
        className="absolute -left-1/4 top-1/2 h-[700px] w-[150%] -translate-y-1/2 -rotate-6 rounded-[100%] opacity-25 blur-3xl dark:opacity-15"
        style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.3), rgba(59,130,246,0.2), transparent)" }}
        animate={{ rotate: [-6, -2, -6], y: ["-50%", "-47%", "-50%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Floating geometric shapes */}
      <motion.div
        className="absolute right-[10%] top-[15%] h-28 w-28 rotate-45 rounded-2xl border-2 border-emerald-400/20 dark:border-emerald-400/15"
        animate={{ rotate: [45, 90, 45], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[8%] h-20 w-20 rotate-12 rounded-xl border-2 border-blue-400/20 dark:border-blue-400/15"
        animate={{ rotate: [12, -12, 12], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[40%] right-[25%] h-12 w-12 rounded-full border-2 border-purple-400/15 dark:border-purple-400/10"
        animate={{ scale: [1, 1.3, 1], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Cross-hatch pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ——————————————————————————————————————————
   Projects: grid / tech feel with glowing nodes
   —————————————————————————————————————————— */
export function ProjectsBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SectionFade />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Glowing nodes */}
      {[
        { left: "10%", top: "20%", dur: 3, del: 0, color: "rgba(99,102,241,0.6)" },
        { left: "80%", top: "35%", dur: 4, del: 1, color: "rgba(244,114,182,0.5)" },
        { left: "40%", top: "70%", dur: 3.5, del: 0.5, color: "rgba(34,197,94,0.5)" },
        { left: "65%", top: "85%", dur: 2.5, del: 1.5, color: "rgba(251,146,60,0.5)" },
        { left: "25%", top: "45%", dur: 3.2, del: 0.8, color: "rgba(168,85,247,0.5)" },
        { left: "90%", top: "60%", dur: 4.2, del: 2, color: "rgba(56,189,248,0.5)" },
      ].map(({ left, top, dur, del, color }, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ left, top, backgroundColor: color, boxShadow: `0 0 20px 8px ${color}` }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.8, 1] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: del }}
        />
      ))}
      {/* Warm accent blob */}
      <motion.div
        className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl dark:opacity-10"
        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.3), transparent 70%)" }}
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Cool accent blob */}
      <motion.div
        className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl dark:opacity-10"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)" }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ——————————————————————————————————————————
   Contacts: radial glow + pulsing rings
   —————————————————————————————————————————— */
export function ContactsBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SectionFade />
      {/* Center radial glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl dark:opacity-15"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), rgba(168,85,247,0.15), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Pulsing rings */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-400/20 dark:border-indigo-400/15"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-400/15 dark:border-purple-400/10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-400/10 dark:border-pink-400/8"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
