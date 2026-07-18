/**
 * Demo-scale data generator — the Loan Officer Committee build.
 *
 * DEMONSTRATION DATA ONLY. Every person here is invented; the generator is
 * deterministic (fixed-seed RNG) so re-seeding produces the same busy branch
 * every time and screenshots stay reproducible.
 *
 * Shape targets (from Jeremy's demo directive):
 *   - 250+ contacts, 150+ with loan history, 75+ active opportunities
 *   - languages ≈ 70% English, 12% Spanish, 10% Vietnamese, 8% Russian —
 *     with correct diacritics and Cyrillic where the language calls for it
 *   - a team of 10 loan officers with genuinely different books: volume,
 *     responsiveness, overdue habits, languages, partner activity
 */
import type { Stage } from "@/lib/stages";
import { STAGES } from "@/lib/stages";

// ---------------------------------------------------------------------------
// Deterministic RNG — mulberry32. Same seed, same branch, every time.
// ---------------------------------------------------------------------------

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x10a0f4c7);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function between(min: number, max: number): number {
  return min + rand() * (max - min);
}
function int(min: number, max: number): number {
  return Math.floor(between(min, max + 1));
}
function chance(p: number): boolean {
  return rand() < p;
}

// ---------------------------------------------------------------------------
// Name pools per language — realistic, with correct orthography.
// ---------------------------------------------------------------------------

type Lang = "en" | "es" | "vi" | "ru";

const NAMES: Record<Lang, { first: string[]; last: string[] }> = {
  en: {
    first: [
      "James", "Sarah", "Michael", "Emily", "David", "Ashley", "Robert", "Jessica",
      "William", "Amanda", "Christopher", "Melissa", "Matthew", "Nicole", "Daniel",
      "Stephanie", "Andrew", "Rachel", "Ryan", "Lauren", "Tyler", "Megan", "Brandon",
      "Hannah", "Jacob", "Kayla", "Nathan", "Brittany", "Zachary", "Samantha",
      "Marcus", "Danielle", "Jordan", "Alexis", "Kevin", "Courtney", "Eric", "Erica",
    ],
    last: [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson",
      "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "White", "Harris", "Martin",
      "Thompson", "Robinson", "Clark", "Lewis", "Walker", "Hall", "Young", "King",
      "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Carter", "Mitchell",
      "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
    ],
  },
  es: {
    first: [
      "María", "José", "Carmen", "Luis", "Ana", "Carlos", "Rosa", "Miguel",
      "Guadalupe", "Jorge", "Verónica", "Francisco", "Alejandra", "Ricardo",
      "Patricia", "Fernando", "Gabriela", "Héctor", "Lucía", "Andrés",
    ],
    last: [
      "García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez",
      "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes",
      "Morales", "Ortiz", "Gutiérrez", "Chávez", "Ramos", "Vásquez", "Castillo",
    ],
  },
  vi: {
    first: [
      "Minh", "Lan", "Hùng", "Hương", "Tuấn", "Thảo", "Quang", "Ngọc", "Hải",
      "Linh", "Đức", "Mai", "Phong", "Trang", "Khoa", "Yến", "Bảo", "Chi", "Sơn", "Vy",
    ],
    last: [
      "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ",
      "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Trịnh",
    ],
  },
  ru: {
    // Latin-script names as they appear on US loan files; Cyrillic lives in
    // the message content where the conversation is actually in Russian.
    first: [
      "Dmitri", "Svetlana", "Sergei", "Natalia", "Andrei", "Olga", "Mikhail",
      "Elena", "Viktor", "Irina", "Alexei", "Tatiana", "Pavel", "Yulia", "Igor", "Anna",
    ],
    last: [
      "Volkov", "Ivanova", "Petrov", "Sokolova", "Kuznetsov", "Popova", "Morozov",
      "Fedorova", "Lebedev", "Kozlova", "Novikov", "Orlova", "Belov", "Antonova",
    ],
  },
};

/** ≈70/12/10/8 split, drawn deterministically. */
function drawLanguage(): Lang {
  const r = rand();
  if (r < 0.7) return "en";
  if (r < 0.82) return "es";
  if (r < 0.92) return "vi";
  return "ru";
}

