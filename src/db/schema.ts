/**
 * Database schema — Data_Model.md §3.
 *
 * Conventions (Data_Model.md §Conventions): every table carries
 * `id uuid primary key`, `tenant_id uuid not null references tenant`,
 * `created_at`, `updated_at`; user-deletable records also carry `deleted_at`.
 *
 * Boundary (Decisions D-22): stage/milestone columns are CRM visibility and
 * communication-trigger metadata, entered by the team. They are never
 * loan-of-record data. SSN, credit scores, income, and assets are Restricted
 * and deliberately absent in every phase.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  date,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** The 8 CANON staff types (+admin). Borrowers are never users. */
export const userRole = pgEnum("user_role", [
  "lo",
  "lo_assistant",
  "processor",
  "team_leader",
  "branch_leader",
  "agent_rel_manager",
  "marketing_coordinator",
  "admin",
]);

export const userStatus = pgEnum("user_status", ["active", "invited", "disabled"]);

/** First-class per D-08: EN + VI are peers. */
export const language = pgEnum("language", ["en", "vi", "zh", "es", "ru"]);

export const personType = pgEnum("person_type", [
  "lead",
  "borrower",
  "past_client",
  "other",
]);

export const leadIntent = pgEnum("lead_intent", [
  "purchase",
  "refinance",
  "heloc",
  "quote",
  "rate_alert",
  "qualify",
  "unknown",
]);

/**
 * The pipeline opportunity lifecycle — Leads → Applications → Loans → Past
 * clients (a person becomes an applicant at prequalification).
 * Enum values never localize; display names live in the i18n layer.
 * The four-group phase is derived in src/lib/stages.ts, not a column.
 */
export const loanStage = pgEnum("loan_stage", [
  // LEADS
  "new_lead", // 1
  "contact_attempt", // 2
  "consultation_scheduled", // 3
  "consultation_completed", // 4
  "working_on_credit", // 5
  "thirty_to_ninety_out", // 6
  "ninety_plus_out", // 7
  // APPLICATIONS — a person becomes an applicant at prequalification
  "prequalification", // 8
  "preapproval", // 9
  "contract_received", // 10
  "ready_to_refinance", // 11
  // LOANS
  "submitted_to_processing", // 12
  "submitted_to_underwriting", // 13
  "conditional_approval", // 14
  "appraisal_ordered", // 15
  "appraisal_received", // 16
  "submitted_for_clear_to_close", // 17
  "clear_to_close", // 18  label: "Clear to close / Closing scheduled"
  // PAST CLIENTS
  "funded", // 19
  "first_year_followup", // 20
  "annual_review", // 21
  "refinance_opportunity", // 22
  "referral_and_retention", // 23
]);

export const loanStatus = pgEnum("loan_status", [
  "active",
  "funded",
  "lost",
  "withdrawn",
  "denied",
  "on_hold",
]);

export const loanPurpose = pgEnum("loan_purpose", [
  "purchase",
  "refinance",
  "cash_out_refi",
  "heloc",
  "construction",
  "other",
]);

export const taskStatus = pgEnum("task_status", ["open", "done", "cancelled"]);
export const taskPriority = pgEnum("task_priority", ["low", "normal", "high"]);

export const appointmentKind = pgEnum("appointment_kind", [
  "consultation",
  "call",
  "closing",
  "other",
]);

/** AI proposes; a human disposes. Never "sent" without a human verdict. */
export const insightKind = pgEnum("insight_kind", [
  "briefing",
  "next_best_action",
  "draft_email",
  "draft_sms",
  "call_prep",
  "summary",
]);

export const insightStatus = pgEnum("insight_status", [
  "pending",
  "approved",
  "edited_approved",
  "rejected",
  "snoozed",
  "expired",
]);

/** Safe-automation tiers — canonical ladder, Automation_Catalog.md §1. */
export const autonomyTier = pgEnum("autonomy_tier", ["t0", "t1", "t2", "t3"]);

// ---------------------------------------------------------------------------
// Tenancy & identity
// ---------------------------------------------------------------------------

