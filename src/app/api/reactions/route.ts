import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/zvonok-auth";
import { NO_STORE, storeError } from "@/lib/notes-api";
import { readReactions, setReaction } from "@/lib/reactions-store";
import { isReaction, isReactionProject } from "@/lib/reactions-rules";

export async function GET(req: NextRequest) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  try {
    return NextResponse.json({ reactions: await readReactions(user?.sub ?? null) }, { headers: NO_STORE });
  } catch (e) {
    return storeError(e);
  }
}

/** Поставить или снять свою реакцию: { project, reaction, on }. */
export async function POST(req: NextRequest) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!isReactionProject(body?.project) || !isReaction(body?.reaction) || typeof body?.on !== "boolean") {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }

  try {
    await setReaction(body.project, body.reaction, user.sub, body.on);
    const all = await readReactions(user.sub);
    return NextResponse.json({ reactions: all[body.project] }, { headers: NO_STORE });
  } catch (e) {
    return storeError(e);
  }
}
