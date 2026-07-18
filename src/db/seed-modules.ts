/**
 * Seed data for Partners, Conversations, Marketing, and Automations.
 * Fake but mortgage-real. Fixtures only — never real people.
 */

export type SeedPartner = {
  key: string;
  firstName: string;
  lastName: string;
  company: string;
  kind: "real_estate_agent" | "builder" | "financial_advisor" | "attorney" | "other";
  tier: "target" | "core" | "growing" | "quiet" | "new";
  email: string;
  phone: string;
  /** null = never touched (a hot-list target we haven't reached out to yet). */
  lastTouchDaysAgo: number | null;
  notesSummary: string;
  /** Person keys from seed-data.ts this partner referred, with referral age. */
  referred: { personKey: string; daysAgo: number }[];
};

export const PARTNERS: SeedPartner[] = [
  {
    key: "alvarez_agent",
    firstName: "Jenna",
    lastName: "Alvarez",
    company: "Windermere Bellevue",
    kind: "real_estate_agent",
    tier: "core",
    email: "jenna.alvarez@example.com",
    phone: "(425) 555-0201",
    lastTouchDaysAgo: 3,
    notesSummary:
      "Sends 2-3 buyers a quarter. Prefers a text before a call. Runs a Saturday open house most weeks.",
    referred: [
      { personKey: "kim", daysAgo: 2 },
      { personKey: "santos", daysAgo: 38 },
      { personKey: "mclean", daysAgo: 60 },
      { personKey: "duong", daysAgo: 70 },
      { personKey: "vela", daysAgo: 120 },
      { personKey: "sokolov", daysAgo: 210 },
    ],
  },
  {
    key: "castellanos",
    firstName: "Rosa",
    lastName: "Castellanos",
    company: "John L. Scott Kent",
    kind: "real_estate_agent",
    tier: "core",
    email: "rosa.castellanos@example.com",
    phone: "(253) 555-0212",
    lastTouchDaysAgo: 9,
    notesSummary:
      "Spanish-speaking buyers, mostly first-time. Wants co-branded preapproval letters.",
    referred: [
      { personKey: "rodriguez", daysAgo: 30 },
      { personKey: "alvarez", daysAgo: 52 },
      { personKey: "ferris", daysAgo: 55 },
      { personKey: "lam", daysAgo: 95 },
      { personKey: "orozco", daysAgo: 160 },
      { personKey: "hutchins", daysAgo: 380 },
    ],
  },
  {
    key: "pham_agent",
    firstName: "Danny",
    lastName: "Phạm",
    company: "Skyline Properties",
    kind: "real_estate_agent",
    tier: "growing",
    email: "danny.pham@example.com",
    phone: "(425) 555-0223",
    lastTouchDaysAgo: 21,
    notesSummary:
      "Vietnamese-speaking clientele in Renton and Kent. Two deals last year, both smooth.",
    referred: [{ personKey: "nguyen", daysAgo: 88 }],
  },
  {
    key: "okafor_agent",
    firstName: "Ada",
    lastName: "Okafor",
    company: "Redfin",
    kind: "real_estate_agent",
    tier: "quiet",
    email: "ada.okafor@example.com",
    phone: "(206) 555-0234",
    lastTouchDaysAgo: 74,
    notesSummary: "Closed one file in 2025. Went quiet after that — worth a check-in.",
    referred: [{ personKey: "adeyemi", daysAgo: 250 }],
  },
  {
    key: "reeves_builder",
    firstName: "Tom",
    lastName: "Reeves",
    company: "Cascade Custom Homes",
    kind: "builder",
    tier: "growing",
    email: "tom.reeves@example.com",
    phone: "(425) 555-0245",
    lastTouchDaysAgo: 12,
    notesSummary: "Builds 8-10 homes a year in Snohomish. Wants a lender for his buyers.",
    referred: [{ personKey: "calloway", daysAgo: 750 }],
  },
  {
    key: "sandoval_cpa",
    firstName: "Marisol",
    lastName: "Sandoval",
    company: "Sandoval CPA Group",
    kind: "financial_advisor",
    tier: "new",
    email: "marisol.sandoval@example.com",
    phone: "(206) 555-0256",
    lastTouchDaysAgo: 5,
    notesSummary:
      "Met at the Chamber breakfast. Self-employed clients who struggle to document income.",
    referred: [],
  },
  // --- Hot-list targets: identified, not yet touched -----------------------
  {
    key: "vance_target",
    firstName: "Melissa",
    lastName: "Vance",
    company: "Compass Bellevue",
    kind: "real_estate_agent",
    tier: "target",
    email: "melissa.vance@example.com",
    phone: "(425) 555-0267",
    lastTouchDaysAgo: null,
    notesSummary:
      "Top-3 producer on the Eastside last year. On the hot list — no outreach yet. Warm intro possible through Jenna Alvarez.",
    referred: [],
  },
  {
    key: "harmon_target",
    firstName: "Derek",
    lastName: "Harmon",
    company: "eXp Realty",
    kind: "real_estate_agent",
    tier: "target",
    email: "derek.harmon@example.com",
    phone: "(253) 555-0278",
    lastTouchDaysAgo: null,
    notesSummary:
      "Runs a large first-time-buyer team in Pierce County. On the hot list — no outreach yet.",
    referred: [],
  },
];