export const tenant = pgTable("tenant", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  companyNmls: text("company_nmls"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  plan: text("plan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const team = pgTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenant.id),
  name: text("name").notNull(),
  leaderUserId: uuid("leader_user_id"),
  branch: text("branch"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    /** Seam for Supabase Auth (Technical_Architecture §1); local auth fills it with our own id. */
    authUserId: uuid("auth_user_id"),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    nmlsId: text("nmls_id"),
    role: userRole("role").notNull(),
    teamId: uuid("team_id").references(() => team.id),
    language: language("language").notNull().default("en"),
    websiteUrl: text("website_url"),
    status: userStatus("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    // --- Personal profile (Settings → My profile) ---
    /** Job title shown on the profile and available to signatures. */
    title: text("title"),
    /** IANA timezone, e.g. America/Los_Angeles. */
    timezone: text("timezone"),
    /**
     * Profile photo as a validated data URL (jpeg/png/webp, ≤512KB source).
     * Stored in-row so RLS tenant-scopes it like every other user field; moves
     * to object storage when a provider is connected.
     */
    photoData: text("photo_data"),
    /** Plain-text email signature, merged into campaigns and approved sends. */
    signature: text("signature"),
    defaultSenderName: text("default_sender_name"),
    replyToEmail: text("reply_to_email"),
    /** Social/website links: { website?, linkedin?, facebook?, instagram? } */
    links: jsonb("links").$type<Record<string, string>>(),
    /** Notification preferences: { dailySummary?, taskReminders?, approvalAlerts?, teamActivity? } */
    notificationPrefs: jsonb("notification_prefs").$type<Record<string, boolean>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("user_tenant_email_idx").on(t.tenantId, t.email)],
);

// ---------------------------------------------------------------------------
// People & opportunities
// ---------------------------------------------------------------------------

export type EmailEntry = { address: string; label?: string; verified?: boolean };
export type PhoneEntry = { number: string; label?: string; smsCapable?: boolean };
export type Address = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

/**
 * Public online presence. Every value is a full URL the team entered or
 * approved — never scraped and saved silently. An absent key means "not added".
 */
export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
  other?: { label: string; url: string }[];
};

/** A public source the bio draft drew on — shown so the team can verify it. */
export type BioSource = { label: string; url?: string; note?: string };

export const person = pgTable(
  "person",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    emails: jsonb("emails").$type<EmailEntry[]>().notNull().default([]),
    phones: jsonb("phones").$type<PhoneEntry[]>().notNull().default([]),
    mailingAddress: jsonb("mailing_address").$type<Address>(),
    dateOfBirth: date("date_of_birth"),
    preferredLanguage: language("preferred_language").notNull().default("en"),
    type: personType("type").notNull().default("lead"),
    ownerUserId: uuid("owner_user_id").references(() => user.id),
    source: jsonb("source").$type<Record<string, unknown>>(),
    tags: text("tags").array(),
    /** Team-authored (or AI-drafted then approved) relationship bio. */
    bio: text("bio"),
    /** Public profile links — see SocialLinks. Approved, never auto-saved. */
    socialLinks: jsonb("social_links").$type<SocialLinks>().notNull().default({}),
    /** When the online-presence draft was last generated for this person. */
    bioResearchedAt: timestamp("bio_researched_at", { withTimezone: true }),
    /** The public sources the last draft cited. */
    bioSources: jsonb("bio_sources").$type<BioSource[]>().notNull().default([]),
    doNotContact: boolean("do_not_contact").notNull().default(false),
    complaintFlag: boolean("complaint_flag").notNull().default(false),
    complaintOpenedAt: timestamp("complaint_opened_at", { withTimezone: true }),
    mergedIntoPersonId: uuid("merged_into_person_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("person_tenant_owner_idx").on(t.tenantId, t.ownerUserId),
    index("person_tenant_name_idx").on(t.tenantId, t.lastName, t.firstName),
  ],
);

/**
 * An acquisition episode — not a parallel pipeline (Data_Model.md §3.5).
 * Locked rule: capturing a lead creates a `loan` row in the same transaction
 * at stage 1. There is exactly one lifecycle state machine: `loan.stage`.
 */
export const lead = pgTable(
  "lead",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    personId: uuid("person_id")
      .notNull()
      .references(() => person.id),
    loanId: uuid("loan_id").notNull(),
    source: jsonb("source").$type<{
      channel: string;
      campaign?: string;
      ad?: string;
      form?: string;
      widget?: string;
      detail?: string;
    }>(),
    intent: leadIntent("intent").notNull().default("unknown"),
    assignedUserId: uuid("assigned_user_id").references(() => user.id),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    statedPriceRange: text("stated_price_range"),
    statedLocation: text("stated_location"),
    /** Self-reported band only (e.g. "700-719"). Never a pulled score. */
    statedFicoRange: text("stated_fico_range"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_tenant_captured_idx").on(t.tenantId, t.capturedAt)],
);

export const loan = pgTable(
  "loan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    personId: uuid("person_id")
      .notNull()
      .references(() => person.id),
    loUserId: uuid("lo_user_id").references(() => user.id),
    processorUserId: uuid("processor_user_id").references(() => user.id),
    coordinatorUserId: uuid("coordinator_user_id").references(() => user.id),
    stage: loanStage("stage").notNull().default("new_lead"),
    status: loanStatus("status").notNull().default("active"),
    purpose: loanPurpose("purpose"),
    program: text("program"),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    propertyAddress: jsonb("property_address").$type<Address>(),
    propertyType: text("property_type"),
    occupancy: text("occupancy"),
    lenderName: text("lender_name"),
    loanNumber: text("loan_number"),
    // --- Visibility / trigger metadata (team-entered in v1) ---
    rateLockDate: date("rate_lock_date"),
    rateLockExpiresAt: date("rate_lock_expires_at"),
    appraisalOrderedAt: date("appraisal_ordered_at"),
    appraisalDueDate: date("appraisal_due_date"),
    appraisalReceivedAt: date("appraisal_received_at"),
    closingDate: date("closing_date"),
    fundedAt: date("funded_at"),
    preapprovalAmount: numeric("preapproval_amount", { precision: 12, scale: 2 }),
    preapprovalIssuedAt: date("preapproval_issued_at"),
    preapprovalExpiresAt: date("preapproval_expires_at"),
    sixElementsAt: timestamp("six_elements_at", { withTimezone: true }),
    leDueAt: timestamp("le_due_at", { withTimezone: true }),
    intentToProceedAt: timestamp("intent_to_proceed_at", { withTimezone: true }),
    disclosuresSentAt: timestamp("disclosures_sent_at", { withTimezone: true }),
    disclosuresSignedAt: timestamp("disclosures_signed_at", { withTimezone: true }),
    cdSentAt: timestamp("cd_sent_at", { withTimezone: true }),
    cdAcknowledgedAt: timestamp("cd_acknowledged_at", { withTimezone: true }),
    ctcIssuedAt: timestamp("ctc_issued_at", { withTimezone: true }),
    /** Communication flag only — the needs list itself lives in the LOS/POS. */
    docsNeeded: boolean("docs_needed").notNull().default(false),
    docsNeededSummary: text("docs_needed_summary"),
    docsNeededSince: timestamp("docs_needed_since", { withTimezone: true }),
    stalledSince: timestamp("stalled_since", { withTimezone: true }),
    lostReason: text("lost_reason"),
    applicationLink: text("application_link"),
    /** Reserved for future read-only external sync; source system record ids. */
    externalRefs: jsonb("external_refs").$type<Record<string, string>>(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("loan_tenant_stage_idx").on(t.tenantId, t.stage),
    index("loan_tenant_lo_idx").on(t.tenantId, t.loUserId),
    index("loan_tenant_lock_idx").on(t.tenantId, t.rateLockExpiresAt),
  ],
);

/** Immutable: every stage change writes a row in the same transaction. */
export const loanStageHistory = pgTable(
  "loan_stage_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    loanId: uuid("loan_id")
      .notNull()
      .references(() => loan.id),
    fromStage: loanStage("from_stage"),
    toStage: loanStage("to_stage").notNull(),
    changedByUserId: uuid("changed_by_user_id").references(() => user.id),
    note: text("note"),
    daysInPreviousStage: integer("days_in_previous_stage"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("stage_history_loan_idx").on(t.tenantId, t.loanId)],
);

// ---------------------------------------------------------------------------
// Work & memory
// ---------------------------------------------------------------------------

export const task = pgTable(
  "task",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    title: text("title").notNull(),
    detail: text("detail"),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => user.id),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: taskStatus("status").notNull().default("open"),
    priority: taskPriority("priority").notNull().default("normal"),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedByUserId: uuid("completed_by_user_id").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("task_tenant_owner_due_idx").on(t.tenantId, t.ownerUserId, t.dueAt)],
);

export const note = pgTable(
  "note",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    body: text("body").notNull(),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => user.id),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    /** Set when AI drafted the note; a human still saved it. */
    preparedByAi: boolean("prepared_by_ai").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("note_tenant_person_idx").on(t.tenantId, t.personId)],
);

