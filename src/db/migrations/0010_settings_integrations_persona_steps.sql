-- Milestone: User settings, integrations (Google + Zapier MCP architecture),
-- rich AI persona, and the multi-step campaign model.
--
-- HONESTY: integration tables never store OAuth tokens. Statuses default to
-- 'not_connected'; 'preview' means architecture-only. RLS keeps every new
-- table inside its tenant; ai_persona stays owner-private.

-- 1. AI persona: file columns become nullable (persona can be instructions-only)
--    and gain the tone / guidance / compliance fields.
ALTER TABLE "ai_persona" ALTER COLUMN "filename" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_persona" ALTER COLUMN "mime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_persona" ALTER COLUMN "size_bytes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "tone" text;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "prefer_words" text[];--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "avoid_words" text[];--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "compliance_notes" text;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD COLUMN "sample_text" text;--> statement-breakpoint

-- 2. Automation builder fields.
ALTER TABLE "automation" ADD COLUMN "conditions" text;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "owner_assignment" text;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "start_delay_text" text;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "stop_conditions" text;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "reentry_rule" text;--> statement-breakpoint

-- 3. Integration enums + tables.
CREATE TYPE "public"."integration_provider" AS ENUM ('google_workspace', 'gmail', 'google_drive', 'google_calendar', 'zapier_mcp');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM ('not_connected', 'preview', 'connected', 'error', 'paused');--> statement-breakpoint
CREATE TYPE "public"."step_channel" AS ENUM ('email', 'sms', 'task', 'call', 'video', 'app', 'notification');--> statement-breakpoint

CREATE TABLE "integration_connection" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenant"("id"),
  "provider" "integration_provider" NOT NULL,
  "user_id" uuid REFERENCES "user"("id"),
  "status" "connection_status" DEFAULT 'not_connected' NOT NULL,
  "display_name" text,
  "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "last_synced_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX "integration_connection_tenant_idx" ON "integration_connection" ("tenant_id", "provider");--> statement-breakpoint

CREATE TABLE "lead_source_mapping" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenant"("id"),
  "connection_id" uuid REFERENCES "integration_connection"("id"),
  "source_key" text NOT NULL,
  "name" text NOT NULL,
  "owner_user_id" uuid REFERENCES "user"("id"),
  "lead_source" text,
  "campaign_id" uuid REFERENCES "campaign"("id"),
  "automation_id" uuid REFERENCES "automation"("id"),
  "tags" text[],
  "preferred_language" "language",
  "field_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "notify_rule" text,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "lead_source_mapping_tenant_idx" ON "lead_source_mapping" ("tenant_id", "source_key");--> statement-breakpoint

CREATE TABLE "integration_event" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenant"("id"),
  "connection_id" uuid REFERENCES "integration_connection"("id"),
  "mapping_id" uuid REFERENCES "lead_source_mapping"("id"),
  "kind" text NOT NULL,
  "status" text NOT NULL,
  "summary" text NOT NULL,
  "detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "integration_event_tenant_conn_idx" ON "integration_event" ("tenant_id", "connection_id");--> statement-breakpoint

CREATE TABLE "campaign_step" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenant"("id"),
  "campaign_id" uuid NOT NULL REFERENCES "campaign"("id"),
  "position" integer DEFAULT 0 NOT NULL,
  "channel" "step_channel" DEFAULT 'email' NOT NULL,
  "delay_days" integer DEFAULT 0 NOT NULL,
  "send_time" text,
  "template_id" uuid REFERENCES "template"("id"),
  "subject" text,
  "body" text,
  "approval_required" boolean DEFAULT true NOT NULL,
  "skip_condition" text,
  "stop_condition" text,
  "language" "language" DEFAULT 'en' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "campaign_step_campaign_idx" ON "campaign_step" ("campaign_id", "position");--> statement-breakpoint

-- 4. RLS: tenant isolation on all four new tables (same wall as everything else).
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['integration_connection', 'lead_source_mapping', 'integration_event', 'campaign_step'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant())', t);
  END LOOP;
END $$;--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lfcrm_app;--> statement-breakpoint
-- The blanket GRANT above re-grants UPDATE/DELETE on the append-only logs, so
-- re-assert the revoke on ALL of them (not just the new integration_event) —
-- otherwise the earlier revoke from 0001/0006 is silently undone.
REVOKE UPDATE, DELETE ON audit_log, ai_action_log, loan_stage_history, automation_run, integration_event FROM lfcrm_app;