export type SeedThread = {
  personKey?: string;
  partnerKey?: string;
  subject: string;
  channel: "email" | "sms" | "call" | "video" | "app" | "note";
  messages: {
    direction: "inbound" | "outbound";
    body: string;
    hoursAgo: number;
    status?: "received" | "sent" | "awaiting_approval" | "approved" | "draft";
    preparedByAi?: boolean;
    templateRef?: string;
    meta?: Record<string, unknown>;
  }[];
};

export const THREADS: SeedThread[] = [
  {
    personKey: "nguyen",
    subject: "Your closing is Thursday",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Hi Thanh,\n\nYou're clear to close. The signing is set for Thursday at 8:00 AM at Chicago Title in Renton.\n\nBring a government photo ID. There's nothing else you need to do before then.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
        hoursAgo: 26,
        status: "sent",
      },
      {
        direction: "inbound",
        body: "Cảm ơn anh Minh. Tôi sẽ đến lúc 8 giờ.\n\nOne question — my rate lock expires Friday. Is that a problem if we sign Thursday?",
        hoursAgo: 3,
        status: "received",
      },
    ],
  },
  {
    personKey: "tran",
    subject: "The last two bank statements",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Chào chị Bích,\n\nWe're close. To finish the review I still need:\n\n- Your last 2 business bank statements\n- The 2025 profit and loss statement\n\nYou can send them however is easiest.\n\nMinh Nguyen\nNMLS 1856432",
        hoursAgo: 96,
        status: "sent",
        templateRef: "EMT-010",
      },
      {
        direction: "inbound",
        body: "Anh Minh, tôi sẽ gửi tuần này. Tiệm đang bận quá.",
        hoursAgo: 70,
        status: "received",
      },
    ],
  },
  {
    personKey: "le",
    subject: "Quick question about the appraisal",
    channel: "email",
    messages: [
      {
        direction: "inbound",
        body: "Minh — my wife asked whether the appraisal has come back yet. Also, do we need to do anything about the VOE you mentioned?",
        hoursAgo: 5,
        status: "received",
      },
    ],
  },
  {
    personKey: "brooks",
    subject: "Letter of explanation",
    channel: "sms",
    messages: [
      {
        direction: "outbound",
        body: "Hi Denise — underwriting asked for a short note explaining the $8,400 deposit on 6/28. A sentence or two is enough. — Minh, Loan Factory",
        hoursAgo: 48,
        status: "sent",
      },
      {
        direction: "inbound",
        body: "That was the sale of my old car. I'll write it up tonight.",
        hoursAgo: 46,
        status: "received",
      },
    ],
  },
  {
    personKey: "alvarez",
    subject: "Still looking?",
    channel: "call",
    messages: [
      {
        direction: "outbound",
        body: "Called to check on the house search. No answer — left a voicemail.",
        hoursAgo: 216,
        status: "sent",
        meta: { outcome: "voicemail", durationSeconds: 42 },
      },
    ],
  },
  {
    partnerKey: "alvarez_agent",
    subject: "Grace Kim — preapproval",
    channel: "email",
    messages: [
      {
        direction: "inbound",
        body: "Hi Minh — sending you Grace Kim. She's pre-shopping, wants to know her number before we tour. Be gentle, she's nervous about the whole thing.",
        hoursAgo: 52,
        status: "received",
      },
      {
        direction: "outbound",
        body: "Got her, thanks Jenna. I'll call today and keep it low-pressure.\n\nMinh",
        hoursAgo: 50,
        status: "sent",
      },
    ],
  },
  {
    personKey: "gallagher",
    subject: "Congratulations on your new home",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        body: "Erin — congratulations. Your loan funded and the home is officially yours.\n\nIt was a pleasure working with you and Dan. If anything comes up, you know where to find me.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
        hoursAgo: 90,
        status: "sent",
        templateRef: "EMT-101",
      },
    ],
  },
  // --- A video message drafted for a borrower --------------------------------
  {
    personKey: "santos",
    subject: "A quick video walkthrough of your closing costs",
    channel: "video",
    messages: [
      {
        direction: "outbound",
        status: "draft",
        hoursAgo: 4,
        body: "[Video: Your closing costs, explained]\n\nIf the video doesn't load, use this link instead.",
        meta: {
          video: {
            title: "Your closing costs, explained",
            caption: "3 numbers that matter on page 2",
            durationSeconds: 84,
            demo: true,
          },
        },
      },
    ],
  },
  // --- An in-app conversation -------------------------------------------------
  {
    personKey: "murphy",
    subject: "Is the appraisal back yet?",
    channel: "app",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 6,
        body: "Is the appraisal back yet?",
      },
      {
        direction: "outbound",
        status: "awaiting_approval",
        preparedByAi: true,
        hoursAgo: 5,
        body: "Hi Sean — not yet. The appraiser visited Tuesday and the report usually lands within 3-5 business days. I'll message you the moment it arrives.\n\nMinh Nguyen\nNMLS 1856432",
      },
    ],
  },
  // --- An internal note on the file -------------------------------------------
  {
    personKey: "santos",
    subject: "Listing agent call",
    channel: "note",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 20,
        body: "Spoke with the listing agent — seller flexible on closing date.",
      },
    ],
  },
  // --- A partner conversation with a draft reply -------------------------------
  {
    partnerKey: "reeves_builder",
    subject: "Financing one-pager for your Maple Ridge buyers",
    channel: "email",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 22,
        body: "Minh — three of my Maple Ridge buyers asked about financing this week. Do you have a one-pager I can hand out at the model home?",
      },
      {
        direction: "outbound",
        status: "draft",
        hoursAgo: 2,
        body: "Hi Tom,\n\nAbsolutely — I'm putting together a co-branded financing one-pager for the Maple Ridge floor plans: sample payment ranges, what buyers need for preapproval, and my direct line.\n\nI'll have a proof to you tomorrow. Anything specific you want on it?\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
      },
    ],
  },
];