export const appointment = pgTable(
  "appointment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    title: text("title").notNull(),
    kind: appointmentKind("kind").notNull().default("call"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    location: text("location"),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => user.id),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("appointment_tenant_owner_start_idx").on(t.tenantId, t.ownerUserId, t.startsAt)],
);

/** Domain events (Technical_Architecture §5.1) — the automation glue. */
export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    kind: text("kind").notNull(),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    actorUserId: uuid("actor_user_id").references(() => user.id),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("event_tenant_created_idx").on(t.tenantId, t.createdAt)],
);

// ---------------------------------------------------------------------------
// AI — everything AI proposes and every call it makes
// ---------------------------------------------------------------------------

export const aiInsight = pgTable(
  "ai_insight",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    kind: insightKind("kind").notNull(),
    status: insightStatus("status").notNull().default("pending"),
    /** The tier that governs this output; borrower-facing content caps at t2. */
    tier: autonomyTier("tier").notNull().default("t2"),
    forUserId: uuid("for_user_id")
      .notNull()
      .references(() => user.id),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    /** Card face: what AI prepared. */
    title: text("title").notNull(),
    body: text("body"),
    /** Plain-language "why is this here?" — source evidence, never a black box. */
    rationale: text("rationale").notNull(),
    /** The factors behind any score/ranking — fair-lending-safe only (D-11). */
    factors: jsonb("factors").$type<string[]>().default([]),
    templateRef: text("template_ref"),
    languageCode: language("language_code").notNull().default("en"),
    /** Populated on a human verdict — never by AI itself. */
    decidedByUserId: uuid("decided_by_user_id").references(() => user.id),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    decisionReason: text("decision_reason"),
    editedBody: text("edited_body"),
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("insight_tenant_user_status_idx").on(t.tenantId, t.forUserId, t.status)],
);

