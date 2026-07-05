import nodemailer from "nodemailer";
import { OWNER_NAME } from "@/lib/intake-prompt";

type Brief = Record<string, string>;
type TranscriptMessage = { role: string; text: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanize(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function renderBubble(m: TranscriptMessage) {
  const isClient = m.role === "user";
  const align = isClient ? "right" : "left";
  const bg = isClient ? "#3B82F6" : "#F3F4F6";
  const color = isClient ? "#FFFFFF" : "#111827";
  const label = isClient ? "Client" : "Assistant";
  return `
    <tr>
      <td style="padding:4px 0;text-align:${align}">
        <div style="font-size:11px;color:#9CA3AF;margin-bottom:2px;">${label}</div>
        <span style="display:inline-block;max-width:80%;padding:8px 12px;border-radius:14px;background:${bg};color:${color};font-size:14px;line-height:1.4;white-space:pre-wrap;text-align:left;">${escapeHtml(m.text)}</span>
      </td>
    </tr>
  `;
}

export async function POST(req: Request) {
  const { host, port, user, pass, ownerEmail } = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    ownerEmail: process.env.OWNER_EMAIL,
  };

  if (!host || !port || !user || !pass || !ownerEmail) {
    return Response.json(
      { error: "SMTP isn't configured yet. Check .env.local." },
      { status: 503 },
    );
  }

  const { brief, transcript }: { brief: Brief; transcript: TranscriptMessage[] } = await req.json();

  if (!brief || typeof brief !== "object") {
    return Response.json({ error: "Missing brief." }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const rows = Object.entries(brief)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#9CA3AF">${escapeHtml(humanize(k))}</td><td>${escapeHtml(v) || "—"}</td></tr>`,
    )
    .join("");

  const bubbleRows = transcript
    .filter((m) => m.text.trim())
    .map(renderBubble)
    .join("");

  try {
    await transporter.sendMail({
      from: `"IZA UI Intake" <${user}>`,
      to: ownerEmail,
      replyTo: brief.email || undefined,
      subject: `New project inquiry — ${brief.name || "unknown"}`,
      html: `
        <h2>New intake brief</h2>
        <table>${rows}</table>
        <h3>Full conversation</h3>
        <table style="width:100%;border-collapse:collapse;">${bubbleRows}</table>
      `,
    });
  } catch {
    return Response.json({ error: "Failed to send email." }, { status: 502 });
  }

  return Response.json({ ok: true, owner: OWNER_NAME });
}
