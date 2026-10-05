import type { Wod, WodLevel } from "@/data/gym";

export const WOD_LEVELS: { id: WodLevel; label: string }[] = [
  { id: "rx", label: "Rx" },
  { id: "scaled", label: "Scaled" },
  { id: "beginner", label: "Principiante" },
];

const QUANTITY = /^([\d/]+(?:\s*cal)?)\s*(\(.+\))?$/i;

/**
 * "12/15 cal" + "Row"  -> { main: "12/15 cal Row" }
 * "10 (6/4 kg)" + "Wall ball" -> { main: "10 Wall ball (6/4 kg)" }
 * "12 knee raises" + "Toes to bar" -> { main: "12 knee raises", sub: "al posto di Toes to bar" }
 */
export function movementLine(value: string, name: string): { main: string; sub?: string } {
  const m = value.trim().match(QUANTITY);
  if (m) return { main: [m[1], name, m[2]].filter(Boolean).join(" ") };
  return { main: value, sub: `al posto di ${name}` };
}

export function wodHeadline(wod: Wod) {
  const parts = [wod.rounds ? `${wod.rounds} round` : null, wod.minutes ? `${wod.minutes} min` : null, wod.format.toLowerCase()];
  return parts.filter(Boolean).join(" · ");
}

export function wodShareText(wod: Wod, level: WodLevel, url: string) {
  const label = WOD_LEVELS.find((l) => l.id === level)!.label;
  const lines = wod.movements.map((mv) => {
    const { main } = movementLine(mv[level], mv.name);
    return `• ${main}`;
  });
  return [`WOD DEL GIORNO — IRONFIT Ribera`, `${wodHeadline(wod).toUpperCase()} (${label})`, ...lines, url].join("\n");
}