/** Immutable log of every model call and every human verdict on its output. */
export const aiActionLog = pgTable(
  "ai_action_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    insightId: uuid("insight_id").references(() => aiInsight.id),
    action: text("action").notNull(),
    model: text("model"),
    promptVersion: text("prompt_version"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    latencyMs: integer("latency_ms"),
    actorUserId: uuid("actor_user_id").references(() => user.id),
    detail: jsonb("detail").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_action_tenant_created_idx").on(t.tenantId, t.createdAt)],
);

// ---------------------------------------------------------------------------
// Partners — referral relationships (agents, and everyone else who sends business)
// ---------------------------------------------------------------------------

export const partnerKind = pgEnum("partner_kind", [
  "real_estate_agent",
  "builder",
  "financial_advisor",
  "attorney",
  "past_client",
  "other",
]);

/** Relationship health — the plain-language tiers used across Partners. */
export const partnerTier = pgEnum("partner_tier", ["target", "new", "growing", "core", "quiet"]);

export const partner = pgTable(
  "partner",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    kind: partnerKind("kind").notNull().default("real_estate_agent"),
    tier: partnerTier("tier").notNull().default("new"),
    emails: jsonb("emails").$type<EmailEntry[]>().notNull().default([]),
    phones: jsonb("phones").$type<PhoneEntry[]>().notNull().default([]),
    preferredLanguage: language("preferred_language").notNull().default("en"),
    ownerUserId: uuid("owner_user_id").references(() => user.id),
    /** Team-recorded relationship facts. */
    lastTouchAt: timestamp("last_touch_at", { withTimezone: true }),
    notesSummary: text("notes_summary"),
    /** Team-authored (or AI-drafted then approved) relationship bio. */
    bio: text("bio"),
    /** Public profile links — see SocialLinks. Approved, never auto-saved. */
    socialLinks: jsonb("social_links").$type<SocialLinks>().notNull().default({}),
    /** When the online-presence draft was last generated for this partner. */
    bioResearchedAt: timestamp("bio_researched_at", { withTimezone: true }),
    /** The public sources the last draft cited. */
    bioSources: jsonb("bio_sources").$type<BioSource[]>().notNull().default([]),
    doNotContact: boolean("do_not_contact").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("partner_tenant_owner_idx").on(t.tenantId, t.ownerUserId)],
);

