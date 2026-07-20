import Link from "next/link";
import { relativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AutomationLines } from "./automation-lines";
import {
  AutomationControls,
  type CampaignChoice,
  type TeammateChoice,
} from "./automation-controls";
import { AutomationStateBadge, TierBadge } from "./labels";
import type { AutomationRow } from "@/lib/queries/automations";

/**
 * One automation, read top to bottom: what it is called and whether it is on,
 * the lines it does — source in, campaign out, timing — and, last, because it
 * is the promise the whole screen rests on, how much it is allowed to do
 * without you.
 */
export function AutomationCard({
  automation,
  campaignChoices,
  teammateChoices,
  canSetTier,
}: {
  automation: AutomationRow;
  campaignChoices: CampaignChoice[];
  teammateChoices: TeammateChoice[];
  canSetTier: boolean;
}) {
  const runSummary = [
    automation.ref,
    automation.runCount === 0
      ? "Hasn't run yet"
      : `${automation.runCount} run${automation.runCount === 1 ? "" : "s"}`,
    automation.lastRunAt ? `last run ${relativeTime(automation.lastRunAt)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card as="article">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-subtle px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-h3 font-semibold text-primary">
              <Link href={`/automations/${automation.id}`} className="hover:text-action">
                {automation.name}
              </Link>
            </h2>
            <AutomationStateBadge state={automation.status} />
            {automation.waitingCount > 0 ? (
              <Badge tone="ai">{automation.waitingCount} waiting for you</Badge>
            ) : null}
          </div>
          {automation.description ? (
            <p className="mt-1 max-w-2xl text-small text-secondary">{automation.description}</p>
          ) : null}
        </div>

        <AutomationControls
          automation={{
            id: automation.id,
            name: automation.name,
            description: automation.description,
            triggerText: automation.triggerText,
            audienceText: automation.audienceText,
            actionText: automation.actionText,
            source: automation.source,
            conditions: automation.conditions,
            ownerAssignment: automation.ownerAssignment,
            campaignId: automation.campaignId,
            startDelayText: automation.startDelayText,
            timingText: automation.timingText,
            stopConditions: automation.stopConditions,
            reentryRule: automation.reentryRule,
            tier: automation.tier,
            status: automation.status,
          }}
          campaignChoices={campaignChoices}
          teammateChoices={teammateChoices}
          canSetTier={canSetTier}
        />
      </div>

      <div className="px-4 py-3">
        <AutomationLines
          triggerText={automation.triggerText}
          audienceText={automation.audienceText}
          actionText={automation.actionText}
          source={automation.source}
          conditions={automation.conditions}
          ownerAssignment={automation.ownerAssignment}
          campaignId={automation.campaignId}
          campaignName={automation.campaignName}
          startDelayText={automation.startDelayText}
          timingText={automation.timingText}
          stopConditions={automation.stopConditions}
          reentryRule={automation.reentryRule}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-subtle px-4 py-2.5">
        <TierBadge tier={automation.tier} />
        <p className="text-small text-muted tnum">{runSummary}</p>
      </div>
    </Card>
  );
}
