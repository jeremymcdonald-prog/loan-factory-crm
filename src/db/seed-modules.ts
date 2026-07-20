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

  // --- Additional coverage: every channel gets multiple threads, plus the
  // remaining message states (approved-but-unsent, a second awaiting_approval)
  // and attachments/translations on top of what's above. ------------------

  // SMS — waiting on you (inbound, no reply), Spanish with an English translation.
  {
    personKey: "delgado",
    subject: "Cuándo empezar",
    channel: "sms",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 30,
        body: "Hola, todavía estamos esperando que termine el contrato de arrendamiento en agosto. ¿Deberíamos hacer algo antes de eso?",
        meta: {
          translationEn:
            "Hi, we're still waiting for our lease to end in August. Should we be doing anything before then?",
        },
      },
    ],
  },
  // SMS — Vietnamese, waiting on you.
  {
    personKey: "ngo",
    subject: "Khi nào nên bắt đầu",
    channel: "sms",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 15,
        body: "Chào anh Minh, gia đình em vẫn đang đợi hợp đồng thuê nhà hết hạn. Khi nào nên bắt đầu chuẩn bị hồ sơ ạ?",
        meta: {
          translationEn:
            "Hello Minh, my family is still waiting for our lease to end. When should we start preparing the paperwork?",
        },
      },
    ],
  },
  // SMS — a normal back-and-forth exchange.
  {
    personKey: "watts",
    subject: "Refi numbers",
    channel: "sms",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 40,
        body: "Hi Julia — quick note that with rates where they are, a refi could lower your payment. Want me to run the numbers? — Minh, Loan Factory",
      },
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 20,
        body: "Yes please, that would be great.",
      },
    ],
  },
  // Call — a straightforward logged call.
  {
    personKey: "ellison",
    subject: "Appraisal appointment window",
    channel: "call",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 18,
        body: "Called to confirm the appraisal appointment window. Reached Craig; confirmed for Thursday 1-3pm.",
        meta: { outcome: "connected", durationSeconds: 210 },
      },
    ],
  },
  // Call — a logged call to a partner.
  {
    partnerKey: "sandoval_cpa",
    subject: "Comparing notes on a shared client",
    channel: "call",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 60,
        body: "Called Marisol to compare notes on two shared self-employed clients — no answer, left a voicemail.",
        meta: { outcome: "voicemail", durationSeconds: 25 },
      },
    ],
  },
  // App — waiting on you (inbound, no reply).
  {
    personKey: "foster",
    subject: "Anything else on the credit side?",
    channel: "app",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 10,
        body: "Just wanted to check in — is there anything else I should be doing on the credit side before we talk again?",
      },
    ],
  },
  // App — a partner exchange.
  {
    partnerKey: "castellanos",
    subject: "New buyer for you",
    channel: "app",
    messages: [
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 14,
        body: "Rosa here — got a buyer for you, sending contact info in a sec.",
      },
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 13,
        body: "Perfect, thank you! I'll reach out today.",
      },
    ],
  },
  // Note — internal, English (team notes stay in English regardless of the
  // client's preferred language).
  {
    personKey: "ngo",
    subject: "Lease extended",
    channel: "note",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 5,
        body: "Khánh's landlord extended the lease by 4 months — pushed the likely start date out. Keep in the nurture list, check back in Q1.",
      },
    ],
  },
  // Note — internal.
  {
    personKey: "harrington",
    subject: "Relocation timeline",
    channel: "note",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 8,
        body: "Grant is relocating for a new job that doesn't start until next spring. Not worth active outreach until then — light-touch nurture only.",
      },
    ],
  },
  // Video — approved but not sent (status "approved": approvedAt set, sentAt
  // NULL — the seeder's honesty rule for every channel, not only email).
  {
    personKey: "nazarov",
    subject: "Обновление по вашей заявке",
    channel: "video",
    messages: [
      {
        direction: "outbound",
        status: "approved",
        hoursAgo: 3,
        body: "[Video: Обновление по вашей заявке]\n\nIf the video doesn't load, use this link instead.",
        meta: {
          translationEn: "A short video update on where the appraisal stands.",
          video: {
            title: "Обновление по вашей заявке",
            caption: "90-second update",
            durationSeconds: 88,
            demo: true,
          },
        },
      },
    ],
  },
  // Email — with a PDF attachment (honest demo metadata; no real file).
  {
    personKey: "watts",
    subject: "Your refi savings estimate",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 15,
        body: "Hi Julia,\n\nAttached is the refi savings estimate we discussed — comparing your current payment to a couple of rate scenarios.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
        meta: { attachments: [{ name: "Refi-savings-estimate.pdf", kind: "pdf" }] },
      },
      {
        direction: "inbound",
        status: "received",
        hoursAgo: 10,
        body: "This is great, thank you! Let's move forward — what do you need from me?",
      },
    ],
  },
  // Email — with an image attachment.
  {
    personKey: "sullivan",
    subject: "Your appraisal came back",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        status: "sent",
        hoursAgo: 20,
        body: "Hi Meghan,\n\nThe appraisal came back at $792,000 — comfortably above the contract price. Attaching a photo of the summary page for your records.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
        meta: { attachments: [{ name: "Appraisal-summary-photo.jpg", kind: "image" }] },
      },
    ],
  },
  // Email — a second awaiting_approval example, this one a first-touch draft
  // to a never-contacted hot-list partner.
  {
    partnerKey: "vance_target",
    subject: "Introducing myself",
    channel: "email",
    messages: [
      {
        direction: "outbound",
        status: "awaiting_approval",
        preparedByAi: true,
        hoursAgo: 6,
        body: "Hi Melissa,\n\nJenna Alvarez speaks highly of you, and I'd love to find a few minutes to introduce myself — I work with a lot of Eastside buyers and would welcome the chance to be a resource for your listings.\n\nMinh Nguyen\nNMLS 1856432\nCompany NMLS 320841\n\nEqual Housing Opportunity.",
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
      "No activity 9 days (past the 7-day quiet threshold)",
      "Preapproval expires in 34 days",
      "No offer submitted since preapproval",
    ],
  },
];

