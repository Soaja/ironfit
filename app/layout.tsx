import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Permanent_Marker } from "next/font/google";
import type { DayOfWeek, ExerciseGym, WithContext } from "schema-dts";
import { contact, faq, gym, isPlaceholder, services, team, type DayCode } from "@/data/gym";
import { faqJsonLd, hasRealRating } from "@/lib/content";
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

// WOD card handwriting (the marker on the mirror). Not preloaded, and only
// applied once the Functional section is near the viewport (see globals.css),
// so it never competes with the hero on first load.
const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-marker",
});

const title ="Palestra a Ribera | IRONFIT – Sala pesi, Functional e Personal Trainer";
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
  // edge-to-edge on iPhone (notch, home indicator); fixed bars use env(safe-area-inset-*)
  viewportFit: "cover",
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

// Only trainers with real names are published (never "[NOME]").
// FAQPage from the same gym.ts data, without answers still "[DA CONFERMARE]".
const faqLd = faqJsonLd(faq);

const employees = team
  .filter((t) => !isPlaceholder(t.name))
  .map((t) => ({
    "@type": "Person" as const,
    name: t.name,
    ...(isPlaceholder(t.role) ? {} : { jobTitle: t.role }),
    image: `${gym.url}${t.portrait.src}`,
  }));

const jsonLd: WithContext<ExerciseGym> = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "@id": `${gym.url}/#palestra`,
  name: gym.name,
  url: gym.url,
  logo: `${gym.url}${gym.images.logo}`,
  image: `${gym.url}${gym.images.hero}`,
  description,
  ...(isPlaceholder(contact.phone) ? {} : { telephone: contact.phone }),
  ...(isPlaceholder(contact.email) ? {} : { email: contact.email }),
  priceRange: gym.priceRange,
  // Same NAP fields as the visible <address> in Contatti and the footer.
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.address.street,
    addressLocality: contact.address.city,
    addressRegion: contact.address.province,
    postalCode: contact.address.postalCode,
    addressCountry: contact.address.country,
  },
  ...(isPlaceholder(contact.geo.lat) || isPlaceholder(contact.geo.lng)
    ? {}
    : { geo: { "@type": "GeoCoordinates", latitude: contact.geo.lat, longitude: contact.geo.lng } }),
  ...(isPlaceholder(contact.googleMapsUrl) ? {} : { hasMap: contact.googleMapsUrl }),
  openingHoursSpecification: gym.openingHours.map((slot) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: slot.days.map((d) => SCHEMA_DAYS[d]),
    opens: slot.opens,
    closes: slot.closes,
  })),
  sameAs: [contact.instagram, contact.facebook].filter((u): u is string => !isPlaceholder(u)),
  areaServed: gym.areaServed.map((name) => ({ "@type": "City", name })),
  ...(employees.length ? { employee: employees } : {}),
  // Only with real Google numbers; never placeholders. No Review markup.
  ...(hasRealRating(gym.reviews.googleRating, gym.reviews.googleCount)
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: gym.reviews.googleRating!,
          reviewCount: gym.reviews.googleCount!,
          bestRating: 5,
        },
      }
    : {}),
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
        ...(s.details
          ? {
              url: `${gym.url}/#${s.details.sectionId}`,
              serviceType: s.details.serviceType,
              audience: { "@type": "PeopleAudience", audienceType: s.details.audience },
              category: s.details.equipment.join(", "),
            }
          : {}),
      },
    })),
  },
};

// Runs before first paint: picks the intro mode so the CSS start state is
// applied without a flash. Safety net: if JS/GSAP never arrives, reveal at 4s.
const introScript = `(function(){var d=document.documentElement,m="full";try{if(location.pathname!=="/")m="none";else if(matchMedia("(prefers-reduced-motion: reduce)").matches)m="none";else if(sessionStorage.getItem("ironfit-intro"))m="fade";else sessionStorage.setItem("ironfit-intro","1")}catch(e){}d.dataset.intro=m;setTimeout(function(){if(d.dataset.intro==="full")d.dataset.intro="done"},4000)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${barlow.variable} ${inter.variable} ${marker.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {faqLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
          />
        )}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
