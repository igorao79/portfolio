import { NextResponse } from "next/server";
import { StoreUnavailable } from "@/lib/notes-store";
import type { Note, PublicNote } from "@/lib/notes-rules";

export const NO_STORE = { "Cache-Control": "no-store" };

export function toPublic(note: Note, viewerSub: string | null): PublicNote {
  const { sub, ...rest } = note;
  return { ...rest, mine: sub === viewerSub };
}

/** Хранилище не ответило — 503 с кодом, остальное пусть падает как есть. */
export function storeError(e: unknown) {
  if (e instanceof StoreUnavailable) {
    console.error("[notes]", e.message);
    return NextResponse.json({ error: "storage" }, { status: 503, headers: NO_STORE });
  }
  throw e;
}
