"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Check, Loader2 } from "lucide-react";

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

export function ContactFormModal({ open, onClose, locale }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isRu = locale === "ru";

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          telegram: telegram.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setTimeout(() => {
          onClose();
          setStatus("idle");
          setName("");
          setEmail("");
          setTelegram("");
          setMessage("");
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [name, email, telegram, message, onClose]);

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
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:scale-110 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-heading text-xl font-bold sm:text-2xl">
              {isRu ? "Написать мне" : "Contact me"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRu
                ? "Заполните форму и я свяжусь с вами"
                : "Fill the form and I'll get back to you"}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {/* Name */}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRu ? "Имя *" : "Name *"}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />

              {/* Email */}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={isRu ? "Email для связи *" : "Your email *"}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />

              {/* Telegram */}
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder={isRu ? "Telegram (необязательно)" : "Telegram (optional)"}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isRu ? "Сообщение *" : "Message *"}
                rows={4}
                className="resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={
                  status === "sending" ||
                  status === "sent" ||
                  !name.trim() ||
                  !email.trim() ||
                  !message.trim()
                }
                className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "idle" && (
                  <>
                    <Send className="h-4 w-4" />
                    {isRu ? "Отправить" : "Send"}
                  </>
                )}
                {status === "sending" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRu ? "Отправка..." : "Sending..."}
                  </>
                )}
                {status === "sent" && (
                  <>
                    <Check className="h-4 w-4" />
                    {isRu ? "Отправлено!" : "Sent!"}
                  </>
                )}
                {status === "error" && (
                  <>
                    <X className="h-4 w-4" />
                    {isRu ? "Ошибка. Попробуйте снова" : "Error. Try again"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
