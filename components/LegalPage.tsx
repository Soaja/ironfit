import Link from "next/link";
import { legal } from "@/data/gym";
import Footer from "./Footer";
import Header from "./Header";
import MobileActionBar from "./MobileActionBar";

// Shell for /privacy and /cookie. The legal text must come from a
// professional service: this page never contains self-written legal copy.
export default function LegalPage({ title }: { title: string }) {
  return (
    <>
      <a href="#contenuto" className="skip-link">
        Salta al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="relative min-h-[70svh] bg-iron-black px-[var(--gutter)] pb-24 pt-[calc(var(--header-h)+56px)] outline-none">
        <div className="hero-grain" aria-hidden="true" />
        <div className="relative mx-auto max-w-[760px]">
          <p className="mb-5 flex w-fit items-center gap-3 text-[12px] font-semibold uppercase leading-none tracking-[0.22em] text-white/70 sm:text-[13px]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-iron-red" />
            {legal.companyName}
          </p>
          <h1 className="font-display text-[clamp(48px,8vw,104px)] font-extrabold uppercase leading-[0.9]">{title}</h1>
          <div className="mt-10 border border-dashed border-white/25 bg-white/[0.03] p-6 text-white/80">
            [TESTO DA INSERIRE: generare con un servizio professionale, es. iubenda]
          </div>
          <Link href="/" className="panel-link mt-10 inline-flex">
            <span aria-hidden="true">←</span> Torna alla home
          </Link>
        </div>
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