const CITIES = [
  ["Bellevue", "WA"], ["Seattle", "WA"], ["Renton", "WA"], ["Kent", "WA"],
  ["Tacoma", "WA"], ["Everett", "WA"], ["Kirkland", "WA"], ["Redmond", "WA"],
  ["Federal Way", "WA"], ["Auburn", "WA"], ["Lynnwood", "WA"], ["Bothell", "WA"],
  ["Issaquah", "WA"], ["Sammamish", "WA"], ["Shoreline", "WA"], ["Burien", "WA"],
] as const;

const PROGRAMS = [
  "Conventional", "Conventional", "Conventional", "FHA", "FHA", "VA",
  "Jumbo", "Bank statement", "USDA", "ITIN", "DSCR",
] as const;

/**
 * Lead source, skewed on purpose so source-comparison insights have something
 * true to say: facebook_ads is high volume but closes at a lower rate, while
 * partner_referral is lower volume but overrepresented among funded files.
 */
function drawLeadChannel(outcome: "active" | "funded" | "lost"): string {
  const r = rand();
  if (outcome === "funded") {
    if (r < 0.42) return "partner_referral";
    if (r < 0.62) return "facebook_ads";
    if (r < 0.78) return "lf_website";
    if (r < 0.9) return "qm_pricer";
    return "manual";
  }
  // Active and lost files skew toward paid volume.
  if (r < 0.44) return "facebook_ads";
  if (r < 0.62) return "lf_website";
  if (r < 0.74) return "qm_pricer";
  if (r < 0.86) return "partner_referral";
  return "manual";
}

/**
 * Funded-date bands: several closings per LO in each leaderboard window
 * (<7d, 7-30d, 30-90d, 90d-this-year), plus a slice at ~11 and ~23 months so
 * closing anniversaries land inside the next 45 days.
 */
function drawFundedDaysAgo(): number {
  const r = rand();
  if (r < 0.14) return int(2, 6);
  if (r < 0.34) return int(8, 29);
  if (r < 0.58) return int(31, 88);
  if (r < 0.86) return int(95, 300);
  return chance(0.5) ? int(325, 360) : int(690, 720);
}

const COMM_PREFS = ["text first", "email first", "call first"] as const;

// ---------------------------------------------------------------------------
// The team — 10 loan officers with different books, plus support roles.
// Each profile drives the volume and habits the Team screen compares.
// ---------------------------------------------------------------------------

export type DemoLO = {
  key: string;
  fullName: string;
  email: string;
  nmlsId: string;
  language: "en" | "vi" | "es" | "ru";
  /** Languages they work in — drives which contacts route to them. */
  speaks: Lang[];
  /** How many people in their book (contacts of all kinds). */
  bookSize: number;
  /** Minutes they typically take to answer a new lead. */
  responseMinutes: number;
  /** Share of their open tasks that has slipped past due. */
  overdueRate: number;
  /** Share of their captured leads still waiting on a first touch. */
  untouchedLeadRate: number;
};

