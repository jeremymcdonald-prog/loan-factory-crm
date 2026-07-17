-- RLS for the profile-era tables. Same wall as everything else, with one
-- stronger rule: an AI persona is private to its OWNER, not just its tenant.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['ai_persona', 'video', 'video_watch'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Videos: ordinary tenant isolation.
DROP POLICY IF EXISTS tenant_isolation ON video;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON video
  USING (tenant_id = app_current_tenant())
  WITH CHECK (tenant_id = app_current_tenant());
--> statement-breakpoint

-- Watch state: tenant isolation plus writes only as yourself.
DROP POLICY IF EXISTS tenant_isolation ON video_watch;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON video_watch
  USING (tenant_id = app_current_tenant())
  WITH CHECK (tenant_id = app_current_tenant() AND user_id = app_current_user_id());
--> statement-breakpoint

-- Personas: never expose one user's persona to another. The database itself
-- refuses to return a persona row to anyone but its owner — a teammate, a
-- leader, even an admin in the same tenant reads zero rows here.
DROP POLICY IF EXISTS owner_only ON ai_persona;
--> statement-breakpoint
CREATE POLICY owner_only ON ai_persona
  USING (tenant_id = app_current_tenant() AND user_id = app_current_user_id())
  WITH CHECK (tenant_id = app_current_tenant() AND user_id = app_current_user_id());
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lfcrm_app;
--> statement-breakpoint
REVOKE UPDATE, DELETE ON audit_log, ai_action_log, loan_stage_history, automation_run
  FROM lfcrm_app;
