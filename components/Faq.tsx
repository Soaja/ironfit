import { faq, whatsappHref } from "@/data/gym";
import { parseRichText } from "@/lib/content";
import FaqEnhancer from "./FaqEnhancer";
import { WhatsAppIcon } from "./Icons";
import SectionReveal from "./SectionReveal";

function Rich({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((s, i) =>
        s.href ? (
          <a key={i} href={s.href} className="faq-link">
            {s.text}
          </a>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

// Native <details>/<summary>: works and is crawlable without JS. FaqEnhancer
// adds the open/close animation and "one open at a time" on desktop.
export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative overflow-clip bg-iron-black py-24 lg:py-32">
      <div className="hero-grain" aria-hidden="true" />
      <div className="relative grid gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p data-sr="fade" className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
            Domande frequenti
          </p>
          <h2 id="faq-title" className="font-display text-[clamp(44px,6vw,96px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em]">
            <span className="sr-line">
              <span className="sr-line-inner">Tutto quello</span>
            </span>{" "}
            <span className="sr-line">
              <span className="sr-line-inner">
                che vuoi sapere<span className="text-iron-red">.</span>
              </span>
            </span>
          </h2>
          <p className="mt-8 text-lg text-white/75">Non trovi la risposta?</p>
          <a
            href={whatsappHref("Ciao IRONFIT! Ho una domanda:")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Scrivici su WhatsApp
          </a>
        </div>

        <div className="faq-list">
          {faq.map((f) => (
            <details key={f.q} className="faq-item">
              <summary className="faq-q">
                <h3 className="text-[17px] font-semibold leading-snug sm:text-lg">{f.q}</h3>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>
                  <Rich text={f.a} />
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
      <FaqEnhancer />
      <SectionReveal target="faq" />
    </section>
  );
}