export const DEMO_LOS: DemoLO[] = [
  { key: "minh",    fullName: "Minh Nguyen",      email: "minh@loanfactory.com",    nmlsId: "1856432", language: "en", speaks: ["en", "vi"], bookSize: 34, responseMinutes: 22,  overdueRate: 0.25, untouchedLeadRate: 0.3 },
  { key: "carlos",  fullName: "Carlos Mendoza",   email: "carlos@loanfactory.com",  nmlsId: "1764201", language: "es", speaks: ["en", "es"], bookSize: 32, responseMinutes: 9,   overdueRate: 0.08, untouchedLeadRate: 0.1 },
  { key: "priya",   fullName: "Priya Sharma",     email: "priya@loanfactory.com",   nmlsId: "1899310", language: "en", speaks: ["en"],       bookSize: 30, responseMinutes: 14,  overdueRate: 0.12, untouchedLeadRate: 0.15 },
  { key: "tom",     fullName: "Tom Ericsson",     email: "tom@loanfactory.com",     nmlsId: "1655002", language: "en", speaks: ["en"],       bookSize: 30, responseMinutes: 95,  overdueRate: 0.45, untouchedLeadRate: 0.5 },
  { key: "elena",   fullName: "Elena Petrova",    email: "elena@loanfactory.com",   nmlsId: "1922845", language: "ru", speaks: ["en", "ru"], bookSize: 24, responseMinutes: 18,  overdueRate: 0.15, untouchedLeadRate: 0.2 },
  { key: "marcus",  fullName: "Marcus Boyd",      email: "marcus@loanfactory.com",  nmlsId: "1877453", language: "en", speaks: ["en"],       bookSize: 23, responseMinutes: 31,  overdueRate: 0.2,  untouchedLeadRate: 0.25 },
  { key: "thuy",    fullName: "Thúy Phạm",        email: "thuy@loanfactory.com",    nmlsId: "1901288", language: "vi", speaks: ["en", "vi"], bookSize: 22, responseMinutes: 12,  overdueRate: 0.1,  untouchedLeadRate: 0.12 },
  { key: "rebecca", fullName: "Rebecca Stone",    email: "rebecca@loanfactory.com", nmlsId: "1833947", language: "en", speaks: ["en"],       bookSize: 23, responseMinutes: 26,  overdueRate: 0.18, untouchedLeadRate: 0.2 },
  { key: "diego",   fullName: "Diego Fuentes",    email: "diego@loanfactory.com",   nmlsId: "1948112", language: "es", speaks: ["en", "es"], bookSize: 17, responseMinutes: 45,  overdueRate: 0.3,  untouchedLeadRate: 0.35 },
  { key: "grace",   fullName: "Grace Kimball",    email: "grace.k@loanfactory.com", nmlsId: "1958770", language: "en", speaks: ["en"],       bookSize: 14, responseMinutes: 8,   overdueRate: 0.05, untouchedLeadRate: 0.08 },
];

// ---------------------------------------------------------------------------
// Generated record shapes (the seed maps these to inserts)
// ---------------------------------------------------------------------------

export type GenPerson = {
  loKey: string;
  firstName: string;
  lastName: string;
  language: Lang;
  email: string;
  phone: string;
  city: string;
  state: string;
  commPref: (typeof COMM_PREFS)[number];
  tags: string[];
  /** null = plain contact (sphere), else an opportunity. */
  loan: GenLoan | null;
  notes: string[];
};

export type GenLoan = {
  stage: Stage;
  status: "active" | "funded" | "lost";
  purpose: "purchase" | "refinance" | "cash_out_refi" | "heloc";
  program: string;
  amount: number | null;
  daysSinceActivity: number;
  fundedDaysAgo?: number;
  lockExpiresInDays?: number;
  closingInDays?: number;
  docsNeeded?: string;
  lead?: {
    channel: string;
    capturedHoursAgo: number;
    /** null = never contacted. */
    firstResponseMinutes: number | null;
  };
};

const ACTIVE_STAGE_WEIGHTS: [Stage, number][] = [
  ["new_lead", 10], ["contact_attempt", 8], ["consultation_scheduled", 6],
  ["consultation_completed", 5], ["prequalification", 7], ["preapproval", 9],
  ["searching_for_home", 8], ["under_contract", 6], ["application", 6],
  ["disclosures", 5], ["processing", 8], ["submitted_to_underwriting", 5],
  ["conditional_approval", 4], ["clear_to_close", 3], ["closing_scheduled", 3],
];

function drawActiveStage(): Stage {
  const total = ACTIVE_STAGE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [stage, w] of ACTIVE_STAGE_WEIGHTS) {
    r -= w;
    if (r <= 0) return stage;
  }
  return "prequalification";
}

const GREETING_NOTES: Record<Lang, string[]> = {
  en: [],
  es: [
    "Prefers Spanish for anything written; spoken English is fine for quick calls. Greet as 'Señora' until invited otherwise.",
    "All documents explained in Spanish — adult son sometimes helps translate, but don't rely on it.",
  ],
  vi: [
    "Prefers Vietnamese in writing. Greet as 'Anh' / 'Chị' with the given name — never the family name alone.",
    "Vietnamese for anything important; texts in English are okay for scheduling.",
  ],
  ru: [
    "Prefers Russian for detailed discussion; reads English fine but appreciates a Russian summary of anything complex.",
    "Speak slowly in English or switch to Russian — daughter Yulia can join calls if needed.",
  ],
};

