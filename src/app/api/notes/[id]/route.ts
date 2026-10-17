import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/zvonok-auth";
import { isNotesAdmin, notesStore } from "@/lib/notes-store";
import { noteTextProblem, normalizeNoteText, parsePosition } from "@/lib/notes-rules";
import { storeError, toPublic } from "@/lib/notes-api";

type Ctx = { params: Promise<{ id: string }> };

/** Находит заметку и проверяет, что трогать её можно этому пользователю. */
async function editable(req: NextRequest, id: string, allowAdmin: boolean) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return { error: NextResponse.json({ error: "auth" }, { status: 401 }) };
  const note = (await notesStore.all()).find((n) => n.id === id);
  if (!note) return { error: NextResponse.json({ error: "missing" }, { status: 404 }) };
  if (note.sub !== user.sub && !(allowAdmin && isNotesAdmin(user))) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user, note };
}

/** Правка своей заметки: текст, место или и то и другое. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

  let text: string | undefined;
  if (typeof body?.text === "string") {
    text = normalizeNoteText(body.text);
    const problem = noteTextProblem(text);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }
  const position = body && "section" in body ? parsePosition(body) : undefined;
  if (position === null || (text === undefined && position === undefined)) {
    return NextResponse.json({ error: "position" }, { status: 400 });
  }

  try {
    const found = await editable(req, id, false);
    if ("error" in found) return found.error;
    const note = { ...found.note, ...position, ...(text === undefined ? {} : { text }) };
    await notesStore.put(note);
    return NextResponse.json({ note: toPublic(note, found.user.sub) });
  } catch (e) {
    return storeError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const found = await editable(req, id, true);
    if ("error" in found) return found.error;
    await notesStore.remove(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return storeError(e);
  }
}
