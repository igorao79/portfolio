import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/zvonok-auth";
import { isNotesAdmin, notesStore } from "@/lib/notes-store";
import { isNoteSection, isValidOffset } from "@/lib/notes-rules";
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

/** Перенос: менять можно только место, текст — нет. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!isNoteSection(body?.section) || !isValidOffset(body?.x, body?.y)) {
    return NextResponse.json({ error: "position" }, { status: 400 });
  }
  try {
    const found = await editable(req, id, false);
    if ("error" in found) return found.error;
    const note = {
      ...found.note,
      section: body.section,
      x: Math.round(body.x as number),
      y: Math.round(body.y as number),
    };
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
