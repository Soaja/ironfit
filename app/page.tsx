import Contatti from "@/components/Contatti";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Galleria from "@/components/Galleria";
import Header from "@/components/Header";
import Recensioni from "@/components/Recensioni";
import Functional from "@/components/Functional";
import Hero from "@/components/Hero";
import MobileActionBar from "@/components/MobileActionBar";
import Orari from "@/components/Orari";
import Percorso from "@/components/Percorso";
import Team from "@/components/Team";
import Services from "@/components/Services";
import TrustBar from "@/components/TrustBar";

// No <Suspense> around sections: in the static prerender Next streams every
// Suspense boundary out of order (hidden <div id="S:…"> + inline swap script),
// which leaves the content invisible without JavaScript.
export default function Home() {
  return (
    <>
      <a href="#contenuto" className="skip-link">
        Salta al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        <Hero />
        <TrustBar />
        <Services />
        <Functional />
        <Team />
        <Percorso />
        <Orari />
        <Galleria />
        <Recensioni />
        <Faq />
        <FinalCta />
        <Contatti />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