/** One step in a `campaign_step` sequence — the real multi-step drip model (M6/M7). */
export type SeedCampaignStep = {
  channel: "email" | "sms" | "task" | "call" | "video" | "app" | "notification";
  /** Days after enrollment this fires. 0 = immediately. */
  delayDays: number;
  sendTime?: string | null;
  /** Resolved to templateId at seed time via the parsed template library. */
  templateRef?: string;
  subject?: string | null;
  body?: string | null;
  /** Honesty default: nothing sends without a human approving it first. */
  approvalRequired?: boolean;
  skipCondition?: string | null;
  stopCondition?: string | null;
  /** Defaults to "en". A translated sibling step reuses the same channel/delay. */
  language?: "en" | "es" | "vi" | "ru";
};

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
  /** DEMO_LOS key for the owner. Defaults to "minh" when omitted. */
  ownerKey?: string;
  /** The real multi-step drip: one row per campaign_step, in send order. */
  steps?: SeedCampaignStep[];
};

/** Shared compliance footer for campaign email copy. */
const CAMPAIGN_FOOTER =
  "{{LoanOfficerName}}\nNMLS {{NMLS}} — Company NMLS 320841\nThis is not a commitment to lend. All loans subject to credit approval.\nEqual Housing Opportunity.";

/**
 * Shared compliance footer for the 21 M7 multi-step campaigns below. Same
 * legal content as CAMPAIGN_FOOTER, in the {{first_name}}-style merge-field
 * convention this batch uses throughout.
 */
const STEP_FOOTER =
  "{{loan_officer_name}}\nNMLS {{nmls}} — Company NMLS 320841\nThis is not a commitment to lend. All loans subject to credit approval.\nEqual Housing Opportunity.";

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

/**
 * The 21 named, multi-step campaigns (M7's core deliverable). Each carries a
 * real `steps` sequence — the campaign_step rows the product now reads —
 * mixing channels and timed delays. Owners are varied across the ten DEMO_LOS
 * loan officers; `language` stays "en" on every campaign row (the
 * multilingual demonstration lives at the step level: three campaigns below
 * carry a translated sibling step in Spanish, Vietnamese, or Russian).
 */
