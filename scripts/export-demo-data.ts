/**
 * Export the seeded demo dataset to JSON for the offline HTML demonstration.
 *
 * Reads through the SAME row-level-security context the app uses (tenant +
 * team-leader user via the restricted role), so the export can only ever
 * contain what a signed-in team leader would see. Raw SQL on purpose: the
 * query modules are `server-only` and this runs under tsx.
 *
 * Shapes mirror the rebuilt loan-officer-workflow app:
 *  - pipeline records for the four views (Leads / Applications / Loans / Past)
 *  - partners with the five-tier system + closings + next-action facts
 *  - conversations across every channel with honest statuses
 *  - campaigns with language / bodies / drip / audience for the detail screen
 *  - automations with source / campaign / timing / run history
 *  - intelligence aggregates per range (week, mtd, prior, 90d, ytd) × scope
 *  - the loan-officer leaderboard per period (week, month, quarter, ytd)
 */
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { Pool, type PoolClient } from "pg";

config({ path: ".env.local" });

const TENANT = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";
const LINH = "1a000000-0000-4000-8000-000000000004"; // team leader

/** Range keys → SQL fragments for [from, to). Mirrors app/(app)/intelligence/range.ts. */
const RANGES: Record<string, { from: string; to: string; label: string }> = {
  week: { from: "date_trunc('week', now())", to: "now()", label: "This week" },
  mtd: { from: "date_trunc('month', now())", to: "now()", label: "Month to date" },
  prior: {
    from: "date_trunc('month', now()) - interval '1 month'",
    to: "date_trunc('month', now())",
    label: "Prior month",
  },
  "90d": { from: "now() - interval '90 days'", to: "now()", label: "Last 90 days" },
  ytd: { from: "date_trunc('year', now())", to: "now()", label: "Year to date" },
};

/** Leaderboard periods → window-start SQL. Mirrors lib/queries/team.ts periodStart(). */
const PERIODS: Record<string, string> = {
  week: "now() - interval '7 days'",
  month: "now() - interval '30 days'",
  quarter: "now() - interval '90 days'",
  ytd: "date_trunc('year', now())",
};

/**
 * "Application in flight" — from `prequalification` (a lead becomes an
 * applicant) through `clear_to_close`, stopping before `funded`. Mirrors
 * src/lib/queries/team.ts APPLICATION_STAGES = STAGES.slice(prequalification, funded).
 */
const APPLICATION_STAGES =
  "('prequalification','preapproval','contract_received','ready_to_refinance'," +
  "'submitted_to_processing','submitted_to_underwriting','conditional_approval'," +
  "'appraisal_ordered','appraisal_received','submitted_for_clear_to_close','clear_to_close')";

