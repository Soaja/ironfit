"use client";

import { useState } from "react";
import { contact, gym } from "@/data/gym";
import { addressLines, mapsEmbedUrl } from "@/lib/contact";
import { LED_SEGMENTS } from "./LedLines";
import { LogoMark } from "./Logo";

// Click-to-load map (GDPR + performance): nothing from Google is requested
// until the visitor presses the button. Before that: a styled static facade.
export default function MapFacade() {
  const [loaded, setLoaded] = useState(false);
  const [street, city] = addressLines(contact.address);

  if (loaded) {
    return (
      <div className="map-box">
        <iframe
          src={mapsEmbedUrl(gym.name, contact.address, contact.geo)}
          title={`Mappa: ${gym.name}, ${street}, ${city}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="map-box map-facade">
      {/* stylised streets */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="10" strokeLinecap="round">
          <path d="M-20 210 C 90 190, 160 230, 420 150" />
          <path d="M120 -20 L 175 320" />
          <path d="M260 -20 C 250 90, 300 170, 290 320" />
        </g>
        <g fill="none" stroke="rgb(255 255 255 / 0.04)" strokeWidth="4">
          <path d="M-20 80 L 420 60" />
          <path d="M-20 270 L 420 250" />
          <path d="M40 -20 L 70 320" />
          <path d="M350 -20 L 360 320" />
        </g>
      </svg>
      <svg className="map-led" viewBox="900 60 760 250" aria-hidden="true">
        {LED_SEGMENTS.slice(0, 4).map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </svg>

      <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="map-pin" aria-hidden="true">
          <LogoMark className="h-9 w-9" />
        </span>
        <p className="text-sm leading-snug text-white/85">
          <span className="font-semibold text-white">{gym.name}</span>
          <br />
          {street} · {city}
        </p>
        <button type="button" className="btn btn-ghost" onClick={() => setLoaded(true)}>
          Carica la mappa
        </button>
        <p className="max-w-[34ch] text-xs text-white/55">Caricando la mappa accetti i cookie di Google.</p>
      </div>
    </div>
  );
}