/** Links a partner to the people/opportunities they sent. */
export const partnerRelationship = pgTable(
  "partner_relationship",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    partnerId: uuid("partner_id")
      .notNull()
      .references(() => partner.id),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    role: text("role").notNull().default("referred"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("partner_rel_tenant_partner_idx").on(t.tenantId, t.partnerId)],
);

// ---------------------------------------------------------------------------
// Conversations — every thread and message, all channels
// ---------------------------------------------------------------------------

export const channel = pgEnum("channel", ["email", "sms", "video", "app", "call", "note"]);
export const direction = pgEnum("direction", ["inbound", "outbound"]);
export const messageStatus = pgEnum("message_status", [
  "received",
  "draft",
  "awaiting_approval",
  "approved",
  "sent",
  "failed",
]);

export const conversation = pgTable(
  "conversation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    subject: text("subject"),
    channel: channel("channel").notNull().default("email"),
    personId: uuid("person_id").references(() => person.id),
    partnerId: uuid("partner_id").references(() => partner.id),
    loanId: uuid("loan_id").references(() => loan.id),
    ownerUserId: uuid("owner_user_id").references(() => user.id),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    /** Set when the newest inbound message has no outbound reply after it. */
    awaitingReply: boolean("awaiting_reply").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conversation_tenant_last_idx").on(t.tenantId, t.lastMessageAt)],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id),
    channel: channel("channel").notNull(),
    direction: direction("direction").notNull(),
    status: messageStatus("status").notNull().default("received"),
    subject: text("subject"),
    body: text("body").notNull(),
    /** Set when AI drafted it. A human still has to approve the send. */
    preparedByAi: boolean("prepared_by_ai").notNull().default(false),
    templateRef: text("template_ref"),
    languageCode: language("language_code").notNull().default("en"),
    authorUserId: uuid("author_user_id").references(() => user.id),
    approvedByUserId: uuid("approved_by_user_id").references(() => user.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    /** Call metadata: duration and outcome, when channel = call. */
    meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("message_tenant_conversation_idx").on(t.tenantId, t.conversationId)],
);

// ---------------------------------------------------------------------------
// Marketing — the EMT template library, audiences, campaigns
// ---------------------------------------------------------------------------

/** Governs whether AI may draft/queue this template at all. */
export const templatePolicy = pgEnum("template_policy", [
  "fully_automated",
  "semi_automated",
  "manual_only",
  "never_automate",
]);

export const template = pgTable(
  "template",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    /** EMT-001..135 from the committed communication framework. */
    ref: text("ref").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    channel: channel("channel").notNull().default("email"),
    subject: text("subject"),
    body: text("body").notNull(),
    policy: templatePolicy("policy").notNull().default("semi_automated"),
    /** The lifecycle stage this template belongs to, when it has one. */
    stage: loanStage("stage"),
    languageCode: language("language_code").notNull().default("en"),
    mergeFields: text("merge_fields").array(),
    complianceNotes: text("compliance_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("template_tenant_ref_idx").on(t.tenantId, t.ref)],
);

export const campaignStatus = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "running",
  "paused",
  "finished",
]);

export const campaign = pgTable(
  "campaign",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    name: text("name").notNull(),
    status: campaignStatus("status").notNull().default("draft"),
    templateId: uuid("template_id").references(() => template.id),
    /** Campaign copy language. English is the default; others are opt-in. */
    language: language("language").notNull().default("en"),
    /** Channel content authored on the campaign itself. */
    emailBody: text("email_body"),
    smsBody: text("sms_body"),
    /** Demo video attachment details ({ title, caption, durationSeconds, demo: true }). */
    videoMeta: jsonb("video_meta").$type<Record<string, unknown>>(),
    /** Drip steps in send order: { day, channel, subject }. */
    drip: jsonb("drip").$type<{ day: number; channel: string; subject: string }[]>().default([]),
    /** Plain-language audience rule, e.g. { type: 'past_clients' }. */
    audience: jsonb("audience").$type<Record<string, unknown>>().default({}),
    audienceSize: integer("audience_size").notNull().default(0),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    ownerUserId: uuid("owner_user_id").references(() => user.id),
    sentCount: integer("sent_count").notNull().default(0),
    openCount: integer("open_count").notNull().default(0),
    replyCount: integer("reply_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("campaign_tenant_status_idx").on(t.tenantId, t.status)],
);

// ---------------------------------------------------------------------------
// Automations — plain-language trigger → action rules
// ---------------------------------------------------------------------------

export const automationStatus = pgEnum("automation_status", ["active", "paused", "draft"]);

export const automation = pgTable(
  "automation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    /** A-01, B-02… the Automation_Catalog row this implements. */
    ref: text("ref"),
    name: text("name").notNull(),
    description: text("description"),
    /** Plain language, never developer terminology. */
    triggerText: text("trigger_text").notNull(),
    audienceText: text("audience_text").notNull(),
    actionText: text("action_text").notNull(),
    /** The approval ceiling for this automation (Automation_Catalog §1). */
    tier: autonomyTier("tier").notNull().default("t2"),
    status: automationStatus("status").notNull().default("draft"),
    templateId: uuid("template_id").references(() => template.id),
    /** Where the triggering lead/event comes from (facebook, website, agent referral…). */
    source: text("source"),
    /** The campaign this automation enrolls people into. */
    campaignId: uuid("campaign_id").references(() => campaign.id),
    /** Plain-language timing, e.g. "within 5 minutes" or "next morning at 9am". */
    timingText: text("timing_text"),
    runCount: integer("run_count").notNull().default(0),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("automation_tenant_status_idx").on(t.tenantId, t.status)],
);

