-- Workflow refinement: partner target tier, campaign content/language/drip,
-- automation source → campaign wiring.
ALTER TYPE "public"."partner_tier" ADD VALUE IF NOT EXISTS 'target' BEFORE 'new';--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "language" "language" DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "email_body" text;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "sms_body" text;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "video_meta" jsonb;--> statement-breakpoint
ALTER TABLE "campaign" ADD COLUMN "drip" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "automation" ADD COLUMN "timing_text" text;--> statement-breakpoint
ALTER TABLE "automation" ADD CONSTRAINT "automation_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE no action ON UPDATE no action;