/**
 * AI's pending drafts. Every one is a proposal awaiting a human — nothing
 * here has been or will be sent without an explicit approval.
 */
export type SeedInsight = {
  personKey: string;
  kind: "draft_email" | "next_best_action" | "draft_sms";
  title: string;
  body: string | null;
  rationale: string;
  factors: string[];
  templateRef?: string;
  language?: "en" | "vi" | "es";
};

export const INSIGHTS: SeedInsight[] = [
  {
    personKey: "tran",
    kind: "draft_email",
    title: "Reminder to Bích Trần — bank statements still outstanding",
    templateRef: "EMT-012",
    language: "vi",
    body: "Chào chị Bích,\n\nEm viết thư này để nhắc chị về hai bảng sao kê ngân hàng và báo cáo lãi lỗ năm 2025.\n\nKhi nào chị gửi được, em sẽ xem lại ngay và cho chị biết bước tiếp theo.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
    rationale:
      "Documents were flagged 4 days ago and she replied that the salon is busy. No reminder has gone out since. Her preferred language is Vietnamese.",
    factors: [
      "Docs-needed flag open 4 days",
      "Last reply 3 days ago",
      "No reminder sent since the flag was raised",
      "Preferred language: Vietnamese",
    ],
  },
  {
    personKey: "le",
    kind: "draft_email",
    title: "Reply to Quang Lê — he asked about the appraisal",
    templateRef: "EMT-066",
    body: "Hi Quang,\n\nThe appraisal is ordered and we're waiting on the report — I'll call you the moment it lands.\n\nOn the VOE: your employer switched payroll providers, so the first request bounced. I've sent a new one. Nothing needed from you.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
    rationale:
      "He asked two direct questions 5 hours ago and hasn't had a reply. The file also has an open VOE task that's 2 days overdue.",
    factors: [
      "Inbound question unanswered 5 hours",
      "Open task overdue 2 days on the same file",
      "File in Processing, no movement 6 days",
    ],
  },
  {
    personKey: "okonkwo",
    kind: "next_best_action",
    title: "Call Chidi Okonkwo — rate alert lead, no contact for 26 hours",
    body: null,
    rationale:
      "He set a rate alert through the QM Pricer 26 hours ago and nobody has called. Leads contacted within an hour convert several times more often than leads contacted the next day.",
    factors: [
      "Captured 26 hours ago via QM Pricer",
      "Zero contact attempts",
      "Speed-to-lead SLA breached",
    ],
  },
  {
    personKey: "whitmore",
    kind: "draft_email",
    title: "Annual review outreach — Paul Whitmore",
    templateRef: "EMT-108",
    body: "Hi Paul,\n\nIt's been a year since you closed on the Magnolia house — congratulations on the anniversary.\n\nI set aside time each year to look at my clients' mortgages and check whether anything has changed worth acting on. No agenda, and no cost. Would a 15-minute call in the next week or two be useful?\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
    rationale:
      "His loan closed 358 days ago and his annual review date has arrived. No contact in 96 days.",
    factors: [
      "Annual review date reached",
      "Funded 358 days ago",
      "No contact 96 days",
    ],
  },
  {
    personKey: "alvarez",
    kind: "next_best_action",
    title: "Diego Alvarez has gone quiet — 9 days with no movement",
    body: null,
    rationale:
      "Preapproved at $430K five weeks ago and searching, but there's been no activity for 9 days and his preapproval expires in about a month.",
    factors: [
      "No activity 9 days (QUALIFY threshold is 7)",
      "Preapproval expires in 34 days",
      "No offer submitted since preapproval",
    ],
  },
];

