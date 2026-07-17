-- The product's AI layer is unbranded (Jeremy's 2026-07-17 directive: Ally is
-- a separate platform). Rename the columns that carried the old name.
ALTER TABLE "note" RENAME COLUMN "prepared_by_ally" TO "prepared_by_ai";
--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "prepared_by_ally" TO "prepared_by_ai";
