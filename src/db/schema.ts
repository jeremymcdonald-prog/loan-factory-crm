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
 * The locked 20-stage opportunity lifecycle (Data_Model.md §3.6, CANON).
 * Enum values never localize; display names live in the i18n layer.
 * Macro-phase (ENGAGE/QUALIFY/TRANSACT/RETAIN/GROW) is derived, not a column.
 */
export const loanStage = pgEnum("loan_stage", [
  "new_lead", // 1  ENGAGE
  "contact_attempt", // 2
  "consultation_scheduled", // 3
  "consultation_completed", // 4
  "prequalification", // 5  QUALIFY
  "preapproval", // 6
  "searching_for_home", // 7
  "under_contract", // 8  TRANSACT
  "application", // 9
  "disclosures", // 10
  "processing", // 11
  "submitted_to_underwriting", // 12
  "conditional_approval", // 13
  "clear_to_close", // 14
  "closing_scheduled", // 15
  "funded", // 16
  "post_close", // 17 RETAIN
  "annual_review", // 18
  "refinance_opportunity", // 19 GROW
  "referral_retention", // 20
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

/** Ally proposes; a human disposes. Never "sent" without a human verdict. */
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
    /** Set when Ally drafted the note; a human still saved it. */
    preparedByAlly: boolean("prepared_by_ally").notNull().default(false),
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
// Ally — everything Ally proposes and every call it makes
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
    /** Card face: what Ally prepared. */
    title: text("title").notNull(),
    body: text("body"),
    /** Plain-language "why is this here?" — source evidence, never a black box. */
    rationale: text("rationale").notNull(),
    /** The factors behind any score/ranking — fair-lending-safe only (D-11). */
    factors: jsonb("factors").$type<string[]>().default([]),
    templateRef: text("template_ref"),
    languageCode: language("language_code").notNull().default("en"),
    /** Populated on a human verdict — never by Ally itself. */
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
