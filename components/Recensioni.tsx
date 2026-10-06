import { gym, isPlaceholder, type Review } from "@/data/gym";
import { hasRealRating, shortAuthor } from "@/lib/content";
import { ArrowRight } from "./Icons";
import SectionReveal from "./SectionReveal";
import Stars from "./Stars";

// Only renders what is in gym.ts: no invented reviews, ratings or counts.
function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="rev-card">
      <Stars rating={r.rating} className="h-4 w-4" />
      <span className="sr-only">{r.rating} su 5</span>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-white/85">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{shortAuthor(r.author)}</span>
        <span className="text-white/50">{r.source}</span>
      </figcaption>
    </figure>
  );
}

export default function Recensioni() {
  const { googleRating, googleCount, googleReviewUrl, items } = gym.reviews;
  const showSummary = hasRealRating(googleRating, googleCount);
  const reviewHref = isPlaceholder(googleReviewUrl) ? "#recensioni" : googleReviewUrl;
  const rows = items.length >= 4 ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)] : null;

  return (
    <section id="recensioni" aria-labelledby="recensioni-title" className="relative overflow-clip bg-[#0d0d0d] py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />
      <div className="relative grid gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-end lg:gap-16">
        <header>
          <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
            Recensioni
          </p>
          <h2 id="recensioni-title" className="font-display text-[clamp(48px,8vw,112px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
            <span className="sr-line">
              <span className="sr-line-inner">Parola a chi</span>
            </span>{" "}
            <span className="sr-line">
              <span className="sr-line-inner">
                si allena qui<span className="text-iron-red">.</span>
              </span>
            </span>
          </h2>

          {showSummary && (
            <div className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-3">
              <p className="font-display text-[96px] font-extrabold leading-[0.8]">
                {googleRating!.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </p>
              <div>
                <Stars rating={googleRating!} className="h-6 w-6" />
                <p className="mt-2 text-white/75">
                  <span className="sr-only">{googleRating} su 5, </span>su {googleCount} recensioni Google
                </p>
                <a href={reviewHref} target="_blank" rel="noopener noreferrer" className="panel-link mt-1 inline-flex">
                  Leggile tutte su Google
                </a>
              </div>
            </div>
          )}
        </header>

        {/* Always present: invite members to leave a review. */}
        <a href={reviewHref} target="_blank" rel="noopener noreferrer" className="rev-cta group">
          <span className="rev-cta-stars" aria-hidden="true">
            <Stars rating={5} className="h-6 w-6" />
          </span>
          <span className="mt-6 block font-display text-[clamp(30px,3.4vw,44px)] font-extrabold uppercase leading-[0.95]">
            Ti alleni già da noi?
          </span>
          <span className="mt-3 block max-w-[34ch] text-white/75">
            Raccontalo a chi sta cercando una palestra a Ribera: bastano due righe.
          </span>
          <span className="btn btn-primary mt-7 w-fit">
            Lascia una recensione su Google
            <ArrowRight className="btn-arrow h-4 w-4" />
          </span>
        </a>
      </div>

      {items.length > 0 &&
        (rows ? (
          <div className="rev-marquee relative mt-16" aria-label="Recensioni dei clienti">
            {rows.map((row, r) => (
              <div key={r} className="rev-row" data-dir={r === 0 ? "left" : "right"} tabIndex={0} aria-label={`Recensioni, riga ${r + 1}`}>
                <div className="rev-track">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1 || undefined}>
                      {row.map((rv, i) => (
                        <ReviewCard key={i} r={rv} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative mt-16 grid gap-4 px-[var(--gutter)] md:grid-cols-3">
            {items.map((rv, i) => (
              <ReviewCard key={i} r={rv} />
            ))}
          </div>
        ))}

      <SectionReveal target="recensioni" />
    </section>
  );
}
