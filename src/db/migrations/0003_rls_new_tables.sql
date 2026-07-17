-- Extend tenant isolation to the Partners / Conversations / Marketing /
-- Automations tables. Every new table gets the same wall as the originals:
-- RLS enabled AND forced, one tenant-isolation policy, grants for the app role.
-- A table added without this would be a silent cross-tenant leak.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'partner', 'partner_relationship', 'conversation', 'message',
    'template', 'campaign', 'automation', 'automation_run'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
         USING (tenant_id = app_current_tenant())
         WITH CHECK (tenant_id = app_current_tenant())', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- automation_run is history: it records what happened and is never rewritten.
DROP POLICY IF EXISTS append_only_no_update ON automation_run;
--> statement-breakpoint
CREATE POLICY append_only_no_update ON automation_run AS RESTRICTIVE FOR UPDATE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_delete ON automation_run;
--> statement-breakpoint
CREATE POLICY append_only_no_delete ON automation_run AS RESTRICTIVE FOR DELETE USING (false);
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lfcrm_app;
--> statement-breakpoint
REVOKE UPDATE, DELETE ON audit_log, ai_action_log, loan_stage_history, automation_run
  FROM lfcrm_app;
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS template_tenant_ref_lang_unique
  ON template (tenant_id, ref, language_code);
