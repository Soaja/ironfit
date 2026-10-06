// Small pure helpers for content from gym.ts (FAQ links, stars, names, JSON-LD).

export type RichSegment = { text: string; href?: string };

/** "Vedi [Orari](#orari)." -> [{text:"Vedi "},{text:"Orari",href:"#orari"},{text:"."}] */
export function parseRichText(input: string): RichSegment[] {
  const out: RichSegment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(input); m; m = re.exec(input)) {
    if (m.index > last) out.push({ text: input.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < input.length) out.push({ text: input.slice(last) });
  return out;
}

/** Link markup removed, for JSON-LD and plain text. "[DA CONFERMARE]" is not a link. */
export function plainText(input: string) {
  return parseRichText(input)
    .map((s) => s.text)
    .join("");
}

/** Fill (0..1) of each of 5 stars, e.g. 4.3 -> [1,1,1,1,0.3]. Clamped to 0..5. */
export function starFills(rating: number): number[] {
  const r = Math.min(5, Math.max(0, Number.isFinite(rating) ? rating : 0));
  return Array.from({ length: 5 }, (_, i) => Math.round(Math.min(1, Math.max(0, r - i)) * 100) / 100);
}

/** "Maria Rossi" -> "Maria R."; single names stay as they are. */
export function shortAuthor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/** FAQPage JSON-LD from the FAQ data, skipping anything still to be confirmed. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  const confirmed = items.filter((f) => !f.q.includes("[DA CONFERMARE]") && !f.a.includes("[DA CONFERMARE]"));
  if (!confirmed.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: confirmed.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
    })),
  };
}

/** True only for a real rating and review count (never placeholders/zero). */
export function hasRealRating(rating?: number, count?: number) {
  return typeof rating === "number" && typeof count === "number" && rating > 0 && rating <= 5 && count > 0;
}
