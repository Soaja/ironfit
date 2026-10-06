// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addressLines,
  addressOneLine,
  appleMapsUrl,
  contactEmail,
  contactWhatsappText,
  createRateLimiter,
  directionsUrl,
  mailtoUrl,
  mapsEmbedUrl,
  telUrl,
  validateContact,
  whatsappUrl,
} from "./contact.ts";

const addr = { street: "Via Roma 1", city: "Ribera", province: "AG", postalCode: "92016", country: "IT" };
const placeholderAddr = { ...addr, street: "[VIA E NUMERO]" };
const noGeo = { lat: "[LAT]", lng: "[LNG]" };

test("one address format", () => {
  assert.deepEqual(addressLines(addr), ["Via Roma 1", "92016 Ribera (AG)"]);
  assert.equal(addressOneLine(addr), "Via Roma 1, 92016 Ribera (AG)");
});

test("links never contain placeholders", () => {
  assert.equal(whatsappUrl("39 333 123 4567", "Ciao!"), "https://wa.me/393331234567?text=Ciao!");
  assert.equal(whatsappUrl("[NUMERO WHATSAPP, formato 39...]", "Ciao"), "https://wa.me/?text=Ciao");
  assert.equal(telUrl("+39 0925 123456"), "tel:+390925123456");
  assert.equal(telUrl("[TELEFONO]"), null);
  assert.equal(mailtoUrl("[EMAIL]"), null);
  assert.equal(mailtoUrl("info@ironfit.it"), "mailto:info@ironfit.it");
  assert.ok(!decodeURIComponent(directionsUrl("IRONFIT", placeholderAddr, noGeo)).includes("["));
  assert.ok(decodeURIComponent(directionsUrl("IRONFIT", placeholderAddr, noGeo)).endsWith("IRONFIT, 92016 Ribera AG, Italia"));
  assert.ok(directionsUrl("IRONFIT", addr, { lat: "37.5", lng: "13.26" }).endsWith("destination=37.5%2C13.26"));
  assert.ok(appleMapsUrl("IRONFIT", addr, noGeo).startsWith("https://maps.apple.com/?daddr=IRONFIT%2C%20Via%20Roma%201"));
  assert.ok(mapsEmbedUrl("IRONFIT", addr, noGeo).endsWith("&z=16&output=embed"));
});

const ok = { name: "Giulia", contact: "giulia@example.it", interest: "Yoga", message: "Ciao", privacy: true };

test("validateContact accepts email or phone", () => {
  const e = validateContact(ok);
  assert.ok(e.ok && e.data.contactType === "email");
  const p = validateContact({ ...ok, contact: "+39 333 123 4567" });
  assert.ok(p.ok && p.data.contactType === "phone");
  assert.ok(validateContact({ ...ok, message: "" }).ok, "message is optional");
});

test("validateContact rejects with Italian messages", () => {
  const r = validateContact({ name: "G", contact: "giulia@", interest: "Boxe", message: "x".repeat(2001), privacy: false });
  assert.ok(!r.ok);
  if (!r.ok) {
    assert.deepEqual(Object.keys(r.errors).sort(), ["contact", "interest", "message", "name", "privacy"]);
    assert.match(r.errors.contact!, /email/);
  }
  const phone = validateContact({ ...ok, contact: "12ab" });
  assert.ok(!phone.ok && /telefono/.test(phone.errors.contact!));
  assert.ok(!validateContact({ ...ok, privacy: "true" as unknown as boolean }).ok, "privacy must be boolean true");
  const spam = validateContact({ ...ok, website: "http://spam" });
  assert.ok(!spam.ok && spam.spam);
});

test("rate limiter: N per window per key, then recovers", () => {
  let t = 0;
  const limit = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => t });
  assert.ok(limit("a").ok && limit("a").ok && limit("a").ok);
  const blocked = limit("a");
  assert.ok(!blocked.ok && blocked.retryAfterSec === 60);
  assert.ok(limit("b").ok, "other IPs unaffected");
  t = 60_001;
  assert.ok(limit("a").ok);
});

test("email template escapes input and sets reply-to only for emails", () => {
  const r = validateContact({ ...ok, name: "<b>Gi</b>", message: "riga 1\n<script>x</script>" });
  assert.ok(r.ok);
  if (!r.ok) return;
  const m = contactEmail(r.data);
  assert.ok(!m.html.includes("<script>") && m.html.includes("&lt;script&gt;") && m.html.includes("riga 1<br>"));
  assert.equal(m.replyTo, "giulia@example.it");
  const p = validateContact({ ...ok, contact: "333 1234567" });
  assert.ok(p.ok && contactEmail(p.data).replyTo === undefined);
});

test("WhatsApp fallback text carries the form contents", () => {
  assert.equal(
    contactWhatsappText({ name: "Giulia", contact: "333 1234567", interest: "Yoga", message: "Orari?" }),
    "Ciao IRONFIT! Sono Giulia.\nMi interessa: Yoga.\nOrari?\nContatto: 333 1234567",
  );
});
