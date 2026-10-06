// Pure helpers for contact data: links, NAP formatting, contact-form
// validation (shared by client and API), rate limiting and the email template.
// No imports from the app, so Node's test runner can load it directly.

export type PostalAddressData = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

/** "[...]" = data not filled in yet. */
export const isPlaceholderValue = (v: string | undefined | null) => !v || /^\s*\[.*\]\s*$/.test(v);

// ---------------------------------------------------------------- NAP ------
/** The ONE address format used everywhere (Contatti, footer, .ics, maps). */
export function addressLines(a: PostalAddressData): [string, string] {
  return [a.street, `${a.postalCode} ${a.city} (${a.province})`];
}

export function addressOneLine(a: PostalAddressData) {
  return addressLines(a).join(", ");
}

// --------------------------------------------------------------- links -----
const digitsOf = (s: string) => s.replace(/\D/g, "");

/** wa.me link; with a placeholder number it opens WhatsApp's contact picker. */
export function whatsappUrl(number: string, message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return isPlaceholderValue(number) ? `https://wa.me/${text}` : `https://wa.me/${digitsOf(number)}${text}`;
}

/** tel: link ("+39 0925 …" -> "tel:+390925…"); null while it's a placeholder. */
export function telUrl(phone: string) {
  if (isPlaceholderValue(phone)) return null;
  const plus = phone.trim().startsWith("+") ? "+" : "";
  return `tel:${plus}${digitsOf(phone)}`;
}

export function mailtoUrl(email: string) {
  return isPlaceholderValue(email) ? null : `mailto:${email.trim()}`;
}

/** Destination for map links: coordinates when real, otherwise name + address. */
function mapQuery(name: string, a: PostalAddressData, geo: { lat: string; lng: string }) {
  if (!isPlaceholderValue(geo.lat) && !isPlaceholderValue(geo.lng)) return `${geo.lat},${geo.lng}`;
  const street = isPlaceholderValue(a.street) ? "" : `${a.street}, `;
  return `${name}, ${street}${a.postalCode} ${a.city} ${a.province}, Italia`;
}

export function directionsUrl(name: string, a: PostalAddressData, geo: { lat: string; lng: string }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(name, a, geo))}`;
}

export function appleMapsUrl(name: string, a: PostalAddressData, geo: { lat: string; lng: string }) {
  return `https://maps.apple.com/?daddr=${encodeURIComponent(mapQuery(name, a, geo))}`;
}

