const ITEMS = [
  "Panatta",
  "Eleiko",
  "Concept2",
  "Personal trainer",
  "Functional",
  "Yoga",
  "Nutrizione",
];

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-6 lg:px-8">{item}</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-iron-red" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee({ className = "" }: { className?: string }) {
  return (
    <div
      className={`marquee flex h-[var(--marquee-h)] items-center overflow-hidden border-t border-iron-red bg-iron-black font-display text-lg font-bold uppercase tracking-[0.08em] text-white/90 lg:text-xl ${className}`}
      data-reveal="marquee"
    >
      <div className="marquee-track">
        {/* 4 copies, scrolled by half: seamless even on 2560px-wide screens. */}
        <Group />
        <Group hidden />
        <Group hidden />
        <Group hidden />
      </div>
    </div>
  );
}
