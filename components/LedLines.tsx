// The ceiling LED strips of the real gym, traced on the 2560×1920 hero master.
// Each segment is listed in "drawing order", like a pen going round the polygon,
// so the intro switches them on one after another.
const VIEW_W = 2560;
const VIEW_H = 1920;

type Segment = readonly [x1: number, y1: number, x2: number, y2: number];

export const LED_SEGMENTS: readonly Segment[] = [
  // Front polygon (near the camera)
  [930, 159.5, 1410, 91],
  [1459, 97.5, 1632.5, 230],
  [1632.5, 234, 1225, 280],
  [1182.5, 276, 927.5, 160],
  // Back polygon (above the logo wall)
  [784, 389, 1084, 362],
  [1119, 365, 1302, 417],
  [1302, 418, 1028, 440],
  [1000, 438, 784, 390],
];

type Props = {
  variant?: "hero" | "menu";
  className?: string;
};

export default function LedLines({ variant = "hero", className = "" }: Props) {
  if (variant === "menu") {
    // Faint, cropped-in version of the front polygon for the mobile menu backdrop.
    return (
      <svg
        viewBox="900 60 760 250"
        preserveAspectRatio="xMidYMid meet"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`led-svg ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* userSpaceOnUse: a bbox-relative region would clip the blur of near-horizontal lines */}
        <filter id="led-bloom" filterUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g className="led-bloom-group" filter="url(#led-bloom)">
        {LED_SEGMENTS.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} className="led-bloom" x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className="led-group">
        {LED_SEGMENTS.map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}-${y1}`}
            className="led-line"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            pathLength={1}
          />
        ))}
      </g>
    </svg>
  );
}
