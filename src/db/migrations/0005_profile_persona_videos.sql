CREATE TYPE "public"."persona_status" AS ENUM('ready', 'failed');--> statement-breakpoint
CREATE TABLE "ai_persona" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" "persona_status" DEFAULT 'ready' NOT NULL,
	"extracted_text" text,
	"error" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_persona_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"duration_seconds" integer,
	"url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "video_watch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"watched_at" timestamp with time zone,
	"progress_pct" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "photo_data" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "signature" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "default_sender_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "reply_to_email" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "links" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notification_prefs" jsonb;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD CONSTRAINT "ai_persona_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_persona" ADD CONSTRAINT "ai_persona_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_watch" ADD CONSTRAINT "video_watch_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_watch" ADD CONSTRAINT "video_watch_video_id_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_watch" ADD CONSTRAINT "video_watch_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_persona_tenant_user_idx" ON "ai_persona" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "video_tenant_category_idx" ON "video" USING btree ("tenant_id","category");--> statement-breakpoint
CREATE INDEX "video_watch_tenant_user_idx" ON "video_watch" USING btree ("tenant_id","user_id","video_id");