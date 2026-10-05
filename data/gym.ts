// Single source of truth for IRONFIT business data.
// Anything in [BRACKETS] is a placeholder that must be replaced before launch.

export type DayCode = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export type OpeningHours = {
  days: DayCode[];
  opens: string; // "HH:MM", Europe/Rome
  closes: string; // "HH:MM", Europe/Rome
};

export type Stat = {
  value: string;
  /** small unit after the number, e.g. "m²" */
  unit?: string;
  /** same size as the number, e.g. "+" */
  suffix?: string;
  label: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  cta: { label: string; href: string; external?: boolean };
} & (
  | { kind: "photo"; image: { src: string; alt: string; portrait?: boolean } }
  | { kind: "type"; tint: "warm" | "red" }
);

export const gym = {
  name: "IRONFIT",
  legalName: "[RAGIONE SOCIALE]",
  url: "https://ironfitribera.it",
  timeZone: "Europe/Rome",

  telephone: "[TELEFONO]",
  // International format without "+" or spaces, e.g. 39333xxxxxxx
  whatsapp: "[NUMERO]",
  whatsappMessage:
    "Ciao IRONFIT! Vorrei prenotare la prova gratuita. Quando posso passare?",
  email: "[EMAIL]",
  priceRange: "[FASCIA DI PREZZO]",

  address: {
    streetAddress: "[INDIRIZZO]",
    addressLocality: "Ribera",
    addressRegion: "AG",
    postalCode: "92016",
    addressCountry: "IT",
  },
  geo: {
    latitude: "[LATITUDINE]",
    longitude: "[LONGITUDINE]",
  },
  areaServed: ["Ribera", "Sciacca", "Agrigento"],

  social: {
    instagram: "[URL INSTAGRAM]",
    facebook: "[URL FACEBOOK]",
  },

  // [ORARI DA CONFERMARE] — example values only, used by the live status pill
  // and the JSON-LD. Replace with the real schedule before launch.
  openingHours: [
    { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "07:00", closes: "22:00" },
    { days: ["Sa"], opens: "07:00", closes: "22:00" },
  ] satisfies OpeningHours[],

  nutritionMessage:
    "Ciao IRONFIT! Vorrei prenotare una consulenza per un piano alimentare personalizzato.",

  // Trust bar. `value` is the number (counts up on the client when numeric);
  // placeholders stay static until real data replaces them.
  stats: [
    { value: "[MQ]", unit: "m²", label: "di spazio per allenarti" },
    { value: "[N]", label: "trainer qualificati" },
    { value: "[N]", suffix: "+", label: "macchinari Panatta" },
    { value: "[N]", unit: "giorni su 7", label: "aperti per te" },
  ] satisfies Stat[],

  // Google Business Profile reviews — copy the real values, never estimate.
  reviews: {
    rating: "[RATING]",
    count: "[N]",
  },

  equipment: ["Panatta", "Eleiko", "Concept2"],

  images: {
    hero: "/images/hero/hero-2560.jpg",
    heroAlt:
      "Sala pesi IRONFIT a Ribera con macchinari Panatta, rastrelliera di manubri e panca rossa regolabile",
    logo: "/logo.svg",
  },
} as const;

export const navLinks = [
  { id: "servizi", label: "Servizi" },
  { id: "functional", label: "Functional" },
  { id: "team", label: "Team" },
  { id: "orari", label: "Orari" },
  { id: "prezzi", label: "Prezzi" },
  { id: "contatti", label: "Contatti" },
] as const;

// Where "Prova gratuita" CTAs point until a dedicated booking flow exists.
export const trialHref = "#contatti";

export function whatsappHref(message: string = gym.whatsappMessage) {
  return `https://wa.me/${gym.whatsapp}?text=${encodeURIComponent(message)}`;
}

// Single source for the Servizi section and the JSON-LD OfferCatalog.
export const services: Service[] = [
  {
    id: "sala-pesi",
    name: "Sala pesi",
    description:
      "Manubri, rack, panche regolabili e tutto lo spazio per allenarti come si deve.",
    cta: { label: "Scopri la sala", href: "#galleria" },
    kind: "photo",
    image: {
      src: "/images/services/sala-pesi.jpg",
      alt: "Sala pesi di IRONFIT Ribera con rastrelliera di manubri, rack e panca regolabile",
    },
  },
  {
    id: "macchinari-panatta",
    name: "Macchinari Panatta",
    description:
      "La linea Panatta, made in Italy: movimenti precisi, carichi sicuri, la stessa qualità delle palestre più esigenti.",
    cta: { label: "Vedi i macchinari", href: "#galleria" },
    kind: "photo",
    image: {
      src: "/images/services/macchinari-panatta.jpg",
      alt: "Macchinari Panatta con imbottiture rosse nella sala di IRONFIT a Ribera, sotto le luci LED a soffitto",
    },
  },
  {
    id: "functional-training",
    name: "Functional Training",
    description:
      "Rig, kettlebell, vogatori Concept2 e bilancieri Eleiko. Allenamenti intensi, in gruppo, mai uguali.",
    cta: { label: "Prova una lezione", href: "#functional" },
    kind: "photo",
    image: {
      src: "/images/services/functional-training.jpg",
      alt: "Area functional di IRONFIT Ribera con rig, bilancieri e dischi colorati",
    },
  },
  {
    id: "personal-training",
    name: "Personal Training",
    description:
      "Un trainer tutto per te: programma su misura, tecnica corretta, risultati che puoi misurare.",
    cta: { label: "Conosci il team", href: "#team" },
    kind: "photo",
    image: {
      src: "/images/services/personal-training.jpg",
      alt: "Personal trainer di IRONFIT assiste un atleta alla panca piana su un macchinario Panatta",
      portrait: true,
    },
  },
  {
    id: "yoga",
    name: "Yoga",
    description:
      "Mobilità, respiro, equilibrio. Il complemento perfetto all'allenamento con i pesi.",
    cta: { label: "Orari yoga", href: "#orari" },
    kind: "type",
    tint: "warm",
  },
  {
    id: "nutrizione",
    name: "Nutrizione",
    description:
      "Un piano alimentare costruito su di te, per far rendere ogni allenamento.",
    cta: { label: "Prenota una consulenza", href: whatsappHref(gym.nutritionMessage), external: true },
    kind: "type",
    tint: "red",
  },
];

export function telHref() {
  return `tel:${gym.telephone.replace(/\s+/g, "")}`;
}
