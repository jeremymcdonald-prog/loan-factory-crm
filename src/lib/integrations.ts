/**
 * Integration status — the honesty layer.
 *
 * Hard rule (Design_System §1, from the audit of the old prototype which
 * displayed a fake "Encompass ✓ Connected"): never render an integration,
 * sync, or send state that isn't real.
 *
 * Nothing here is connected, because nothing has been contracted or built.
 * Integration_Map records that the LOS/POS landscape is unproven, no email or
 * SMS provider is selected, and the Loan Factory platform API is unconfirmed.
 * So every row below says exactly that, and the CRM behaves accordingly —
 * approved messages wait rather than pretending to send.
 */

export type IntegrationState = "connected" | "disconnected" | "unavailable";

export type Integration = {
  key: string;
  name: string;
  /** What it would do for the user, in plain language. */
  purpose: string;
  state: IntegrationState;
  /** The truth about where this stands. Shown verbatim. */
  detail: string;
};

export const STATE_LABELS: Record<IntegrationState, string> = {
  connected: "Connected",
  disconnected: "Not connected",
  unavailable: "Not available yet",
};

export const INTEGRATIONS: Integration[] = [
  {
    key: "email",
    name: "Email",
    purpose: "Send approved messages and file replies back onto the record.",
    state: "disconnected",
    detail:
      "No email account is linked. Approved messages are saved to the conversation and wait — the CRM will not claim to send mail it cannot send.",
  },
  {
    key: "sms",
    name: "Text messaging",
    purpose: "Send approved texts and capture replies.",
    state: "unavailable",
    detail:
      "No provider is contracted. Texting also needs carrier registration (10DLC) and a written consent flow before it can be switched on.",
  },
  {
    key: "calendar",
    name: "Calendar",
    purpose: "Show your real consultations and closings on Today.",
    state: "disconnected",
    detail: "No calendar is linked. Appointments are entered by your team for now.",
  },
  {
    key: "lf_platform",
    name: "Loan Factory website & widgets",
    purpose: "Bring leads from your LO site, rate widgets, and QM Pricer straight in.",
    state: "unavailable",
    detail:
      "We have not confirmed whether the Loan Factory platform can expose these leads to another system. Until it can, leads are added by hand or imported.",
  },
  {
    key: "facebook",
    name: "Facebook lead ads",
    purpose: "Capture lead-form submissions the moment they happen.",
    state: "unavailable",
    detail: "Not built yet. Facebook leads are imported or entered by hand today.",
  },
  {
    key: "los",
    name: "Loan origination system",
    purpose: "Read stage and milestone dates so nobody types them twice.",
    state: "unavailable",
    detail:
      "Which system your files close in has not been confirmed, and any connection would be read-only — the CRM shows loan facts, it never owns them.",
  },
];

export function connectedCount(): number {
  return INTEGRATIONS.filter((i) => i.state === "connected").length;
}

// ---------------------------------------------------------------------------
// M4 — Google connections and the Zapier MCP lead pipe.
//
// This section describes the `integrationConnection` / `leadSourceMapping`
// rows in the database (Data_Model, schema.ts §"Integrations"). Same honesty
// rule as above, restated for this row-backed layer: a connection's default
// status is `not_connected`. `preview` means the architecture and scopes are
// configured and reviewable — no live credential exists. Only a real
// credentialed server may ever earn `connected`, and none is wired up in this
// build, so the Google/Zapier server actions below can only ever move a
// connection between `not_connected`, `preview`, and `paused`.
// ---------------------------------------------------------------------------
import type { OAuthScope } from "@/db/schema";
import type { Urgency } from "@/components/ui/badge";

/** Mirrors `integration_provider` (schema.ts). */
export type IntegrationProvider =
  | "google_workspace"
  | "gmail"
  | "google_drive"
  | "google_calendar"
  | "zapier_mcp";

/** Mirrors `connection_status` (schema.ts). */
export type ConnectionStatus = "not_connected" | "preview" | "connected" | "error" | "paused";

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  not_connected: "Not connected",
  preview: "Preview",
  connected: "Connected",
  error: "Error",
  paused: "Paused",
};

export const CONNECTION_STATUS_TONE: Record<ConnectionStatus, Urgency> = {
  not_connected: "neutral",
  preview: "info",
  connected: "healthy",
  error: "critical",
  paused: "warning",
};

export type GoogleProviderMeta = {
  key: Exclude<IntegrationProvider, "zapier_mcp">;
  name: string;
  /** What it would do for the user, in plain language. */
  summary: string;
  /** Least-privilege scopes this connection would request, and why. */
  scopes: OAuthScope[];
};

