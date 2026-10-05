import { LED_SEGMENTS } from "./LedLines";

// Typographic panel for services without a photo (Yoga, Nutrizione):
// huge outlined name + one ceiling-LED polygon that lights up when the
// panel is active / in view (see .type-led in globals.css).
export default function ServiceTypeArt({ name, tint }: { name: string; tint: "warm" | "red" }) {
  return (
    <div className="type-art" data-tint={tint} aria-hidden="true">
      <span className="type-art-word">{name}</span>
      <svg className="type-led" viewBox="900 60 760 250" preserveAspectRatio="xMidYMid meet" focusable="false">
        {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
        ))}
      </svg>
    </div>
  );
}
