import { starFills } from "@/lib/content";

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z";

// 5 stars with partial fill (e.g. 4.3). Visual only: callers give the text value.
export default function Stars({ rating, className = "h-5 w-5" }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {starFills(rating).map((fill, i) => (
        <span key={i} className={`relative inline-block ${className}`}>
          <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-white/20" fill="currentColor">
            <path d={STAR} />
          </svg>
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <svg viewBox="0 0 24 24" className={`h-full text-iron-red ${className}`} fill="currentColor">
              <path d={STAR} />
            </svg>
          </span>
        </span>
      ))}
    </span>
  );
}
