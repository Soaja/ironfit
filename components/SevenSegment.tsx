// Red 7-segment readout, like the LED wall clock in the gym. Pure SVG: unlit
// segments stay faintly visible ("ghost" segments), lit ones glow.
const SEGMENTS = {
  a: "7,1 25,1 21.5,5 10.5,5",
  b: "26.5,2.5 26.5,26 23,23 23,6",
  c: "26.5,30 26.5,53.5 23,50 23,33",
  d: "7,55 25,55 21.5,51 10.5,51",
  e: "5.5,30 9,33 9,50 5.5,53.5",
  f: "5.5,2.5 9,6 9,23 5.5,26",
  g: "8,28 10.5,25.8 21.5,25.8 24,28 21.5,30.2 10.5,30.2",
} as const;

type Seg = keyof typeof SEGMENTS;

const DIGITS: Record<string, Seg[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "d", "c"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

const DIGIT_W = 32;
const COLON_W = 14;

export default function SevenSegment({ value, blinkColon = false }: { value: string; blinkColon?: boolean }) {
  let x = 0;
  const parts = [...value].map((ch, i) => {
    if (ch === ":") {
      const g = (
        <g key={i} transform={`translate(${x} 0)`} className={blinkColon ? "seg-colon-blink" : undefined}>
          <rect x="5" y="17" width="4" height="4" className="seg-on" />
          <rect x="5" y="35" width="4" height="4" className="seg-on" />
        </g>
      );
      x += COLON_W;
      return g;
    }
    const lit = new Set(DIGITS[ch] ?? []);
    const g = (
      <g key={i} transform={`translate(${x} 0)`}>
        {(Object.keys(SEGMENTS) as Seg[]).map((s) => (
          <polygon key={s} points={SEGMENTS[s]} className={lit.has(s) ? "seg-on" : "seg-off"} />
        ))}
      </g>
    );
    x += DIGIT_W + 4;
    return g;
  });

  return (
    <svg viewBox={`-2 0 ${x + 2} 56`} className="seven-seg" aria-hidden="true" focusable="false">
      <g transform="skewX(-6) translate(4 0)">{parts}</g>
    </svg>
  );
}
