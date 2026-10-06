// Single source of truth for IRONFIT business data.
// Anything in [BRACKETS] is a placeholder that must be replaced before launch.

// Explicit .ts extension: this file is also loaded by Node's test runner.
import { telUrl, whatsappUrl } from "../lib/contact.ts";

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

export type Review = { author: string; text: string; rating: number; date?: string; source: "Google" };
export type Reviews = {
  googleRating?: number;
  googleCount?: number;
  googleReviewUrl: string;
  items: Review[];
};

// ---------------------------------------------------------------------------
// Contacts, legal, credits: the ONLY place these values live. UI, JSON-LD,
// WhatsApp links, map links and .ics files all read from here.
// ---------------------------------------------------------------------------
export const contact = {
  address: {
    street: "[VIA E NUMERO]",
    city: "Ribera",
    province: "AG",
    postalCode: "92016",
    country: "IT",
  },
  geo: { lat: "[LAT]", lng: "[LNG]" },
  phone: "[TELEFONO]",
  whatsapp: "[NUMERO WHATSAPP, formato 39...]",
  email: "[EMAIL]",
  googleMapsUrl: "[LINK GOOGLE MAPS]",
  instagram: "[INSTAGRAM]",
  facebook: "[FACEBOOK]" as string | undefined,
};

export const legal = {
  companyName: "[RAGIONE SOCIALE]",
  vat: "[P.IVA]",
  /** Flip to true once real Privacy/Cookie texts are in: removes noindex and adds the pages to the sitemap. */
  pagesReady: false,
};

export const credits = { label: "Sito realizzato da OSTOIA&CO", url: "[URL OSTOIA]" };

