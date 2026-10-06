// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { faq } from "../data/gym.ts";
import { faqJsonLd, hasRealRating, parseRichText, plainText, shortAuthor, starFills } from "./content.ts";

test("parseRichText / plainText", () => {
  assert.deepEqual(parseRichText("Vedi [Orari](#orari)."), [{ text: "Vedi " }, { text: "Orari", href: "#orari" }, { text: "." }]);
  assert.deepEqual(parseRichText("Nessun link."), [{ text: "Nessun link." }]);
  assert.equal(plainText("Fai il [test](#percorso) e [scrivici](#contatti)"), "Fai il test e scrivici");
  assert.equal(plainText("Costi: [DA CONFERMARE]"), "Costi: [DA CONFERMARE]");
});

test("starFills supports partial stars and clamps", () => {
  assert.deepEqual(starFills(4.3), [1, 1, 1, 1, 0.3]);
  assert.deepEqual(starFills(5), [1, 1, 1, 1, 1]);
  assert.deepEqual(starFills(0), [0, 0, 0, 0, 0]);
  assert.deepEqual(starFills(7), [1, 1, 1, 1, 1]);
  assert.deepEqual(starFills(Number.NaN), [0, 0, 0, 0, 0]);
});

test("shortAuthor", () => {
  assert.equal(shortAuthor("Maria Rossi"), "Maria R.");
  assert.equal(shortAuthor("  gianni  de luca "), "gianni L.");
  assert.equal(shortAuthor("Giulia"), "Giulia");
});

test("hasRealRating rejects missing or impossible values", () => {
  assert.equal(hasRealRating(4.8, 120), true);
  assert.equal(hasRealRating(undefined, 120), false);
  assert.equal(hasRealRating(4.8, 0), false);
  assert.equal(hasRealRating(6, 10), false);
});

test("FAQ JSON-LD excludes every [DA CONFERMARE] answer and has no link markup", () => {
  const ld = faqJsonLd(faq)!;
  const names = ld.mainEntity.map((q) => q.name);
  for (const f of faq) assert.equal(names.includes(f.q), !f.a.includes("[DA CONFERMARE]"), f.q);
  for (const q of ld.mainEntity) assert.ok(!/\]\(|\[DA CONFERMARE\]/.test(q.acceptedAnswer.text));
  assert.equal(faqJsonLd([{ q: "x", a: "y [DA CONFERMARE]" }]), null);
});