export type SeedCampaign = {
  name: string;
  status: "draft" | "scheduled" | "running" | "finished";
  templateRef?: string;
  /** Campaign copy language. Defaults to English. */
  language?: "en" | "es" | "vi" | "ru";
  /** Channel content authored on the campaign itself. */
  emailBody?: string;
  smsBody?: string;
  videoMeta?: Record<string, unknown>;
  /** Drip steps in send order. */
  drip?: { day: number; channel: "email" | "sms"; subject: string }[];
  audience: { label: string; type: string };
  audienceSize: number;
  scheduledInDays?: number;
  /** Staggers createdAt so per-owner marketing activity differs by window. */
  createdDaysAgo?: number;
  sentCount?: number;
  openCount?: number;
  replyCount?: number;
};

/** Shared compliance footer for campaign email copy. */
const CAMPAIGN_FOOTER =
  "{{LoanOfficerName}}\nNMLS {{NMLS}} — Company NMLS 320841\nThis is not a commitment to lend. All loans subject to credit approval.\nEqual Housing Opportunity.";

export const CAMPAIGNS: SeedCampaign[] = [
  {
    name: "Past client check-in — summer",
    status: "finished",
    templateRef: "EMT-104",
    language: "en",
    createdDaysAgo: 2,
    emailBody: `Hi {{BorrowerName}},\n\nJust a quick check-in — no agenda. A year of homeownership brings surprises, and I like to make sure nothing on the mortgage side is one of them.\n\nIf your plans, your payment, or your property have changed, hit reply and we'll take a look together. If everything's humming along, even better — that's what I like to hear.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — it's {{LoanOfficerName}} at Loan Factory. Quick check-in on your loan: anything changed, or questions I can answer? Reply STOP to opt out.",
    drip: [
      { day: 0, channel: "email", subject: "A quick check-in on your loan" },
      { day: 5, channel: "email", subject: "Rates moved — worth a look?" },
      { day: 12, channel: "sms", subject: "Still here if you have questions" },
    ],
    audience: { label: "Past clients who funded more than 6 months ago", type: "past_clients" },
    audienceSize: 4,
    sentCount: 4,
    openCount: 3,
    replyCount: 1,
  },
  {
    name: "Agent partner monthly update",
    status: "running",
    templateRef: "EMT-031",
    language: "en",
    createdDaysAgo: 12,
    emailBody: `Hi {{PartnerName}},\n\nHere's this month's snapshot for your buyers: what inventory is doing in our core zip codes, how preapproval turn times are running, and one financing option your first-time buyers may not know about.\n\nIf you have a buyer who's stuck — on payment, on down payment, on documentation — send them my way and I'll give them a straight answer either way.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{PartnerName}} — {{LoanOfficerName}} at Loan Factory. Mid-month check-in: any buyers stuck on financing I can help un-stick? Reply STOP to opt out.",
    drip: [
      { day: 0, channel: "email", subject: "This month's market snapshot for your buyers" },
      { day: 14, channel: "sms", subject: "Mid-month check-in — any buyers stuck?" },
    ],
    audience: { label: "All referral partners", type: "partners" },
    audienceSize: 6,
    sentCount: 6,
    openCount: 4,
    replyCount: 2,
  },
  {
    name: "Preapproval expiring — 30 day nudge",
    status: "scheduled",
    templateRef: "EMT-008",
    language: "en",
    createdDaysAgo: 5,
    emailBody: `Hi {{BorrowerName}},\n\nYour preapproval letter has an expiration date coming up, and I'd rather refresh it early than have it lapse mid-house-hunt.\n\nThe refresh usually takes a few minutes: I confirm nothing has changed, re-run the numbers, and issue an updated letter so your offers stay strong.\n\nReply to this email or call me and we'll get it done.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — your preapproval expires soon. 2 minutes on the phone and I can refresh it. — {{LoanOfficerName}}, Loan Factory. Reply STOP to opt out.",
    drip: [
      { day: 0, channel: "email", subject: "Your preapproval expires soon — let's refresh it" },
      { day: 3, channel: "sms", subject: "Quick nudge: 2 minutes to refresh your preapproval" },
      { day: 7, channel: "email", subject: "Last week to refresh without new documents" },
    ],
    audience: { label: "Borrowers whose preapproval expires within 30 days", type: "preapproval_expiring" },
    audienceSize: 2,
    scheduledInDays: 2,
  },
  {
    name: "Anniversary wishes — August closings",
    status: "draft",
    templateRef: "EMT-105",
    language: "en",
    createdDaysAgo: 1,
    emailBody: `Hi {{BorrowerName}},\n\nHappy home anniversary! It's been a year since you got the keys, and that milestone deserves a note.\n\nOnce a year I offer past clients a short, no-obligation review: we look at your rate, your equity, and whether anything is worth acting on. Most of the time the answer is "you're in good shape" — and that's a fine answer.\n\nWant 15 minutes in the next couple of weeks?\n\n${CAMPAIGN_FOOTER}`,
    audience: { label: "Past clients with an August closing anniversary", type: "anniversary" },
    audienceSize: 3,
  },

  // --- Campaigns the lead-source automations enroll into ---------------------
  {
    name: "New lead welcome — first 10 days",
    status: "running",
    language: "en",
    createdDaysAgo: 18,
    emailBody: `Hi {{BorrowerName}},\n\nThanks for reaching out — you're in the right place. Over the next few days I'll send you a short, useful series: what a preapproval actually involves, what lenders look at, and the questions worth asking anyone who offers you a loan (including me).\n\nNo pressure and no obligation — when you're ready to talk numbers, I'm one reply away.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — {{LoanOfficerName}} at Loan Factory. Got your request; I'll call you shortly. Meanwhile, reply here with any questions. Reply STOP to opt out.",
    audience: { label: "New leads in their first 10 days", type: "new_leads" },
    audienceSize: 26,
    sentCount: 22,
    openCount: 11,
    replyCount: 4,
  },
  {
    name: "Agent referral welcome",
    status: "running",
    language: "en",
    createdDaysAgo: 3,
    emailBody: `Hi {{BorrowerName}},\n\n{{PartnerName}} asked me to take good care of you — and I intend to. Here's what working with me looks like: a short first call, a clear picture of what you qualify for, and a preapproval letter your agent can put to work.\n\nI'll keep {{PartnerName}} in the loop at every milestone so nobody has to chase anybody.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — {{LoanOfficerName}} at Loan Factory. {{PartnerName}} connected us; I'll call you today. Reply STOP to opt out.",
    audience: { label: "New leads referred by a real estate agent", type: "agent_referrals" },
    audienceSize: 9,
    sentCount: 8,
    openCount: 6,
    replyCount: 3,
  },
  {
    name: "Past client referral thank-you",
    status: "running",
    language: "en",
    createdDaysAgo: 24,
    emailBody: `Hi {{BorrowerName}},\n\nSomeone you trust trusted me with your name — that's the best introduction there is, and I don't take it lightly.\n\nHere's how I work: straight answers, plain language, and no surprises at the closing table. Whenever you're ready, a 15-minute call is all we need to get you a clear starting point.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — {{LoanOfficerName}} at Loan Factory. A mutual friend passed along your name; I'd love to help. I'll reach out today. Reply STOP to opt out.",
    audience: { label: "New leads referred by a past client", type: "past_client_referrals" },
    audienceSize: 6,
    sentCount: 5,
    openCount: 4,
    replyCount: 2,
  },
  {
    name: "Application received — what happens next",
    status: "running",
    language: "en",
    createdDaysAgo: 40,
    emailBody: `Hi {{BorrowerName}},\n\nYour application is in — nicely done. Here's the road ahead, in plain English:\n\n1. We verify your documents and order what the file needs.\n2. Underwriting reviews everything and may ask follow-up questions — normal, not a red flag.\n3. You get a clear to close, we schedule signing, and you get keys.\n\nI'll tell you at every step whether the ball is in your court or ours. Right now: it's ours.\n\n${CAMPAIGN_FOOTER}`,
    audience: { label: "Borrowers whose application was just received", type: "application_received" },
    audienceSize: 12,
    sentCount: 11,
    openCount: 9,
    replyCount: 3,
  },
  {
    name: "Preapproval issued — house hunting kit",
    status: "running",
    language: "en",
    createdDaysAgo: 6,
    emailBody: `Hi {{BorrowerName}},\n\nYour preapproval letter is attached — congratulations, you're officially house-hunting.\n\nA few things that make the next weeks easier: how to read a seller's counter without panicking, why your preapproval amount is a ceiling and not a target, and what NOT to do with your credit until we close (short version: nothing new).\n\nSend me any listing and I'll run real payment numbers on it, usually same day.\n\n${CAMPAIGN_FOOTER}`,
    smsBody:
      "Hi {{BorrowerName}} — preapproval letter is in your inbox. Send me any listing and I'll run real numbers on it. — {{LoanOfficerName}}. Reply STOP to opt out.",
    audience: { label: "Borrowers with a freshly issued preapproval", type: "preapproval_issued" },
    audienceSize: 14,
    sentCount: 13,
    openCount: 10,
    replyCount: 5,
  },
  {
    name: "Just closed — welcome home",
    status: "running",
    language: "en",
    createdDaysAgo: 55,
    emailBody: `Hi {{BorrowerName}},\n\nWelcome home! The loan is funded, the keys are yours, and my job now shifts to something simpler: being useful when you need me.\n\nIn the next week you'll get a short note on where your first payment goes and how escrow works. After that I'll check in occasionally — and if rates or life ever change the math on your mortgage, I'll tell you honestly.\n\nThank you for trusting me with the biggest purchase there is.\n\n${CAMPAIGN_FOOTER}`,
    audience: { label: "Borrowers who funded in the last 30 days", type: "just_closed" },
    audienceSize: 8,
    sentCount: 7,
    openCount: 6,
    replyCount: 2,
  },
];

