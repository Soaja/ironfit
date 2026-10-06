import type { CSSProperties, ReactNode } from "react";
import Footer from "../Footer";
import Header from "../Header";
import MobileActionBar from "../MobileActionBar";

// Chrome shared by the service pages (/yoga, /nutrizione). `accent` tints the
// page (LED glow, chips, numbers) so each page has its own character.
export default function SubPageShell({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div className="subpage" style={{ "--accent": accent } as CSSProperties}>
      <a href="#contenuto" className="skip-link">
        Salta al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
}
