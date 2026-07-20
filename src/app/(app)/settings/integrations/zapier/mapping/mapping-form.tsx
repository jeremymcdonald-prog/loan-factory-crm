"use client";

import { useActionState, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveMapping, type MappingFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { LEAD_SOURCE_CATALOG, FOLLOW_UP_TASK_FIELD_KEY } from "@/lib/integrations";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
];

export type MappingFormInitial = {
  id?: string;
  sourceKey?: string;
  name?: string;
  ownerUserId?: string | null;
  leadSource?: string | null;
  campaignId?: string | null;
  automationId?: string | null;
  tags?: string[] | null;
  preferredLanguage?: string | null;
  fieldMap?: Record<string, string>;
  notifyRule?: string | null;
  active?: boolean;
};

export function MappingForm({
  initial,
  owners,
  campaigns,
  automations,
}: {
  initial: MappingFormInitial;
  owners: { id: string; fullName: string }[];
  campaigns: { id: string; name: string }[];
  automations: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<MappingFormState, FormData>(saveMapping, {});

  const { [FOLLOW_UP_TASK_FIELD_KEY]: followUpNote, ...editableFieldMap } = initial.fieldMap ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Source" htmlFor="sourceKey" required>
          <Select id="sourceKey" name="sourceKey" defaultValue={initial.sourceKey ?? LEAD_SOURCE_CATALOG[0].key} required>
            {LEAD_SOURCE_CATALOG.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mapping name" htmlFor="name" hint="Shown on the mapping list." required>
          <Input id="name" name="name" defaultValue={initial.name} required minLength={2} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Owner" htmlFor="ownerUserId" hint="Default owner for leads from this source.">
          <Select id="ownerUserId" name="ownerUserId" defaultValue={initial.ownerUserId ?? ""}>
            <option value="">— Unassigned —</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Lead source / channel"
          htmlFor="leadSource"
          hint="The CRM channel to stamp, e.g. facebook_ads, referral_agent."
        >
          <Input id="leadSource" name="leadSource" defaultValue={initial.leadSource ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Campaign" htmlFor="campaignId" hint="Enrolls new leads automatically.">
          <Select id="campaignId" name="campaignId" defaultValue={initial.campaignId ?? ""}>
            <option value="">— None —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Automation" htmlFor="automationId" hint="The rule this source's leads run through.">
          <Select id="automationId" name="automationId" defaultValue={initial.automationId ?? ""}>
            <option value="">— None —</option>
            {automations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tags" htmlFor="tags" hint="Comma-separated, e.g. first-time-buyer, spanish-speaking.">
          <Input id="tags" name="tags" defaultValue={(initial.tags ?? []).join(", ")} />
        </Field>
        <Field label="Preferred language" htmlFor="preferredLanguage">
          <Select id="preferredLanguage" name="preferredLanguage" defaultValue={initial.preferredLanguage ?? "en"}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Follow-up task"
        htmlFor="followUpNote"
        hint="Leave blank to skip. Fill in a note (e.g. “Call within 15 minutes”) to create a follow-up task automatically when a lead lands from this source."
      >
        <Textarea id="followUpNote" name="followUpNote" rows={2} defaultValue={followUpNote ?? ""} />
      </Field>

      <Field
        label="Notification rule"
        htmlFor="notifyRule"
        hint="Plain language — e.g. “Text the owner and post in #new-leads.”"
      >
        <Textarea id="notifyRule" name="notifyRule" rows={2} defaultValue={initial.notifyRule ?? ""} />
      </Field>

      <FieldMapEditor initial={editableFieldMap} />

      <Field label="Status" htmlFor="active">
        <Select id="active" name="active" defaultValue={initial.active === false ? "false" : "true"}>
          <option value="true">Active — route new leads</option>
          <option value="false">Paused — keep the mapping, stop routing</option>
        </Select>
      </Field>

      {state.error ? (
        <p role="alert" className="rounded-md border border-critical/25 bg-critical-bg px-3 py-2 text-small text-critical">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save mapping"}
        </Button>
      </div>
    </form>
  );
}

/**
 * Dynamic incoming-field → CRM-field rows. State lives client-side; on every
 * edit the rows are serialized into a hidden `fieldMapJson` input (synced via
 * an imperative ref, not a controlled value, so no extra re-render loop) that
 * the server action parses with JSON.parse.
 */
function FieldMapEditor({ initial }: { initial: Record<string, string> }) {
  const entries = Object.entries(initial);
  const [rows, setRows] = useState<{ from: string; to: string }[]>(
    entries.length ? entries.map(([from, to]) => ({ from, to })) : [{ from: "", to: "" }],
  );
  const hiddenRef = useRef<HTMLInputElement>(null);

  function sync(next: { from: string; to: string }[]) {
    setRows(next);
    if (hiddenRef.current) {
      const map: Record<string, string> = {};
      for (const row of next) if (row.from.trim()) map[row.from.trim()] = row.to.trim();
      hiddenRef.current.value = JSON.stringify(map);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-label font-semibold text-secondary">Field map</label>
      <p className="text-small text-muted">Incoming field → CRM field, e.g. full_name → name.</p>
      <input
        type="hidden"
        name="fieldMapJson"
        ref={hiddenRef}
        defaultValue={JSON.stringify(initial)}
      />
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label="Incoming field"
              placeholder="Incoming field"
              value={row.from}
              onChange={(e) => sync(rows.map((r, idx) => (idx === i ? { ...r, from: e.target.value } : r)))}
            />
            <span className="shrink-0 text-muted">→</span>
            <Input
              aria-label="CRM field"
              placeholder="CRM field"
              value={row.to}
              onChange={(e) => sync(rows.map((r, idx) => (idx === i ? { ...r, to: e.target.value } : r)))}
            />
            <button
              type="button"
              aria-label="Remove row"
              onClick={() => sync(rows.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded p-1.5 text-muted hover:bg-sunken hover:text-critical"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={() => sync([...rows, { from: "", to: "" }])}>
        <Plus className="size-3.5" aria-hidden />
        Add field
      </Button>
    </div>
  );
}
