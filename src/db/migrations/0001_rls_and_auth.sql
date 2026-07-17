-- Row-level security + the auth seam.
-- Technical_Architecture.md §4: "Tenant safety lives in the database, not in
-- developer discipline." Every table carries tenant_id; every policy compares
-- it to the transaction-local `app.tenant_id` setting. No tenant context =>
-- zero rows, enforced by the database.
--
-- The app connects as lfcrm_app (NOSUPERUSER, NOBYPASSRLS). FORCE ROW LEVEL
-- SECURITY is applied so that even the table owner cannot read past a policy.

--> statement-breakpoint

-- Current tenant from the transaction-local setting. STABLE, not IMMUTABLE:
-- the value changes per transaction. Returns NULL when unset, which makes
-- every policy fail closed.
CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('app.tenant_id', true), '')::uuid $$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;
--> statement-breakpoint

-- Enable + force RLS and attach one tenant-isolation policy per table.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'tenant', 'team', 'user', 'person', 'lead', 'loan', 'loan_stage_history',
    'task', 'note', 'appointment', 'event', 'ai_insight', 'ai_action_log',
    'audit_log'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);

    IF t = 'tenant' THEN
      -- The tenant row itself is matched on its own id.
      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I
           USING (id = app_current_tenant())
           WITH CHECK (id = app_current_tenant())', t);
    ELSE
      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I
           USING (tenant_id = app_current_tenant())
           WITH CHECK (tenant_id = app_current_tenant())', t);
    END IF;
  END LOOP;
END $$;
--> statement-breakpoint

-- Append-only logs: no UPDATE or DELETE grant is issued below, and these
-- policies make the intent explicit at the database layer.
DROP POLICY IF EXISTS append_only_no_update ON audit_log;
--> statement-breakpoint
CREATE POLICY append_only_no_update ON audit_log AS RESTRICTIVE FOR UPDATE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_delete ON audit_log;
--> statement-breakpoint
CREATE POLICY append_only_no_delete ON audit_log AS RESTRICTIVE FOR DELETE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_update ON ai_action_log;
--> statement-breakpoint
CREATE POLICY append_only_no_update ON ai_action_log AS RESTRICTIVE FOR UPDATE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_delete ON ai_action_log;
--> statement-breakpoint
CREATE POLICY append_only_no_delete ON ai_action_log AS RESTRICTIVE FOR DELETE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_update ON loan_stage_history;
--> statement-breakpoint
CREATE POLICY append_only_no_update ON loan_stage_history AS RESTRICTIVE FOR UPDATE USING (false);
--> statement-breakpoint
DROP POLICY IF EXISTS append_only_no_delete ON loan_stage_history;
--> statement-breakpoint
CREATE POLICY append_only_no_delete ON loan_stage_history AS RESTRICTIVE FOR DELETE USING (false);
--> statement-breakpoint

-- Grants for the restricted app role.
GRANT USAGE ON SCHEMA public TO lfcrm_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lfcrm_app;
--> statement-breakpoint
-- Append-only tables: no UPDATE/DELETE privilege at all.
REVOKE UPDATE, DELETE ON audit_log, ai_action_log, loan_stage_history FROM lfcrm_app;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lfcrm_app;
--> statement-breakpoint

-- The auth seam: the only path allowed to resolve a user before a tenant is
-- known. SECURITY DEFINER so the app role needs no cross-tenant read
-- privilege of its own, and returns only what the login flow requires
-- (never NPI, never other tenants' rows in bulk).
CREATE OR REPLACE FUNCTION auth_find_user(p_email text)
  RETURNS TABLE (
    id uuid,
    tenant_id uuid,
    email text,
    password_hash text,
    full_name text,
    role text,
    status text
  )
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT u.id, u.tenant_id, u.email, u.password_hash, u.full_name,
           u.role::text, u.status::text
      FROM "user" u
     WHERE lower(u.email) = lower(p_email)
       AND u.deleted_at IS NULL
     LIMIT 1
  $$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION auth_mark_login(p_user_id uuid)
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    UPDATE "user" SET last_login_at = now() WHERE id = p_user_id
  $$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION auth_find_user(text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION auth_mark_login(uuid) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION auth_find_user(text) TO lfcrm_app;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION auth_mark_login(uuid) TO lfcrm_app;
--> statement-breakpoint

-- One human-readable email per tenant.
CREATE UNIQUE INDEX IF NOT EXISTS user_tenant_email_unique
  ON "user" (tenant_id, lower(email)) WHERE deleted_at IS NULL;
