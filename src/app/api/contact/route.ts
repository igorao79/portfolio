import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

export async function POST(req: NextRequest) {
  try {
    const { name, email, telegram, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    const text = [
      "📩 <b>Новое сообщение с портфолио</b>",
      "",
      `👤 <b>Имя:</b> ${escapeHtml(name)}`,
      `📧 <b>Email:</b> ${escapeHtml(email)}`,
      telegram ? `💬 <b>Telegram:</b> @${escapeHtml(telegram.replace(/^@/, ""))}` : "",
      "",
      `📝 <b>Сообщение:</b>`,
      escapeHtml(message),
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (res.ok) {
      return NextResponse.json({ ok: true });
    } else {
      const err = await res.json();
      return NextResponse.json(
        { error: err.description || "Telegram error" },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