const NOTE_SNIPPETS = [
  "First-time buyer, nervous about the process — walk everything through twice.",
  "Self-employed; bank-statement program is the likely fit.",
  "Relocating for work; timeline is tied to a job start date.",
  "Rate-sensitive — shopped two other lenders last time.",
  "Referred by a past client; strong trust from day one.",
  "Wants to keep payment under control; discussed buydown options.",
  "Owns a rental; may want a DSCR loan for the next one.",
  "Waiting on a lease to end before house-hunting seriously.",
  "VA-eligible; needs the COE pulled.",
  "Credit rebuilding after a medical event — check back next quarter.",
];

let emailSeq = 100;

function makeEmail(first: string, last: string): string {
  emailSeq += 1;
  const f = first
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯđ]/g, (c) => (c === "đ" ? "d" : ""));
  const l = last
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯđ]/g, (c) => (c === "đ" ? "d" : ""));
  return `${f}.${l}${emailSeq}@example.com`;
}

function makePhone(): string {
  return `(${pick(["206", "425", "253", "360"])}) 555-${String(int(100, 999)).padStart(3, "0")}${int(0, 9)}`;
}

/** Generate one LO's book of business according to their profile. */
function generateBook(lo: DemoLO): GenPerson[] {
  const people: GenPerson[] = [];

  for (let i = 0; i < lo.bookSize; i++) {
    // Branch-wide mix ≈ 70/12/10/8. A bilingual LO's book concentrates their
    // second language (word-of-mouth communities work that way), but a drawn
    // language is never converted back to English — that's what was flattening
    // the Spanish and Russian share.
    let language = drawLanguage();
    if (lo.speaks.length > 1 && language === "en") {
      // Smaller boost for Vietnamese: Minh's curated book is already VI-heavy,
      // so a big boost would push VI past its ~10% share.
      const boost = lo.speaks[1] === "vi" ? 0.05 : 0.18;
      if (chance(boost)) language = lo.speaks[1];
    }

    const pool = NAMES[language];
    const firstName = pick(pool.first);
    const lastName = pick(pool.last);
    const [city, state] = pick(CITIES);

    // Book composition: ~12% plain contacts, ~30% past clients (funded),
    // ~6% lost, the rest active opportunities.
    const roll = rand();
    let loan: GenLoan | null = null;
    const notes: string[] = [];

    if (roll < 0.12) {
      loan = null;
    } else if (roll < 0.42) {
      const fundedDaysAgo = drawFundedDaysAgo();
      loan = {
        stage: fundedDaysAgo > 360 ? "annual_review" : fundedDaysAgo > 60 ? "post_close" : "funded",
        status: "funded",
        purpose: chance(0.75) ? "purchase" : "refinance",
        program: pick(PROGRAMS),
        amount: Math.round(between(280, 950)) * 1000,
        daysSinceActivity: int(5, 120),
        fundedDaysAgo,
        // Every opportunity began as a captured lead. capturedHoursAgo 0 is a
        // placeholder — the seeder anchors capture to the file's stage trail.
        lead: {
          channel: drawLeadChannel("funded"),
          capturedHoursAgo: 0,
          firstResponseMinutes: Math.max(2, Math.round(lo.responseMinutes * between(0.5, 1.8))),
        },
      };
    } else if (roll < 0.48) {
      loan = {
        stage: pick(["consultation_completed", "prequalification", "contact_attempt"] as Stage[]),
        status: "lost",
        purpose: "purchase",
        program: pick(PROGRAMS),
        amount: null,
        daysSinceActivity: int(20, 90),
        lead: {
          channel: drawLeadChannel("lost"),
          capturedHoursAgo: 0,
          firstResponseMinutes: Math.max(2, Math.round(lo.responseMinutes * between(0.5, 1.8))),
        },
      };
    } else {
      const stage = drawActiveStage();
      const idx = STAGES.indexOf(stage);
      const isLead = idx <= 1;
      const inTransact = idx >= 7 && idx <= 14;

      loan = {
        stage,
        status: "active",
        purpose: chance(0.7) ? "purchase" : chance(0.5) ? "refinance" : "cash_out_refi",
        program: pick(PROGRAMS),
        amount: inTransact || chance(0.4) ? Math.round(between(280, 980)) * 1000 : null,
        daysSinceActivity: chance(lo.overdueRate) ? int(4, 12) : int(0, 3),
      };

      if (isLead) {
        // True speed-to-lead queue: recent captures, some still untouched.
        const untouched = chance(lo.untouchedLeadRate);
        loan.lead = {
          channel: drawLeadChannel("active"),
          capturedHoursAgo: untouched ? int(1, 70) : int(6, 200),
          firstResponseMinutes: untouched
            ? null
            : Math.max(2, Math.round(lo.responseMinutes * between(0.5, 1.8))),
        };
      } else {
        // Deeper-stage files were captured further back; the seeder anchors
        // capture to the stage trail. Always answered — the Today screen's
        // "waiting on first reply" count belongs to genuinely new leads only.
        loan.lead = {
          channel: drawLeadChannel("active"),
          capturedHoursAgo: 0,
          firstResponseMinutes: Math.max(2, Math.round(lo.responseMinutes * between(0.5, 1.8))),
        };
      }
      if (inTransact) {
        if (chance(0.28)) loan.lockExpiresInDays = int(2, 18);
        if (chance(0.35)) loan.closingInDays = int(3, 30);
        if (chance(0.25))
          loan.docsNeeded = pick([
            "last 2 pay stubs",
            "updated bank statement",
            "homeowners insurance binder",
            "letter of explanation — deposit",
            "2024 W-2",
          ]);
      }
    }

    if (chance(0.5)) notes.push(pick(NOTE_SNIPPETS));
    if (language !== "en" && GREETING_NOTES[language].length && chance(0.8)) {
      notes.push(pick(GREETING_NOTES[language]));
    }

    const commPref = pick(COMM_PREFS);
    const tags: string[] = [`prefers: ${commPref.split(" ")[0]}`];
    if (loan === null) tags.push("sphere");

    people.push({
      loKey: lo.key,
      firstName,
      lastName,
      language,
      email: makeEmail(firstName, lastName),
      phone: makePhone(),
      city,
      state,
      commPref,
      tags,
      loan,
      notes,
    });
  }

  return people;
}

