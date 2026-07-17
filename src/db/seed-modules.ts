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
  tier: "core" | "growing" | "quiet" | "new";
  email: string;
  phone: string;
  lastTouchDaysAgo: number;
  notesSummary: string;
  /** Person keys from seed-data.ts that this partner referred. */
  referred: string[];
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
    referred: ["kim", "santos"],
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
    referred: ["rodriguez", "alvarez"],
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
    referred: ["nguyen"],
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
    referred: ["gallagher"],
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
    referred: [],
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
];

export type SeedThread = {
  personKey?: string;
  partnerKey?: string;
  subject: string;
  channel: "email" | "sms" | "call";
  messages: {
    direction: "inbound" | "outbound";
    body: string;
    hoursAgo: number;
    status?: "received" | "sent" | "awaiting_approval" | "draft";
    preparedByAlly?: boolean;
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
];

/**
 * Ally's pending drafts. Every one is a proposal awaiting a human — nothing
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
  templateRef: string;
  audience: { label: string; type: string };
  audienceSize: number;
  scheduledInDays?: number;
  sentCount?: number;
  openCount?: number;
  replyCount?: number;
};

export const CAMPAIGNS: SeedCampaign[] = [
  {
    name: "Past client check-in — summer",
    status: "finished",
    templateRef: "EMT-104",
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
    audience: { label: "Borrowers whose preapproval expires within 30 days", type: "preapproval_expiring" },
    audienceSize: 2,
    scheduledInDays: 2,
  },
  {
    name: "Anniversary wishes — August closings",
    status: "draft",
    templateRef: "EMT-105",
    audience: { label: "Past clients with an August closing anniversary", type: "anniversary" },
    audienceSize: 3,
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
  runCount: number;
  lastRunDaysAgo?: number;
  runs: { personKey: string; status: "completed" | "queued_for_approval" | "skipped"; outcome: string; daysAgo: number; stoppedReason?: string }[];
};

export const AUTOMATIONS: SeedAutomation[] = [
  {
    ref: "A-01",
    name: "New lead — call reminder",
    description: "Nobody should sit uncalled. This keeps speed-to-lead honest.",
    triggerText: "A new lead is captured",
    audienceText: "Any new lead assigned to me",
    actionText: "Create a task to call them, and tell me right away",
    tier: "t1",
    status: "active",
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
      "When the team flags that a borrower still owes items, Ally drafts the nudge and waits for approval.",
    triggerText: "A file has been waiting on borrower documents for 2 days",
    audienceText: "The borrower on that file",
    actionText: "Ally drafts a reminder in their language — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-012",
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
    actionText: "Ally drafts a refresh offer — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-008",
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
    ref: "R-01",
    name: "Closing anniversary",
    description: "The cheapest referral you will ever earn.",
    triggerText: "It's a year since a client's loan funded",
    audienceText: "Past clients",
    actionText: "Ally drafts an anniversary note — you approve before it sends",
    tier: "t2",
    status: "active",
    templateRef: "EMT-105",
    runCount: 12,
    lastRunDaysAgo: 4,
    runs: [
      {
        personKey: "whitmore",
        status: "queued_for_approval",
        outcome: "Draft ready — one year since the Magnolia closing",
        daysAgo: 0,
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
      "Rate locks are never automated. Ally will not draft this — it only makes sure you know.",
    triggerText: "A rate lock expires within 3 days",
    audienceText: "Nobody — a human must handle this personally",
    actionText: "Create an urgent task and notify me. Ally drafts nothing.",
    tier: "t0",
    status: "active",
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
    actionText: "Ally drafts a reminder — you approve before it sends",
    tier: "t2",
    status: "paused",
    runCount: 3,
    lastRunDaysAgo: 30,
    runs: [],
  },
];