/**
 * Google product metadata: names, plain-language purpose, and the
 * least-privilege OAuth scope list each would request. Shown on
 * settings/integrations/google — never wired to a real OAuth client here.
 */
export const GOOGLE_PROVIDERS: GoogleProviderMeta[] = [
  {
    key: "google_workspace",
    name: "Sign in with Google (Workspace SSO)",
    summary:
      "Let your team sign in with their Google Workspace account instead of a separate CRM password.",
    scopes: [
      { scope: "openid", purpose: "Confirm who is signing in." },
      { scope: "email", purpose: "Match the Google account to a teammate's CRM login." },
      { scope: "profile", purpose: "Show their name and photo in the CRM." },
    ],
  },
  {
    key: "gmail",
    name: "Gmail",
    summary: "Send approved emails from the CRM and file replies back onto the record.",
    scopes: [
      {
        scope: "gmail.send",
        purpose: "Send approved emails you've reviewed — the CRM never sends without your tap.",
      },
      {
        scope: "gmail.readonly",
        purpose: "Read replies so they land on the right conversation, never someone else's inbox.",
      },
      {
        scope: "gmail.labels",
        purpose: "Tag CRM-sent threads so they're easy to find in Gmail, too.",
      },
    ],
  },
  {
    key: "google_drive",
    name: "Google Drive",
    summary: "Store and share loan documents your team already keeps in Drive.",
    scopes: [
      {
        scope: "drive.file",
        purpose:
          "Only see files the CRM itself creates or that you explicitly open with it — never your whole Drive.",
      },
      {
        scope: "drive.metadata.readonly",
        purpose: "Show file names and folders so you can pick the right one.",
      },
    ],
  },
  {
    key: "google_calendar",
    name: "Google Calendar",
    summary:
      "Show your real consultations and closings on Today, and add CRM appointments to your calendar.",
    scopes: [
      {
        scope: "calendar.events",
        purpose: "Create and update the appointments the CRM schedules.",
      },
      {
        scope: "calendar.readonly",
        purpose: "Read your existing events so the CRM never double-books you.",
      },
    ],
  },
];

/** One tool/action the Zapier MCP server would expose once it is really connected. */
export type ZapierTool = { key: string; name: string; description: string };

export const ZAPIER_TOOLS: ZapierTool[] = [
  {
    key: "create_contact",
    name: "Create contact",
    description: "Add a new person to the CRM from an incoming lead or form submission.",
  },
  {
    key: "create_lead",
    name: "Create lead",
    description: "Open a new lead record with the source, campaign, and intent already stamped.",
  },
  {
    key: "add_task",
    name: "Add task",
    description: "Put a follow-up task on the right owner's list the moment a lead lands.",
  },
  {
    key: "enroll_in_campaign",
    name: "Enroll in campaign",
    description: "Start the matching nurture campaign for a new lead automatically.",
  },
  {
    key: "send_notification",
    name: "Send notification",
    description: "Alert the owner (or a team channel) that a new lead just came in.",
  },
];

/** One upstream lead source the Zapier MCP pipe can route (Data_Model `leadSourceMapping.sourceKey`). */
export type LeadSourceCatalogEntry = { key: string; label: string };

export const LEAD_SOURCE_CATALOG: LeadSourceCatalogEntry[] = [
  { key: "facebook_lead_ads", label: "Facebook Lead Ads" },
  { key: "instagram_lead_ads", label: "Instagram Lead Ads" },
  { key: "jotform", label: "Jotform" },
  { key: "google_forms", label: "Google Forms" },
  { key: "follow_up_boss", label: "Follow Up Boss" },
  { key: "website_forms", label: "Website forms" },
  { key: "open_house_forms", label: "Open-house forms" },
  { key: "real_estate_agent_crms", label: "Real estate agent CRMs" },
  { key: "other", label: "Other" },
];

export function leadSourceLabel(key: string): string {
  return LEAD_SOURCE_CATALOG.find((s) => s.key === key)?.label ?? key;
}

/**
 * `leadSourceMapping.fieldMap` is a plain `Record<string, string>` — there is
 * no dedicated column for "create a follow-up task on arrival". Rather than
 * touch the schema, the mapping editor stores that one instruction under this
 * reserved key and excludes it from the incoming-field → CRM-field rows it
 * otherwise renders. Presence of a non-empty note is the toggle: blank means
 * "don't create a follow-up task."
 */
export const FOLLOW_UP_TASK_FIELD_KEY = "__followup_task_note";
