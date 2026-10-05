// IRONFIT mark: black disc with the white ring split by one diagonal cut,
// as painted on the gym wall. Wordmark is live text so it scales with the font.

type Props = {
  className?: string;
  withWordmark?: boolean;
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="49.25" fill="#0A0A0A" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1.5" />
      <g fill="none" stroke="#FFFFFF" strokeWidth="13">
        <path d="M67.06 69.62A26 26 0 0 1 27.71 36.61" />
        <path d="M32.94 30.38A26 26 0 0 1 72.29 63.39" />
      </g>
    </svg>
  );
}

export default function Logo({ className = "", withWordmark = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-[var(--logo-size,44px)] w-[var(--logo-size,44px)] shrink-0" />
      {withWordmark && (
        <span
          aria-hidden="true"
          className="font-display text-[1.6rem] font-extrabold leading-none tracking-[0.08em] text-white"
        >
          IRONFIT
        </span>
      )}
    </span>
  );
}
