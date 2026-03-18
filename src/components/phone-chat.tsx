"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Copy, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ── Typing emulation for bot messages ── */
function TypingMessage({ content, onDone }: { content: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx.current++;
      if (idx.current >= content.length) {
        setDisplayed(content);
        clearInterval(interval);
        onDone();
      } else {
        setDisplayed(content.slice(0, idx.current));
      }
    }, 12); // ~12ms per char ≈ fast typing
    return () => clearInterval(interval);
  }, [content, onDone]);

  return <MessageContent content={displayed} isBot />;
}

/* ── Render message with code blocks ── */
function MessageContent({ content, isBot }: { content: string; isBot: boolean }) {
  const [copied, setCopied] = useState<number | null>(null);

  if (!isBot) {
    return <span className="select-text whitespace-pre-wrap break-words">{content}</span>;
  }

  // Split by code blocks: ```lang\n...\n```
  const parts = content.split(/(```[\s\S]*?```)/g);

  const handleCopy = (code: string, i: number) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <span className="select-text whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          // Extract language and code
          const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
          const lang = match?.[1] || "";
          const code = match?.[2]?.trim() || part.slice(3, -3).trim();

          return (
            <span key={i} className="my-1.5 block">
              {/* Code header */}
              <span className="flex items-center justify-between rounded-t-lg bg-foreground/10 px-2.5 py-1">
                <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  {lang || "code"}
                </span>
                <button
                  onClick={() => handleCopy(code, i)}
                  className="flex items-center gap-1 text-[9px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied === i ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                </button>
              </span>
              {/* Code body */}
              <span className="block overflow-x-auto rounded-b-lg bg-foreground/5 p-2.5 font-mono text-[10px] leading-relaxed">
                {code}
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function ChatUI({ locale }: { locale: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingIdx, setTypingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typingIdx]);

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
      const reply = data.reply || data.error || "...";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setTypingIdx(newMessages.length); // index of the new bot message
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error" }]);
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
              className={`max-w-[85%] overflow-hidden rounded-2xl px-3 py-1.5 text-[11px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.role === "assistant" && typingIdx === i ? (
                <TypingMessage
                  content={msg.content}
                  onDone={() => setTypingIdx(null)}
                />
              ) : (
                <MessageContent content={msg.content} isBot={msg.role === "assistant"} />
              )}
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
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-[210] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-2 flex h-[80vh] max-h-[780px] w-[calc(100vw-1rem)] max-w-[380px] flex-col overflow-hidden rounded-[2rem] border-[3px] border-border bg-card shadow-2xl sm:mx-4 sm:h-[90vh] sm:rounded-[3rem]"
          >
            <div className="relative flex items-center justify-center bg-card pt-3 pb-1">
              <div className="h-[22px] w-[90px] rounded-full bg-foreground/10 ring-1 ring-border" />
            </div>

            <div className="flex-1 overflow-hidden bg-background">
              <ChatUI locale={locale} />
            </div>

            <div className="flex items-center justify-center bg-card pb-2 pt-1">
              <div className="h-[4px] w-28 rounded-full bg-foreground/20" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