export type SeedAutomation = {
  ref: string;
  name: string;
  description: string;
  triggerText: string;
  audienceText: string;
  actionText: string;
  tier: "t0" | "t1" | "t2" | "t3";
  status: "active" | "paused" | "draft";
  templateRef?: string;
  /** Where the triggering lead/event comes from (facebook, website, agent referral, crm event…). */
  source?: string;
  /** Plain-language timing, e.g. "Within 5 minutes" or "Next morning at 9am". */
  timingText?: string;
  /** Campaign this automation enrolls people into — resolved to campaignId at seed time. */
  campaignName?: string;
  runCount: number;
  lastRunDaysAgo?: number;
  runs: { personKey: string; status: "completed" | "queued_for_approval" | "skipped"; outcome: string; daysAgo: number; stoppedReason?: string }[];
};

export const AUTOMATIONS: SeedAutomation[] = [
  // --- The ten canonical lead-source and lifecycle automations ---------------
  {
    ref: "L-01",
    name: "New real estate agent referral",
    description:
      "An agent's referral is a promise between professionals — the welcome goes out fast, and the agent stays in the loop.",
    triggerText: "A real estate agent sends a new referral",
    audienceText: "The referred buyer",
    actionText: "Enroll them in the Agent referral welcome campaign and create a call task",
    tier: "t2",
    status: "active",
    source: "agent referral",
    campaignName: "Agent referral welcome",
    timingText: "Within 5 minutes, any hour",
    runCount: 21,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "kim",
        status: "completed",
        outcome: "Enrolled Grace Kim in 'Agent referral welcome' and created a call task.",
        daysAgo: 1,
      },
      {
        personKey: "santos",
        status: "queued_for_approval",
        outcome:
          "Welcome draft ready for Elena Santos — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
      {
        personKey: "hoang",
        status: "skipped",
        outcome: "Skipped — Liên Hoàng was already enrolled in this campaign last month.",
        daysAgo: 4,
        stoppedReason: "Already enrolled",
      },
    ],
  },
  {
    ref: "L-02",
    name: "Past client referral",
    description:
      "A referral from a past client gets a warm welcome — and the referrer gets thanked, every time.",
    triggerText: "A past client refers someone new",
    audienceText: "The referred person, and a thank-you to the referrer",
    actionText:
      "Enroll them in the Past client referral thank-you campaign; queue a thank-you note to the referrer",
    tier: "t2",
    status: "active",
    source: "past client referral",
    campaignName: "Past client referral thank-you",
    timingText: "Within 15 minutes; thank-you to the referrer next morning",
    runCount: 9,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "reyes",
        status: "completed",
        outcome:
          "Enrolled Sofia Reyes in 'Past client referral thank-you'; thank-you note to the referrer queued for the morning.",
        daysAgo: 1,
      },
      {
        personKey: "patel",
        status: "queued_for_approval",
        outcome:
          "Thank-you draft to the referrer is ready — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "L-03",
    name: "Facebook lead",
    description: "Paid social leads go cold in minutes. The welcome fires before they scroll on.",
    triggerText: "A new lead arrives from Facebook",
    audienceText: "The new lead",
    actionText: "Enroll them in the New lead welcome campaign and create a call task",
    tier: "t2",
    status: "active",
    source: "facebook",
    campaignName: "New lead welcome — first 10 days",
    timingText: "Within 5 minutes",
    runCount: 42,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "torres",
        status: "completed",
        outcome: "Enrolled Maria Torres in 'New lead welcome — first 10 days' and created a call task.",
        daysAgo: 0,
      },
      {
        personKey: "brooks",
        status: "skipped",
        outcome: "Skipped — Denise Brooks already has an active file with the team.",
        daysAgo: 3,
        stoppedReason: "Existing active file",
      },
      {
        personKey: "alvarez",
        status: "completed",
        outcome: "Enrolled Diego Alvarez in 'New lead welcome — first 10 days' and created a call task.",
        daysAgo: 5,
      },
    ],
  },
  {
    ref: "L-04",
    name: "Instagram lead",
    description: "Same first-10-days welcome as Facebook — Instagram buyers just found us differently.",
    triggerText: "A new lead arrives from Instagram",
    audienceText: "The new lead",
    actionText: "Enroll them in the New lead welcome campaign and create a call task",
    tier: "t2",
    status: "active",
    source: "instagram",
    campaignName: "New lead welcome — first 10 days",
    timingText: "Within 5 minutes",
    runCount: 17,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "chen",
        status: "completed",
        outcome: "Enrolled Wei Chen in 'New lead welcome — first 10 days' and created a call task.",
        daysAgo: 2,
      },
      {
        personKey: "hoang",
        status: "queued_for_approval",
        outcome: "Welcome draft ready for Liên Hoàng — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "L-05",
    name: "Website lead",
    description: "Someone who filled out the site form is asking to be called. This makes sure they are.",
    triggerText: "A new lead arrives from the website",
    audienceText: "The new lead",
    actionText: "Enroll them in the New lead welcome campaign and create a call task",
    tier: "t2",
    status: "active",
    source: "website",
    campaignName: "New lead welcome — first 10 days",
    timingText: "Within 5 minutes",
    runCount: 31,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "patel",
        status: "completed",
        outcome: "Enrolled Ravi Patel in 'New lead welcome — first 10 days' and created a call task.",
        daysAgo: 0,
      },
      {
        personKey: "murphy",
        status: "completed",
        outcome: "Enrolled Sean Murphy in 'New lead welcome — first 10 days' and created a call task.",
        daysAgo: 4,
      },
      {
        personKey: "carver",
        status: "skipped",
        outcome: "Skipped — the file was marked lost before the welcome went out.",
        daysAgo: 5,
        stoppedReason: "File lost",
      },
    ],
  },
  {
    ref: "L-06",
    name: "Open house lead",
    description:
      "Sign-in sheets from Saturday's open house become warm conversations by Saturday evening.",
    triggerText: "A new lead arrives from an open house sign-in",
    audienceText: "The new lead",
    actionText: "Enroll them in the New lead welcome campaign and create a call task",
    tier: "t2",
    status: "active",
    source: "open house",
    campaignName: "New lead welcome — first 10 days",
    timingText: "Same evening by 7pm",
    runCount: 12,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "bui",
        status: "completed",
        outcome: "Enrolled Tuấn Bùi from Saturday's open house — welcome email went out at 6:40pm.",
        daysAgo: 2,
      },
      {
        personKey: "alvarez",
        status: "queued_for_approval",
        outcome:
          "Evening welcome draft ready for Diego Alvarez — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "E-01",
    name: "New application",
    description: "The moment an application lands, the borrower learns exactly what happens next.",
    triggerText: "A borrower's application is received",
    audienceText: "The borrower on that application",
    actionText: "Enroll them in the Application received campaign",
    tier: "t2",
    status: "active",
    source: "crm event",
    campaignName: "Application received — what happens next",
    timingText: "Within the hour",
    runCount: 14,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "murphy",
        status: "completed",
        outcome: "Enrolled Sean Murphy in 'Application received — what happens next' within the hour.",
        daysAgo: 1,
      },
      {
        personKey: "pham",
        status: "completed",
        outcome: "Enrolled Anna Phạm in 'Application received — what happens next' within the hour.",
        daysAgo: 3,
      },
      {
        personKey: "vu",
        status: "queued_for_approval",
        outcome:
          "'What happens next' draft ready for Hạnh Vũ — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "E-02",
    name: "Preapproval issued",
    description: "A fresh preapproval letter deserves a house-hunting kit to go with it.",
    triggerText: "A preapproval letter is issued",
    audienceText: "The preapproved borrower",
    actionText: "Enroll them in the house hunting kit campaign",
    tier: "t2",
    status: "active",
    source: "crm event",
    campaignName: "Preapproval issued — house hunting kit",
    timingText: "Next morning at 9am",
    runCount: 11,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "tran",
        status: "completed",
        outcome:
          "Enrolled Bích Trần in 'Preapproval issued — house hunting kit' the morning after her letter.",
        daysAgo: 2,
      },
      {
        personKey: "alvarez",
        status: "completed",
        outcome: "Enrolled Diego Alvarez in 'Preapproval issued — house hunting kit'.",
        daysAgo: 5,
      },
      {
        personKey: "chen",
        status: "queued_for_approval",
        outcome:
          "House-hunting kit draft ready for Wei Chen — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "E-03",
    name: "Loan closed",
    description: "Funding day ends the transaction and starts the relationship.",
    triggerText: "A loan funds",
    audienceText: "The new homeowner",
    actionText: "Enroll them in the Just closed — welcome home campaign",
    tier: "t2",
    status: "active",
    source: "crm event",
    campaignName: "Just closed — welcome home",
    timingText: "The day after closing",
    runCount: 8,
    lastRunDaysAgo: 3,
    runs: [
      {
        personKey: "gallagher",
        status: "completed",
        outcome: "Enrolled Erin Gallagher in 'Just closed — welcome home' the day after funding.",
        daysAgo: 3,
      },
      {
        personKey: "mclean",
        status: "completed",
        outcome: "Enrolled Heather McLean in 'Just closed — welcome home' the day after funding.",
        daysAgo: 4,
      },
    ],
  },
  {
    ref: "R-01",
    name: "Past client anniversary",
    description: "The cheapest referral you will ever earn.",
    triggerText: "It's a year since a client's loan funded",
    audienceText: "Past clients",
    actionText: "AI drafts an anniversary note — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-105",
    source: "crm event",
    campaignName: "Anniversary wishes — August closings",
    timingText: "On the anniversary, at 9am local",
    runCount: 12,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "whitmore",
        status: "queued_for_approval",
        outcome:
          "Draft ready — one year since the Magnolia closing. Nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
      {
        personKey: "ito",
        status: "completed",
        outcome: "Anniversary note approved and sent — two years in the Kirkland house.",
        daysAgo: 5,
      },
    ],
  },

  // --- Working automations beyond the canonical ten --------------------------
  {
    ref: "A-01",
    name: "New lead — call reminder",
    description: "Nobody should sit uncalled. This keeps speed-to-lead honest.",
    triggerText: "A new lead is captured",
    audienceText: "Any new lead assigned to me",
    actionText: "Create a task to call them, and tell me right away",
    tier: "t1",
    status: "active",
    source: "crm event",
    timingText: "Within 5 minutes of capture",
    runCount: 34,
    lastRunDaysAgo: 0,
    runs: [
      { personKey: "torres", status: "completed", outcome: "Task created: Call Maria Torres", daysAgo: 0 },
      { personKey: "patel", status: "completed", outcome: "Task created: Call Ravi Patel", daysAgo: 0 },
      { personKey: "okonkwo", status: "completed", outcome: "Task created: Call Chidi Okonkwo", daysAgo: 1 },
    ],
  },
  {
    ref: "D-01",
    name: "Waiting on documents — follow up",
    description:
      "When the team flags that a borrower still owes items, AI drafts the nudge and waits for approval.",
    triggerText: "A file has been waiting on borrower documents for 2 days",
    audienceText: "The borrower on that file",
    actionText: "AI drafts a reminder in their language — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-012",
    source: "crm event",
    timingText: "After 2 days waiting, at 10am",
    runCount: 18,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "tran",
        status: "queued_for_approval",
        outcome: "Draft ready for Bích Trần — waiting for your approval",
        daysAgo: 0,
      },
      {
        personKey: "brooks",
        status: "skipped",
        outcome: "Skipped — she replied before the reminder was due",
        daysAgo: 1,
        stoppedReason: "Borrower replied",
      },
    ],
  },
  {
    ref: "C-04",
    name: "Preapproval expiring",
    description: "A preapproval that lapses quietly costs a deal.",
    triggerText: "A preapproval expires in 14 days",
    audienceText: "The borrower, and their agent if there is one",
    actionText: "AI drafts a refresh offer — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-008",
    source: "crm event",
    timingText: "14 days before expiry, at 9am",
    runCount: 7,
    lastRunDaysAgo: 2,
    runs: [
      {
        personKey: "tran",
        status: "queued_for_approval",
        outcome: "Draft ready — preapproval expires in 11 days",
        daysAgo: 2,
      },
    ],
  },
  {
    ref: "S-01",
    name: "File has gone quiet",
    description: "Catches files drifting before they die.",
    triggerText: "A file has had no activity for its stage's limit",
    audienceText: "Nobody — this one is just for me",
    actionText: "Flag it on Today and tell me why it stalled",
    tier: "t1",
    status: "active",
    source: "crm event",
    timingText: "Each morning at 7am",
    runCount: 23,
    lastRunDaysAgo: 0,
    runs: [
      { personKey: "alvarez", status: "completed", outcome: "Flagged: no movement 9 days", daysAgo: 0 },
      { personKey: "le", status: "completed", outcome: "Flagged: no movement 6 days", daysAgo: 0 },
    ],
  },
  {
    ref: "F-03",
    name: "Rate lock expiring",
    description:
      "Rate locks are never automated. AI will not draft this — it only makes sure you know.",
    triggerText: "A rate lock expires within 3 days",
    audienceText: "Nobody — a human must handle this personally",
    actionText: "Create an urgent task and notify me. AI drafts nothing.",
    tier: "t0",
    status: "active",
    source: "crm event",
    timingText: "The moment the 3-day window opens",
    runCount: 4,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "nguyen",
        status: "completed",
        outcome: "Urgent task created: call Thanh Nguyễn — lock expires in 2 days. No draft prepared (rate locks are never automated).",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "B-02",
    name: "Consultation reminder",
    description: "Cuts no-shows.",
    triggerText: "A consultation is booked for tomorrow",
    audienceText: "The person attending",
    actionText: "AI drafts a reminder — you approve before it sends",
    tier: "t2",
    status: "paused",
    source: "crm event",
    timingText: "The afternoon before, at 3pm",
    runCount: 3,
    lastRunDaysAgo: 30,
    runs: [],
  },
];