export const MULTISTEP_CAMPAIGNS: SeedCampaign[] = [
  {
    name: "New internet lead",
    status: "running",
    language: "en",
    ownerKey: "minh",
    createdDaysAgo: 25,
    audience: { label: "New leads from the website or a rate widget", type: "new_internet_lead" },
    audienceSize: 20,
    sentCount: 18,
    openCount: 12,
    replyCount: 5,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-002",
        subject: "Thanks for reaching out, {{first_name}}",
        body: `Hi {{first_name}},\n\nThanks for reaching out online — you're in good hands. I help people compare real mortgage options in plain language, with no pressure and no obligation.\n\nI'll call shortly, but feel free to reply here first with anything on your mind.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Call {{first_name}} — new internet lead",
        body: "New lead came in from the website. Call within 5 minutes if you can — speed-to-lead matters more than the script.",
      },
      {
        channel: "sms",
        delayDays: 1,
        subject: null,
        body: "Hi {{first_name}} — it's {{loan_officer_name}} at Loan Factory. Got 2 minutes today to talk through your goals? Reply STOP to opt out.",
        skipCondition: "Skip if they've already had a call logged",
      },
      {
        channel: "email",
        delayDays: 5,
        sendTime: "10:00",
        subject: "What a preapproval actually involves",
        body: `Hi {{first_name}},\n\nA preapproval isn't a big commitment — it's a 15-minute conversation and a short document list, and it tells you exactly what you can offer with confidence.\n\nWant to get that piece out of the way this week?\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, book a consultation, or ask to stop",
      },
    ],
  },
  {
    name: "Facebook lead",
    status: "running",
    language: "en",
    ownerKey: "carlos",
    createdDaysAgo: 20,
    audience: { label: "New leads from Facebook lead ads", type: "facebook_lead" },
    audienceSize: 24,
    sentCount: 22,
    openCount: 13,
    replyCount: 4,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Saw your message on Facebook, {{first_name}}",
        body: `Hi {{first_name}},\n\nThanks for reaching out through our Facebook ad — I wanted to connect personally rather than let it sit in a queue. I help people compare mortgage options and figure out a real next step, no pressure.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Call {{first_name}} — Facebook lead",
        body: "Paid lead, likely still online right now. Call within 5 minutes — response speed is the whole game with ad leads.",
      },
      {
        channel: "sms",
        delayDays: 1,
        subject: null,
        body: "Hi {{first_name}} — following up on the Facebook ad. Still looking, or just researching for now? Reply STOP to opt out.",
      },
      {
        // Spanish sibling of the day-1 text — same channel and delay, a human
        // writes and reviews this language's copy fresh (M6/M7 convention).
        channel: "sms",
        delayDays: 1,
        subject: null,
        body: "Hola {{first_name}} — le escribo por el anuncio de Facebook. ¿Todavía buscando, o solo investigando por ahora? Responda STOP para cancelar.",
        language: "es",
      },
      {
        channel: "email",
        delayDays: 5,
        subject: "Still exploring your options?",
        body: `Hi {{first_name}},\n\nNo pressure at all — just wanted to leave the door open. If you'd like a real number to work with (what you'd qualify for, roughly what payment looks like), a short call gets you there.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, book a consultation, or ask to stop",
      },
    ],
  },
  {
    name: "Instagram lead",
    status: "running",
    language: "en",
    ownerKey: "priya",
    createdDaysAgo: 18,
    audience: { label: "New leads from Instagram lead ads", type: "instagram_lead" },
    audienceSize: 11,
    sentCount: 10,
    openCount: 6,
    replyCount: 2,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Thanks for reaching out on Instagram, {{first_name}}",
        body: `Hi {{first_name}},\n\nThanks for reaching out through Instagram — same person, same straight answers, just found me a different way. I'll call shortly; reply here anytime with questions.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Call {{first_name}} — Instagram lead",
        body: "Paid social lead. Call within 5 minutes while it's fresh.",
      },
      {
        channel: "sms",
        delayDays: 2,
        subject: null,
        body: "Hi {{first_name}} — quick check-in from the Instagram ad. Any questions I can answer? Reply STOP to opt out.",
      },
      {
        channel: "email",
        delayDays: 7,
        subject: "Still thinking it over?",
        body: `Hi {{first_name}},\n\nNo rush — buying or refinancing is a big decision. When you're ready for a real number instead of a guess, I'm one reply away.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, book a consultation, or ask to stop",
      },
    ],
  },
  {
    name: "Agent referral",
    status: "running",
    language: "en",
    ownerKey: "tom",
    createdDaysAgo: 15,
    audience: { label: "New leads referred directly by a real estate agent", type: "agent_referral" },
    audienceSize: 9,
    sentCount: 9,
    openCount: 7,
    replyCount: 4,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-004",
        subject: "{{partner_name}} sent me your way, {{first_name}}",
        body: `Hi {{first_name}},\n\n{{partner_name}} asked me to take good care of you — and I intend to. A short first call gets you a clear picture of what you qualify for, and I'll keep {{partner_name}} in the loop the whole way.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Call {{first_name}} — agent referral",
        body: "Referred by {{partner_name}} — call the same day. Agent referrals are the best kind of introduction; treat it that way.",
      },
      {
        channel: "email",
        delayDays: 3,
        subject: "What working with me looks like",
        body: `Hi {{first_name}},\n\nHere's the short version: a clear first call, straight answers, and a preapproval letter your agent can put to work right away.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 7,
        subject: null,
        body: "Hi {{first_name}} — {{loan_officer_name}} here. Still a good time to talk numbers? Reply STOP to opt out.",
        stopCondition: "They reply, book a consultation, or ask to stop",
      },
    ],
  },
  {
    name: "Past-client referral",
    status: "running",
    language: "en",
    ownerKey: "elena",
    createdDaysAgo: 14,
    audience: { label: "New leads referred by a past client", type: "past_client_referral" },
    audienceSize: 7,
    sentCount: 7,
    openCount: 5,
    replyCount: 3,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-003",
        subject: "A friend of yours thought of me, {{first_name}}",
        body: `Hi {{first_name}},\n\nSomeone you trust passed along your name — that's the best introduction there is, and I don't take it lightly. Straight answers, plain language, no surprises at closing.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Call {{first_name}} — past-client referral",
        body: "Referred by a past client. Call the same day; this is warm trust, not a cold lead.",
      },
      {
        channel: "email",
        delayDays: 5,
        subject: "Still a good time to talk?",
        body: `Hi {{first_name}},\n\nNo pressure — whenever you're ready, a 15-minute call is all it takes to get you a clear starting point.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, book a consultation, or ask to stop",
      },
    ],
  },
  {
    name: "Open-house lead",
    status: "running",
    language: "en",
    ownerKey: "marcus",
    createdDaysAgo: 10,
    audience: { label: "New leads from an open-house sign-in sheet", type: "open_house_lead" },
    audienceSize: 13,
    sentCount: 11,
    openCount: 6,
    replyCount: 2,
    steps: [
      {
        channel: "sms",
        delayDays: 0,
        subject: null,
        body: "Thanks for stopping by the open house, {{first_name}} — it's {{loan_officer_name}} with Loan Factory. Any questions on financing, I'm here. Reply STOP to opt out.",
        stopCondition: "They reply, or a teammate reaches out first",
      },
      {
        channel: "email",
        delayDays: 1,
        subject: "Following up from Saturday's open house",
        body: `Hi {{first_name}},\n\nGreat meeting you Saturday. If the house — or the neighborhood — is still on your mind, I'm happy to run real numbers so you know exactly where you stand.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 5,
        subject: "Still looking around {{property_city}}?",
        body: `Hi {{first_name}},\n\nJust checking in — still house-hunting in {{property_city}}? Send me any listing and I'll run the payment numbers same day.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "task",
        delayDays: 7,
        subject: "Check in — open-house lead gone quiet",
        body: "No reply since the open house. Worth a personal call rather than another message.",
      },
    ],
  },
  {
    name: "Application incomplete",
    status: "running",
    language: "en",
    ownerKey: "thuy",
    createdDaysAgo: 9,
    audience: { label: "Borrowers who started but haven't finished an application", type: "application_incomplete" },
    audienceSize: 10,
    sentCount: 9,
    openCount: 6,
    replyCount: 3,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "10:00",
        templateRef: "EMT-018",
        subject: "One step left on your application, {{first_name}}",
        body: `Hi {{first_name}},\n\nLooks like your application got interrupted partway through — completely normal, life happens. Everything you entered is saved; you can pick up right where you left off.\n\n${STEP_FOOTER}`,
        stopCondition: "They complete the application",
      },
      {
        channel: "sms",
        delayDays: 2,
        subject: null,
        body: "Hi {{first_name}} — quick nudge, your application is almost done, just missing a couple of fields. Reply STOP to opt out.",
        stopCondition: "They complete the application",
      },
      {
        channel: "call",
        delayDays: 4,
        subject: "Call {{first_name}} — application still incomplete",
        body: "Confirm what's holding up the last section — sometimes it's a document they don't have handy yet, not a change of heart.",
        stopCondition: "They complete the application, or say they're no longer interested",
      },
    ],
  },
  {
    name: "Working on credit",
    status: "running",
    language: "en",
    ownerKey: "rebecca",
    createdDaysAgo: 33,
    audience: { label: "Leads rebuilding credit before they can qualify", type: "working_on_credit" },
    audienceSize: 12,
    sentCount: 11,
    openCount: 7,
    replyCount: 2,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Building your credit before we apply, {{first_name}}",
        body: `Hi {{first_name}},\n\nWe agreed a little more time on your credit will pay off in a better rate and more programs to choose from. I'll check in periodically — no pressure to move faster than makes sense.\n\n${STEP_FOOTER}`,
      },
      {
        // Vietnamese sibling of the intro step — same channel and delay.
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Xây dựng tín dụng trước khi nộp hồ sơ, {{first_name}}",
        body: `Chào {{first_name}},\n\nChúng ta đã đồng ý dành thêm thời gian để cải thiện tín dụng — điều này sẽ giúp anh chị có lãi suất tốt hơn và nhiều chương trình vay hơn để lựa chọn. Em sẽ theo dõi định kỳ, không có áp lực gì cả.\n\n${STEP_FOOTER}`,
        language: "vi",
      },
      {
        channel: "email",
        delayDays: 30,
        subject: "30-day credit check-in",
        body: `Hi {{first_name}},\n\nHow's the credit work going? If you've pulled a fresh report, send it over and I'll tell you honestly where you stand.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 60,
        subject: "60 days in — how's it looking?",
        body: `Hi {{first_name}},\n\nJust checking the timeline — still on track, or has something changed? Either answer is useful to know.\n\n${STEP_FOOTER}`,
        stopCondition: "They're ready to apply, or ask to pause outreach",
      },
    ],
  },
  {
    name: "30–90 days out",
    status: "scheduled",
    language: "en",
    ownerKey: "diego",
    createdDaysAgo: 8,
    scheduledInDays: 2,
    audience: { label: "Leads whose timeline is 30 to 90 days away", type: "thirty_to_ninety_out" },
    audienceSize: 9,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Not buying yet — that's alright, {{first_name}}",
        body: `Hi {{first_name}},\n\nNo need to rush anything on our end. I'll check in as your timeline gets closer so nothing catches you off guard.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "task",
        delayDays: 30,
        subject: "Check back in — 30-90 day lead",
        body: "Timeline should be closer now. Confirm nothing changed and see if it's time to start the paperwork.",
      },
      {
        channel: "email",
        delayDays: 60,
        subject: "Getting closer to your timeline?",
        body: `Hi {{first_name}},\n\nJust checking — is the timeline still holding? Happy to get preapproval started whenever you're ready.\n\n${STEP_FOOTER}`,
        stopCondition: "They're ready to start, or ask to pause outreach",
      },
    ],
  },
  {
    name: "90+ days out",
    status: "draft",
    language: "en",
    ownerKey: "grace",
    createdDaysAgo: 3,
    audience: { label: "Leads whose timeline is more than 90 days away", type: "ninety_plus_out" },
    audienceSize: 6,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        subject: "No rush, {{first_name}} — I'll be here",
        body: `Hi {{first_name}},\n\nSounds like it's still early days for you, and that's completely fine. I'll drop a note every so often — nothing that needs a reply unless you want to.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 45,
        subject: "Just checking the timeline hasn't moved",
        body: `Hi {{first_name}},\n\nStill on the same timeline, or has anything shifted? No wrong answer — just want to stay useful.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 90,
        subject: "Getting closer?",
        body: `Hi {{first_name}},\n\nIt's been a few months — worth a short call to see where things stand and whether preapproval makes sense yet?\n\n${STEP_FOOTER}`,
        stopCondition: "They're ready to start, or ask to pause outreach",
      },
    ],
  },
  {
    name: "Preapproved buyer",
    status: "running",
    language: "en",
    ownerKey: "minh",
    createdDaysAgo: 40,
    audience: { label: "Borrowers with a freshly issued preapproval", type: "preapproved_buyer" },
    audienceSize: 16,
    sentCount: 15,
    openCount: 11,
    replyCount: 6,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-007",
        subject: "You're preapproved, {{first_name}} — house-hunting kit inside",
        body: `Hi {{first_name}},\n\nYour preapproval letter is attached — congratulations, you're officially house-hunting. A few things that make the next few weeks easier are inside.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 3,
        subject: null,
        body: "Hi {{first_name}} — send me any listing and I'll run real payment numbers on it, usually same day. Reply STOP to opt out.",
      },
      {
        channel: "email",
        delayDays: 14,
        subject: "Still house hunting?",
        body: `Hi {{first_name}},\n\nJust checking in — still looking? Happy to run numbers on anything you've found, seriously considered or not.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "task",
        delayDays: 21,
        subject: "Check-in call — preapproval refresh due soon",
        body: "Preapproval is a few weeks old. Confirm nothing has changed financially and flag the refresh conversation before it lapses.",
      },
    ],
  },
  {
    name: "Contract received",
    status: "running",
    language: "en",
    ownerKey: "carlos",
    createdDaysAgo: 6,
    audience: { label: "Borrowers whose purchase contract was just received", type: "contract_received" },
    audienceSize: 8,
    sentCount: 7,
    openCount: 6,
    replyCount: 3,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Congratulations on your accepted offer, {{first_name}}",
        body: `Hi {{first_name}},\n\nCongratulations — the offer is accepted and we're officially under contract. Here's exactly what happens next and whose court the ball is in at each step.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "task",
        delayDays: 0,
        subject: "Notify {{partner_name}} — contract received",
        body: "Loop the agent in the same day: contract received, file moving to processing.",
      },
      {
        channel: "email",
        delayDays: 7,
        subject: "What's happening in underwriting this week",
        body: `Hi {{first_name}},\n\nQuick update: your file is in underwriting, and here's what's normal to expect this week (a few follow-up questions is not a red flag).\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 14,
        subject: null,
        body: "Hi {{first_name}} — appraisal update: here's where things stand on your file. Reply here with any questions. Reply STOP to opt out.",
        stopCondition: "Loan moves to Closed",
      },
    ],
  },
  {
    name: "Ready to refinance",
    status: "scheduled",
    language: "en",
    ownerKey: "priya",
    createdDaysAgo: 4,
    scheduledInDays: 3,
    audience: { label: "Past clients flagged as ready to refinance", type: "ready_to_refinance" },
    audienceSize: 11,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Is now the right time to refinance, {{first_name}}?",
        body: `Hi {{first_name}},\n\nRates have moved enough that it's worth a look at your specific loan. No pressure either way — sometimes the honest answer is "not yet."\n\n${STEP_FOOTER}`,
      },
      {
        channel: "call",
        delayDays: 2,
        subject: "Call {{first_name}} — refinance readiness",
        body: "Confirm current rate, remaining balance, and how long they plan to stay in the home before running real numbers.",
      },
      {
        channel: "email",
        delayDays: 10,
        subject: "Here's what the numbers actually look like",
        body: `Hi {{first_name}},\n\nRan your numbers — here's the honest comparison between staying put and refinancing, side by side.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or decide refinancing doesn't make sense right now",
      },
    ],
  },
  {
    name: "Loan milestone updates",
    status: "running",
    language: "en",
    ownerKey: "tom",
    createdDaysAgo: 50,
    audience: { label: "Borrowers in an active loan, submitted through clear-to-close", type: "loan_milestones" },
    audienceSize: 22,
    sentCount: 20,
    openCount: 15,
    replyCount: 4,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-022",
        subject: "Submitted to underwriting, {{first_name}}",
        body: `Hi {{first_name}},\n\nYour file just moved to underwriting. This is where the numbers get a careful second look — a few follow-up questions along the way is completely normal.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 7,
        templateRef: "EMT-024",
        subject: "Conditional approval — here's what's left",
        body: `Hi {{first_name}},\n\nGood news: conditional approval. Here's the short list of items still needed to get to clear-to-close.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 14,
        templateRef: "EMT-039",
        subject: "Clear to close, {{first_name}}",
        body: `Hi {{first_name}},\n\nYou're clear to close. Next step is scheduling your signing — I'll be in touch with the date and time shortly.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 15,
        templateRef: "EMT-126",
        subject: null,
        body: "Important: wire fraud is real. Before you wire any closing funds, call your title company directly using a number you look up yourself — never one from an email. Reply STOP to opt out.",
        stopCondition: "Loan moves to Closed",
      },
    ],
  },
  {
    name: "First-year homeowner follow-up",
    status: "running",
    language: "en",
    ownerKey: "elena",
    createdDaysAgo: 60,
    audience: { label: "Borrowers in their first year of homeownership", type: "first_year_followup" },
    audienceSize: 15,
    sentCount: 14,
    openCount: 9,
    replyCount: 3,
    steps: [
      {
        channel: "email",
        delayDays: 7,
        templateRef: "EMT-127",
        subject: "One week after closing, {{first_name}}",
        body: `Hi {{first_name}},\n\nOne week in as a homeowner — how's it feeling? A quick note on where your first payment goes and what to expect from your servicer.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 30,
        templateRef: "EMT-128",
        subject: "Thirty-day check-in",
        body: `Hi {{first_name}},\n\nA month in — any surprises so far? Happy to explain anything on your statement that looks unfamiliar.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 180,
        templateRef: "EMT-129",
        subject: "Six-month mortgage review",
        body: `Hi {{first_name}},\n\nHalfway through your first year — a good moment to make sure escrow, insurance, and your rate are all still lining up the way we expected.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 365,
        templateRef: "EMT-130",
        subject: "Happy home anniversary, {{first_name}}",
        body: `Hi {{first_name}},\n\nHappy home anniversary! One year in — worth a short, no-obligation review to see if anything's worth acting on.\n\n${STEP_FOOTER}`,
      },
    ],
  },
  {
    name: "Annual mortgage review",
    status: "running",
    language: "en",
    ownerKey: "marcus",
    createdDaysAgo: 45,
    audience: { label: "Past clients due their annual mortgage review", type: "annual_review" },
    audienceSize: 18,
    sentCount: 17,
    openCount: 12,
    replyCount: 5,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-131",
        subject: "Time for your annual review, {{first_name}}",
        body: `Hi {{first_name}},\n\nOnce a year I offer past clients a short, no-obligation review — your rate, your equity, and whether anything's worth acting on. Most years the answer is "you're in good shape," and that's a fine answer.\n\n${STEP_FOOTER}`,
      },
      {
        // Russian sibling of the intro step — same channel and delay.
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        subject: "Время для ежегодного обзора, {{first_name}}",
        body: `Здравствуйте, {{first_name}}!\n\nРаз в год я предлагаю клиентам короткий, необязательный обзор: ставка, капитал в доме и стоит ли что-то предпринять. Чаще всего ответ — "всё в порядке", и это тоже хороший результат.\n\n${STEP_FOOTER}`,
        language: "ru",
      },
      {
        channel: "task",
        delayDays: 3,
        subject: "Call {{first_name}} — schedule annual review",
        body: "No reply to the email yet. A short call to schedule usually works better than a second email.",
      },
      {
        channel: "email",
        delayDays: 14,
        subject: "Last call for your annual review this year",
        body: `Hi {{first_name}},\n\nStill happy to do a quick review whenever works for you — no expiration on the offer, just a gentle nudge.\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, book a call, or ask to skip this year",
      },
    ],
  },
  {
    name: "Refinance opportunity",
    status: "draft",
    language: "en",
    ownerKey: "thuy",
    createdDaysAgo: 2,
    audience: { label: "Past clients whose current rate is above today's market", type: "refinance_opportunity" },
    audienceSize: 13,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-132",
        subject: "Rates moved — worth a look, {{first_name}}?",
        body: `Hi {{first_name}},\n\nYour current rate is meaningfully above where things are today. Might be worth ten minutes to see if a refinance actually pencils out for you.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 3,
        subject: null,
        body: "Hi {{first_name}} — want me to run your specific numbers? Two minutes is all it takes. Reply STOP to opt out.",
      },
      {
        channel: "email",
        delayDays: 10,
        subject: "Here's what I found when I ran your numbers",
        body: `Hi {{first_name}},\n\nRan the numbers on your file — here's the honest comparison, savings and costs both included.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "call",
        delayDays: 14,
        subject: "Call {{first_name}} — refinance opportunity follow-up",
        body: "Confirm they saw the numbers and answer questions about closing costs and breakeven timing.",
        stopCondition: "They reply, or decide refinancing doesn't make sense right now",
      },
    ],
  },
  {
    name: "Past-client retention",
    status: "running",
    language: "en",
    ownerKey: "rebecca",
    createdDaysAgo: 70,
    audience: { label: "Past clients with no active reason to hear from us", type: "past_client_retention" },
    audienceSize: 20,
    sentCount: 19,
    openCount: 11,
    replyCount: 3,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        subject: "Just checking in, {{first_name}}",
        body: `Hi {{first_name}},\n\nNo agenda — just a genuine check-in. How's the house treating you, and is there anything mortgage-related I can help with?\n\n${STEP_FOOTER}`,
      },
      {
        channel: "video",
        delayDays: 14,
        subject: "A quick market update just for you",
        body: `Hi {{first_name}},\n\nRecorded a short update on what's happening with rates and home values in your area — three minutes, no ask attached.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "email",
        delayDays: 60,
        subject: "Anything changed on your end?",
        body: `Hi {{first_name}},\n\nJust making sure I'm still useful to you — anything changed with your plans, your payment, or your property this year?\n\n${STEP_FOOTER}`,
      },
    ],
  },
  {
    name: "Referral-partner nurture",
    status: "running",
    language: "en",
    ownerKey: "diego",
    createdDaysAgo: 35,
    audience: { label: "All active referral partners", type: "referral_partner_nurture" },
    audienceSize: 17,
    sentCount: 16,
    openCount: 10,
    replyCount: 5,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-057",
        subject: "This month's snapshot for your buyers, {{partner_name}}",
        body: `Hi {{partner_name}},\n\nHere's this month's snapshot for your buyers: inventory, preapproval turn times, and one financing option first-timers may not know about.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "sms",
        delayDays: 14,
        subject: null,
        body: "Hi {{partner_name}} — {{loan_officer_name}} at Loan Factory. Any buyers stuck on financing I can help un-stick? Reply STOP to opt out.",
      },
      {
        channel: "email",
        delayDays: 30,
        subject: "Next month's numbers, and a quick favor",
        body: `Hi {{partner_name}},\n\nNext month's numbers are attached. If you have five minutes, I'd love a quick review — it helps other agents find me too.\n\n${STEP_FOOTER}`,
      },
    ],
  },
  {
    name: "Hot-list partner prospecting",
    status: "draft",
    language: "en",
    ownerKey: "grace",
    createdDaysAgo: 1,
    audience: { label: "High-producing agents identified but never contacted", type: "hot_list_prospecting" },
    audienceSize: 5,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        subject: "Introducing myself, {{partner_name}}",
        body: `Hi {{partner_name}},\n\nI work with a lot of buyers in your market and would welcome the chance to be a resource for your listings — fast preapproval turnarounds, straight answers, no runaround.\n\n${STEP_FOOTER}`,
        stopCondition: "They respond, or two attempts pass with no reply",
      },
      {
        channel: "task",
        delayDays: 3,
        subject: "Follow-up call — hot-list partner, no reply yet",
        body: "No response to the introduction email. A short, low-pressure call to introduce myself directly often lands better than a second email.",
      },
      {
        channel: "email",
        delayDays: 10,
        subject: "One more try — worth 15 minutes?",
        body: `Hi {{partner_name}},\n\nLast note from me on this — if 15 minutes ever makes sense to compare notes on financing for your buyers, I'm easy to reach.\n\n${STEP_FOOTER}`,
        stopCondition: "They respond, or two attempts pass with no reply",
      },
    ],
  },
  {
    name: "Quiet-partner reactivation",
    status: "scheduled",
    language: "en",
    ownerKey: "minh",
    createdDaysAgo: 5,
    scheduledInDays: 4,
    audience: { label: "Partners who have gone quiet for 60+ days", type: "quiet_partner_reactivation" },
    audienceSize: 8,
    steps: [
      {
        channel: "email",
        delayDays: 0,
        sendTime: "09:00",
        templateRef: "EMT-059",
        subject: "It's been a while, {{partner_name}} — here's what's new",
        body: `Hi {{partner_name}},\n\nIt's been a bit since we last connected — wanted to share a co-branded flyer and a couple of program updates that might help your current listings.\n\n${STEP_FOOTER}`,
      },
      {
        channel: "call",
        delayDays: 5,
        subject: "Call {{partner_name}} — reactivation follow-up",
        body: "Keep it light — no guilt trip about the quiet stretch, just a genuine offer to be useful again.",
      },
      {
        channel: "email",
        delayDays: 20,
        subject: "One more idea for your listings",
        body: `Hi {{partner_name}},\n\nOne more idea that's worked well for other agents: a same-weekend preapproval turnaround for open-house sign-ins. Want a set of flyers for your next one?\n\n${STEP_FOOTER}`,
        stopCondition: "They reply, or ask to be taken off outreach",
      },
    ],
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
  /** Extra plain-language conditions that must hold for a lead to enroll. */
  conditions?: string;
  /** How the incoming lead's owner is chosen (e.g. "Round-robin", a name). */
  ownerAssignment?: string;
  /** Plain-language delay before the first step fires. */
  startDelayText?: string;
  /** What halts an in-flight enrollment (e.g. "They reply" / "They book a call"). */
  stopConditions?: string;
  /** Whether a person can re-enter, and when (e.g. "Once only" / "After 90 days"). */
  reentryRule?: string;
  runCount: number;
  lastRunDaysAgo?: number;
  runs: {
    personKey: string;
    status: "completed" | "queued_for_approval" | "skipped" | "failed";
    outcome: string;
    daysAgo: number;
    stoppedReason?: string;
  }[];
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

  // --- New-trigger automations: form submissions, a partner CRM referral hook,
  // and a contract-received lifecycle moment (M7) ---------------------------
  {
    ref: "L-07",
    name: "Jotform submission",
    description:
      "A website form filled out on Jotform becomes a routed, welcomed lead the moment it lands.",
    triggerText: "A new submission arrives on a Jotform",
    audienceText: "The person who submitted the form",
    actionText: "Create the lead, enroll them in the New internet lead nurture, and create a call task",
    tier: "t2",
    status: "active",
    source: "jotform",
    campaignName: "New internet lead",
    conditions: "Only when the submission includes a valid email or phone number",
    startDelayText: "Immediately on submission",
    stopConditions: "They reply, or a teammate reaches out first",
    reentryRule: "Once every 90 days from the same email address",
    timingText: "Within 5 minutes",
    runCount: 15,
    lastRunDaysAgo: 1,
    runs: [
      {
        personKey: "obrien",
        status: "completed",
        outcome:
          "Enrolled Casey O'Brien in 'New internet lead' after a Jotform submission and created a call task.",
        daysAgo: 1,
      },
      {
        personKey: "harrington",
        status: "queued_for_approval",
        outcome: "Welcome draft ready for Grant Harrington — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "L-08",
    name: "Google Form submission",
    description:
      "Same welcome as any other web form — Google Forms just collected it. The owner is assigned by hand until routing rules exist for this source.",
    triggerText: "A new submission arrives on a Google Form",
    audienceText: "The person who submitted the form",
    actionText: "Create the lead, assign the owner, and enroll them in the New internet lead nurture",
    tier: "t2",
    status: "active",
    source: "google form",
    campaignName: "New internet lead",
    conditions: "Only when the form includes a valid email or phone number",
    ownerAssignment: "Grace Kimball",
    startDelayText: "Wait 10 minutes after submission, so a duplicate double-click doesn't create two leads",
    stopConditions: "They reply to the welcome, or a teammate reaches out first",
    reentryRule: "Once only per email address, ever",
    timingText: "Within 15 minutes",
    runCount: 6,
    lastRunDaysAgo: 1,
    runs: [
      {
        personKey: "delgado",
        status: "completed",
        outcome:
          "Enrolled Isabela Delgado in 'New internet lead' after a Google Form submission; owner assigned to Grace Kimball.",
        daysAgo: 1,
      },
      {
        personKey: "castaneda",
        status: "skipped",
        outcome: "Skipped — Emilio Castañeda already has an active file with the team.",
        daysAgo: 3,
        stoppedReason: "Existing active file",
      },
    ],
  },
  {
    ref: "L-09",
    name: "Follow Up Boss referral",
    description:
      "A referral a partner logs in their own Follow Up Boss account arrives here through the connected pipe.",
    triggerText: "A partner logs a referral in Follow Up Boss",
    audienceText: "The referred buyer or seller",
    actionText: "Enroll them in the Referral-partner nurture campaign and notify the partner it arrived",
    tier: "t2",
    status: "active",
    source: "follow up boss referral",
    campaignName: "Referral-partner nurture",
    timingText: "Within 15 minutes",
    runCount: 5,
    lastRunDaysAgo: 2,
    runs: [
      {
        personKey: "watts",
        status: "completed",
        outcome:
          "Enrolled Julia Watts in 'Referral-partner nurture' after a Follow Up Boss referral; notified the partner it arrived.",
        daysAgo: 2,
      },
      {
        personKey: "moreno",
        status: "queued_for_approval",
        outcome: "Referral welcome draft ready for Rocío Moreno — nothing was sent; it is waiting for your approval.",
        daysAgo: 0,
      },
    ],
  },
  {
    ref: "E-04",
    name: "Contract received",
    description: "A signed purchase contract changes the conversation — this keeps the borrower and their agent moving together.",
    triggerText: "A borrower's purchase contract is received",
    audienceText: "The borrower under contract",
    actionText: "Enroll them in the Contract received campaign and notify their agent",
    tier: "t2",
    status: "active",
    source: "contract received",
    campaignName: "Contract received",
    timingText: "Within the hour",
    runCount: 4,
    lastRunDaysAgo: 0,
    runs: [
      {
        personKey: "santos",
        status: "failed",
        outcome:
          "Didn't run — the linked template was deleted before it could draft anything. Nothing was sent.",
        daysAgo: 0,
        stoppedReason: "Template deleted",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// AI personas — per-user context for the assistant (Settings → AI persona).
//
// Personas are private per owner (ai_persona.user_id is unique, RLS pins each
// row to its owner). This is an honest mock: instructions/tone/preferences are
// guidance the assistant may use for voice — never commands, and never a way
// to bypass compliance, approvals, or what the user is allowed to see.
// ---------------------------------------------------------------------------

export type SeedPersona = {
  /** DEMO_LOS key ("minh", "carlos", …) or "linh" for the team leader. */
  userKey: string;
  enabled: boolean;
  instructions: string;
  tone: string;
  preferWords: string[];
  avoidWords: string[];
  complianceNotes: string;
  sampleText: string;
  /** Present only for the one document-based persona; the rest are instructions-only. */
  file?: { filename: string; mime: string; sizeBytes: number; extractedText: string };
};

export const PERSONAS: SeedPersona[] = [
  {
    // Document persona: Minh uploaded a short "how I write" guide, so the
    // extracted text sits alongside his instructions/tone fields.
    userKey: "minh",
    enabled: true,
    instructions:
      "Write like I talk: short sentences, first person, no jargon. Always close with a plan for what happens next, and sign with my name and NMLS number. If a borrower asks about rates, don't guess — suggest a quick call instead.",
    tone: "warm and direct",
    preferWords: ["plan for", "map this out", "straight answer", "no surprises"],
    avoidWords: ["guarantee", "promise", "definitely will", "lock in" ],
    complianceNotes:
      "Never quote a rate or payment number in a draft; suggest a call for rate-lock questions. Never promise a closing date before clear-to-close.",
    sampleText:
      "Hi Diego,\n\nGood question — let's map this out together rather than guess. I'll pull your file and call you this afternoon with a real plan for the next two weeks.\n\nMinh Nguyen\nNMLS 1856432",
    file: {
      filename: "how-i-write-with-clients.docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sizeBytes: 21_840,
      extractedText:
        "How I write to clients:\n\n1. Short sentences. If I can cut a word, I cut it.\n2. First person, always — never \"our team\" when I mean me.\n3. End every message with a plan: what happens next, and who does it.\n4. Never quote a rate in writing. Rates move; a written number becomes a promise I can't keep. Offer a call instead.\n5. Sign off with my name and NMLS number, every time, even in a text.\n6. If I don't know something, I say so and tell them when I'll have an answer — never guess to sound confident.",
    },
  },
  {
    userKey: "linh",
    enabled: true,
    instructions:
      "I lead the team, so my messages sometimes speak for the branch, not just me — keep that in mind when drafting for me. Keep it encouraging and calm; our borrowers are often anxious first-time buyers. Always mention that questions are welcome, and never rush someone toward a decision.",
    tone: "calm and encouraging",
    preferWords: ["let's map this out", "take your time", "here to help", "no wrong questions"],
    avoidWords: ["guarantee", "promise", "hurry", "you should have"],
    complianceNotes:
      "Never quote a rate; suggest a call for rate-lock questions. As team leader, never imply a teammate's file is behind without checking with them first.",
    sampleText:
      "Hi everyone,\n\nNo wrong questions here — if something on your file feels unclear, ask. Let's map out the next two weeks together so nothing catches you off guard.\n\nLinh Trần\nNMLS 1902244",
  },
  {
    // Carlos Mendoza — the ES-speaking LO; instructions-only, no uploaded file.
    userKey: "carlos",
    enabled: true,
    instructions:
      "Most of my clients read best in Spanish, so default to a warm, respectful tone in either language depending on who I'm writing to. Use 'usted' rather than 'tú' unless the client is clearly younger and casual. Keep messages short enough to read on a phone in one glance.",
    tone: "warm and respectful",
    preferWords: ["plan for", "map this out", "con gusto", "paso a paso"],
    avoidWords: ["guarantee", "promise", "garantizar", "prometer"],
    complianceNotes:
      "Never quote a rate; suggest a call for rate-lock questions. Spanish-language drafts still require a human translation review before anything sends.",
    sampleText:
      "Hola María,\n\nCon gusto revisamos esto juntos — vamos paso a paso para que no se le escape nada. La llamo esta tarde con un plan claro.\n\nCarlos Mendoza\nNMLS 1764201",
  },
];

// ---------------------------------------------------------------------------
// Integrations — tenant-wide connections, lead-source mappings, and the
// import/failure event log (M4/M7). HONEST BY CONSTRUCTION: every connection
// below is 'preview' or 'paused' — never 'connected' — and config only ever
// holds non-secret metadata. No OAuth token exists anywhere in this build.
// ---------------------------------------------------------------------------

export type SeedIntegrationConnection = {
  provider: "gmail" | "google_calendar" | "zapier_mcp";
  status: "preview" | "paused";
  displayName: string;
  config?: Record<string, unknown>;
};

export const INTEGRATION_CONNECTIONS: SeedIntegrationConnection[] = [
  {
    provider: "gmail",
    status: "preview",
    displayName: "Gmail",
    config: { accountEmail: "ops@loanfactory.com" },
  },
  {
    provider: "google_calendar",
    status: "paused",
    displayName: "Google Calendar",
    config: { accountEmail: "ops@loanfactory.com" },
  },
  {
    provider: "zapier_mcp",
    status: "preview",
    displayName: "Zapier MCP",
    config: { accountEmail: "ops@loanfactory.com" },
  },
];

export type SeedLeadSourceMapping = {
  sourceKey: string;
  name: string;
  /** DEMO_LOS key for the default owner. */
  ownerKey: string;
  leadSource: string;
  /** Resolved to campaignId at seed time, once every campaign exists. */
  campaignName?: string;
  /** Resolved to automationId at seed time via each automation's `ref`. */
  automationRef?: string;
  tags: string[];
  preferredLanguage: "en" | "vi" | "zh" | "es" | "ru";
  fieldMap: Record<string, string>;
  notifyRule: string;
  active: boolean;
};

/** One per source; the connectionId is always the tenant's zapier_mcp row. */
export const LEAD_SOURCE_MAPPINGS: SeedLeadSourceMapping[] = [
  {
    sourceKey: "facebook_lead_ads",
    name: "Facebook Lead Ads — Purchase",
    ownerKey: "carlos",
    leadSource: "facebook_ads",
    campaignName: "Facebook lead",
    automationRef: "L-03",
    tags: ["paid-social", "purchase"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
  {
    sourceKey: "instagram_lead_ads",
    name: "Instagram Lead Ads — Purchase",
    ownerKey: "priya",
    leadSource: "instagram_ads",
    campaignName: "Instagram lead",
    automationRef: "L-04",
    tags: ["paid-social", "purchase"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
  {
    sourceKey: "jotform",
    name: "Jotform — Website Intake",
    ownerKey: "minh",
    leadSource: "website",
    campaignName: "New internet lead",
    automationRef: "L-07",
    tags: ["form", "website"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
  {
    sourceKey: "google_forms",
    name: "Google Forms — Rate Sheet Signup",
    ownerKey: "grace",
    leadSource: "website",
    campaignName: "New internet lead",
    automationRef: "L-08",
    tags: ["form", "website"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    // Paused for variety — not every mapping stays active forever.
    active: false,
  },
  {
    sourceKey: "follow_up_boss",
    name: "Follow Up Boss — Partner Referrals",
    ownerKey: "diego",
    leadSource: "partner_referral",
    campaignName: "Referral-partner nurture",
    automationRef: "L-09",
    tags: ["partner", "referral"],
    preferredLanguage: "es",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
  {
    sourceKey: "website_forms",
    name: "Loan Factory Website — Contact Form",
    ownerKey: "tom",
    leadSource: "lf_website",
    campaignName: "New internet lead",
    automationRef: "L-05",
    tags: ["form", "website"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
  {
    sourceKey: "open_house_forms",
    name: "Open House Sign-In — Sheets",
    ownerKey: "marcus",
    leadSource: "open_house",
    campaignName: "Open-house lead",
    automationRef: "L-06",
    tags: ["open-house", "purchase"],
    preferredLanguage: "en",
    fieldMap: { full_name: "name", email: "email", phone: "phone" },
    notifyRule: "Notify the owner within 5 minutes",
    active: true,
  },
];

export type SeedIntegrationEvent = {
  kind: string;
  status: string;
  summary: string;
  detail: Record<string, unknown>;
  hoursAgo: number;
  /** Resolved to mappingId at seed time, when the event ties to one source. */
  mappingSourceKey?: string;
};

/**
 * Append-only import/failure log for the zapier_mcp connection. At least one
 * `failure` row exists so the Retry button on the Zapier settings page has
 * something real to act on.
 */
export const INTEGRATION_EVENTS: SeedIntegrationEvent[] = [
  {
    kind: "lead.imported",
    status: "imported",
    summary: "Imported a Facebook lead — routed to Minh Nguyen",
    detail: {
      full_name: "Priya Sandhu",
      email: "priya.sandhu@example.com",
      phone: "(425) 555-0519",
      source: "facebook_lead_ads",
    },
    hoursAgo: 2,
    mappingSourceKey: "facebook_lead_ads",
  },
  {
    kind: "lead.imported",
    status: "imported",
    summary: "Imported a Facebook lead — routed to Minh Nguyen",
    detail: {
      full_name: "Nikolai Popov",
      email: "nikolai.popov@example.com",
      phone: "(425) 555-0521",
      source: "facebook_lead_ads",
    },
    hoursAgo: 20,
    mappingSourceKey: "facebook_lead_ads",
  },
  {
    kind: "lead.imported",
    status: "imported",
    summary: "Imported an Instagram lead — routed to Priya Sharma",
    detail: {
      full_name: "Wei Chen",
      email: "wei.chen@example.com",
      phone: "(425) 555-0175",
      source: "instagram_lead_ads",
    },
    hoursAgo: 30,
    mappingSourceKey: "instagram_lead_ads",
  },
  {
    kind: "lead.imported",
    status: "imported",
    summary: "Imported a Jotform submission — routed to Minh Nguyen",
    detail: {
      full_name: "Casey O'Brien",
      email: "casey.obrien@example.com",
      phone: "(425) 555-0504",
      source: "jotform",
    },
    hoursAgo: 40,
    mappingSourceKey: "jotform",
  },
  {
    kind: "lead.imported",
    status: "imported",
    summary: "Imported an open-house sign-in — routed to Marcus Boyd",
    detail: {
      full_name: "Tuấn Bùi",
      email: "tuan.bui@example.com",
      phone: "(425) 555-0126",
      source: "open_house_forms",
    },
    hoursAgo: 50,
    mappingSourceKey: "open_house_forms",
  },
  {
    kind: "test_event",
    status: "received",
    summary: "Test event — sample lead received; nothing was imported to a live system.",
    detail: {
      simulated: true,
      sample: {
        name: "Jordan Rivera",
        email: "jordan.rivera@example.com",
        phone: "(555) 010-0148",
        source: "facebook_lead_ads",
      },
    },
    hoursAgo: 60,
  },
  {
    kind: "failure",
    status: "failed",
    summary: "Couldn't map the incoming payload — missing email; nothing was imported",
    detail: {
      full_name: "Unknown Submitter",
      phone: "(206) 555-0199",
      source: "google_forms",
    },
    hoursAgo: 70,
    mappingSourceKey: "google_forms",
  },
];