export function generateDemoBooks(): GenPerson[] {
  // Minh's curated book already exists in seed-data.ts; generate the other
  // nine LOs' books in full, plus a smaller generated remainder for Minh so
  // the totals land where the directive asks.
  const out: GenPerson[] = [];
  for (const lo of DEMO_LOS) {
    const size = lo.key === "minh" ? 12 : lo.bookSize; // Minh: curated 24 + 12
    out.push(...generateBook({ ...lo, bookSize: size }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Partners — realtors, builders, financial planners, attorneys, CPAs.
// ---------------------------------------------------------------------------

export type GenPartner = {
  loKey: string;
  firstName: string;
  lastName: string;
  company: string;
  kind: "real_estate_agent" | "builder" | "financial_advisor" | "attorney" | "other";
  tier: "core" | "growing" | "quiet" | "new";
  language: Lang;
  lastTouchDaysAgo: number;
  notesSummary: string;
};

const PARTNER_COMPANIES: Record<GenPartner["kind"], string[]> = {
  real_estate_agent: [
    "Windermere", "John L. Scott", "Redfin", "Keller Williams", "RE/MAX",
    "Compass", "Coldwell Banker", "Skyline Properties", "Berkshire Hathaway",
  ],
  builder: ["Cascade Custom Homes", "Pacific Crest Builders", "Evergreen Homes NW", "Sound Built Homes"],
  financial_advisor: ["Edward Jones", "Sandoval CPA Group", "Rainier Wealth", "Puget Financial Planning"],
  attorney: ["Nguyen & Associates", "Baker Estate Law", "Cascade Legal Group"],
  other: ["Umpqua Bank branch", "State Farm — Bellevue", "HomeSmart Insurance"],
};

export function generateDemoPartners(): GenPartner[] {
  const partners: GenPartner[] = [];
  const kinds: GenPartner["kind"][] = [
    "real_estate_agent", "real_estate_agent", "real_estate_agent", "real_estate_agent",
    "real_estate_agent", "real_estate_agent", "real_estate_agent", "real_estate_agent",
    "builder", "builder", "financial_advisor", "financial_advisor",
    "attorney", "other",
  ];

  for (const lo of DEMO_LOS) {
    const count = lo.key === "minh" ? 2 : int(1, 3); // Minh: 6 curated + 2
    for (let i = 0; i < count && partners.length < 26; i++) {
      const kind = pick(kinds);
      const language = lo.speaks.length > 1 && chance(0.4) ? lo.speaks[1] : "en";
      const pool = NAMES[language];
      const firstName = pick(pool.first);
      const lastName = pick(pool.last);
      const tier = pick(["core", "growing", "growing", "quiet", "new"] as const);

      partners.push({
        loKey: lo.key,
        firstName,
        lastName,
        company: pick(PARTNER_COMPANIES[kind]),
        kind,
        tier,
        language,
        lastTouchDaysAgo:
          tier === "quiet" ? int(60, 130) : tier === "core" ? int(1, 14) : int(5, 45),
        notesSummary: pick([
          "Sends steady referral volume when kept warm — monthly check-ins matter.",
          "Met at a broker open; watching how we handle the first shared client.",
          "Prefers co-branded material and fast preapproval turnarounds.",
          "High standards on communication — always confirm timelines in writing.",
          "Building a spec home pipeline; wants a lender for buyer handoffs.",
        ]),
      });
    }
  }
  return partners;
}

// ---------------------------------------------------------------------------
// Multilingual conversation samples — real language, with English translations
// carried alongside for the loan officer. Translations are generated demo
// content and are never claimed to be legally reviewed.
// ---------------------------------------------------------------------------

export type GenThread = {
  loKey: string;
  personLanguage: Lang;
  subject: string;
  channel: "email" | "sms";
  messages: {
    direction: "inbound" | "outbound";
    body: string;
    translationEn?: string;
    hoursAgo: number;
    preparedByAi?: boolean;
  }[];
};

export const MULTILINGUAL_THREADS: GenThread[] = [
  {
    loKey: "carlos",
    personLanguage: "es",
    subject: "Documentos para su preaprobación",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Hola,\n\nGracias por su tiempo hoy. Para avanzar con la preaprobación necesito:\n\n• Talones de pago de las últimas 2 quincenas\n• W-2 de 2024\n• Estados de cuenta bancarios de 2 meses\n\nPuede enviarlos por foto desde su teléfono si es más fácil.\n\nCarlos Mendoza\nNMLS 1764201\nCompany NMLS 320841\n\nIgualdad de Oportunidades en la Vivienda.",
        translationEn:
          "Hello — thank you for your time today. To move forward with the preapproval I need: pay stubs for the last two pay periods, your 2024 W-2, and two months of bank statements. Photos from your phone are fine.",
        hoursAgo: 30,
      },
      {
        direction: "inbound",
        body: "Gracias Carlos. Mando todo el viernes cuando me paguen. ¿El W-2 lo puede sacar mi esposa de su portal del trabajo?",
        translationEn:
          "Thank you Carlos. I'll send everything Friday when I get paid. Can my wife pull the W-2 from her work portal?",
        hoursAgo: 6,
      },
    ],
  },
  {
    loKey: "thuy",
    personLanguage: "vi",
    subject: "Hồ sơ của anh chị đã được duyệt có điều kiện",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Chào anh chị,\n\nTin vui — hồ sơ vay đã được duyệt có điều kiện. Ngân hàng chỉ cần thêm:\n\n• Giấy xác nhận việc làm mới nhất\n• Sao kê tài khoản tháng 6\n\nEm sẽ gọi chiều nay để giải thích rõ hơn.\n\nThúy Phạm\nNMLS 1901288\nCompany NMLS 320841\n\nCơ hội Nhà ở Bình đẳng.",
        translationEn:
          "Good news — your loan file has been conditionally approved. The lender only needs a current employment verification and your June bank statement. I'll call this afternoon to explain.",
        hoursAgo: 26,
      },
      {
        direction: "inbound",
        body: "Cảm ơn em Thúy nhiều lắm! Anh sẽ xin giấy xác nhận ngày mai. Gọi sau 5 giờ nhé, giờ đó anh mới xong việc.",
        translationEn:
          "Thank you so much, Thúy! I'll request the verification letter tomorrow. Please call after 5 — I finish work then.",
        hoursAgo: 4,
      },
    ],
  },
  {
    loKey: "elena",
    personLanguage: "ru",
    subject: "Ваша заявка — следующие шаги",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Здравствуйте!\n\nСпасибо за разговор сегодня. Чтобы двигаться дальше, мне нужны:\n\n• Справки о зарплате за последние два месяца\n• Выписки с банковского счёта за 60 дней\n\nЕсли удобнее, можно прислать фотографии документов.\n\nElena Petrova\nNMLS 1922845\nCompany NMLS 320841\n\nРавные жилищные возможности.",
        translationEn:
          "Hello! Thank you for the conversation today. To move forward I need pay statements for the last two months and 60 days of bank statements. Photos of the documents are fine.",
        hoursAgo: 50,
      },
      {
        direction: "inbound",
        body: "Елена, добрый день! Документы соберу к понедельнику. Один вопрос — если жена не работает, это повлияет на одобрение?",
        translationEn:
          "Elena, good afternoon! I'll gather the documents by Monday. One question — if my wife doesn't work, will that affect the approval?",
        hoursAgo: 8,
      },
    ],
  },
];

