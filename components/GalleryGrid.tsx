"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { gallery, GALLERY_ZONES, type GalleryZone } from "@/data/gym";

const ZONE_LABEL = Object.fromEntries(GALLERY_ZONES.map((z) => [z.id, z.label])) as Record<GalleryZone, string>;

// Masonry (CSS columns), zone filters, clip-path reveal and an in-house lightbox
// on a native <dialog> (focus trap + Escape; focus goes back to the thumbnail).
export default function GalleryGrid() {
  const [zone, setZone] = useState<GalleryZone | "tutto">("tutto");
  const [open, setOpen] = useState<number | null>(null); // index into `visible`
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<number | null>(null);

  const visible = gallery.map((img, i) => ({ img, i })).filter(({ img }) => zone === "tutto" || img.zone === zone);

  // Staggered clip-path wipe as items scroll in (JS only; no-JS shows everything).
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    list.dataset.armed = "true";
    let batch = 0;
    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = `${(batch++ % 6) * 70}ms`;
          el.dataset.shown = "true";
          io.unobserve(el);
        }
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => (batch = 0));
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (open !== null && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [open]);

  const go = (delta: number) => setOpen((o) => (o === null ? o : (o + delta + visible.length) % visible.length));
  const close = () => dialogRef.current?.close();

  const current = open !== null ? visible[open]?.img : null;
  const neighbors = open !== null && visible.length > 1 ? [visible[(open + 1) % visible.length], visible[(open - 1 + visible.length) % visible.length]] : [];

  return (
    <>
      <div role="group" aria-label="Filtra la galleria" className="mb-8 flex flex-wrap gap-2">
        {[{ id: "tutto" as const, label: "Tutto" }, ...GALLERY_ZONES].map((z) => (
          <button key={z.id} type="button" aria-pressed={zone === z.id} onClick={() => setZone(z.id)} className="tt-chip">
            {z.label}
          </button>
        ))}
      </div>

      <div className="gal-wrap">
      <ul ref={listRef} className="gal">
        {gallery.map((img, i) => {
          const pos = visible.findIndex((v) => v.i === i);
          return (
            <li
              key={img.src}
              className="gal-item"
              hidden={pos === -1}
              // feature (2×2) for the first photo, tall (1×2) for portrait/square shots
              data-shape={i === 0 ? "feature" : img.height >= img.width ? "tall" : undefined}
            >
              <button
                type="button"
                className="gal-btn"
                aria-label={`Apri foto: ${img.alt}`}
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setOpen(pos);
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  quality={80}
                  sizes={i === 0 ? "(min-width: 1280px) 50vw, (min-width: 1024px) 66vw, 100vw" : "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"}
                  className="gal-img"
                />
                <span className="gal-zone" aria-hidden="true">
                  {ZONE_LABEL[img.zone]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="lb"
        aria-label="Galleria fotografica"
        onClose={() => {
          setOpen(null);
          triggerRef.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onTouchStart={(e: TouchEvent) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e: TouchEvent) => {
          const start = touch.current;
          touch.current = null;
          if (start === null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {current && open !== null && (
          <div className="lb-body">
            <div className="lb-top">
              <span className="font-display text-lg font-bold tabular-nums tracking-[0.06em]" aria-live="polite">
                {open + 1} / {visible.length}
              </span>
              <button type="button" onClick={close} className="tt-close" aria-label="Chiudi la galleria" autoFocus>
                ✕
              </button>
            </div>
            <figure className="lb-figure">
              <div className="lb-frame">
                <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" quality={80} className="object-contain" />
              </div>
              <figcaption className="lb-caption">{current.alt}</figcaption>
            </figure>
            <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Foto precedente">
              ‹
            </button>
            <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="Foto successiva">
              ›
            </button>
            {/* Preload only the neighbors */}
            <div className="lb-preload" aria-hidden="true">
              {neighbors.map(({ img }) => (
                <Image key={img.src} src={img.src} alt="" width={img.width} height={img.height} sizes="100vw" quality={80} loading="eager" />
              ))}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
