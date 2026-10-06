"use client";

import { useEffect } from "react";

// Progressive enhancement for the FAQ <details>: smooth open/close (Web
// Animations on the item's height — the one deliberate non-transform
// animation, limited to a single small element) and, on desktop, only one
// item open at a time. Without JS the native <details> behaviour remains.
export default function FaqEnhancer() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLDetailsElement>("#faq .faq-item"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const running = new WeakMap<HTMLDetailsElement, Animation>();

    const animate = (d: HTMLDetailsElement, open: boolean) => {
      const summary = d.querySelector("summary")!;
      running.get(d)?.cancel();
      d.dataset.state = open ? "open" : "closed"; // intended state, even mid-animation
      if (reduced.matches) {
        d.open = open;
        return;
      }
      const from = d.offsetHeight;
      if (open) d.open = true;
      const to = open ? d.scrollHeight : summary.offsetHeight;
      d.style.overflow = "hidden";
      const anim = d.animate({ height: [`${from}px`, `${to}px`] }, { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      running.set(d, anim);
      anim.onfinish = () => {
        if (!open) d.open = false;
        d.style.overflow = "";
        running.delete(d);
      };
    };

    const handlers = items.map((d) => {
      const onClick = (e: Event) => {
        e.preventDefault();
        const state = (el: HTMLDetailsElement) => el.dataset.state ?? (el.open ? "open" : "closed");
        const opening = state(d) !== "open";
        if (opening && desktop.matches) items.forEach((o) => o !== d && state(o) === "open" && animate(o, false));
        animate(d, opening);
      };
      const summary = d.querySelector("summary")!;
      summary.addEventListener("click", onClick);
      return () => summary.removeEventListener("click", onClick);
    });
    return () => handlers.forEach((off) => off());
  }, []);

  return null;
}
