"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function PhoneModel() {
  const { scene } = useGLTF("/phone.glb");
  return (
    <primitive
      object={scene}
      scale={12}
      position={[0, -1.5, 0]}
      rotation={[0.1, -0.3, 0]}
    />
  );
}

function ChatUI({ locale }: { locale: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.error || "..." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-3 py-2 backdrop-blur-sm">
        <Bot className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-semibold text-white">Igor&apos;s AI</span>
        <span className="ml-auto text-[9px] text-emerald-400">online</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {messages.length === 0 && (
          <p className="mt-8 text-center text-[11px] text-gray-500">
            {locale === "ru" ? "Напишите что-нибудь..." : "Type something..."}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-1.5 text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] text-gray-400">
              <span className="inline-flex gap-0.5">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/40 p-2 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={locale === "ru" ? "Сообщение..." : "Message..."}
            className="flex-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-all hover:bg-blue-600 disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PhoneChatModal({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative flex h-[85vh] max-h-[700px] w-[90vw] max-w-[900px] gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -right-2 -top-2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-lg transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>

            {/* 3D Phone */}
            <div className="hidden w-1/2 items-center justify-center md:flex">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <directionalLight position={[-5, -2, 3]} intensity={0.4} />
                <Suspense fallback={null}>
                  <PhoneModel />
                </Suspense>
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate
                  autoRotateSpeed={1.5}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI / 1.5}
                />
              </Canvas>
            </div>

            {/* Chat window styled as phone screen */}
            <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900 to-black shadow-2xl md:w-1/2">
              {/* Phone notch */}
              <div className="flex items-center justify-center bg-black py-1.5">
                <div className="h-1 w-16 rounded-full bg-gray-700" />
              </div>
              <ChatUI locale={locale} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
