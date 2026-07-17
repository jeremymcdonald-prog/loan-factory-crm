/**
 * Export the seeded demo dataset to JSON for the offline HTML demonstration.
 *
 * Reads through the SAME row-level-security context the app uses (tenant +
 * team-leader user via the restricted role), so the export can only ever
 * contain what a signed-in team leader would see. Raw SQL on purpose: the
 * query modules are `server-only` and this runs under tsx.
 */
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { Pool, type PoolClient } from "pg";

config({ path: ".env.local" });

const TENANT = "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20";
const LINH = "1a000000-0000-4000-8000-000000000004"; // team leader

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client: PoolClient = await pool.connect();

  await client.query("BEGIN");
  await client.query("SELECT set_config('app.tenant_id', $1, true)", [TENANT]);
  await client.query("SELECT set_config('app.user_id', $1, true)", [LINH]);

  const q = async (sql: string, params: unknown[] = []) =>
    (await client.query(sql, params)).rows;

  const team = await q(`
    SELECT u.id, u.full_name, u.email, u.role::text, u.nmls_id, u.language::text,
      (SELECT count(*)::int FROM task t WHERE t.owner_user_id = u.id AND t.status='open' AND t.deleted_at IS NULL) AS open_tasks,
      (SELECT count(*)::int FROM task t WHERE t.owner_user_id = u.id AND t.status='open' AND t.deleted_at IS NULL AND t.due_at < now()) AS overdue_tasks,
      (SELECT count(*)::int FROM loan l WHERE l.status='active' AND l.deleted_at IS NULL AND (l.lo_user_id=u.id OR l.processor_user_id=u.id)) AS active_files,
      (SELECT COALESCE(sum(l.amount),0)::float FROM loan l WHERE l.status='active' AND l.deleted_at IS NULL AND l.lo_user_id=u.id) AS active_volume,
      (SELECT count(*)::int FROM lead ld WHERE ld.assigned_user_id=u.id AND ld.first_response_at IS NULL) AS waiting_leads,
      (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (ld.first_response_at-ld.captured_at)))
         FROM lead ld WHERE ld.assigned_user_id=u.id AND ld.first_response_at IS NOT NULL)::float AS median_response_seconds,
      (SELECT count(*)::int FROM ai_insight i WHERE i.for_user_id=u.id AND i.status='pending') AS pending_approvals,
      (SELECT count(*)::int FROM loan l WHERE l.status='funded' AND l.lo_user_id=u.id) AS funded_total
    FROM "user" u WHERE u.deleted_at IS NULL AND u.status='active'
    ORDER BY active_volume DESC`);

  const people = await q(`
    SELECT p.id, p.first_name, p.last_name, p.preferred_language::text AS language,
           p.type::text, p.tags, p.emails->0->>'address' AS email,
           p.phones->0->>'number' AS phone, p.mailing_address->>'city' AS city,
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
    WHERE p.deleted_at IS NULL
    ORDER BY l.last_activity_at DESC NULLS LAST`);

  const partners = await q(`
    SELECT pt.id, pt.first_name, pt.last_name, pt.company, pt.kind::text, pt.tier::text,
           pt.preferred_language::text AS language, u.full_name AS owner,
           GREATEST(0, EXTRACT(EPOCH FROM (now()-pt.last_touch_at))/86400)::int AS last_touch_days,
           (SELECT count(*)::int FROM partner_relationship pr WHERE pr.partner_id=pt.id) AS referrals,
           pt.notes_summary
    FROM partner pt LEFT JOIN "user" u ON u.id=pt.owner_user_id
    WHERE pt.deleted_at IS NULL ORDER BY pt.last_touch_at ASC NULLS FIRST`);

  const conversations = await q(`
    SELECT c.id, c.subject, c.channel::text, c.awaiting_reply,
           COALESCE(p.first_name||' '||p.last_name, pt.first_name||' '||pt.last_name) AS with_name,
           COALESCE(p.preferred_language::text, pt.preferred_language::text, 'en') AS language,
           u.full_name AS owner,
           (SELECT json_agg(json_build_object(
              'direction', m.direction, 'body', m.body, 'status', m.status,
              'preparedByAi', m.prepared_by_ai, 'translationEn', m.meta->>'translationEn',
              'video', m.meta->'video',
              'hoursAgo', GREATEST(0, EXTRACT(EPOCH FROM (now()-m.occurred_at))/3600)::int
            ) ORDER BY m.occurred_at)
            FROM message m WHERE m.conversation_id=c.id) AS messages
    FROM conversation c
    LEFT JOIN person p ON p.id=c.person_id
    LEFT JOIN partner pt ON pt.id=c.partner_id
    LEFT JOIN "user" u ON u.id=c.owner_user_id
    ORDER BY c.last_message_at DESC LIMIT 40`);

  const approvals = await q(`
    SELECT i.id, i.kind::text, i.title, i.body, i.rationale, i.factors,
           i.language_code::text AS language, i.template_ref,
           p.first_name||' '||p.last_name AS person, u.full_name AS for_lo
    FROM ai_insight i
    LEFT JOIN person p ON p.id=i.person_id
    LEFT JOIN "user" u ON u.id=i.for_user_id
    WHERE i.status='pending' ORDER BY i.created_at DESC`);

  const campaigns = await q(`
    SELECT c.name, c.status::text, c.audience->>'label' AS audience, c.audience_size,
           c.sent_count, c.open_count, c.reply_count, u.full_name AS owner
    FROM campaign c LEFT JOIN "user" u ON u.id=c.owner_user_id
    WHERE c.deleted_at IS NULL ORDER BY c.created_at`);

  const automations = await q(`
    SELECT a.ref, a.name, a.description, a.trigger_text, a.audience_text, a.action_text,
           a.tier::text, a.status::text, a.run_count,
           (SELECT json_agg(json_build_object('status', r.status, 'outcome', r.outcome,
              'person', pp.first_name||' '||pp.last_name) ORDER BY r.created_at DESC)
            FROM (SELECT * FROM automation_run r2 WHERE r2.automation_id=a.id
                  ORDER BY r2.created_at DESC LIMIT 3) r
            LEFT JOIN person pp ON pp.id=r.person_id) AS runs
    FROM automation a WHERE a.deleted_at IS NULL ORDER BY a.ref`);

  const templates = await q(`
    SELECT ref, name, category, policy::text, stage::text FROM template
    ORDER BY ref LIMIT 135`);

  const videos = await q(`
    SELECT title, description, category, duration_seconds, featured, published
    FROM video WHERE deleted_at IS NULL ORDER BY sort_order`);

  const stats = (
    await q(`
    SELECT
      (SELECT count(*)::int FROM person WHERE deleted_at IS NULL) AS people,
      (SELECT count(*)::int FROM loan WHERE status='active' AND deleted_at IS NULL) AS active_loans,
      (SELECT COALESCE(sum(amount),0)::float FROM loan WHERE status='active' AND deleted_at IS NULL) AS active_volume,
      (SELECT count(*)::int FROM loan WHERE status='funded') AS funded_loans,
      (SELECT COALESCE(sum(amount),0)::float FROM loan WHERE status='funded'
         AND funded_at >= date_trunc('month', current_date)) AS funded_mtd,
      (SELECT count(*)::int FROM loan WHERE status='active'
         AND closing_date BETWEEN current_date AND current_date+7) AS closing_7d,
      (SELECT count(*)::int FROM lead WHERE first_response_at IS NULL) AS waiting_leads,
      (SELECT count(*)::int FROM task WHERE status='open' AND deleted_at IS NULL AND due_at<now()) AS overdue_tasks,
      (SELECT count(*)::int FROM ai_insight WHERE status='pending') AS pending_approvals`)
  )[0];

  const languageMix = await q(`
    SELECT preferred_language::text AS lang, count(*)::int AS n
    FROM person WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC`);

  await client.query("ROLLBACK");
  client.release();
  await pool.end();

  const payload = {
    generatedAt: new Date().toISOString(),
    note: "Loan Factory CRM demonstration dataset. Sample data only — no real borrowers, no live systems.",
    viewer: { name: "Linh Trần", role: "Team leader", email: "linh@loanfactory.com" },
    stats,
    languageMix,
    team,
    people,
    partners,
    conversations,
    approvals,
    campaigns,
    automations,
    templates,
    videos,
  };

  writeFileSync("scripts/demo-export.json", JSON.stringify(payload));
  const kb = Math.round(JSON.stringify(payload).length / 1024);
  console.log(`scripts/demo-export.json written (${kb} KB)`);
  console.log(
    `people=${people.length} partners=${partners.length} conversations=${conversations.length} approvals=${approvals.length} team=${team.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