/** The seven LOANS-group stages — a file here needs a touch every 3 days (stages.ts stallDays). */
const LOAN_STAGES =
  "('submitted_to_processing','submitted_to_underwriting','conditional_approval'," +
  "'appraisal_ordered','appraisal_received','submitted_for_clear_to_close','clear_to_close')";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client: PoolClient = await pool.connect();

  await client.query("BEGIN");
  await client.query("SELECT set_config('app.tenant_id', $1, true)", [TENANT]);
  await client.query("SELECT set_config('app.user_id', $1, true)", [LINH]);

  const q = async (sql: string, params: unknown[] = []) =>
    (await client.query(sql, params)).rows;

  // --- Team roster (workload columns mirror lib/queries/team.ts) --------------
  const team = await q(`
    SELECT u.id, u.full_name, u.email, u.role::text, u.nmls_id, u.language::text, u.phone,
      (SELECT count(*)::int FROM task t WHERE t.owner_user_id = u.id AND t.status='open' AND t.deleted_at IS NULL) AS open_tasks,
      (SELECT count(*)::int FROM task t WHERE t.owner_user_id = u.id AND t.status='open' AND t.deleted_at IS NULL AND t.due_at < now()) AS overdue_tasks,
      (SELECT count(*)::int FROM loan l WHERE l.status='active' AND l.deleted_at IS NULL
         AND (l.lo_user_id=u.id OR l.processor_user_id=u.id OR l.coordinator_user_id=u.id)) AS active_files,
      (SELECT COALESCE(sum(l.amount),0)::float FROM loan l WHERE l.status='active' AND l.deleted_at IS NULL AND l.lo_user_id=u.id) AS active_volume,
      (SELECT count(*)::int FROM lead ld WHERE ld.assigned_user_id=u.id AND ld.first_response_at IS NULL) AS waiting_leads,
      (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (ld.first_response_at-ld.captured_at)))
         FROM lead ld WHERE ld.assigned_user_id=u.id AND ld.first_response_at IS NOT NULL)::float AS median_response_seconds,
      (SELECT count(*)::int FROM ai_insight i WHERE i.for_user_id=u.id AND i.status='pending') AS pending_approvals,
      (SELECT count(*)::int FROM loan l WHERE l.status='funded' AND l.lo_user_id=u.id) AS funded_total
    FROM "user" u WHERE u.deleted_at IS NULL AND u.status='active'
    ORDER BY active_volume DESC`);

  // --- Pipeline records: one row per (undeleted, not-lost) loan ---------------
  const pipeline = await q(`
    SELECT l.id AS loan_id, p.id AS person_id, p.first_name, p.last_name,
           p.preferred_language::text AS language,
           l.stage::text,
           CASE l.stage::text
             WHEN 'new_lead' THEN 'LEADS' WHEN 'contact_attempt' THEN 'LEADS'
             WHEN 'consultation_scheduled' THEN 'LEADS' WHEN 'consultation_completed' THEN 'LEADS'
             WHEN 'working_on_credit' THEN 'LEADS' WHEN 'thirty_to_ninety_out' THEN 'LEADS'
             WHEN 'ninety_plus_out' THEN 'LEADS'
             WHEN 'prequalification' THEN 'APPLICATIONS' WHEN 'preapproval' THEN 'APPLICATIONS'
             WHEN 'contract_received' THEN 'APPLICATIONS' WHEN 'ready_to_refinance' THEN 'APPLICATIONS'
             WHEN 'funded' THEN 'PAST' WHEN 'first_year_followup' THEN 'PAST'
             WHEN 'annual_review' THEN 'PAST' WHEN 'refinance_opportunity' THEN 'PAST'
             WHEN 'referral_and_retention' THEN 'PAST'
             ELSE 'LOANS'
           END AS view,
           l.status AS loan_status, l.purpose, l.program,
           l.amount::float, l.preapproval_amount::float,
           l.rate_lock_expires_at::text, l.closing_date::text, l.funded_at::text,
           l.docs_needed, l.docs_needed_summary,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-l.last_activity_at))/86400)::int AS idle_days,
           (ld.id IS NOT NULL AND ld.first_response_at IS NULL) AS waiting_first_reply,
           ld.source->>'channel' AS lead_channel,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-ld.captured_at))/3600)::int AS captured_hours_ago,
           u.full_name AS owner, l.lo_user_id AS owner_id
    FROM loan l
    JOIN person p ON p.id=l.person_id
    LEFT JOIN lead ld ON ld.loan_id=l.id
    LEFT JOIN "user" u ON u.id=l.lo_user_id
    WHERE l.deleted_at IS NULL AND l.status NOT IN ('lost','withdrawn','denied')
    ORDER BY l.last_activity_at DESC`);

  // Lead-type people with no file yet — the Leads view shows them too.
  const leadContacts = await q(`
    SELECT p.id AS person_id, p.first_name, p.last_name,
           p.preferred_language::text AS language,
           p.source->>'channel' AS lead_channel, u.full_name AS owner,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-p.updated_at))/86400)::int AS idle_days
    FROM person p LEFT JOIN "user" u ON u.id=p.owner_user_id
    WHERE p.deleted_at IS NULL AND p.type='lead'
      AND NOT EXISTS (SELECT 1 FROM loan l WHERE l.person_id=p.id AND l.deleted_at IS NULL)
    ORDER BY p.updated_at DESC`);

  // --- People -----------------------------------------------------------------
  const people = await q(`
    SELECT p.id, p.first_name, p.last_name, p.preferred_language::text AS language,
           p.type::text, p.tags, p.do_not_contact,
           p.emails->0->>'address' AS email,
           p.phones->0->>'number' AS phone, p.mailing_address->>'city' AS city,
           p.bio,
           p.social_links AS "socialLinks",
           p.bio_researched_at::text AS "bioResearchedAt",
           p.bio_sources AS "bioSources",
           u.full_name AS owner,
           l.stage::text, l.status AS loan_status, l.amount::float, l.program,
           l.rate_lock_expires_at::text, l.closing_date::text,
           l.docs_needed, l.docs_needed_summary,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-l.last_activity_at))/86400)::int AS idle_days
    FROM person p
    LEFT JOIN "user" u ON u.id = p.owner_user_id
    LEFT JOIN LATERAL (
      SELECT * FROM loan l2 WHERE l2.person_id=p.id AND l2.deleted_at IS NULL
      ORDER BY l2.created_at DESC LIMIT 1
    ) l ON true
    WHERE p.deleted_at IS NULL AND p.merged_into_person_id IS NULL
    ORDER BY l.last_activity_at DESC NULLS LAST`);

  // --- Partners: five tiers + referral/closing production ---------------------
  const partners = await q(`
    SELECT pt.id, pt.first_name, pt.last_name, pt.company, pt.kind::text, pt.tier::text,
           pt.preferred_language::text AS language, pt.do_not_contact,
           pt.emails->0->>'address' AS email,
           pt.phones->0->>'number' AS phone,
           pt.bio,
           pt.social_links AS "socialLinks",
           pt.bio_researched_at::text AS "bioResearchedAt",
           pt.bio_sources AS "bioSources",
           u.full_name AS owner,
           CASE WHEN pt.last_touch_at IS NULL THEN NULL
                ELSE GREATEST(0, EXTRACT(EPOCH FROM (now()-pt.last_touch_at))/86400)::int END AS last_touch_days,
           (SELECT count(*)::int FROM partner_relationship pr WHERE pr.partner_id=pt.id) AS referrals,
           (SELECT count(*)::int FROM partner_relationship pr JOIN loan l ON l.id=pr.loan_id
             WHERE pr.partner_id=pt.id AND l.status='funded' AND l.deleted_at IS NULL) AS closings,
           (SELECT CASE WHEN max(pr.created_at) IS NULL THEN NULL
                   ELSE GREATEST(0, EXTRACT(EPOCH FROM (now()-max(pr.created_at)))/86400)::int END
              FROM partner_relationship pr WHERE pr.partner_id=pt.id) AS last_referral_days,
           pt.notes_summary
    FROM partner pt LEFT JOIN "user" u ON u.id=pt.owner_user_id
    WHERE pt.deleted_at IS NULL
    ORDER BY pt.last_touch_at ASC NULLS FIRST`);

  // --- Conversations: every channel, newest first, messages newest first ------
  const conversations = await q(`
    SELECT c.id, c.subject, c.channel::text, c.awaiting_reply,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-c.last_message_at))/3600)::int AS hours_ago,
           COALESCE(p.first_name||' '||p.last_name, pt.first_name||' '||pt.last_name,
                    'No contact on this thread') AS with_name,
           CASE WHEN p.id IS NOT NULL THEN 'person'
                WHEN pt.id IS NOT NULL THEN 'partner' ELSE 'unknown' END AS with_kind,
           p.id AS person_id, pt.id AS partner_id,
           COALESCE(p.preferred_language::text, pt.preferred_language::text, 'en') AS language,
           u.full_name AS owner,
           (SELECT json_agg(json_build_object(
              'channel', m.channel, 'direction', m.direction, 'subject', m.subject, 'body', m.body,
              'status', m.status, 'preparedByAi', m.prepared_by_ai,
              'translationEn', m.meta->>'translationEn',
              'video', m.meta->'video', 'callOutcome', m.meta->>'outcome',
              'durationSeconds', m.meta->>'durationSeconds',
              'attachments', COALESCE(m.meta->'attachments', '[]'::jsonb),
              'author', (SELECT au.full_name FROM "user" au WHERE au.id=m.author_user_id),
              'hoursAgo', GREATEST(0, EXTRACT(EPOCH FROM (now()-m.occurred_at))/3600)::int
            ) ORDER BY m.occurred_at DESC)
            FROM message m WHERE m.conversation_id=c.id) AS messages
    FROM conversation c
    LEFT JOIN person p ON p.id=c.person_id
    LEFT JOIN partner pt ON pt.id=c.partner_id
    LEFT JOIN "user" u ON u.id=c.owner_user_id
    ORDER BY c.last_message_at DESC LIMIT 60`);

  // --- AI approvals waiting (Today queue) -------------------------------------
  const approvals = await q(`
    SELECT i.id, i.kind::text, i.title, i.body, i.rationale, i.factors,
           i.language_code::text AS language, i.template_ref,
           p.first_name||' '||p.last_name AS person, u.full_name AS for_lo
    FROM ai_insight i
    LEFT JOIN person p ON p.id=i.person_id
    LEFT JOIN "user" u ON u.id=i.for_user_id
    WHERE i.status='pending' ORDER BY i.created_at DESC`);

  // --- Overdue tasks (Today queue: applications needing follow-up) ------------
  const tasksOverdue = await q(`
    SELECT t.title, p.first_name||' '||p.last_name AS person, u.full_name AS owner,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-t.due_at))/86400)::int AS overdue_days
    FROM task t
    LEFT JOIN person p ON p.id=t.person_id
    LEFT JOIN "user" u ON u.id=t.owner_user_id
    WHERE t.status='open' AND t.deleted_at IS NULL AND t.due_at < now()
    ORDER BY t.due_at ASC LIMIT 20`);

  // --- Campaigns, whole — for cards AND the detail screen ---------------------
  const campaigns = await q(`
    SELECT c.id, c.name, c.status::text, c.language::text,
           c.email_body, c.sms_body, c.video_meta, c.drip,
           c.audience->>'label' AS audience_label, c.audience->>'type' AS audience_type,
           c.audience_size, c.scheduled_for::text,
           c.sent_count, c.open_count, c.reply_count,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-c.created_at))/86400)::int AS created_days_ago,
           u.full_name AS owner,
           t.ref AS template_ref, t.name AS template_name, t.policy::text AS template_policy
    FROM campaign c
    LEFT JOIN "user" u ON u.id=c.owner_user_id
    LEFT JOIN template t ON t.id=c.template_id
    WHERE c.deleted_at IS NULL ORDER BY c.created_at`);

  // --- Automations with source / campaign / timing / run history --------------
  const automations = await q(`
    SELECT a.id, a.ref, a.name, a.description, a.trigger_text, a.audience_text,
           a.action_text, a.source, a.timing_text,
           a.tier::text, a.status::text, a.run_count,
           a.campaign_id, c.name AS campaign_name,
           (SELECT count(*)::int FROM automation_run r
             WHERE r.automation_id=a.id AND r.status='queued_for_approval') AS waiting_count,
           (SELECT json_agg(json_build_object('status', r.status, 'outcome', r.outcome,
              'person', pp.first_name||' '||pp.last_name,
              'daysAgo', GREATEST(0, EXTRACT(EPOCH FROM (now()-r.created_at))/86400)::int
            ) ORDER BY r.created_at DESC)
            FROM (SELECT * FROM automation_run r2 WHERE r2.automation_id=a.id
                  ORDER BY r2.created_at DESC LIMIT 5) r
            LEFT JOIN person pp ON pp.id=r.person_id) AS runs
    FROM automation a
    LEFT JOIN campaign c ON c.id=a.campaign_id
    WHERE a.deleted_at IS NULL
    ORDER BY CASE a.status::text WHEN 'active' THEN 0 WHEN 'paused' THEN 1 ELSE 2 END,
             a.ref ASC NULLS LAST, a.name ASC`);

  const templates = await q(`
    SELECT ref, name, category, channel::text, policy::text, stage::text,
           language_code::text AS language
    FROM template ORDER BY ref LIMIT 135`);

  const videos = await q(`
    SELECT title, description, category, duration_seconds, featured, published
    FROM video WHERE deleted_at IS NULL ORDER BY sort_order`);

  // --- Headline stats ----------------------------------------------------------
  const stats = (
    await q(`
    SELECT
      (SELECT count(*)::int FROM person WHERE deleted_at IS NULL AND merged_into_person_id IS NULL) AS people,
      (SELECT count(*)::int FROM loan WHERE status='active' AND deleted_at IS NULL) AS active_loans,
      (SELECT COALESCE(sum(amount),0)::float FROM loan WHERE status='active' AND deleted_at IS NULL) AS active_volume,
      (SELECT count(*)::int FROM loan WHERE status='funded') AS funded_loans,
      (SELECT COALESCE(sum(amount),0)::float FROM loan WHERE status='funded'
         AND funded_at >= date_trunc('month', current_date)) AS funded_mtd,
      (SELECT count(*)::int FROM loan WHERE status='funded'
         AND funded_at >= date_trunc('month', current_date)) AS funded_mtd_count,
      (SELECT count(*)::int FROM loan WHERE status='active'
         AND closing_date BETWEEN current_date AND current_date+7) AS closing_7d,
      (SELECT count(*)::int FROM lead WHERE first_response_at IS NULL) AS waiting_leads,
      (SELECT count(*)::int FROM lead ld JOIN loan l ON l.id=ld.loan_id
         WHERE ld.captured_at >= current_date - 7 AND l.deleted_at IS NULL) AS leads_this_week,
      (SELECT count(*)::int FROM task WHERE status='open' AND deleted_at IS NULL AND due_at<now()) AS overdue_tasks,
      (SELECT count(*)::int FROM ai_insight WHERE status='pending') AS pending_approvals`)
  )[0];

  // ============================================================================
  // Intelligence: per scope (team | own) × per range — production, sources,
  // partner production, past-client activity. Point-in-time facts once per scope.
  // ============================================================================
  const scopeSql = {
    team: { loan: "TRUE", lead: "TRUE", partner: "TRUE", campaign: "TRUE", person: "TRUE" },
    own: {
      loan: `l.lo_user_id = '${LINH}'`,
      lead: `ld.assigned_user_id = '${LINH}'`,
      partner: `pt.owner_user_id = '${LINH}'`,
      campaign: `c.owner_user_id = '${LINH}'`,
      person: `p.owner_user_id = '${LINH}'`,
    },
  } as const;

  async function rangeRead(scope: "team" | "own", rk: string) {
    const R = RANGES[rk];
    const S = scopeSql[scope];

    const [prod] = await q(`
      SELECT
        (SELECT count(*)::int FROM lead ld WHERE ld.captured_at >= ${R.from} AND ld.captured_at < ${R.to} AND ${S.lead}) AS leads,
        (SELECT count(DISTINCT h.loan_id)::int FROM loan_stage_history h JOIN loan l ON l.id=h.loan_id
          WHERE l.deleted_at IS NULL AND h.to_stage='prequalification'
            AND h.created_at >= ${R.from} AND h.created_at < ${R.to} AND ${S.loan}) AS applications,
        (SELECT count(DISTINCT h.loan_id)::int FROM loan_stage_history h JOIN loan l ON l.id=h.loan_id
          WHERE l.deleted_at IS NULL AND h.to_stage='preapproval'
            AND h.created_at >= ${R.from} AND h.created_at < ${R.to} AND ${S.loan}) AS preapprovals,
        (SELECT count(*)::int FROM loan l WHERE l.deleted_at IS NULL AND l.status='active' AND ${S.loan}) AS active_loans,
        (SELECT count(*)::int FROM loan l WHERE l.deleted_at IS NULL
          AND l.funded_at >= (${R.from})::date AND l.funded_at < (${R.to})::date + 1 AND ${S.loan}) AS closings,
        (SELECT COALESCE(sum(l.amount),0)::float FROM loan l WHERE l.deleted_at IS NULL
          AND l.funded_at >= (${R.from})::date AND l.funded_at < (${R.to})::date + 1 AND ${S.loan}) AS closed_volume`);

    const sources = await q(`
      SELECT COALESCE(ld.source->>'channel','unknown') AS channel,
             count(*)::int AS leads,
             count(*) FILTER (WHERE ld.first_response_at IS NOT NULL)::int AS contacted,
             count(*) FILTER (WHERE l.funded_at IS NOT NULL)::int AS closed
      FROM lead ld LEFT JOIN loan l ON l.id=ld.loan_id AND l.deleted_at IS NULL
      WHERE ld.captured_at >= ${R.from} AND ld.captured_at < ${R.to} AND ${S.lead}
      GROUP BY 1 ORDER BY count(*) DESC`);

    const partnersTop = await q(`
      SELECT pt.first_name||' '||pt.last_name AS name, pt.company,
             count(DISTINCT pr.id) FILTER (
               WHERE COALESCE(l.created_at, pr.created_at) >= ${R.from}
                 AND COALESCE(l.created_at, pr.created_at) < ${R.to})::int AS referrals,
             count(DISTINCT l.id) FILTER (
               WHERE l.funded_at >= (${R.from})::date AND l.funded_at < (${R.to})::date + 1)::int AS closings
      FROM partner pt
      JOIN partner_relationship pr ON pr.partner_id=pt.id AND pr.role='referred'
      LEFT JOIN loan l ON l.id=pr.loan_id AND l.deleted_at IS NULL
      WHERE pt.deleted_at IS NULL AND ${S.partner}
      GROUP BY pt.id, pt.first_name, pt.last_name, pt.company
      HAVING count(DISTINCT pr.id) FILTER (
               WHERE COALESCE(l.created_at, pr.created_at) >= ${R.from}
                 AND COALESCE(l.created_at, pr.created_at) < ${R.to}) > 0
          OR count(DISTINCT l.id) FILTER (
               WHERE l.funded_at >= (${R.from})::date AND l.funded_at < (${R.to})::date + 1) > 0
      ORDER BY 3 DESC, 4 DESC LIMIT 6`);

    const [past] = await q(`
      SELECT (SELECT count(*)::int FROM event e JOIN person p ON p.id=e.person_id
               WHERE p.deleted_at IS NULL AND p.type='past_client'
                 AND e.created_at >= ${R.from} AND e.created_at < ${R.to} AND ${S.person}) AS touches`);

    return { label: R.label, production: prod, sources, partnersTop, pastTouches: past.touches };
  }

  async function scopeRead(scope: "team" | "own") {
    const S = scopeSql[scope];

    const drips = await q(`
      SELECT c.name, c.audience_size, COALESCE(jsonb_array_length(c.drip),0)::int AS steps
      FROM campaign c WHERE c.deleted_at IS NULL AND c.status='running' AND ${S.campaign}
      ORDER BY c.updated_at DESC LIMIT 8`);

    const newsletters = await q(`
      SELECT c.name, c.status::text, c.sent_count AS sent, c.open_count AS opened
      FROM campaign c WHERE c.deleted_at IS NULL AND c.status IN ('finished','running')
        AND c.sent_count > 0 AND ${S.campaign}
      ORDER BY c.sent_count DESC LIMIT 8`);

    const database = await q(`
      SELECT p.type::text, count(*)::int AS count FROM person p
      WHERE p.deleted_at IS NULL AND p.merged_into_person_id IS NULL AND ${S.person}
      GROUP BY 1`);

    const anniversaries = await q(`
      SELECT p.first_name||' '||p.last_name AS name,
             (EXTRACT(YEAR FROM age(now(), l.funded_at::date))::int + 1) AS years,
             floor(EXTRACT(EPOCH FROM ((l.funded_at::date + make_interval(
               years => EXTRACT(YEAR FROM age(now(), l.funded_at::date))::int + 1)) - now()))/86400)::int AS in_days
      FROM loan l JOIN person p ON p.id=l.person_id
      WHERE l.deleted_at IS NULL AND p.deleted_at IS NULL AND l.funded_at IS NOT NULL
        AND (l.funded_at::date + make_interval(
              years => EXTRACT(YEAR FROM age(now(), l.funded_at::date))::int + 1)) < now() + interval '45 days'
        AND ${S.loan}
      ORDER BY 3 ASC LIMIT 8`);

    const [health] = await q(`
      SELECT
        (SELECT count(*) FILTER (WHERE ld.first_response_at IS NULL)::int FROM lead ld WHERE ${S.lead}) AS uncontacted_leads,
        (SELECT (count(*) FILTER (WHERE l.stage::text IN ${LOAN_STAGES}
            AND l.last_activity_at < now() - interval '3 days')
          + count(*) FILTER (WHERE l.stage::text NOT IN ${LOAN_STAGES}
            AND l.last_activity_at < now() - interval '7 days'))::int
          FROM loan l WHERE l.deleted_at IS NULL AND l.status='active' AND ${S.loan}) AS stale_files,
        (SELECT count(*)::int FROM campaign c WHERE c.deleted_at IS NULL
           AND c.status IN ('running','scheduled') AND c.audience->>'type'='anniversary' AND ${S.campaign}) AS anniversary_campaigns,
        (SELECT count(*)::int FROM partner pt WHERE pt.deleted_at IS NULL AND ${S.partner}) AS total_partners,
        (SELECT count(*) FILTER (WHERE pt.do_not_contact = false
           AND (pt.last_touch_at IS NULL OR pt.last_touch_at < now() - interval '60 days'))::int
           FROM partner pt WHERE pt.deleted_at IS NULL AND ${S.partner}) AS quiet_partners,
        (SELECT count(*)::int FROM person p WHERE p.deleted_at IS NULL
           AND p.merged_into_person_id IS NULL AND p.type='past_client' AND ${S.person}) AS past_clients`);

    const ranges: Record<string, Awaited<ReturnType<typeof rangeRead>>> = {};
    for (const rk of Object.keys(RANGES)) ranges[rk] = await rangeRead(scope, rk);

    return { ranges, drips, newsletters, database, anniversaries, health };
  }

  const intelligence = { team: await scopeRead("team"), own: await scopeRead("own") };

  // ============================================================================
  // Leaderboard: production per LO per period. Mirrors lib/queries/team.ts.
  // ============================================================================
  const leaderboard: Record<string, unknown[]> = {};
  for (const [pk, start] of Object.entries(PERIODS)) {
    leaderboard[pk] = await q(`
      SELECT u.id, u.full_name, u.nmls_id,
        (SELECT count(DISTINCT h.loan_id)::int FROM loan_stage_history h
           JOIN loan l ON l.id=h.loan_id
          WHERE l.lo_user_id=u.id AND h.to_stage IN ${APPLICATION_STAGES}
            AND (h.from_stage IS NULL OR h.from_stage NOT IN ${APPLICATION_STAGES})
            AND h.created_at >= ${start}) AS applications,
        (SELECT count(DISTINCT h.loan_id)::int FROM loan_stage_history h
           JOIN loan l ON l.id=h.loan_id
          WHERE l.lo_user_id=u.id AND h.to_stage='preapproval' AND h.created_at >= ${start}) AS preapprovals,
        (SELECT count(*)::int FROM loan l WHERE l.lo_user_id=u.id AND l.status='active' AND l.deleted_at IS NULL) AS active_loans,
        (SELECT count(*)::int FROM loan l WHERE l.lo_user_id=u.id AND l.deleted_at IS NULL
           AND l.funded_at IS NOT NULL AND l.funded_at >= ${start}) AS closings,
        (SELECT COALESCE(sum(l.amount),0)::float FROM loan l WHERE l.lo_user_id=u.id AND l.deleted_at IS NULL
           AND l.funded_at IS NOT NULL AND l.funded_at >= ${start}) AS funded_volume,
        (SELECT count(*)::int FROM lead ld WHERE ld.assigned_user_id=u.id AND ld.captured_at >= ${start}) AS leads_captured,
        (SELECT count(*)::int FROM partner_relationship pr
           LEFT JOIN loan l ON l.id=pr.loan_id
           LEFT JOIN person p ON p.id=pr.person_id
          WHERE pr.created_at >= ${start}
            AND (l.lo_user_id=u.id OR (pr.loan_id IS NULL AND p.owner_user_id=u.id))) AS referrals,
        (SELECT count(*)::int FROM campaign c WHERE c.owner_user_id=u.id AND c.deleted_at IS NULL
           AND c.created_at >= ${start}) AS campaigns_owned,
        (SELECT count(*)::int FROM message m WHERE m.author_user_id=u.id
           AND m.status IN ('draft','awaiting_approval') AND m.created_at >= ${start}) AS drafts_created
      FROM "user" u
      WHERE u.deleted_at IS NULL AND u.status='active' AND u.role='lo'
      ORDER BY u.full_name`);
  }

  const languageMix = await q(`
    SELECT preferred_language::text AS lang, count(*)::int AS n
    FROM person WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC`);

  await client.query("ROLLBACK");
  client.release();
  await pool.end();

  const payload = {
    generatedAt: new Date().toISOString(),
    note: "Loan Factory CRM demonstration dataset. Sample data only — no real borrowers, no live systems.",
    viewer: { name: "Linh Trần", role: "Team leader", email: "linh@loanfactory.com", id: LINH },
    companyNmls: "320841",
    stats,
    languageMix,
    team,
    pipeline,
    leadContacts,
    people,
    partners,
    conversations,
    approvals,
    tasksOverdue,
    campaigns,
    automations,
    templates,
    videos,
    intelligence,
    leaderboard,
  };

  writeFileSync("scripts/demo-export.json", JSON.stringify(payload));
  const kb = Math.round(JSON.stringify(payload).length / 1024);
  console.log(`scripts/demo-export.json written (${kb} KB)`);
  console.log(
    `pipeline=${pipeline.length} leadContacts=${leadContacts.length} people=${people.length} ` +
      `partners=${partners.length} conversations=${conversations.length} campaigns=${campaigns.length} ` +
      `automations=${automations.length} approvals=${approvals.length} team=${team.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