/** Pending AI drafts in each language, queued for human approval. */
export type GenInsight = {
  loKey: string;
  language: Lang;
  title: string;
  body: string;
  rationale: string;
  factors: string[];
};

export const MULTILINGUAL_INSIGHTS: GenInsight[] = [
  {
    loKey: "carlos",
    language: "es",
    title: "Seguimiento a María García — documentos pendientes",
    body: "Hola María,\n\nSolo un recordatorio amable: todavía esperamos sus talones de pago y los estados de cuenta para completar la preaprobación.\n\nCuando los tenga, respóndame a este correo y yo me encargo del resto.\n\nCarlos Mendoza\nNMLS 1764201\nCompany NMLS 320841\n\nIgualdad de Oportunidades en la Vivienda.",
    rationale:
      "Documents were requested 5 days ago with no reply. Her preferred language is Spanish. English translation shown to you; the Spanish text is what would send.",
    factors: ["Docs requested 5 days ago", "No reply since", "Preferred language: Spanish"],
  },
  {
    loKey: "thuy",
    language: "vi",
    title: "Nhắc anh Hùng Trần — giấy tờ còn thiếu",
    body: "Chào anh Hùng,\n\nEm nhắc nhẹ: hồ sơ còn thiếu sao kê ngân hàng tháng vừa rồi và giấy xác nhận việc làm.\n\nKhi nào anh gửi được, em xem ngay và báo bước tiếp theo.\n\nThúy Phạm\nNMLS 1901288\nCompany NMLS 320841\n\nCơ hội Nhà ở Bình đẳng.",
    rationale:
      "File has waited on borrower items for 4 days. His preferred language is Vietnamese; a human translation review is required before sending.",
    factors: ["Docs-needed flag open 4 days", "Preferred language: Vietnamese", "No reminder sent yet"],
  },
  {
    loKey: "elena",
    language: "ru",
    title: "Реактивация: Виктор Лебедев — год после закрытия",
    body: "Здравствуйте, Виктор!\n\nПрошёл год с покупки вашего дома — поздравляю с годовщиной!\n\nРаз в год я предлагаю клиентам короткий разговор: посмотреть, изменилось ли что-то, и стоит ли что-то предпринять. Без обязательств. Удобно ли на следующей неделе?\n\nElena Petrova\nNMLS 1922845\nCompany NMLS 320841\n\nРавные жилищные возможности.",
    rationale:
      "His loan funded 12 months ago and the annual-review date arrived. Preferred language is Russian; a human translation review is required before sending.",
    factors: ["Annual review date reached", "Funded 12 months ago", "Preferred language: Russian"],
  },
];