/** Keyless Google Maps embed (loaded only after the user clicks). */
export function mapsEmbedUrl(name: string, a: PostalAddressData, geo: { lat: string; lng: string }) {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(name, a, geo))}&z=16&output=embed`;
}

// ------------------------------------------------------ contact form -------
export const INTERESTS = ["Prova gratuita", "Personal training", "Functional", "Yoga", "Nutrizione", "Altro"] as const;
export type Interest = (typeof INTERESTS)[number];

export type ContactInput = {
  name: string;
  contact: string; // phone or email
  interest: string;
  message: string;
  privacy: boolean;
  website?: string; // honeypot: must stay empty
};

export type ContactData = Omit<ContactInput, "website" | "privacy"> & {
  interest: Interest;
  contactType: "email" | "phone";
};

export type FieldErrors = Partial<Record<"name" | "contact" | "interest" | "message" | "privacy", string>>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const PHONE = /^\+?[\d\s().\-/]{6,20}$/;

export const LIMITS = { name: 80, contact: 120, message: 2000 } as const;

export function validateContact(raw: Partial<Record<keyof ContactInput, unknown>>):
  | { ok: true; data: ContactData }
  | { ok: false; errors: FieldErrors; spam?: boolean } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(raw.name);
  const contact = str(raw.contact);
  const interest = str(raw.interest);
  const message = str(raw.message);
  const errors: FieldErrors = {};

  if (str(raw.website)) return { ok: false, errors: {}, spam: true };

  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  else if (name.length > LIMITS.name) errors.name = `Il nome può avere al massimo ${LIMITS.name} caratteri.`;

  let contactType: "email" | "phone" | null = null;
  if (!contact) errors.contact = "Inserisci un telefono o un'email per ricontattarti.";
  else if (contact.length > LIMITS.contact) errors.contact = "Il contatto è troppo lungo.";
  else if (contact.includes("@")) {
    if (EMAIL.test(contact)) contactType = "email";
    else errors.contact = "L'email non sembra corretta (es. nome@esempio.it).";
  } else if (PHONE.test(contact) && contact.replace(/\D/g, "").length >= 6 && contact.replace(/\D/g, "").length <= 15) {
    contactType = "phone";
  } else errors.contact = "Il numero di telefono non sembra corretto.";

  if (!(INTERESTS as readonly string[]).includes(interest)) errors.interest = "Scegli cosa ti interessa.";
  if (message.length > LIMITS.message) errors.message = `Il messaggio può avere al massimo ${LIMITS.message} caratteri.`;
  if (raw.privacy !== true) errors.privacy = "Per inviare il messaggio devi accettare l'informativa privacy.";

  if (Object.keys(errors).length || !contactType) return { ok: false, errors };
  return { ok: true, data: { name, contact, contactType, interest: interest as Interest, message } };
}

/** WhatsApp text with the form contents (fallback when sending fails). */
export function contactWhatsappText(d: Pick<ContactInput, "name" | "contact" | "interest" | "message">) {
  const lines = [`Ciao IRONFIT! Sono ${d.name.trim() || "…"}.`, d.interest ? `Mi interessa: ${d.interest}.` : "", d.message.trim(), d.contact.trim() ? `Contatto: ${d.contact.trim()}` : ""];
  return lines.filter(Boolean).join("\n");
}

// -------------------------------------------------------- rate limit -------
/** Sliding-window limiter (in memory: per server instance, resets on restart). */
export function createRateLimiter({ limit, windowMs, now = () => Date.now() }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return { ok: false as const, retryAfterSec: Math.ceil((windowMs - (t - recent[0])) / 1000) };
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k);
    return { ok: true as const };
  };
}

// ------------------------------------------------------------- email -------
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function contactEmail(d: ContactData) {
  const subject = `Nuovo messaggio dal sito: ${d.interest} — ${d.name}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#6b6b6b;font:600 13px Arial,sans-serif;width:140px;vertical-align:top">${label}</td><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#0a0a0a;font:15px/1.5 Arial,sans-serif">${value}</td></tr>`;
  const contactCell =
    d.contactType === "email" ? `<a href="mailto:${esc(d.contact)}" style="color:#d7192a">${esc(d.contact)}</a>` : `<a href="tel:${esc(d.contact.replace(/[^\d+]/g, ""))}" style="color:#d7192a">${esc(d.contact)}</a>`;
  const html = `<!doctype html><html lang="it"><body style="margin:0;background:#f4f4f4;padding:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-collapse:collapse">
<tr><td style="background:#0a0a0a;padding:18px 20px;border-bottom:4px solid #d7192a;color:#fff;font:800 20px Arial,sans-serif;letter-spacing:2px">IRONFIT · Nuovo messaggio</td></tr>
<tr><td style="padding:8px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${row("Nome", esc(d.name))}${row(d.contactType === "email" ? "Email" : "Telefono", contactCell)}${row("Interesse", esc(d.interest))}${row("Messaggio", d.message ? esc(d.message).replace(/\n/g, "<br>") : "<em>—</em>")}
</table></td></tr>
<tr><td style="padding:14px 20px;color:#6b6b6b;font:12px Arial,sans-serif">Inviato dal modulo contatti del sito. ${d.contactType === "email" ? "Rispondi a questa email per scrivere direttamente a " + esc(d.name) + "." : ""}</td></tr>
</table></body></html>`;
  const text = `Nome: ${d.name}\n${d.contactType === "email" ? "Email" : "Telefono"}: ${d.contact}\nInteresse: ${d.interest}\nMessaggio:\n${d.message || "—"}`;
  return { subject, html, text, replyTo: d.contactType === "email" ? d.contact : undefined };
}
