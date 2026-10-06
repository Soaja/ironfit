"use client";

import { useSyncExternalStore } from "react";
import { contact, gym } from "@/data/gym";
import { appleMapsUrl, directionsUrl } from "@/lib/contact";
import { PinIcon } from "./Icons";

const isApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
const noop = () => () => {};

// "Indicazioni stradali" (Google Maps) always; "Apri in Mappe" only on Apple
// devices (decided after hydration, so the server HTML is the same for all).
export default function MapsButtons() {
  const apple = useSyncExternalStore(noop, isApple, () => false);
  return (
    <div className="flex flex-wrap gap-3">
      <a href={directionsUrl(gym.name, contact.address, contact.geo)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
        <PinIcon className="h-5 w-5" />
        Indicazioni stradali
      </a>
      {apple && (
        <a href={appleMapsUrl(gym.name, contact.address, contact.geo)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Apri in Mappe
        </a>
      )}
    </div>
  );
}
