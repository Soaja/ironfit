"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent, type RefObject } from "react";
import { contact, navLinks, telHref, whatsappHref } from "@/data/gym";
import { InstagramIcon, PhoneIcon, WhatsAppIcon } from "./Icons";
import LedLines from "./LedLines";

type Props = {
  open: boolean;
  activeId: string | null;
  toggleRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileMenu({ open, activeId, toggleRef, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";

    const firstLink = menuRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstLink?.focus({ preventScroll: true });

    // Focus is trapped between the toggle (the X) and the menu contents.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !menuRef.current || !toggleRef.current) return;
      const items = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current !== null && items.includes(current);
      if (e.shiftKey && (current === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    // Close if the viewport grows past the mobile breakpoint.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => desktop.matches && onClose();

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      root.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open, onClose, toggleRef]);

  // Close first, scroll after: letting the browser start the anchor scroll
  // while the page is still scroll-locked made it land hundreds of px off.
  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target || e.metaKey || e.ctrlKey || e.shiftKey) return; // let the browser handle it
    e.preventDefault();
    onClose();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        history.pushState(null, "", `#${id}`);
      }),
    );
  };

  const actions = [
    { href: telHref(), label: "Chiama", Icon: PhoneIcon, external: false },
    { href: whatsappHref(), label: "WhatsApp", Icon: WhatsAppIcon, external: true },
    { href: contact.instagram, label: "Instagram", Icon: InstagramIcon, external: true },
  ];

  return (
    <div
      ref={menuRef}
      id="mobile-menu"
      className="mobile-menu fixed inset-0 z-40 flex flex-col overflow-y-auto bg-iron-black px-[var(--gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-[calc(var(--header-h-compact)+32px)] lg:hidden"
      data-open={open}
      inert={!open}
    >
      <LedLines
        variant="menu"
        className="pointer-events-none absolute -right-[20%] top-[8%] w-[140%] max-w-none opacity-[0.09] [filter:drop-shadow(0_0_6px_#fff)]"
      />

      <nav aria-label="Menu mobile" className="relative flex-1">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ id, label }, i) => (
            <li key={id} className="mobile-menu-item" style={{ "--i": i } as CSSProperties}>
              <a
                href={`/#${id}`}
                onClick={(e) => goTo(e, id)}
                aria-current={activeId === id ? "location" : undefined}
                className="group flex items-baseline gap-4 py-1 font-display text-[clamp(2.75rem,13vw,4.5rem)] font-extrabold uppercase leading-[1] text-white aria-[current=location]:text-iron-red"
              >
                <span className="font-sans text-xs font-semibold tracking-[0.2em] text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-2">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ul
        className="mobile-menu-item relative mt-10 grid grid-cols-3 border-t border-white/10 pt-6"
        style={{ "--i": navLinks.length } as CSSProperties}
      >
        {actions.map(({ href, label, Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex min-h-12 flex-col items-center justify-center gap-2 py-2 text-sm font-medium text-white/85 hover:text-white"
            >
              <Icon className="h-6 w-6 text-iron-red" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
