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
  /** Richer data for services that have their own section (feeds JSON-LD too). */
  details?: {
    sectionId: string;
    serviceType: string;
    audience: string;
    equipment: string[];
  };
} & (
  | { kind: "photo"; image: { src: string; alt: string; portrait?: boolean } }
  | { kind: "type"; tint: "warm" | "red" }
);

export type WodFormat = "FOR TIME" | "AMRAP" | "EMOM";
export type WodLevel = "rx" | "scaled" | "beginner";

export type Wod = {
  /** ISO date the workout was programmed for */
  date: string;
  title: string;
  format: WodFormat;
  /** AMRAP/EMOM duration, or an optional time cap for FOR TIME */
  minutes?: number;
  rounds?: number;
  /**
   * Per level: a quantity ("15/20 cal", "10 (9/6 kg)") is shown with the
   * movement name; a full phrase ("12 knee raises") replaces the movement.
   */
  movements: { name: string; rx: string; scaled: string; beginner: string }[];
  note?: string;
};

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

  functionalMessage: "Ciao! Vorrei provare una lezione di functional training a IRONFIT.",

  // Workout of the day. Example seeded from the one written on the mirror;
  // replace daily (or wire to a CMS later).
  wod: {
    date: "2026-10-05",
    title: "WOD del giorno",
    format: "FOR TIME",
    rounds: 4,
    movements: [
      { name: "Row", rx: "15/20 cal", scaled: "12/15 cal", beginner: "10 cal" },
      { name: "Toes to bar", rx: "20", scaled: "12 knee raises", beginner: "10 knee raises" },
      { name: "Wall ball", rx: "10 (9/6 kg)", scaled: "10 (6/4 kg)", beginner: "10 air squat" },
      { name: "Push press", rx: "15 (40/30 kg)", scaled: "15 (30/20 kg)", beginner: "15 (manubri leggeri)" },
    ],
  } satisfies Wod as Wod,

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
    details: {
      sectionId: "functional",
      serviceType: "Allenamento funzionale di gruppo con coach",
      audience: "Tutti i livelli",
      equipment: ["Rig", "Eleiko", "Concept2", "Air bike", "Kettlebell", "Anelli", "Plyo box"],
    },
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

export const functionalService = services.find((s) => s.details?.sectionId === "functional")!;

// Functional section photos (warm-graded web copies, see scripts/prepare-images.mjs).
export const functionalPhotos = [
  {
    id: "room",
    src: "/images/functional-web/fx-room.jpg",
    width: 1600,
    height: 1067,
    alt: "Area functional di IRONFIT a Ribera: pavimento in gomma, pilastri bianchi, rig e anelli sotto la luce LED calda",
  },
  {
    id: "mirror",
    src: "/images/functional-web/fx-mirror.jpg",
    width: 640,
    height: 640,
    alt: "Il WOD del giorno scritto con il pennarello arancione sullo specchio della sala functional di IRONFIT",
  },
  {
    id: "rowers",
    src: "/images/functional-web/fx-rowers.jpg",
    width: 1600,
    height: 1067,
    alt: "Area functional di IRONFIT a Ribera con vogatori Concept2, kettlebell e plyo box",
  },
  {
    id: "rings",
    src: "/images/functional-web/fx-rings.jpg",
    width: 1600,
    height: 1107,
    alt: "Parete per handstand push-up e anelli nella sala functional di IRONFIT",
  },
  {
    id: "bikes",
    src: "/images/functional-web/fx-bikes.jpg",
    width: 1600,
    height: 1067,
    alt: "Air bike e dischi Eleiko nell'area functional di IRONFIT a Ribera",
  },
] as const;
