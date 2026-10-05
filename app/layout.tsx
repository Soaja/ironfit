import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import type { DayOfWeek, ExerciseGym, WithContext } from "schema-dts";
import { gym, services, type DayCode } from "@/data/gym";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const title = "Palestra a Ribera | IRONFIT – Sala pesi, Functional e Personal Trainer";
const description =
  "Palestra a Ribera con macchinari Panatta, area functional e personal trainer. IRONFIT ti aspetta: prenota la tua prova gratuita.";

export const metadata: Metadata = {
  metadataBase: new URL(gym.url),
  title,
  description,
  applicationName: gym.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: gym.name,
    title,
    description,
    // Image comes from app/opengraph-image.tsx (1200×630).
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  other: {
    "geo.region": "IT-AG",
    "geo.placename": "Ribera",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

const SCHEMA_DAYS: Record<DayCode, DayOfWeek> = {
  Mo: "https://schema.org/Monday",
  Tu: "https://schema.org/Tuesday",
  We: "https://schema.org/Wednesday",
  Th: "https://schema.org/Thursday",
  Fr: "https://schema.org/Friday",
  Sa: "https://schema.org/Saturday",
  Su: "https://schema.org/Sunday",
};

const jsonLd: WithContext<ExerciseGym> = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "@id": `${gym.url}/#palestra`,
  name: gym.name,
  url: gym.url,
  logo: `${gym.url}${gym.images.logo}`,
  image: `${gym.url}${gym.images.hero}`,
  description,
  telephone: gym.telephone,
  priceRange: gym.priceRange,
  address: {
    "@type": "PostalAddress",
    ...gym.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: gym.geo.latitude,
    longitude: gym.geo.longitude,
  },
  openingHoursSpecification: gym.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.days.map((d) => SCHEMA_DAYS[d]),
    opens: slot.opens,
    closes: slot.closes,
  })),
  sameAs: Object.values(gym.social),
  areaServed: gym.areaServed.map((name) => ({ "@type": "City", name })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servizi IRONFIT",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
        ...(s.kind === "photo" ? { image: `${gym.url}${s.image.src}` } : {}),
      },
    })),
  },
};

// Runs before first paint: picks the intro mode so the CSS start state is
// applied without a flash. Safety net: if JS/GSAP never arrives, reveal at 4s.
const introScript = `(function(){var d=document.documentElement,m="full";try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)m="none";else if(sessionStorage.getItem("ironfit-intro"))m="fade";else sessionStorage.setItem("ironfit-intro","1")}catch(e){}d.dataset.intro=m;setTimeout(function(){if(d.dataset.intro==="full")d.dataset.intro="done"},4000)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${barlow.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
