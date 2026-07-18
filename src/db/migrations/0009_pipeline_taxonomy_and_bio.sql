-- Correct pipeline taxonomy (Leads / Applications / Loans / Past clients) and
-- add the online-presence (bio + social) fields to people and partners.
--
-- The loan_stage enum is replaced rather than patched: several old values
-- collapse into one new value (closing_scheduled → clear_to_close; application
-- / disclosures / processing → submitted_to_processing), which a rename cannot
-- express. History is preserved: every existing loan.stage and every
-- loan_stage_history row is remapped in place, no rows dropped.

CREATE TYPE "public"."loan_stage_new" AS ENUM (
  'new_lead',
  'contact_attempt',
  'consultation_scheduled',
  'consultation_completed',
  'working_on_credit',
  'thirty_to_ninety_out',
  'ninety_plus_out',
  'prequalification',
  'preapproval',
  'contract_received',
  'ready_to_refinance',
  'submitted_to_processing',
  'submitted_to_underwriting',
  'conditional_approval',
  'appraisal_ordered',
  'appraisal_received',
  'submitted_for_clear_to_close',
  'clear_to_close',
  'funded',
  'first_year_followup',
  'annual_review',
  'refinance_opportunity',
  'referral_and_retention'
);--> statement-breakpoint

-- Old → new mapping, applied to loan.stage and both history stage columns.
-- Survivors keep their spelling; the rest fold into the closest new stage.
ALTER TABLE "loan" ALTER COLUMN "stage" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "loan" ALTER COLUMN "stage" TYPE "public"."loan_stage_new" USING (
  CASE "stage"::text
    WHEN 'searching_for_home' THEN 'preapproval'
    WHEN 'under_contract' THEN 'contract_received'
    WHEN 'application' THEN 'submitted_to_processing'
    WHEN 'disclosures' THEN 'submitted_to_processing'
    WHEN 'processing' THEN 'submitted_to_processing'
    WHEN 'closing_scheduled' THEN 'clear_to_close'
    WHEN 'post_close' THEN 'first_year_followup'
    WHEN 'referral_retention' THEN 'referral_and_retention'
    ELSE "stage"::text
  END::"public"."loan_stage_new"
);--> statement-breakpoint

ALTER TABLE "loan_stage_history" ALTER COLUMN "from_stage" TYPE "public"."loan_stage_new" USING (
  CASE "from_stage"::text
    WHEN 'searching_for_home' THEN 'preapproval'
    WHEN 'under_contract' THEN 'contract_received'
    WHEN 'application' THEN 'submitted_to_processing'
    WHEN 'disclosures' THEN 'submitted_to_processing'
    WHEN 'processing' THEN 'submitted_to_processing'
    WHEN 'closing_scheduled' THEN 'clear_to_close'
    WHEN 'post_close' THEN 'first_year_followup'
    WHEN 'referral_retention' THEN 'referral_and_retention'
    ELSE "from_stage"::text
  END::"public"."loan_stage_new"
);--> statement-breakpoint

ALTER TABLE "loan_stage_history" ALTER COLUMN "to_stage" TYPE "public"."loan_stage_new" USING (
  CASE "to_stage"::text
    WHEN 'searching_for_home' THEN 'preapproval'
    WHEN 'under_contract' THEN 'contract_received'
    WHEN 'application' THEN 'submitted_to_processing'
    WHEN 'disclosures' THEN 'submitted_to_processing'
    WHEN 'processing' THEN 'submitted_to_processing'
    WHEN 'closing_scheduled' THEN 'clear_to_close'
    WHEN 'post_close' THEN 'first_year_followup'
    WHEN 'referral_retention' THEN 'referral_and_retention'
    ELSE "to_stage"::text
  END::"public"."loan_stage_new"
);--> statement-breakpoint

-- Templates can be pinned to a stage ("send at preapproval") — remap too.
ALTER TABLE "template" ALTER COLUMN "stage" TYPE "public"."loan_stage_new" USING (
  CASE "stage"::text
    WHEN 'searching_for_home' THEN 'preapproval'
    WHEN 'under_contract' THEN 'contract_received'
    WHEN 'application' THEN 'submitted_to_processing'
    WHEN 'disclosures' THEN 'submitted_to_processing'
    WHEN 'processing' THEN 'submitted_to_processing'
    WHEN 'closing_scheduled' THEN 'clear_to_close'
    WHEN 'post_close' THEN 'first_year_followup'
    WHEN 'referral_retention' THEN 'referral_and_retention'
    ELSE "stage"::text
  END::"public"."loan_stage_new"
);--> statement-breakpoint

ALTER TABLE "loan" ALTER COLUMN "stage" SET DEFAULT 'new_lead';--> statement-breakpoint
DROP TYPE "public"."loan_stage";--> statement-breakpoint
ALTER TYPE "public"."loan_stage_new" RENAME TO "loan_stage";--> statement-breakpoint

-- Online presence: bio, approved public links, and last-researched provenance.
ALTER TABLE "person" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "social_links" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "bio_researched_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "bio_sources" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "social_links" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "bio_researched_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "bio_sources" jsonb DEFAULT '[]'::jsonb NOT NULL;