export const automationRunStatus = pgEnum("automation_run_status", [
  "queued_for_approval",
  "approved",
  "completed",
  "skipped",
  "failed",
]);

export const automationRun = pgTable(
  "automation_run",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    automationId: uuid("automation_id")
      .notNull()
      .references(() => automation.id),
    personId: uuid("person_id").references(() => person.id),
    loanId: uuid("loan_id").references(() => loan.id),
    status: automationRunStatus("status").notNull().default("queued_for_approval"),
    /** Plain-language account of what happened, shown in run history. */
    outcome: text("outcome").notNull(),
    /** Why it stopped, when a stop condition fired at execution time. */
    stoppedReason: text("stopped_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("automation_run_tenant_auto_idx").on(t.tenantId, t.automationId)],
);

// ---------------------------------------------------------------------------
// AI persona — per-user context for the assistant (Settings → My profile)
// ---------------------------------------------------------------------------

export const personaStatus = pgEnum("persona_status", ["ready", "failed"]);

/**
 * One persona per user: an uploaded document (PDF/DOCX/MD/TXT) whose extracted
 * text personalises how the assistant drafts for that user.
 *
 * Security posture: persona text is UNTRUSTED CONTENT. It is data the
 * assistant may read for tone and background — never instructions. Nothing in
 * a persona can override system rules, permissions, compliance controls,
 * approval requirements, or security boundaries. RLS additionally pins each
 * row to its owner (user_id = app.user_id), so one user's persona can never be
 * read by another — not even a teammate in the same tenant.
 */
export const aiPersona = pgTable(
  "ai_persona",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id)
      .unique(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: personaStatus("status").notNull().default("ready"),
    extractedText: text("extracted_text"),
    /** Plain-language reason when extraction failed. */
    error: text("error"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_persona_tenant_user_idx").on(t.tenantId, t.userId)],
);

// ---------------------------------------------------------------------------
// How-to videos — the in-product training library
// ---------------------------------------------------------------------------

export const video = pgTable(
  "video",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    durationSeconds: integer("duration_seconds"),
    /** Null = no real recording yet; the UI must say "Video coming soon". */
    url: text("url"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdByUserId: uuid("created_by_user_id").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("video_tenant_category_idx").on(t.tenantId, t.category)],
);

/** Per-user watch state; progress is a placeholder until real playback exists. */
export const videoWatch = pgTable(
  "video_watch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    videoId: uuid("video_id")
      .notNull()
      .references(() => video.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    watchedAt: timestamp("watched_at", { withTimezone: true }),
    progressPct: integer("progress_pct").notNull().default(0),
  },
  (t) => [index("video_watch_tenant_user_idx").on(t.tenantId, t.userId, t.videoId)],
);

/** Append-only record of every mutation (Technical_Architecture §5). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id),
    actorUserId: uuid("actor_user_id").references(() => user.id),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    /** Field-level before/after. NPI values are redacted at write time. */
    changes: jsonb("changes").$type<Record<string, { from: unknown; to: unknown }>>(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_tenant_created_idx").on(t.tenantId, t.createdAt),
    index("audit_tenant_entity_idx").on(t.tenantId, t.entity, t.entityId),
  ],
);
