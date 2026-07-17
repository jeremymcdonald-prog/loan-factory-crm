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
