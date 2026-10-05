import { gym } from "@/data/gym";
import CountUp from "./CountUp";

export default function TrustBar() {
  return (
    <section aria-labelledby="numeri-title" className="relative bg-[#111] px-[var(--gutter)] py-14 lg:py-20">
      <h2 id="numeri-title" className="sr-only">
        IRONFIT in numeri
      </h2>
      <ul className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-12 lg:grid-cols-4">
        {gym.stats.map((stat, i) => (
          <li
            key={stat.label}
            // 2×2 on mobile (divider between the columns), 4 in a row on desktop.
            className={`flex flex-col gap-2 px-4 sm:px-8 ${
              i % 2 === 1 ? "border-l border-white/10" : "pl-0 sm:pl-0"
            } ${i === 2 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""}`}
          >
            <p className="font-display text-[clamp(44px,6vw,72px)] font-extrabold uppercase leading-[0.9] tracking-[-0.01em] text-white">
              <CountUp value={stat.value} />
              {stat.suffix && <span className="text-iron-red">{stat.suffix}</span>}
              {stat.unit && " "}
              {stat.unit && (
                <span className="inline-block whitespace-nowrap align-baseline text-[0.42em] font-bold normal-case tracking-[0.02em] text-white/85">
                  {stat.unit}
                </span>
              )}
            </p>
            <p className="text-sm text-white/60 sm:text-[15px]">{stat.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
