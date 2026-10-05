import type { ReactNode } from "react";
import type { QuizIcon } from "@/data/gym";

// Line icons for the quiz options (decorative: each option has a text label).
const PATHS: Record<QuizIcon, ReactNode> = {
  scale: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path d="M8 9a4 4 0 0 1 8 0M12 9l1.5-2" />
    </>
  ),
  dumbbell: <path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12" />,
  muscle: (
    <>
      {/* flexed arm: forearm up, biceps peak */}
      <path d="M5 20v-5.5C5 10 7.5 7 9.5 5.5L12 4l1.5 2-2.5 2v3.5c1-1.2 2.6-2 4.5-2 3 0 4.5 2.2 4.5 4.8 0 3.2-2.4 5.7-6 5.7z" />
      <path d="M11 15.5c1.4-1.3 3.6-1.3 5 0" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM5 12h3l1.5-2.5L12 15l1.5-3H19" />,
  level1: (
    <>
      <path d="M5 19v-3" strokeWidth="3" />
      <path d="M12 19v-7M19 19V8" opacity="0.3" strokeWidth="3" />
    </>
  ),
  level2: (
    <>
      <path d="M5 19v-3M12 19v-7" strokeWidth="3" />
      <path d="M19 19V8" opacity="0.3" strokeWidth="3" />
    </>
  ),
  level3: <path d="M5 19v-3M12 19v-7M19 19V8" strokeWidth="3" />,
  solo: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
    </>
  ),
  group: (
    <>
      <circle cx="12" cy="7.5" r="2.6" />
      <circle cx="5.5" cy="9" r="2" />
      <circle cx="18.5" cy="9" r="2" />
      <path d="M7.5 19c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5M2.5 18c0-2 1.3-3.6 3-3.6M21.5 18c0-2-1.3-3.6-3-3.6" />
    </>
  ),
  coach: (
    <>
      <circle cx="8" cy="7" r="2.6" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M3.5 20c0-3 2-5.2 4.5-5.2S12.5 17 12.5 20M13.5 20c0-2.4 1.6-4.4 3.5-4.4s3.5 2 3.5 4.4M11 11l3.5 1" />
    </>
  ),
  breath: <path d="M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7" />,
};

export default function QuizIconSvg({ name, className }: { name: QuizIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
