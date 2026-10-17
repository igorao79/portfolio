import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/zvonok-auth";
import { isNotesAdmin, notesStore } from "@/lib/notes-store";
import { NO_STORE, storeError, toPublic } from "@/lib/notes-api";
import {
  NOTES_PER_USER,
  NOTES_TOTAL,
  NOTE_COOLDOWN_MS,
  isNoteSection,
  isValidOffset,
  noteTextProblem,
  normalizeNoteText,
} from "@/lib/notes-rules";
import type { Note } from "@/lib/notes-rules";

export async function GET(req: NextRequest) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  try {
    const notes = (await notesStore.all()).sort((a, b) => a.createdAt - b.createdAt);
    return NextResponse.json(
      {
        notes: notes.map((n) => toPublic(n, user?.sub ?? null)),
        admin: user ? isNotesAdmin(user) : false,
      },
      { headers: NO_STORE }
    );
  } catch (e) {
    return storeError(e);
  }
}

export async function POST(req: NextRequest) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const text = normalizeNoteText(typeof body?.text === "string" ? body.text : "");
  const problem = noteTextProblem(text);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  if (!isNoteSection(body?.section) || !isValidOffset(body?.x, body?.y)) {
    return NextResponse.json({ error: "position" }, { status: 400 });
  }

  try {
    const all = await notesStore.all();
    const own = all.filter((n) => n.sub === user.sub);
    if (own.length >= NOTES_PER_USER) {
      return NextResponse.json({ error: "limit" }, { status: 429 });
    }
    if (own.some((n) => Date.now() - n.createdAt < NOTE_COOLDOWN_MS)) {
      return NextResponse.json({ error: "cooldown" }, { status: 429 });
    }
    if (all.length >= NOTES_TOTAL) {
      return NextResponse.json({ error: "full" }, { status: 429 });
    }

    const note: Note = {
      id: crypto.randomUUID(),
      sub: user.sub,
      name: user.name,
      username: user.username,
      text,
      section: body.section,
      x: Math.round(body.x as number),
      y: Math.round(body.y as number),
      createdAt: Date.now(),
    };
    await notesStore.put(note);
    return NextResponse.json({ note: toPublic(note, user.sub) }, { headers: NO_STORE });
  } catch (e) {
    return storeError(e);
  }
}
