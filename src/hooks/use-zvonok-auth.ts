"use client";

import { useCallback, useEffect, useState } from "react";

export interface ZvonokProfile {
  sub: string;
  name: string | null;
  username: string | null;
  picture: string | null;
}

/**
 * Состояние «Войти через Звоночек». Живёт в Sidebar одним экземпляром на
 * страницу: кнопка рисуется дважды (десктопная колонка и мобильный таб-бар),
 * но профиль запрашивается один раз.
 */
export function useZvonokAuth() {
  const [user, setUser] = useState<ZvonokProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/zvonok/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Ошибку колбэк приносит в query — показываем и сразу убираем из адреса,
  // чтобы она не всплыла снова при перезагрузке.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get("zvo_error");
    if (!message) return;
    setError(message);
    params.delete("zvo_error");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash
    );
  }, []);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/zvonok/logout", { method: "POST" });
      setUser(null);
    } finally {
      setBusy(false);
    }
  }, []);

  return { user, ready, busy, error, setError, logout };
}
