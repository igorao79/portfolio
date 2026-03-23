"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

const TECH_LABELS = [
  "React", "TypeScript", "Next.js", "Python", "Docker", "Node.js",
  "Tailwind", "PostgreSQL", "Git", "REST API", "GraphQL", "Redis",
  "Vite", "HTML", "CSS", "JavaScript",
];

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  opacity: number;
  shade: number;
  fontSize: number;
}

export function ParticlesBg() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const isDarkRef = useRef(false);
  const prevSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { isDarkRef.current = resolvedTheme === "dark"; }, [resolvedTheme]);

  const initNodes = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 28000), 45);
    nodesRef.current = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      label: TECH_LABELS[i % TECH_LABELS.length],
      opacity: Math.random() * 0.13 + 0.05,
      shade: Math.random(),
      fontSize: Math.random() * 4 + 12,
    }));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const draw = () => {
      // Check size EVERY frame — catches zoom, resize, everything
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;

      if (cw !== prevSizeRef.current.w || ch !== prevSizeRef.current.h) {
        const oldW = prevSizeRef.current.w;
        const oldH = prevSizeRef.current.h;

        canvas.width = cw;
        canvas.height = ch;
        prevSizeRef.current = { w: cw, h: ch };

        if (nodesRef.current.length === 0) {
          initNodes(cw, ch);
        } else if (oldW > 0 && oldH > 0) {
          // Rescale node positions to new dimensions
          const sx = cw / oldW;
          const sy = ch / oldH;
          for (const n of nodesRef.current) {
            n.x *= sx;
            n.y *= sy;
          }
        }
      }

      const w = prevSizeRef.current.w;
      const h = prevSizeRef.current.h;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const isDark = isDarkRef.current;
      const base = isDark ? 255 : 0;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Move
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -50) n.x = w + 50;
        if (n.x > w + 50) n.x = -50;
        if (n.y < -30) n.y = h + 30;
        if (n.y > h + 30) n.y = -30;
      }

      // Mouse lines
      for (const n of nodes) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 280) {
          const alpha = (1 - dist / 280) * 0.2;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${base},${base},${base},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Labels
      for (const n of nodes) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hoverBoost = dist < 250 ? (1 - dist / 250) * 0.35 : 0;
        const alpha = n.opacity + hoverBoost;

        ctx.font = `500 ${n.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(${base},${base},${base},${alpha})`;
        ctx.fillText(n.label, n.x, n.y);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted, initNodes]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
