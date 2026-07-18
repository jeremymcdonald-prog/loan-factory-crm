-- Video email and in-app messages join the unified conversation timeline.
ALTER TYPE "public"."channel" ADD VALUE IF NOT EXISTS 'video' BEFORE 'call';--> statement-breakpoint
ALTER TYPE "public"."channel" ADD VALUE IF NOT EXISTS 'app' BEFORE 'call';
