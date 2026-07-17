CREATE TYPE "public"."appointment_kind" AS ENUM('consultation', 'call', 'closing', 'other');--> statement-breakpoint
CREATE TYPE "public"."autonomy_tier" AS ENUM('t0', 't1', 't2', 't3');--> statement-breakpoint
CREATE TYPE "public"."insight_kind" AS ENUM('briefing', 'next_best_action', 'draft_email', 'draft_sms', 'call_prep', 'summary');--> statement-breakpoint
CREATE TYPE "public"."insight_status" AS ENUM('pending', 'approved', 'edited_approved', 'rejected', 'snoozed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'vi', 'zh', 'es', 'ru');--> statement-breakpoint
CREATE TYPE "public"."lead_intent" AS ENUM('purchase', 'refinance', 'heloc', 'quote', 'rate_alert', 'qualify', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."loan_purpose" AS ENUM('purchase', 'refinance', 'cash_out_refi', 'heloc', 'construction', 'other');--> statement-breakpoint
CREATE TYPE "public"."loan_stage" AS ENUM('new_lead', 'contact_attempt', 'consultation_scheduled', 'consultation_completed', 'prequalification', 'preapproval', 'searching_for_home', 'under_contract', 'application', 'disclosures', 'processing', 'submitted_to_underwriting', 'conditional_approval', 'clear_to_close', 'closing_scheduled', 'funded', 'post_close', 'annual_review', 'refinance_opportunity', 'referral_retention');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('active', 'funded', 'lost', 'withdrawn', 'denied', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."person_type" AS ENUM('lead', 'borrower', 'past_client', 'other');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('lo', 'lo_assistant', 'processor', 'team_leader', 'branch_leader', 'agent_rel_manager', 'marketing_coordinator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'invited', 'disabled');--> statement-breakpoint
CREATE TABLE "ai_action_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"insight_id" uuid,
	"action" text NOT NULL,
	"model" text,
	"prompt_version" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer,
	"actor_user_id" uuid,
	"detail" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"kind" "insight_kind" NOT NULL,
	"status" "insight_status" DEFAULT 'pending' NOT NULL,
	"tier" "autonomy_tier" DEFAULT 't2' NOT NULL,
	"for_user_id" uuid NOT NULL,
	"person_id" uuid,
	"loan_id" uuid,
	"title" text NOT NULL,
	"body" text,
	"rationale" text NOT NULL,
	"factors" jsonb DEFAULT '[]'::jsonb,
	"template_ref" text,
	"language_code" "language" DEFAULT 'en' NOT NULL,
	"decided_by_user_id" uuid,
	"decided_at" timestamp with time zone,
	"decision_reason" text,
	"edited_body" text,
	"snoozed_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"kind" "appointment_kind" DEFAULT 'call' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"location" text,
	"owner_user_id" uuid NOT NULL,
	"person_id" uuid,
	"loan_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"changes" jsonb,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"person_id" uuid,
	"loan_id" uuid,
	"actor_user_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"source" jsonb,
	"intent" "lead_intent" DEFAULT 'unknown' NOT NULL,
	"assigned_user_id" uuid,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_response_at" timestamp with time zone,
	"stated_price_range" text,
	"stated_location" text,
	"stated_fico_range" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"lo_user_id" uuid,
	"processor_user_id" uuid,
	"coordinator_user_id" uuid,
	"stage" "loan_stage" DEFAULT 'new_lead' NOT NULL,
	"status" "loan_status" DEFAULT 'active' NOT NULL,
	"purpose" "loan_purpose",
	"program" text,
	"amount" numeric(12, 2),
	"property_address" jsonb,
	"property_type" text,
	"occupancy" text,
	"lender_name" text,
	"loan_number" text,
	"rate_lock_date" date,
	"rate_lock_expires_at" date,
	"appraisal_ordered_at" date,
	"appraisal_due_date" date,
	"appraisal_received_at" date,
	"closing_date" date,
	"funded_at" date,
	"preapproval_amount" numeric(12, 2),
	"preapproval_issued_at" date,
	"preapproval_expires_at" date,
	"six_elements_at" timestamp with time zone,
	"le_due_at" timestamp with time zone,
	"intent_to_proceed_at" timestamp with time zone,
	"disclosures_sent_at" timestamp with time zone,
	"disclosures_signed_at" timestamp with time zone,
	"cd_sent_at" timestamp with time zone,
	"cd_acknowledged_at" timestamp with time zone,
	"ctc_issued_at" timestamp with time zone,
	"docs_needed" boolean DEFAULT false NOT NULL,
	"docs_needed_summary" text,
	"docs_needed_since" timestamp with time zone,
	"stalled_since" timestamp with time zone,
	"lost_reason" text,
	"application_link" text,
	"external_refs" jsonb,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loan_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"loan_id" uuid NOT NULL,
	"from_stage" "loan_stage",
	"to_stage" "loan_stage" NOT NULL,
	"changed_by_user_id" uuid,
	"note" text,
	"days_in_previous_stage" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_user_id" uuid NOT NULL,
	"person_id" uuid,
	"loan_id" uuid,
	"prepared_by_ally" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"emails" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"phones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mailing_address" jsonb,
	"date_of_birth" date,
	"preferred_language" "language" DEFAULT 'en' NOT NULL,
	"type" "person_type" DEFAULT 'lead' NOT NULL,
	"owner_user_id" uuid,
	"source" jsonb,
	"tags" text[],
	"do_not_contact" boolean DEFAULT false NOT NULL,
	"complaint_flag" boolean DEFAULT false NOT NULL,
	"complaint_opened_at" timestamp with time zone,
	"merged_into_person_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"owner_user_id" uuid NOT NULL,
	"due_at" timestamp with time zone,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"person_id" uuid,
	"loan_id" uuid,
	"completed_at" timestamp with time zone,
	"completed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"leader_user_id" uuid,
	"branch" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"company_nmls" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"plan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"auth_user_id" uuid,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"nmls_id" text,
	"role" "user_role" NOT NULL,
	"team_id" uuid,
	"language" "language" DEFAULT 'en' NOT NULL,
	"website_url" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ai_action_log" ADD CONSTRAINT "ai_action_log_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_log" ADD CONSTRAINT "ai_action_log_insight_id_ai_insight_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."ai_insight"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_action_log" ADD CONSTRAINT "ai_action_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_for_user_id_user_id_fk" FOREIGN KEY ("for_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insight" ADD CONSTRAINT "ai_insight_decided_by_user_id_user_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan" ADD CONSTRAINT "loan_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan" ADD CONSTRAINT "loan_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan" ADD CONSTRAINT "loan_lo_user_id_user_id_fk" FOREIGN KEY ("lo_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan" ADD CONSTRAINT "loan_processor_user_id_user_id_fk" FOREIGN KEY ("processor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan" ADD CONSTRAINT "loan_coordinator_user_id_user_id_fk" FOREIGN KEY ("coordinator_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_stage_history" ADD CONSTRAINT "loan_stage_history_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_stage_history" ADD CONSTRAINT "loan_stage_history_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_stage_history" ADD CONSTRAINT "loan_stage_history_changed_by_user_id_user_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_loan_id_loan_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_completed_by_user_id_user_id_fk" FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_action_tenant_created_idx" ON "ai_action_log" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "insight_tenant_user_status_idx" ON "ai_insight" USING btree ("tenant_id","for_user_id","status");--> statement-breakpoint
CREATE INDEX "appointment_tenant_owner_start_idx" ON "appointment" USING btree ("tenant_id","owner_user_id","starts_at");--> statement-breakpoint
CREATE INDEX "audit_tenant_created_idx" ON "audit_log" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_tenant_entity_idx" ON "audit_log" USING btree ("tenant_id","entity","entity_id");--> statement-breakpoint
CREATE INDEX "event_tenant_created_idx" ON "event" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "lead_tenant_captured_idx" ON "lead" USING btree ("tenant_id","captured_at");--> statement-breakpoint
CREATE INDEX "loan_tenant_stage_idx" ON "loan" USING btree ("tenant_id","stage");--> statement-breakpoint
CREATE INDEX "loan_tenant_lo_idx" ON "loan" USING btree ("tenant_id","lo_user_id");--> statement-breakpoint
CREATE INDEX "loan_tenant_lock_idx" ON "loan" USING btree ("tenant_id","rate_lock_expires_at");--> statement-breakpoint
CREATE INDEX "stage_history_loan_idx" ON "loan_stage_history" USING btree ("tenant_id","loan_id");--> statement-breakpoint
CREATE INDEX "note_tenant_person_idx" ON "note" USING btree ("tenant_id","person_id");--> statement-breakpoint
CREATE INDEX "person_tenant_owner_idx" ON "person" USING btree ("tenant_id","owner_user_id");--> statement-breakpoint
CREATE INDEX "person_tenant_name_idx" ON "person" USING btree ("tenant_id","last_name","first_name");--> statement-breakpoint
CREATE INDEX "task_tenant_owner_due_idx" ON "task" USING btree ("tenant_id","owner_user_id","due_at");--> statement-breakpoint
CREATE INDEX "user_tenant_email_idx" ON "user" USING btree ("tenant_id","email");