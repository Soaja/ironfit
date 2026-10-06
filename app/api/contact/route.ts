import { Resend } from "resend";
import { contactEmail, createRateLimiter, validateContact } from "@/lib/contact";

// POST /api/contact — sends the contact form to the gym via Resend.
// Success (2xx) is returned ONLY when Resend accepted the email.
// Secrets come from env vars (see .env.example), never from code.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 5 messages per 10 minutes per IP (in memory: per server instance).
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

const json = (status: number, body: Record<string, unknown>, headers?: HeadersInit) =>
  Response.json(body, { status, headers });

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "unsupported_media_type", message: "Formato della richiesta non valido." });
  }

  const rate = limiter(clientIp(req));
  if (!rate.ok) {
    return json(
      429,
      { error: "rate_limited", message: "Hai inviato troppi messaggi. Riprova tra qualche minuto." },
      { "Retry-After": String(rate.retryAfterSec) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json", message: "Richiesta non valida." });
  }
  if (!body || typeof body !== "object") return json(400, { error: "invalid_body", message: "Richiesta non valida." });

  const result = validateContact(body as Record<string, unknown>);
  if (!result.ok) {
    if (result.spam) return json(400, { error: "rejected", message: "Messaggio non inviato." });
    return json(422, { error: "validation", message: "Controlla i campi evidenziati.", fields: result.errors });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    // Not configured: say so honestly; the UI falls back to WhatsApp.
    return json(503, { error: "email_not_configured", message: "Invio email non disponibile al momento." });
  }

  const mail = contactEmail(result.data);
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    });
    if (error) {
      console.error("[contact] Resend error:", error.name, error.message);
      return json(502, { error: "send_failed", message: "Non siamo riusciti a inviare il messaggio." });
    }
  } catch (e) {
    console.error("[contact] send threw:", e instanceof Error ? e.message : e);
    return json(502, { error: "send_failed", message: "Non siamo riusciti a inviare il messaggio." });
  }

  return json(200, { ok: true });
}
