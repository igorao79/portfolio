"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
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
      <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-sm">
        <Bot className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Igor&apos;s AI</span>
        <span className="ml-auto text-[9px] text-primary">online</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="mt-16 text-center text-[11px] text-muted-foreground">
            {locale === "ru" ? "Напишите что-нибудь..." : "Type something..."}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-3 py-1.5 text-[11px] text-muted-foreground">
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
      <div className="border-t border-border bg-card/80 p-2 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={locale === "ru" ? "Сообщение..." : "Message..."}
            className="flex-1 rounded-xl bg-muted px-3 py-2 text-[11px] text-foreground placeholder-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
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
  // Lock body scroll when modal is open
  useLayoutEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-[210] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          {/* iPhone-style phone frame — theme aware, bigger */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 flex h-[90vh] max-h-[780px] w-full max-w-[380px] flex-col overflow-hidden rounded-[3rem] border-[3px] border-border bg-card shadow-2xl"
          >
            {/* Dynamic Island */}
            <div className="relative flex items-center justify-center bg-card pt-3 pb-1">
              <div className="h-[22px] w-[90px] rounded-full bg-foreground/10 ring-1 ring-border" />
            </div>

            {/* Chat screen */}
            <div className="flex-1 overflow-hidden bg-background">
              <ChatUI locale={locale} />
            </div>

            {/* Home indicator */}
            <div className="flex items-center justify-center bg-card pb-2 pt-1">
              <div className="h-[4px] w-28 rounded-full bg-foreground/20" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