export const gym = {
  name: "IRONFIT",
  url: "https://ironfitribera.it",
  timeZone: "Europe/Rome",

  whatsappMessage:
    "Ciao IRONFIT! Vorrei prenotare la prova gratuita. Quando posso passare?",
  priceRange: "[FASCIA DI PREZZO]",
  areaServed: ["Ribera", "Sciacca", "Agrigento"],

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

  // Google Business Profile reviews — copy the real values, NEVER estimate.
  // Leave googleRating/googleCount undefined until known; items start empty.
  reviews: {
    googleReviewUrl: "[LINK RECENSIONI GOOGLE]",
    items: [],
  } as Reviews,

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
export const trialHref = "/#contatti";

export function whatsappHref(message: string = gym.whatsappMessage) {
  return whatsappUrl(contact.whatsapp, message);
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

/** tel: link, or the Contatti section while the number is still a placeholder. */
export function telHref() {
  return telUrl(contact.phone) ?? "/#contatti";
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

/** True for unfilled data like "[NOME]" — never publish these (JSON-LD, links). */
export function isPlaceholder(value: string | undefined): boolean {
  return !value || /^\[.*\]$/.test(value.trim());
}

// ---------------------------------------------------------------------------
// Team. Names, roles, bios and certifications are placeholders until the gym
// sends the real data. `tags` drive the quiz matching (lib/recommend.ts).
// ---------------------------------------------------------------------------
export type QuizGoal = "dimagrimento" | "forza" | "ipertrofia" | "benessere";
export type QuizExperience = "principiante" | "intermedio" | "esperto";
export type QuizPreference = "sala" | "functional" | "personal" | "yoga";
export type TeamTag = QuizGoal | QuizExperience | "tonificazione" | "functional" | "resistenza";

export type Trainer = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  certifications: string[];
  tags: TeamTag[];
  /** studio portrait; `focus` = object-position on the face */
  portrait: { src: string; focus: string };
  /** in action with a member (card back) */
  actionPhoto?: { src: string; focus: string };
  instagram?: string;
};

const trainerPlaceholders = {
  name: "[NOME]",
  role: "[RUOLO]",
  specialty: "[SPECIALITÀ]",
  bio: "[BIO, max 160 caratteri]",
  certifications: ["[CERTIFICAZIONE]"],
  instagram: "[INSTAGRAM]",
};

export const team: Trainer[] = [
  {
    id: "trainer-01",
    ...trainerPlaceholders,
    tags: ["dimagrimento", "tonificazione", "principiante"],
    portrait: { src: "/images/team/trainer-01.jpg", focus: "50% 18%" },
  },
  {
    id: "trainer-02",
    ...trainerPlaceholders,
    tags: ["forza", "ipertrofia", "esperto"],
    portrait: { src: "/images/team/trainer-02.jpg", focus: "50% 18%" },
    actionPhoto: { src: "/images/coaching/coaching-03.jpg", focus: "40% 30%" },
  },
  {
    id: "trainer-03",
    ...trainerPlaceholders,
    tags: ["functional", "resistenza", "intermedio"],
    portrait: { src: "/images/team/trainer-03.jpg", focus: "50% 18%" },
    actionPhoto: { src: "/images/coaching/coaching-04.jpg", focus: "32% 40%" },
  },
  {
    id: "trainer-04",
    ...trainerPlaceholders,
    tags: ["ipertrofia", "principiante", "intermedio"],
    portrait: { src: "/images/team/trainer-04.jpg", focus: "50% 18%" },
    actionPhoto: { src: "/images/coaching/coaching-01.jpg", focus: "35% 35%" },
  },
  {
    id: "trainer-05",
    ...trainerPlaceholders,
    tags: ["functional", "dimagrimento", "benessere"],
    portrait: { src: "/images/team/trainer-05.jpg", focus: "50% 16%" },
  },
];

export function trainerWhatsappHref(trainer: Trainer) {
  return whatsappHref(`Ciao! Vorrei allenarmi con ${trainer.name} a IRONFIT.`);
}

// ---------------------------------------------------------------------------
// Quiz "Trova il tuo percorso"
// ---------------------------------------------------------------------------
export type QuizIcon =
  | "scale" | "dumbbell" | "muscle" | "heart"
  | "level1" | "level2" | "level3"
  | "solo" | "group" | "coach" | "breath";

export const quiz = {
  questions: [
    {
      id: "goal",
      title: "Qual è il tuo obiettivo?",
      options: [
        { value: "dimagrimento", label: "Perdere peso", icon: "scale" },
        { value: "forza", label: "Diventare più forte", icon: "dumbbell" },
        { value: "ipertrofia", label: "Aumentare la massa", icon: "muscle" },
        { value: "benessere", label: "Stare meglio, muovermi di più", icon: "heart" },
      ],
    },
    {
      id: "experience",
      title: "Che esperienza hai?",
      options: [
        { value: "principiante", label: "Mai allenato / ricomincio", icon: "level1" },
        { value: "intermedio", label: "Mi alleno da un po'", icon: "level2" },
        { value: "esperto", label: "Mi alleno seriamente", icon: "level3" },
      ],
    },
    {
      id: "preference",
      title: "Come ti piace allenarti?",
      options: [
        { value: "sala", label: "Da solo, con un programma", icon: "solo" },
        { value: "functional", label: "In gruppo, con energia", icon: "group" },
        { value: "personal", label: "Seguito uno a uno", icon: "coach" },
        { value: "yoga", label: "Con calma, mobilità e respiro", icon: "breath" },
      ],
    },
  ],
  /** preference -> service id (see `services`) */
  serviceFor: {
    sala: "sala-pesi",
    functional: "functional-training",
    personal: "personal-training",
    yoga: "yoga",
  } satisfies Record<QuizPreference, string>,
  /** short labels used in the explanation and the WhatsApp message */
  goalLabel: {
    dimagrimento: "perdere peso",
    forza: "diventare più forte",
    ipertrofia: "aumentare la massa",
    benessere: "stare meglio",
  } satisfies Record<QuizGoal, string>,
  experienceLabel: {
    principiante: "principiante",
    intermedio: "intermedio",
    esperto: "esperto",
  } satisfies Record<QuizExperience, string>,
  preferenceLabel: {
    sala: "da solo con un programma",
    functional: "in gruppo",
    personal: "uno a uno",
    yoga: "con calma",
  } satisfies Record<QuizPreference, string>,
  /** Explanation, line 1: by preference; {goal} = "per perdere peso" etc. */
  preferenceLine: {
    sala: "In sala pesi segui un programma su misura {goal}, ai tuoi orari e con i trainer sempre a portata di mano.",
    functional: "Le lezioni di functional sono il modo più coinvolgente {goal}: allenamenti di gruppo, intensi e mai uguali.",
    personal: "Con il personal training hai un trainer tutto per te {goal}, con un programma costruito sui tuoi tempi.",
    yoga: "Lo yoga lavora su mobilità, respiro ed equilibrio: la base giusta {goal}, al tuo ritmo.",
  } satisfies Record<QuizPreference, string>,
  goalPhrase: {
    dimagrimento: "per perdere peso",
    forza: "per diventare più forte",
    ipertrofia: "per aumentare la massa",
    benessere: "per stare meglio e muoverti di più",
  } satisfies Record<QuizGoal, string>,
  /** Explanation, line 2: by experience */
  experienceLine: {
    principiante: "Si parte dalle basi: tecnica, carichi giusti e nessuna fretta.",
    intermedio: "Hai già una base: ora servono struttura e una progressione chiara.",
    esperto: "Ti alleni sul serio: ti serve qualcuno che ti spinga oltre il plateau.",
  } satisfies Record<QuizExperience, string>,
};

// ---------------------------------------------------------------------------
// Class schedule (Orari). No timetable image was provided, so this is an
// EXAMPLE week: `isExample` shows "Orari indicativi · in aggiornamento".
// Replace with the real schedule and set isExample to false.
// Opening hours of the sala come from `gym.openingHours` (single source).
// ---------------------------------------------------------------------------
export type ClassLevel = "tutti" | "principiante" | "intermedio" | "avanzato";

export type ScheduleCategory = { id: string; label: string; color: string };

export type GymClass = {
  id: string;
  /** 1 = lunedì … 7 = domenica */
  day: number;
  start: string;
  end: string;
  name: string;
  category: string;
  /** trainer id from `team` (the name is shown only once it's real) */
  coach?: string;
  level?: ClassLevel;
  note?: string;
};

export const LEVEL_LABEL: Record<ClassLevel, string> = {
  tutti: "Tutti i livelli",
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzato: "Avanzato",
};

export const schedule: { isExample: boolean; categories: ScheduleCategory[]; classes: GymClass[] } = {
  isExample: true,
  categories: [
    { id: "functional", label: "Functional", color: "#F28C28" },
    // calm sage/teal: 8.3:1 on #141414
    { id: "yoga", label: "Yoga", color: "#5FBFA3" },
    { id: "corsi", label: "Corsi", color: "#D7192A" },
  ],
  classes: [
    { id: "lun-fx-am", day: 1, start: "07:00", end: "08:00", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },
    { id: "lun-fx-pm", day: 1, start: "18:30", end: "19:30", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },
    { id: "lun-yoga", day: 1, start: "20:00", end: "21:00", name: "Yoga", category: "yoga", coach: "trainer-05", level: "tutti" },

    { id: "mar-tb", day: 2, start: "09:30", end: "10:30", name: "Total Body", category: "corsi", coach: "trainer-01", level: "principiante" },
    { id: "mar-fx-noon", day: 2, start: "13:00", end: "14:00", name: "Functional", category: "functional", coach: "trainer-05", level: "intermedio" },
    { id: "mar-fx-pm", day: 2, start: "19:00", end: "20:00", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },

    { id: "mer-fx-am", day: 3, start: "07:00", end: "08:00", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },
    { id: "mer-yoga", day: 3, start: "18:00", end: "19:00", name: "Yoga", category: "yoga", coach: "trainer-05", level: "principiante" },
    { id: "mer-fx-pm", day: 3, start: "19:30", end: "20:30", name: "Functional", category: "functional", coach: "trainer-03", level: "avanzato" },

    { id: "gio-tb", day: 4, start: "09:30", end: "10:30", name: "Total Body", category: "corsi", coach: "trainer-01", level: "principiante" },
    { id: "gio-fx-noon", day: 4, start: "13:00", end: "14:00", name: "Functional", category: "functional", coach: "trainer-05", level: "intermedio" },
    { id: "gio-core", day: 4, start: "18:30", end: "19:15", name: "Core & Mobility", category: "corsi", coach: "trainer-04", level: "tutti" },
    { id: "gio-fx-pm", day: 4, start: "19:30", end: "20:30", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },

    { id: "ven-fx-am", day: 5, start: "07:00", end: "08:00", name: "Functional", category: "functional", coach: "trainer-03", level: "tutti" },
    { id: "ven-fx-pm", day: 5, start: "18:30", end: "19:30", name: "Functional", category: "functional", coach: "trainer-05", level: "tutti" },
    { id: "ven-yoga", day: 5, start: "20:00", end: "21:00", name: "Yoga", category: "yoga", coach: "trainer-05", level: "tutti" },

    { id: "sab-wod", day: 6, start: "10:00", end: "11:30", name: "Team WOD", category: "functional", coach: "trainer-03", level: "tutti", note: "WOD a coppie, il sabato si suda insieme." },
    { id: "sab-yoga", day: 6, start: "11:45", end: "12:45", name: "Yoga", category: "yoga", coach: "trainer-05", level: "tutti" },
  ],
};

// ---------------------------------------------------------------------------
// Galleria. Web copies made by scripts/prepare-gallery.mjs (shared grade).
// ---------------------------------------------------------------------------
export type GalleryZone = "sala" | "macchinari" | "functional" | "coaching";

export const GALLERY_ZONES: { id: GalleryZone; label: string }[] = [
  { id: "sala", label: "Sala pesi" },
  { id: "macchinari", label: "Macchinari" },
  { id: "functional", label: "Functional" },
  { id: "coaching", label: "Coaching" },
];

export type GalleryImage = { src: string; alt: string; zone: GalleryZone; width: number; height: number };

export const gallery: GalleryImage[] = [
  { src: "/images/gallery/sala-pesi-1.jpg", zone: "sala", width: 1800, height: 1350, alt: "Sala pesi IRONFIT a Ribera con rastrelliera di manubri, panca rossa e logo IRONFIT sulla parete" },
  { src: "/images/gallery/functional-1.jpg", zone: "functional", width: 1800, height: 1200, alt: "Area functional di IRONFIT con pavimento in gomma, rig e luce LED calda a soffitto" },
  { src: "/images/gallery/macchinari-1.jpg", zone: "macchinari", width: 1800, height: 1350, alt: "Macchinari Panatta con imbottiture rosse sotto le luci LED geometriche della sala" },
  { src: "/images/gallery/coaching-2.jpg", zone: "coaching", width: 1066, height: 1600, alt: "Personal trainer di IRONFIT assiste un atleta alla panca piana su macchina Panatta" },
  { src: "/images/gallery/sala-pesi-2.jpg", zone: "sala", width: 1800, height: 1350, alt: "Manubri, rack e panche regolabili nella sala pesi di IRONFIT Ribera" },
  { src: "/images/gallery/functional-3.jpg", zone: "functional", width: 640, height: 640, alt: "Il WOD del giorno scritto con il pennarello arancione sullo specchio della sala functional" },
  { src: "/images/gallery/functional-2.jpg", zone: "functional", width: 1800, height: 1200, alt: "Rig per trazioni e dischi colorati nell'area functional di IRONFIT" },
  { src: "/images/gallery/macchinari-2.jpg", zone: "macchinari", width: 1800, height: 1350, alt: "Stazione cavi e macchinari Panatta nella sala di IRONFIT a Ribera" },
  { src: "/images/gallery/coaching-1.jpg", zone: "coaching", width: 1600, height: 1066, alt: "Trainer di IRONFIT corregge la tecnica di un atleta su una macchina per la schiena" },
  { src: "/images/gallery/sala-pesi-3.jpg", zone: "sala", width: 1800, height: 1350, alt: "Vista della sala pesi di IRONFIT con pilastro bianco e luci LED a soffitto" },
  { src: "/images/gallery/functional-4.jpg", zone: "functional", width: 1800, height: 1200, alt: "Air bike e dischi Eleiko nell'area functional di IRONFIT a Ribera" },
  { src: "/images/gallery/macchinari-3.jpg", zone: "macchinari", width: 1800, height: 1350, alt: "Macchinari Panatta Evo e panca nella sala di IRONFIT" },
  { src: "/images/gallery/functional-5.jpg", zone: "functional", width: 1800, height: 1245, alt: "Parete per handstand push-up e anelli nella sala functional di IRONFIT" },
  { src: "/images/gallery/coaching-3.jpg", zone: "coaching", width: 1600, height: 1066, alt: "Trainer di IRONFIT segue un atleta durante le dip alla macchina" },
  { src: "/images/gallery/functional-6.jpg", zone: "functional", width: 1800, height: 1200, alt: "Vogatori Concept2, kettlebell e plyo box nell'area functional di IRONFIT" },
];

// ---------------------------------------------------------------------------
// FAQ. Answers tied to the gym's real policy end with "[DA CONFERMARE]": they
// are shown on the page but excluded from the FAQPage JSON-LD until confirmed.
// Links: [testo](#anchor) — rendered as real anchors.
// ---------------------------------------------------------------------------
const continuato = gym.openingHours.every((s) => s.opens <= "09:00" && s.closes >= "21:00");

export const faq: { q: string; a: string }[] = [
  {
    q: "Posso provare la palestra gratis?",
    a: "Sì. La prima prova è gratuita e senza impegno: ti mostriamo la sala, conosci i trainer e ti alleni con noi. Scrivici su WhatsApp per scegliere giorno e ora.",
  },
  {
    q: "Serve il certificato medico?",
    a: "Per iscriversi serve un certificato medico per attività sportiva non agonistica in corso di validità. Puoi portarlo al momento dell'iscrizione. [DA CONFERMARE]",
  },
  {
    q: "Non mi sono mai allenato: è un problema?",
    a: "Assolutamente no. I trainer ti seguono dal primo giorno: tecnica, carichi giusti e un programma adatto al tuo livello. Se non sai da dove partire, fai il [test di 30 secondi](#percorso).",
  },
  {
    q: "Che differenza c'è tra sala pesi e functional training?",
    a: "In sala pesi ti alleni con il tuo programma, ai tuoi orari, su macchinari Panatta, manubri e bilancieri. Il functional training è una lezione di gruppo guidata da un coach, con esercizi a corpo libero, bilancieri, kettlebell e vogatori: intensa e sempre diversa. Vedi [i corsi in calendario](#orari).",
  },
  {
    q: "Posso fare solo yoga o solo functional?",
    a: "Sì, puoi scegliere un abbonamento solo per i corsi che ti interessano, senza la sala pesi. [DA CONFERMARE]",
  },
  {
    q: "Avete il personal trainer?",
    a: "Sì. Puoi allenarti uno a uno con un trainer, con un programma costruito su di te e obiettivi misurabili. [Conosci il team](#team) e scegli con chi iniziare.",
  },
  {
    q: "Offrite consulenze di nutrizione?",
    a: "Sì, puoi prenotare una consulenza per un piano alimentare costruito sui tuoi obiettivi e sul tuo allenamento. Modalità e costi della consulenza: [DA CONFERMARE]",
  },
  {
    q: "Quali sono gli orari?",
    a: continuato
      ? "La sala è aperta con orario continuato. Trovi gli orari giorno per giorno e il calendario dei corsi nella sezione [Orari](#orari)."
      : "Trovi gli orari giorno per giorno e il calendario dei corsi nella sezione [Orari](#orari).",
  },
  {
    q: "C'è parcheggio?",
    a: "Sì, è possibile parcheggiare nelle vicinanze della palestra. [DA CONFERMARE]",
  },
  {
    q: "Come mi iscrivo?",
    a: "Passa in palestra negli orari di apertura oppure scrivici su WhatsApp: ti spieghiamo le formule disponibili e fissiamo la tua prova gratuita.",
  },
];

export const needsConfirmation = (text: string) => text.includes("[DA CONFERMARE]");
