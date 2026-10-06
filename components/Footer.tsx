import { contact, credits, gym, isPlaceholder, legal, navLinks, telHref, whatsappHref } from "@/data/gym";
import { mailtoUrl } from "@/lib/contact";
import { summarizeHours } from "@/lib/schedule";
import { CurrentYear, FooterLed } from "./FooterExtras";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./Icons";
import Logo from "./Logo";
import NapAddress from "./NapAddress";

const NAV = [
  ...navLinks.map((l) => ({ href: `/#${l.id}`, label: l.label })),
  { href: "/#galleria", label: "Galleria" },
  { href: "/#faq", label: "FAQ" },
  { href: "/yoga", label: "Yoga" },
  { href: "/nutrizione", label: "Nutrizione" },
];

function Social({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  // Profiles still to be filled in are not shown (no dead links).
  if (!href || isPlaceholder(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/80 transition-colors hover:border-white/50 hover:text-white"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const mail = mailtoUrl(contact.email);
  return (
    <footer className="site-footer relative overflow-clip bg-[#070707] pb-8 pt-16 lg:pt-24">
      {/* Giant outlined wordmark + LED lines drawing in */}
      <div className="relative px-[var(--gutter)]" aria-hidden="true">
        <p className="footer-wordmark">IRONFIT</p>
        <FooterLed />
      </div>

      <div className="relative mt-12 grid gap-10 px-[var(--gutter)] sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 max-w-[30ch] text-white/65">Palestra a Ribera: sala pesi Panatta, functional training e personal trainer.</p>
          <div className="mt-6 flex gap-2">
            <Social href={contact.instagram} label="Instagram di IRONFIT">
              <InstagramIcon className="h-5 w-5" />
            </Social>
            <Social href={contact.facebook} label="Facebook di IRONFIT">
              <FacebookIcon className="h-5 w-5" />
            </Social>
            <Social href={whatsappHref()} label="WhatsApp di IRONFIT">
              <WhatsAppIcon className="h-5 w-5" />
            </Social>
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="footer-h">Naviga</h2>
          <ul className="grid gap-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="footer-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="footer-h">Orari</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[15px]">
            {summarizeHours(gym.openingHours).map((g) => (
              <div key={g.days} className="contents">
                <dt className="text-white/55">{g.days}</dt>
                <dd className={g.hours === "Chiuso" ? "text-white/40" : "tabular-nums text-white/85"}>{g.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div id="footer-contatti">
          <h2 className="footer-h">Contatti</h2>
          <NapAddress className="text-[15px] leading-relaxed text-white/75" />
          <ul className="mt-4 grid gap-2 text-[15px]">
            <li>
              <a href={telHref()} className="footer-link">
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="footer-link">
                WhatsApp
              </a>
            </li>
            <li>{mail ? <a href={mail} className="footer-link">{contact.email}</a> : <span className="text-white/75">{contact.email}</span>}</li>
          </ul>
        </div>
      </div>

      <div className="relative mt-14 flex flex-col gap-4 border-t border-white/10 px-[var(--gutter)] pt-6 text-sm text-white/55 lg:flex-row lg:items-center lg:justify-between">
        <p>
          © <CurrentYear buildYear={new Date().getFullYear()} /> {legal.companyName} · P.IVA {legal.vat}
        </p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <a href="/privacy" className="footer-link">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/cookie" className="footer-link">
              Cookie Policy
            </a>
          </li>
          <li>
            <a
              href={isPlaceholder(credits.url) ? "#" : credits.url}
              {...(isPlaceholder(credits.url) ? {} : { target: "_blank", rel: "noopener" })}
              className="text-xs text-white/40 hover:text-white/70"
            >
              {credits.label}
            </a>
          </li>
          <li>
            <a href="#contenuto" className="footer-top">
              Torna su <span aria-hidden="true">↑</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
