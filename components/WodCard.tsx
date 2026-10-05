import { gym } from "@/data/gym";
import { wodHeadline } from "@/lib/wod";
import WodDate from "./WodDate";
import WodTimer from "./WodTimer";
import WodWorkout from "./WodWorkout";

// The mirror at the functional area, as a card: dark glass, marker writing.
export default function WodCard({ className = "" }: { className?: string }) {
  return (
    <article aria-labelledby="wod-title" className={`wod-card ${className}`}>
      <header className="flex items-baseline justify-between gap-4">
        <h3 id="wod-title" className="font-display text-[22px] font-extrabold uppercase leading-none tracking-[0.04em]">
          WOD del giorno
        </h3>
        <WodDate className="min-h-[1.25rem] text-sm text-white/60" />
      </header>

      <p className="wod-headline">{wodHeadline(gym.wod)}</p>

      <WodWorkout />

      <div className="my-5 h-px bg-white/10" aria-hidden="true" />

      <WodTimer />
    </article>
  );
}
