"use client";

import { useState, type ReactNode } from "react";

// 3D flip card. Faces are server-rendered children; this only owns the state.
// The toggle is an overlay <button aria-pressed> (a button can't contain the
// H3 or the links), the CTA on the back stays a real link above it.
// Desktop (mouse): flips on hover and keyboard focus. Touch: tap toggles.
export default function FlipCard({
  label,
  front,
  back,
  className = "",
}: {
  label: string;
  front: ReactNode;
  back: ReactNode;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <li className={`tcard ${className}`} data-flipped={flipped}>
      <button
        type="button"
        className="tcard-toggle"
        aria-pressed={flipped}
        aria-label={label}
        onClick={() => setFlipped((f) => !f)}
      />
      <div className="tcard-inner">
        <div className="tcard-face tcard-front">{front}</div>
        <div className="tcard-face tcard-back">{back}</div>
      </div>
    </li>
  );
}
